import "dotenv/config";

async function testExtractionE2E() {
  console.log("🚀 Testing End-to-End Extraction with Real MetaArchitect Planner...\n");

  const prompt = "Top 5 AI coding assistants";
  console.log(`Sending extraction request for prompt: "${prompt}"...`);

  const response = await fetch("http://localhost:5000/api/tasks/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxRecords: 5, strictDeduplication: true })
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${await response.text()}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  console.log("\n📡 Streaming SSE Events from Backend:");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop(); // keep partial

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === "log") {
            console.log(`  [${event.log.agent}] ${event.log.msg}`);
          } else if (event.type === "status") {
            console.log(`  ⚙️ Status: ${event.status}`);
          } else if (event.type === "schema_review") {
            console.log(`\n🎉 Received Schema Review event with ${event.proposedSchema?.length} fields!`);
            console.log(`  Proposed Fields: ${event.proposedSchema?.map(f => f.name).join(", ")}`);
            return; // Finished test!
          } else if (event.type === "dataset") {
            console.log(`\n🎉 Extracted dataset with ${event.dataset?.records?.length} records!`);
            return;
          }
        } catch (e) {
          // ignore parsing error for comments/keep-alive
        }
      }
    }
  }
}

testExtractionE2E().catch(console.error);
