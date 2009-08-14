doctest.testfile demo
=====================

This is an example using a plain text file with examples that can be tested.
You can run these examples with `doctest.testfile('testfile.md')`.

Text Concatenation
------------------

Text can be concatenated.

	js> var a = 'foo';
	js> var b = 'bar';
	js> a + b
	foobar

That was the end.

Another Example
---------------

Unfortunately, Rhino oversimplifies a bit when printing representations in the console.

	js> var t = true;
	js> t
	true
	js> typeof t
	boolean

	js> var t = "true";
	js> t
	true
	js> typeof t
	string

Multiline Expression
--------------------

Example with expression that spans multiple lines.

	js> var foo = function() {
	  >     return 'bar';
	  > };
	js> foo()
	bar

