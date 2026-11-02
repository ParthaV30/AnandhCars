// Prints a template route with headless Edge (the client's browser) and compares it to the original PDF.
// Usage: npm run fidelity -- [route] [original.pdf] [tolerance_mm]
// Needs the dev server on :3000 and Python with pypdfium2.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [route = "/print/tax-invoice/sample", original = "D:/Client_Requirements/Billing_Software/Bill-036-8282-Volvo.pdf", tolerance = "0.5"] =
  process.argv.slice(2);

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("reference/out");
const outPdf = path.join(outDir, `${route.replaceAll("/", "_").replace(/^_/, "")}.pdf`);
mkdirSync(outDir, { recursive: true });

execFileSync(EDGE, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${outPdf}`, `http://localhost:3000${route}`], {
  stdio: "ignore",
});

try {
  execFileSync("python", ["-I", "scripts/compare_pdf.py", original, outPdf, tolerance], { stdio: "inherit" });
} catch {
  process.exitCode = 1;
}
