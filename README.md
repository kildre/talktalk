# TalkTalk 🗨️

A modern chat interface built with React, TypeScript, and Material-UI that connects to an AWS Bedrock backend powered by Claude 3.7 Sonnet.

## Features

- 💬 Real-time chat interface with AI assistant
- 🎨 Light/Dark theme support
- 📱 Responsive design with mobile-friendly sidebar
- 💾 Conversation management and history
- 🔄 Loading states and error handling
- ✨ Markdown support for rich text responses
- 🎯 Code syntax highlighting

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Zustand** - State management
- **React Markdown** - Markdown rendering
- **AWS Bedrock** - AI backend (Claude 3.7 Sonnet)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/talktalk.git
cd talktalk
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ChatInput.tsx
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   └── Sidebar.tsx
├── services/         # API services
│   └── api.ts
├── store/            # Zustand store
│   └── chatStore.ts
├── theme/            # MUI theme configuration
│   └── index.ts
├── types/            # TypeScript types
│   └── chat.ts
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## API Integration

The frontend connects to your backend via the `/api/chat` endpoint. Make sure your backend is running and accessible at the URL specified in your `.env` file.

Expected API format:
```typescript
// Request
POST /api/chat
{
  "message": "User message",
  "conversationId": "optional-id",
  "history": [...]
}

// Response
{
  "response": "AI response",
  "conversationId": "id"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Related

- Backend Repository: [Link to your backend repo]

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
