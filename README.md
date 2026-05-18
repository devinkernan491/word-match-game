# English-Spanish Word Matching Game

An interactive desktop game built with Electron where players match English and Spanish words that bounce across the screen.

## Features

✨ **Core Gameplay:**
- Click on an English word, then click on its Spanish translation to match
- Words bounce dynamically across the screen with physics simulation
- 800+ common English-Spanish word pairs
- Adaptive difficulty system

🎮 **Adaptive Difficulty:**
- Starts with 5 word pairs on screen
- Increases number of pairs and bounce speed with each level
- Higher levels include phrases and more complex words
- Difficulty multiplier applied to word velocity and rotation

📊 **Scoring & Progression:**
- Earn 10 points per correct match
- Level increases after matching all pairs
- Time tracking throughout gameplay
- Game ends after 2 minutes of play (can be restarted anytime with ESC)

🎨 **Visual Design:**
- Smooth canvas-based animations (60 FPS)
- Color-coded boxes (Red = English, Cyan = Spanish)
- Golden highlight when word is selected
- Glow effects and shadow rendering

## Installation

1. Install Node.js (if not already installed)
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Game

Start the game with:
```bash
npm start
```

Or for development mode with DevTools:
```bash
npm run dev
```

## GitHub Pages Deployment

This project can be hosted as a static site using GitHub Pages from the `gh-pages` branch.

After pushing to GitHub, the site will be available at:

`https://devinkernan491-png.github.io/word-match-game/`

A GitHub Actions workflow is included to publish the repository automatically when `main` is pushed.

If GitHub Pages is not enabled automatically, open the repository settings, go to **Pages**, and select the `gh-pages` branch as the source.

## How to Deploy

Just push changes to `main`:
```bash
git add .
git commit -m "Update game"
git push
```

GitHub Actions will build and deploy the site to the `gh-pages` branch.

## How to Play

1. Click the **Start Game** button on the title screen
2. Click on an English word (red boxes)
3. Click on its Spanish translation (cyan boxes)
4. Earn 10 points per correct match
5. Complete all pairs to advance to the next level
6. Each level adds more words and increases speed
7. Press ESC or wait 2 minutes to end the game

## Game Mechanics

### Physics
- Words have independent velocity and rotation
- Bounce off screen edges realistically
- Velocity decreases gradually (friction effect)
- Rotation speed increases with difficulty

### Difficulty Progression
- **Level 1-3:** 5-8 word pairs, normal speed
- **Level 4-6:** 8-11 word pairs, 30-90% faster
- **Level 7+:** Up to 15 pairs, 90%+ faster with harder words

### Scoring
- Each correct match: +10 points
- No penalties for wrong matches
- Leaderboard shows: Final Score, Level Reached, Time Played

## File Structure

```
├── package.json          # Project dependencies
├── main.js              # Electron main process
├── preload.js           # Security: context isolation
├── index.html           # Game UI and styling
├── renderer.js          # Game logic and canvas rendering
├── words.json           # 800 English-Spanish word pairs
└── README.md            # This file
```

## Technical Stack

- **Framework:** Electron 27+
- **Rendering:** HTML5 Canvas
- **Language:** Vanilla JavaScript
- **Styling:** CSS3 with gradients and effects

## Tips for Gameplay

🎯 **Strategy:**
- Focus on one region of the screen at a time
- Remember word positions before they move
- Simple words appear in early levels
- Harder vocabulary appears in later levels

⚡ **Difficulty Curve:**
- Game is forgiving in early levels
- Accelerates progressively (not suddenly)
- Quick reflexes help at higher levels

🏆 **High Scores:**
- Aim for 50+ matches for skilled play
- Level 5+ is considered advanced
- 120 seconds gives ~10-12 minutes of gameplay

## Troubleshooting

**Words not appearing?**
- Make sure `words.json` is in the same directory as other files
- Check browser console for errors (F12 in DevTools)

**Game running slowly?**
- Close other applications
- Check GPU usage (Canvas rendering is GPU-accelerated)

**Can't click words?**
- Make sure game has started (click Start Game button)
- Try clicking in the center of the word box

## Future Enhancements

- 🔊 Sound effects and background music
- 🎯 Different difficulty modes
- 📱 Touch/mobile support
- 🌐 Multiplayer modes
- 📈 Statistics and achievements
- 🎨 Theme customization

## License

MIT License - Feel free to modify and use!

---

**Created:** 2026  
**Version:** 1.0.0  
**Author:** AI Game Dev
