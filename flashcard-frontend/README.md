# Flashcard Study App - Frontend

A modern flashcard study application built with React, Vite, and Tailwind CSS. Provides a spaced repetition study interface and easy card management.

![Tech Stack](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC)

## Features

### Study Mode

- **One card at a time** - Focus on learning without distractions
- **Progress tracking** - Visual progress bar showing completion
- **Feedback** - Mark cards as "Remembered" or "Forgot"

### Add Cards

- **Single card mode** - Add one flashcard at a time
- **Bulk upload mode** - Add multiple cards at once using simple text format

### Prerequisites

- Node.js 16.x or higher
- npm 6.x or higher
- Backend API running (default: `http://localhost:3000`)

### Installation

1. **Clone the repository**

   ```bash
   cd flashcard-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure backend URL**

   Edit the `API_BASE` constant `.env.development` used in:

   - `src/StudyPage.jsx`
   - `src/UploadPage.jsx`

   ```javascript
   const VITE_API_BASE = "http://localhost:3000"; // Default
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## Project Structure

```
flashcard-frontend/
├── src/
│   ├── App.jsx           # Main app with routing
│   ├── StudyPage.jsx     # Flashcard study interface
│   ├── UploadPage.jsx    # Card upload interface
│   ├── index.css         # Tailwind CSS imports
│   └── main.jsx          # React entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── vite.config.js        # Vite configuration
```

## Usage

### Studying Cards

1. Navigate to the home page (`/`)
2. Click "Show Answer" to reveal the translation
3. Mark whether you remembered or forgot the word
4. Continue through all cards
5. Click "Review Again" to restart

### Adding Cards
Features Single card mode and Bulk upload mode

**Example:**

```
hund | dog
katt | cat
äpple | apple
banan | banana
```

## Configuration

### Backend API Endpoints

The frontend expects these endpoints:

- `GET /cards/next` - Returns a list of cards to study

  ```json
  {
    "cards": [{ "id": 1, "front": "hund", "back": "dog", "difficulty": 12.5 }]
  }
  ```

- `POST /cards/:id/review` - Records user's review

  ```json
  { "remembered": true }
  ```

- `POST /cards` - Adds new cards (single or bulk)

  ```json
  // Single card
  { "front": "hund", "back": "dog" }

  // Bulk upload
  { "cards": [
      { "front": "hund", "back": "dog" },
      { "front": "katt", "back": "cat" }
    ]
  }
  ```

### CORS Configuration

Backend must allow requests from the frontend origin. Example for Fastify:

```javascript
await fastify.register(require("@fastify/cors"), {
  origin: "http://localhost:5173",
});
```

### Styling Components

The app uses Tailwind utility classes. Key color classes:

- `bg-purple-600` - Purple backgrounds
- `text-purple-300` - Purple text
- `bg-gray-800` - Dark backgrounds
- `border-purple-500` - Purple borders

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

