import type { Course } from '@graphlearning/shell'

// Course 11 · browser · Run it in a browser.
export const browser: Course = {
  id: 'browser',
  title: 'Run it in a browser',
  sections: [
    {
      id: 'vite',
      title: 'Vite and index.html',
      scene: 'browser-vite',
      narration: `Everything miniflow has drawn so far was a file, written by Node. This course draws the scene live, in a web page, and the page will teach us something about why the engine works the way it does.

A browser cannot run TypeScript, and does not understand imports that end in dot ts. Something has to sit between our source and the browser. That is Vite, a development server. We install it, pinned like everything else.

The new web folder holds the page. The editor shows index dot html: a header, an empty main element where the scene will go, and one script tag, highlighted, that loads main dot ts as a module. For now, main dot ts only sets the page's title and logs a line, to prove the page runs.

The side pane follows a request. The browser asks for the page, and Vite serves the HTML. The page asks for main dot ts, and Vite strips its types, the same way Node does, and serves JavaScript. Each import main makes is another request, answered the same way, so the browser loads the module graph one file at a time, exactly as we wrote it. Nothing is bundled while we develop, which is why it starts so fast.

The terminal starts Vite on the web folder, under the timeout command so the recording ends. Vite prints its version, ready in a fraction of a second, and the local address: localhost, port fifty-one seventy-three. The tsc check before it is silent, because the web folder is now part of the project the checker covers.

Next, the types that describe a page.`,
    },
    {
      id: 'dom',
      title: 'DOM types, and Element | null',
      scene: 'browser-dom',
      narration: `In a page, code talks to the DOM, the tree of elements the browser built from the HTML. TypeScript ships types for all of it, and they are honest in one way that surprises people at first.

The highlighted lines find the main element by its id with query selector, and set its text. The terminal shows the checker refusing the second line: error TS18047, host is possibly null.

The side pane's table explains why. Query selector searches the page for a selector, and nothing guarantees a match. The HTML might change, or the id might be mistyped. When nothing matches, it returns null. So its type is an element or null, and the checker will not let us use the result until we have dealt with the null.

The table also shows how precise these types are. The scratch probe asks for query selector of the word main, a tag name, and the terminal prints its type: HTMLElement or null, because for a known tag name the library knows exactly what kind of element it is. For an id like scene, it can only say Element. And for the theme button we will add later, a type argument says what we expect: an HTMLButtonElement or null.

The fix is the narrowing from the model course, applied to the page. Check for null once, near the top, and throw a clear error if the element is missing. After that check, the checker knows host is an element on every line below.

This is the browser's version of the lesson from the loading course: a value from outside the program, here the page, starts unchecked. Next, the scene goes into the page.`,
    },
    {
      id: 'svg',
      title: 'The SVG in the page',
      scene: 'browser-svg',
      narration: `Drawing the scene in the page takes very little new code, and that is the point of this section.

The import at the top of the file brings the checkout scene in as a JSON module, with an import attribute saying its type is json. The scene file does not change. Then, highlighted, assert scene checks it, the same validator that guards the command line, and the renderer draws it. The last line puts the SVG string into the main element with inner HTML.

One thing did have to move, and the side pane shows why. The validator used to live in the load file, next to read file from Node's file system module. A page has no file system, and importing that module would break the page. So the validator moves to its own file, validate dot ts, which imports nothing from Node, and the load file re-exports it, so every existing import keeps working. The terminal confirms that: the check is silent, and all nine tests still pass after the move.

The renderer did not change by a single line. It never knew it was writing a file. It only ever built a string, and a string is as useful to a page as to a disk.

The bottom panel is the live page, from the step's own Vite server, shown at the URL localhost, port fifty-one seventy-three. The checkout is there, exactly as the SVG file looked in the route course: the same boxes, the same arrows, the same monospace text.

But a web page can use any font. Next, we let it.`,
    },
    {
      id: 'measure',
      title: 'Measuring real text',
      scene: 'browser-measure',
      narration: `Since the layout course, every box has been sized by counting characters: nine point six pixels each, which is only true for a monospace font. A page can draw any font, and in a proportional font an i is much narrower than an m. Counting characters would make every box the wrong width.

The fix is to ask the browser. But the layout runs in Node too, and Node has no fonts to ask. So the layout must not know how text is measured. It should be told.

The editor shows how, highlighted. Measurer is an interface with one method: give it a line of text, and it returns its width. Mono is the old rule, wrapped as a Measurer. Layout now takes a measurer as a parameter, with mono as the default, and passes it down to every size calculation. Nothing in the layout file knows which one it has. That is dependency injection: a function receives what it depends on, rather than reaching out for it.

The side pane draws the two implementations behind one interface. Mono for Node and the command line. And in the page, a canvas measurer: it asks a canvas element to measure text in the page's real font, sans serif here, with measure text. The SVG renderer takes the font name too, so the boxes and the text agree.

The bottom panel shows the difference. The same checkout, now in a proportional font. Every box fits its own words, and most are narrower than before, because most letters are narrower than a monospace cell. The layout moved, and the arrows followed, because they are routed from the rects.

The tests still pass, untouched, because they use the default. Next, the page responds to a click.`,
    },
    {
      id: 'events',
      title: 'Events: a theme toggle',
      scene: 'browser-events',
      narration: `The palette from the draw course has a dark theme and a light one. The page gets a button to switch between them, and with it, events.

The header gains a button with the id theme. The main file finds it with query selector, passing HTMLButtonElement as a type argument, and checks both elements for null in one go. A variable holds the current theme, typed as Theme, so it can only ever be dark or light.

Draw is now a function. It renders the scene with the current theme, sets the theme on the page's body so the background follows, and labels the button with the theme a click would switch to. Notice the scene itself: after the assertion, it is captured in a constant. Inside a function, the checker cannot assume a narrowing done outside it still holds, so the narrowed value is kept in a const that cannot change.

The highlighted line is the event. Add event listener names the event, click, and passes a handler. The handler's parameter is a MouseEvent, and the event name is what tells the checker that. Listen for a key press instead, and the parameter would be a KeyboardEvent. The DOM types keep a map from every event name to its event type, and add event listener looks the name up in it with key of and an indexed access type, both from Course 10.

The side pane follows one click. The browser makes a MouseEvent, the handler flips the theme and logs where the click happened, and draw renders the same rects with the other palette. The layout is not run again, because nothing about the sizes changed.

The bottom panel shows the page after a click, in the light theme. Next, filling the window.`,
    },
    {
      id: 'fit',
      title: 'Fit to the window',
      scene: 'browser-fit',
      narration: `A diagram on a page should fill the space it has, and keep filling it when the window changes size. The function for that already exists. We wrote it in the layout course and tested it in the trust course: fit.

The new place function, highlighted, finds the SVG in the page and reads its natural size. It reads the size of the main element, the frame it must fit. Then fit returns a scale and an offset, exactly as it did in Node, with the same four percent margin. Place applies them as a CSS transform: translate by the offset, then scale. A transform only changes how the element is drawn. Nothing is laid out again, so it is cheap to do often.

And it does need doing often. Near the end of the file, one line creates a ResizeObserver, a browser API that calls a function whenever an element changes size. It watches the main element, so when the window is resized, place runs again and the diagram is fitted to the new size. Draw calls place too, after every theme change.

The side pane follows that chain: the observer, the pure fit function, the transform.

It is worth noticing how little of this is new. The fit math was written once, as a pure function from sizes to a transform, with no idea where it would be used. It ran in a lab in Course 4, under tests in Course 9, and now in a browser, unchanged. That is what pure functions buy.

The bottom panel shows the result in the light theme: the checkout scaled up to fill the page, centred, every box larger and easier to read. Next, building the page for real.`,
    },
    {
      id: 'build',
      title: 'A production build',
      scene: 'browser-build',
      narration: `During development, Vite serves every module separately, as written. That is fast to start and easy to debug, but a real site should not make one request per source file. For production, Vite builds the page into a few optimised files.

The terminal runs vite build on the web folder. It transforms fifteen modules: the page's own main file, and every module of miniflow it imports, the layout, the router, the renderer, the palette, the validator. Then it writes the result into a dist folder inside web, and reports each file's size, before and after gzip compression.

The side pane's table lists them. The HTML page is well under one kilobyte. The stylesheet is under half a kilobyte. And the whole of miniflow, the engine we have built over ten courses, comes to about ten kilobytes of JavaScript, and under four and a half once compressed. No framework, no runtime dependencies: just our code.

Two things happened to that code on the way. Every type was erased, as always. And the modules were bundled into a single file, minified, with names shortened and whitespace removed.

Look at the file names too. Each has a hash in it, a short code computed from the file's contents. If the contents change, the name changes. So a browser can keep a copy of a file forever, and a new release is always fetched fresh. The note says exactly that.

The engine now runs in two worlds: a command in Node, and a page in a browser, from the same source. One step remains: letting other people install it. That is the last course.`,
    },
  ],
}
