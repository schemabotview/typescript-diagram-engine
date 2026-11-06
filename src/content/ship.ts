import type { Course } from '@graphlearning/shell'

// Course 12 · ship · Ship it as a package.
export const ship: Course = {
  id: 'ship',
  title: 'Ship it as a package',
  sections: [
    {
      id: 'surface',
      title: 'The public surface',
      scene: 'ship-surface',
      narration: `miniflow works as a command and as a page. The last course makes it a library other people can install. That starts with a decision: what may they import?

The new index file is the answer, the public surface. It re-exports a chosen few things, and the highlighted lines are the heart of it: layout and the measurer, the SVG renderer, and define scene. Alongside them come the model's types, fit, the validator and SceneError. Everything else stays inside.

The side pane draws the line. Above it, what is exported, and every export is a promise. Once someone builds on layout's signature, changing it breaks their code. Below it, the router, the port spread, the SVG document class, the outline renderer, the command line and the watcher. They are free to change in any release, because nobody outside can reach them.

Notice what is not exported: load scene. It reads files with Node's file system module, and exporting it would make the whole package unusable in a browser. The browser course already showed which parts of miniflow are portable, and the surface keeps only those.

The terminal shows the surface from the outside. tsc is silent. Then Node imports the index file and lists its keys. There are nine, and every one is a value: SceneError, the renderer, the tone info, the validators, define scene, fit, layout and mono. The types are exports too, but none of them appears in that list, because at run time they do not exist. They exist for tsc only, and getting them to a user's tsc is the next section.`,
    },
    {
      id: 'dts',
      title: 'Declaration files',
      scene: 'ship-dts',
      narration: `A user's project will install miniflow's compiled JavaScript, which has no types left in it. For their checker to know miniflow's types, the package ships declaration files: one dot d dot ts beside each dot js, holding only the types.

The build config gains two options, highlighted. Declaration tells tsc to write them. Isolated declarations adds a rule, and the side pane quotes what it found on the first build: error TS9010, in the palette file, a variable must have an explicit type annotation. The palette's type had been inferred through satisfies, and inferring it needs the whole program. Isolated declarations insists that every exported value's type can be read from its own file alone, so that tools faster than tsc can produce declarations file by file. The fix was one annotation: the palette is a record of theme to theme colours.

The terminal shows the build passing, and fifteen declaration files in dist. Then one of them, fit dot d dot ts, printed whole. It is the source with the code removed: the Transform interface exactly as written, and the fit function reduced to its signature, with declare in front. Nothing in it would run. Everything in it is what a user's editor will show when they hover over fit.

The side pane draws who reads which file. Node reads the JavaScript and never looks at the declarations. tsc reads the declarations and never needs the JavaScript.

For libraries written in plain JavaScript, people write declaration files by hand, and TypeScript even lets a project describe an untyped module with declare module. Here, tsc writes them all. Next, telling npm which files to ship.`,
    },
    {
      id: 'pack',
      title: 'package.json exports and files',
      scene: 'ship-pack',
      narration: `The package dot json now describes a library, not just a project. Two fields matter most.

Exports maps import paths to files. A user writes import from miniflow, nothing more, and the side pane follows that path. The dot entry says that for types, tsc should read dist slash index dot d dot ts, and for imports, Node should load dist slash index dot js. Anything not listed in exports cannot be imported at all, which enforces the public surface from the last section at the package level: nobody can reach into dist and import the router directly.

Files lists what goes into the tarball: only dist. Not the source, not the tests, not the scenes or the web page. A prepack script runs the build first, so a packed tarball can never contain stale JavaScript.

The terminal shows npm pack with dry run, which lists what would be packed without writing anything. The tarball contents are every compiled file: a dot js and a dot d dot ts for each source file, highlighted where the index pair appears, and the package dot json. Then the details: the name and version, one point oh point oh, a package size of about ten kilobytes, and thirty-seven files in total.

Reading that list before every release is a good habit. It is the only place that shows exactly what users will receive, and it catches the classics: a forgotten build, a secret file, or a test fixture of several megabytes.

The list looks right. But a list is not proof that it works. Next, installing it somewhere else.`,
    },
    {
      id: 'smoke',
      title: 'Smoke-test the tarball',
      scene: 'ship-smoke',
      narration: `Before publishing a package, install it the way a stranger would. Not from the source folder, where everything happens to be in reach, but from the tarball, into a project that has never seen miniflow.

That project is examples slash shop, a tiny folder with its own package dot json and tsconfig. Its main file, in the editor, is what a user would write. The highlighted line imports the renderer, define scene, layout, and the Item type, all from the bare name miniflow. Below it, one node is written as an Item, and two more inside define scene, with two edges. Then it draws the scene and writes shop dot svg.

The side pane follows the test. The terminal packs the real tarball, then installs it into the shop project, together with TypeScript and Node's types, exactly as a new user would. Then the two checks that matter. tsc, in the shop project, is silent: it found miniflow's declaration files through the exports map, and every import, every type, and the compile-time edge check of define scene all work from the installed package. And node runs main dot ts, and prints shop dot svg drawn with miniflow.

This test catches problems that no test inside the repository can. A file missing from the files list. An exports path with a typo. A declaration that refers to a type that was never emitted. Each of these passes every check in miniflow's own project, because there, the source is right next door.

Our first release is ready. Next, the hardest part of maintaining a library: changing it.`,
    },
    {
      id: 'semver',
      title: 'Semver: a breaking change',
      scene: 'ship-semver',
      narration: `Months pass, and someone decides the field called sub should be called subtitle. It reads better. The highlighted line in the model makes the change, and the rename is carried through the layout, the renderers, the validator, and every scene file.

The terminal's first line shows that, as far as miniflow itself is concerned, everything is fine. The whole check passes: types, lint, and every test, including the snapshot, because the picture did not change. Inside the repository, this is a safe refactor.

But for users, it breaks things. The terminal bumps the version with npm version major, to two point oh point oh, packs it, and installs it into the shop project. Then tsc in the shop project fails, at the line with the Item, with error TS2353: sub does not exist in type Item. A user who upgraded would see exactly this.

That is what the version number is for, and the side pane's table states the promise of semantic versioning. A patch, the last number, is a fix: nothing a user relies on changes. A minor, the middle number, adds something new and breaks nothing. A major, the first number, is allowed to break things, and must be used whenever it does. Renaming a public field is a major, so this is two point oh point oh.

Notice who noticed. Not miniflow's own tests, which all passed. The consumer did. Keeping a small consumer like the shop project, and checking it on every release, is how a library learns that it is about to break someone.

Last section: the shop catches up, and what comes next.`,
    },
    {
      id: 'next',
      title: "What's next: React",
      scene: 'ship-next',
      narration: `The shop project upgrades to version two. The highlighted line is the only change it needs: sub becomes subtitle, as the error said. The terminal shows tsc silent again, and node drawing the scene with miniflow two point oh point oh.

The bottom panel is the picture it drew: a web shop, an API and a Postgres database, with arrows between them. The library we started building from a single box in Course 2 is now installed, typed and drawing in someone else's project.

Look at what that box became. A model of typed data, with unions and narrowing that make a forgotten case a compile error. A layout built from recursion, generics and generators. A renderer behind an interface. A router of pure functions. A loader that trusts nothing it reads. A command, a page, tests and a linter. Types that compute, and catch a typo in an edge before it runs. And a package, with declarations and a version number that means something.

The side pane points to what comes next. miniflow returns a string of SVG, which a web page can show in many ways. The sequel to this film wraps it in a React component, a Scene, that takes a scene as a property and redraws when it changes. graphl-flow, the larger engine that drew every frame of this film, is exactly that kind of component, and the next film builds one.

That is miniflow, built from one box to a shipped package.`,
    },
  ],
}
