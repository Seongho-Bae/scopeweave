const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const document = dom.window.document;

const wrapper = document.createElement('div');
const value = '<img src=x onerror=alert(1)>';
wrapper.append(value);
console.log(wrapper.innerHTML);
