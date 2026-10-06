# AI in Delivery at a New Zealand bank: one feature, one day, two time zones

The showcase film for the New Zealand case study: 4:30, 1920x1080, 24 fps, narrated. It is labelled
"an evolving proof of concept" for its whole running time, and every screen carries synthetic data.

- Film: [`media/nz-bank-showcase.mp4`](../../media/nz-bank-showcase.mp4)
- Storyboard, one frame per scene: [`storyboard.jpg`](storyboard.jpg)
- Source script: `SCRIPT-ai-in-delivery-showcase-a-new-zealand-bank.md` (supplied by Miles Blair)

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
- **Length:** 4:30 explainer, as the script asks, rather than the 75 s music-cut spine.
- **Music:** none. The film is narration only.
- **Plates and people:** none. Every shot is a product screen, a diagram or a title card.
- **Screens:**
  - The script asks for real recordings with synthetic content. These are faithful recreations, rendered as HTML, of Claude Cowork, Jira, Claude Code in a terminal and a GitHub pull request.
  - Every value on them is synthetic.
  - Miles directed this as a demonstration of how the flow could work.
  - Real recordings can replace any screen scene without re-timing. The shot list below gives the exact state each one needs.
- **Voice:** a local neural TTS (Kokoro v1.0, voice `af_heart`). The ElevenLabs voices on the Banksy box write audio to the box and cannot be exported as `.mp3`. To swap them in, regenerate the 40 lines in `lines.json` with ElevenLabs and rebuild the track with `build_audio.py`. The cue times stay the same.

## Scenes, cues and captions

Times are absolute. Narration cues are the start of each spoken sentence.

| # | Window | Screen | Narration cues | On-screen captions (from the script) |
|---|---|---|---|---|
| 1 | 0:00-0:10 | Title cards | 0.4, 6.3 | "What if your delivery methodology didn't live in documents, but ran inside the work?" then "AI in Delivery. A New Zealand bank, one feature, one day." |
| 2 | 0:10-0:35 | Engine diagram | 10.5, 13.5, 22.1, 25.5, 29.3 | "Grounded in the bank's own repository and nCino's own guidance through the Admin MCP. Human checkpoints at every gate. Hooks and CI enforce the rules mechanically." Credits on the diagram: "Discovery and functional agents · Miles Blair, Delivery Lead"; "Code and development agents · Fabian Goetzens, Noland Smith". |
| 3 | 0:35-0:40 | Title | 35.5 | "One feature. Morning in Wellington, afternoon in Manila." |
| 4 | 0:40-1:10 | Claude Cowork | 40.5, 47.7, 51.5, 55.8, 65.3 | "The page was signed off weeks ago. The org has changed since. The first question is not 'what do we build' but 'what is still true'." / "Every claim it makes carries a path. No path, no claim." |
| 5 | 1:10-1:50 | Claude Cowork, reconcile report | 70.5, 76.3, 86.0, 96.7, 101.8 | "A gap in the requirement, routed to the person who owns the answer." / "A platform question, routed to the platform. Never assumed." / "The agent found them. She decided they were real. The clock starts." |
| 6 | 1:50-2:30 | Claude Cowork, then Jira | 110.5, 117.9, 123.0, 128.4, 138.9, 147.1 | "Prescriptive enough to start. Where the repository does not hold a fact, the task carries the question, not a guess." / "Lineage from feature page to ticket, kept by the repository, not by memory." Clock reaches 11:40 Wellington. |
| 7 | 2:30-2:35 | Title | 150.5 | "Six hours later." |
| 8 | 2:35-3:35 | Claude Code, terminal | 155.5, 166.9, 175.6, 183.5, 193.3, 201.2, 206.4 | "The ticket arrives with its story, its criteria and its lineage. No copy-paste." / "No impact map, no edit. The flow edit guard enforces it, not a reviewer's memory." / "The gate blocks; it never softens on a second attempt." / "The developer generates it once tests pass. From handoff it belongs to the tester, who executes in ST2. The developer never edits it again." |
| 9 | 3:35-4:00 | Claude Code, GitHub PR, Claude Code | 215.5, 222.7, 230.0, 237.0 | "Nothing merges by machine. A named reviewer approves. On merge, CI deploys to ST2; the tester picks up the plan." / "The second time the same lesson is hit, it graduates into a skill or a gate." Clock reaches 17:20 Manila. |
| 10 | 4:00-4:20 | Figures | 240.5, 249.3, 253.9 | Labelled "Measured sprints · AI on against AI off": velocity to SIT ≈ 3×; story points to SIT ≈ 2.8×, story size unchanged; per developer ≈ 2×. "Bugs per story rose from 0.77 to 1.08. Faster build exposes acceptance-criteria gaps sooner. That is why the shaping agents exist." "The bank plans on 30 to 40 percent on design, build and unit test only, and zero on SIT and UAT. The measured uplift is the evidence, not the commitment." |
| 11 | 4:20-4:30 | Close and credits | 260.5 | "Agents draft. People decide. Nothing merges by machine." / "An evolving proof of concept, live in a New Zealand bank's SDLC since September 2026." / Credits: "Discovery and functional agents · Miles Blair, Delivery Lead. Code and development agents · Fabian Goetzens, Noland Smith. Run with the bank's nCino squad." Accenture mark. |

The full narration is in `lines.json`, one sentence per entry.

## Screen shot list

Use this list to capture real screens to replace the recreations. Every dataset is fictional.

| Scene | Tool | State to capture | Synthetic dataset |
|---|---|---|---|
| 4 | Claude Cowork | Drop room open. Feature page HBL-F03 shown, signed off 19 Aug 2026, flagged "org has changed since sign-off". Then Refinement & Reconcile runs and loads:<br>- `drop-rooms/hbl/`<br>- `requirements/id-map.yaml`<br>- `drops/drop-1/` and `drops/drop-2/`<br>- `policy/rule-packs/`<br>- `as-built/ncino-snapshot/`<br>It then makes one claim with its path. | Harbour Business Line, a fictional business-lending product. Feature HBL-F03, "Business lending, application to booked". |
| 5 | Claude Cowork | Reconcile report with:<br>- the Feature Process Map: banker, credit, nCino and off-platform lanes, two steps flagged<br>- Q-01: owner business analyst<br>- Q-02: owner nCino Professional Services, with fictional PDI reference PDI-SYN-0417<br>Each question has a 3-day clock. Report accepted, questions posted to Open questions. | As above |
| 6 | Claude Cowork | Story Writer: three stories, criteria citing rules BL-03, BL-07, CR-12, CR-15 and PE-02. Story 3 is marked "Draft · blocked by Q-01, Q-02", and the SOP updates sit in their own section. Task Decomposer: four tasks with object, field, class, contract ref, tests and profile. One task carries a question. One cell is edited, then approved. | As above. Contract refs CT-LOAN-01/07/09 and CT-ACCT-04 are fictional. |
| 6 | Jira | HBL board with Feature HBL-F03, Stories HBL-101 to 103 (103 in draft) and Tasks HBL-104 to 107, each with a parent link. Ticket IDs written back. | Fictional project "Harbour Business Line (synthetic)" |
| 8 | Claude Code, terminal | The following in order:<br>- identity banner, `/health` CLEARED<br>- `/my-tickets`, then `/ticket HBL-106`<br>- the flow edit guard blocks the edit on `HBL_Approval_Router`<br>- `/impact`: 3 callers, 1 cross-domain edge, 60-minute unlock<br>- the edit lands<br>- `/ncino-fit` ADAPT, then `/validate` check-only Succeeded<br>- unit-test gate BLOCKED on one missing assertion, fixed, re-run PASSED<br>- QA Plan agent writes `qa-plans/HBL-106-ST2.md` and hands off to the tester | Repo `lending-delivery`, cloned org `dev-clone-hbl`, guidance ref KA-SYN-0192, all fictional |
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
- **Credits:** the Accenture names (Miles Blair; Fabian Goetzens; Noland Smith) appear only on the scene 2 diagram and the scene 11 credits card.
- **Figures:** every figure is one given in the script.
- **Names used:** every agent, command, hook and gate named is one listed in the script.

## Measurements

- Picture: 6480 frames at 24 fps = 270.000 s.
- Narration: 40 sentences. Each was measured after rendering and checked with speech-to-text (faster-whisper base.en). Every line transcribed as written. "nCino" transcribes as "Encino", which is the correct pronunciation.
- Loudness of the narration master: -14.3 LUFS integrated, -1.0 dBTP.

## Rebuild

From this folder, with Node, Playwright (Chromium), ffmpeg and Python with `kokoro-onnx`:

```bash
python3 tts.py            # lines.json -> vo_<scene>_<n>.wav, vo_timing.json
python3 timing.py         # vo_timing.json -> timing.json (cue times)
node render.js full       # film.html + timing.json -> picture.mp4
python3 build_audio.py    # cue placement + two-pass loudnorm -> vo_master.wav
ffmpeg -i picture.mp4 -i vo_master.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart nz-bank-showcase.mp4
```

`film.html` is the whole film. Each element's arrival is tied to a narration cue (`data-in="<sentence>:<offset>"`), so changing a line and rebuilding re-times the picture automatically.
