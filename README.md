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
- 📸 Profile image upload and management
- 🔄 Real-time online/offline status

### Frontend
- Vite + React - Fast and modern build tool and UI library
- MUI (Material-UI) - Comprehensive UI component library
- Framer Motion - Animation library for smooth transitions

### Backend (Firebase Services)
- Firebase Authentication - User management and authentication
- Firebase Realtime Database - Real-time data synchronization
- Firebase Storage - File storage for profile images
- Gemini Generative AI - Advanced message translation


## 🚀 Getting Started

Follow these steps to set up Chatify Web on your local machine:

1. **Clone the repository or download as ZIP:**

2. **Set up Gemini API key:**
   Create a `secrets.toml` file in the root directory and add this line with your Gemini API key:
   ```toml
   GEMINI_API_KEY = "your_gemini_api_key"
   ```
   (You can also use our api key just extract gemini_api_key.zip at its current path)

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Start the development server:**
   ```
   npm run dev
   ```
