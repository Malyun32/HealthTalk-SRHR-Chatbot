const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 🟢 HEALTH CHECK
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HealthTalk API is running' });
});

// ----------------------------------------------------
// 🟣 CHAT API (POST)
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const messages = req.body.messages;
  const userMsg = messages?.[messages.length - 1];

  console.log("\n🔥 Incoming Chat Request");
  console.log("User asked:", userMsg?.content);

  if (!userMsg || !userMsg.content) {
    return res.status(400).json({ error: "messages is required" });
  }

  try {
    const bodyData = {
      contents: [
        {
          role: "user",
          parts: [{ text: userMsg.content }]
        }
      ]
    };

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();
    console.log("📥 Gemini API Response:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply });

  } catch (error) {
    console.error("❌ Chat API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// 🟡 SERVER PORT (Render requirement)
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
