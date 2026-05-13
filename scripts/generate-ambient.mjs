// Generate ambient audio for each fantasy scene using ElevenLabs Sound Effects API.
// Run once locally: node scripts/generate-ambient.mjs
// Outputs MP3 files to public/audio/{fantasy-id}.mp3

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/audio');
const KEY = process.env.ELEVENLABS_API_KEY;

if (!KEY) {
  console.error('Missing ELEVENLABS_API_KEY env var');
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// 22 seconds is the max per generation — we will set loop in the audio element.
const DURATION_SECONDS = 22;

const SCENES = [
  {
    id: 'hotel-stranger',
    prompt: 'Quiet hotel lounge at night, very soft distant murmur, faint glass clinking, gentle air conditioning hum, calm intimate atmosphere, no music',
  },
  {
    id: 'neighbor',
    prompt: 'Warm summer night on a balcony, gentle wind through leaves, faint cricket sounds, distant city hum, peaceful atmosphere, no music',
  },
  {
    id: 'art-studio',
    prompt: 'Quiet art studio interior, soft brush strokes on canvas, faint rain on window, peaceful calm atmosphere, no music',
  },
  {
    id: 'private-spa',
    prompt: 'Calm spa room, gentle water trickling from a small fountain, soft warm steam ambient, peaceful relaxing atmosphere, no music, no vocals',
  },
  {
    id: 'beach-sunset',
    prompt: 'Tropical beach at sunset, gentle ocean waves lapping on shore, warm soft breeze, faint distant seabirds, peaceful calm atmosphere, no music',
  },
  {
    id: 'dance-lesson',
    prompt: 'Quiet wooden dance studio at night, soft footstep creaks on parquet floor, gentle breeze through open window, calm peaceful atmosphere, no music',
  },
  {
    id: 'intimate-dinner',
    prompt: 'Upscale restaurant late evening, very faint distant conversation murmur, gentle glass clinking, candle flicker, calm warm atmosphere, no music',
  },
  {
    id: 'rain-alley',
    prompt: 'Cozy outdoor cafe terrace under a fabric awning, soft steady rain on canvas, gentle water dripping, faint warm muffled sounds from inside, peaceful calm atmosphere, no thunder, no music',
  },
];

async function generate(scene) {
  const outPath = resolve(OUT_DIR, `${scene.id}.mp3`);
  if (existsSync(outPath)) {
    console.log(`  ⏭️  ${scene.id}.mp3 already exists — skipping`);
    return;
  }

  console.log(`  🔊 Generating ${scene.id}...`);
  const start = Date.now();

  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: scene.prompt,
      duration_seconds: DURATION_SECONDS,
      prompt_influence: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${errText}`);
  }

  const buf = Buffer.from(await response.arrayBuffer());
  writeFileSync(outPath, buf);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  ✅ ${scene.id}.mp3 (${(buf.length / 1024).toFixed(0)} KB, ${elapsed}s)`);
}

(async () => {
  console.log(`\n🎵 Generating ambient audio for ${SCENES.length} scenes\n`);
  for (const scene of SCENES) {
    try {
      await generate(scene);
    } catch (err) {
      console.error(`  ❌ Failed ${scene.id}:`, err.message);
    }
  }
  console.log(`\n✅ Done. Files in: ${OUT_DIR}\n`);
})();
