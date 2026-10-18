# XR dioramas

Interactive 3D teaching models that run in any browser and in VR or mixed reality on a Meta Quest 3.

| Model | Address |
|---|---|
| Matt's Cool Coffee (original animation) | https://graffiticloud.github.io/Matts-cool-coffee-vr/ |
| Matt's Cool Coffee, inside: BAA experiential-marketing quiz | https://graffiticloud.github.io/Matts-cool-coffee-vr/models/baa-cafe/ |

## How it fits together

```
engine/
  kit.js       building blocks: rounded blocks, people, queues, walkers, buildings, trees, cars, tables, lights
  runtime.js   rendering, VR/mixed reality, views, grab and zoom, hotspot pins, quiz, scoring, tutor, panels
  config.js    the two web addresses for the tutor and the score sheet (shared by every model)
models/<id>/
  index.html   a thin page that loads the engine
  scene.js     builds that model's world from the kit
  spec.js      title, module, views, hotspots, questions, tutor brief, privacy notice
ops/
  tutor-worker/worker.js   AI tutor relay (Cloudflare Worker) that keeps the API key off the page
  scores/Code.gs           Google Apps Script that writes every answer to a Google Sheet
```

## Making a new model

1. Copy `models/baa-cafe` to `models/<new-id>`.
2. Rewrite `scene.js` with the kit (keep the loop at 10 seconds, blocks rounded, no textures).
3. Rewrite `spec.js`: give it a new `id`, its hotspots (each with a position above its object) and questions (4 options, one correct, an explanation and a Harvard reference).
4. Commit and push. GitHub Pages publishes it at `/models/<new-id>/` within a couple of minutes.

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
