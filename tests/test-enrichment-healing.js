import { VisionSelfHealer } from "../src/ai/services/visionSelfHealer.service.js";

async function runEnrichmentTest() {
  console.log("🧪 Testing VisionSelfHealer.enrichEntityRecords...");

  const mockRecords = [
    {
      company: "Krutrim AI",
      founder: "N/A",
      funding: "N/A",
      headcount: "50-100",
      sourceUrl: "https://news.ycombinator.com"
    },
    {
      company: "Sarvam AI",
      founder: "Vivek Raghavan",
      funding: "$53M",
      sourceUrl: "https://news.ycombinator.com"
    }
  ];

  const searchResults = [
    {
      title: "Hacker News Tech Trends",
      url: "https://news.ycombinator.com",
      content: "Krutrim is an Indian AI unicorn founded by Bhavish Aggarwal that raised $50 million in funding."
    }
  ];

  const res = await VisionSelfHealer.enrichEntityRecords(mockRecords, {
    searchResults,
    maxPages: 1,
    onProgress: (msg, type) => {
      console.log(`  [Progress ${type || 'info'}]: ${msg}`);
    }
  });

  console.log("\n📊 Result:");
  console.log("Enriched Records Count:", res.enrichedRecords.length);
  console.log("Healed Count:", res.healedCount);
  console.log("Record 1 Founder:", res.enrichedRecords[0].founder);
  console.log("Record 1 Funding:", res.enrichedRecords[0].funding);

  console.log("\n✅ VisionSelfHealer integration test successful!");
  setTimeout(() => process.exit(0), 300);
}

runEnrichmentTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
