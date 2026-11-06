import type { Course } from '@graphlearning/shell'

// Course 1 · intro · TypeScript, and what we'll build. Authored last: it shows the finished app.
export const intro: Course = {
  id: 'intro',
  title: "TypeScript, and what we'll build",
  sections: [
    {
      id: 'what',
      title: 'What TypeScript is, and where it is used',
      scene: 'intro-what',
      narration: `TypeScript is JavaScript, with types written into it. That is the whole idea, and this film is about what that idea buys.

On the left is the life of a TypeScript file. You write ordinary JavaScript, and wherever it helps, you add a type: this value is a number, this object has a title, this function returns a list of points. Then two separate things happen to the file. A checker, called tsc, reads every type and tells you what does not fit, before anything runs. And the types are erased. Node, Vite or tsc itself simply removes them, and what is left is plain JavaScript, which runs anywhere JavaScript runs: in Node, or in a browser.

On the right is that erasure for real, from the second course. On top, a few lines of TypeScript: a type describing a box, a box that must match it, and a padding that must be a number. Below, the JavaScript that tsc wrote from them. The type is gone, and so are the annotations. The code that remains is the code that was there.

That is why TypeScript is everywhere JavaScript is. Nothing about the running program changes, so adopting it costs nothing at run time, and the checking happens while you write. The editor many of you are using is written in it. So are the Angular framework, the Vite dev server we will use in Course 11, the Playwright browser tester, and graphl-flow, the engine that draws every frame you are watching. And so is the program we are about to build.

This film assumes you have written a little JavaScript. Everything TypeScript adds, it builds one piece at a time. Next, what we will build.`,
    },
    {
      id: 'build',
      title: "What we'll build",
      scene: 'intro-build',
      narration: `This is what we will build: miniflow, a small diagram engine. You describe boxes, groups and arrows as data, and it draws them.

At the top is the finished engine drawing a picture of itself: a model, an engine that lays out and routes, and a draw step, joined by arrows. It is drawn twice. On the left, as an SVG file, written by miniflow's command line. On the right, live in a web page, with a proportional font, fitted to the window, and a button to switch themes. Both pictures come from the same scene file and the same code.

Underneath is the road there, one course at a time. We start with a single box, drawn by a script in the second course. Then the scene as typed data, so a malformed one cannot compile. A layout that works out where every box goes. A renderer that turns that into a picture. Arrows that find their way between boxes. Scene files read from disk, and refused politely when they are wrong. A command, with render, check and watch. Tests, a linter and the strictest checks, so it keeps working. Then types that compute, which turn a typo in an edge into a compile error. A page in the browser. And finally, a package that anyone can install, with a version number that keeps its promises.

Every feature of TypeScript in this film arrives at the moment the engine needs it, and every output you will see is real: run, recorded, and shown as it happened.

Let's start with the first file.`,
    },
  ],
}
