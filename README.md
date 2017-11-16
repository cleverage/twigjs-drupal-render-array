# Twig drupal render array

This project provide a function to transform regular js object to equivalent to Drupal 8 `RenderArray`.


## Why?

We need to build static view from twig Drupal 8 template and fake data with node and twig.js.

But twig.js do not support some Drupal 8 behavior


## Install

```bash
npm install git@git.clever-age.net:yliechti/twig-drupal-render-array.git
```

> NB: this module should move to Github and be published on NPM

```javascript
const Twig = require('twig');
const dataTransformer = require('twig-drupal-render-array')(Twig, {
  pathResolver: (key) => {
    return key + '.html';
  }
});
```

## Use

```javascript
const data = {
  "#theme": "index",
  "#property": "Condimentum Pharetra",
  "#another_property": 666,
  "children": {
    "#theme": "partial",
    "#yolo": "Bibendum Ullamcorper Dolor",
    "otherChild": {
      "#theme": "partial",
      "#yolo": "second depht"
    }
  }
};

Twig.renderFile('myTemplate.html.twig', dataTransformer(data), (err, result) => {
  console.log(result);
});
```

## How it work

Twig.js use `.toString()` method to render an Object, so we create two new type of Object:

 * `RenderVar`: `.toString()` return render of twig file matching `#theme` entry with every var without `#`
 * `RenderElement`: `.toString()` return render of twig file matching `#theme` entry with data in a variable named by `render element` key from data
 * `RenderCollection`: `.toString()` return joined string of each children
