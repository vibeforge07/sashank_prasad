# Shashank and Debashruti

Animated wedding invitation in English, Bangla and Hindi. Eleven full-screen sections, one under the other; each plays its own animation when it comes on screen, and the whole invitation can also play by itself.

    npm install
    npm run dev      # local preview
    npm run build    # static site in dist/
    npm run art      # turns pictures in art/raw into src/art/*.webp

- `src/scenes/scenes.js`: layers and timing of every section
- `src/content/`: all words (`en.js`, `bn.js`, `hi.js`), events, shlokas
- `src/audio/`: drop one `.mp3` here and the music button appears
