import { computeDatasetDiff, normalizeValue } from "../src/ai/services/datasetDiff.service.js";

console.log("=================================================");
console.log("🧪 TESTING TIME-TRAVEL DATA DIFF ENGINE (GIT FOR WEB DATA)");
console.log("=================================================\n");

// Test 1: Normalization
console.log("Test 1: Currency & Value Normalization:");
const testValues = [
  ["$50M", "$50,000,000"],
  ["$250M", "250 million"],
  ["$1.5B", "$1500M"],
  ["Bengaluru, India", "bengaluru, india"]
];

testValues.forEach(([v1, v2]) => {
  const n1 = normalizeValue(v1);
  const n2 = normalizeValue(v2);
  const matched = n1 === n2;
  console.log(`  [${matched ? "PASS" : "FAIL"}] "${v1}" -> ${n1} vs "${v2}" -> ${n2}`);
});

// Test 2: Diff Computation with Add, Remove, Mutate, and Fuzzy Key Matching
console.log("\nTest 2: Dataset Diff Classification:");

const v1Records = [
  {
    company: "UnifyApps",
    founder: "Pavitar Singh",
    funding: "$20M",
    valuation: "$100M",
    location: "Gurugram, India"
  },
  {
    company: "Sarvam AI",
    founder: "Vivek Raghavan",
    funding: "$41M",
    valuation: "$200M",
    location: "Bengaluru, India"
  },
  {
    company: "OldStartup Delisted",
    founder: "John Doe",
    funding: "$5M",
    valuation: "$25M",
    location: "San Francisco, USA"
  }
];

const v2Records = [
  {
    company: "UnifyApps Inc.", // Fuzzy entity match test
    founder: "Pavitar Singh & Ragy Thomas", // Mutated
    funding: "$50M", // Mutated from $20M
    valuation: "$250M", // Mutated from $100M
    location: "Gurugram, India"
  },
  {
    company: "Sarvam AI", // Unchanged
    founder: "Vivek Raghavan",
    funding: "$41M",
    valuation: "$200M",
    location: "Bengaluru, India"
  },
  {
    company: "Krutrim AI", // Newly Added
    founder: "Bhavish Aggarwal",
    funding: "$50M",
    valuation: "$1B",
    location: "Bengaluru, India"
  }
];

const diff = computeDatasetDiff(v1Records, v2Records);

console.log("\n📊 Diff Summary Output:");
console.log(JSON.stringify(diff.summary, null, 2));

console.log("\n🟢 Added Records:", diff.diffs.added.map(r => r.company));
console.log("🔴 Removed Records:", diff.diffs.removed.map(r => r.company));
console.log("🟡 Mutated Records:", diff.diffs.mutated.map(r => `${r.company}: ${r._changes.map(c => `${c.field} (${c.oldValue} -> ${c.newValue})`).join(", ")}`));
console.log("⚪ Unchanged Records:", diff.diffs.unchanged.map(r => r.company));

// Assertions
if (
  diff.summary.addedCount === 1 &&
  diff.summary.removedCount === 1 &&
  diff.summary.mutatedCount === 1 &&
  diff.summary.unchangedCount === 1
) {
  console.log("\n✅ ALL TIME-TRAVEL DIFF ENGINE TESTS PASSED PERFECTLY!");
} else {
  console.error("\n❌ DIFF TEST UNEXPECTED RESULTS");
  process.exit(1);
}
