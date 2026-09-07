export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, vibe, lang } = req.body;
    
    // आपकी API Key
    const apiKey = "AQ.Ab8RN6ICXtSbQd-9NySI6G1VX-VmT30W2SYYOgrDU1P0PgfafA";

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured on server' });
    }

    let promptText = "";
    const randomSeed = Math.floor(Math.random() * 100000);
    const isStandardVibe = ['savage', 'mild', 'praise', 'breakup'].includes(vibe);

    if (!isStandardVibe) {
        if (lang === 'english') {
            promptText = `Create a funny, savage or witty roast/vibe for "${name}" based on this specific custom situation/topic: "${vibe}" (Variant ID: ${randomSeed}). Use witty English Gen-Z internet slang, emojis, max 2 lines. Keep it clean, unique, and fresh.`;
        } else {
            promptText = `"${name}" के लिए इस खास टॉपिक या सिचुएशन पर एक बिल्कुल नया और धांसू Hinglish रोस्ट/वाइब लिखें: "${vibe}" (Variant ID: ${randomSeed}). Gen-Z इंटरनेट स्लैंग और इमोजी का इस्तेमाल करें, 2 लाइन से छोटा हो, साफ-सुथरा और यूनिक हो।`;
        }
    } else {
        if (lang === 'english') {
            if (vibe === 'savage') {
                promptText = `Create an ultra-funny, savage, never-seen-before roast for "${name}" (Variant ID: ${randomSeed}). Use witty English Gen-Z internet slang, emojis, max 2 lines. Keep it clean and unique.`;
            } else if (vibe === 'mild') {
                promptText = `Create a light, witty, friendly tease for "${name}" (Variant ID: ${randomSeed}). Use nice emojis, max 2 lines. Keep it unique and clean.`;
            } else if (vibe === 'praise') {
                promptText = `Create a heartwarming, unique sweet compliment for "${name}" (Variant ID: ${randomSeed}). Use nice emojis, max 2 lines.`;
            } else {
                promptText = `Create a funny, sarcastic single-life or dating-app joke for "${name}" (Variant ID: ${randomSeed}). Max 2 lines with emojis.`;
            }
        } else {
            if (vibe === 'savage') {
                promptText = `एक बिल्कुल नया, मजेदार और धांसू Hinglish रोस्ट "${name}" के लिए लिखें जो पहले कभी न आया हो (Variant ID: ${randomSeed}). Gen-Z इंटरनेट स्लैंग और इमोजी का इस्तेमाल करें, 2 लाइन से छोटा हो, साफ-सुथरा और यूनिक हो।`;
            } else if (vibe === 'mild') {
                promptText = `एक हल्की-फुल्की और मजेदार Hinglish खिंचाई "${name}" के लिए लिखें (Variant ID: ${randomSeed}). अच्छे इमोजी के साथ 2 लाइन से कम में लिखें।`;
            } else if (vibe === 'praise') {
                promptText = `"${name}" के लिए एक प्यारी और दिल को छू लेने वाली Hinglish तारीफ लिखें (Variant ID: ${randomSeed}). 2 लाइन से छोटा हो।`;
            } else {
                promptText = `"${name}" के लिए सिंगल लाइफ या ब्रेकअप पर एक मजेदार व्यंग्य Hinglish में लिखें (Variant ID: ${randomSeed}). 2 लाइन से छोटा हो।`;
            }
        }
    }

    try {
        // यहाँ हम सीधे v1 एंडपॉइंट और सही बॉडी स्ट्रक्चर का उपयोग कर रहे हैं
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        });

        const data = await googleResponse.json();

        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(200).json({ reply: `API Error: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiReply = data.candidates[0].content.parts[0].text.trim();
            return res.status(200).json({ reply: aiReply });
        } else {
            return res.status(200).json({ reply: `${name}, AI अभी मूड में है, दोबारा क्लिक करो फिर आएगा मज़ा! 😂🔥` });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: 'Failed to connect to AI server' });
    }
}
