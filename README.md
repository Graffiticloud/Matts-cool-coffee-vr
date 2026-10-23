# XR dioramas

Interactive 3D teaching models that run in any browser and in VR or mixed reality on a Meta Quest 3.

| Model | Address |
|---|---|
| Matt's Cool Coffee (original animation) | https://graffiticloud.github.io/Matts-cool-coffee-vr/ |
| Matt's Cool Coffee, inside: BAA experiential-marketing quiz | https://graffiticloud.github.io/Matts-cool-coffee-vr/models/baa-cafe/ |
| La Sagrada Família 360: BAA heritage, tourism and commerce quiz | https://graffiticloud.github.io/Matts-cool-coffee-vr/models/sagrada-360/ |
| The Pyramid Field: events health and safety, crowds, operations, servicescape and experience | https://graffiticloud.github.io/Matts-cool-coffee-vr/models/pyramid-field/ |
| Cannes from Le Suquet 360: BAA heritage, port and cruise tourism | https://graffiticloud.github.io/Matts-cool-coffee-vr/models/cannes-360/ |
| The Futures Cone: futures primer with a card sort, time scrubber, wildcards and critique mode | https://graffiticloud.github.io/Matts-cool-coffee-vr/models/futures-cone/ |

## How it fits together

```
engine/
  kit.js       building blocks: rounded blocks, people, queues, walkers, instanced crowds, buildings, trees, cars, tables, lights
  runtime.js   rendering, VR/mixed reality, views, grab and zoom, pins, quiz, scoring, tutor, video pins, 360 video,
               branching scenarios, guide intro, panels
  research.js  opt-in research capture (consent, event log, audio segments)
  config.js    web addresses for the tutor/research Worker and the score sheet (shared by every model)
models/<id>/
  index.html   a thin page that loads the engine
  scene.js     builds that model's world from the kit
  spec.js      title, module, views, hotspots, questions, tutor brief, privacy notice
ops/
  tutor-worker/worker.js   Cloudflare Worker: AI tutor, research logging, audio transcription, export
  scores/Code.gs           Google Apps Script: answers, attempts and decisions to the Sheet; nightly research export
```

## Making a new model

1. Copy `models/baa-cafe` to `models/<new-id>`.
2. Rewrite `scene.js` with the kit (keep the loop at 10 seconds, blocks rounded, no textures).
3. Rewrite `spec.js`: give it a new `id`, its hotspots (each with a position above its object) and questions (4 options, one correct, an explanation and a Harvard reference).
4. Commit and push. GitHub Pages publishes it at `/models/<new-id>/` within a couple of minutes.

## Making a 360° photo model

1. Create `models/<new-id>/` with the photo as `pano.jpg` (equirectangular, 2:1). Use the camera's full-resolution export; 5.7K or larger looks sharp in the headset.
2. Copy `models/sagrada-360/index.html` and `spec.js`. Set `type:'pano'` and `pano:{ src, width, height, start:[x, y], fov, pinRadius }`.
3. Give each hotspot `px:[x, y]`: the pixel position on the photo where its pin should sit.
4. No `scene.js` is needed. Blur the faces of bystanders before publishing.

## Feature reference (spec.js)

- **Video pin**: give a hotspot `video:{ src, poster, title, note }` (or `video:{ youtube:'<id>', title, credit }` for a YouTube clip: plays on desktop and phone, not inside VR). The clip opens first; the pin's questions follow when it ends or is skipped. Add `card:{ sheet, cols, rows, frames, fps, w, aspect, label }` to show an animated image card instead of a numbered pin (make the sprite sheet from a GIF).
- **360 video**: `type:'pano'` with `pano:{ video:'<R2 url>', src:'./poster.jpg', width, height, start, fov, pinRadius }`. MP4 H.264, equirectangular 2:1, 4096×2048 at 20–30 Mbps.
- **Branching scenario**: `scenarios:[{ id, title, start, steps:{ id:{ title, text, effect, choices:[{ label, best, next, feedback, effect }] } | { end:true, outcome, title, text, ref } } }]` and a hotspot with `scenario:'<id>'`. `scene.js` returns `{ effect(name) }` so decisions change the scene. Every decision goes to the Decisions tab.
- **Reflective scenario**: add `mode:'reflect'` (and optionally `stepWord`, `summary` with `{n}`/`{best}`) for positions rather than right answers: neutral feedback headings (or a per-choice `tag`), no "good practice" score unless some choices are `best`.
- **Time scrubber**: `timeline:{ title, button, note, secondsPerStop, suggestions, stops:[{ year, title, text }], ideas:[{ id, label, color, at:[...] }] }` and a hotspot with `timeline:true`. A slider on desktop, stop buttons in the headset. `scene.js` returns `timeline(v, TL)` (v is the fractional stop index; `null` when closed). Each idea's `at` has one `"zone/horizon"`, `"now"` or `"past"` per stop.
- **Side cards**: on desktop the view slides left while a scenario, card sort or time scrubber card is open, so the scene stays visible.
- **Guide intro (Synthetic Matt)**: `intro:{ src:'./intro.mp4', key:0x00ff00, similarity, smoothness, xr:{ pos, height } }`. Pure green background; keyed on the page and in the headset. Plays once per browser session; replay from the HUD.
- **Card sort**: `sorter:{ title, instructions, cone, cards:[{ id, text, reading:{ zone, horizon, why } }] }` and a hotspot with `sorter:true`. Students place cards by pointing into the shape (`cone` gives the apex, length, depth, nested zone radii and horizons), then say whether they want that future. Judgements go to the Judgements tab; the Worker's `/judge` returns the cohort's spread. Not scored. Set `post:false` for glowing, unlit models.
- **Research capture**: only with `?study=CODE` on the address and the participant's consent; audio is a separate tick. Needs ethics approval before use with students.

## Answer keys (kept off the public site)

The repo is public, so specs never contain answers. Author new questions with `answer`, `explain` and `ref` as before, then run:

1. `node ops/keys/split.mjs <model-id>`: strips the keys from `spec.js` and writes them to `ops/keys/keys.local.json` (git-ignored).
2. Add the rows to the **Keys** tab of the private score Sheet (model, question, answer index, explanation, reference).
3. `node ops/quizcheck.mjs`: warns if the right answer is still the longest option.
4. `node ops/stamp.mjs` before every commit, so browsers load the new files straight away.

The Worker's `/check` route marks each answer against the Keys tab (cached for five minutes) and returns the explanation. A student only sees the answer after answering.

## Hosting and data

| What | Where |
|---|---|
| Tutor, research log, transcription | Cloudflare Worker `xr-diorama` (https://xr-diorama.matthew-frew.workers.dev) |
| Large media (360 video, clips) | R2 bucket `xr-media`, public at `https://pub-deabebbc2a4743a28d1d32dd1c97e78d.r2.dev/<path>` |
| Research events, audio, transcripts | R2 bucket `xr-research` (private), copied nightly to Drive › XR diorama data (private) › Research exports |
| Quiz answers, attempts, decisions | Google Sheet "XR diorama scores" in Drive › XR diorama data (private) |

## One-time setup: AI tutor

The tutor runs through a small Cloudflare Worker so the Anthropic API key never appears in the page.

1. Sign in at dash.cloudflare.com (a free account is enough). Go to **Workers & Pages → Create → Create Worker**, name it `baa-tutor`, then **Deploy**.
2. Click **Edit code**, replace everything with `ops/tutor-worker/worker.js`, then **Deploy**.
3. In the Worker's **Settings → Variables and Secrets**, add a **Secret** called `ANTHROPIC_API_KEY` with a key from console.anthropic.com.
4. To cap questions per student: **Storage & Databases → KV → Create** a namespace called `tutor-limits`, then in the Worker's **Settings → Bindings** add a KV binding named `LIMITS` pointing to it. The default cap is 40 questions per student per day; set a `DAILY_LIMIT` variable to change it.
5. Copy the Worker's address (for example `https://baa-tutor.<you>.workers.dev`) into `tutorUrl` in `engine/config.js`.

Cost: each question uses Claude Haiku with short answers, so a cohort asking a few hundred questions costs pennies to low pounds. Set a monthly spend limit in the Anthropic console.

## One-time setup: score sheet

1. In your UWS Google Drive, create a Google Sheet called `XR diorama scores`.
2. **Extensions → Apps Script**. Replace the code with `ops/scores/Code.gs` and save.
3. Choose the `setup` function and press **Run** once (approve the permissions). This creates the **Answers**, **Attempts** and **Summary** tabs.
4. **Deploy → New deployment → Web app**. Execute as **Me**; Who has access **Anyone**. Deploy and copy the web app address.
5. Paste it into `scoresUrl` in `engine/config.js`.

If UWS only allows "Anyone within UWS", students must be signed in to their UWS Google account in the same browser for scores to arrive. Test with a student account before launch.

## Data protection

Each answer is stored with the student number, the question, the answer chosen and whether it was right. Tutor questions go to Anthropic through the Worker without the student number (only a one-way hash for the daily cap). The start screen tells students this. Check the arrangement with the UWS data protection team before releasing a model to a cohort.
