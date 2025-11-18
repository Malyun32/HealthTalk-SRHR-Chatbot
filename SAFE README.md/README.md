# HealthTalk – SRHR Chatbot

A simple and friendly SRHR (Sexual & Reproductive Health and Rights) chatbot built using:

- React (Frontend)
- Node.js + Express (Backend)
- Google Gemini API (AI responses)

---

## 🚀 Features

- Modern chat UI with user + bot bubbles
- Quick SRHR topic buttons
- Typing animation
- Trusted SRHR resources sidebar
- Responsive for phones
- Clear chat button
- Send message on Enter

---

## 🖥️ Project Structure

SRHRCHATBOX/
│
├── BACKENDFOLDER/
│ ├── server.js
│ ├── package.json
│ ├── .gitignore
│ ├── .env ← (NOT included on GitHub)
│
└── FRONTENDFOLDER/
├── src/
│ ├── App.js
│ ├── App.css
├── package.json
├── .gitignore

---

## 🔐 API Key Setup (VERY IMPORTANT)

This project uses **Google Gemini API**.

Before running the backend, create a `.env` file inside **BACKENDFOLDER**:

PORT=5000
GEMINI_API_KEY=YOUR_API_KEY_HERE

⚠️ **Do NOT commit this file to GitHub.**

---

## ▶️ Running the Project

### 1️⃣ Install backend dependencies
cd BACKENDFOLDER
npm install
node server.js
🚀 Server running on port 5000

2️⃣ Install frontend dependencies
cd FRONTENDFOLDER
npm install
npm start

This will automatically open:

http://localhost:3000

🛠️ Technologies Used

React – UI framework

Node.js + Express – Backend server

Google Gemini API – AI responses

CSS3 – Styling

React Markdown – For clean message formatting

📚 Trusted SRHR Resources

This chatbot encourages accurate SRHR learning. Trusted sources integrated in the sidebar include:

WHO – Sexual & Reproductive Health

UNFPA – Youth SRHR

UNICEF – Adolescent Health

Planned Parenthood

AMREF Health Africa

🤝 License
This project is created for educational and community empowerment purposes.
You may modify or extend it for non-commercial projects.

❤️ Acknowledgements

This project was created to support young people with accurate, friendly, and stigma-free SRHR information.
