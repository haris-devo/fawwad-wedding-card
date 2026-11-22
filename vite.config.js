export default {
  // Served from https://haris-devo.github.io/fawwad-wedding-card/ in production
  base: process.env.NODE_ENV === 'production' ? '/fawwad-wedding-card/' : '/',
  // Raw music renders live in music-src; don't reload the page while they're written.
  server: { watch: { ignored: ['**/music-src/**'] } },
}
