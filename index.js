function drupalDataTransformer(Twig) {
  const fs = require('fs');

  function RenderObject(obj) {
    Object.keys(obj).map((key) => {
      this[key] = toDrupalTwigJsData(obj[key]);
    });
  }

  RenderObject.prototype.toString = function toString() {
    var template = Twig.twig({
      data: fs.readFileSync('./test/twig/' + this['#theme'] + '.html.twig', 'utf8')
    });

    return template.render(this);
  };

  function RenderCollection(obj) {
    Object.keys(obj).map((key) => {
      this[key] = toDrupalTwigJsData(obj[key]);
    });
  }

  RenderCollection.prototype.toString = function toString() {
    const output = [];

    Object.keys(this).map((key) => {
      const value = this[key];

      output.push(value instanceof RenderCollection || value instanceof RenderObject ? value.toString() : value);
    });

    return output.join('');
  };

  function toDrupalTwigJsData(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    if (obj['#theme']) {
      return new RenderObject(obj);
    }

    if (Object.keys(obj).length) {
      return new RenderCollection(obj);
    }

    return '';
  }

  return toDrupalTwigJsData;
}

module.exports = drupalDataTransformer;
