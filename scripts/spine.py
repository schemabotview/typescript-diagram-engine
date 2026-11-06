#!/usr/bin/env python3
"""The spine: miniflow as real files at every step, and the real transcript that produced them.

    spine/<course>/<NN-step>/
      step.json     what the step is: `from`, `commands`, `changes`, `panel`, `capture`, `volatile`
      edits/        the files the author changes BEFORE the commands run (exactly `changes`)
      project/      the project AFTER the step: written by `record`, never by hand
      session.txt   the transcript, row for row as a 72-column terminal drew it
      shots/        each captured picture, screenshotted in both themes for the output panel

A step starts from its `from` step's project/ (none: an empty folder), applies edits/, then runs each
command in bash, in a real ~/miniflow, with the pinned Node first on PATH. A failure branch is two
steps with the same `from`.

    python3 scripts/spine.py record [<course>[/<step>]]   run the steps, write project/ + session.txt + shots/
    python3 scripts/spine.py check                        recorded, current, untouched (no run, no network)
    python3 scripts/spine.py replay [<course>[/<step>]]   run again and compare (volatile spans masked)

`check` is what `npm run check:spine` runs. Each step stores a fingerprint of its inputs (the `from`
step's fingerprint, step.json, edits/) and of its outputs (project/, session.txt); check recomputes
both, so an edit nobody re-recorded and an output edited by hand both fail.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SPINE = REPO / 'spine'
NODE_VERSION = '26.13.0'
NODE_BIN = REPO / '.toolchain' / f'node-v{NODE_VERSION}' / 'bin'
FACTS = json.loads((REPO / 'scripts' / 'frame.json').read_text())
HOME = Path(os.environ.get('SPINE_HOME', '/home/ana'))
WORK = HOME / 'miniflow'
PROMPT = 'ana@laptop:~/miniflow$ '
COLS = 72
# Never compared, never snapshotted: dependencies are restored from the lockfile, builds are rebuilt,
# and a packed tarball (.tgz) is an output of `npm pack`, re-made by the step that needs it.
SKIP = {'node_modules', 'dist'}
FINGERPRINT_KEYS = ('inputs', 'outputs')


def die(msg: str) -> None:
    print(f'spine: {msg}', file=sys.stderr)
    sys.exit(1)


def steps() -> list[Path]:
    return sorted(p.parent for p in SPINE.glob('*/*/step.json'))


def step_id(d: Path) -> str:
    return f'{d.parent.name}/{d.name}'


def load(d: Path) -> dict:
    return json.loads((d / 'step.json').read_text())


def by_id(sid: str) -> Path:
    d = SPINE / sid
    if not (d / 'step.json').exists():
        die(f'no step {sid}')
    return d


def files(root: Path) -> dict[str, bytes]:
    out: dict[str, bytes] = {}
    if not root.exists():
        return out
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if SKIP & set(rel.parts) or rel.suffix == '.tgz' or not p.is_file():
            continue
        out[rel.as_posix()] = p.read_bytes()
    return out


def digest(*parts: object) -> str:
    h = hashlib.sha256()
    for part in parts:
        if isinstance(part, dict):
            for k in sorted(part):
                h.update(k.encode() + b'\0')
                v = part[k]
                h.update(v if isinstance(v, bytes) else json.dumps(v, sort_keys=True).encode())
                h.update(b'\0')
        elif isinstance(part, bytes):
            h.update(part)
        else:
            h.update(json.dumps(part, sort_keys=True).encode())
        h.update(b'\1')
    return h.hexdigest()[:16]


def definition(meta: dict) -> dict:
    return {k: v for k, v in meta.items() if k not in ('recorded',)}


def inputs_of(d: Path) -> str:
    meta = load(d)
    parent = meta.get('from')
    base = inputs_of(by_id(parent)) if parent else 'empty'
    return digest(base, definition(meta), files(d / 'edits'))


def outputs_of(d: Path) -> str:
    return digest(files(d / 'project'), (d / 'session.txt').read_bytes() if (d / 'session.txt').exists() else b'',
                  files(d / 'shots'))


def env() -> dict[str, str]:
    e = {k: v for k, v in os.environ.items() if not k.startswith('npm_')}
    e.update({
        'PATH': f'{NODE_BIN}:/usr/local/bin:/usr/bin:/bin',
        'HOME': str(HOME), 'USER': 'ana', 'COLUMNS': str(COLS), 'LINES': '40', 'TERM': 'dumb',
        'NO_COLOR': '1', 'FORCE_COLOR': '0', 'npm_config_fund': 'false', 'npm_config_audit': 'false',
        'npm_config_update_notifier': 'false', 'npm_config_cache': str(REPO / '.toolchain' / 'npm-cache'),
    })
    return e


def wrap(line: str) -> list[str]:
    """A terminal row is at most COLS wide: a longer line continues on the next row, unbroken."""
    line = line.expandtabs(8).rstrip()
    if not line:
        return ['']
    return [line[i:i + COLS] for i in range(0, len(line), COLS)]


def reset_work(project: dict[str, bytes]) -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    for p in WORK.iterdir():
        if p.name == 'node_modules':
            continue
        shutil.rmtree(p) if p.is_dir() else p.unlink()
    for rel, data in project.items():
        dest = WORK / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    pkg = project.get('package.json')
    has_deps = pkg and any(k in json.loads(pkg) for k in ('dependencies', 'devDependencies'))
    if not has_deps:
        shutil.rmtree(WORK / 'node_modules', ignore_errors=True)
    elif 'package-lock.json' in project:
        # Hidden setup, never in the transcript: the step starts with its dependencies installed.
        subprocess.run(['npm', 'ci', '--silent'], cwd=WORK, env=env(), check=True)


def run_step(d: Path) -> tuple[str, dict[str, bytes]]:
    meta = load(d)
    parent = meta.get('from')
    project = files(by_id(parent) / 'project') if parent else {}
    if not parent and not meta.get('commands') and not (d / 'edits').exists():
        die(f'{step_id(d)}: nothing to do')
    edits = files(d / 'edits')
    declared = sorted(meta.get('changes', []))
    if sorted(edits) != declared:
        die(f'{step_id(d)}: edits/ holds {sorted(edits)} but changes declares {declared}')
    for rel in meta.get('delete', []):
        project.pop(rel, None)
    project.update(edits)
    reset_work(project)
    for cmd in meta.get('setup', []):
        subprocess.run(['bash', '-c', cmd], cwd=WORK, env=env(), check=True, capture_output=True)
    rows: list[str] = []
    for cmd in meta.get('commands', []):
        rows += wrap(PROMPT + cmd)
        r = subprocess.run(['bash', '-c', cmd], cwd=WORK, env=env(), stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                           stdin=subprocess.DEVNULL, timeout=600)
        out = r.stdout.decode()
        lines = out.split('\n')
        if lines and lines[-1] == '':
            lines.pop()
        # A command's trailing blank rows are the terminal's, not the program's: the next prompt follows.
        while lines and not lines[-1].strip():
            lines.pop()
        for line in lines:
            rows += wrap(line)
        want = meta.get('exit', {}).get(cmd, 0)
        if r.returncode != want:
            print('\n'.join(rows))
            die(f'{step_id(d)}: `{cmd}` exited {r.returncode}, step.json expects {want}')
    return '\n'.join(rows) + '\n', files(WORK)


def mask(text: str, patterns: list[str]) -> str:
    for p in patterns:
        text = re.sub(p, '<volatile>', text)
    return text


def shot_name(rel: str) -> str:
    """A capture's file name in shots/: no '/' and no ':' (a dev server will not serve one)."""
    return rel.replace('/', '-').replace(':', '-')


def shoot(d: Path, meta: dict) -> None:
    shots = d / 'shots'
    shutil.rmtree(shots, ignore_errors=True)
    caps = meta.get('capture', [])
    page = meta.get('page')
    if not caps and not page:
        return
    shots.mkdir()
    w, h = FACTS['figure']['w'], FACTS['figure']['h']
    if page:
        shoot_page(d, page, shots / shot_name(page['name']), w, h)
    for rel in caps:
        src = d / 'project' / rel
        if not src.exists():
            die(f'{step_id(d)}: capture {rel} was not written')
        base = shot_name(rel)
        r = subprocess.run(['node', str(REPO / 'scripts' / 'shoot-svg.cjs'), str(src), str(shots / base), str(w), str(h),
                            str(FACTS['figure']['minTextPx'])], capture_output=True, text=True)
        if r.returncode:
            die(f'{step_id(d)}: shooting {rel} failed\n{r.stdout}{r.stderr}')
        print('   ', r.stdout.strip())


def shoot_page(d: Path, page: dict, base: Path, w: int, h: int) -> None:
    """Start the step's dev server in the work dir (hidden: never in the transcript), shoot its page."""
    server = subprocess.Popen(['bash', '-c', page['serve']], cwd=WORK, env=env(), stdout=subprocess.PIPE,
                              stderr=subprocess.STDOUT, start_new_session=True)
    try:
        import time, urllib.request
        for _ in range(100):
            try:
                urllib.request.urlopen(page['url'], timeout=1)
                break
            except Exception:
                time.sleep(0.2)
        else:
            die(f'{step_id(d)}: {page["url"]} never answered')
        r = subprocess.run(['node', str(REPO / 'scripts' / 'shoot-url.cjs'), page['url'], str(base), str(w), str(h),
                            str(FACTS['figure']['minTextPx'])], capture_output=True, text=True)
        if r.returncode:
            die(f'{step_id(d)}: shooting {page["url"]} failed\n{r.stdout}{r.stderr}')
        print('   ', r.stdout.strip())
    finally:
        os.killpg(server.pid, 15)
        server.wait()


def record(d: Path) -> None:
    meta = load(d)
    print(f'record {step_id(d)}')
    session, project = run_step(d)
    shutil.rmtree(d / 'project', ignore_errors=True)
    for rel, data in project.items():
        dest = d / 'project' / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    (d / 'session.txt').write_text(session)
    shoot(d, meta)
    meta['recorded'] = {'inputs': inputs_of(d), 'outputs': outputs_of(d), 'node': NODE_VERSION}
    (d / 'step.json').write_text(json.dumps(meta, indent=2) + '\n')
    print(textwrap.indent(session.rstrip(), '    | '))


def order(selected: list[Path]) -> list[Path]:
    """Parents first, so a step always starts from a freshly recorded `from`."""
    seen: list[Path] = []

    def visit(d: Path) -> None:
        parent = load(d).get('from')
        if parent:
            visit(by_id(parent))
        if d not in seen:
            seen.append(d)
    for d in selected:
        visit(d)
    return seen


def select(arg: str | None) -> list[Path]:
    if not arg:
        return steps()
    if '/' in arg:
        return [by_id(arg)]
    found = [d for d in steps() if d.parent.name == arg]
    if not found:
        die(f'no course {arg}')
    return found


def check() -> int:
    bad = 0
    for d in steps():
        meta = load(d)
        rec = meta.get('recorded')
        problems = []
        if not rec:
            problems.append('never recorded')
        else:
            if rec.get('node') != NODE_VERSION:
                problems.append(f"recorded with node {rec.get('node')}, the pin is {NODE_VERSION}")
            if rec['inputs'] != inputs_of(d):
                problems.append('stale: step.json, edits/ or a `from` step changed since recording')
            if rec['outputs'] != outputs_of(d):
                problems.append('touched: project/, session.txt or shots/ differ from what was recorded')
        if sorted(files(d / 'edits')) != sorted(meta.get('changes', [])):
            problems.append('edits/ does not match `changes`')
        for rel in meta.get('capture', []) + ([meta['page']['name']] if meta.get('page') else []):
            for theme in ('dark', 'light'):
                if not (d / 'shots' / f"{shot_name(rel)}.{theme}.png").exists():
                    problems.append(f'no {theme} shot of {rel}')
        print('FAIL' if problems else 'ok  ', step_id(d), '; '.join(problems))
        bad += bool(problems)
    print(f'{len(steps()) - bad}/{len(steps())} steps current')
    return 1 if bad else 0


def replay(selected: list[Path]) -> int:
    bad = 0
    for d in order(selected):
        meta = load(d)
        session, project = run_step(d)
        vol = meta.get('volatile', [])
        same = mask(session, vol) == mask((d / 'session.txt').read_text(), vol)
        recorded = files(d / 'project')
        drift = sorted(k for k in set(project) | set(recorded)
                       if k != 'package-lock.json' and mask(project.get(k, b'').decode(errors='replace'), vol)
                       != mask(recorded.get(k, b'').decode(errors='replace'), vol))
        ok = same and not drift
        print('ok  ' if ok else 'FAIL', step_id(d), '' if same else 'session differs', ' '.join(drift))
        bad += not ok
    return 1 if bad else 0


def main() -> None:
    if not (NODE_BIN / 'node').exists():
        die(f'node {NODE_VERSION} is not installed: run scripts/install-node.sh')
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    arg = sys.argv[2] if len(sys.argv) > 2 else None
    if cmd == 'record':
        chosen = select(arg)
        for d in order(chosen):
            rec = load(d).get('recorded')
            current = rec and rec['inputs'] == inputs_of(d) and rec['outputs'] == outputs_of(d)
            if d in chosen or not current:
                record(d)
    elif cmd == 'check':
        sys.exit(check())
    elif cmd == 'replay':
        sys.exit(replay(select(arg)))
    else:
        die(f'unknown command {cmd}')


if __name__ == '__main__':
    main()
