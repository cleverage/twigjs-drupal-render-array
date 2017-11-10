function drupalDataTransformer(Twig) {
  const fs = require('fs');

  function RenderElement(obj) {
    Object.keys(obj).map((key) => {
      this[key] = toDrupalTwigJsData(obj[key]);
    });
  }

  RenderElement.prototype.toString = function toString() {
    let source = null;

    try {
      source = fs.readFileSync('./test/twig/' + this['#theme'] + '.html.twig', 'utf8');
    } catch (err) {
      return '';
    }

    const template = Twig.twig({
      data: source
    });


    const data = {};

    data[this['render element']] = this;

    return template.render(data);
  };

  function RenderVar(obj) {
    // Remove first `#`
    Object.keys(obj).map((key) => {
      this[key.replace(/^#/, '')] = toDrupalTwigJsData(obj[key]);
    });
  }

  RenderVar.prototype.toString = function toString() {
    let source = '';

    try {
      source = fs.readFileSync('./test/twig/' + this.theme + '.html.twig', 'utf8');
    } catch (err) {
      return this.markup;
    }
    const template = Twig.twig({
      data: source
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

      output.push(value instanceof RenderCollection || value instanceof RenderElement || value instanceof RenderVar ? value.toString() : value);
    });

    return output.join('');
  };

  function toDrupalTwigJsData(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    if (obj['#theme']) {
      if (obj['render element']) {
        return new RenderElement(obj);
      }

      return new RenderVar(obj);
    }

    if (Object.keys(obj).length) {
      return new RenderCollection(obj);
    }

    return '';
  }

  return toDrupalTwigJsData;
}

module.exports = drupalDataTransformer;
