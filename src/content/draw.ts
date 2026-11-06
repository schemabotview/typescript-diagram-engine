import type { Course } from '@graphlearning/shell'

// Course 5 · draw · Draw the scene.
export const draw: Course = {
  id: 'draw',
  title: 'Draw the scene',
  sections: [
    {
      id: 'class',
      title: 'Classes: an SVG document',
      scene: 'draw-class',
      narration: `We have a rect for every box. To draw them, we need an SVG file, and building one well is a job with state: a size, and a growing list of elements. That combination, data plus the operations on it, is what a class is for.

The new file defines a class called SvgDocument. It has a width and a height, both readonly, and a list of elements, whose name starts with a hash, which we will come back to. The constructor runs when someone writes new SvgDocument: it stores the two sizes. Notice it assigns them one by one. TypeScript has a shortcut that declares fields in the constructor's parameters, but it is not erasable syntax, so with the rule from the first course, we write it out.

The methods do the work. Rect adds a rectangle element and text adds a text element, each built from a template string. Each ends by returning this, the document itself, so calls can be chained, as the main file does: rect, then text, on one line. A getter called size reports how many elements there are. Static empty belongs to the class rather than to any one document: it is called on the class name, and builds a document with no size at all.

The side pane draws the object after those two calls. Its element list has two entries, a rect and a text. To string assembles them into SVG, and the terminal shows it: the svg tag, the rect, and the text checkout. Then two elements, and zero for the empty one.

Next, that hash in front of elements.`,
    },
    {
      id: 'private',
      title: '#private vs private',
      scene: 'draw-private',
      narration: `The document's element list is its own business. Code outside the class should go through rect and text, never push strings into the list directly. TypeScript has two ways to say so, and they are not the same.

The first is the keyword private, which comes from TypeScript. The scratch file try private dot ts declares a small class with a private field, then reads it from outside. The second is the hash in front of a name, as in our document's elements. That one comes from JavaScript itself. The other scratch file tries to read the document's hash elements from outside.

The terminal shows what each costs. tsc refuses both, with two different errors: TS2341 for the private field, and TS18013 for the hash field, which says it has a private identifier.

But then we run them. Node strips types, and private is a type annotation like any other, so it is simply deleted. The first file runs and prints the supposedly private list. The second file never runs at all. Node itself rejects it with a syntax error: a private field must be declared in an enclosing class. The privacy is part of the language, so it holds even when no type checker ever looks.

The side pane sums it up. Private is enforced at compile time only. Hash is enforced at run time too. Our document uses the hash, because its list must stay consistent with what the methods wrote, whoever calls it.

The scratch files go. Next, one more trap waiting inside a class: the word this.`,
    },
    {
      id: 'this',
      title: 'Methods, this, and a lost this',
      scene: 'draw-this',
      narration: `Inside a method, the word this means the object the method was called on. That sounds fixed. It is not, and our document is about to show why.

The editor adds two small methods. Box draws one rect, by calling this dot rect. Rects takes a list of rects and hands the box method to for each, to call once per rect. It reads naturally, and the checker is satisfied: the terminal's first line, the check, is silent.

Then we run it, and it crashes. The error points at line thirty-six, the inside of box, and says: cannot read properties of undefined, reading rect. This was undefined.

The side pane shows why. When we write doc dot box, with the object in front of the dot, JavaScript sets this to doc for that call. That is the left-hand case. But for each did not call doc dot box. It was handed the function alone, detached from its object, and it called it with nothing in front of the dot. So this was undefined. The value of this is decided by how a function is called, not by where it was written.

The fix is the line beneath: pass an arrow function that calls this dot box. An arrow function has no this of its own. It uses the this of the method around it, which really is the document. Every class-based codebase meets this bug, usually through an event handler or a callback, and the arrow is the usual fix.

Next, two renderers that share some code, through inheritance.`,
    },
    {
      id: 'extends',
      title: 'Inheritance: extends, abstract, protected',
      scene: 'draw-extends',
      narration: `Our engine will have more than one way to draw a scene: the outline printer from the model course, and the SVG renderer we are building. They share some behaviour, and a class hierarchy is one classic way to share it.

The editor shows the base of that hierarchy. BaseRenderer is marked abstract, which means it cannot be created on its own: it exists only to be extended. It declares a name and a draw method, both abstract, meaning every subclass must provide them. It also has a protected method called label, which joins a title and a sub. Protected means subclasses can call it, but outside code cannot. And describe is a normal method, which every subclass inherits as it is.

The side pane draws the chain. The outline renderer extends the base, and its draw method is the printer from Course 3, now returning text instead of printing it. The SVG renderer extends it too, and draws every rect as an SVG rectangle, using the document class. Both are created in the main file with new.

The terminal shows inheritance doing its job. Describe was written once, in the base class, yet both renderers answer: outline, Checkout, five nodes, and svg, Checkout, five nodes. Then the outline renderer draws the full outline we know, and the SVG renderer produces thirteen lines of SVG.

It works. But notice the cost. Both renderers are now tied to the base class: change it, and both change. That is a strong coupling for one shared helper. Next, a looser way to say what a renderer is.`,
    },
    {
      id: 'interface',
      title: 'Interfaces as contracts',
      scene: 'draw-interface',
      narration: `What do the two renderers really have in common? Not their code. They have a promise: each has a name, and a draw method that takes a scene and its rects and returns a string. An interface states that promise and nothing else.

The new file renderer dot ts holds it, highlighted. Interface Renderer: a readonly name, and draw, with exactly that signature. There is no code in it at all. The label helper, which the base class used to share, is now a plain exported function beside it. A helper does not need a class to live in.

So the base class is deleted, and the explorer no longer shows it. Each renderer now says implements Renderer instead of extends. Implements is a check, not a link: it asks the compiler to confirm that the class keeps the promise, and to complain at the class if it does not. Nothing is inherited, and nothing is shared at run time.

The side pane draws the new shape. One contract on top, two independent implementations under it. The main file holds them in an array typed as Renderer, and loops over it, calling draw without knowing or caring which one it has. The run shows both: three hundred and twenty-two characters of outline, starting with the scene's title, and nine hundred and ninety-one characters of SVG.

This is composition over inheritance. Small pieces that agree on an interface, rather than a family tree that must be kept in order.

And TypeScript lets us go further than most languages. Next, a renderer that never mentions the interface at all.`,
    },
    {
      id: 'structural',
      title: 'Structural typing: shapes, not names',
      scene: 'draw-structural',
      narration: `Here is something that surprises people who come to TypeScript from Java or C sharp. To be a Renderer, a value does not have to say so.

The main file adds two new renderers, both highlighted. The first is a class called Stats. It has a name and a draw method that reports how many boxes there are. It does not say implements Renderer anywhere. The second is not a class at all. It is a plain object literal called counter, with a name and an arrow function for draw.

Both go into the array typed as Renderer, and the checker accepts them. The terminal's first line is silent. The side pane's table explains why. TypeScript's type system is structural: a value fits a type when it has the right shape, whatever it is called and however it was made. Stats has a string name and a draw function that returns a string, so it is a Renderer. So is the object literal. The implements keyword on the other classes is only an early check, not what makes them fit.

Java and C sharp are nominal. There, a class is a Renderer only if it declares that it implements Renderer, by name. Two identical shapes with different names are different types.

The run shows all four renderers answering in the same loop. The outline, the SVG, stats with ten boxes, and counter with five top-level nodes.

Structural typing is why TypeScript fits JavaScript so well. JavaScript code passes plain objects everywhere, and TypeScript checks their shapes without asking anyone to rename anything.

Next, the SVG renderer draws the whole scene, properly.`,
    },
    {
      id: 'scene',
      title: 'Template literals: the whole scene',
      scene: 'draw-scene',
      narration: `Until now our SVG renderer drew bare rectangles. This is the section where miniflow draws its first real diagram.

The editor shows the new draw method. It works out the picture's size from the rects, plus a margin of sixteen on every side, and paints a dark canvas first. Then an inner function, visit, walks the scene. For every node, it fetches the node's rect, shifts it by the margin, and switches on the kind of node. A group gets a frame and a bold title, and then visit is called for each of its children. An item gets a rounded rectangle, its title in bright text and its sub beneath it in a muted colour. A note gets a dashed frame. Every element is a template literal, with the values dropped into the markup by dollar-sign braces.

The side pane follows the data: the map of rects from the layout, into visit, out as an SVG file. The main file writes it to out slash checkout dot svg, and the run reports two thousand and eighty-nine characters.

The bottom panel shows the result, opened in a browser. Everything the layout computed in Course 4 is now visible. The dashed note on the left. The browser and the API. The services group, with payments, inventory and the queue stacked in a column. The data group, with the orders database and email. Every box is exactly where the rect table said it would be, and every title fits its box, because the measure and the font agree.

But the renderer trusts its text completely. Next, a title that breaks the file.`,
    },
    {
      id: 'escape',
      title: 'Escaping: <Cart> breaks the file',
      scene: 'draw-escape',
      narration: `The shop's checkout gets one more box, a cart, and its author writes the title the way a developer would: cart, inside angle brackets. It is a perfectly reasonable title. It is also a problem.

The highlighted line in the scene file is the whole change. The run still succeeds: main writes the SVG, a couple of hundred characters longer than before. Nothing in TypeScript complains, because to TypeScript the title is just a string, and any string is allowed.

But an SVG file is XML, and in XML a less-than sign starts a tag. The terminal runs xmllint, a standard XML checker, on the file, and it refuses. At line nine, opening and ending tag mismatch: Cart, and text. It shows the line, with the title pasted straight in between the text tags. Then two more errors follow from the first, all the way to premature end of data. A browser opening this file would show an error page instead of a diagram.

The side pane shows the gap between the two readings. The author meant six characters of text to display. The parser read an element called Cart that opens and never closes. The renderer pasted text into markup without saying which was which.

The fix is one function at the boundary, where text enters markup. It replaces the four characters that mean something in XML, the ampersand, less-than, greater-than and the double quote, with their escaped forms. Every string the renderer writes goes through it.

Next, that fix, and colour.`,
    },
    {
      id: 'tones',
      title: 'Tones become colours',
      scene: 'draw-tones',
      narration: `Every box has had a tone since the model course. Now the tones become colours, and the cart's title becomes safe text.

The new palette file maps each theme to its colours: a canvas, a group frame, ink, muted text, and then the seven tones, each with a fill and a stroke. The type it must match says every theme is a record of Tone to colour. That type is Record: an object with exactly these keys, all of one value type.

The highlighted last line uses satisfies instead of a type annotation. The difference is subtle and useful. Satisfies checks that the palette fits the type, so a missing tone is still an error. But it does not replace the palette's own inferred type with the wider one, so every exact key stays known to the checker.

The side pane quotes the check at work. A scratch palette with only six tones, missing infra, is refused with error TS2741: property infra is missing. Add a tone to the union, and every palette that forgets it fails, the same safety the never check gave our switch.

The renderer now looks up each item's tone in the palette, and passes every title, sub and note through escape XML on its way into the file. The side pane's table lists the dark theme's strokes.

The bottom panel shows the coloured checkout. The browser and the cart in the consume red, the API in amber, payments in violet, inventory in blue, the queue in cyan, and the orders database in green. The cart's title is drawn as text, angle brackets and all. And xmllint is silent now.

Next course, the arrows between the boxes.`,
    },
  ],
}
