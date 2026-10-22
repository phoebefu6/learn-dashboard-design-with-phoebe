# Dashboard Design - official course map (source of truth)

learn-dashboard-design-with-phoebe · bucket viz · single-track, 6 sessions x 45 min · difficulty 2 ·
audience both (analysts and designers who build dashboards, and the leaders who read them) · icon 🧭 ·
palette ink blue #2460D0 with signal green #2DBE7A as the contrast (fill only, under dark ink). CIELAB
Delta-E of the primary against every live sibling `--indigo`: nearest Automation #0A64C4 at 11.0, then
Model Risk #1E40AF 13.8, Recommendation #2563EB 13.9, Markdown #083FA1 14.7; the briefed near-twins
(Business Intelligence #1D4E79, Data Literacy #14699C, Tech Project PMO #14507D, Interview Prep #2A4FA0,
Ship Platform Diagnosis #163E6A, Data PMO #3E5C76, Dataviz #264653, OKR #4338CA, Quantum #3730A3,
Statistics #0E7C90) are all further. White on the primary measures 5.74:1. Built 2026-10-22 by the
foundations lead. Engine `assets/dsh-live.js`, data `assets/dsh-daily.js`, prefix `dsh` (free in the
estate on 2026-10-22), PASSPORT_KEY `lwp-passport:dashboard-design`.

Evidence tiers: **read** = read at source (the publisher's page or PDF, the W3C text, the dataset API,
the data itself). **reported** = stated by a named secondary source or widely reproduced but not read
at source here; say "reported" on the page. **computed** = produced by the engine from the shipped
series and agreed between Python and node. **rule** = a definition this course chose; say so.
**not verified** = do not teach as fact.

## Running case (constructed, say so on every page that uses it)

**Saltmarsh** is a constructed home-goods retailer that sells through marketplaces and ships from one
warehouse. Priya, the managing director, has asked for "a dashboard". Tomas, the analyst, is designing
the **weekly operations dashboard** that Nia, the operations lead, opens at the Monday 09:00 stand-up
with Kofi, the warehouse lead. It answers four questions on one screen: are deliveries slipping, did
demand fall, did the money fall, where is the backlog. The decisions it changes: call the carrier or add
a second one, pause or extend a promotion, move warehouse staff between picking and packing. All names
are invented; no Saltmarsh number is a measurement. Where a page shows numbers on a Saltmarsh card, the
numbers are **Olist's** daily series (below) and the page says so.

## Session arc and coverage

| # | File | Title (h1, accent word) | Covers |
|---|---|---|---|
| 1 | 01-who-looks-what-they-decide.html | Who **looks**, and what they decide | A dashboard is a screen that answers a question someone has on a schedule (Few's 2004 definition, read: single screen, monitored at a glance, most important information for one or more objectives); user, question, decision, glance; report against dashboard against analysis; the four-line brief (who, question, decision, when). |
| 2 | 02-hierarchy-first-glance.html | Hierarchy and the first **glance** | Visual weight = size x contrast x position; reading order; the one number; the F-pattern as what NN/g measured on text-heavy pages and itself calls bad for users (Nielsen 2006, Pernice 2017, read), so a dashboard is laid out so that no F is needed; the squint test; Miller 1956 read for what it does NOT claim about screens; pre-attentive attributes reported. |
| 3 | 03-density-grouping-white-space.html | Density, grouping and **white space** | One screen; tiles against tables; group by the question, not by the data source; progressive disclosure (on the screen, one click away, in a report); Tufte's data-ink ratio reported. |
| 4 | 04-colour-as-state.html | Colour as **state** | KPI card anatomy: value, delta, context band; red / amber / green as state and never as decoration; colour never the only channel (WCAG 2.2 1.4.1, read), 4.5:1 and 3:1 (1.4.3, 1.4.11, read); colour-vision deficiency (NEI "about 1 in 12 men", read; the Okabe-Ito palette reported); when colour should mean nothing. |
| 5 | 05-interaction-defaults-usability-test.html | Interaction, defaults and the **usability test** | Filters, drill and defaults (the default is the dashboard most people see); the five-user task test (Nielsen 2000, read, with the formula, the typical L of 31 percent and the comparable-users caveat; the disagreement reported); what "gets used" measures. |
| 6 | 06-the-red-amber-green-bench.html | The **red-amber-green** bench | Real Olist daily series; the course's change rule; the ladder fixed, spread, band, persistence, scorecard; the anti-lever "tighten to catch everything"; the break button "hide the variance"; every number computed in the browser and agreed with the Python reference. |

Difficulty per card: 1 green, 2 yellow, 3 yellow, 4 orange, 5 orange, 6 red (bench night).

Seams (one line and an absolute link on the page, never reteach; this course's side is named):
- `learn-dataviz` owns chart form, colour theory and marks; we own layout, hierarchy, the KPI card and state colour.
- `learn-business-intelligence` owns building in a tool, the data model, commissioning (a4) and reading (a2); its a2 is "Reading a dashboard like a leader" and its b5 is "Chart choice + dashboard grammar", both left alone.
- `learn-data-literacy` session 8 owns dashboard-to-decision for executives; `learn-visual-storytelling` owns narrative.
- `learn-data-observability` a4 and `learn-data-reliability` b3 own pipeline alerting, SLOs and burn rates ("Two thresholds, and a band that belongs to a human" and "Replace threshold paging with a burn-rate policy" are theirs); `learn-anomaly-detection` owns detectors and its "Alert or noise" title. We own the colour state a human reads on a card.
- `learn-product-design` owns general UX method; we run ONE five-user task test on a dashboard.

## The data (computed from the shipped series, `assets/dsh-daily.js`, built by `materials/build-olist-daily.py`)

- Source: Brazilian E-Commerce Public Dataset by Olist, Kaggle, version 2 (last updated 2021-10-01), downloaded with `kagglehub.dataset_download("olistbr/brazilian-ecommerce")` into an empty directory and read with `python3 -I`. 99,441 orders in `olist_orders_dataset.csv`, 112,650 item rows. The dataset page says: "100k orders from 2016 to 2018 made at multiple marketplaces in Brazil", "real commercial data, it has been anonymised" (read: Kaggle dataset API JSON, 2026-10-22).
- Licence **CC BY-NC-SA 4.0** (read: Kaggle dataset API `licenseName`, 2026-10-22). Shipped: derived daily aggregates only (counts, sums, means per calendar day), never a row, id or text. Attribution and licence are printed on the widget.
- Full span of purchase dates 2016-09-04 to 2018-10-17 (774 days). Trim rule (stated on the widget): whole weeks, from the first Monday whose following 7 days all have at least 20 orders to the last such Sunday. Kept **581 days, 83 weeks, 2017-01-23 to 2018-08-26**; dropped 141 leading and 52 trailing days. 98,639 of 99,441 orders kept; item revenue kept 13,490,539 BRL. Every kept day has at least one delivered order.
- Series per day: orders placed (all statuses, by purchase timestamp); revenue (sum of item prices, whole BRL); delay (mean of delivered date minus estimated date in days, over that day's delivered orders, tenths); late share (share of those delivered after the estimate, per mille).
- Descriptives: median 156 orders a day (mean 169.8), minimum 29 (2017-01-28), maximum **1,176 on 2017-11-24** (Black Friday; item revenue 152,654 BRL that day). Median by weekday Monday to Sunday: 180, 192, 171, 150, 147, 113, 132. Mean orders first 8 weeks 68.8, last 8 weeks 223.4 (the business grew). Median late share 4.9 percent, maximum 32.1 percent on 2018-03-02; mean late share 2.7 percent in the first 28 days, 6.7 percent over the whole span. Median delivery 11.8 days EARLY against the estimate (delay -11.8); least early -2.1 days on 2018-03-02; earliest -32.1 days.

## The bench rule (a rule of this course, printed on the widget; not a fact about Olist)

Orient each KPI so that larger means worse (orders and revenue are negated). For day t, left window =
the 28 days before t, right window = t and the 27 days after; discrepancy = (median of right - median
of left) / (1.4826 x MAD of left). A **real change** is a local peak of that curve at or above K = 2.0,
highest peaks kept first, no two within 28 days, worse direction only. Improvements are not scored;
one-day spikes are not changes by this rule (Black Friday is a spike, not a change). The window-sliding
search follows Truong, Oudre and Vayatis (2020), section 5.2.1 (read, arXiv v3 PDF). Scored days: 28 to
552 of 581 (525 days, 17.25 months); a change is caught if the card leaves green within 14 days of it;
every other non-green day is a false-alarm day; a run of non-green days is one alarm episode.

Real changes found (computed): **late share 3**: 2017-11-08 (median late share 4.9 to 11.8 percent),
2018-02-11 (7.9 to 24.3 percent), 2018-07-11 (1.3 to 6.2 percent). **Delay 7**: 2017-02-23, 2017-08-22,
2017-11-08, 2018-01-10, 2018-02-11 (median -11.5 to -4.8 days), 2018-05-07, 2018-07-07. **Orders 0 and
revenue 0** for the worse: every alarm on those two cards in these 83 weeks is a false alarm by this rule
(the business grew; demand never fell for a sustained month).

## Canon numbers (computed; Python `materials/dsh-reference.py` and node `materials/dsh-node.js` running the browser engine agree on all 305 values to 1e-9 relative; `materials/compare-ladder.py` fails on a planted 0.1 percent fault; `selfTest()` fails on a planted reversed-threshold engine)

Thresholds amber at +1 s, red at +2 s unless stated (s = 1.4826 x MAD). The widget prints colour shares at 0 decimals (28.9 prints as 29%, 81.5 as 82%, 89.7 as 90%); pages quote the printed form. Columns: false-alarm days per
month · false alarm episodes (per month) · alarm episodes in total · changes missed · mean days to flag ·
time green / amber / red.

**Late deliveries** (default card; 3 real changes)
| rung | fdays/mo | false ep (per mo) | episodes | missed | delay | green / amber / red |
|---|---|---|---|---|---|---|
| 1 fixed (first 28 days, frozen) | **13.97** | 69 (4.00) | 75 | 0 | 0.0 | 47.6 / 23.8 / 28.6 |
| 2 spread (whole series) | 5.68 | 22 (1.28) | 26 | 0 | 2.0 | 76.9 / 10.1 / 13.0 |
| 3 band (trailing 28 days) | 7.19 | 55 (3.19) | 62 | 0 | 1.67 | 70.7 / 16.0 / 13.3 |
| 4 persist (band + two days) | **4.70** | 11 (0.64) | 14 | 0 | 2.33 | 79.0 / 9.9 / 11.1 |
| anti: tighten (0.5 s / 1 s) | **7.88** | 17 (0.99) | 20 | 0 | 1.0 | 67.2 / 3.8 / **28.9** |
| break: hide (28-day mean, no band) | 4.87 | 1 (0.06) | 2 | **2 of 3** | 1.0 | **81.5** / 6.9 / 11.6 |

**Delivery vs estimate** (7 real changes)
| rung | fdays/mo | false ep (per mo) | episodes | missed | delay | green / amber / red |
|---|---|---|---|---|---|---|
| 1 fixed | **23.77** | 2 (0.12) | 5 | 0 | 0.0 | 3.2 / 7.0 / **89.7** |
| 2 spread | 3.54 | 10 (0.58) | 18 | 1 | 5.83 | 82.3 / 12.8 / 5.0 |
| 3 band | 4.46 | 23 (1.33) | 40 | 0 | 0.71 | 70.3 / 18.1 / 11.6 |
| 4 persist | 3.54 | 8 (0.46) | 15 | 0 | 3.29 | 74.7 / 15.2 / 10.1 |
| anti: tighten | 5.68 | 7 (0.41) | 14 | 0 | 1.86 | 65.1 / 5.3 / **29.5** |
| break: hide | 3.77 | 2 (0.12) | 2 | **7 of 7** | never | 87.6 / 8.6 / 3.8 |

**Orders placed** (0 real changes for the worse)
| rung | fdays/mo | false ep (per mo) | episodes | missed | green / amber / red |
|---|---|---|---|---|---|
| 1 fixed | 0.23 | 4 (0.23) | 4 | 0 | 99.2 / 0.8 / 0.0 |
| 2 spread | 2.55 | 18 (1.04) | 18 | 0 | 91.6 / 8.4 / 0.0 |
| 3 band | 5.22 | 50 (2.90) | 50 | 0 | 82.9 / 15.8 / 1.3 |
| 4 persist | 3.30 | 18 (1.04) | 18 | 0 | 89.1 / 10.9 / 0.0 |
| anti: tighten | 5.86 | 23 (1.33) | 23 | 0 | 80.8 / 5.0 / 14.3 |
| break: hide | 1.62 | 1 (0.06) | 1 | 0 | 94.7 / 5.3 / 0.0 |

**Revenue** (0 real changes for the worse)
| rung | fdays/mo | false ep (per mo) | episodes | missed | green / amber / red |
|---|---|---|---|---|---|
| 1 fixed | 0.17 | 2 (0.12) | 2 | 0 | 99.4 / 0.6 / 0.0 |
| 2 spread | 2.26 | 20 (1.16) | 20 | 0 | 92.6 / 7.4 / 0.0 |
| 3 band | 4.46 | 45 (2.61) | 45 | 0 | 85.3 / 13.5 / 1.1 |
| 4 persist | 3.07 | 14 (0.81) | 14 | 0 | 89.9 / 10.1 / 0.0 |
| anti: tighten | 6.26 | 26 (1.51) | 26 | 0 | 79.4 / 8.4 / 12.2 |
| break: hide | 1.45 | 1 (0.06) | 1 | 0 | 95.2 / 4.8 / 0.0 |

What the ladder teaches, honestly: rung 1 on the delay card is red 89.7 percent of days because the
first four weeks of 2017 were unusually early deliveries and the thresholds never moved; rung 2 uses the
whole series, which nobody has on launch day (hindsight); rung 3 is the honest live version and is
NOISIER than rung 2 on late share (7.19 against 5.68) because a 28-day spread is tighter than the
spread of a series that contains its own regime shifts; rung 4's persistence takes late share to 4.70
with nothing missed. The anti-lever cannot lower misses below the 0 they already are and raises
false-alarm days by two thirds and red time to 28.9 percent. The break button looks calmest (81.5 percent
green) and misses 2 of 3 real changes within 14 days (all 7 on the delay card).

## Verified facts (cite exactly as here)

### Few (read: "Dashboard Confusion", Perceptual Edge PDF, dated March 20, 2004, "originally published in Intelligent Enterprise")
- Few, S. (2004). "Dashboard Confusion." Intelligent Enterprise, March 20, 2004; PDF at
  perceptualedge.com/articles/ie/dashboard_confusion.pdf. Definition, verbatim: "A dashboard is a
  visual display of the most important information needed to achieve one or more objectives;
  consolidated and arranged on a single screen so the information can be monitored at a glance." Also
  read there: "The means is a single-screen display"; a dashboard "is a type of display or style of
  presentation, not a specific type of information or technology"; the information "must be tailored
  specifically to the requirements of a given person, group, or function" (the "Customized" bullet).
- Few, S. (2006 / 2013). *Information Dashboard Design*. **Reported** (book not read): cite only as the
  book where the definition is developed; Business Intelligence a-track owns "Few's dashboard library".

### Nielsen Norman Group (read)
- Nielsen, J. (2000). "Why You Only Need to Test with 5 Users." NN/g, March 18, 2000. Model:
  problems found = N (1 - (1 - L)^n), "typical" L = 31 percent across the projects NN/g studied; with five
  users "found 85% of the usability problems"; "zero users give zero insights"; "Spend this budget on 3
  studies with 5 users each!"; caveat verbatim: "The formula only holds for comparable users who will be
  using the site in fairly similar ways"; for distinct groups 3-4 users per group with two groups, 3 per
  group with three or more; at least 3 users because one user may be unrepresentative. The page points to
  follow-ups saying quantitative studies need about 20 users and card sorting about 15 (reported via that
  pointer, not read).
- The disagreement to teach, **reported**: Spool and Schroeder (2001) argued five users find far fewer
  problems on large e-commerce sites ("Testing Web Sites: Five Users Is Nowhere Near Enough", CHI 2001
  extended abstracts). Not read at source; name it as reported and note L varies by project and task.
- Nielsen, J. (2006). "F-Shaped Pattern For Reading Web Content (original study)." NN/g, April 17, 2006.
  Eyetracking, 232 users, thousands of pages; three parts: a horizontal movement across the upper content
  area, a shorter second horizontal movement lower down, a vertical scan down the left side; "Users won't
  read your text thoroughly"; "The first two paragraphs must state the most important information";
  "Start subheads, paragraphs, and bullet points with information-carrying words".
- Pernice, K. (2017). "F-Shaped Pattern of Reading on the Web: Misunderstood, But Still Relevant (Even on
  Mobile)." NN/g, November 12, 2017. The F appears when three things hold: little or no formatting (a
  wall of text), a user trying to be efficient, a user not committed to reading every word. Verbatim:
  "the F-shaped scanning pattern is bad for users and businesses". Fix: formatting that directs attention
  (headings, bullets, bold, front-loaded words, cut content). Evidence named on the page: a 2017 study
  aggregating 47 people, an early-2000s study of more than 45 people.
- **Teach:** "users read in an F pattern" is not a layout law for dashboards. It is what eyes do on an
  unformatted page, NN/g calls it a failure of formatting, and a dashboard has almost no running text.
  The usable lesson is the one NN/g draws: put the most important thing first and make structure visible.

### Miller (read: psychclassics.yorku.ca full text)
- Miller, G. A. (1956). "The magical number seven, plus or minus two: Some limits on our capacity for
  processing information." *Psychological Review*, 63, 81-97. The seven is the "span of absolute
  judgment" for one-dimensional stimuli (channel capacities around 2.6 bits, about 6.5 categories) and the
  span of immediate memory counted in "chunks"; "recoding" lets a chunk carry more. Kaufman and
  colleagues' dot patterns: no errors up to about five or six dots ("subitizing"), with Miller's caution
  that the link to seven may be coincidence. Closing words, verbatim: "I suspect that it is only a
  pernicious, Pythagorean coincidence." The paper says NOTHING about screens, displays of information or
  how many items belong on one; its visual-display measurements are laboratory judgments of line length
  and position. Miller notes that adding dimensions raises total capacity but lowers accuracy per
  attribute.
- **Teach:** "no more than seven tiles, Miller said so" is an extrapolation Miller did not make. What the
  paper supports is the chunking move: group tiles so the reader holds four groups, not nineteen tiles.

### WCAG 2.2 (read: W3C Recommendation, the 12 December 2024 version)
- 1.4.1 Use of Color (Level A): "Color is not used as the only visual means of conveying information,
  indicating an action, prompting a response, or distinguishing a visual element."
- 1.4.3 Contrast (Minimum) (Level AA): text and images of text "have a contrast ratio of at least 4.5:1",
  large-scale text "at least 3:1"; large scale = "at least 18 point or 14 point bold".
- 1.4.6 Contrast (Enhanced) (Level AAA): 7:1, large text 4.5:1.
- 1.4.11 Non-text Contrast (Level AA): user interface components and graphical objects required to
  understand content "have a contrast ratio of at least 3:1 against adjacent color(s)".

### Colour-vision deficiency
- National Eye Institute (NIH), "Color Blindness", page last updated November 5, 2025 (read): "About 1 in
  12 men have color vision deficiency"; "The most common type of color vision deficiency makes it hard to
  tell the difference between red and green." No figure for women on that page: do not quote one.
- Okabe, M. and Ito, K. "Color Universal Design (CUD): How to make figures and presentations that are
  friendly to Colorblind people", jfly.uni-koeln.de/color (**reported**: the page refused access from
  outside the University of Cologne network on 2026-10-22; the eight values are widely reproduced:
  black #000000, orange #E69F00, sky blue #56B4E9, bluish green #009E73, yellow #F0E442, blue #0072B2,
  vermilion #D55E00, reddish purple #CC79A7). Print as reported; never as our palette.

### Pre-attentive attributes and data-ink (reported)
- Healey, C. G. and Enns, J. T. (2012). "Attention and Visual Memory in Visualization and Computer
  Graphics." *IEEE TVCG* 18(7), 1170-1188, and Ware, C. (2012) *Information Visualization* (3rd ed.):
  hue, size, orientation, position and intensity are picked up in a glance before focused attention;
  conjunctions of two features are not. **Reported**: the primary pages could not be fetched on
  2026-10-22. Teach as "vision science reports", never with a millisecond figure.
- Tufte, E. (1983). *The Visual Display of Quantitative Information*: the data-ink ratio. **Reported**;
  name the idea, do not quote a number or a page.

### Change point detection (read: arXiv 1801.00718v3 PDF, accepted Signal Processing March 27, 2020)
- Truong, C., Oudre, L. and Vayatis, N. (2020). "Selective review of offline change point detection
  methods." *Signal Processing*, 167, 107299. Three elements: "a cost function, a search method and a
  constraint on the number of changes" (abstract). Typology (Figure 7): optimal (Opt, Pelt) and
  approximate (Win, BinSeg, BotUp). Section 5.2.1 Window sliding, verbatim: "It consists in computing the
  discrepancy between two adjacent windows that slide along the signal"; "When the two windows cover
  dissimilar segments, the discrepancy reaches large values, resulting in a peak"; a peak search then
  returns the change points. Our rule is a robust (median and MAD) instance of Win with a fixed threshold;
  say "after Truong et al. 2020, section 5.2.1", not "from".

## Not covered (say so when asked)

Building a dashboard in any tool, the data model, refresh and security (Business Intelligence b-track);
chart choice, colour theory and marks (Dataviz); narrative decks and annotated charts (Visual
Storytelling); pipeline alerting, SLOs, burn rates and on-call (Data Observability, Data Reliability);
statistical anomaly detectors beyond the one stated rule (Anomaly Detection); general UX research
method beyond one five-user task test (Product Design); real-time and streaming dashboards (Streaming
Data); mobile-first dashboard layout beyond the 390-wide check; accessibility beyond 1.4.1, 1.4.3, 1.4.11
and colour-vision deficiency; Few's full pitfall list (Business Intelligence owns "Few's dashboard
library"); dashboards for the general public; Brazilian retail itself (Olist's rows are a series, not a
case study).

## Corrections to the brief, for the main thread

- The brief's "Olist dataset page + licence" could not be read from the dataset page itself (Kaggle
  renders it client-side); the licence was read from the Kaggle dataset API JSON instead, as the
  Economics course did on 2026-09-25. Tier: read.
- The Okabe-Ito page is network-gated (University of Cologne only); the palette is reported, and the
  colour-vision prevalence comes from NEI instead (read). The Healey perception page timed out twice;
  pre-attentive attributes are reported.
- The brief's "5 users find 85% of problems" is on the page as "found 85% of the usability problems",
  with L = 31 percent typical and a comparable-users caveat; teach it as a model estimate.
- The ladder is NOT monotone on the late-share card: rung 3 (live band) is noisier than rung 2 (whole-series
  spread, hindsight). The pages teach that as the point, not as a defect.
- No worse-direction change exists on the orders and revenue cards in this span; those cards teach "every
  alarm was false by the rule", which the widget prints.

## Citation appendix (exact forms for the pages)

1. Few, S. (2004). Dashboard Confusion. Intelligent Enterprise, 20 March 2004. Read (Perceptual Edge PDF).
2. Few, S. (2006). Information Dashboard Design. O'Reilly. Reported.
3. Nielsen, J. (2000). Why You Only Need to Test with 5 Users. Nielsen Norman Group, 18 March 2000. Read.
4. Spool, J. and Schroeder, W. (2001). Testing Web Sites: Five Users Is Nowhere Near Enough. CHI 2001 extended abstracts. Reported.
5. Nielsen, J. (2006). F-Shaped Pattern For Reading Web Content (original study). Nielsen Norman Group, 17 April 2006. Read.
6. Pernice, K. (2017). F-Shaped Pattern of Reading on the Web: Misunderstood, But Still Relevant (Even on Mobile). Nielsen Norman Group, 12 November 2017. Read.
7. Miller, G. A. (1956). The magical number seven, plus or minus two. Psychological Review, 63, 81-97. Read.
8. W3C (2024). Web Content Accessibility Guidelines (WCAG) 2.2, W3C Recommendation, 12 December 2024 version: 1.4.1, 1.4.3, 1.4.6, 1.4.11. Read.
9. National Eye Institute (2025). Color Blindness. nei.nih.gov, updated 5 November 2025. Read.
10. Okabe, M. and Ito, K. Color Universal Design (CUD). jfly.uni-koeln.de/color. Reported.
11. Healey, C. G. and Enns, J. T. (2012). Attention and Visual Memory in Visualization and Computer Graphics. IEEE TVCG 18(7). Reported.
12. Ware, C. (2012). Information Visualization: Perception for Design, 3rd ed. Morgan Kaufmann. Reported.
13. Tufte, E. (1983). The Visual Display of Quantitative Information. Graphics Press. Reported.
14. Truong, C., Oudre, L. and Vayatis, N. (2020). Selective review of offline change point detection methods. Signal Processing, 167, 107299. Read (arXiv 1801.00718v3).
15. Olist and Sionek, A. (2018). Brazilian E-Commerce Public Dataset by Olist, v2. Kaggle. CC BY-NC-SA 4.0. Read (dataset API) and computed (the series).
