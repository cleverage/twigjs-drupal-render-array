/**
 * Module dependencies.
 */
const Twig = require('twig');
const fs = require('fs');
const dataParser = require('../')(Twig);
const chai = require('chai');
const expect = chai.expect;

chai.should();

describe('integration', () => {

  /**
   * Read test/cases directory and filter all `.json` files, then remove
   * this extension for each file in the collection and prepare to test.
   */
  const cases = fs.readdirSync('test/cases').filter((file) => {
    return file.indexOf('.json') !== -1;
  })
  .map((file) => {
    return file.replace('.json', '');
  });

  /*
   * For each `.json` and `.html` pair in `test/cases`, transform json to js object
   * to fill index.html.twig template and compare actual result to expected html.
   */
  cases.forEach((test) => {
    const name = test.replace(/[-.]/g, ' ');

    it(name, (done) => {
      const html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').replace(/\r/g, '').trim();

      Twig.renderFile('test/twig/index.html.twig', dataParser(require('./cases/' + test + '.json')), (err, result) => {
        expect(err).to.equal(null);
        result.trim().should.equal(html);
        done();
      });
    });
  });
});
