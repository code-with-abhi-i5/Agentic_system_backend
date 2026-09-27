import { adversarialAuditorNode } from "../src/ai/nodes/adversarialAuditor.node.js";

async function runTest() {
  console.log("🚀 Testing Red-Team Adversarial Auditor Node directly...\n");

  // Sample mock records (One with inflated funding claim, one accurate)
  const mockRecords = [
    {
      company: "Krutrim AI",
      founder: "Bhavish Aggarwal",
      funding: "$2 Billion",
      category: "Artificial Intelligence",
      confidence: 96,
      sourceUrl: "https://example-blog.com/krutrim-ai"
    },
    {
      company: "Sarvam AI",
      founder: "Pratyush Kumar & Vivek Raghavan",
      funding: "$41 Million",
      category: "Generative AI",
      confidence: 98,
      sourceUrl: "https://techcrunch.com/sarvam-ai"
    }
  ];

  console.log("Input Records:", JSON.stringify(mockRecords, null, 2));
  console.log("\n⚔️ Running Adversarial Cross-Examination...\n");

  const results = await adversarialAuditorNode(mockRecords, {
    maxAudits: 2,
    onProgress: (msg) => console.log(`  [Progress] ${msg}`)
  });

  console.log("\n================ AUDIT RESULTS ================");
  results.forEach((rec, idx) => {
    console.log(`\nEntity #${idx + 1}: ${rec.company}`);
    console.log(`Status: ${rec.verification?.status}`);
    console.log(`Score: ${rec.verification?.corroborationScore}%`);
    console.log(`Claimed Value: ${rec.verification?.claimedValue || "N/A"}`);
    console.log(`Counter Value: ${rec.verification?.counterValue || "N/A"}`);
    console.log(`Auditor Note: ${rec.verification?.auditReasoning}`);
  });
  console.log("\n================================================");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
