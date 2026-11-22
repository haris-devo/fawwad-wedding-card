import 'lenis/dist/lenis.css'
import 'leaflet/dist/leaflet.css'
import './style.css'
import './celebration.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { content as C } from './content.js'
import { ARCH, archMaskURI } from './art.js'
import { dholkiScene, finaleScene, gardenScene, initCelebration } from './celebration.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

const TZ = 'Asia/Karachi'
const html = document.documentElement
const q = (s, el = document) => el.querySelector(s)
const qa = (s, el = document) => [...el.querySelectorAll(s)]
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])
const motionOK = matchMedia('(prefers-reduced-motion: no-preference)').matches
// Paths in content.js and below are relative to public/, so the site also works from a sub-folder.
const A = (p) => (/^(https?:|data:|\/)/.test(p) ? p : import.meta.env.BASE_URL + p)
const R = (f) => A(`ref/${f}`)

/* ---------- dates and links ---------- */
const at = (e) => new Date(`${e.date}T${e.start}:00+05:00`)
const fmt = (d, o) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...o }).format(d)
const timeText = (d) => fmt(d, { hour: 'numeric', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM')
const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const calendarLink = (e) => {
  const s = at(e)
  const u = new URL('https://calendar.google.com/calendar/render')
  u.search = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${e.name} · ${C.groom.first} & ${C.bride.first}`,
    dates: `${utc(s)}/${utc(new Date(s.getTime() + e.hours * 36e5))}`,
    location: `${e.venue}, ${e.address}`,
    details: e.line,
    ctz: TZ,
  })
  return u.href
}
const mapLink = (e) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`
const many = C.events.length > 1
const hasPin = (e) => Number.isFinite(e.lat) && Number.isFinite(e.lng)
const places = new Map()
for (const event of C.events.filter(hasPin)) {
  const key = `${event.lat},${event.lng}`
  if (!places.has(key)) places.set(key, [])
  places.get(key).push(event)
}
const main = C.events.find((e) => e.id === C.mainEvent) ?? C.events[0]
const mainDate = at(main)
const mono = `${esc(C.groom.first[0])} &amp; ${esc(C.bride.first[0])}`
const divider = (cls = '') => `<img class="divider ${cls}" src="${R('divider.webp')}" alt="" />`
const seal = (cls) => `<div class="seal ${cls}"><img src="${R('Seal-Badge.webp')}" alt="" /><span>${mono}</span></div>`

/* ---------- pieces ---------- */
const person = (role, p, kind) => `
  <figure class="person person--${kind}">
    <div class="arch-photo">
      ${p.photo ? `<img class="ap-img" src="${esc(A(p.photo))}" alt="${esc(p.photoAlt ?? p.full)}" loading="lazy" />` : `<div class="ap-img ap-empty">${esc(p.first[0])}</div>`}
      <img class="ap-frame" src="${R('Arch-Frame.webp')}" alt="" />
    </div>
    <figcaption>
      <span class="role">${role}</span>
      <span class="person-name">${esc(p.full)}</span>
      <span class="person-parents">${esc(p.parents)}</span>
    </figcaption>
  </figure>`

const evCard = (e, i) => `
  <article class="ev" aria-label="${esc(e.name)}">
    <img class="ev-frame" src="${R('Wedding-Frame.webp')}" alt="" />
    <div class="ev-cloth">
      ${many ? `<p class="ev-num">Event ${i + 1}</p>` : ''}
      <h3 class="ev-name">${esc(e.name)}</h3>
      <p class="ev-line">${esc(e.line)}</p>
      ${divider('ev-divider')}
      <p class="ev-when">${fmt(at(e), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p class="ev-time">${timeText(at(e))}</p>
      <p class="ev-venue">${esc(e.venue)}</p>
      <p class="ev-addr">${esc(e.address)}</p>
      <div class="ev-actions">
        ${hasPin(e) ? `<a class="btn-gold" href="${mapLink(e)}" target="_blank" rel="noopener">Get directions</a>` : ''}
        <a class="btn-line" href="${calendarLink(e)}" target="_blank" rel="noopener">Add to calendar</a>
      </div>
    </div>
  </article>`

// The big date beside each frame on the desktop timeline
const evDate = (e) => `
  <p class="ev-date" aria-hidden="true">
    <span class="ev-dnum">${fmt(at(e), { day: 'numeric' })}</span>
    <span class="ev-dmon">${fmt(at(e), { month: 'long', year: 'numeric' })}</span>
    <span class="ev-dday">${fmt(at(e), { weekday: 'long' })}</span>
  </p>`

const gallery = C.gallery.slice(0, 6).map(A)
const polaroids = gallery
  .map(
    (src, i) => `
    <figure class="polaroid" style="--tilt:${[-5, 4, -3, 5, -4, 3][i]}deg">
      <button type="button" class="pol-photo" data-photo="${i}" aria-label="View photo ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy" /></button>
    </figure>`,
  )
  .join('')

/* ---------- page ---------- */
q('#app').innerHTML = `
<div class="loader" id="loader" role="status" aria-live="polite">
  <img class="loader-orn" src="${R('Ornament.png')}" alt="" />
  <p class="loader-pct">0%</p>
  <p class="loader-txt">Preparing your invitation</p>
</div>

<div class="gate" id="gate" inert>
  <video class="gate-video" src="${R('Royal-Nikah-Video.mp4')}" poster="${R('cover-image.webp')}" playsinline muted preload="auto"></video>
  <button class="gate-tap" type="button" aria-label="Open the invitation"><span class="gate-hint">Open the invitation</span></button>
  <button class="gate-skip" type="button" hidden>Skip animation</button>
</div>

<canvas class="petals" aria-hidden="true"></canvas>
<audio class="invitation-song" src="${esc(A(C.music.src))}" loop preload="metadata"></audio>
<button class="music" type="button" hidden aria-label="Play music" aria-pressed="false"><span></span><span></span><span></span><span></span></button>

<main class="col" inert>
  <section class="cover" aria-label="Invitation cover">
    <picture><source media="(min-width: 1024px)" srcset="${R('h-desktop.webp')}" /><img class="cover-bg" src="${R('h-mobile.webp')}" alt="" fetchpriority="high" /></picture>
    <div class="doves" aria-hidden="true"><span class="dove left"><i></i></span><span class="dove right"><i></i></span></div>
    <img class="hang l" src="${R('lantern-1.webp')}" alt="" />
    <img class="hang r" src="${R('lantern-1.webp')}" alt="" />
    <div class="cover-text">
      <p class="cover-intro">In the name of Allah, we begin our journey together, seeking His blessings, love and mercy</p>
      ${divider()}
      <h1 class="cover-names" tabindex="-1"><span class="nm">${esc(C.groom.first)}</span><span class="amp">&amp;</span><span class="nm">${esc(C.bride.first)}</span></h1>
      <p class="cover-sub">invite you to celebrate their wedding</p>
    </div>
    <a class="scroll-cue" href="#invitation">Read the invitation</a>
  </section>

  <section class="letter" id="invitation" aria-label="Invitation">
    <div class="letter-scene" aria-hidden="true">
      <img class="letter-palace" src="${R('night-palace.webp')}" alt="" loading="lazy" decoding="async" />
      <div class="letter-border"></div>
      <div class="letter-lantern left"><img src="${R('lantern-1.webp')}" alt="" loading="lazy" /></div>
      <div class="letter-lantern right"><img src="${R('lantern-1.webp')}" alt="" loading="lazy" /></div>
    </div>
    <div class="scroll">
      <div class="scroll-inner">
        <img class="bis-img" src="${R('text.webp')}" alt="بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ" />
        <p class="bis-en">Bismillahir Rahmanir Raheem</p>
        <p class="req">With the blessings of Allah, together with their families, you are cordially invited to the Nikah ceremony of</p>
        <p class="pname pname--groom">${esc(C.groom.full)}</p>
        <p class="hosts">${esc(C.groom.parents)}</p>
        <p class="and">with</p>
        <p class="pname">${esc(C.bride.full)}</p>
        <p class="hosts">${esc(C.bride.parents)}</p>
        ${seal('seal-letter')}
        <p class="hashtag">${esc(C.hashtag)}</p>
      </div>
    </div>
  </section>

  <section class="urdu-scroll" id="two-hearts">
    <span class="urdu-scroll-rule" aria-hidden="true"></span>
    <h2 class="urdu-scroll-title" lang="ur" dir="rtl"><span>دو دل،</span> <span>ایک دعا</span></h2>
    <p class="urdu-scroll-translation">Two hearts, one prayer.</p>
    ${divider('urdu-scroll-ornament')}
  </section>

  <section class="union" aria-label="The blessed union">
    <img class="float-lantern f1" src="${R('lantern-1-1.webp')}" alt="" />
    <img class="float-lantern f2" src="${R('lantern-1-1.webp')}" alt="" />
    <img class="float-lantern f3" src="${R('lantern-1-1.webp')}" alt="" />
    <div class="union-arch">
      <svg class="union-line" viewBox="-6 -6 212 312" preserveAspectRatio="none" aria-hidden="true"><path d="${ARCH}" pathLength="1"/></svg>
      <img class="union-orn" src="${R('Ornament.png')}" alt="" />
      <p class="script">With the duas of our elders</p>
      <h2>The Blessed Union</h2>
      <p class="union-text">Two hearts, one beautiful journey, and a lifetime of togetherness.</p>
    </div>
    ${gardenScene(A)}
  </section>

  <section class="couple" aria-label="The couple">
    <p class="hashtag top">${esc(C.hashtag)}</p>
    ${person('The Groom', C.groom, 'groom')}
    ${person('The Bride', C.bride, 'bride')}
  </section>

  <section class="quote" aria-label="A verse">
    <img class="quote-bg" src="${R('couple-mobile-new.webp')}" alt="" />
    <blockquote><p>“And We created you in pairs.”</p><cite>Qur’an 78:8</cite></blockquote>
  </section>

  <div class="band" aria-hidden="true"></div>

  <section class="date" aria-label="Save the date">
    <p class="script">A little surprise</p>
    <h2>Save The Date</h2>
    <p class="lead">Scratch the golden card below to uncover the day our forever begins.</p>
    <div class="scratch">
      <div class="scratch-card">
        <div class="scratch-under" id="revealed-date" aria-hidden="true">
          <p class="d-week">${fmt(mainDate, { weekday: 'long' })}</p>
          <p class="d-num">${fmt(mainDate, { day: 'numeric' })}</p>
          <p class="d-month">${fmt(mainDate, { month: 'long', year: 'numeric' })}</p>
        </div>
        <canvas class="scratch-foil" aria-hidden="true"></canvas>
      </div>
      <img class="scratch-frame" src="${R('scratch-frame.webp')}" alt="" />
    </div>
    <button class="scratch-reveal" type="button" aria-controls="revealed-date">Reveal the date</button>
    <div class="save-action" hidden>
      <a class="btn-line" href="${calendarLink(main)}" target="_blank" rel="noopener">Save the ${esc(main.name)} to your calendar</a>
    </div>
    <p class="sr" id="scratch-status" role="status"></p>
    <p class="script small">The start of a beautiful journey…</p>
    <div class="countdown" role="timer" aria-label="Time until the ${esc(main.name)}">
      ${['days', 'hours', 'minutes', 'seconds'].map((u) => `<div><span class="cd-num" data-u="${u}">00</span><span class="cd-label">${u}</span></div>`).join('')}
    </div>
    <p class="countdown-done" hidden>The celebrations have begun, Alhamdulillah.</p>
    <img class="grild" src="${R('grild.webp')}" alt="" />
  </section>

  <div class="band" aria-hidden="true"></div>

  <section class="gallery" aria-label="Gallery">
    <p class="urdu-kicker" lang="ur" dir="rtl">یادگار لمحے</p>
    <h2>Blessed Moments</h2>
    <p class="lead">Every smile, every laugh, every stolen glance, kept forever.</p>
    <img class="garland" src="${R('flowers.webp')}" alt="" />
    <div class="polaroids">${polaroids}</div>
  </section>

  <section class="events" aria-label="Celebrations">
    <p class="urdu-kicker" lang="ur" dir="rtl">${many ? 'خوشیوں کی محفل' : 'تشریف لائیے'}</p>
    <h2>${many ? 'The Blessed Celebrations' : `The ${esc(main.name)} Ceremony`}</h2>
    <p class="lead">${many ? 'We would love to see you at each one.' : 'We would love to see you there.'}</p>
    ${many ? `<nav class="event-index" aria-label="Jump to a celebration">${C.events.map((e) => `<a href="#event-${esc(e.id)}">${esc(e.name)}</a>`).join('')}</nav>` : ''}
    ${dholkiScene(A)}
    <img class="car" src="${R('Wedding-Car.webp')}" alt="" />
    <div class="ev-list">
      ${C.events.map((e, i) => `<div class="ev-row" id="event-${esc(e.id)}"><img class="ev-lantern l" src="${R('lantern-1.webp')}" alt="" />${evCard(e, i)}<img class="ev-lantern r" src="${R('lantern-1.webp')}" alt="" />${evDate(e)}</div>`).join('')}
    </div>
  </section>

  <section class="blessing" aria-label="A note from the families">
    <img class="pendant" src="${R('Ornate-Gold-and-Rose-Mandala-Pendant.webp')}" alt="" />
    <div class="bless-card">
      <img class="corner tl" src="${R('Ornament.png')}" alt="" />
      <img class="corner br" src="${R('Ornament.png')}" alt="" />
      <p class="bless-ur" lang="ur" dir="rtl">محبت، سکون اور رحمت کا نیا سفر</p>
      <p>With hearts full of gratitude to Allah, we request the honour of your presence at our wedding celebration. Join us in making this blessed day memorable with your duas, love and good wishes.</p>
    </div>
  </section>

  <div class="band" aria-hidden="true"></div>

  ${places.size ? `<section class="venues" aria-label="${places.size > 1 ? 'Venues' : 'Venue'}">
    <p class="script">Find your way</p>
    <h2>${places.size > 1 ? 'The Venues' : 'The Venue'}</h2>
    <div class="venue-details">
      ${[...places.values()].map(([event]) => `
        <div class="venue-detail">
          <p class="venue-name">${esc(event.venue)}</p>
          <p class="venue-address">${esc(event.address)}</p>
          <div class="venue-actions">
            <a class="btn-gold" href="${mapLink(event)}" target="_blank" rel="noopener">Get directions</a>
            <button class="btn-line copy-address" type="button" data-address="${esc(`${event.venue}, ${event.address}`)}">Copy address</button>
          </div>
        </div>`).join('')}
    </div>
    <p class="sr" id="venue-status" role="status"></p>
    <div id="map" class="map" aria-label="Venue map"></div>
  </section>` : ''}

  <footer class="closing">
    <div class="band" aria-hidden="true"></div>
    <p class="dua" lang="ar">بَارَكَ اللّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ</p>
    <p class="script big">We await your blessed presence</p>
    ${seal('seal-closing')}
    <p class="closing-names">${esc(C.groom.first)} &amp; ${esc(C.bride.first)}</p>
    ${divider()}
    <p class="urdu-signoff" lang="ur" dir="rtl">آپ کی دعاؤں اور محبت کے منتظر ہیں۔</p>
    <p class="closing-note">“Your presence and blessings will make our special day even more memorable.”</p>
    <p class="closing-date">${fmt(mainDate, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p class="closing-place">${esc(main.venue)}, ${esc(main.address)}</p>
    ${finaleScene(A)}
  </footer>
</main>

<dialog class="lightbox" aria-label="Wedding gallery" data-lenis-prevent>
  <div class="lb-content">
    <button type="button" class="lb-close" aria-label="Close gallery" autofocus>×</button>
    <img alt="" />
    ${gallery.length > 1 ? `<div class="lb-controls">
      <button type="button" class="lb-prev" aria-label="Previous photo">‹</button>
      <p class="lb-count" role="status"></p>
      <button type="button" class="lb-next" aria-label="Next photo">›</button>
    </div>` : ''}
  </div>
</dialog>`

html.style.setProperty('--arch-mask', archMaskURI)
html.style.setProperty('--tile', `url("${R('perr-tile-83d714.svg')}")`)
html.style.setProperty('--band', `url("${R('pattern.webp')}")`)
html.style.setProperty('--parchment', `url("${R('mobile-version.webp')}")`)
html.style.setProperty('--floral', `url("${R('photo-mobile-bg.webp')}")`)
html.style.setProperty('--paper-wide', `url("${R('couple-bg.webp')}")`)
html.style.setProperty('--scroll-bg', `url("${R('Scroll-Frame-BG.webp')}")`)
html.style.setProperty('--dove-sprite', `url("${R('dove-sprite.webp')}")`)
html.style.setProperty('--flower-garland', `url("${R('flowers.webp')}")`)
// desktop only: CSS fetches these just when a desktop rule uses them
html.style.setProperty('--poster', `url("${R('cover-image.webp')}")`)
html.style.setProperty('--floral-wide', `url("${R('photo-desktop-bg.webp')}")`)
html.style.setProperty('--couple-wide', `url("${R('couple-desktop-new.webp')}")`)

/* ---------- smooth scroll ---------- */
let lenis = null
if (motionOK) {
  html.classList.add('is-motion')
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  lenis.stop()
}

/* ---------- music ---------- */
const audio = q('.invitation-song')
const musicBtn = q('.music')
let wantsMusic = true
let opened = false
const setPlaying = (on) => {
  musicBtn.classList.toggle('playing', on)
  musicBtn.setAttribute('aria-pressed', String(on))
  musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music')
}
const playMusic = () => {
  gsap.killTweensOf(audio)
  audio.volume = 0
  audio
    .play()
    .then(() => {
      if (!audio.paused) gsap.to(audio, { volume: 0.8, duration: 3, ease: 'sine.inOut' })
    })
    .catch(() => setPlaying(false))
}
audio.addEventListener('play', () => setPlaying(true))
audio.addEventListener('pause', () => setPlaying(false))
audio.addEventListener('error', () => musicBtn.remove())
musicBtn.addEventListener('click', () => {
  wantsMusic = audio.paused
  if (wantsMusic) playMusic()
  else {
    audio.pause()
    setPlaying(false)
  }
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.pause()
  else if (wantsMusic && opened) audio.play().catch(() => {})
})

/* ---------- falling rose petals (the reference's petal image) ---------- */
const petals = (() => {
  const canvas = q('.petals')
  const ctx = motionOK && canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return { burst() {}, setAmbient() {} }
  }
  const img = new Image()
  img.src = R('midnight-waltz-rosePetal.webp')
  let w, h, dpr
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2)
    w = canvas.width = innerWidth * dpr
    h = canvas.height = innerHeight * dpr
  }
  size()
  addEventListener('resize', size)
  const make = (x = Math.random(), y = -0.05 - Math.random() * 0.3, fast = false) => ({
    x, y,
    s: 16 + Math.random() * 14,
    vy: (fast ? 0.0036 : 0.0008) + Math.random() * 0.0009,
    vx: fast ? (Math.random() - 0.5) * 0.007 : 0,
    rot: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.04,
    sway: Math.random() * 6.28,
  })
  const base = innerWidth < 700 ? 7 : 12
  let ambient = false
  let ps = []
  const animate = (time, deltaTime) => {
    if (document.hidden || !img.naturalWidth) return
    const speed = Math.min(deltaTime / 16.67, 2)
    ctx.clearRect(0, 0, w, h)
    for (const p of ps) {
      p.y += p.vy * speed
      p.x += (p.vx + Math.sin(time * 0.8 + p.sway) * 0.0006) * speed
      p.vx *= 0.985
      p.rot += p.vr * speed
      const s = p.s * dpr
      ctx.save()
      ctx.translate(p.x * w, p.y * h)
      ctx.rotate(p.rot)
      ctx.scale(1, 0.65 + 0.35 * Math.sin(time * 2 + p.sway))
      ctx.globalAlpha = p.extra ? 0.76 : 0.63
      ctx.drawImage(img, -s / 2, -s * 0.375, s, s * 0.75)
      ctx.restore()
    }
    // Burst petals leave once they fall off screen; the steady ones start again at the top.
    ps = ps.filter((p) => !(p.extra && p.y > 1.08))
    for (const p of ps) if (p.y > 1.08) Object.assign(p, make())
    if (!ps.length) gsap.ticker.remove(animate)
  }
  return {
    setAmbient(on) {
      if (ambient === on) return
      ambient = on
      ps = ps.filter((p) => p.extra)
      if (on) {
        for (let i = 0; i < base; i++) ps.push(make(Math.random(), Math.random()))
        gsap.ticker.add(animate)
      }
    },
    burst(n) {
      for (let i = 0; i < n; i++) ps.push({ ...make(0.5 + (Math.random() - 0.5) * 0.5, 0.3 + Math.random() * 0.25, true), extra: true })
      gsap.ticker.add(animate)
    },
  }
})()

/* ---------- loader ---------- */
const loader = q('#loader')
const pctEl = q('.loader-pct')
const gate = q('#gate')
const gateBtn = q('.gate-tap')
const skipBtn = q('.gate-skip')
const video = q('.gate-video')
const progress = { v: 0 }
const show = () => (pctEl.textContent = `${Math.round(progress.v)}%`)
const poster = new Image()
poster.src = video.poster
const posterReady = poster.decode().catch(() => {})
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
gsap.to(progress, { v: 90, duration: 1.5, onUpdate: show })
Promise.all([wait(400), Promise.race([posterReady, wait(1700)])]).then(() => {
  gsap.to(progress, { v: 100, duration: 0.15, overwrite: true, onUpdate: show })
  gsap.to(loader, { autoAlpha: 0, delay: 0.15, duration: motionOK ? 0.35 : 0, onComplete: () => {
    loader.remove()
    gate.inert = false
  } })
})

/* ---------- gate: the doors video ---------- */
const cover = q('.cover')
const invitation = q('.col')
let finished = false
let gateTimeout
let coverVisible = false
const sceneObserver = new IntersectionObserver((entries) => {
  for (const { target, intersectionRatio } of entries) {
    const visible = intersectionRatio >= 0.01
    target.classList.toggle('scene-visible', visible)
    if (target === cover) {
      coverVisible = visible
      petals.setAmbient(finished && coverVisible)
    }
  }
}, { threshold: 0.01 })
sceneObserver.observe(cover)
sceneObserver.observe(q('.letter'))

function coverIntro() {
  const split = SplitText.create('.cover-names .nm', { type: 'chars' })
  return gsap
    .timeline()
    .from('.cover-bg', { scale: 1.12, duration: 3, ease: 'power2.out' }, 0)
    .from('.doves', { opacity: 0, duration: 1.5 }, 0.15)
    .from('.cover .hang', { yPercent: -100, duration: 2, ease: 'elastic.out(1, 0.6)', stagger: 0.15 }, 0.3)
    .from('.cover-intro', { opacity: 0, y: 12, duration: 1 }, 0.6)
    .from('.cover .divider', { scaleX: 0, opacity: 0, duration: 1 }, 0.9)
    .from(split.chars, { yPercent: 50, opacity: 0, filter: 'blur(8px)', duration: 1.2, ease: 'expo.out', stagger: 0.05 }, 1)
    .from('.cover-names .amp', { opacity: 0, scale: 0.5, rotate: -15, duration: 1.2, ease: 'expo.out' }, 1.3)
    .from('.cover-sub', { opacity: 0, y: 10, duration: 1 }, 1.6)
    .from('.scroll-cue', { opacity: 0, y: 6, duration: 0.8 }, 1.7)
}
function finishGate() {
  if (finished) return
  finished = true
  clearTimeout(gateTimeout)
  html.classList.add('invitation-open')
  petals.setAmbient(coverVisible)
  petals.burst(22)
  gsap.timeline()
    .to(gate, { autoAlpha: 0, duration: motionOK ? 0.85 : 0, ease: 'power1.inOut', onComplete: () => {
      video.pause()
      gate.remove()
      html.classList.remove('locked')
      invitation.inert = false
      musicBtn.hidden = false
      lenis?.start()
      initCelebration()
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
      else q('.cover-names').focus({ preventScroll: true })
      ScrollTrigger.refresh()
    } })
    .add(motionOK ? coverIntro() : gsap.timeline(), 0.2)
}
function openGate() {
  if (opened) return
  opened = true
  playMusic()
  if (!motionOK) return finishGate()
  gateBtn.hidden = true
  skipBtn.hidden = false
  skipBtn.focus({ preventScroll: true })
  // The video opens the doors onto a garden and ends in a burst of light; we cross into the cover there.
  video.addEventListener('timeupdate', () => video.currentTime > 6.3 && finishGate())
  video.addEventListener('ended', finishGate)
  video.addEventListener('error', finishGate, { once: true })
  video.play().catch(finishGate)
  gateTimeout = setTimeout(finishGate, 9000)
}
gateBtn.addEventListener('click', openGate)
skipBtn.addEventListener('click', finishGate)

/* ---------- scroll scenes ---------- */
gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  // The scroll unrolls from its top roller as you reach it, then the wax seal is pressed on.
  gsap.timeline({ scrollTrigger: { trigger: '.scroll', start: 'top 86%', once: true } })
    .from('.scroll', { clipPath: 'inset(0% 0% 90% 0%)', duration: 1.2, ease: 'power2.inOut' })
    .from('.seal-letter', { scale: 1.5, rotate: -15, opacity: 0, duration: 0.55, ease: 'back.out(1.7)' }, 0.95)

  gsap.timeline({ scrollTrigger: { trigger: '.urdu-scroll-title', start: 'top 88%', once: true } })
    .from('.urdu-scroll-rule', { scaleX: 0.18, opacity: 0.15, duration: 0.7, ease: 'power2.out' })
    .from('.urdu-scroll-title span', { opacity: 0, y: 24, stagger: 0.16, duration: 0.95, ease: 'power3.out' }, 0.12)
    .from('.urdu-scroll-translation, .urdu-scroll-ornament', { opacity: 0, y: 9, stagger: 0.12, duration: 0.55, ease: 'power2.out' }, 0.63)

  gsap.fromTo('.union-line path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.union', start: 'top 75%', end: 'center 50%', scrub: 1 } })
  gsap.from('.union-arch > :not(svg)', { opacity: 0, y: 20, stagger: 0.12, duration: 1, scrollTrigger: { trigger: '.union-arch', start: 'top 65%' } })

  qa('.person').forEach((el) => {
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } })
      .from(q('.ap-frame', el), { y: 60, opacity: 0, scale: 0.94, duration: 1.3, ease: 'power3.out' })
      .from(q('.ap-img', el), { opacity: 0, scale: 1.15, duration: 1.6, ease: 'power2.out' }, 0.3)
      .from(qa('figcaption > *', el), { opacity: 0, y: 14, stagger: 0.1, duration: 0.9 }, 0.7)
  })

  gsap.fromTo('.quote-bg', { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.quote', start: 'top bottom', end: 'bottom top', scrub: true } })
  gsap.from('.quote blockquote', { opacity: 0, y: 24, filter: 'blur(6px)', duration: 1.4, scrollTrigger: { trigger: '.quote', start: 'top 60%' } })

  gsap.from('.scratch-frame', { scale: 0.85, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.scratch', start: 'top 80%' } })
  gsap.from('.garland', { y: -30, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.garland', start: 'top 85%' } })
  gsap.from('.polaroid', {
    y: -80, rotate: (i) => (i % 2 ? 18 : -18), opacity: 0, duration: 1.1, ease: 'back.out(1.4)', stagger: 0.12,
    scrollTrigger: { trigger: '.polaroids', start: 'top 75%' },
  })

  gsap.fromTo('.car', { x: '-60vw', rotate: -6 }, { x: 0, rotate: 0, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.car', start: 'top 85%' } })
  qa('.ev').forEach((ev) => {
    const cloth = q('.ev-cloth', ev)
    gsap.timeline({ scrollTrigger: { trigger: ev, start: 'top 78%' } })
      .from(q('.ev-frame', ev), { y: -60, opacity: 0, duration: 1, ease: 'power3.out' })
      .from(cloth, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'power2.inOut' }, 0.4)
      .from(ev.parentElement.querySelectorAll('.ev-lantern'), { yPercent: -60, opacity: 0, duration: 1.4, ease: 'elastic.out(1, 0.6)', stagger: 0.1 }, 0.2)
  })

  gsap.from('.pendant', { yPercent: -60, opacity: 0, duration: 1.6, ease: 'elastic.out(1, 0.6)', scrollTrigger: { trigger: '.blessing', start: 'top 75%' } })
  gsap.from('.bless-card', { opacity: 0, y: 30, duration: 1.2, scrollTrigger: { trigger: '.bless-card', start: 'top 85%' } })
  gsap.from('.seal-closing', { scale: 2, rotate: 30, opacity: 0, duration: 0.7, ease: 'back.out(2.4)', scrollTrigger: { trigger: '.seal-closing', start: 'top 85%' } })
})

/* ---------- scratch card ---------- */
;(function scratch() {
  const canvas = q('.scratch-foil')
  const under = q('.scratch-under')
  const revealButton = q('.scratch-reveal')
  const saveAction = q('.save-action')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  let revealed = false
  let dpr = 1
  const paint = () => {
    if (revealed || !ctx) return
    const r = canvas.getBoundingClientRect()
    if (!r.width) return
    dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = r.width * dpr
    canvas.height = r.height * dpr
    const { width: W, height: H } = canvas
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#B8924A')
    g.addColorStop(0.25, '#F1DCA0')
    g.addColorStop(0.5, '#C9A55D')
    g.addColorStop(0.75, '#F5E3AE')
    g.addColorStop(1, '#A9843E')
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`
      ctx.fillRect(Math.random() * W, Math.random() * H, dpr, dpr)
    }
    ctx.fillStyle = 'rgba(95,66,24,.85)'
    ctx.textAlign = 'center'
    ctx.font = `${Math.max(11, r.width / 18) * dpr}px "Cormorant Garamond", serif`
    ctx.fillText(`Scratch To Reveal Our ${main.name} Date`, W / 2, H / 2 - 2 * dpr)
    ctx.font = `${12 * dpr}px Cinzel, serif`
    ctx.fillText('✦', W / 2, H / 2 + 18 * dpr)
  }
  document.fonts?.ready.then(paint)
  addEventListener('resize', paint)
  paint()
  let last = null
  let pointer = null
  let strokes = 0
  const pos = (e) => {
    const r = canvas.getBoundingClientRect()
    return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]
  }
  const cleared = () => {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    let n = 0
    for (let i = 3; i < data.length; i += 4 * 40) {
      n++
      if (data[i] === 0) clear++
    }
    return clear / n
  }
  const reveal = () => {
    if (revealed) return
    revealed = true
    const moveFocus = document.activeElement === revealButton
    revealButton.hidden = true
    saveAction.hidden = false
    under.removeAttribute('aria-hidden')
    q('#scratch-status').textContent = `${main.name} date revealed. ${fmt(mainDate, { dateStyle: 'full' })}.`
    if (moveFocus) q('a', saveAction).focus({ preventScroll: true })
    canvas.style.pointerEvents = 'none'
    if (!motionOK) {
      canvas.hidden = true
      return
    }
    gsap.to(canvas, { opacity: 0, duration: 0.65, onComplete: () => (canvas.hidden = true) })
    gsap.from(under.children, { scale: 0.94, opacity: 0.3, stagger: 0.08, duration: 0.75, ease: 'back.out(1.7)' })
    petals.burst(24)
  }
  revealButton.addEventListener('click', reveal)
  if (!ctx) return
  canvas.addEventListener('pointerdown', (e) => {
    if (pointer !== null || e.button !== 0) return
    pointer = e.pointerId
    canvas.setPointerCapture(e.pointerId)
    last = pos(e)
  })
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer || revealed) return
    const p = pos(e)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 34 * dpr
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(...last)
    ctx.lineTo(...p)
    ctx.stroke()
    last = p
    if (++strokes % 12 === 0 && cleared() > 0.5) reveal()
  })
  const up = (e) => {
    if (e.pointerId !== pointer) return
    pointer = null
    last = null
    if (!revealed && cleared() > 0.45) reveal()
  }
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
})()

/* ---------- countdown ---------- */
const cd = Object.fromEntries(qa('.cd-num').map((el) => [el.dataset.u, el]))
;(function tick() {
  const ms = mainDate - Date.now()
  if (ms <= 0) {
    q('.countdown').hidden = true
    q('.countdown-done').hidden = false
    return
  }
  const s = Math.floor(ms / 1000)
  const v = { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, minutes: Math.floor(s / 60) % 60, seconds: s % 60 }
  for (const [u, el] of Object.entries(cd)) {
    const t = String(v[u]).padStart(2, '0')
    if (el.textContent !== t) el.textContent = t
  }
  setTimeout(tick, 1000 - (Date.now() % 1000))
})()

/* ---------- gallery lightbox ---------- */
const lb = q('.lightbox')
const lbImage = q('img', lb)
const lbCount = q('.lb-count', lb)
let photoIndex = 0
let galleryOpener
let swipeStart
const showPhoto = (index) => {
  photoIndex = (index + gallery.length) % gallery.length
  lbImage.src = gallery[photoIndex]
  lbImage.alt = `Wedding gallery photo ${photoIndex + 1}`
  if (lbCount) lbCount.textContent = `${photoIndex + 1} of ${gallery.length}`
}
q('.polaroids').addEventListener('click', (e) => {
  galleryOpener = e.target.closest('[data-photo]')
  if (!galleryOpener) return
  showPhoto(Number(galleryOpener.dataset.photo))
  lb.showModal()
  lenis?.stop()
})
q('.lb-close', lb).addEventListener('click', () => lb.close())
q('.lb-prev', lb)?.addEventListener('click', () => showPhoto(photoIndex - 1))
q('.lb-next', lb)?.addEventListener('click', () => showPhoto(photoIndex + 1))
lb.addEventListener('click', (e) => e.target === lb && lb.close())
lb.addEventListener('close', () => {
  lenis?.start()
  galleryOpener?.focus({ preventScroll: true })
})
if (gallery.length > 1) {
  lb.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    showPhoto(photoIndex + (e.key === 'ArrowLeft' ? -1 : 1))
  })
  lbImage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || !e.isPrimary) return
    swipeStart = { x: e.clientX, y: e.clientY }
  })
  lbImage.addEventListener('pointercancel', () => (swipeStart = null))
  lbImage.addEventListener('pointerup', (e) => {
    if (!swipeStart) return
    const dx = e.clientX - swipeStart.x
    const dy = e.clientY - swipeStart.y
    swipeStart = null
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(photoIndex + (dx < 0 ? 1 : -1))
  })
}

/* ---------- venues map (loads when it comes near) ---------- */
qa('.copy-address').forEach((button) => {
  let reset
  button.addEventListener('click', async () => {
    const status = q('#venue-status')
    clearTimeout(reset)
    try {
      await navigator.clipboard.writeText(button.dataset.address)
      button.textContent = 'Address copied'
      status.textContent = 'Venue address copied to your clipboard.'
    } catch {
      const details = button.closest('.venue-detail')
      const range = document.createRange()
      range.setStartBefore(q('.venue-name', details))
      range.setEndAfter(q('.venue-address', details))
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      button.textContent = 'Address selected'
      status.textContent = 'Venue address selected. Use your device’s copy command.'
    }
    reset = setTimeout(() => {
      button.textContent = 'Copy address'
      status.textContent = ''
    }, 3200)
  })
})

const mapElement = q('#map')
if (mapElement) {
  new IntersectionObserver(
    async ([entry], io) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      try {
        const L = (await import('leaflet')).default
        const map = L.map(mapElement, { scrollWheelZoom: false })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap contributors' }).addTo(map)
        const icon = L.divIcon({ className: 'pin', html: '<span></span>', iconSize: [26, 34], iconAnchor: [13, 34], popupAnchor: [0, -30] })
        const marks = [...places.values()].map((events) => {
          const [event] = events
          return L.marker([event.lat, event.lng], { icon })
            .addTo(map)
            .bindPopup(`<strong>${events.map((e) => esc(e.name)).join(', ')}</strong><br>${esc(event.venue)}<br><a href="${mapLink(event)}" target="_blank" rel="noopener">Get directions</a>`)
        })
        if (marks.length > 1) map.fitBounds(L.featureGroup(marks).getBounds().pad(0.25))
        else map.setView(marks[0].getLatLng(), 15)
      } catch {
        mapElement.hidden = true
      }
    },
    { rootMargin: '400px' },
  ).observe(mapElement)
}

document.fonts?.ready.then(() => ScrollTrigger.refresh())
addEventListener('load', () => ScrollTrigger.refresh())
