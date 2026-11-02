# Blueprint — Smart Car AC Works Billing System

> **Objective:** Billing software for Smart Car AC Works (Coimbatore). It prints the client's five existing documents in their exact current layout and typography, and replaces the Excel workflow they use today.
> **Mode:** Direct (project folder is not a git repo yet; Step 0 runs `git init`).
> **Source documents:** `D:\Client_Requirements\Billing_Software\*.pdf`
> **Status:** v2, 2026-10-29. Adversarial review applied (IGST/place of supply, credit notes, immutability trigger, deterministic pagination, bounding-box fidelity check, Step −1 client gate).

---

## 1. What we learned from the source PDFs

All five files were produced with **"Microsoft: Print To PDF"**. The client fills Excel/Word sheets and prints them. **Our real competitor is their Excel workbook**: entering a bill must be faster than in Excel, or they will go back to it.

| # | Document | Paper | Fonts embedded | Number format | Notes |
|---|---|---|---|---|---|
| 1 | **Tax Invoice** (Bill-036 Volvo) | US Letter | Times New Roman Bold, Cambria Bold, Arial, Calibri, Verdana | `036/2026-27` (resets each FY) | Billed to **insurer** (Bill-to + Ship-to). HSN 8708/8512 parts, **SAC 9987** labour. CGST+SGST lines, 18% & 28% slab summary, round-off, amount + tax in words, KVB bank, declaration, receiver signature |
| 2 | **Invoice / Labour Bill** (Bill-1414 XL6) | A4, 2 pages | Times New Roman, Arial, Arial Narrow, Verdana | Job No `1414` (running) | **No GST columns.** Parts then labour lines, qty as text ("4 LIT.", "1 SET"), rate often blank. Total → **Advance → Balance**. **Canara** bank + G-Pay no. |
| 3 | **Estimation** (Est-501 Baleno) | US Letter, 2 pages | Times New Roman Bold, Cambria Bold, Arial, Calibri, Verdana | Est/Job Card `501` | **Sections:** Parts / Labour / Tingaring / Painting, each numbered from 1. Part number printed under description. **Header repeats on page 2.** Totals 101755 + 18316 = 120071. "Prepared By" |
| 4 | **Claim Intimation** (Baleno) | US Letter | Times New Roman, Calibri, **Nirmala UI (Tamil)** | — | **The insurer's form** (United India Insurance). 20 numbered fields. Cause of accident written in **Tamil**. "Estimated Loss" = estimate total |
| 5 | **Quotation / simple estimate** (SCA XUV500) | A4 | Times New Roman, Cambria Bold, **Bookman Old Style** | none | No tax. Sl / Particulars / Qty / Per rate / Amount / Total |

### Visual specs (from rendered pages)
- **Excel look:** light-blue header/section bands (Office theme "Accent 1, 60% lighter", approx. `#B8CCE4`; sample the exact RGB in Step 1), thin black cell borders, heavier outer frame, white body.
- **Type roles (tax invoice / estimation):** company name in Times New Roman Bold (large); address/label blocks in Arial Bold, small; column headers in Times New Roman Bold; line items in Verdana (invoice) / Arial (estimation); bank block in Cambria Bold; amounts in words in Verdana.
- **Labour bill / quotation:** Times New Roman for line items, Arial Bold for the party block; quotation heading in **Bookman Old Style Bold**, labels in Cambria Bold.
- **Blank filler rows:** tables keep a fixed minimum height by padding empty bordered rows (visible in the quotation and tax invoice). Templates need a `minRows` setting.
- **Stamp + signature image:** the tax invoice prints a blue "For SMART CAR AC WORKS / Proprietor" stamp with a handwritten signature. We need a transparent PNG from the client.
- **Estimation page 2** repeats the full letterhead **and** customer block, not just the column header.
- **Claim form** has no letterhead: plain Times New Roman form with an underlined insurer title; Tamil paragraph in field 13.
- **The "SCA Quotation" file is titled "ESTIMATION"** on paper. Confirm whether the client calls it a quotation or a simple estimate.
- Dates are printed `dd.mm.yyyy` (claim policy period uses `dd/mm/yyyy`).

### The real workflow (from the data)

```
Vehicle arrives ─► Job Card / Estimation (501) ─► Claim Intimation (Estimated Loss = 120071)
                         │                                  │
                         │                          surveyor approves
                         ▼                                  ▼
            Retail: Labour Bill (1414)            Insurance: Tax Invoice (036/2026-27)
            Advance / Balance                     Bill-to = insurer, labour "as per surveyor approved"
Walk-in price ask ─► Quotation (no number, no tax)
```

**Product insight:** the biggest time saver is **converting one document into the next** (estimate → claim → tax invoice) without retyping. Excel can't do that.

### Calculation facts (golden test fixtures)
- Tax line: `taxable × 9%` is rounded to the rupee for display, and the line total is rounded (68077 → 6127 + 6127 → 80331).
- Volvo sub-total row shows the **unrounded** CGST (30555.76), while the summary shows 30556 and the words say "Sixty one thousand one hundred and twelve". **The samples are inconsistent.** The client must sign off on the rounding rule; we won't copy the inconsistency.
- Amounts in words use **Indian numbering** (lakh/crore). The samples use two different styles ("Four lakhs six hundred and twenty rupees only" vs "One lakh twenty thousand and seventy one Rupees only"); standardise on one.
- Estimate: 101755 × 1.18 = 120070.9 → 120071 (round-off line).

### Typos baked into the templates (ask before copying)
"Vechile", "Coimbtore" vs "Coimbatore", "Kalapatty" vs "Kalapatti", "LIMTED", "Tingaring", "Surveyer", "NAFGAR". **Recommendation:** fix static label typos with the client's written OK; never alter data the user types.

---

## 2. Key decisions

| Decision | Choice | Why |
|---|---|---|
| App type | **Web app** (works on the shop PC + phone), installable as a PWA | One workshop, 1–3 users, needs access from anywhere; our team knows the stack |
| Stack | Next.js (App Router) + TypeScript + Supabase (Postgres, Auth, RLS, Storage) | Team experience (KeyMitra), cheap, quick to ship |
| **Document rendering** | **HTML + print CSS rendered in the user's browser**, printed via the browser's print dialog / "Save as PDF" | Their Windows PCs already have every font in the samples, so the output matches exactly with **no font licensing problem**. Server-side rendering on Linux would not have these Microsoft fonts |
| Font fallbacks | `@font-face { src: local('Times New Roman'), local('TimesNewRomanPSMT'), url(LiberationSerif.woff2) }` pattern, with correct full/PostScript names per weight | Exact on Windows; **metric-compatible** substitutes elsewhere keep identical line breaks: Liberation Serif/Sans/Sans Narrow (Times/Arial/Arial Narrow), Carlito (Calibri), Caladea (Cambria), TeX Gyre Bonum (Bookman ≈), Noto Sans Tamil (Nirmala). Verdana has no metric clone. **Arial Narrow and Bookman Old Style come with MS Office, not Windows**, so check they're installed on the client PC |
| Font guard | Before printing, `document.fonts.check()` for every font the template needs; warn/block if a fallback would be used on the "official" print PC | Fallbacks are otherwise silent, and "exact" quietly degrades |
| Units | Layout in **mm/pt**, fixed `@page` size per template | Pixel layout drifts between screens; printed paper does not |
| **Pagination** | **Deterministic JS pagination**: measure rendered row heights, split into explicit per-page `<div>`s (letterhead + party block + column header repeated, totals block kept whole), mirroring the Excel rows-per-page | Browser `thead` repeat and `break-inside` are unreliable for complex headers and totals; explicit pages print identically every time |
| Print settings | In-app pre-print checklist (Margins: None, Scale: 100%, Headers/footers off) + `@page { margin: 0 }` | "Fit to page" or default margins silently rescale the output |
| Offline | v1 needs internet for numbering/finalise; draft entry is cached locally; documented fallback = keep the Excel templates for outages | Excel works offline today; numbering must stay server-authoritative |
| Money | Integer **paise** everywhere; round only in one tested module | No float drift; one place for rounding rules |
| Paper size | **Ask client** (three samples are Letter, two are A4) | Shops almost always print A4; Letter is probably an Excel default. Templates take a size parameter |
| Server PDF (later) | Optional Puppeteer/Gotenberg render with bundled fallback fonts, for "share on WhatsApp" | Not needed for v1; browser Save-as-PDF already gives exact output |

---

## 3. Data model (v1)

```
company_settings  (name, address lines, phones, email, GSTIN, state, logo, signatures,
                   bank_accounts[] → mapped per document type, gpay_no, declaration text)
customers         (name, title Mr/Ms/M/s, address, phone, email, gstin, state)
insurers          (name, gstin, state, address, claim_office e.g. "MOTOR OD CLAIMS, COIMBATORE")
vehicles          (reg_no UNIQUE, make, model, customer_id, last_kms)
catalog_items     (kind: part|labour|tinkering|painting|other, name, part_number,
                   hsn_sac, default_rate, gst_rate, unit)
number_series     (doc_type, prefix/format, fy, next_value)  -- locked increment in a DB function
documents         (doc_type: tax_invoice|credit_note|labour_bill|estimate|claim|quotation,
                   number (≤16 chars, UNIQUE per doc_type+FY), date (IST), status draft|final|cancelled,
                   customer_id, vehicle_id, insurer_id, kms, bill_to/ship_to snapshot,
                   place_of_supply_state + state_code, supply_type intra|inter, reverse_charge bool,
                   payer insurer|customer, source_document_id, original_invoice_id (credit notes),
                   company snapshot (GSTIN, address, bank), template_version,
                   totals snapshot, prepared_by, extra JSONB)
document_lines    (document_id, section, sl_no, description, part_number, hsn_sac,
                   qty_text, qty_num, uqc (NOS/LTR/SET), rate, discount, taxable, gst_rate,
                   cgst, sgst, igst, total)
payments          (document_id, date, amount, mode cash|upi|bank, ref)
claims            (document_id, policy_no, policy_from/to, idv, estimated_loss,
                   accident_at, place, cause_text (Tamil allowed), driver, fir, spot_survey,
                   surveyor)
```

Rules:
- **Drafts never consume a number.** The number is assigned only inside a `finalise_document()` Postgres function (row lock on `number_series`, FY computed from the **IST** date). Numbers never duplicate or skip. `next_value` is **seeded from the client's current Excel counters** (invoice 036 is already mid-FY 2026-27).
- **Finalised documents are immutable, enforced by a DB trigger** that rejects UPDATE/DELETE on final documents and their lines. Each one snapshots party, company settings, bank and template version, so reprints years later are identical.
- **Corrections:** a final tax invoice is corrected with a **credit/debit note** (GST s.34), never by editing it. Only estimates and quotations get revisions. A wrong invoice is **cancelled** (number kept, reason recorded), never deleted. Records are kept for 72 months (s.36).
- **Rule 46 tax-invoice fields** are all present: supplier/recipient GSTIN, place of supply (state + code), HSN/SAC, UQC, taxable value, rate, CGST/SGST **or IGST**, reverse-charge flag, signature.

---

## 4. Construction steps

Legend: **[S]** strongest model (design/fidelity), **[D]** default model. Skills to load are listed per step.

### Step −1 — Client decision gate (before the paid pilot) [—]
- **Context:** These answers change Step 1's output, so they must come first.
- **Tasks:** Get answers to §6 Q1–Q3 (paper size, original Excel files, typo policy), the **rounding rule** (per line vs per invoice), the **labour-bill GST question** (Q11) and the **turnover / e-invoicing check** (Q12); collect the stamp+signature PNG and current number counters.
- **Exit:** Written answers (WhatsApp/email is fine) saved in `docs/client-decisions.md`.

### Step 0 — Project scaffold [D]
- **Context:** Empty folder `C:\Users\sarat\OneDrive\Desktop\Billing`. Create the app here.
- **Tasks:** `git init`; Next.js + TS + ESLint + Vitest + Playwright; Supabase project (local CLI + linked remote); `.env.example`; folder layout `src/features/{documents,templates,catalog,customers,settings,reports}`; copy source PDFs to `reference/` (git-ignored if client asks).
- **Skills:** `frontend-patterns`, `coding-standards`
- **Verify:** `npm run build && npm test` green.
- **Exit:** App boots, CI script runs.

### Step 1 — Fidelity spike: Tax Invoice template + overlay tool [S] ⟵ *most important*
- **Context:** The client's #1 requirement is an exact match. Prove it on the hardest document (Bill-036 Volvo) before building anything else.
- **Tasks:**
  1. Render the original PDF to PNG at 150 dpi (pypdfium2) → `reference/png/`.
  2. Build `TaxInvoiceTemplate` as a pure component (props → HTML), using mm units, `@page { size: letter|A4; margin: 0 }`, the font stack + font guard from §2, and a `minRows` filler.
  3. Build the **deterministic paginator** (§2) here, not in Step 3. Prove it with a 40-line invoice that flows onto page 2.
  4. Build `/dev/overlay/[template]`: renders our template over the original PNG with an opacity slider + difference blend (visual check for humans).
  5. **Automated check:** print our page to PDF with Playwright, then extract **word bounding boxes** from both PDFs (pdfplumber) and assert every word sits within **0.5 mm** of the original. Pixel diff is noise, because Excel's GDI text rendering never pixel-matches Chromium.
  6. Fill the template with the exact Volvo sample data; also an **IGST variant** (out-of-state insurer) with the same layout.
  7. **Print on the client's own PC, browser and printer** (font check + print-settings checklist).
- **Skills:** `anthropic-skills:pdf`, `frontend-patterns`, `e2e-testing`
- **Verify:** Bounding-box report passes; overlay visually aligned.
- **Exit:** **Client signs off** on the printed Volvo replica (paper in hand). *Do not start Steps 3, 5 or 6 before this gate.*

### Step 2 — Calculation engine (TDD) [S] — *parallel with Step 1*
- **Context:** Pure TS module `src/features/documents/calc/`, no UI and no DB.
- **Tasks:** paise money type; supply type from supplier vs recipient state (GSTIN first 2 digits = state code); line calc (taxable, CGST+SGST **or IGST**, rounding policy as config, decided in Step −1); section subtotals; HSN/rate-slab summary (18%/28%); round-off; Indian amount-in-words (lakh/crore, one chosen style); FY helper (Apr–Mar → "2026-27"); number formatting (`036/2026-27`).
- **Golden fixtures:** every number in all five samples (Volvo totals 339508 / 61112 / 400620; Estimate 101755 / 18316 / 120071; Labour bill 113530 − 60000 = 53530; Quotation 22778).
- **Skills:** `tdd-workflow`, `coding-standards`
- **Verify:** `npm test -- calc` → 100% line coverage on this module.
- **Exit:** All fixtures pass, or a documented rule decision where the sample itself is inconsistent.

### Step 3 — Remaining four templates [S] — *parallel across templates, after Step 1 gate*
- **Context:** Reuse the Step 1 font stack, overlay tool and diff script.
- **Tasks:**
  - **3a Labour Bill:** A4, no GST, qty-as-text, blank-rate rows, multi-page continuation, Total/Advance/Balance block, Canara bank + G-Pay.
  - **3b Estimation:** sectioned lines (Parts/Labour/Tingaring/Painting), part number sub-line, **header repeated on every page**, page-break rules (never orphan a section header or the totals block).
  - **3c Claim Intimation:** insurer form, 20 fields, **Tamil text** (Nirmala UI → Noto Sans Tamil fallback), long-text wrapping in field 13.
  - **3d Quotation:** A4, Bookman Old Style heading, simple table.
- **Skills:** `frontend-patterns`, `e2e-testing`
- **Verify:** Overlay diff per template; a **stress fixture** per template (1 line, 25 lines, 60 lines, very long description, Tamil paragraph).
- **Exit:** Client sign-off per template.

### Step 4 — Database schema + security [D] — *parallel with Steps 1–3*
- **Tasks:** Supabase migrations for §3; `finalise_document()` function (number assignment + snapshot, one transaction); immutability trigger; RLS (only authenticated shop users; owner role for settings and cancellations; **no deletes** of final docs); public sign-up disabled; seed company settings and number counters; audit columns.
- **Skills:** `postgres-patterns`, `database-migrations`, `security-review`
- **Verify:** Migration applies to fresh local DB; concurrency test: 20 parallel finalises → 20 unique, gap-free numbers; drafts consume none; UPDATE on a final document is rejected.
- **Exit:** `supabase db reset` clean; advisors show no security warnings.

### Step 5 — Fast entry UI [S]
- **Context:** Must beat Excel. Keyboard-first.
- **Tasks:** Vehicle-number-first lookup (type "TN 38 CW 8176" → customer + vehicle + last kms filled); line grid with Tab/Enter navigation, catalogue autocomplete (name or part no → HSN, rate, GST filled); section headers; live totals; "Preview" = the real print template; Print / Save PDF; draft autosave.
- **Skills:** `frontend-patterns`, `ui-ux-pro-max:ui-ux-pro-max`
- **Verify:** Playwright: create the Volvo invoice from scratch in under **3 minutes**, keyboard only; printed output matches the Step 1 fixture.
- **Exit:** Owner tries it on their real PC and approves the speed.

### Step 6 — Workflows & payments [D]
- **Tasks:** Convert Estimate → Claim Intimation (pre-fills vehicle, insured, estimated loss) → Tax Invoice (bill-to = insurer, lines copied, editable for surveyor-approved amounts); **split billing**: one job, an invoice to the insurer + an invoice to the customer for depreciation/excess/non-approved items; Quotation → Estimate; **credit notes** against a final invoice; payments (advance, partials, balance); document history by vehicle/customer; search; reprint finalised documents; cancel with reason (keeps the number).
- **Skills:** `backend-patterns`, `tdd-workflow`
- **Verify:** E2E: full insurance flow + full retail flow.
- **Exit:** Both flows pass end to end.

### Step 7 — Reports & backup [D]
- **Tasks:** Simple home screen (today's billing, pending balances, open estimates/claims; plain numbers, no charts in v1); GST sales register per month (invoice-wise, HSN-wise, incl. credit notes) exportable to Excel for the accountant / GSTR-1; outstanding report; backups (Supabase backups + weekly **password-protected** Excel/JSON export to the owner's Google Drive). Claim data holds personal info (policy no., phone, address), so exports go only to the owner.
- **Skills:** `anthropic-skills:xlsx`
- **Verify:** Report totals = sum of finalised invoices for the period.

### Step 8 — Hardening, deploy, handover [D]
- **Tasks:** Security review (auth, RLS, input validation); Vercel deploy + custom domain; load the client's catalogue (parts/labour price list from their Excel files); printer test on **their** printer; staff training (30 min); short user guide.
- **Skills:** `security-review`, `deployment-patterns`, `verification-loop`
- **Exit:** Client issues 10 real bills in parallel with Excel for one week without a mismatch, then signs UAT.

### Dependency graph

```
Step −1 (client answers) ─► Step 0 ─┬─► Step 1 (fidelity gate) ─┬─► Step 3a/3b/3c/3d (parallel) ──────┐
                                    ├─► Step 2 (calc engine) ────┤                                     │
                                    └─► Step 4 (schema) ─────────┴─► Step 5 (entry UI) ─► Step 6 ─► Step 7 ─► Step 8
```
Step 5 needs only Steps 1, 2 and 4 (it uses the approved tax-invoice template), so the other templates run alongside it. Step 6 needs Step 3 finished.

**Invariants after every step:** `npm run build`, `npm test` green; the overlay diff for already-approved templates does not regress.

---

## 5. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| "Exact" disputed at handover | High | Step 1 overlay + **written sign-off per template** as the acceptance criterion |
| Browser print margins/headers differ between Chrome and Edge | Med | Set `@page` margins explicitly; document "Margins: None, Headers/footers off" print setting; test on their browser |
| Printing from a phone or Mac (no MS fonts) | Med | Metric-compatible fallback fonts; recommend printing from the shop PC |
| Long estimates break pages badly | Med | Stress fixtures in Step 3; keep-together rules |
| GST rounding rule disputes | Med | One config module + client sign-off on the rule; accountant review |
| Claim forms differ per insurer | Med | v1 = United India form; each extra insurer form is a quoted add-on |
| Scope creep into a full workshop ERP (inventory, job cards, suppliers) | High | Fixed v1 scope (§7); everything else quoted separately |

---

## 6. Questions for the client (before final quote)

1. **Paper size:** A4 or Letter? (Samples are mixed.)
2. Send the **original Excel/Word files**? They give exact column widths and row heights for free.
3. Fix the label typos (Vechile, Coimbtore, LIMTED, Tingaring), or keep them exactly?
4. Which **insurers' claim forms** are needed? Only United India, or New India and others too?
5. Who uses it: how many staff, and is printing done from one shop PC?
6. Do they want a **parts/labour price list** stored (we import from their Excel)?
7. Do they need a **GST sales report** for their accountant / GSTR-1?
8. Logo, signature and stamp images to print?
9. Do they need **inventory/stock**? (Out of v1 scope; quoted separately.)
10. Do they want to share PDFs to **WhatsApp** directly from the phone?
11. **Labour bill without GST** (₹1,13,530 with no tax shown, though the GSTIN is printed): is that a bill of supply, tax-inclusive, or should GST be shown? **Their accountant must confirm before Step 3a.**
12. Is annual turnover under **₹5 crore**? (If not, e-invoicing with IRN/QR is mandatory and moves into v1.)
13. On insurance jobs, does the customer pay depreciation/excess separately (**two invoices per job**)?
14. Rounding: round tax per line (as the printed lines show) or per invoice?
15. Current running numbers for each series (invoice, job/labour bill, estimate), so we continue from them.

---

## 7. Proposed v1 scope & commercials (draft)

**In:** 5 templates matched exactly (sign-off per template), customers/vehicles/insurers, parts & labour catalogue, GST calc (CGST/SGST + IGST) + HSN summary, credit notes, number series per FY, estimate→claim→invoice conversion, advance/balance payments, history & reprint, dashboard, GST sales register export, backups, 2 user logins, deployment and training.

**Out (quoted separately):** inventory & purchases, supplier management, extra insurer claim forms, multi-branch, e-invoicing/IRN (**assumes turnover < ₹5 Cr**, see Q12), SMS/WhatsApp API, full offline mode, data migration of old bills.

**Suggested commercial structure:**
- **Paid pilot (Step 1):** Tax invoice replica printed and signed off; fee credited against the project.
- **Project:** 30% start / 40% after all templates signed off + entry UI demo / 30% after UAT week.
- **AMC:** hosting (Supabase + Vercel) + support, yearly.
- **Timeline:** about 5 weeks after the pilot (Steps 3–8, with 3/4 running in parallel).

*(Price figures are a business decision for Orbenyx; this plan sizes the scope only.)*
