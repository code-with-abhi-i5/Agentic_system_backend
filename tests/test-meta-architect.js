import "dotenv/config";
import { planExecutionBlueprint } from "../src/ai/services/metaArchitect.service.js";

async function runTest() {
  console.log("🚀 Testing MetaArchitect Planner Service...\n");

  const prompt = "Find top 10 fast-growing Generative AI startups in India with founder names, total funding, and latest valuation.";
  console.log(`Prompt: "${prompt}"\n`);

  const start = Date.now();
  const res = await planExecutionBlueprint(prompt, { maxRecords: 10 });
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`\n⏱️ Blueprint generation duration: ${duration}s`);
  console.log("Result success:", res.success);
  console.log("Blueprint output:\n", JSON.stringify(res.blueprint, null, 2));

  if (res.blueprint && res.blueprint.searchVectors?.length >= 2) {
    console.log("\n✅ Test PASSED: MetaArchitect successfully generated real execution blueprint!");
  } else {
    console.log("\n❌ Test FAILED: Invalid blueprint structure.");
  }
}

runTest().catch(console.error);
