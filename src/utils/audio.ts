// Utilitário de Efeitos Sonoros via Web Audio API (Nativo, sem arquivos pesados)

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playSound(type: 'correct' | 'wrong' | 'fanfare' | 'click' | 'unlock', soundEnabled = true) {
  if (!soundEnabled) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'click') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.05)
    } else if (type === 'correct') {
      // Duolingo-style bright cheerful two-tone chime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'triangle'
      osc2.type = 'sine'

      // G5 (784Hz) then C6 (1046Hz)
      osc1.frequency.setValueAtTime(587.33, now) // D5
      osc1.frequency.setValueAtTime(880, now + 0.1) // A5
      osc2.frequency.setValueAtTime(880, now)
      osc2.frequency.setValueAtTime(1174.66, now + 0.1) // D6

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.45)
      osc2.stop(now + 0.45)
    } else if (type === 'wrong') {
      // Gentle Duolingo-style bonk
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.linearRampToValueAtTime(190, now + 0.25)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.3)
    } else if (type === 'unlock') {
      // Ascending pleasant arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)
        gain.gain.setValueAtTime(0.15, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.25)
      })
    } else if (type === 'fanfare') {
      // Level completion celebration chord
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.18 },
        { freqs: [587.33, 739.99, 880.0], time: 0.2, dur: 0.18 },
        { freqs: [659.25, 830.61, 987.77], time: 0.4, dur: 0.18 },
        { freqs: [783.99, 987.77, 1174.66, 1567.98], time: 0.62, dur: 0.7 },
      ]

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, now + chord.time)
          gain.gain.setValueAtTime(0.12, now + chord.time)
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + chord.dur)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + chord.time)
          osc.stop(now + chord.time + chord.dur)
        })
      })
    }
  } catch {
    // Audio contexts might fail on browsers with strict autoplay policies; fail silently
  }
}
