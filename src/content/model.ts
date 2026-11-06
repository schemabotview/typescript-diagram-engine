import type { Course } from '@graphlearning/shell'

// Course 3 · model · Describe a scene in types.
export const model: Course = {
  id: 'model',
  title: 'Describe a scene in types',
  sections: [
    {
      id: 'infer',
      title: 'Primitive types and inference: a box in values',
      scene: 'model-infer',
      narration: `Our engine is going to draw diagrams, and a diagram starts with a box. So the first thing to describe is one box, as plain values.

The editor holds five of them: an id, a title, a width, a padding, and whether the box is visible. Notice that none of them has a type written next to it. TypeScript does not need one. When a value is right there, the checker infers its type from it, and the side pane shows what it decides.

The interesting part is the difference between const and let. A const can never change, so TypeScript keeps the exact value as the type. The id is not just any string: its type is the single word orders. The width is exactly ninety-six. Visible is exactly true. Padding is declared with let, because it changes on the next line, so TypeScript widens it to number: any number may follow.

Those are the three primitive types we will use everywhere: string, number and boolean. Every other type in this film is built out of them.

The terminal runs the two steps we will use from now on. First the check, which is silent, so everything holds. Then the run. The first line prints the five values, with the padding now sixteen. The second line asks JavaScript itself what kind each value is, and it answers string, number, number and boolean. That is the run-time view, which is much coarser than the checker's.

That exactness is about to pay off. Next, we give the box a colour, chosen from a fixed set.`,
    },
    {
      id: 'tones',
      title: 'Literal unions: tones',
      scene: 'model-tones',
      narration: `Every box in our diagrams has a tone, a colour family that says what the box is: a source of data, a store, a service. There are exactly seven, and anything else is a mistake.

The highlighted type at the top says so. Tone is a union of seven string literals, joined by vertical bars, and the bar reads as or. The side pane draws what that means: a type is a set of values, and this set has exactly seven members. Neutral, source, ingest, store, serve, consume and infra. Nothing else belongs.

So when the item declares its tone as a Tone and sets it to store, the checker agrees. And when a scratch file, try dot ts, makes the typo we all make, stroe, the terminal shows the result: error TS2820, type stroe is not assignable to type Tone. And then the checker adds a suggestion of its own: did you mean store? It can, because it knows the whole set.

Compare that with the last highlighted line. A variable called kind is declared with let and the word item. Because it may change, TypeScript widens it to string, the set of every text there is, and so the next line can set it to anything at all without a complaint. A wide type checks almost nothing.

The run prints the item with its tone in brackets: store, orders, Orders DB.

Seven allowed words is the first real rule our engine has. Next, we gather an item's fields into one shape.`,
    },
    {
      id: 'object',
      title: 'Object types: the shape of an item',
      scene: 'model-object',
      narration: `Loose variables do not make a diagram. We need one value per box, with all its fields together, and a type that says what those fields are.

That type now lives in its own file, model dot ts, in a new source folder. The editor shows it. Tone has moved here, and under it is an interface called Item. An interface names a shape: an id that is a string, a title that is a string, and two fields with a question mark, sub and tone. The question mark means optional, and the side pane's table marks the difference: id and title must be there, sub and tone may be left out.

You could write the same shape with the type keyword and an equals sign instead. For an object, the two are nearly interchangeable. We will use interface for object shapes and type for everything else, which is the common habit.

The main file imports that type and builds the orders item, and the checker holds it to the shape. It has an id, a title and a tone, so it fits. The scratch file tries an item with a misspelled field, titel, and the terminal shows what happens: error TS2561. An object literal may only specify known properties, and titel does not exist in Item. Did you mean title? Mistyped field names are among the commonest bugs in JavaScript, and here one is caught before anything runs.

The run prints the same line as before, now read from one object. Next, we look closely at that question mark.`,
    },
    {
      id: 'optional',
      title: 'Optional fields and undefined',
      scene: 'model-optional',
      narration: `An optional field is a promise that the value might not be there. TypeScript takes that promise seriously, and so must we.

The side pane shows what the question mark really means. The type of an item's sub is not string. It is string or undefined, and every use of it has two branches. The orders item has a sub, one row per order. The API item has none at all.

The scratch file ignores that and asks for the length of the API's sub directly. The terminal shows the checker's answer: error TS18048, api dot sub is possibly undefined. In plain JavaScript that line would crash at run time with a type error. Here it never gets the chance.

The editor shows the two operators that handle the missing case, highlighted. The double question mark supplies a default: if the tone is undefined, use neutral. Then a plain condition builds the sub text only when there is one. And the question mark followed by a dot, optional chaining, stops early: if the sub is undefined, the whole expression is undefined instead of an error.

The run walks both items. The orders item has no tone, so it prints neutral, with its sub and a length of seventeen. The API prints serve, no sub, and a length of undefined, without a crash.

One item is not a diagram, though. Next, we put items inside a group.`,
    },
    {
      id: 'tree',
      title: 'Arrays, and a tree of groups',
      scene: 'model-tree',
      narration: `A diagram has structure: boxes sit inside groups, and the groups sit side by side or stacked. That structure is a tree, and the next shape in our model describes it.

The editor adds an interface called Group, highlighted at the bottom of the model file. A group has an id and a title, a direction that is a literal union of row or column, and children. The children field is typed as Item followed by square brackets, an array of items. Every element must be an Item, and the checker will hold each one to that shape.

The side pane draws the value from the main file. The data group lays out its children in a column, and the column holds two items: orders and email. One parent, an array of children. That is a tree, even if for now it is only one level deep.

The main file prints the group's title and direction, then loops over its children with for of, and prints each one indented beneath it, with neutral as the default tone. The run shows the result: Data, in a column, then store orders and consume email, one step in.

The scratch file is gone, because nothing here is meant to fail. But look at the limit we just built in. A group can hold items, and only items. In a real diagram a group holds other groups too: a data center holds racks, and racks hold servers. Next, we let a child be either kind, and that needs a union of shapes.`,
    },
    {
      id: 'union',
      title: 'Discriminated unions: an item or a group',
      scene: 'model-union',
      narration: `A child in our tree can now be an item or a group. TypeScript can describe that, and the trick is a single field.

The model file gives each shape a type field with a literal value. Every Item has type item; every Group has type group. Then the highlighted line names the combination: a SceneNode is an Item or a Group. And a group's children are now SceneNodes, so groups can hold groups, as deep as we like.

That type field is called the discriminant, and the side pane shows why it matters. A SceneNode on its own could be either shape, so the checker lets us read only the fields both share. But the moment we test the tag, the union splits in two. If type is item, it is an Item, with a title, a sub and a tone. If type is group, it is a Group, with a direction and children.

With that, the whole checkout scene can be written as data. It is in its own file in a new scenes folder: a browser, an API, a services group holding payments, inventory and a queue, and a data group holding the orders database and email. The tsconfig gains one setting, allow importing TypeScript extensions, because the main file now imports a value from a dot ts file.

The main file tests each top-level node's tag, and the run prints them: the browser and the API as items, then services with three children and data with two.

The test on the tag is called narrowing, and it is the next section.`,
    },
    {
      id: 'narrow',
      title: 'Narrowing: the outline of a scene',
      scene: 'model-narrow',
      narration: `The printer now turns the whole checkout scene into an outline, and it does that with narrowing: following the type through each branch of the code.

The function in the editor takes a node and a depth. The highlighted switch looks at the node's type field, and the side pane follows what the checker knows at each point. Before the switch, the node is an Item or a Group. Inside the item case, it is an Item, so the code may read its sub and its tone. Inside the group case, it is a Group, so it may read its children, and the function calls itself for each child, one level deeper. That is recursion, and it is how a function walks a tree whose depth it does not know.

Narrowing is not limited to switch. Inside the item case, a check that the sub is not undefined narrows it from string or undefined to string. A test with typeof, or with the in operator, which asks whether an object has a field, narrows the same way. The checker reads ordinary JavaScript conditions and updates the type to match.

The run shows the scene as an outline. Checkout on top, then the browser and the API with their subs, then the services group, in a column, with payments, inventory and the queue indented under it, and the data group with the orders database and email.

The printer handles every kind of node there is. Next, we add a third kind, and see whether the checker notices.`,
    },
    {
      id: 'never',
      title: 'Exhaustiveness with never',
      scene: 'model-never',
      narration: `Our scenes need one more kind of node: a note, a short line of text that explains the diagram. Adding it shows one of TypeScript's most useful habits.

The model gains a Note interface, with type note and some text, and the SceneNode union grows to three members. The checkout scene opens with a note. But the printer's switch still handles only items and groups.

The highlighted default branch is what catches that. It assigns the node to a variable whose type is never. Never is the empty set: a type with no values at all. The side pane's table follows what the node can still be as the switch goes down. Before notes, after the item case only Group was left, and after the group case nothing was: never. So the assignment was fine.

With notes added, there is a leftover. After both cases, the node can still be a Note, and a Note cannot be assigned to never. The terminal shows the checker pointing at exactly that line, with error TS2322: type Note is not assignable to type never.

This is the payoff of a discriminated union. Whenever the model gains a new kind of node, every switch that forgot it becomes a compile error, at the line that needs the new case. Nothing slips through to run time unhandled. In a codebase with many such switches, that is the difference between a quick change and a hunt.

One more case for the note, and the outline prints it. Next course, we work out where each box goes.`,
    },
  ],
}
