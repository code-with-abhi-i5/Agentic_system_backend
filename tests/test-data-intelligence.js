import { dataDeduplicatorNode } from "../src/ai/nodes/dataDeduplicator.node.js";
import { Parser } from "json2csv";

console.log("🧪 Testing AI-Powered Data Intelligence Backend Engine...");

// 1. Test Deduplicator & Levenshtein Logic
const mockRawRecords = [
  {
    company: "NeuralPulse AI",
    founder: "Dr. Arvind Rao",
    email: "arvind@neuralpulse.io",
    location: "Bangalore",
    funding: "$8.5M",
    sourceUrl: "https://techcrunch.com/2026/neuralpulse",
    sourceDomain: "techcrunch.com",
    snippet: "NeuralPulse AI Bangalore founded by Dr. Arvind Rao..."
  },
  {
    // Exact Email Duplicate
    company: "Neural Pulse Artificial Intelligence",
    founder: "Dr. Arvind Rao",
    email: "arvind@neuralpulse.io",
    location: "Bangalore, India",
    sourceUrl: "https://twitter.com/arvindrao",
    sourceDomain: "twitter.com"
  },
  {
    company: "OmniScrape Cloud",
    founder: "Sarah Jenkins",
    email: "sarah@omniscrape.dev",
    location: "San Francisco",
    funding: "$14.2M",
    sourceUrl: "https://ycombinator.com/omniscrape",
    sourceDomain: "ycombinator.com",
    snippet: "OmniScrape Cloud cluster by Sarah Jenkins..."
  }
];

const dedupResult = await dataDeduplicatorNode({ extractedRecords: mockRawRecords });

console.log("✅ Deduplicator Execution Successful!");
console.log(`   - Input records: ${mockRawRecords.length}`);
console.log(`   - Output clean records: ${dedupResult.cleanRecords.length}`);
console.log(`   - Duplicates removed: ${dedupResult.stats.duplicatesRemoved}`);
console.log(`   - Sources count: ${dedupResult.stats.sourcesCount}`);
console.log(`   - Confidence score: ${dedupResult.cleanRecords[0].confidence}%`);

if (dedupResult.stats.duplicatesRemoved !== 1) {
  throw new Error("Deduplication test failed: Expected 1 duplicate removed.");
}

// 2. Test CSV Export Parsing
const parser = new Parser({
  fields: ["company", "founder", "email", "location", "confidence", "sourceUrl"]
});
const csvOutput = parser.parse(dedupResult.cleanRecords);
console.log("✅ JSON2CSV Engine Output Generated:");
console.log(csvOutput.split("\n").slice(0, 3).join("\n"));

console.log("\n🎉 ALL BACKEND DATA INTELLIGENCE MODULES PASSED WITH 0 ERRORS!");
process.exit(0);
