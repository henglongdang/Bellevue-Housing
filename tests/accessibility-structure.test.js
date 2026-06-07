import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync('index.html', 'utf8');

assert.match(html, /<a class="skip-link" href="#main-content">Skip to content<\/a>/);
assert.match(html, /<nav class="nav" aria-label="Primary navigation">/);
assert.match(html, /<div class="nav-links">/);
assert.match(html, /<main id="main-content">/);
assert.match(html, /<label for="sale-price">Sale price<\/label>/);
assert.match(html, /<label for="place">Local jurisdiction<\/label>/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /<section class="hero">/);
assert.match(html, /<script src="site.js"><\/script>/);
console.log('Static accessibility structure checks passed.');
