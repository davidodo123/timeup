// Genera los sonidos del juego como WAV (PCM 16 bits, mono) sin dependencias.
// Uso: npm run sounds
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Cada nota: [frecuencia Hz (0 = silencio), duración s]. */
function render(notes, volume = 0.6) {
  const samples = [];
  for (const [freq, dur] of notes) {
    const n = Math.round(dur * RATE);
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      // Envolvente corta para evitar chasquidos.
      const env = Math.min(1, i / 200, (n - i) / 200);
      // Onda cuadrada suavizada: suena a alarma de cocina.
      const s = freq ? Math.tanh(4 * Math.sin(2 * Math.PI * freq * t)) * env * volume : 0;
      samples.push(s);
    }
  }
  return samples;
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(s * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const sounds = {
  alarm: render([
    [988, 0.18], [0, 0.06], [988, 0.18], [0, 0.06], [988, 0.18], [0, 0.12],
    [784, 0.5],
  ]),
  guess: render([[880, 0.07], [1319, 0.12]], 0.4),
  pass: render([[330, 0.12]], 0.35),
  tick: render([[1200, 0.04]], 0.3),
};

const outDir = join(root, 'assets', 'sounds');
mkdirSync(outDir, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  writeFileSync(join(outDir, `${name}.wav`), wav(samples));
  console.log(`assets/sounds/${name}.wav`);
}
