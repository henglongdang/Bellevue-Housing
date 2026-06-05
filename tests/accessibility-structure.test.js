import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');

assert.match(html, /<a class="skip-link" href="#main-content">Skip to content<\/a>/);
assert.match(html, /<nav class="navbar" aria-label="Primary navigation">/);
assert.match(html, /<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">/);
assert.match(html, /<main id="main-content">/);
assert.match(html, /<label for="sale-price">Target sale price<\/label>/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /alt="Open house sign-in sheet sample with redacted visitor details"/);
console.log('Static accessibility structure checks passed.');
