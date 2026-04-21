# RBC EMRM Interview Prep — Consolidated Notes

> Handoff doc for building teleprompter scripts. Covers everything from the current session: role context, the full PD validation case, math formulas, interview phrasings, gap analysis, 学姐 docs review, and remaining todos.

---

## 0. Interview Context

### Role
**Senior Analyst, Enterprise Model Risk Management (EMRM)** — RBC Group Risk Management (GRM). Validates Wholesale & Retail credit risk rating systems, acquisition & account management models, AIRB parameters (PD/LGD/EAD) for regulatory and economic capital.

### Required skills (from JD)
- Python, SAS, SQL, Excel (required)
- R / Scala / PySpark / GitHub (essential)
- AI/ML + logistic regression + PyTorch for DL
- Large-data evidence
- Model dev / validation / credit-analytics projects

### Interview pipeline
- Status: **shortlisted**, interview expected week of 2026-04-20 (Monday is 2026-04-20)
- Round 1: **behavioural + technical mixed** (not pure case); no HR screen yet
- Format (from two insiders):
  - Pseudo-code / describe-the-approach; not live coding
  - Theory-heavy (stats, probability, resume deep dive)
  - Possibly read-code-and-debug
- Audrey flagged: **SQL white-boarding is highly recommended**

### Key people
- **Audrey Au** — Rotman Career Services consultant, sent Jerry's resume to hiring director
- **Rob Woon-Fat** — Rotman Career Services backup
- Jerry has asked Audrey for alumni introductions (Jad-style from TD)

---

## 1. Audrey's 4-Part Rubric (from EMRM team's campus visit)

Everything we do should map to one of these four.

1. **Models** — explain stats behind each model, interpret results, validate, optimize, **tell the story to non-technical stakeholders**
2. **Resume deep dive** — every bullet, YOUR contribution, challenges, **how you leveraged AI**
3. **Challenger mindset** — "have you tried X feature?", "have we considered Y?", curious, quick learner
4. **Sample hard question:** *"Now that we have a model result, how can we trust that customer behaviour is going to stay the same? How can we account for changes in customer behaviour?"* → answer = **PSI + adversarial classifier**

---

## 2. PD Validation Pipeline — 13 Steps

This is the retail acquisition PD case we walked through end-to-end (notebook: `ex1.ipynb`). Clean version saved, original backup at `ex1_backup.ipynb`.

### Step 1 — Load & inspect
- `df.shape`, `df.dtypes`, `df.head()`
- First-30-seconds-of-any-validation reflex

### Step 2 — Data reconciliation
**Not the same as data cleaning.** Reconciliation = proving the dataset matches authoritative source.

Real-world checks (most skipped in our toy dataset):
- Row counts vs business declaration
- Sum totals tie to General Ledger (to the dollar)
- Date cutoffs (any leakage past as-of-date?)
- Segment definitions (product codes match master?)
- Default flag definition = Basel 90-DPD? institutional threshold?
- Source-system lineage
- Refresh consistency

In our toy case, we did: duplicates (`clientid`), NaN (`isna().sum()`), target `{0,1}` check, `.describe()` plausibility, class balance.

**Findings in our dataset:**
- 3 NaN ages (0.15% → drop)
- 3 negative ages (-28, -52, -36 → likely **sign error in ETL**, `abs()` gives plausible values; flag as data integrity defect, drop, **do not silently correct**)
- 14.15% default rate — moderate imbalance typical for retail credit

### Step 3 — Univariate EDA
Histograms. Look for:
- Uniform / Normal / Right-skewed / Bimodal
- Right-skew → consider log transform (not required by LR — LR assumes linearity in logit, not normality of features)

### Step 4 — Bivariate EDA
Bin each feature, plot default rate per bin. Monotonic/flat/U-shape patterns.

**Findings in our dataset:**
- income → flat (13-16% across deciles) → no univariate signal
- age → step cliff at 35 (38% below, 0% above) → suspiciously sharp
- loan → smooth monotonic rise 0% → 37% → intuitive

### Step 5 — WoE & IV

Formal quantification of univariate predictive power.

Math:
- $P_g(i) = n_{0,i}/N_0$, $P_b(i) = n_{1,i}/N_1$
- $\mathrm{WoE}_i = \ln(P_g(i)/P_b(i))$
- $\mathrm{IV} = \sum_i (P_g(i) - P_b(i)) \cdot \mathrm{WoE}_i$
- **IV = symmetrized KL divergence** = $D_{KL}(G\|B) + D_{KL}(B\|G)$

Thresholds: <0.02 useless | 0.02-0.1 weak | 0.1-0.3 medium | 0.3-0.5 strong | **>0.5 suspicious (leakage)**

Our results: income IV=0.008, age IV=3.76, loan IV=2.04 → leakage/synthetic signature.

**Laplace smoothing** (ε=0.5) prevents log(0) in sparse bins.

### Step 6 — Multicollinearity (VIF)

- $\mathrm{VIF}_j = 1 / (1 - R_j^2)$
- Thresholds: 1 orthogonal | <5 OK | 5-10 concern | **>10 serious**
- **Critical gotcha:** `variance_inflation_factor` does NOT add constant automatically → must `add_constant()` first, else VIFs inflated.

Our results: all ~1 (orthogonal) — no multicollinearity.

**Remediation options if >10:**
1. Engineer ratio (DTI = loan/income) — preferred in credit
2. Drop less predictive feature
3. Regularization (L1 Lasso auto-selects; regulators prefer explicit selection)
4. PCA (rarely used — destroys interpretability)

### Step 7 — Train/Test split
- Stratified on `default` to preserve class balance
- `random_state` fixed for reproducibility
- **Out-of-time split preferred in production** (catches temporal drift); random stratified is second-best

### Step 8 — Logistic Regression (statsmodels)

Use **statsmodels** not sklearn — validators need p-values, SEs, CIs.

Model: $\log(p/(1-p)) = \beta_0 + \beta_1 x_1 + \ldots$

Summary interpretation:
- **Pseudo R²** (McFadden) = $1 - \mathrm{LL}_\text{model}/\mathrm{LL}_\text{null}$. Typical 0.2-0.4, >0.6 suspicious.
- **Log-Likelihood** — only useful for comparison
- **LL-Null** — intercept-only baseline
- **LLR p-value** — joint test ("are features collectively useful?"). Always tiny for real model.
- **converged: True** — must be True else coefficients unreliable
- **Covariance type** — `nonrobust` default; consider cluster-robust for panel data

**Our findings:**
- Pseudo R² = 0.73 (suspicious)
- All coefficients significant (p<0.001), all signs intuitive (income -, age -, loan +)
- **Quasi-separation warning**: 40% of rows perfectly predicted → coefficients drift toward ±∞, p-values unreliable
- **Remediation for quasi-separation**: Firth's penalized likelihood, Bayesian LR with weak prior, exclude/rebin the separating feature, investigate leakage

**Odds ratios** for business-facing:
- age OR = 0.71 per year → 30% lower default odds per year
- loan OR = 1.0017 per $1 → ~5.5× per $1000
- income OR = 0.9998 per $1 → ~0.14 per $10k

### Step 9 — Discriminatory Power (AUC / KS / Gini)

- **AUC** = P(score(bad) > score(good)). Range [0.5, 1]. Credit: 0.75-0.85 good, >0.90 suspicious.
- **KS** = $\max_t |F_\text{good}(t) - F_\text{bad}(t)|$. Range [0, 1]. Credit: 0.40-0.60 good.
- **Gini** = 2·AUC - 1. Credit: 0.50-0.70 good.

**Report TRAIN + TEST** — gap = overfitting diagnostic. >5pp investigate, >10pp real overfit.

**Our results:** train and test both ~0.98 → no overfitting BUT **matching high metrics also means leakage NOT ruled out** (both partitions contaminated equally).

**Four failure modes:**
| Problem | Train | Test |
|---|---|---|
| Overfitting | high | much lower |
| Feature leakage | high | equally high |
| Deterministic/synthetic data | high | equally high |
| Train/serving skew | fine | fine (fails in prod) |

### Step 10 — Calibration (Reliability + Hosmer-Lemeshow)

**Discrimination ≠ Calibration.** Capital depends on PD level, not rank.

**Reliability diagram:** bin predictions, plot mean pred vs mean actual. Perfect = diagonal.
- Above diagonal → under-prediction (capital shortfall)
- Below diagonal → over-prediction (capital waste)
- Use `qcut` (quantile) not equal-width for skewed scores

**Hosmer-Lemeshow test:**
$$\mathrm{HL} = \sum_j \frac{(O_j - E_j)^2}{E_j(1 - E_j/n_j)} \sim \chi^2_{g-2}$$
- H₀: model calibrated
- **Large p-value = pass** (opposite of most tests — interview trap)
- **Can pass trivially when test has no power** (sparse middle bins from score saturation)

**Our findings:** H-L p=0.77 ("passes"), but reliability diagram shows 8/10 bins collapsed at ~0 due to quasi-separation → **calibration is indeterminate**, not "calibrated".

### Step 11 — Backtesting (Binomial by Grade)

Ongoing production monitoring. One-sided test per rating grade.

$$p\text{-value} = P(X \geq X_\text{obs} \mid X \sim \mathrm{Binomial}(n, p_\text{pred}))$$

**One-sided** because Basel cares about **under-prediction** (capital shortfall); over-prediction is conservative.

**Traffic light:**
- 🟢 p > 0.10 — continue
- 🟡 0.05-0.10 — enhanced monitoring
- 🔴 **p < 0.05 — trigger recalibration**

**Our findings:** 4/5 grades trivially 🟢 (near-zero predicted and observed — test underpowered). Stressed scenario (shrink preds by 30%) flipped top grade to 🔴.

### Step 12 — Stability (PSI)

**Audrey's quoted question answered here.**

$$\mathrm{PSI} = \sum_i (P^a_i - P^e_i) \cdot \ln(P^a_i / P^e_i)$$

**Critical pitfall:** Bin edges from **expected (baseline) only**, then apply to actual. Binning them independently makes both look uniform → PSI always ~0.

Thresholds: <0.10 stable | 0.10-0.25 monitor | **>0.25 investigate / refresh**

Two applications:
1. **Feature-level** — has each input drifted?
2. **Score-level** — has the output PD distribution drifted?

**Per-bin contributions** reveal drift SHAPE, not just magnitude — crucial for remediation.

### Step 13 — Validation Findings
Full summary ready in notebook Section 13.

---

## 3. Math Formula Cheat Sheet

### Probability
- $\mathrm{EL} = \mathrm{PD} \times \mathrm{LGD} \times \mathrm{EAD}$
- **Annual PD from quarterly CPDs:**
  $$\mathrm{PD}_{1y} = 1 - \prod_{i=1}^{4}(1 - \mathrm{CPD}_{Qi})$$
  (i.e., 1 minus probability of surviving all four quarters)

### Logistic Regression
- Log-odds: $\ln(p/(1-p)) = \beta_0 + \sum \beta_j x_j$
- Odds ratio: $\mathrm{OR}_j = e^{\beta_j}$
- Pseudo R² (McFadden): $1 - \mathrm{LL}_\text{model}/\mathrm{LL}_\text{null}$

### WoE / IV
- $\mathrm{WoE}_i = \ln(P_g(i)/P_b(i))$
- $\mathrm{IV} = \sum_i (P_g(i) - P_b(i)) \cdot \mathrm{WoE}_i$

### VIF
- $\mathrm{VIF}_j = 1/(1 - R_j^2)$

### Metrics
- $\mathrm{AUC} = P(\text{score}(bad) > \text{score}(good))$
- $\mathrm{KS} = \max_t |F_g(t) - F_b(t)|$
- $\mathrm{Gini} = 2 \cdot \mathrm{AUC} - 1$

### Calibration
- H-L: $\mathrm{HL} = \sum_j (O_j - E_j)^2 / [E_j(1 - E_j/n_j)] \sim \chi^2_{g-2}$

### Stability
- $\mathrm{PSI} = \sum_i (P^a_i - P^e_i) \ln(P^a_i / P^e_i)$

### Bayes
- $P(A|B) = P(B|A) P(A) / P(B)$

### Regularization loss
- L1: $\mathcal{L} + \lambda \sum |\beta|$ (Lasso — sparse)
- L2: $\mathcal{L} + \lambda \sum \beta^2$ (Ridge — shrinks)
- Elastic Net: mix

---

## 4. Interview Phrase Bank (for teleprompter source material)

### Data reconciliation
> "Before touching any statistics, I reconcile the dataset against source. I'd confirm row counts, tie portfolio totals to the general ledger, verify the as-of date, confirm the default flag is defined per Basel 90-DPD or institutional threshold, and document source lineage. Only once data integrity is established do I move to EDA and statistical validation."

### Why not just drop negative ages silently
> "The negative ages aren't round placeholders — abs() gives plausible adult ages — so my hypothesis is a sign error in source ETL. As a validator I flag this as a finding and escalate to data stewardship rather than silently transform. For modelling I'd drop these 3 rows (0.15% — immaterial) with documentation."

### Class imbalance handling (14% default)
> "14% default rate is moderate imbalance — typical for retail credit. I'd use stratified train/test split to preserve the ratio and evaluate with AUC/KS rather than accuracy. At 14% I don't need SMOTE or resampling."

### WoE/IV interpretation
> "IV tells me more than a bivariate plot does. Loan looked reasonable by eye, but an IV of 2 in production data would stop me cold. In validation, 'looks fine' is never a finding — a number either is or isn't above the threshold."

> "WoE and IV aren't black-box credit-scoring tricks — IV is exactly the symmetric KL divergence between the good and bad distributions across feature bins. So it has a principled information-theoretic interpretation."

### Multicollinearity remediation
> "I'd consider four options. First, engineer a ratio — income and loan naturally become DTI, which is how underwriters already think about risk. Second, drop the less predictive variable if the IV gap is clear. Third, regularization — L1 auto-selects but regulators generally expect explicit variable selection, so reserve for challenger or marketing models. Fourth, PCA — sound statistically but destroys interpretability, rarely usable in regulated credit."

### VIF gotcha
> "A common pitfall is running variance_inflation_factor without adding a constant — statsmodels doesn't add one automatically, and without it the internal regression is forced through origin, inflating VIFs. I always pass a matrix with add_constant() first."

### Quasi-separation
> "The summary flags quasi-separation with 40% perfectly-predicted rows. That's a model-killing finding. Before trusting any coefficient or p-value in this output, I'd resolve the separation — most likely by investigating whether age is actually leakage or by refitting with Firth's penalized likelihood."

### Train/test parity ≠ no leakage
> "A clean train-test gap is necessary but not sufficient. It rules out overfitting but doesn't rule out leakage — because leakage contaminates both partitions. When I see AUC > 0.95 on an independent test set, my next step isn't celebration, it's investigating feature derivation timestamps against the target's observation window."

### Calibration vs Discrimination
> "Discrimination measures ranking — can the model separate high risk from low. Calibration measures level — does a predicted 20% PD mean 20% actual default rate. AUC can be 0.8 while calibration is terrible; for marketing discrimination dominates but for regulatory capital calibration dominates, because capital is a function of the PD level, not the rank."

### Hosmer-Lemeshow underpower warning
> "A non-significant Hosmer-Lemeshow p-value isn't the same as 'calibrated'. You have to verify the test had power. If most predicted probabilities saturate near 0 or 1, middle bins are too sparse to reject any null, and H-L passes meaninglessly. I always pair H-L with reliability plot AND check sample size per bin."

### PSI pitfall
> "A common mistake in PSI implementations is binning expected and actual independently — that forces both distributions to appear uniform by construction, making PSI near-zero regardless of drift. Correct PSI uses bin edges from baseline only, applied to both populations."

### Stability answer (Audrey's quoted Q)
> "We can't trust it — we monitor it. The industry-standard tool is PSI computed both at the feature level and on the final score distribution. <0.10 suggests stable behavior, >0.25 triggers required investigation and potentially a model refresh. For higher-sensitivity models we complement PSI with adversarial domain classifiers — training a model to distinguish production records from training records; if that classifier succeeds with AUC >0.6, the population has meaningfully shifted even if PSI looks borderline."

### Backtesting
> "Backtesting in a regulated PD context answers whether realized defaults match model expectations after controlling for sample size. I use a one-sided binomial test per rating grade with H₁: actual > predicted, reflecting Basel's concern with under-prediction. Results map to a traffic-light dashboard — green (p>0.10), yellow (0.05-0.10), red (<0.05). A single red grade triggers recalibration."

### Why ML matters in a regulatory role
> "The misconception is that validation means reviewing scorecards. Validators build ML challengers to benchmark production LR, validate the bank's actual ML models for fraud and marketing, use tree-based models for feature discovery, and deploy adversarial classifiers for drift detection. The regulatory constraint on the production model makes ML expertise in the validation layer more valuable, not less."

### Why validation vs pure DS
> "The technical foundation overlaps — data quality, EDA, regression, evaluation. What distinguishes validation: (1) regulatory context where interpretability and stability are non-negotiable; (2) calibration emphasis because capital depends on PD level not rank — most DS practitioners don't know the distinction; (3) adversarial mindset — you're paid to find what's wrong, not build the best. I'm drawn to validation because the skeptical stance and regulatory layer make it more rigorous."

### PyTorch honest answer
> "I've worked in PyTorch at the fundamentals level — tensors, autograd, basic training loops — but I haven't deployed deep-learning models in production. My hands-on depth is in classical ML and statistical models, which I see as the right foundation for model validation in a regulatory context where interpretability dominates. I'd build DL project depth on the job if required to validate internal DL models."

### Storytelling to business
> Technical: "The model's IV on age is 3.76 indicating leakage"
> Business: "We found the model appears too accurate to be real — one of its key variables likely contains information about the outcome we're trying to predict. Before using this model for lending decisions, we need the data team to verify how age is calculated."

---

## 5. JD Coverage & Gap Analysis

### ✅ Strongly covered (from our PD case)
- PD modelling, LR theory, interpretability
- Data reconciliation (mindset + toolkit)
- Statistical techniques: WoE/IV, VIF, AUC/KS/Gini, PSI, H-L, binomial
- Accuracy, sensitivity (via PSI drift simulation), backtesting, calibration
- Validation findings delivery
- Retail acquisition PD context

### 🟡 Partial — need 口头 prep
- **LGD** — know formula, need modelling methodology (Beta regression / Tobit / workout vs market-based)
- **EAD** — know formula, CCF for revolving products
- **Wholesale credit** — LDP framework, Merton model, expert judgment, external benchmarking
- **Account management models** — behaviour features, observation window, seasoning
- **Sensitivity analysis** — formal stress test (we did PSI drift which is related)
- **Benchmarking** — concept known; XGBoost challenger case planned as extension
- **Regulatory vs Economic capital** — differences
- **Qualitative / conceptual soundness review** — documentation, governance, framework review
- **Storytelling** — Audrey's #1, need practice

### 🔴 Gaps needing attention
- **SQL** — Audrey explicitly flagged; practice LeetCode medium
- **SAS** — not coverable via practice, prepare honest "no deep experience"
- **PyTorch / DL** — honest answer prepared (see phrase bank)
- **GitHub workflow** — push case to a public repo if time permits
- **R / PySpark / Scala** — conceptual acknowledge only
- **Basel III / OSFI E-23 / SR 11-7** — need review
- **Monte Carlo Simulation** — used in economic capital modelling

### ⚪ Skip
- BSM / derivatives — not this role
- Time series / SARIMA unless PD model is time-varying
- VBA / Excel beyond pivot-table basics

---

## 6. 学姐 Docs Review

Location: `Statistics.docx`, `technical questions.docx` in same folder.

**Context correction:** these are from **学姐's own model-validation interview** (long ago), not from her recent MLE/Quant rounds. So **they are directly relevant** to RBC EMRM.

### Useful concept topics (study priorities)
1. **LR P-value → feature significance** ranking (coef magnitude, SE, VIF, single-variable fit)
2. **LR explanation for executives**
3. **Bias-variance tradeoff** (30-sec answer)
4. **Lasso (L1) vs Ridge (L2) vs Lars**
5. **Monte Carlo Simulation** (economic capital relevance)
6. **BSM / put option / VaR** — glance only (not this role)
7. **Risk categories** (market / credit / operational / liquidity / climate) — summary
8. **PD/LGD/EAD/EL** — just definitions
9. **Bayes Theorem** — basic recall
10. **Data cleaning 5-step framework** — (remove duplicates / fix structural errors / filter outliers / handle missing / validate)
11. **PD quarterly → annual formula** — MUST memorize (see Section 3)
12. **Handshake / lily-pad / dice / Monty Hall** — brain teasers, glance only
13. **Neural networks + autoencoder** — basic vocabulary
14. **SVM / One-class SVM / PCA / t-SNE** — one-line definitions
15. **SAS syntax** (if / where, merge, do loops, proc means vs freq) — skim, can't fake deeply
16. **R basics** (lapply/sapply, subsetting, data structures) — skim
17. **SQL** (UNION vs UNION ALL, JOIN types, last-obs query) — practice
18. **Python basics** (list/tuple/dict, join/split, negative indexing) — trivial
19. **VBA / Excel** (modules, VLOOKUP, pivot, formulas) — trivial

### What our case COVERS that these docs DON'T
- WoE / IV
- PSI
- Hosmer-Lemeshow
- AUC / KS / Gini
- Binomial backtest / traffic light
- Quasi-separation
- Full MRM governance layer
- Basel III specifics

---

## 7. Basel / Regulatory Quick Reference

### AIRB three parameters
- **PD** — Probability of Default (12-month)
- **LGD** — Loss Given Default (%)
- **EAD** — Exposure at Default ($)
- **EL** = PD × LGD × EAD

### Foundation IRB vs Advanced IRB
- **F-IRB**: estimate PD only; regulator supplies LGD & EAD
- **A-IRB**: estimate all three

### Basel Pillars
- **Pillar 1**: minimum capital ratio — quantitative, formula-driven
- **Pillar 2**: supervisory review — ICAAP, stress testing, economic capital
- **Pillar 3**: market discipline — public disclosure

### Guidance
- **OSFI E-23** (Canada) — MRM guidance
- **SR 11-7** (US) — MRM equivalent
- Both require: independent validation, effective challenge, documentation, ongoing monitoring

### Regulatory vs Economic Capital
- **Regulatory**: protects depositors/regulators, formula-prescribed
- **Economic**: internal, bank's own risk appetite (target ~AA rating), usually stricter; uses internal credit portfolio models (CreditMetrics, CreditRisk+) and Monte Carlo

### Wholesale vs Retail
- **Retail**: scorecard-based, LR on pools; statistical backtesting works
- **Wholesale**: LDP (few defaults), uses Merton structural + expert judgment + rating migration matrix; benchmarks against Moody's/S&P

### Account management vs Acquisition
| | Acquisition | Account Management |
|---|---|---|
| Customer | New applicant | Existing booked |
| Features | External (income, bureau) | Internal behaviour (utilization, DPD trend) |
| Decision | Approve / decline / line | Limit change / collections / cross-sell |

---

## 8. LGD / EAD Primer (for 口头)

### LGD
- Target: continuous 0-100% — typically bimodal at 0 and 1
- Modelling: **Beta regression, Tobit, fractional response**, or two-stage (classify 0-or-positive, then regress magnitude)
- Data: workout LGD (actual recoveries over time) vs market LGD (traded distressed debt prices)
- Metrics: MAE, RMSE, Spearman correlation (not AUC)
- Calibration: compare mean predicted vs mean observed by segment
- **Stability & backtesting same PSI framework, different discrimination framework**

### EAD
- Target: exposure amount at time of default
- Key concept: **CCF (Credit Conversion Factor)** for revolving (credit cards, LOC)
  - $\mathrm{EAD} = \text{drawn} + \mathrm{CCF} \times (\text{limit} - \text{drawn})$
- Customers tend to increase utilization before default → CCF > 0 empirically
- Similar modelling stack to LGD (Beta/fractional)

---

## 9. Next-Case Candidates (post-teleprompter)

### A) XGBoost Challenger (1 hour) — HIGHEST ROI
- Extend `ex1.ipynb` sections 14-15
- Fit XGBoost on same train/test
- Compare AUC/KS/Gini vs LR
- SHAP feature importance
- Finding: did LR miss non-linearity?

### B) LGD Regression (2-3 hours)
- LendingClub Kaggle data (has recoveries / loan_at_default)
- Beta regression or OLS
- MAE/RMSE/Spearman
- Covers biggest JD gap (LGD)

### C) Redo PD on Give Me Some Credit (2 hours)
- Richer features, categorical vars → real WoE on categoricals
- Real multicollinearity → real VIF story
- Better dataset for resume bullet

---

## 10. Teleprompter Format Spec

Each concept should be a **block** that Jerry can scan in 2-3 seconds:

```
## TOPIC NAME
- Point 1 — **keyword bolded**, 8-12 words
- Point 2
- Point 3
> "30-second oral answer, one sentence."
```

**Rules:**
- One topic per block, visually separated
- Bold the keyword per bullet
- 8-12 words per line max
- Group oral answer in a single quote block at bottom
- Avoid long paragraphs
- Use visual hierarchy (## headings, dividers)

**Suggested topic bundles** (each topic = one teleprompter block):
1. Self-intro / why this role
2. Data reconciliation
3. WoE / IV (+ KL divergence)
4. Multicollinearity / VIF
5. Logistic regression assumptions
6. Quasi-separation
7. AUC / KS / Gini (with credit benchmarks)
8. Calibration vs Discrimination
9. Hosmer-Lemeshow (+ power warning)
10. PSI (+ pitfall)
11. Backtesting traffic light
12. Train/test parity ≠ no leakage (four failure modes)
13. PD/LGD/EAD + EL formula
14. PD quarterly→annual formula
15. Basel Pillars 1/2/3 + AIRB
16. F-IRB vs A-IRB
17. Wholesale vs Retail (LDP)
18. Account management vs Acquisition
19. Regulatory vs Economic capital
20. Bias-variance
21. L1 vs L2 vs Elastic Net
22. Monte Carlo simulation
23. Neural network / backprop basics
24. PyTorch honest answer
25. ML in a regulatory role
26. Validation vs DS mindset
27. Storytelling technical → business
28. Challenger mindset questions TO ASK interviewer
29. Resume-bullet deep-dive template (STAR + AI leverage)

---

## 11. Outstanding Todos

- [ ] XGBoost challenger extension to `ex1.ipynb`
- [ ] Teleprompter deck built from this file
- [ ] SQL practice (LeetCode medium, 3-5 problems)
- [ ] Memorize PD quarterly formula
- [ ] Challenger-mindset reverse-question bank (~10 questions)
- [ ] Resume-bullet STAR stories with AI-leverage hook
- [ ] Wait for Audrey's alumni intro response
- [ ] Push `ex1.ipynb` to GitHub (if resume link desired)

---

## 12. Key Files in this Directory

- `ex1.ipynb` — clean organized PD validation case (54 cells)
- `ex1_backup.ipynb` — original messy version (untouched)
- `original.csv` — toy PD dataset (2000 rows, 4 features + default)
- `Statistics.docx` — 学姐's notes, general stats/DS
- `technical questions.docx` — 学姐's notes, coding (SAS/R/SQL/Python/Excel) + probability + risk
- `prep_notes.md` — this file

---

## 13. Jerry's Context (for next Claude instance)

- Rotman MMA student, Toronto
- Interview pipeline: TD MLE (done, live coding), NB Quant (done, live coding), RBC EMRM (this week)
- Uses **teleprompter** during video interview — reads from secondary screen
- Prefers English in chat (but comfortable in Chinese for dense concepts)
- Wants concise, specific, interview-ready output — not long explanations
- Already worked through full 13-step PD validation case — familiar with all concepts at medium depth
