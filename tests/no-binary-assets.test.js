import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const allowedTextExtensions = new Set(['.svg', '.txt', '.pdf']);
const allowedBinaryExtensions = new Set(['.png']);

test('assets directory contains only supported web assets', () => {
  for (const filename of readdirSync('assets')) {
    const extension = filename.slice(filename.lastIndexOf('.'));
    assert.ok(
      allowedTextExtensions.has(extension) || allowedBinaryExtensions.has(extension),
      `${filename} should be a supported static asset type`
    );

    if (allowedTextExtensions.has(extension)) {
      assert.doesNotThrow(() => readFileSync(join('assets', filename), 'utf8'), `${filename} should decode as UTF-8`);
    } else {
      assert.ok(readFileSync(join('assets', filename)).length > 0, `${filename} should not be empty`);
    }
  }
});
