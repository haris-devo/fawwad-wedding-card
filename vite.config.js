export default {
  // Raw music renders live in music-src; don't reload the page while they're written.
  server: { watch: { ignored: ['**/music-src/**'] } },
}
