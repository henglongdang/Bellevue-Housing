import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStateReet, calculateReetScenario } from '../script.js';

test('calculates 2026 WA graduated state REET for $1.8M', () => {
  assert.equal(Math.round(calculateStateReet(1800000)), 26138);
});

test('calculates Bellevue versus 0.25% peer local REET difference', () => {
  const result = calculateReetScenario(1800000, 'king-assumption');
  assert.equal(result.bellevueLocal, 9000);
  assert.equal(result.peerLocal, 4500);
  assert.equal(result.extraLocal, 4500);
  assert.equal(Math.round(result.buyerGrossUp), 4523);
});

test('models Seattle as the same 0.50% local rate as Bellevue', () => {
  const result = calculateReetScenario(1800000, 'seattle');
  assert.equal(result.peerLocal, 9000);
  assert.equal(result.extraLocal, 0);
});
