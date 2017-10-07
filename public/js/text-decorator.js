var parser = new Parser(
  { whitespace: /\s+/,
    clothing: /#([^\[]+)\[([^\]]+)\]/,
    user: /@[\w-]+/,
    other: /\S+/ } );
var textAreas = document.getElementsByTagName("textarea");
for(el of textAreas) {
    if (el.id) {
        window[el.id] = new TextareaDecorator( el, parser );
    } else {
        new TextareaDecorator( el, parser );
    }
}