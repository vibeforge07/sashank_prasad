// Every picture dropped into this folder as <name>.webp is picked up by name.
// A layer whose picture has not arrived yet shows a labelled placeholder instead.
const files = import.meta.glob('./*.webp', { eager: true, query: '?url', import: 'default' })

const byName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(2, -5), url]),
)

export const artUrl = (name) => byName[name]
