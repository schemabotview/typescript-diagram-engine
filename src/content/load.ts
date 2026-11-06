import type { Course } from '@graphlearning/shell'

// Course 7 · load · Read scene files.
export const load: Course = {
  id: 'load',
  title: 'Read scene files',
  sections: [
    {
      id: 'async',
      title: 'async / await and Promise<T>',
      scene: 'load-async',
      narration: `So far every scene has been TypeScript code. Real users of a diagram engine write data files instead, and reading a file means waiting for the disk. In JavaScript, waiting is done with promises.

The main file writes both scenes out as JSON, the checkout and a new one called self, miniflow's picture of its own pipeline. The highlighted function save is marked async, and its return type is a Promise of a number. A promise is a value that stands for a result that is not there yet. Inside, await writeFile pauses the function until the file is written, then carries on. Await only works inside an async function, or at the top level of a module like this one.

The side pane follows one read, step by step. Calling readFile returns at once, without the file: it hands back a Promise of a string. The terminal shows what that promise looks like when printed straight away: a Promise, pending. The file is not here yet. Then await pending pauses here, and while it waits, the rest of the program is free to run. When the disk answers, the function resumes with the value itself, a string, and the run reports reading back fifty-six lines.

The types follow the values exactly. Read file returns a Promise of string, and await turns that into a string. Forgetting the await leaves you holding the promise, a different type, and the checker will notice the first time you treat it as text.

The run also reports both files written: the checkout at two thousand three hundred and forty-one characters. Next, a detour: what is everything else doing while we wait?`,
    },
    {
      id: 'loop',
      title: 'The event loop',
      scene: 'load-loop',
      narration: `This is a detour, to answer a question the last section raised. If await pauses a function, who runs in the meantime, and in what order? JavaScript has one thread, and a loop that decides what it does next. The lab makes that order visible.

The lab's script schedules four things, in this order: a timer for zero milliseconds, a file read, a promise that is already resolved, and a queue microtask call. It prints a line when it starts and another when it ends. Each scheduled thing prints a line when it finally runs.

The terminal shows the real order, and it is not the order of the code. Both sync lines come first, start and end, even though everything else was scheduled in between. That is the first rule, on the left: the call stack runs the script to its end, without a break. Nothing else can run until it finishes.

Next come the two microtasks: the resolved promise, then queue microtask. Promise callbacks run as soon as the stack is empty, before anything else gets a turn. Then the timer fires, even though zero milliseconds had long passed, because timers wait for the next turn of the loop. And last of all, the file arrives, when the disk answered, which is later still.

That is why await does not block. Pausing one function just returns control to the loop, and the loop goes on with the others. Every promise we await is a turn of this loop.

Back to the engine, and to the files we just wrote.`,
    },
    {
      id: 'parse',
      title: 'JSON.parse, and a trailing comma',
      scene: 'load-parse',
      narration: `The scenes live in JSON files now, and the TypeScript scene files are gone. The new load file has one function: read the file as text, and hand it to JSON dot parse. The main file loads both scenes and draws each one.

People will edit those files by hand, and the editor shows the first thing people do. After the last edge, there is a comma, highlighted, with nothing after it. In TypeScript, that is perfectly fine. A trailing comma is allowed everywhere, and we have been writing them all film. But JSON is a stricter language than JavaScript, and it does not allow one.

The side pane draws what parsing is: text in, and either a value out, or a throw. The terminal shows both outcomes. Self is parsed and drawn first. Then the checkout fails, and JSON dot parse throws a SyntaxError. It shows line one hundred and twenty-eight of the text it was given, points at the closing bracket, and says the token is unexpected, quoting the end of the text, which is not valid JSON.

Notice what the checker had to say about this: nothing. A file's contents are only known at run time, so no compiler can check them. Every value that enters the program from outside, from a file, a network or a user, arrives unchecked. TypeScript's guarantees stop at that boundary unless we extend them ourselves.

The comma goes. But a file that parses is not yet a file that is right. Next, what parse actually returns.`,
    },
    {
      id: 'any',
      title: 'any lets "title": 42 through',
      scene: 'load-any',
      narration: `The trailing comma is fixed. The next mistake is quieter: in the highlighted line, someone has set the API's title to forty-two, a number, without quotes.

JSON dot parse is happy with that. It is valid JSON. And the checker is happy too: the terminal's first line is silent. To see why, look at what JSON dot parse returns. Its return type is any. Any is TypeScript's escape hatch: a value of type any may be used as anything at all, and nothing about it is checked. Load scene returns whatever parse returns, so it returns any too, and the main file passes that any straight into the layout and the renderer.

The side pane follows the number on its way. From the file, through parse, through load scene, through the layout and the renderer, and not one check on the way. It finally meets code that relies on its type. Escape XML calls replace all on the title, and numbers have no replace all method. The terminal shows the crash: text dot replace all is not a function, inside escape XML.

That is the real cost of any. Not just that the bug got through, but where it surfaced. The error points at a function that did nothing wrong, three files away from the mistake, and says nothing about a title or about forty-two. On a big scene, finding the cause would take a while.

Any spreads silently through every value it touches. The fix is to never let it in. Next, the type that means the opposite.`,
    },
    {
      id: 'unknown',
      title: 'unknown and type guards',
      scene: 'load-unknown',
      narration: `The opposite of any is unknown. Both mean the value could be anything. But where any lets you do anything with it, unknown lets you do nothing, until you have checked.

The highlighted return type of load scene is now a Promise of unknown. The parsed value is the same at run time, but the checker will not let the main file pass it into the layout, or read a single field of it. So the load file gains type guards. A type guard is a function whose return type is a type predicate, such as x is Scene. The highlighted guard checks that x is an object with a string title, an array of edges, and an array of nodes in which every node passes a guard of its own. If it returns true, the checker treats x as a Scene from then on. Above it, the node guard recurses into a group's children, and the item guard checks an item's id and title.

The side pane follows one value through. It starts as unknown, and nothing may be read from it. The guard is the evidence. When is scene returns true, the main file's if narrows it to a Scene, and it may be drawn. When it returns false, the file is skipped.

The terminal shows both. Self is drawn. The checkout, with its title of forty-two, is reported as not a scene, and skipped. Nothing crashes, and nothing three files away is blamed.

There is a weakness, though. Not a scene does not say why. On a file with a hundred nodes, that is little help. Before fixing that, one more way people get around unknown.`,
    },
    {
      id: 'assert',
      title: 'as vs assertion functions',
      scene: 'load-assert',
      narration: `Checking every value with an if gets tedious, and people reach for a shortcut: as. The scratch file shows it. It loads the checkout and writes as Scene after the call. As is a type assertion. It tells the checker: this value is a Scene, take my word for it.

The checker does take its word. The terminal's first line is silent, and the scratch file runs: it reports the scene's five top-level nodes, and lays them out into twelve rects, title of forty-two and all. Nothing was checked. As is a claim, and here the claim was false, so the bad file walked straight through.

The editor shows the honest version of the same convenience: an assertion function. Its return type says asserts x is Scene. It runs the real guard, and if the value is not a scene, it throws. If it returns at all, the value is a Scene, and the checker knows it on every line below the call. The main file calls it once per file, with no if around it.

The side pane puts the two side by side. As Scene is a claim, checked by nobody. Asserts x is Scene is a proof, checked at run time, every time. The terminal shows the proof at work: self is drawn, and then the checkout throws a type error saying it is not a scene, and the program stops at the line that loaded it.

Use as only when you know more than the checker does, and can say why. For data from outside, use a guard or an assertion. Next, making the error say what is actually wrong.`,
    },
    {
      id: 'validate',
      title: 'A validator with paths',
      scene: 'load-validate',
      narration: `A guard answers yes or no. A person fixing a file needs to know where it is wrong, and what was expected. That is a validator, and the key to a good one is a path.

The title of forty-two is fixed, but the checkout has three new faults, the kind real files collect. The editor shows the heart of the validator, highlighted. Check node takes a value, the path that leads to it, a list to collect errors in, and the set of ids seen so far. Every check that fails pushes a message that starts with the path. And for a group, it calls itself on each child, with the path extended by children and the child's index.

The side pane follows the walk into this file. The path starts at nodes. At nodes one, the client group, the direction is wrong: expected row or column, got rows. Inside the data group, nodes four, children one, the id is api, which the API itself already used, so it is reported as a duplicate. And because that box is no longer called email, the last edge, edges eight, points to no node called email.

The terminal shows the report, exactly as a person would want it. The file name, three problems, and each one with the path to the bad field. The validator does not stop at the first error. It collects them all, so a person can fix the file in one go instead of three runs.

Notice the validator is still plain TypeScript, built from the narrowing we already know. Every field starts as unknown and is checked before use.

One last step. Next, returning errors instead of throwing them.`,
    },
    {
      id: 'result',
      title: 'Result<T, E>, and catch (e: unknown)',
      scene: 'load-result',
      narration: `Loading a scene can fail in three different ways: the file may be missing, it may not parse, or it may not validate. Throwing for all three forces every caller to remember a try. A Result makes failure part of the return type instead.

The errors file defines it, highlighted. A Result is a union of two shapes: ok true with a value, or ok false with errors. It is a discriminated union, the same idea as the scene nodes in Course 3, with ok as the tag. Two tiny helpers, ok and fail, build each side.

Load scene now returns a Promise of a Result of Scene or a list of strings. Inside, the read and the parse sit in a try. The catch clause declares its error as unknown, because in JavaScript anything at all can be thrown, not only Errors. So the code checks with instanceof before reading the message. Then the validator runs, and its errors become a fail.

The side pane shows what the caller gets. It must look at ok before it can touch the value, because the checker will not let it read value on the failing side. Forgetting to handle failure is no longer possible.

The main file loads three files this time, and the side pane's table lists what happened. The checkout is fixed now, so self and the checkout are both drawn. The third, shop dot json, does not exist, and instead of a crash, the terminal shows its error as a line of output: ENOENT, no such file or directory.

miniflow now reads scene files and refuses bad ones politely. Next course, it becomes a command.`,
    },
  ],
}
