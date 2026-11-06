import type { Course } from '@graphlearning/shell'

// Course 8 · command · Make it a command.
export const command: Course = {
  id: 'command',
  title: 'Make it a command',
  sections: [
    {
      id: 'modules',
      title: 'Modules: import, export, import type',
      scene: 'command-modules',
      narration: `miniflow has grown to a dozen files, and they have been importing each other since the model course. Before it becomes a command, it is worth looking properly at how those files connect.

Every file here is a module. Whatever a module exports, another may import, and nothing else is visible outside it. The old main file is gone. Its job moves into src slash cli dot ts, the entry point, and the highlighted lines are its imports: layout from the layout module, load scene from the loader, and the SVG renderer. The side pane draws that as the module graph: the entry point at the top, with an arrow to each module it depends on, and each of those has arrows of its own.

Two details are particular to running TypeScript directly in Node. The import paths end in dot ts, the real file names, because Node resolves exactly the path it is given. And imports of types must say so. The tsconfig gains verbatim module syntax, which makes that a rule. The scratch file imports the Scene type with a plain import, and the terminal shows the result: error TS1484. Scene is a type, and must be imported using a type-only import.

The rule exists because of erasure. An import type disappears entirely when types are stripped. A plain import stays in the JavaScript, and at run time there is no Scene to import. With the rule on, every import says honestly whether it will exist when the program runs.

The entry point runs, and writes both pictures. Next, it starts taking orders from the command line.`,
    },
    {
      id: 'args',
      title: 'Arguments with parseArgs',
      scene: 'command-args',
      narration: `A command takes its instructions from the words typed after it. Node hands those over as a plain array of strings, process dot argv. Turning that into options by hand is fiddly, so Node's standard library has a parser for it, in the util module: parse args.

The highlighted call describes what the command accepts. Positional words are allowed: the subcommand and the scene's path. And there are two options. Svg is a string, the output file. Theme is a string too, with a default of dark.

What comes back is the interesting part, and the side pane's table lists what the checker knows about it. The positionals are an array of strings. Values dot svg is a string or undefined, because nobody has to pass it. Values dot theme is just a string, because it has a default, so it can never be missing. The types are worked out from the options object itself. Change an option's type, or remove its default, and every use of it is checked again.

The terminal runs the command with a subcommand, a path and an svg option, the way a user will type it. The command prints what it parsed: command render, the checkout's path, the output path, and theme dark, which nobody typed. Then it renders the scene to the file it was given.

There is a gap here, though. The command is just a string, so the code compares it with the word render and does nothing at all for anything else. Next, the command becomes a type.`,
    },
    {
      id: 'subcommands',
      title: 'Subcommands as a union',
      scene: 'command-subcommands',
      narration: `miniflow will have three subcommands: render, check and watch. That is a fixed set of words, which by now we know how to type.

The highlighted line says it: Command is a union of three string literals. Below it, is command is a type guard. It takes the first positional word, which is just a string, and returns whether it is one of the three. Then the main code uses it: if the word is not a command, or there is no path, it prints the usage line to standard error and exits with a code of two, the usual code for being called wrongly.

After that guard, the checker knows the command is a Command, and the switch at the bottom routes it, as the side pane draws. Render calls the render function. Check and watch print not yet, for now. And the default branch assigns the command to never, the exhaustiveness check from the model course. If a fourth subcommand is added to the union and forgotten here, this switch stops compiling.

The terminal tries all the paths. Render on the self scene writes its picture. Check prints not yet. And a typo, draw instead of render, does not quietly do nothing. It is caught by the guard, and the usage line comes back, naming all three choices.

The same pattern works for any command-line tool: a union for the words, one guard where the text comes in, and an exhaustive switch. From the guard on, a misspelled subcommand cannot exist. Next, the check subcommand, and how a command reports failure.`,
    },
    {
      id: 'exit',
      title: 'Exit codes and stderr',
      scene: 'command-exit',
      narration: `Check is the subcommand a build or a CI job will run, to make sure every scene file is valid before anything is drawn. For that, it has to fail in a way a machine can see.

The highlighted function runs the loader and its validator. If the scene is fine, it prints ok, and returns zero. If not, it prints each problem with console dot error, and returns one. The switch sets the process's exit code from that number.

The side pane shows the three channels a process answers on. Standard output carries results. Standard error carries problems. And the exit code, a number the process leaves behind when it ends, says whether it succeeded: zero means yes, anything else means no.

The terminal checks two files and prints each exit code after it. The self scene prints ok, and exit zero. A deliberately broken copy, called broken dot json, prints the validator's message with its path, nodes one dot dir, expected row or column, got rows, and exit one. The third run sends standard error to dev null, which throws it away. The message disappears, but the exit code is still one. That is the point of keeping the channels apart. A script that only cares whether the scenes are valid can ignore the text completely and read the number. A person reading the terminal sees the reasons.

A command that prints an error and still exits zero is a common bug, and a nasty one: every CI job that runs it will pass. Returning the code from each handler makes the success path and the failure path equally explicit.

Next, making miniflow installable as a real command.`,
    },
    {
      id: 'bin',
      title: 'A bin, and why it must be compiled',
      scene: 'command-bin',
      narration: `To be a command someone can install, a package names an executable in its package dot json: the bin field. The first attempt simply pointed the bin at src slash cli dot ts, packed the project with npm pack, and installed the tarball into a separate project called shop.

It failed, and the side pane quotes why. Node refused with ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING. Node strips types from your own files, but never from files under node modules. Installed packages are expected to ship JavaScript. So for the first time in this film, tsc has to write output.

The editor shows the tsconfig that does it. No emit is gone. Root dir and out dir say where the source is and where the JavaScript goes: src in, dist out. The highlighted option, rewrite relative import extensions, solves a detail that would break everything: our imports end in dot ts, and the emitted files must import dot js. This option rewrites those paths as it emits. The allow importing TypeScript extensions option is gone, because emitting files is exactly what it forbids.

The package dot json points the bin at dist slash cli dot js, ships only the dist folder, and gains a build script that runs tsc. The terminal runs it: the build is silent, and dist holds a JavaScript file for every source file. Then the same pack and install as before. And this time npx miniflow check runs inside the shop project, and reports the self scene ok.

During development we still run the dot ts files directly. The compile step exists only for what we ship. Next, a subcommand that never finishes: watch.`,
    },
    {
      id: 'watch',
      title: 'Watch mode: an async iterator',
      scene: 'command-watch',
      narration: `Editing a scene file and running render after every change gets old quickly. Watch mode redraws a scene whenever its file is saved.

Node's file system module can watch a folder, and the promises version gives us the events in the most convenient form there is: an async iterable. The highlighted line loops over it with for await. A normal for of loop asks for the next value and gets it at once. For await asks for the next value and waits until it exists. Here, the next value is the next change to a file in the folder, so the loop body runs once per event, whenever that happens, and the loop never ends by itself.

The side pane draws the flow. Watch yields events. The loop waits for each one, prints its type and the file's name, and if the file is a JSON scene, awaits the render function from the last section, passed in as a callback.

The types flow through. Each event's file name is typed as a string or null, because some platforms do not report it, so the code checks it with optional chaining before calling ends with. And the callback's type says it takes a path and returns a promise, so watch can await it.

To record this honestly, the terminal runs watch for three seconds under the timeout command, while a script saves the self scene once in the background, exactly as an editor would. The run shows watching scenes, one change event for self dot json, and the redraw: wrote out slash self dot svg.

One save, one render. But editors do not always save that neatly. Next, many events from a few saves.`,
    },
    {
      id: 'debounce',
      title: 'Debounce: closures and timer types',
      scene: 'command-debounce',
      narration: `This time the background script saves the file three times in quick succession, the way a format-on-save editor or a quick double save can. The terminal shows what the watcher sees: not three events, but four, because one save can be reported more than once. Rendering on each would draw the same scene four times in a fraction of a second.

The fix is a classic: debounce. Wait until the events stop for a moment, then act once.

The highlighted function builds a debounced version of any function. It keeps one variable, timer, and returns a new function. Every call clears the pending timer and starts a new one. Only when two hundred milliseconds pass with no further call does the timer finally fire. The returned function closes over timer: it keeps that variable alive between calls, even though debounce itself has long since returned. That is a closure, and the side pane draws it as the box holding the pending timer.

The timer's type is worth a look. What setTimeout returns differs: in Node it is a Timeout object, and in a browser it is a number. Rather than pick one, the code says return type of typeof setTimeout: whatever this platform's setTimeout returns. Course 10 explains exactly how that type is computed. Here it simply keeps the code honest on both platforms.

Debounce is generic too, over its argument list, so the debounced function takes exactly the arguments the original did, a path here.

The run shows four change events, then one render. Next, stopping the watcher cleanly.`,
    },
    {
      id: 'abort',
      title: 'Ctrl-C: AbortController and using',
      scene: 'command-abort',
      narration: `A watcher runs until someone presses Ctrl-C. By default, that kills the process wherever it happens to be. A well-behaved command stops on purpose, and cleans up on the way out.

The CLI creates an AbortController, the standard way to cancel work in JavaScript. When the process receives SIGINT, the signal Ctrl-C sends, the handler prints a line and calls abort. The controller's signal is passed into watch scenes, and from there into watch itself, highlighted. When the signal aborts, the async iterator ends by throwing an AbortError. The catch recognises that error by its name and simply returns. Anything else is still thrown.

The other highlighted line is newer JavaScript. Using declares a resource, here a small object from the announce function. It printed watching when it was created. Its dispose method, named by Symbol dot dispose, prints stopped watching. Using guarantees that dispose runs when the scope ends, however it ends: a normal return, an early return from the catch, or an exception. It is like a finally block that the resource carries with it.

The side pane follows Ctrl-C through. SIGINT arrives, abort is called, watch ends with an AbortError, the function returns, and using disposes the resource.

The terminal shows it. The watcher starts, redraws once for the background saves, and then timeout sends SIGINT after three seconds, just as Ctrl-C would. The handler prints SIGINT, stopping. And the last line is the dispose: stopped watching scenes.

miniflow is now a real command, with render, check and watch. Next course: making sure it keeps working.`,
    },
  ],
}
