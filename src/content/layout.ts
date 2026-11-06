import type { Course } from '@graphlearning/shell'

// Course 4 · layout · Lay out the boxes. The output is the layout itself, printed, until Course 5 draws it.
export const layout: Course = {
  id: 'layout',
  title: 'Lay out the boxes',
  sections: [
    {
      id: 'measure',
      title: 'Functions: measuring a box',
      scene: 'layout-measure',
      narration: `Before the engine can draw a box, it has to know how big the box is. That is a job for a function, and functions are where TypeScript's types do some of their best work.

The new file, measure dot ts, holds two. The first is measure. Its parameters say what it takes: an item, and a padding with a default of twelve, so a caller may leave it out. After the parentheses, the return type says what it gives back: a Size, an object with a width and a height. Inside, it takes the item's title and sub, finds the longest line, and multiplies its length by nine point six, the width of one character in our monospace measure. Twenty pixels per line gives the height, and the padding goes on every side.

The side pane writes the whole function as one type: it takes an Item and an optional number, and returns a Size. That type is a value's type like any other, and later we will pass functions around by it.

The second function is row. Its last parameter starts with three dots, which makes it a rest parameter: any number of sizes, collected into an array. It adds up the widths, keeps the tallest height, and adds a gap between each pair.

The run measures each top-level item. The browser is a hundred and forty-nine by sixty-four. The two items in a row, with a gap of twenty-four, come to three hundred and thirty-two. And the email box with no padding at all is forty-eight by twenty: just its text.

Items are easy. Next, a group, whose size depends on everything inside it.`,
    },
    {
      id: 'recurse',
      title: 'Recursion over the tree',
      scene: 'layout-recurse',
      narration: `A group's size is not written anywhere. It is the sizes of its children, arranged in a row or a column, plus the group's own padding and title. And a child might be a group too. The natural way to compute that is a function that calls itself.

The new layout file has one function for every kind of node, called size of. The switch from Course 3 is back: an item measures its title and sub, a note measures its text. The highlighted group case is the interesting one. It loops over the children and calls size of on each, then combines them: in a row, widths add up and the tallest height wins, and in a column it is the other way round. Then it adds the gaps between children, room for the title, and padding on each side.

The side pane shows what happens when it runs on the services group. The call for services makes three more calls, one per child, and each child is an item, which returns straight away. That is the base case, the case that stops the recursion. Only when all three have answered can the group add them up. The call tree has exactly the shape of the scene tree, which is why recursion fits trees so well.

The run prints every top-level node. The note is two hundred and sixty-four by forty-four. The services group, three items stacked with two gaps, a title and padding, is a hundred and seventy-three by two hundred and ninety-six.

We have sizes. Next, we give every box a position, and keep them all in a map.`,
    },
    {
      id: 'map',
      title: "A Map of rects, and what get returns",
      scene: 'layout-map',
      narration: `A size says how big a box is. To draw it, we also need where it is: an x and a y. Together they make a Rect, and the layout will produce one for every node.

The layout file gains a function called place. It works top-down: it records a node's rect, and if the node is a group, it walks across or down its children, handing each one its position. The results go into a Map, from a node's id to its rect. The side pane draws it: a key on the left, a rect on the right, ten keys in all, one per node.

A map has one property that matters a great deal. Asking for a key that is not there does not crash. It returns undefined. So TypeScript types the result of get as Rect or undefined. The main file deals with that honestly. It asks for the orders rect, and an if narrows it to a Rect before using it. The run prints orders at eight hundred and fifty-three, forty-four.

The scratch file takes a shortcut. After get, it adds an exclamation mark, the non-null assertion, which tells the checker: trust me, this is never undefined. The checker trusts it. But there is no node called cart. The terminal shows the result: a type error at run time, cannot read properties of undefined, reading x.

The exclamation mark does not check anything. It only silences the checker, so the crash moves to run time. Use it only when you can prove the value is there.

Next, a cleaner way to combine children: a function that takes a function.`,
    },
    {
      id: 'reduce',
      title: 'Higher-order functions: folding the children',
      scene: 'layout-reduce',
      narration: `The group case of size of had a loop with two running totals and an if inside. It works, but it says how rather than what. Higher-order functions, functions that take other functions, let us say what.

The editor shows two small arrow functions, row and column. Each takes two sizes and returns one: row puts them side by side with a gap, column stacks them. The highlighted line is the whole group case now. Map turns every child into its size. Then reduce folds that list down to a single size, using row or column depending on the group's direction. And the function we hand to reduce is just a value, chosen by a condition one line earlier.

The side pane follows the fold for the services group. Its three children are a hundred and forty-nine by sixty-four, the same again, and a hundred and forty by sixty-four. Reduce combines the first two with column, then combines the result with the third. What comes out is the widest width and the heights added with two gaps: a hundred and forty-nine by two hundred and forty. The padding and title then go around it, exactly as before.

TypeScript checks the plumbing. Reduce expects a function that takes two sizes and returns a size, and both row and column have that type, so either may be passed.

The run prints the whole layout with console dot table: every node, with its x, y, width and height. Services sits at six hundred and forty-four, and its children start twelve pixels in.

Next, a function that works for any type at all.`,
    },
    {
      id: 'generic',
      title: 'Generics: one function, any result',
      scene: 'layout-generic',
      narration: `We keep needing the same walk: visit every node in the tree, ask each one a question, and collect the answers. The question changes, but the walk does not. A generic function lets us write the walk once.

The new file, tree dot ts, has a function called map tree. The angle brackets after its name introduce a type parameter, T. It stands for whatever type the question returns. The parameter f is a function from a node to a T, and map tree returns an array of T. Inside, it asks the node, then recurses into any children with flat map, so the answers come back as one flat list.

The side pane shows the payoff. In the main file, the first call asks each node for its id. The id is a string, so for that call TypeScript fills in T as string, and the result is an array of strings. The second call asks for each node's width, so T becomes number, and the result is an array of numbers. Nobody wrote string or number at the call. The checker inferred T from the function passed in.

That matters on the next line. Math dot max needs numbers, and because the widths are typed as an array of numbers, it is allowed. If the walk had returned something loose, that line could not be checked.

The run prints the ten ids, the ten widths, and the widest, two hundred and sixty-four, which is the note.

A type parameter can be anything. Sometimes we need it to be anything with a particular shape. That is next.`,
    },
    {
      id: 'constraint',
      title: 'Generic constraints: anything with an id',
      scene: 'layout-constraint',
      narration: `A scene's ids must be unique, or the layout's map would quietly overwrite one rect with another. A function that indexes things by id can check that, and it should work for nodes, rects, or anything else, as long as it has an id.

That is what the highlighted line says. Index by id takes a type parameter N, but the word extends puts a bound on it: N must have an id that is a string. Inside the function, that bound is what allows reading node dot id at all. Without it, N could be a number, and the checker would refuse.

The side pane's table lists what may be passed. An array of scene nodes is fine, because every node has an id. So is a list of plain objects with an id and a width, which have nothing to do with our model. The scratch file passes objects with a name instead, and the terminal shows the checker's refusal: error TS2353, name does not exist in a type with only an id.

The constraint has a second effect, just as useful. N is still the full type of what was passed in. So when the map of sizes is read back, the entry for queue is known to have a width, a number, not just an id. The run prints a hundred and twenty for it, and ten nodes indexed from the scene, with the browser's type read straight back as item.

A bound like that is how library code stays general without giving up its types.

Next, a walk that stops halfway through.`,
    },
    {
      id: 'generator',
      title: 'Generators: walking lazily',
      scene: 'layout-generator',
      narration: `Map tree visits every node, whether we need them all or not. Sometimes we want to stop early: find the first title too wide for its column and report it. A generator walks the tree one node at a time, and only as far as asked.

The function in the editor has an asterisk after the word function. That makes it a generator. Instead of returning a list, it yields one node and pauses. Yield star hands over to a nested walk, so the children come out in order. Its return type says what comes out: a Generator of scene nodes.

The main file loops over it with for of. Each turn of the loop asks the generator for the next node, and the generator resumes exactly where it paused. The loop checks each item's title against a limit of eight characters, and breaks at the first one longer.

The side pane counts what happened. The loop visited the note, the browser, the API, the services group, payments, and then inventory, whose title is nine characters, and the run prints too wide: Inventory. Six visited. The four greyed-out nodes at the bottom, the queue, the data group, orders and email, were never reached. Breaking out of the loop stopped the generator, so no work was done for them.

That laziness is the point. A generator does no work until it is asked, and stops when nobody asks. On a scene of ten nodes it hardly matters. On a diagram of thousands, it is the difference between scanning all of them and scanning six.

Next, protecting a rect from being changed by accident.`,
    },
    {
      id: 'readonly',
      title: 'readonly: rects nobody can move',
      scene: 'layout-readonly',
      narration: `Once the layout has placed a box, nothing else should move it by accident. In JavaScript, objects are shared, which makes that kind of accident easy. TypeScript can rule it out.

The side pane shows the trap. The scratch file loops over the map's rects, and the loop variable r is a second name for an object the map already holds. Two names, one object. So when the loop shifts every r forty pixels to the right, it is changing the layout's own rects in place, for everyone who reads them later. Nothing about that line looks dangerous.

The editor shows the defence, highlighted: the fields of Rect, and of Size, are now marked readonly. The objects are the same at run time, but the checker refuses any assignment to them. The terminal shows it catching the scratch file: error TS2540, cannot assign to x, because it is a read-only property.

So how does anything change a picture's position? By making a new value. The new fit file does that. Fit takes the content's size and a frame's size, keeps a margin of four percent on each side, and works out one scale and an offset that centres the content. The scale is clamped between a twentieth and four. It returns a fresh Transform and never touches a rect.

The run measures the content, a thousand and fifty-three by two hundred and ninety-six, and fits it into a frame of twelve eighty by seven twenty. The scale comes out at about one point one two, with the picture centred.

Next, a detour, to watch the whole layout happen.`,
    },
    {
      id: 'passes',
      title: 'How layout works',
      scene: 'layout-passes',
      narration: `This is a detour, to watch a whole layout happen, pass by pass, on a scene with a problem in it.

The scene is self, miniflow's picture of itself: a model, an engine group holding layout and route, and a draw step. One title, highlighted in the scene file, is a deliberate fault. It is sixty characters long, far wider than its neighbours.

The left side names the three passes. Measure goes bottom-up, because a parent cannot know its size until its children do. Place goes top-down, because a child cannot know its position until its parent has one. Fit comes last, and works on the finished picture.

For this lab, the layout logs every step, and the terminal shows the real order. Measure runs first: model, then the long layout item, then route, and only then engine, after both its children. The layout item measures six hundred by forty-four, so the engine group, which must hold it, grows to six hundred and twenty-four wide. Then place runs from the top: model at zero, engine next to it, its two children inside, and draw pushed all the way over to eight hundred and twenty-one, because the column in front of it grew.

That is the rule on the left: a title wider than its column grows the column, and everything after it moves over. Nothing is ever clipped, because clipping would hide words the author wrote. A diagram that grows too wide is fixed by the author, never silently by the engine.

Finally, fit scales the whole nine hundred and fifty-one by one eighty-eight picture into the frame at about one point two four. Next course, we draw it.`,
    },
  ],
}
