import 'dotenv/config';

// Script to debug OpenRouter connection using raw FETCH (no SDK)

async function testConnection() {
    const key = process.env.OPENROUTER_API_KEY;
    const model = process.env.LLM_MODEL || "openai/gpt-oss-120b:free"; // Using the model you selected

    console.log("----------------------------------------");
    console.log("🔍 Debugging OpenRouter Connection");
    console.log(`🔑 Key length: ${key?.length ?? 0}`);
    console.log(`🤖 Model: ${model}`);
    console.log("----------------------------------------");

    if (!key) {
        console.error("❌ Error: OPENROUTER_API_KEY is missing in .env");
        return;
    }

    try {
        console.log("📡 Sending request via FETCH...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Termind Debug"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "user", content: "Hello! Are you working?" }
                ]
            })
        });

        if (!response.ok) {
            console.error(`\n❌ Request Failed with Status: ${response.status}`);
            console.error("Raw Error Body:");
            console.log(await response.text());
            console.log("\n👉 DIAGNOSIS: This confirms the error is coming from OpenRouter servers, not the SDK.");
            return;
        }

        const data = await response.json();
        console.log("\n✅ SUCCESS! Received response:");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("\n❌ Network Error:", error);
    }
}

testConnection();
