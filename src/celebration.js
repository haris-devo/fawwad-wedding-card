const guest = (asset, file) => `<img class="guest-avatar" src="${asset(`celebration/${file}.webp`)}" alt="" loading="lazy" decoding="async" />`

export const gardenScene = (asset) => `
  <div class="garden-scene" aria-hidden="true">
    <span class="garden-trim left"></span><span class="garden-trim right"></span>
    <div class="garden-track boy"><span class="garden-runner">${guest(asset, 'running-boy')}</span></div>
    <div class="garden-track girl"><span class="garden-runner">${guest(asset, 'running-girl')}</span></div>
  </div>`

export const dholkiScene = (asset) => `
  <div class="dholki-scene">
    <div class="dholki-stage" aria-hidden="true">
      <div class="dholki-arch"></div>
      <div class="dholki-flowers left"></div><div class="dholki-flowers right"></div>
      <div class="dholki-guests">
        <div class="dholki-guest clap">${guest(asset, 'auntie-clapping')}</div>
        <div class="dholki-guest dhol">${guest(asset, 'dhol-player')}<span class="dholki-note first">♪</span><span class="dholki-note second">♫</span></div>
        <div class="dholki-guest dance">${guest(asset, 'auntie-dancing')}</div>
        <div class="dholki-guest roses">
          ${guest(asset, 'rose-petals')}
          <span class="dholki-petal"></span><span class="dholki-petal"></span><span class="dholki-petal"></span>
        </div>
      </div>
    </div>
    <button class="dholki-button" type="button">Play the dhol</button>
    <audio class="dholki-sound" src="${asset('celebration/dhol-rhythm.mp3')}" preload="none"></audio>
  </div>`

export const finaleScene = (asset) => `
  <div class="wedding-finale">
    <div class="finale-frame" aria-hidden="true"></div>
    <canvas class="finale-sky" aria-hidden="true"></canvas>
    <img class="finale-palace" src="${asset('ref/Reflecting-Pool.webp')}" alt="" loading="lazy" decoding="async" />
    <button class="finale-button" type="button" hidden>Replay fireworks</button>
  </div>`

function wireDhol(scene) {
  const button = scene.querySelector('button')
  const audio = scene.querySelector('audio')

  audio.addEventListener('play', () => scene.classList.add('dhol-playing'))
  for (const event of ['pause', 'ended', 'error']) {
    audio.addEventListener(event, () => scene.classList.remove('dhol-playing'))
  }
  button.addEventListener('click', () => {
    audio.currentTime = 0
    audio.play().catch(() => scene.classList.remove('dhol-playing'))
  })
}

const bursts = [
  { x: 0.22, y: 0.35, start: 0, size: 0.22, color: '#ffd58d', offset: 0.1 },
  { x: 0.77, y: 0.28, start: 0.65, size: 0.25, color: '#efadba', offset: 0.7 },
  { x: 0.48, y: 0.22, start: 1.22, size: 0.23, color: '#ffe8b3', offset: 1.3 },
  { x: 0.83, y: 0.49, start: 1.94, size: 0.16, color: '#e9a56d', offset: 2.1 },
  { x: 0.26, y: 0.27, start: 2.4, size: 0.18, color: '#f1bac2', offset: 2.5 },
]
const launchDuration = 0.56
const fadeDuration = 1.48
const finaleDuration = bursts.at(-1).start + launchDuration + fadeDuration

function wireFireworks(scene, motion) {
  const canvas = scene.querySelector('canvas')
  const button = scene.querySelector('button')
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  let width = 0
  let height = 0
  let frame = 0
  let startedAt
  let visible = false
  let hasPlayed = false

  function paintBurst(burst, age, brightness = 1) {
    const x = width * burst.x
    const y = height * burst.y
    if (age < 0 || age > launchDuration + fadeDuration) return
    ctx.lineCap = 'round'
    if (age < launchDuration) {
      const t = age / launchDuration
      const yHead = y + (height * 0.79 - y) * (1 - t) ** 1.7
      ctx.strokeStyle = burst.color
      ctx.globalAlpha = t * 0.72
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, yHead)
      ctx.lineTo(x - 4 * (1 - t), yHead + 9 * (1 - t))
      ctx.stroke()
      return
    }

    const progress = (age - launchDuration) / fadeDuration
    const radius = Math.min(height, width * 0.83) * burst.size
    const travel = 1 - (1 - progress) ** 2.5
    const gravity = radius * 0.32 * progress ** 2
    const count = 34
    ctx.strokeStyle = burst.color
    ctx.fillStyle = burst.color
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count + burst.offset
      const distance = radius * travel * (0.65 + ((i * 11) % 23) / 65)
      const dx = Math.cos(angle) * distance
      const dy = Math.sin(angle) * distance
      const streak = 0.76 + progress * 0.16
      ctx.globalAlpha = brightness * (1 - progress) ** 0.9 * (i % 3 === 0 ? 0.96 : 0.68)
      ctx.lineWidth = i % 3 === 0 ? 1.9 : 1.1
      ctx.beginPath()
      ctx.moveTo(x + dx * streak, y + dy * streak + gravity)
      ctx.lineTo(x + dx, y + dy + gravity)
      ctx.stroke()
      if (i % 4 === 0) {
        ctx.beginPath()
        ctx.arc(x + dx * 0.59, y + dy * 0.59 + gravity * 0.7, 1.2 * (1 - progress * 0.45), 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  }

  function paint(time) {
    ctx.clearRect(0, 0, width, height)
    if (time === undefined) {
      bursts.slice(0, 3).forEach((burst) => paintBurst(burst, launchDuration + 0.67, 0.75))
    } else {
      bursts.forEach((burst) => paintBurst(burst, time - burst.start))
      if (time > finaleDuration - 0.45) {
        const glow = Math.min((time - finaleDuration + 0.45) / 0.45, 1)
        bursts.slice(0, 3).forEach((burst) => paintBurst(burst, launchDuration + 0.67, glow * 0.75))
      }
    }
    ctx.globalAlpha = 1
  }

  function tick(now) {
    startedAt ??= now
    const time = (now - startedAt) / 1000
    paint(time)
    frame = time < finaleDuration ? requestAnimationFrame(tick) : 0
  }

  function resize() {
    const box = canvas.getBoundingClientRect()
    width = box.width
    height = box.height
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!frame) paint()
  }

  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
    paint()
  }

  function play() {
    if (motion.matches || document.hidden || !visible) return
    hasPlayed = true
    cancelAnimationFrame(frame)
    startedAt = undefined
    frame = requestAnimationFrame(tick)
  }

  const updatePreference = () => {
    button.hidden = motion.matches
    if (motion.matches) stop()
  }

  new ResizeObserver(resize).observe(canvas)
  resize()
  updatePreference()
  motion.addEventListener('change', updatePreference)
  button.addEventListener('click', play)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else if (visible && !hasPlayed) play()
  })

  return (inView) => {
    visible = inView
    if (visible && !hasPlayed) play()
    if (!visible && frame) stop()
  }
}

export function initCelebration() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const garden = document.querySelector('.garden-scene')
  const dholki = document.querySelector('.dholki-scene')
  const finale = document.querySelector('.wedding-finale')
  wireDhol(dholki)
  const setFinaleVisible = wireFireworks(finale, motion)

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const visible = entry.intersectionRatio >= 0.24
      entry.target.classList.toggle('celebration-visible', visible)
      if (entry.target === finale) setFinaleVisible(visible)
    }
  }, { threshold: 0.24 })

  for (const scene of [garden, dholki, finale]) observer.observe(scene)
}
