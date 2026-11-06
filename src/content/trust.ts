import type { Course } from '@graphlearning/shell'

// Course 9 · trust · Trust it.
export const trust: Course = {
  id: 'trust',
  title: 'Trust it',
  sections: [
    {
      id: 'strict',
      title: 'Stricter flags: noUncheckedIndexedAccess',
      scene: 'trust-strict',
      narration: `miniflow works. This course is about knowing that it still works tomorrow, after the next change. The first tool is the checker itself, turned up a notch.

Strict mode, which we have used since the first course, still leaves one gap open, and it is a common one. When code reads an array by index, the checker assumes the element is there. But an index can be past the end, and then the value is undefined. The highlighted option closes the gap: no unchecked indexed access. With it on, reading an array by index gives the element type or undefined, and the code has to deal with both.

The side pane's table shows the difference on our own code. Points at i used to be a Pt. Now it is a Pt or undefined. The same goes for the spread of ports in the renderer, and the output slots in the port function.

The terminal shows what the flag found in miniflow: five places, in the route file and the SVG renderer. Two say a value has no property ta or tb, because it might be undefined. Two say a point that might be undefined cannot be destructured. One says an object is possibly undefined.

In each of these, the index happens to be safe today: the loops never step past the end. But nothing enforced that. One careless edit to a loop bound, and the first sign would have been a crash, or worse, a NaN quietly drawn into the picture. The fixes are small: a guard here, a default there.

The checker is one safety net. Next, the other one: tests.`,
    },
    {
      id: 'vitest',
      title: 'Tests with Vitest',
      scene: 'trust-vitest',
      narration: `The checker proves that the types fit together. It cannot prove that the router puts the bend in the right place. For that, we run the code on examples whose answers we know: tests.

We install Vitest, a test runner that understands TypeScript files directly, the same way Node does. The project's tsconfig now checks the test folder too, and a second config, tsconfig build, emits only the source for the bin.

The editor shows one of the route tests, highlighted. Every test has the same three steps, which the side pane names. Arrange: two rects, a hundred by forty, one beside the other with a gap. Act: call route on them. Assert: expect the result to equal exactly four points, out of the right face, to the middle of the gap, down, and into the left face. Two more tests check the faces and the port spread. The fit test checks the four percent margin and the clamp at four.

These tests are easy to write for one reason we planned for in the route course. Route and fit are pure functions. There is no setup to fake, no file to write, no clock to stop: rects in, points out, compare.

The terminal shows the install, a clean check, and then the run. Two test files, five tests, all passed, in a fraction of a second.

A test that only ever passes proves little. What counts is what it says when the code breaks. Next, we break it.`,
    },
    {
      id: 'failing',
      title: 'A failing test',
      scene: 'trust-failing',
      narration: `Here is a bug of the most ordinary kind. In the port function, someone tidies up the formula and drops the plus one from the bottom. Each port is now its position divided by the number of ports, instead of by one more than that. It looks almost the same. The checker has nothing to say: every number is still a number.

The test runner does. The terminal shows the whole report. One test failed: spreads three edges over one face, in order. The assertion error says the received list starts with zero point three three, where the expected one starts with zero point two five.

Then comes the most useful part, the diff, highlighted. Minus lines are what the test expected: a quarter, a half, three quarters. Plus lines are what the code returned: a third, two thirds, and one. The side pane's table lines them up. The last one is the real problem. A port at one is the very end of the face, the corner of the box, where the arrowhead would sit on the border.

Below the diff, the runner points at the line of the test that failed, with the source around it. And the summary at the bottom counts one failed and four passed.

Notice how much the test knew that the checker could not. It knew what the spread is supposed to be, because a person wrote that down when they understood it. A test is a fact about behaviour, recorded while it was right.

The plus one goes back, and the test passes again. Next, a test for the whole picture at once.`,
    },
    {
      id: 'snapshot',
      title: 'Snapshot tests',
      scene: 'trust-snapshot',
      narration: `The renderer's output is several kilobytes of SVG. Writing an expected value for that by hand would be absurd. A snapshot test takes a different approach: record the output once, and from then on, compare every run with the recording.

The new test loads the checkout, draws it, and expects the SVG to match its snapshot. On the first run, there is no snapshot yet, so Vitest writes one: a file in a snapshots folder beside the test, holding the exact SVG. That run passed, and the side pane shows the stored picture on the left.

Then a change. Someone enlarges the arrowheads in the SVG document class, a marker width of eight becomes ten. It is a single attribute in one line. The terminal shows the next test run. Snapshot mismatched, and then the diff, highlighted. The minus line is the stored defs element, with a marker width of eight. The plus line is the new one, with ten. Around them, a few unchanged lines for context: the opening svg tag, the canvas rect, the first box.

A snapshot does not know whether a change is right. It only knows that something changed. So the failure is a question to the person who made it, as the note says. If the change was intended, run the tests with the update flag and the recording is replaced, and the new snapshot goes into the commit for review. If it was not intended, the test just caught a regression that no other test would have.

For a renderer, whose output is long and exact, that is the right trade. Next, testing something that only exists at compile time.`,
    },
    {
      id: 'types',
      title: 'Testing the types',
      scene: 'trust-types',
      narration: `miniflow's types are part of what it offers. If someone loosened the return type of layout to any, every test would still pass, and the users of the library would quietly lose all their checking. So the types deserve tests of their own.

The new file has two kinds, highlighted. Expect type of, from Vitest, states a type. The layout function's return type must equal a Map from string to Rect, exactly. Route must return an array of points. And the literal store must extend Tone.

The other kind is a comment: ts expect error. It tells the checker the next line must fail to compile. The line under it builds an item with the tone stroe, the typo from the model course. As long as the checker refuses it, the comment is satisfied, and nothing is reported. If someone ever widened Tone to plain string, the line would compile, and the comment itself would become the error.

The scratch file shows that case. It puts the same comment over a perfectly valid item, with the tone store. The terminal shows the checker's response: error TS2578, an unused ts expect error directive. The comment promised a failure that never came.

These are tests that run in the compiler. The note says it: a type test that fails is a compile error, not a red line in the test report. The runner reports them as passing, because at run time they do almost nothing. The real verdict was given by tsc, one line earlier.

Next, a class of bug that neither the checker nor the tests saw coming.`,
    },
    {
      id: 'lint',
      title: 'The linter catches a floating promise',
      scene: 'trust-lint',
      narration: `Here is a bug that compiles, runs, and passes every test we have. In the render function, someone drops one word: the await in front of write file. The highlighted line still writes the file. Eventually.

The side pane shows the problem. Write file returns a promise. Without await, the function carries on immediately, and prints wrote, before the file has been written. Worse, if the write fails, because the disk is full or the folder is read-only, the promise rejects, and nobody is listening. The command exits zero and the error is lost. A promise that nobody awaits is called a floating promise.

tsc does not complain. Ignoring a return value is legal. The tests do not see it either, because they never call this function. A linter can, if it knows the types: it has to know that write file returns a promise, and not some other value it is fine to drop.

The usual linter for TypeScript, typescript-eslint, does not support TypeScript 7 yet. So miniflow uses oxlint, whose type-aware mode is built on TypeScript 7's own type checker. The config file turns on one rule: no floating promises, as an error.

The terminal shows the install, a clean tsc, and then the lint. Source file cli dot ts, line twenty-six, column three: promises must be awaited. And it lists the fixes: await it, handle its rejection with catch, or mark it ignored on purpose with void, which is exactly what the debounce in the command course did.

The await goes back. Next, a detour, to watch tsc itself at work.`,
    },
    {
      id: 'how',
      title: 'How tsc checks a program',
      scene: 'trust-how',
      narration: `This is a detour into the checker we have leaned on for the whole film. What does tsc actually do when we type tsc no emit? The lab asks it to report on itself, with the extended diagnostics flag, on miniflow.

The left side names its phases. The scanner reads characters and groups them into tokens: a keyword, a name, a brace. The parser turns each file's tokens into a syntax tree. The binder walks those trees and connects names to symbols: which declaration does this identifier mean, in which scope. The checker then gives every expression a type and compares it with what it must be. Emit, the phase that writes JavaScript, is skipped, because we asked for no emit.

The terminal shows the real numbers, highlighted. Files: two hundred and sixty-four. miniflow itself has about twenty, and the rest are type definitions: the JavaScript standard library, Node's types, and Vitest's. Over a hundred and thirty thousand lines in all, almost all of them declarations we never wrote. Types: about ninety-seven thousand, created on the way.

The times are the striking part. The parse, the bind and the check together took a fraction of a second, and the check is by far the largest share. That speed is what TypeScript 7 is about. The checker was rewritten in Go, compiled to native code, and runs its work in parallel. TypeScript 7 is the same language, with much the same checker, but many times faster.

Back to the project, and one command that runs every check we have.`,
    },
    {
      id: 'check',
      title: 'One check script',
      scene: 'trust-check',
      narration: `We now have three separate tools that each catch different mistakes. Running three commands by hand, in the right order, is exactly the kind of thing people forget. So they become one.

The package dot json gains a script, highlighted: check. It runs tsc with no emit, then oxlint in type-aware mode over the source and the tests, then the test runner. The double ampersands mean each stage runs only if the one before it succeeded. And npm run check exits with the code of the stage that stopped it, so anything that runs it, a person, a git hook, a CI job, gets a single yes or no.

The side pane draws the gate. The first stage checks the types, including the strict flags and the type tests. The second catches floating promises and their kind. The third runs the behaviour: routes, ports, the fit, and the snapshot of the whole picture.

The order is deliberate, cheapest and broadest first. A type error usually means the tests would fail for a boring reason, so there is no point running them.

The terminal shows the whole gate passing. The script's name and command, a silent tsc, a silent lint, and the test run: four files, nine tests, all passed, all in well under a second.

That is what trust means here. Not that miniflow has no bugs, but that the bugs we have already met cannot come back unnoticed. From here on, this command stays green.

Next course, the types themselves become programmable.`,
    },
  ],
}
