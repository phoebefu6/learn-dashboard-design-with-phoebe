# Agent brief - shared by every fan-out page of learn-dashboard-design-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   how many options each question has (FOUR, labelled "A · ", "B · ", "C · ", "D · "):
   - `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-dashboard-design-with-phoebe/courses/01-who-looks-what-they-decide.html`
   - For rhythm only (the bench page; do not copy its widget): `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-dashboard-design-with-phoebe/courses/06-the-red-amber-green-bench.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-dashboard-design-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens (first 36 lines):
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-dashboard-design-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "Session N of 6", linked repo name as in the template, #toggle-all,
#zoom-toggle) · masthead (eyebrow "Learn Dashboard Design with Phoebe · Session N of 6", h1 with one
`<span class="accent">`, .sub, .chip-row with the level chip (🟡 Core for sessions 2 and 3, 🟠 Deeper
for 4 and 5) plus two .chip.audience and the .chip.time "45 min", .agenda a1-a4) · main.wrap ·
section#intro (Part 0: kicker, .lede, .legend pills as in the template, .callout.win "★ What you walk
out with tonight") · 3 Parts, each `section.section#part-N` with section-kicker (klabel "Part N ·
covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card` accordions
(summary: `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example`
with `span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker `.tag.demo "★ 22 min ·
everyone builds"`, .lede, ONE figure, `.steps > .step`, each with a `.prompt-box.good` carrying a
`span.label`; the build-along is Tomas's work on the constructed Saltmarsh weekly operations dashboard,
written as plain-text worksheets the learner fills for a dashboard of their own) · section#exercise
Homework (ol, 4 items) · section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, four
`button.qopt` "A · ..." as in the template, `p.qwhy`; one `p.quiz-score` after the last; vary the
correct letter) · section#official, h2 EXACTLY "What this session teaches, and where it came from",
`.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY
"Every fact on this page, and its verification tier, is recorded in the course's source map." ·
section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>", .grid-2 of six
.cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot ·
`<script src="../assets/app.js?v=1"></script>`.

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn dashboard design with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 6" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. Saltmarsh numbers (the Monday 09:00
  stand-up, four questions, one screen, the six cards) are constructed and say so on first use per
  Part. Olist numbers are real and only the ones the map lists; name Olist as the source.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
  "Miller's seven" is NOT a tile count; the F-pattern is a scanning behaviour on text-heavy pages
  that NN/g itself calls bad, not a layout law; "5 users find 85%" is a model with a stated typical
  L of 31% and a comparable-users caveat. Teach each exactly as the map tiers it.
- Citations in the exact form of the map's appendix; anything the map marks reported is "reported"
  on the page (Few's book, Tufte's data-ink ratio, pre-attentive attributes, the Okabe-Ito values).
- NEVER "lottery" or "lotteries"; say the mechanism. No Chinese terms.
- No business-intelligence product or vendor is named as a recommendation; speak of tool classes
  ("a BI tool", "a spreadsheet", "a notebook").
- Never a cross mark glyph (✗, ×, ❌) anywhere, including figures: label a wrong way in words and use
  the universal reds only for that panel.
- Light surfaces only: no dark panel, band or code box on any new surface.
- The taught red / amber / green are STATE colours, drawn only with the `--state-*` tokens (`#B42318`
  `#FDE8E6`, `#E8A317` `#FFF3D1`, `#1E9E5A` `#DCF5E6`) and always labelled as the card's state, never
  as decoration; text on a state fill is ink `#141C2E` (white only on `#B42318`). The palette's signal
  green `#2DBE7A` is a fill under ink text, never text itself.
- Titles, widget ids and class names must not collide with siblings: do not reuse "Two thresholds,
  and a band that belongs to a human", "Pick a threshold", "Alert or noise", "Reading a dashboard like a
  leader", "Chart choice + dashboard grammar", "Colour that works", "Choosing the form"; do not use ids
  or classes starting `dsh-`, `mb-`, `ab-`, `dt-`, `f1`, `f6` (those belong to other pages or the bench).
- Seams: one line and an absolute link, never teach the neighbour's content (see Cross-links). Chart
  form, colour theory and marks belong to Dataviz; the data model and building in a tool belong to
  Business Intelligence; pipeline alerting and SLOs belong to Data Observability and Data Reliability;
  general UX method belongs to Product Design; narrative belongs to Visual Storytelling.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): #2460D0 (accent) #163C8A (accent-deep) #1D4FB0 (mid)
#B9CDF2 (soft) #EDF3FD (accent-50) #141C2E (ink) #566178 (muted) #C5CEDF (faint) #E3E9F3 (hairline)
#2DBE7A (contrast, signal green, fill only) #0B5A3B (contrast-ink) #E3F7EC (contrast-50) #FBFCFE
(paper) · state tokens #B42318 #FDE8E6 #E8A317 #FFF3D1 #1E9E5A #DCF5E6 (card states only) · `#FFFFFF`
· universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `f<session><letter>`, e.g. f2a, f2b, f2c,
  f2d for session 2 (f3a.. for session 3, f4a.., f5a..).
- `<defs>` holds with prefix P: a wobble filter `id="PSk"` (`feTurbulence type="fractalNoise"
  baseFrequency="0.02" numOctaves="2" seed="<int>"` + `feDisplacementMap scale="2.4"
  xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%" width="106%" height="106%"`), a
  hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one #2460D0 line, opacity .5) if used,
  an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, #141C2E stroke 1.6) if used. ALL
  shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#141C2E" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-4 to 4 degrees for
  hand-placed items, under 1 for panels). Fills: white, #EDF3FD, the hachure for "the pile" or "the
  data", and the signal green ONLY for the one thing the figure is about. One doodle anchor per
  figure, simple strokes, never a mascot. Text classes (copy the template's `<style>` block, renamed):
  `.PH` 800 12px ink heading · `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800 11px
  #0B5A3B · `.PV` 800 12-20px #163C8A value · `.PW` 800 11-12px white on a dark fill (#163C8A,
  #1D4FB0, #2460D0 or #B42318 only) · `.PA` 700 11px #2460D0 caption · `.PN` 400 12px muted note.
  Hand-stacked items must not overlap as painted rects.
- ALL `<text>` OUTSIDE the filtered group, sans stack, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110 chars;
  40px between neighbouring point labels; bottom note 22px below the last row, H clears it by 8px.
  When in doubt, shorten. NO line, arrow or curve may pass through or touch a text label (the gate
  flags line-through-text): route arrows in the gaps and put edge labels clear of the path.
- Floor: one figure per Part plus one in the build-along (4 figures). Draw the MECHANISM (e.g. the
  eye's path across a screen as a numbered route with the one number it lands on first; visual weight
  as size x contrast x position drawn as three dials feeding one tile; a screen cut into question
  groups against the same tiles grouped by data source; the KPI card anatomy with value, delta and
  context band called out; a filter that resets to a default on load against one that remembers; the
  five-user task test as five rows of task outcomes), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a story: Saltmarsh (labelled constructed on first use per Part) or a generic "a
familiar pattern" with no invented numbers. The `.callout.example` "Real world" pill may hold a
familiar workplace pattern described without statistics, or a Saltmarsh moment labelled constructed.
People at Saltmarsh: Nia (operations lead, the Monday reader), Tomas (analyst who designs the
dashboard), Priya (managing director who asked for "a dashboard"), Kofi (warehouse lead). The
dashboard answers four questions at the Monday 09:00 operations stand-up: are deliveries slipping, did
demand fall, did the money fall, where is the backlog. Its numbers, when any appear, are Olist's daily
series as listed in the map (named as Olist's), never invented Saltmarsh figures.

## Cross-links (absolute URLs)

- Chart form, colour theory, marks: https://phoebefu6.github.io/learn-dataviz-with-phoebe/ (colour: https://phoebefu6.github.io/learn-dataviz-with-phoebe/courses/04-colour-that-works.html)
- Reading a dashboard as a leader: https://phoebefu6.github.io/learn-business-intelligence-with-phoebe/courses/a2-reading-a-dashboard.html
- Commissioning dashboards, the data model, building in a tool: https://phoebefu6.github.io/learn-business-intelligence-with-phoebe/courses/a4-commissioning-dashboards.html
- Dashboard to decision for executives: https://phoebefu6.github.io/learn-data-literacy-with-phoebe/
- Narrative with data: https://phoebefu6.github.io/learn-visual-storytelling-with-phoebe/
- Pipeline alerting, SLOs and burn rates: https://phoebefu6.github.io/learn-data-observability-with-phoebe/ and https://phoebefu6.github.io/learn-data-reliability-with-phoebe/
- Detectors: https://phoebefu6.github.io/learn-anomaly-detection-with-phoebe/
- General UX method: https://phoebefu6.github.io/learn-product-design-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

Footer left: "Session N of 6 · learn-dashboard-design-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>" (last page: "← Prev" and "<a href="../index.html">Course home →</a>").

Session titles and files (exact, sentence case, one accent span in h1, accent word in brackets):
1. 01-who-looks-what-they-decide.html · Who (looks), and what they decide
2. 02-hierarchy-first-glance.html · Hierarchy and the first (glance)
3. 03-density-grouping-white-space.html · Density, grouping and (white space)
4. 04-colour-as-state.html · Colour as (state)
5. 05-interaction-defaults-usability-test.html · Interaction, defaults and the (usability test)
6. 06-the-red-amber-green-bench.html · The (red-amber-green) bench

## One-line outlines for the fan-out pages (02 to 05)

- **02 Hierarchy and the first glance.** Part 1 visual weight = size x contrast x position (three dials
  feeding one tile; the one number); Part 2 reading order and the F-pattern taught as what NN/g found on
  text-heavy pages and itself called bad, so a dashboard is laid out so no F is needed (Nielsen 2006 and
  Pernice 2017, read); Part 3 the squint test and Miller's seven as what the paper does NOT claim
  (Miller 1956, read; pre-attentive attributes reported). Build-along: Tomas's first-glance layout toy for
  the Saltmarsh screen, constructed, labelled. Quiz on weight, the one number, the F-pattern caveat.
- **03 Density, grouping and white space.** Part 1 one screen (Few's 2004 definition, read in the
  Perceptual Edge PDF; "data-ink ratio" reported as Tufte's); Part 2 tiles vs tables and group by the
  question, not by the data source; Part 3 progressive disclosure: what is on the screen, what is one
  click away, what is a report. Build-along: cutting Saltmarsh's 23 candidate tiles to six, constructed.
- **04 Colour as state.** Part 1 KPI card anatomy: value, delta, context band (what the bench draws);
  Part 2 red / amber / green as STATE, with the `--state-*` tokens, never as decoration, and colour never
  the only channel (WCAG 2.2 1.4.1, read) plus contrast 4.5:1 and 3:1 (1.4.3, 1.4.11, read); Part 3
  colour-blind safety ("about 1 in 12 men", NEI, read; Okabe-Ito palette reported) and when colour should
  mean nothing. Build-along: the Saltmarsh "late deliveries" card in four states, constructed layout with
  Olist's late-share series named as the numbers. Points forward to session 6's thresholds.
- **05 Interaction, defaults and the usability test.** Part 1 filters, drill and defaults (the default is
  the dashboard most people see); Part 2 the five-user task test, NN/g 2000 read with its formula, L =
  31%, "comparable users" caveat and "3 studies with 5 users each", disagreement noted as reported; Part 3
  what "gets used" measures (opens, time to first decision, questions still asked by email). Build-along:
  Tomas runs five Saltmarsh users through three tasks, constructed, the worksheet the learner reuses.
