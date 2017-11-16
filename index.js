const fs = require('fs');
const path = require('path');

function defaultPathResolver(key) {
  return path.join('./test/twig', key + '.html.twig');
}

const defaultOptions = {
  pathResolver: defaultPathResolver
};

function drupalDataTransformer(Twig, options) {
  if (!options) {
    options = {};
  }
  const cfg = Object.assign({}, defaultOptions, options);

  const pathResolver = cfg.pathResolver;

  function heritKeys(origin, destination, replaceSharp) {
    replaceSharp = replaceSharp === true;

    Object.keys(origin).map((key) => {
      if (key.indexOf('_') === 0) {
        destination[key] = origin[key];

        return;
      }

      const newkey = replaceSharp ? key.replace(/^#/, '') : key;

      destination[newkey] = toDrupalTwigJsData(origin[key]);
    });
  }

  function RenderElement(obj) {
    var newObject = {};

    heritKeys(obj, newObject, false);
    Reflect.deleteProperty(newObject, 'render element');
    this.renderElement = new RenderVar(newObject);
    this.renderElement[obj['render element']] = new RenderVar(newObject);
  }

  RenderElement.prototype.toString = function toString() {
    return this.renderElement.toString();
  };

  function RenderVar(obj) {
    // Remove first `#`
    heritKeys(obj, this, true);
  }

  RenderVar.prototype.toString = function toString() {
    let source = '';
    const filePath = pathResolver(this.theme);

    try {
      source = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      if (this.markup) {
        return this.markup;
      }
    }
    const template = Twig.twig({
      path: filePath,
      data: source
    });

    return template.render(this);
  };

  function RenderCollection(obj) {
    heritKeys(obj, this);
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
