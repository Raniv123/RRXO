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
    prompt: 'Quiet upscale hotel bar at night, soft jazz piano in the distance, gentle glassware clinking, low murmur of conversation, intimate warm atmosphere, no music vocals',
  },
  {
    id: 'neighbor',
    prompt: 'Warm summer night on a city balcony, distant traffic hum, gentle wind through trees, faint city sounds far away, intimate quiet atmosphere',
  },
  {
    id: 'art-studio',
    prompt: 'Peaceful art studio interior, very soft ambient instrumental music, subtle brush sounds, distant rain on a window, calm creative atmosphere',
  },
  {
    id: 'private-spa',
    prompt: 'Luxurious private spa, gentle water trickling, soft meditation music, warm steam ambient, relaxing atmosphere, no vocals',
  },
  {
    id: 'beach-sunset',
    prompt: 'Tropical beach at sunset, gentle ocean waves lapping on shore, warm breeze, distant seabirds, calm and intimate atmosphere',
  },
  {
    id: 'dance-lesson',
    prompt: 'Empty dance studio at night, soft slow tango music in the background, wooden floor creaks subtly, intimate warm atmosphere',
  },
  {
    id: 'intimate-dinner',
    prompt: 'Upscale candlelit restaurant late evening, soft jazz background music, very faint distant conversation, gentle wine glass clinking, intimate atmosphere',
  },
  {
    id: 'rain-alley',
    prompt: 'Cozy outdoor cafe terrace under a fabric awning during gentle rain, soft raindrops on canvas, warm muffled cafe sounds inside, soft acoustic music from inside, no thunder, intimate warm safe atmosphere',
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
