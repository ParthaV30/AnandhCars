# Smart Car AC Works — Billing

Billing software that prints the client's existing documents (tax invoice, labour bill, estimation,
claim intimation, quotation) **exactly** as their Excel sheets do. Plan: [plans/smart-car-billing.md](plans/smart-car-billing.md).

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # calc engine (Vitest)
npm run test:coverage
npm run build
```

## Fidelity check

Templates are measured from the client's PDFs and verified word-by-word against them.
Needs the dev server running, Microsoft Edge, and Python with `pypdfium2` + `numpy`.

```bash
npm run fidelity                                    # tax invoice vs Bill-036-8282-Volvo.pdf
python -I scripts/measure_pdf.py <file.pdf> [page]  # rules, fills, text runs (mm) for building a template
```

- `/print/tax-invoice/sample` — the Volvo sample; print with **Margins: None, Scale: 100%**.
- `/dev/overlay` — our page under the client's original (dev only).

Things learned from the client's PDFs:
- Font sizes reported by the PDF are **96-dpi pixels** (Microsoft Print to PDF), so `font("arial", 9.9)` means 9.9px.
- The tax invoice is entered **GST-inclusive**; Excel back-calculates taxable = total ÷ 1.18.
- Excel keeps runs of spaces and never forms ligatures; the templates do the same.

## Layout

```
src/features/documents/calc/       money (paise), GST, words, dates — pure, 100% covered
src/features/documents/fixtures/   the client's five sample documents as data
src/features/templates/            print templates (one folder per document)
scripts/                           PDF measurement and fidelity comparison
```
