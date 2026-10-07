# AI in Delivery at a New Zealand bank: one feature, one day, two time zones

The showcase film for the New Zealand case study: 5:14, 1920x1080, 24 fps, narrated. It is labelled
"an evolving proof of concept" for its whole running time, and every screen carries synthetic data.

- Film: [`media/nz-bank-showcase.mp4`](../../media/nz-bank-showcase.mp4)
- Storyboard, one frame per scene: [`storyboard.jpg`](storyboard.jpg)
- Source script: `SCRIPT-ai-in-delivery-showcase-a-new-zealand-bank.md` (supplied by Miles Blair)
- Closing scene and claims: `CLOSING-SCENE-and-PR-NARRATIVE-ncino-accenture.md` (7 October 2026). Its Part A replaces scene 10, and its claims checklist applies to the whole film.

## How it was made

This film uses the craft rules of the `hypevideo` skill (`knowledge/skills/hypevideo/` in the Banksy brain). It does not use that skill's 75-second spine. The decision was signed off by Miles Blair on 2026-10-06.

**Taken from hypevideo:**
- A living camera: one eased push per scene, never reversed.
- Typed headlines at about 24 characters per second, with one accent word.
- Exactly one accent colour (`#A100FF`).
- No glow, no glass and no giant white type.
- The product's own paper and ink.
- No em dashes and no exclamation marks.
- The narration is written as sentences, with no lists read aloud and every take measured.
- Every narration line is checked with speech-to-text.
- Web loudness of -14 LUFS / -1 dBTP.

**Departures from hypevideo:**
- **Length:** a 5:14 explainer rather than the 75 s music-cut spine. The script targeted 4:30. The reworked setup scene (2) and closing scene (10) need 30 more seconds to be readable, and the team card (12) adds 14.
- **Music:** "Tech Talk" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. It is upbeat electronic at 139.6 BPM, credited on the closing card as the licence requires.
  - **Length:** extended from 4:02 to 5:16 by repeating 43 bars from its middle, spliced on the downbeat where the music best matches itself (0.994 spectral match). See `extend_music.py 43`. The mix fades it out with the picture at 5:14.
  - **Mix:** the bed head-fades from silence over 2.5 s, ducks under every spoken line (150 ms attack, 600 ms release) and sits at about -21 dB in the gaps.
  - **Licensing:** it is not a licensed library track. If a licensed library such as Epidemic is required for client use, swap the file and re-run `mix.py`; nothing else changes.
- **Plates and people:** none. Every shot is a product screen, a diagram or a title card.
- **Screens:**
  - The script asks for real recordings with synthetic content. These are faithful recreations, rendered as HTML, of Claude Cowork, Jira, Claude Code in a terminal and a GitHub pull request.
  - Every value on them is synthetic.
  - Miles directed this as a demonstration of how the flow could work.
  - Real recordings can replace any screen scene without re-timing. The shot list below gives the exact state each one needs.
- **Voice:** Chatterbox (Resemble AI, MIT licence), an expressive open TTS model, run locally at exaggeration 0.7.
  - **Expressiveness:** it carries about twice the pitch movement of the first cut's voice (14 to 15 semitones of range against 7.5), at a livelier pace of about 3.5 to 4.4 words a second.
  - **Pronunciation:** "nCino" is spelled "Encino" in the voice input only, so it is said "en-SEE-no". The captions are unchanged.
  - **ElevenLabs:** the ElevenLabs voices on the Banksy box write audio to the box and cannot be exported as `.mp3`. To use them instead, regenerate the 40 lines in `lines.json` into `v2/` and re-run `timing.py`, `render.js` and `mix.py`.

## Scenes, cues and captions

Times are absolute. Narration cues are the start of each spoken sentence. Changes made on 2026-10-07:
- Scene 2 was reworked to show the actual setup.
- Scene 10 was replaced with Part A of the closing-scene brief.
- Internal environment names (ST2, SIT) were taken off every screen, per that brief's claims checklist. Every screen now says "handed to the bank for its testing" instead.

| # | Window | Screen | Narration cues | On-screen captions (from the script) |
|---|---|---|---|---|
| 1 | 0:00-0:10 | Title cards | 0.4, 6.0 | "What if your delivery methodology didn't live in documents, but ran inside the work?" then "AI in Delivery. A New Zealand bank, one feature, one day." |
| 2 | 0:10-0:46 | The setup (dark, in the Delivery Cockpit diagram language) | 10.5, 13.7, 20.7, 27.1, 35.5, 41.2 | People orchestrate, with Accenture people with the skills shown on a band carrying the Accenture logo. The flow runs left to right: the lending repository, then Discovery agents and skills, then people review at discovery, then Development agents and skills, then people review at code, then agents execute the remaining tasks. The nCino MCP hub, with the nCino logo, connects to every step. Credits on the diagram: "Discovery and functional agents · Miles Blair, Delivery Lead"; "Code and development agents · Fabian Goetzens, Noland Smith". Tagline, with the nCino logo left and the Accenture logo right: "Grounded in nCino. Decided by people. Delivered by Accenture." Sub-line: "The first SI partner to run the nCino MCP in a live SDLC. nCino's knowledge at every step, human checkpoints at discovery and code, and the people with the skills to make the efficiency real." |
| 3 | 0:46-0:51 | Title | 46.5 | "One feature. Morning in Wellington, afternoon in Manila." |
| 4 | 0:51-1:21 | Claude Cowork | 51.5, 57.9, 62.6, 67.8, 76.7 | "The page was signed off weeks ago. The org has changed since. The first question is not 'what do we build' but 'what is still true'." / "Every claim it makes carries a path. No path, no claim." |
| 5 | 1:21-1:56 | Claude Cowork, reconcile report | 81.5, 86.9, 94.7, 103.8, 108.3 | "A gap in the requirement, routed to the person who owns the answer." / "A platform question, routed to the platform. Never assumed." / "The agent found them. She decided they were real. The clock starts." |
| 6 | 1:56-2:36 | Claude Cowork, then Jira | 116.5, 123.1, 127.9, 133.5, 142.6, 149.5 | "Prescriptive enough to start. Where the repository does not hold a fact, the task carries the question, not a guess." / "Lineage from feature page to ticket, kept by the repository, not by memory." Clock reaches 11:40 Wellington. |
| 7 | 2:36-2:41 | Title | 156.5 | "Six hours later." |
| 8 | 2:41-3:35 | Claude Code, terminal | 161.5, 170.9, 178.6, 185.3, 193.3, 200.5, 205.2 | "The ticket arrives with its story, its criteria and its lineage. No copy-paste." / "No impact map, no edit. The flow edit guard enforces it, not a reviewer's memory." / "The gate blocks; it never softens on a second attempt." / "The developer generates it once tests pass. From handoff it belongs to the tester, who runs it in the bank's own testing. The developer never edits it again." |
| 9 | 3:35-4:00 | Claude Code, GitHub PR, Claude Code | 215.5, 222.2, 228.8, 234.8 | "Nothing merges by machine. A named reviewer approves. On merge, CI hands it to the bank for its testing; the tester picks up the plan." / "The second time the same lesson is hit, it graduates into a skill or a gate." Clock reaches 17:20 Manila. |
| 10 | 4:00-4:50 | Measured outcome, in four beats | 240.5, 245.8, 254.8, 265.2, 271.9, 281.3 | **1, headline and figures.** "Measured sprints · AI on against AI off · one month in". "The information is at the programme's fingertips, and the delivery pod is shaped around it."<br>- ≈3× Velocity: tickets completed per two-week sprint. About 35 a sprint against 11 or 12, handed to the bank for its testing.<br>- ≈2.8× Work delivered per sprint, in story points. Story size unchanged at about 5.5.<br>- ≈2× Per developer, same people.<br>**2, what the 3× is made of.** About 2× the user stories (26 against 11 or 12), and a backlog of older bugs cleared. The brief's explanation block follows, with "roughly half" written as "a significant share" because the tagged bug split is not yet captured.<br>**3, four statements, each with its caption.** Nothing carried forward (25 of 25). Problems found close to where they are made (three real tickets to production, no new defects). One standard for every developer. Built on what nCino already provides.<br>**4, the model.** "A reusable model, trained into the squad in nine weeks: 13 of 13 ready, and packaged for the next cohort." Beneath it: "The bank plans on a 30 to 40 percent gain on design, build and unit test only, and none on its own testing phases. The measured uplift is the evidence, not the commitment." |
| 11 | 4:50-5:00 | Close and credits | 290.5 | "Agents draft. People decide. Nothing merges by machine." / "An evolving proof of concept, live in a New Zealand bank's SDLC since September 2026." / Credits: "Discovery and functional agents · Miles Blair, Delivery Lead. Code and development agents · Fabian Goetzens, Noland Smith. Run with the bank's nCino squad." Accenture mark. |
| 12 | 5:00-5:14 | The team, who to reach out to | 300.5 | "The team · who to reach out to". "Talk to the people who built it". Six cards with name, role, contribution and email:<br>- Miles Blair, Delivery Lead: designed the discovery agents and ways of working. miles.blair@accenture.com<br>- Fabian Goetzens, AI Engineer: delivered the development and test agents. fabian.goetzens@accenture.com<br>- Noland Smith, Anthropic Lead: enabled the technical setup. noland.smith@accenture.com<br>- Phinizy Wimberly, Engagement Lead. thomas.wimberly@accenture.com<br>- Andreas Habib, Functional Designer: provided inputs into the discovery agents. andreas.habib@accenture.com<br>- Mozammil Hassan, Functional Designer: provided inputs into the discovery agents. muhammad.m.hassan@accenture.com<br>Accenture logo. Fades to black. |

The full narration is in `lines.json`, one sentence per entry.

## Screen shot list

Use this list to capture real screens to replace the recreations. Every dataset is fictional.

| Scene | Tool | State to capture | Synthetic dataset |
|---|---|---|---|
| 4 | Claude Cowork | Drop room open. Feature page HBL-F03 shown, signed off 19 Aug 2026, flagged "org has changed since sign-off". Then Refinement & Reconcile runs and loads:<br>- `drop-rooms/hbl/`<br>- `requirements/id-map.yaml`<br>- `drops/drop-1/` and `drops/drop-2/`<br>- `policy/rule-packs/`<br>- `as-built/ncino-snapshot/`<br>It then makes one claim with its path. | Harbour Business Line, a fictional business-lending product. Feature HBL-F03, "Business lending, application to booked". |
| 5 | Claude Cowork | Reconcile report with:<br>- the Feature Process Map: banker, credit, nCino and off-platform lanes, two steps flagged<br>- Q-01: owner business analyst<br>- Q-02: owner nCino Professional Services, with fictional PDI reference PDI-SYN-0417<br>Each question has a 3-day clock. Report accepted, questions posted to Open questions. | As above |
| 6 | Claude Cowork | Story Writer: three stories, criteria citing rules BL-03, BL-07, CR-12, CR-15 and PE-02. Story 3 is marked "Draft · blocked by Q-01, Q-02", and the SOP updates sit in their own section. Task Decomposer: four tasks with object, field, class, contract ref, tests and profile. One task carries a question. One cell is edited, then approved. | As above. Contract refs CT-LOAN-01/07/09 and CT-ACCT-04 are fictional. |
| 6 | Jira | HBL board with Feature HBL-F03, Stories HBL-101 to 103 (103 in draft) and Tasks HBL-104 to 107, each with a parent link. Ticket IDs written back. | Fictional project "Harbour Business Line (synthetic)" |
| 8 | Claude Code, terminal | The following in order:<br>- identity banner, `/health` CLEARED<br>- `/my-tickets`, then `/ticket HBL-106`<br>- the flow edit guard blocks the edit on `HBL_Approval_Router`<br>- `/impact`: 3 callers, 1 cross-domain edge, 60-minute unlock<br>- the edit lands<br>- `/ncino-fit` ADAPT, then `/validate` check-only Succeeded<br>- unit-test gate BLOCKED on one missing assertion, fixed, re-run PASSED<br>- QA Plan agent writes `qa-plans/HBL-106.md` and hands off to the tester | Repo `lending-delivery`, cloned org `dev-clone-hbl`, guidance ref KA-SYN-0192, all fictional |
| 9 | Claude Code, terminal | `/pr` reviewer-first body, the printed `gh pr create`, which is then run | As above |
| 9 | GitHub | PR #212 in `example-lending/lending-delivery`. Four checks run then go green: map freshness, QA plan presence, Apex test evidence, off-limits token scan. The named reviewer (`reviewer-a`) approves. | Fictional org and repo |
| 9 | Claude Code, terminal | `/retro`: one lesson captured, graduates on the second hit | As above |

The Salesforce deployment-history shot in scene 9 is optional in the script and was not used.

## Anonymisation check

These checks were done before export:

- **The bank:** it appears only as "a New Zealand bank".
- **Bank employees:** shown by role only (functional consultant, business analyst, developer, tester, named reviewer). No bank employee is named.
- **Identifiers:** every ID, path, org, repo and reference is fictional. HBL, PDI-SYN, KA-SYN and example-lending are all invented.
- **Production screenshots:** none.
- **Credits:** Accenture names appear only on the scene 2 diagram, the scene 11 credits card and the scene 12 team card. Scene 12 adds Phinizy Wimberly, Andreas Habib and Mozammil Hassan, with each person's email, at Miles Blair's request on 2026-10-07.
- **Logos:** the Accenture and nCino logos appear only in scene 2 (the diagram and the tagline) and on the scene 11 card (Accenture). `logos/ncino-on-dark.svg` is the repo's nCino logo with its wordmark recoloured white for the dark scene.
- **Figures:** every figure is one given in the script or the closing-scene brief.
- **Environment names:** none on screen (no SIT, ST2 or Preprod).
- **Names used:** every agent, command, hook and gate named is one listed in the script.

## Measurements

- Picture: 7536 frames at 24 fps = 314.000 s.
- Narration: 40 sentences, each measured after rendering and gated by speech-to-text (faster-whisper base.en, `gate.py`) for wording and pace.
  - Seven lines failed the first gate and were regenerated: a mis-said word, a question-like rise, or a pace over 4.5 words a second.
  - Two of those were still fast and were slowed by about 10% with pitch-preserving time-stretch.
- Mix, before the single loudnorm gain (the separation column is the voice-to-bed gap):

| Scene | Voice dB | Bed under voice | Separation | Bed in gaps |
|---|---|---|---|---|
| 1 | -19.2 | -37.3 | 18.1 | -30.8 |
| 2 | -20.2 | -29.9 | 9.7 | -22.0 |
| 3 | -19.6 | -27.6 | 8.0 | -23.7 |
| 4 | -20.0 | -29.5 | 9.4 | -22.5 |
| 5 | -20.4 | -30.3 | 9.8 | -22.7 |
| 6 | -20.2 | -30.1 | 9.8 | -23.8 |
| 7 | -20.0 | -26.5 | 6.5 | -22.5 |
| 8 | -20.0 | -29.7 | 9.7 | -21.4 |
| 9 | -19.8 | -29.0 | 9.2 | -23.1 |
| 10 | -19.7 | -29.7 | 10.0 | -20.9 |
| 11 | -20.1 | -28.5 | 8.4 | -20.2 |
| 12 | -20.5 | -28.8 | 8.3 | -24.1 |

- Master: -14.1 LUFS integrated, -1.5 dBTP (web).

## Rebuild

From this folder, with Node, Playwright (Chromium), ffmpeg, Python with `faster-whisper`, and a Python 3.11 venv with `chatterbox-tts`:

```bash
python3.11 tts_expressive.py   # lines.json -> v2/vo_<scene>_<n>.wav  (pass line keys to redo only those)
python3 gate.py                # speech-to-text and pace gate on every line
python3 timing.py              # measured line lengths + lines.json pauses -> timing.json (cue times)
node render.js full            # film.html + timing.json -> picture.mp4
python3 extend_music.py 43     # music/Tech_Talk.mp3 -> music/tt_ext.wav (5:15.9)
python3 mix.py v2              # voice + ducked bed, level table, two-pass loudnorm -> mix_master.wav
ffmpeg -i picture.mp4 -i mix_master.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart nz-bank-showcase.mp4
```

`film.html` is the whole film. Each element's arrival is tied to a narration cue (`data-in="<sentence>:<offset>"`), so changing a line and rebuilding re-times the picture automatically.
