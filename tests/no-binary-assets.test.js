import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const allowedTextExtensions = new Set(['.svg', '.txt', '.pdf']);

test('assets directory contains only text-reviewable placeholder assets, including ASCII PDF artifacts', () => {
  for (const filename of readdirSync('assets')) {
    const extension = filename.slice(filename.lastIndexOf('.'));
    assert.ok(allowedTextExtensions.has(extension), `${filename} should be a text asset, not a binary asset`);
    assert.doesNotThrow(() => readFileSync(join('assets', filename), 'utf8'), `${filename} should decode as UTF-8`);
  }
});
