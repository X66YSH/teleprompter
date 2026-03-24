# Teleprompter

A transparent, always-on-top desktop teleprompter for job interviews. Keep your talking points visible on screen while you focus on the conversation.

![Electron](https://img.shields.io/badge/Electron-35+-blue) ![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

## Features

- **Always-on-top** transparent overlay — stays visible over Zoom, Teams, etc.
- **Per-question layout** — organized by interview question, not a wall of text
- **Adjustable opacity** — slide to find the right balance
- **Compact mode** — toggle smaller text when you need more content on screen
- **Easy to customize** — just edit `content.json`, no code changes needed

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/teleprompter.git
cd teleprompter

# Install dependencies
npm install

# Copy the example content and customize it
cp content.example.json content.json

# Run
npm start
```

## Customize Your Content

Edit `content.json` to add your own talking points:

```json
{
  "reminders": ["Speak slowly", "Pause before answering"],
  "questions": [
    {
      "title": "Q1: Tell me about yourself",
      "text": "Your answer here..."
    }
  ],
  "sections": [
    {
      "title": "Questions to Ask",
      "items": ["What does the team look like?"]
    }
  ]
}
```

- **reminders** — warning banners shown at the top
- **questions** — each has a `title` and `text`
- **sections** — additional lists (e.g., your questions for the interviewer)

## License

MIT
