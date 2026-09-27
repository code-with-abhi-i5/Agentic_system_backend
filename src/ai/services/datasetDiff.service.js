import { distance } from "fastest-levenshtein";
import { logger } from "../../utils/logger.js";

/**
 * Normalizes numerical and currency strings to prevent false diff alerts.
 * E.g. "$50M", "$50,000,000", "50M USD" -> 50000000
 */
export const normalizeValue = (val) => {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();

  // Try extracting money / numbers with M / B / K multipliers
  const moneyMatch = str.match(/(?:[\$€£₹]\s*)?([\d,.]+)\s*(m|b|k|million|billion|thousand)?\b/i);
  if (moneyMatch && moneyMatch[1]) {
    const rawNum = parseFloat(moneyMatch[1].replace(/,/g, ""));
    const unit = (moneyMatch[2] || "").toLowerCase();
    if (!isNaN(rawNum)) {
      if (unit === "b" || unit === "billion") return Math.round(rawNum * 1e9);
      if (unit === "m" || unit === "million") return Math.round(rawNum * 1e6);
      if (unit === "k" || unit === "thousand") return Math.round(rawNum * 1e3);
      return Math.round(rawNum);
    }
  }

  return str.toLowerCase().replace(/\s+/g, " ");
};

/**
 * Cleans entity names by removing corporate suffixes, punctuation and excess whitespace.
 * E.g. "UnifyApps Inc." -> "unifyapps", "Sarvam AI Pvt. Ltd." -> "sarvam ai"
 */
export const cleanEntityKey = (str = "") => {
  return String(str)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\b(inc|incorporated|llc|ltd|limited|corp|corporation|technologies|technology|tech|pvt|co|company)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Gets the primary identifying key for a record (company, name, title)
 */
export const getEntityKey = (record) => {
  if (!record || typeof record !== "object") return "";
  const key = record.company || record.name || record.title || Object.values(record)[0] || "";
  return String(key).trim();
};

/**
 * Computes a Git-Style Time-Travel Diff between two dataset versions.
 * 
 * Classifies:
 * - 🟢 Added: Newly discovered records in newDataset
 * - 🔴 Removed: Delisted or vanished records from oldDataset
 * - 🟡 Mutated: Matched records with modified attributes (with old vs new values)
 * - ⚪ Unchanged: Records with identical contents
 */
export const computeDatasetDiff = (oldRecords = [], newRecords = []) => {
  logger.info(`⏳ [Time-Travel Diff Engine] Comparing ${oldRecords.length} old records vs ${newRecords.length} new records...`);

  const oldMap = new Map();
  oldRecords.forEach((rec, idx) => {
    const rawKey = getEntityKey(rec);
    const cleaned = cleanEntityKey(rawKey);
    if (cleaned) {
      oldMap.set(cleaned, { record: rec, index: idx, rawKey });
    }
  });

  const added = [];
  const mutated = [];
  const unchanged = [];
  const matchedOldKeys = new Set();

  for (const newRec of newRecords) {
    const newRawKey = getEntityKey(newRec);
    const newCleanKey = cleanEntityKey(newRawKey);
    if (!newCleanKey) {
      added.push({ ...newRec, _diffType: "ADDED" });
      continue;
    }

    // Step 1: Exact match on cleaned entity key
    let match = oldMap.get(newCleanKey);
    let matchedKey = newCleanKey;

    // Step 2: Containment or Fuzzy match fallback using Levenshtein distance
    if (!match) {
      for (const [existingCleanKey, existingData] of oldMap.entries()) {
        if (matchedOldKeys.has(existingCleanKey)) continue;

        // Substring / containment check for brand names (e.g. "sarvam" in "sarvam ai")
        if (
          (newCleanKey.length > 3 && existingCleanKey.includes(newCleanKey)) ||
          (existingCleanKey.length > 3 && newCleanKey.includes(existingCleanKey))
        ) {
          match = existingData;
          matchedKey = existingCleanKey;
          break;
        }

        const dist = distance(newCleanKey, existingCleanKey);
        const maxLen = Math.max(newCleanKey.length, existingCleanKey.length);
        const similarity = 1 - dist / maxLen;

        if (similarity > 0.80) {
          match = existingData;
          matchedKey = existingCleanKey;
          break;
        }
      }
    }

    if (!match) {
      // Entity did not exist in old version -> ADDED 🟢
      added.push({ ...newRec, _diffType: "ADDED" });
    } else {
      matchedOldKeys.add(matchedKey);
      const oldRec = match.record;

      // Compare attributes to check for mutations 🟡
      const changes = [];
      const ignoredFields = new Set(["id", "_id", "confidence", "scrapedAt", "status", "verification"]);

      const allKeys = new Set([...Object.keys(oldRec), ...Object.keys(newRec)]);
      for (const field of allKeys) {
        if (ignoredFields.has(field)) continue;

        const oldVal = oldRec[field];
        const newVal = newRec[field];

        const normOld = normalizeValue(oldVal);
        const normNew = normalizeValue(newVal);

        if (normOld !== normNew && (oldVal !== undefined || newVal !== undefined)) {
          changes.push({
            field,
            oldValue: oldVal !== undefined ? oldVal : "—",
            newValue: newVal !== undefined ? newVal : "—"
          });
        }
      }

      if (changes.length > 0) {
        mutated.push({
          ...newRec,
          _diffType: "MUTATED",
          _changes: changes,
          _previousRecord: oldRec
        });
      } else {
        unchanged.push({ ...newRec, _diffType: "UNCHANGED" });
      }
    }
  }

  // Any old records that were never matched are REMOVED 🔴
  const removed = [];
  for (const [key, data] of oldMap.entries()) {
    if (!matchedOldKeys.has(key)) {
      removed.push({ ...data.record, _diffType: "REMOVED" });
    }
  }

  const totalCompared = Math.max(oldRecords.length, newRecords.length) || 1;
  const changedCount = added.length + removed.length + mutated.length;
  const driftPercentage = Math.round((changedCount / totalCompared) * 1000) / 10;

  logger.info(`✨ [Diff Engine Complete] +${added.length} Added, -${removed.length} Removed, ~${mutated.length} Mutated (Drift: ${driftPercentage}%)`);

  return {
    summary: {
      totalOld: oldRecords.length,
      totalNew: newRecords.length,
      addedCount: added.length,
      removedCount: removed.length,
      mutatedCount: mutated.length,
      unchangedCount: unchanged.length,
      driftPercentage
    },
    diffs: {
      added,
      removed,
      mutated,
      unchanged
    },
    allRecordsWithDiff: [
      ...added,
      ...mutated,
      ...removed,
      ...unchanged
    ]
  };
};
