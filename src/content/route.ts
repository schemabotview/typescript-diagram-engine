import type { Course } from '@graphlearning/shell'

// Course 6 · route · Draw the arrows.
export const route: Course = {
  id: 'route',
  title: 'Draw the arrows',
  sections: [
    {
      id: 'tuples',
      title: 'Points and segments: tuples',
      scene: 'route-tuples',
      narration: `A diagram without arrows is a list of boxes. This course connects them, and an arrow starts with a point.

A point is two numbers, an x and a y. We could use an object with two fields, but a pair in an array is lighter, and TypeScript has a type for exactly that: a tuple. The highlighted line in the new route file defines Pt as a readonly tuple of two numbers, and even names its two positions, x and y, so an editor can label them. An arrow that bends is then a list of points, a polyline.

The main file builds one, the bend in the side pane's table: four points, going right, then down, then right again. Destructuring pulls the first point out, and then its x and y, and the run prints them: x six hundred and twenty, y thirty-two. Two helpers in the route file do the work. Polyline turns the points into the text SVG expects, and length adds up every step. Because each step goes straight across or straight down, the length is just the sum of the distances, a hundred and twenty-eight.

The scratch file shows what the tuple type guarantees. A point with three numbers is refused with error TS2322: the source has three elements, but the target allows only two. And because the tuple is readonly, assigning to its first position is refused too, with TS2540. A point, once made, stays as it is, which matters when one point is shared by two segments.

Next, giving a rect a name, by joining two types.`,
    },
    {
      id: 'intersection',
      title: 'Intersection types: a rect with a name',
      scene: 'route-intersection',
      narration: `The router will work with boxes by name. The layout's map knows each rect's id only as its key, and passing the two around separately is clumsy. What we want is a single value that is a rect and also has an id.

The highlighted line makes that type out of two existing ones. Placed is Rect, ampersand, an object with an id. The ampersand forms an intersection type: a value of it must have all the fields of the left side and all the fields of the right. The side pane draws it: x, y, width and height from Rect, plus the id, together in one shape.

An intersection is the counterpart of the union from the model course. A union says a value is one shape or another, so it may use only what they share. An intersection says it is both, so it may use everything. And just like the union, it does not exist at run time. The placed function simply spreads each rect into a new object with its id, and the type describes the result.

A second helper, centre, takes a placed rect and returns its centre as a point tuple, half the width across and half the height down.

The run prints two placed rects from the checkout. The API is at four hundred and fifty-two, zero, with its centre at five hundred and thirty-one and a half, thirty-two. The orders database is further right and down.

We have points and named rects. Before writing the router, a detour to see how one edge finds its way.`,
    },
    {
      id: 'how',
      title: 'How an edge is routed',
      scene: 'route-how',
      narration: `This is a detour, to follow one arrow from start to finish: from the queue to the orders database. The lab logs every step of the router, and the left side names them.

Step one: the two rects, fetched from the layout by id. The log shows the queue low down in the services column, and the orders database higher up, in the data column to its right.

Step two: the gaps between them, across and down. The log gives sixty-five across, and a hundred and twelve down. The first version of this router chose whichever gap was larger, and it went wrong: it sent this arrow out of the top of the queue and straight through the boxes above. So the rule is simpler. Boxes side by side are joined across, and only stacked boxes are joined up or down.

Step three follows from that: the faces. The arrow leaves the queue's right face and enters the orders database's left face, as the log says.

Step four, the ports: where along each face the arrow touches. The queue's right face has two arrows leaving it, so this one takes the first third. The orders database's left face has three arriving, so this one, coming from the lowest box, takes the three-quarter mark.

Step five, the path. Out of the queue to the middle of the gap between the columns, up to the height of the port, and across into the orders database. Four points, every turn a right angle.

The next three sections build each of those steps as code.`,
    },
    {
      id: 'router',
      title: 'The router, as pure functions',
      scene: 'route-router',
      narration: `Now the router itself, and the first picture with arrows in it.

The scene model gains edges. An Edge has a from, a to and an optional label, and a Scene now has a list of them. The checkout lists nine: the browser to the cart, the cart to the API, the API out to the three services, the three services into the orders database, and the queue to email. The browser and the cart now sit together in a client group, so the picture stays narrow enough to read.

The highlighted function in the editor is the router. Route takes two rects and returns a list of points, and that is all. It picks the faces, takes an anchor point on each, and puts the bend in the middle of the gap between them. It reads nothing else and changes nothing. A function like that is called pure: the same rects in give the same points out, every time. The side pane draws it as rects in, points out, no state, and the note says why it matters. A pure function can be tested with nothing but two rects and an expected answer, which Course 9 will do.

The layout learns one thing too. Siblings with an edge running between them get a gap of thirty-two instead of twenty-four, to leave the arrow room.

The bottom panel shows the result. Arrows run from the client to the API, fan out to the services, and converge on the data. But look closely at the orders database. All three arrows arriving there aim at the same point, the middle of its left face, and their heads pile into one. Next, we spread them out.`,
    },
    {
      id: 'ports',
      title: 'Ports on a shared face',
      scene: 'route-ports',
      narration: `Three arrows into one point read as one arrow. Each needs its own place along the face, called a port.

The new function in the editor is ports. It goes through every edge and works out which face it leaves and which face it enters, using the same faces function as the router. It groups the ends by face: all the ends on the orders database's left face land in one list. Then, highlighted, it sorts each list by where the other end sits, and spreads the ends out evenly.

The side pane's table works through that face. Three edges arrive, from payments, inventory and the queue. Sorted by the height of their sources, payments comes first, then inventory, then the queue. With three ports on one face, they go at one quarter, two quarters and three quarters of the way down. Sorting matters: if the ports were handed out in any other order, the arrows would cross each other on their way in.

The same thing happens wherever ends share a face. The API's right face has three arrows leaving it, and the queue's right face has two.

The router itself does not change. It already took a position along each face, defaulting to the middle, and now the renderer passes each edge its two ports.

The bottom panel shows the result. The three heads on the orders database are separate now, each where its line arrives, and the API's three arrows leave from three different points. The lines still share their channels between the columns. Giving each line its own lane is the next thing a serious engine does, and graphl-flow does exactly that.

Next, a nicer way to write an edge.`,
    },
    {
      id: 'overloads',
      title: 'Overloads: two ways to write an edge',
      scene: 'route-overloads',
      narration: `Most edges are just two ids. A few carry a label too. A small helper called edge makes both easy to write, and TypeScript can describe both ways of calling it.

The editor shows two signatures, highlighted, with no bodies. The first takes two strings, from and to. The second takes one object, with from, to and an optional label. These are overloads: the list of ways the function may be called. Below them comes the one real implementation, whose parameter types are wide enough to cover both. It checks which form it was given with typeof, and builds the edge either way.

Callers only ever see the overloads, never the implementation's own wider signature. That is the point. The checkout's edges are now written with the helper, and most read simply as edge, api, queue. The one from payments to the orders database uses the object form, to carry the label paid. The run prints three of the edges, and the labelled one shows its label.

The scratch file calls edge with a single id, which fits neither signature. The terminal shows the refusal, error TS2345. Notice the message talks about the object form, because when no overload matches, the checker reports against the last one it tried. Overload errors take a little practice to read.

Overloads are worth it when a function really has two distinct shapes of call, as this one does. When the shapes are close, a single signature with an optional parameter is simpler.

Next, an edge that points at nothing.`,
    },
    {
      id: 'unknown',
      title: 'An edge to an unknown id',
      scene: 'route-unknown',
      narration: `An edge names its ends by id, and ids are typed by people. The highlighted line in the checkout makes the typo that is waiting to happen: the API's edge goes to paymnet, with the n and the m swapped.

The checker has nothing to say. The first line of the terminal is silent, because every id is just a string, and paymnet is a perfectly good string. So the mistake reaches run time.

What happens there depends on us. Without a check, the renderer would look up the rect for paymnet, get undefined from the map, and crash somewhere deep in the router with a message about reading x of undefined, far from the cause. Instead, the renderer now checks every edge's two ends before drawing anything. When one is unknown, it throws a SceneError, a small class in the new errors file that extends the built-in Error, so it carries a stack and a message of its own.

The error also carries a cause. The second argument to its constructor is an options object, and cause holds the lower-level error, a RangeError naming the exact id that was not found. The terminal shows both. SceneError: edge two, from the API to paymnet, cannot be drawn. And underneath, in square brackets, the cause: no node has the id paymnet.

The side pane draws the path of the throw. Main called draw, draw threw, and since nothing caught it, the error unwound all the way out of main, and Node printed it and exited.

A typo in an id is the most common bug a diagram can have. Course 10 makes this exact one a compile error. Next course, scenes move out of code into files.`,
    },
  ],
}
