import type { Course } from '@graphlearning/shell'

// Course 10 · types · Types that compute.
export const types: Course = {
  id: 'types',
  title: 'Types that compute',
  sections: [
    {
      id: 'keyof',
      title: 'typeof and keyof: types from values',
      scene: 'types-keyof',
      narration: `Until now, every type in miniflow was written by hand. This course is about types that are computed from other types, and from values. It starts with a small duplication we have been carrying since the load course: the seven tone names appear twice, once in the Tone type and once in the validator's list.

The model file fixes that with one object, highlighted. Tone info maps each tone to a short description. As const freezes it, so every value keeps its exact literal type. Then the type Tone is derived from it: key of type of tone info.

Read that right to left, as the side pane does. Typeof, in a type position, means the type of this value. Key of means the union of that type's keys. So Tone is exactly the seven names, and it can never drift from the object again. The validator now uses object dot keys of the same object, so adding an eighth tone is one line in one file.

How can we see what a type turned out to be? This course uses a trick, the probe. The scratch file assigns a value of the computed type to a variable whose type is the literal word probe, which nothing can match. The checker refuses, and in refusing, it prints the type it actually has. The terminal shows both probes. The type of the store entry is the literal text keeps data. And key of type of tone info is the union of all seven names.

The check command still passes on the checkout. Next, looking up one part of a type, the way you would read a property.`,
    },
    {
      id: 'indexed',
      title: 'Indexed access types',
      scene: 'types-indexed',
      narration: `A value's property is read with square brackets: item, bracket, tone. Types can be read the same way. Item, bracket, the string tone, is the type of an item's tone field, whatever that is.

The scratch file declares three of these, highlighted. The terminal probes each one. Item bracket tone comes back as the seven tones or undefined, because tone is optional. Scene node bracket type is the union of every node's tag: group, item or note. That one is interesting, because SceneNode is a union, so the lookup is done on each member and the results are joined. And the third reads two levels deep. Scene bracket nodes is the array of nodes, bracket number means the type of any element, and bracket id is that element's id: a string.

The side pane's table lists the three results.

Why bother, when we could write those types out? For the same reason as the last section: there is then nothing to keep in step. The load file shows it. Its list of node kinds is now typed as an array of scene node bracket type. If someone adds a fourth kind of node to the model, that list must include it, and the validator's error message, which joins the list, names it automatically. If someone mistypes a kind in the list, the checker refuses it.

Indexed access is how a large codebase talks about pieces of its central types without copying them. Next, building a whole new type from an existing one, key by key.`,
    },
    {
      id: 'mapped',
      title: 'Mapped types',
      scene: 'types-mapped',
      narration: `A mapped type walks over the keys of a type and builds a new property for each one. TypeScript's own Partial, which makes every field optional, is a mapped type, and the new types file writes it by hand, highlighted, as Optional.

Read the braces like a loop. For each key K in key of T, make a property called K, add a question mark to make it optional, and give it the type T bracket K, the original field's type. The side pane's table runs that loop over Item: type, id, title, sub and tone each come out with a question mark. The scratch file uses it for a patch, an object that changes only the title of an item, and the checker accepts it.

The second highlighted type goes further. Deep readonly is a mapped type that calls itself. For an array, it makes a readonly array of deep readonly elements. For any other object, it maps every key to readonly, with a deep readonly value. Anything else, a string or a number, is left as it is. That condition is a conditional type, the subject of the next section.

The point is reach. The readonly keyword from the layout course protected one level of one object. Deep readonly protects a whole scene, every node and every child of every group. The scratch file takes a deep readonly scene, finds its first group, and tries to replace its children. The terminal shows the checker refusing, with error TS2540: children is a read-only property, three levels down from where the type was applied.

Next, the question mark and colon that appeared inside that type.`,
    },
    {
      id: 'conditional',
      title: 'Conditional types',
      scene: 'types-conditional',
      narration: `A conditional type is an if for types. It reads, T extends U, question mark, one type, colon, another. If T fits U, the result is the first type, otherwise the second.

The highlighted type, Node Of, uses one to answer a useful question: given a tag, which node kind has it? Node Of group should be Group. It takes the scene node union, and for each member N, asks: does N have type K? If so, keep N. If not, never.

The words for each member matter. When a conditional type is applied to a union, it runs once per member, and the results are joined. That is called distribution, and the side pane draws it for Node Of group. Item is asked and gives never. Group is asked and is kept. Note gives never. And never disappears from a union, so what is left is just Group.

The terminal probes three uses. Node Of group is Group. Node Of item or note comes back as Item, then Note: two kinds kept, one dropped. And the third probe asks for Node Of edge, a tag no node has. There is no error at all for that line. Every member gave never, and never, the empty type, can be assigned to anything, even to the word probe. A silent probe is the answer.

TypeScript's built-in Extract is this same pattern. Writing it once by hand is what makes the built-ins readable rather than magic.

Next, a conditional type that does more than test a shape: it takes a piece of it.`,
    },
    {
      id: 'infer',
      title: 'infer: a pattern match on a type',
      scene: 'types-infer',
      narration: `A conditional type can test whether a type has a shape. With infer, it can also capture part of that shape, the way a pattern match pulls a value out of a structure.

The first highlighted type is Element Of. It asks whether T is an array of something, and the word infer E names that something. If T is an array, the answer is E, the element type. If not, never. The second is Return Of, our own version of TypeScript's ReturnType, which the debounce in the command course used. It asks whether F is a function, whatever its arguments, returning something it calls R. If so, the answer is R.

The side pane shows the idea: match the shape, capture the hole.

The terminal probes three uses. Element Of scene bracket nodes is SceneNode. Return Of type of layout is a Map from string to Rect: the checker read the layout function's own declaration and pulled out its return type. And the third combines them. Return Of type of route is an array of points, so Element Of that is one point, Pt, the tuple from the route course.

This is how types are derived from functions without ever writing them again. A test can say: whatever layout returns, this helper takes the same thing. If layout's return type changes, everything derived from it changes too, and the checker re-checks every use. Return type of set timeout, from the command course, worked exactly like this.

Next, a type that is the same as a string at run time, and different at compile time.`,
    },
    {
      id: 'brand',
      title: 'Branded ids',
      scene: 'types-brand',
      narration: `Node ids and labels are both strings, and that is a problem. A function that expects an id will happily take a label, or a title, or any text at all. A branded type gives an id its own type, without changing it at run time.

The highlighted type, NodeId, is a string intersected with an object that has a brand field. No real string has that field, so no plain string is a NodeId. But nothing exists at run time either: the brand is never created. A NodeId is an ordinary string with a different name in the checker.

The only way to make one is the function below it. Node id takes a string and the set of known ids, checks the string is among them, and only then returns it as a NodeId. That as is the one claim in the whole scheme, and it sits right behind a real check.

The side pane follows a string through. Api is just a string. Node id checks it, and what comes out is a NodeId, which the checker now trusts.

The scratch file has a map of rects keyed by NodeId. Looking up node id of api is fine. The terminal shows the two that are not. Looking up the plain string api is refused, and so is looking up a label, paid. Both give error TS2345: a string is not assignable to NodeId, because it lacks the brand.

The cost is one function call wherever text becomes an id. The gain is that the checker can tell an id from any other string, everywhere it travels. Next, a type that describes the text itself.`,
    },
    {
      id: 'template',
      title: 'Template literal types: addresses',
      scene: 'types-template',
      narration: `Some strings have a grammar. An edge could aim at one face of a box, written as an address: the node's id, a dot, and the face, as in api dot right. Template literal types can describe that grammar exactly.

The highlighted type, Port, is written with backticks, like a template string, but with types in the holes. Any string, then a dot, then a Side, the union of left, right, top and bottom from the route course. The side pane draws the three parts. Because Side is a union, Port is really four patterns: anything ending in dot left, dot right, dot top, or dot bottom.

Below it, parse port splits an address into its id and its side. The return type is a labelled tuple again. The cast on the side is safe, because the input's type has already guaranteed what follows the dot.

The scratch file tries some addresses, and the side pane's table lists the results. Api dot right is a Port. Api dot rigth, with the letters swapped, is refused with error TS2322, and the message lists all four patterns it failed to match. Plain api, with no face at all, is refused too.

The scratch file also runs, and parse port splits two good addresses into their parts: api and right, orders and left.

So the checker now validates the inside of a string, a thing that in most languages needs a regular expression at run time.

One step left: using all of this to catch the paymnet typo before anything runs.`,
    },
    {
      id: 'define',
      title: 'const type parameters: the typo caught at compile time',
      scene: 'types-define',
      narration: `In the route course, a typo in an edge, paymnet instead of payments, got all the way to run time before a SceneError caught it. This section moves that catch to compile time, using what this course built.

The checkout scene is written in code again, through a new helper called define scene, and the highlighted line is the typo, back on purpose.

Define scene has a type parameter N for the nodes, and it is marked const. That is a newer TypeScript feature. Normally, an object literal passed to a function is widened: the id api becomes just string. A const type parameter keeps everything exactly as written, as if the caller had added as const. So N holds every node with its literal id.

A type called ids of then walks N, with a conditional type and infer, collecting each node's id, and recursing into each group's children. The side pane draws the flow: the literal nodes, into ids of, giving a union of twelve ids. The edges parameter then requires every from and every to to be one of those twelve.

The terminal shows the result. One error, at line forty-two of the scene file, exactly on the typo: error TS2322, the type paymnet is not assignable to the type api, or browser, or cart, and so on, all twelve ids listed. The editor would underline it as it was typed.

That is the payoff of type-level programming. The scene's own data became the type that checks it. With the typo fixed, npm run check is green again.

Next course, miniflow runs in a browser.`,
    },
  ],
}
