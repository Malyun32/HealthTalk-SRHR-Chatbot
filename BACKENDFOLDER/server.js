const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HealthTalk API is running' });
});

// Chat API
app.post('/api/chat', async (req, res) => {
  const userMsg = req.body.messages?.[req.body.messages.length - 1];

  console.log("\n🔥 Incoming request");
  console.log("User asked:", userMsg?.content);

  try {
    const bodyData = {
      contents: [
        {
          role: "user",
          parts: [{ text: userMsg.content }]
        }
      ]
    };

    // ✔ FIXED MODEL NAME
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();
    console.log("📥 API Response:", data);

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.json({ reply: "Sorry, I couldn't generate a response." });
    }
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-port handling
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    fs.writeFileSync('backend-port.json', JSON.stringify({ port }));
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} in use... trying ${port + 1}`);
      startServer(port + 1);
    }
  });
}

startServer(5000);
