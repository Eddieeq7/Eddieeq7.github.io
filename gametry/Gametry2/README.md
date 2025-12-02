# Neon Chase - Arcade Car Game

A modern, neon-styled 2D top-down car chase game built with HTML5 Canvas and JavaScript. Drive through a vibrant world while being pursued by increasingly aggressive enemies.

## Features

- Smooth, responsive car controls with realistic physics
- Dynamic enemy AI with different behavior states
- Beautiful neon visual effects and particle systems
- Responsive design that works on different screen sizes
- Progressive difficulty scaling
- Boost mechanics with visual feedback
- Score tracking and health system

## Controls

- **Arrow Keys**: Control the car's movement
- **Shift**: Activate boost (when available)
- **Space**: Pause game (coming soon)

## Setup

1. Clone the repository
2. Create an `assets` directory with the following structure:
   ```
   assets/
   ├── images/
   │   ├── player-car.png
   │   ├── enemy-car.png
   │   ├── background.png
   │   ├── boost.png
   │   └── explosion.png
   └── sounds/
       ├── engine.mp3
       ├── crash.mp3
       ├── boost.mp3
       └── background.mp3
   ```
3. Add your own assets or use placeholder images/sounds
4. Open `index.html` in a modern web browser

## Development

The game is built using modern JavaScript features and follows a modular architecture:

- `main.js`: Game initialization and main loop
- `game.js`: Core game logic and state management
- `player.js`: Player car controls and rendering
- `enemy.js`: Enemy AI and behavior
- `camera.js`: Smooth camera following
- `particleSystem.js`: Visual effects
- `inputHandler.js`: Keyboard input management
- `assetLoader.js`: Asset loading and caching

## Performance Optimization

The game includes several optimizations:

- Efficient particle system with automatic cleanup
- Viewport culling for off-screen objects
- Asset preloading and caching
- Smooth animation using requestAnimationFrame
- Optimized collision detection
- Efficient canvas rendering with proper state management

## Browser Support

The game works best in modern browsers that support:
- HTML5 Canvas
- ES6+ JavaScript features
- Web Audio API

## Future Enhancements

- Power-ups and collectibles
- Multiple levels with different themes
- Leaderboard system
- Mobile touch controls
- More enemy types
- Environmental obstacles
- Weather effects
- Multiplayer mode

## License

MIT License - Feel free to use and modify for your own projects!

## Credits

Created with ❤️ using vanilla JavaScript and HTML5 Canvas. 