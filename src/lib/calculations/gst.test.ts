import { describe, it, expect } from "vitest";
import { computeTaxDocument, formatPaise, amountInWords } from "./gst";
import type { Paise, RateBp } from "@/types";

describe("Smart Car AC Works - Calculation Engine", () => {
  it("calculates Tax Invoice fixtures accurately", () => {
    const items = [
      {
        description: "Wind Screen",
        hsnSac: "8708",
        quantity: 1,
        unitPrice: 6807700 as Paise,
        gstRateBp: 1800 as RateBp,
      },
      {
        description: "Bracket",
        hsnSac: "8708",
        quantity: 1,
        unitPrice: 272500 as Paise,
        gstRateBp: 1800 as RateBp,
      },
      {
        description: "Head Light",
        hsnSac: "8512",
        quantity: 1,
        unitPrice: 8314900 as Paise,
        gstRateBp: 1800 as RateBp,
      },
      {
        description: "Bumper Cover",
        hsnSac: "8708",
        quantity: 1,
        unitPrice: 7292900 as Paise,
        gstRateBp: 1800 as RateBp,
      },
      {
        description: "Fender LHS",
        hsnSac: "8708",
        quantity: 1,
        unitPrice: 3957900 as Paise,
        gstRateBp: 1800 as RateBp,
      },
      {
        description: "Labour Charges As per Surveyor approved",
        hsnSac: "9987",
        quantity: 1,
        unitPrice: 7305000 as Paise,
        gstRateBp: 1800 as RateBp,
      },
    ];

    const result = computeTaxDocument(items, {
      supplyType: "INTRA",
      rounding: "EXCEL",
      pricing: "EXCLUSIVE",
    });

    // Subtotal: 68077 + 2725 + 83149 + 72929 + 39579 + 73050 = 339509
    expect(result.taxable).toBe(33950900);
    // CGST + SGST (18% of 339509 = 61111.62 -> 61112 in paise)
    expect(result.taxTotal).toBe(6111162);
    expect(result.grandTotal).toBe(40062100);
  });

  it("formats paise to plain number strings for template cells", () => {
    expect(formatPaise(40062000 as Paise)).toBe("400620");
    expect(formatPaise(11353000 as Paise, { decimals: 2 })).toBe("113530.00");
  });

  it("converts numbers to Indian English words", () => {
    const words = amountInWords(40062000 as Paise);
    expect(words.toLowerCase()).toContain("four lakh");
  });
});
