/**
 * This is your secure serverless function (the proxy).
 * It runs on Netlify's servers, not in the browser.
 * It safely uses your Gemini API key, which is stored as an environment variable.
 */

export default async (req) => {
    // 1. Get the secret Gemini API key from environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: "Server configuration error: Missing API key." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: "Method not allowed." }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 2. Get the rawText and images from the client's request
        const { rawText, images } = await req.json();
        if (!rawText && (!images || images.length === 0)) {
            return new Response(JSON.stringify({ error: "No text or images provided." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

        // 3. Construct the same system prompt and payload here, on the server
        const systemPrompt = `You are an expert financial assistant. Your task is to extract expense information from unstructured text and images (receipts/bills).
- Today's date is ${new Date().toLocaleDateString()}.
- The year is ${new Date().getFullYear()}.
- All expenses are in Rupees (₹).
- Convert relative dates (e.g., "yesterday", "last Friday") into an absolute "YYYY-MM-DD" format.
- Infer the category (e.g., "Food", "Transport", "Utilities", "Shopping", "Entertainment", "Other").
- The text may contain non-expense items; ignore them.

Return ONLY a valid JSON array of objects. Each object must have:
1.  "date" (string, "YYYY-MM-DD")
2.  "item" (string)
3.  "price" (number)
4.  "category" (string)

Example:
Text: "coffee ₹150.50 yesterday, Uber ₹450"
JSON:
[
  {"date": "2025-11-04", "item": "Coffee", "price": 150.50, "category": "Food"},
  {"date": "2025-11-05", "item": "Uber ride", "price": 450.00, "category": "Transport"}
]`;

        // Construct parts array (Text + Images)
        const parts = [{ text: rawText || "" }];

        if (images && Array.isArray(images)) {
            images.forEach(img => {
                if (img.data && img.mimeType) {
                    parts.push({
                        inlineData: {
                            mimeType: img.mimeType,
                            data: img.data
                        }
                    });
                }
            });
        }

        const payload = {
            contents: [{
                parts: parts
            }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "date": { "type": "STRING" },
                            "item": { "type": "STRING" },
                            "price": { "type": "NUMBER" },
                            "category": { "type": "STRING" }
                        },
                        required: ["date", "item", "price", "category"]
                    }
                }
            }
        };

        // 4. Call the Gemini API securely from the server
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            console.error("Gemini API Error:", errorData);
            return new Response(JSON.stringify({ error: `Gemini API Error: ${errorData?.error?.message || geminiResponse.statusText}` }), {
                status: geminiResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await geminiResponse.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            // 5. Send the successful, parsed response back to the client
            const jsonText = candidate.content.parts[0].text;
            return new Response(JSON.stringify({ expenses: JSON.parse(jsonText) }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            console.error("Invalid API response structure:", result);
            return new Response(JSON.stringify({ error: "Failed to get a valid response from the AI." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
