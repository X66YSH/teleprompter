# Derek Lam Meet & Greet — Prep Doc

> RBC EMRM Senior Analyst (GG08) — first-contact virtual meet with Director Derek Lam.
> Scheduled: **Thu 2026-04-23, 1:00-1:45 PM (WebEx)**
> Purpose: Gatekeeper conversation. Derek decides whether to advance me to formal tech rounds.

---

## 1. Why Director Directly (Not HR)

- **Rotman channel**: Audrey's resume went straight to EMRM Director, bypassing RBC HR
- **Specialized role**: MV/quant roles usually skip HR screen — hiring manager does own sourcing
- **Shortlist funnel**: Derek is meeting "various candidates" — narrowing from ~5-10 to ~2-3 for formal rounds
- **Implication**: He is **first and last gate**. 45 minutes decides whether I get a tech round at all.

---

## 2. Derek's Profile (LinkedIn)

### Background
- **Credentials**: CPA, CFA, CFP, MBA (Schulich, 2017-2019 part-time while working)
- **Career**: PwC Vancouver → RBC (10+ yrs)
  - 2016-2017: Associate, Credit Analysis & Assessment
  - 2018-May 2024: **Associate Director, Wholesale Credit (6.5 years)**
  - May 2024-present: **Director, EMRM (~2 years only)**
- **Location**: Vancouver → Toronto
- **Language**: English + 正體中文 (likely Cantonese / Chinese-Canadian; surname Lam = 林)

### Profile reads as
- **Business / finance type**, NOT quant PhD
- 14 years accounting + 6.5 years Wholesale Credit Risk
- Recently moved into MV (still learning the validation world himself)
- **Certification-driven** — values rigor, designations, continued learning
- LinkedIn activity: congratulating team members — supportive/mentor-type manager

### Team context (other EMRM directors on LinkedIn)
- **Shan Jiang, Ph.D. Stats** — Senior Director, Credit Models & Methodology ← quant tech side
- **Aydin Behnad, PhD, FRM** — Director, Model Risk ← another tech side
- **Volodymyr Lozynskyy** — Director, Model Risk Governance ← process side
- **Felix Kan** — Director, AI Model Risk ← AI specialist
- **Derek** — Director, EMRM ← **business / financial reasoning side**

→ Derek is the **business-side director**. Tech depth gets tested later (probably by Shan Jiang or Aydin). This round is about **business judgment, communication, fit**.

---

## 3. Strategic Framing

### What Derek is actually evaluating
- Can I hold a professional 45-min conversation without awkwardness?
- Do I sound organized, concise, confident?
- Do I have genuine interest in MV (not "random bank apply")?
- Would I embarrass him if he advances me to his peers?
- Can I communicate with regulators/stakeholders on his behalf?

### What Derek is NOT evaluating
- Whether I can derive Hessian of logistic regression
- Whether I know PyTorch autograd internals
- Whether I've memorized KS formula
- SQL whiteboard ability

### Core messaging adjustment
- **Dial DOWN technical jargon** by ~30%
- **Dial UP** business framing: *auditable, defensible, regulatory, governance, business decision*
- Show **judgment and curiosity**, not memorized-fact recall

---

## 4. Meeting Flow (45 min)

| Min | Block | What to do |
|-----|-------|------------|
| 0-3 | Small talk, WebEx setup | Smile, confirm audio, brief weather/mood |
| 3-8 | Derek intros himself + team | Listen actively, take mental notes |
| 8-15 | **"Tell me about yourself"** | My 3-min intro (see Section 5) |
| 15-25 | Background / motivation Qs | Scotiabank, MMA, why MV, domain fit |
| 25-35 | Derek describes role & team | Listen, ask clarifying questions |
| 35-43 | **My questions to him** | Pick 2-3 from Section 7 |
| 43-45 | Next steps, thank-you | Confirm follow-up, warm close |

---

## 5. 3-Minute Self-Intro (Business-First Framing)

```
(15s) "Thanks for making time, Derek. I'll keep it under three minutes.

(45s — current role)
I'm currently on the AI and Machine Learning team at Scotiabank, supporting the
AML business line — so a 2nd Line of Defense context. My day-to-day is customer
risk scoring, anomaly detection, and feature engineering on millions of
transactions across the FINTRAC reporting channels. Everything we build has to
be defensible to compliance and to regulators, so I've developed a natural
muscle for documentation, statistical validation, and audit traceability.

(45s — signature project)
My most relevant project has been building a Customer Risk Score framework —
a 0-to-100 behavioral risk scoring model on transactional data. A core part of
my work was the validation layer: I benchmarked feature-engineering
approaches side-by-side, tested signals across both supervised and
unsupervised models, and scaled validation from Pandas prototype to PySpark
at production volume. That methodology work is what drew me toward Model
Validation as a focus.

(30s — earlier + education)
Before Scotiabank — and still ongoing part-time — I was at Canadian Heritage,
where I built a classification model that automated 98% of a manual review
process, saving roughly $700K annually. That project taught me to defend model
choices to non-technical policy makers, which I now see as core to validation work.
I did my undergrad in Statistics and Computer Science at U of T, and I'm
finishing my MMA at Rotman this year.

(15s — why MV)
What's drawn me to this role specifically is that the validation lens —
rigorous, regulatory, adversarial — maps directly onto the work I've been
gravitating toward anyway. Happy to go deeper on any of that."
```

### Delivery notes
- **Warm but concise** — this is not a tech interview monologue
- Use phrases like "2nd Line of Defense", "defensible", "audit traceability" — his vocabulary
- Don't mention: multi-agent pipeline, LLM, FastAPI, React, self-correction loop (save for tech rounds)
- **STOP at 3 min** — let him drive next

---

## 6. Key Hook Phrases (Use Naturally)

| Phrase | When |
|--------|------|
| "2nd Line of Defense" | Describing Scotiabank |
| "defensible to regulators" | Any modeling choice |
| "audit traceability" | Describing FINTRAC work |
| "conceptual soundness" | Talking about model selection |
| "benchmarking alternatives" | CRS project |
| "statistical validation" | Any validation mention |
| "Retail-analog work" | Framing AML-to-credit bridge |
| "governance and documentation" | Showing maturity |

---

## 7. Questions to Ask Derek (Pick 2-3)

### 🥇 King Question (use this — tailored to Derek specifically)
> "You spent 6+ years in Wholesale Credit before moving into EMRM about two
> years ago. What's been the biggest mindset shift for you — from doing the
> credit analysis to validating the same types of models?"

**Why it lands:**
- Proves I did research on him
- Invites him to talk about himself (people love this)
- Reveals his real perspective on 1LoD vs 2LoD dynamic
- Opens up lots of follow-up conversation

### 🥈 Strong backups (pick 1-2 more)

1. *"How does EMRM balance quant-heavy directors with business-focused leaders
   like yourself? I imagine the challenge is getting both lenses on every
   validation."*

2. *"How is EMRM thinking about ML / AI model validation as the industry evolves?
   I noticed RBC has a dedicated AI Model Risk director — does that team and
   yours collaborate on shared methodology?"*

3. *"You hold CFA, CPA, and CFP. For someone at my stage finishing MMA, would
   you see FRM as a natural next designation — or is there another path you'd
   recommend?"* ← **Mentor framing, huge goodwill**

4. *"What distinguishes a great Senior Analyst on this team from a solid one?
   What do you notice in the first year that predicts who grows?"*

### ❌ Do NOT ask
- Compensation (save for HR)
- WFH / benefits (too employee-first)
- Team size (findable on LinkedIn)
- "What's a typical day" (junior-sounding)
- Anything already in the JD

---

## 8. Specific Conversation Moves

### If he asks "What do you know about model validation?"
> "At a high level — independent 2LoD review of 1LoD's model package.
> Checking conceptual soundness, statistical performance, calibration,
> stability — and documenting findings for internal governance and OSFI.
> For RBC specifically, AIRB parameters — PD, LGD, EAD — feeding into
> regulatory capital. My direct experience is on the Retail-analog side
> through AML; I'm actively learning the Wholesale structural modeling
> approach because it's quite different — LDP, expert judgment, migration
> matrices."

### If he asks "Do you have credit risk experience?"
> "Not credit risk directly — my regulated work is AML. But the
> methodological toolkit translates: statistical validation, WoE/IV, PSI,
> conceptual soundness review, regulatory documentation. I'm reading up on
> Basel III, IFRS 9 ECL, and the Retail/Wholesale split so that the domain
> gap closes quickly once I'm in the seat."

### If he asks "Why RBC?"
> "Three things. First, EMRM is one of the most rigorous validation groups
> in Canadian banking — 2LoD, OSFI-facing. Second, my current 2LoD work at
> Scotiabank maps methodologically, so the learning curve is on the credit
> risk domain, not the mindset. Third — frankly — RBC is investing
> visibly in AI model validation with dedicated leadership, which I find
> exciting because it's where our field is heading."

### Wholesale vs Retail bridge (say this naturally once)
> "I know EMRM covers both. My direct work has been on Retail-analog
> problems — transactional behavioral scoring. I've been reading how
> Wholesale is quite different — Low Default Portfolios, Merton-style
> structural models, benchmarking against external ratings, heavier expert
> judgment. Curious how the team bridges the two methodologies in practice."

### If natural opportunity — Chinese heritage
> (Only if it comes up organically) "Always nice to connect with someone
> who's built a strong career in Canadian financial services."
> **Do NOT force this.** Skip if awkward.

---

## 9. What NOT to Do

1. ❌ Over-flex technical depth (multi-agent pipeline, autograd, LR from scratch math) — will seem tone-deaf
2. ❌ Say "I've never done risk" — reframe AML as 2LoD risk
3. ❌ Ask about salary / benefits / WFH
4. ❌ Silent-nod through his role description — have prepared reactions
5. ❌ Run long on self-intro (>3.5 min)
6. ❌ Apologize for domain gap — state it confidently with a bridge plan
7. ❌ Speak Chinese unprompted (professional setting)

---

## 10. Thank-You Email Template (Send Within 24h)

```
Subject: Thank you — Meet & Greet

Hi Derek,

Thank you again for the conversation this afternoon. I appreciated [ONE
SPECIFIC THING HE SAID — e.g., your perspective on the shift from
Wholesale Credit into validation mindset / the way EMRM is scaling AI
model validation / the balance between business and quant lenses on
the team].

Our conversation reinforced my interest in the Senior Analyst role. The
combination of rigorous 2LoD methodology, the breadth from Retail through
Wholesale, and a team investing in ML model risk is exactly the environment
I'm looking to grow in.

Please let me know if there's anything else helpful from my side as the
process moves forward.

Best regards,
Jerry (Zongheng) Li
```

---

## 11. Pre-Meeting Checklist

### 48 hours out (Tue)
- [ ] 3-min self-intro recorded 3 times — listen back, trim fat
- [ ] King question memorized word-for-word
- [ ] "Wholesale vs Retail" one-liner memorized
- [ ] "Basel III three pillars + AIRB" one-liner ready

### 24 hours out (Wed)
- [ ] Re-read this doc once
- [ ] Scan RBC 2025 annual report — Risk Management section (Basel III transition, ECL provisions)
- [ ] Review OSFI E-23 guidance at high level
- [ ] Outfit ready — business casual (jacket / collared shirt, no tie)
- [ ] Check WebEx link works on primary screen

### 2 hours before (Thu 11 AM)
- [ ] Water, restroom, light lunch (not heavy)
- [ ] Teleprompter/notes open on secondary screen (content_rbc.json)
- [ ] King question printed on index card — within eye line
- [ ] Phone on silent, close Slack / email notifications
- [ ] Test camera angle and lighting

### Post-meeting
- [ ] Send thank-you within 24h
- [ ] Update prep_notes.md with any new intel Derek shared
- [ ] If advanced to formal round → pivot to tech prep (LR from scratch, KS/PSI, SQL)

---

## 12. Fallback — If Conversation Goes Sideways

### If he grills on technical detail unexpectedly
- Be honest about what I know / don't know
- Pivot to methodology ("I haven't done that directly, but the principle I'd apply is...")
- Don't fake it — Derek has 14 years of experience reading candidates

### If dead air after ~20 min
- Ask: *"Would it be helpful if I walked you through a specific validation example from my CRS project?"*
- Have S6 CRS story loaded — 2-min business-framed version

### If he sounds unengaged / short
- Don't panic, don't oversell
- Ask a good question, let him talk, listen actively
- Sometimes Directors are just having a long day — it's not personal
