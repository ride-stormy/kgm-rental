/**
 * lib/control/loop-breaker.js
 *
 * Session-level loop breaker. Tracks repetitive actions and enforces limits
 * to prevent infinite loops in file edits, PDCA iterations, and agent recursion.
 *
 * Pure JavaScript (CommonJS). No external dependencies.
 */

'use strict';

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------
const LIMITS = {
  file_edit: 10,        // maxSameFileEdits — per target
  pdca_iteration: 5,    // maxPdcaIterations
  agent_recursion: 3,   // maxAgentRecursion
};

const COOLDOWN_MS = 60000; // 1 minute

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** @type {Record<string, number>} counts keyed by "actionType" or "actionType:target" */
let counts = Object.create(null);

/** @type {number|null} timestamp (Date.now()) when breach was first detected */
let breachTimestamp = null;

/** @type {{ type: string, count: number, limit: number }|null} cached breach info */
let breachCache = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the counter key for a given action.
 * file_edit actions are tracked per-target; others use actionType alone.
 */
function counterKey(actionType, target) {
  if (actionType === 'file_edit' && target) {
    return 'file_edit:' + target;
  }
  return actionType;
}

/**
 * Return the limit for the given actionType, or undefined if unknown.
 */
function limitFor(actionType) {
  return LIMITS[actionType];
}

/**
 * Scan all counters and return breach info for the first one that exceeds its limit.
 * Returns null if nothing is breached.
 */
function findBreach() {
  const keys = Object.keys(counts);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const actionType = key.split(':')[0];
    const limit = limitFor(actionType);
    if (limit !== undefined && counts[key] >= limit) {
      return { type: actionType, count: counts[key], limit: limit };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record an action occurrence.
 *
 * @param {'file_edit'|'pdca_iteration'|'agent_recursion'} actionType
 * @param {string} [target] — file path (required for file_edit, ignored otherwise)
 */
function recordAction(actionType, target) {
  const key = counterKey(actionType, target);
  if (!counts[key]) {
    counts[key] = 0;
  }
  counts[key] += 1;

  // If this record caused a new breach, mark the timestamp
  if (breachTimestamp === null) {
    const breach = findBreach();
    if (breach) {
      breachTimestamp = Date.now();
      breachCache = breach;
    }
  } else {
    // Update breach cache in case a higher count appeared
    breachCache = findBreach();
  }
}

/**
 * Check whether any limit has been breached.
 * If the cooldown period has elapsed since the breach, auto-resets and returns false.
 *
 * @returns {boolean}
 */
function isBreached() {
  if (breachTimestamp === null) {
    return false;
  }

  // Cooldown: auto-reset if enough time has passed
  if (Date.now() - breachTimestamp >= COOLDOWN_MS) {
    reset();
    return false;
  }

  return true;
}

/**
 * Get information about the current breach.
 *
 * @returns {{ type: string, count: number, limit: number }|null}
 */
function getBreachInfo() {
  if (!isBreached()) {
    return null;
  }
  return breachCache;
}

/**
 * Reset all counters and breach state.
 */
function reset() {
  counts = Object.create(null);
  breachTimestamp = null;
  breachCache = null;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = { recordAction, isBreached, getBreachInfo, reset };
