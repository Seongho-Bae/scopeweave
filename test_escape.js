const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html>`);
const document = dom.window.document;

const HTML_ESCAPE_ENTITIES = Object.assign(Object.create(null), {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_ENTITIES[character]);
}

const div1 = document.createElement('div');
div1.textContent = '<img src="x">';

const div2 = document.createElement('div');
div2.innerHTML = escapeHtml('<img src="x">');

console.log("textContent: ", div1.innerHTML); // What's the raw HTML?
console.log("innerHTML+escape: ", div2.innerHTML);
console.log("Match?", div1.innerHTML === div2.innerHTML);
