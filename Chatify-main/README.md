# Chatify Web 🌐💬

Chatify is a real-time chat application that breaks down language barriers, allowing users to communicate effortlessly across different languages. With automatic message translation powered by Gemini API, user authentication, and a sleek, responsive interface, Chatify brings people together in a global conversation.

## ✨ Features

- 🚀 Real-time messaging
- 🌍 Automatic message translation
- 🔐 User authentication and profile management
- 📱 Responsive design for desktop and mobile devices
- 🔍 Recent conversations and user search functionality
- 🗣️ Language change notifications for contacts
- 🔄 Option to regenerate translations
- 👁️ View original message functionality

## 🚀 Getting Started

Follow these steps to set up Chatify Web on your local machine:

1. **Clone the repository or download as ZIP:**

2. **Set up API key:**
   Create a `secrets.toml` file in the root directory and this line with your Gemini API key:
   ```toml
   GEMINI_API_KEY = "your_gemini_api_key"
   ```
   (You can ask Makizz for the key 😉)

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Start the development server:**
   ```
   npm run dev
   ```
## 🛠️ Technologies Used

- Frontend: Vite + React
- Styling: MUI
- Authentication: Firebase Auth
- Translation: Gemini Generative AI
- Real-time Communication: Firebase Realtime Database

