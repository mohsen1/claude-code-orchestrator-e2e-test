import { describe, it, expect } from "vitest";
import { simplifyDebts, calculateBalances, calculateSettlements, getUserDebtSummary } from "./settlement";

describe("simplifyDebts", () => {
  it("should simplify basic debts correctly", () => {
    // A owes B $100, B owes C $100
    // Simplified: A owes C $100
    const balances = new Map([
      ["A", -10000], // A owes 100
      ["B", 0],      // B breaks even
      ["C", 10000],  // C is owed 100
    ]);

    const debts = simplifyDebts(balances);

    expect(debts).toHaveLength(1);
    expect(debts[0]).toEqual({
      owes: "A",
      owedTo: "C",
      amount: 10000,
    });
  });

  it("should handle multiple debts efficiently", () => {
    // Complex scenario with 4 people
    const balances = new Map([
      ["A", -15000], // A owes 150
      ["B", 5000],   // B is owed 50
      ["C", 5000],   // C is owed 50
      ["D", 5000],   // D is owed 50
    ]);

    const debts = simplifyDebts(balances);

    // Should result in 3 transactions: A -> B, A -> C, A -> D
    expect(debts).toHaveLength(3);

    const totalOwedByA = debts
      .filter((d) => d.owes === "A")
      .reduce((sum, d) => sum + d.amount, 0);

    expect(totalOwedByA).toBe(15000);
  });

  it("should handle zero balances", () => {
    const balances = new Map([
      ["A", 0],
      ["B", 0],
      ["C", 0],
    ]);

    const debts = simplifyDebts(balances);

    expect(debts).toHaveLength(0);
  });

  it("should handle single person owing multiple people", () => {
    const balances = new Map([
      ["A", -20000], // A owes 200
      ["B", 10000],  // B is owed 100
      ["C", 10000],  // C is owed 100
    ]);

    const debts = simplifyDebts(balances);

    expect(debts).toHaveLength(2);
    expect(debts).toContainEqual({ owes: "A", owedTo: "B", amount: 10000 });
    expect(debts).toContainEqual({ owes: "A", owedTo: "C", amount: 10000 });
  });
});

describe("calculateBalances", () => {
  it("should calculate equal splits correctly", () => {
    const expenses = [
      {
        amount: 3000, // $30 paid by A, split equally among A, B, C
        paidById: "A",
        splitType: "EQUAL" as const,
        involvedUserIds: ["A", "B", "C"],
      },
    ];

    const balances = calculateBalances(expenses, ["A", "B", "C"]);

    // A paid $30, owes $10 (their share), net: +$20
    expect(balances.get("A")).toBe(2000);
    // B owes $10
    expect(balances.get("B")).toBe(-1000);
    // C owes $10
    expect(balances.get("C")).toBe(-1000);
  });

  it("should handle multiple expenses", () => {
    const expenses = [
      {
        amount: 6000, // $60 paid by A, split among A, B, C, D
        paidById: "A",
        splitType: "EQUAL" as const,
        involvedUserIds: ["A", "B", "C", "D"],
      },
      {
        amount: 4000, // $40 paid by B, split among A, B, C
        paidById: "B",
        splitType: "EQUAL" as const,
        involvedUserIds: ["A", "B", "C"],
      },
    ];

    const balances = calculateBalances(expenses, ["A", "B", "C", "D"]);

    // A: paid $60 - $15 (their share from first) - $13.33 (their share from second) ≈ $31.67
    expect(balances.get("A")).toBeCloseTo(3167, 0);
    // B: paid $40 - $15 (their share from first) - $13.33 (their share from second) ≈ $11.67
    expect(balances.get("B")).toBeCloseTo(1167, 0);
    // C: owes $15 + $13.33 ≈ $28.33
    expect(balances.get("C")).toBeCloseTo(-2833, 0);
    // D: owes $15
    expect(balances.get("D")).toBe(-1500);
  });
});

describe("calculateSettlements", () => {
  it("should calculate optimal settlements", () => {
    const expenses = [
      {
        amount: 3000, // $30 paid by A
        paidById: "A",
        splitType: "EQUAL" as const,
        involvedUserIds: ["A", "B", "C"],
      },
      {
        amount: 6000, // $60 paid by B
        paidById: "B",
        splitType: "EQUAL" as const,
        involvedUserIds: ["A", "B", "C"],
      },
    ];

    const settlements = calculateSettlements(expenses, ["A", "B", "C"]);

    // Net balances:
    // A: +$30 - $10 - $20 = $0
    // B: +$60 - $10 - $20 = $30
    // C: $0 - $10 - $20 = -$30
    // Settlement: C owes B $30

    expect(settlements).toHaveLength(1);
    expect(settlements[0]).toEqual({
      owes: "C",
      owedTo: "B",
      amount: 3000,
    });
  });
});

describe("getUserDebtSummary", () => {
  it("should calculate user's debt summary", () => {
    const debts = [
      { owes: "A", owedTo: "B", amount: 5000 },
      { owes: "A", owedTo: "C", amount: 3000 },
      { owes: "D", owedTo: "A", amount: 2000 },
    ];

    const summary = getUserDebtSummary("A", debts);

    expect(summary.owes).toBe(8000); // A owes $80
    expect(summary.owed).toBe(2000); // A is owed $20
  });

  it("should return zeros for user with no debts", () => {
    const debts = [
      { owes: "B", owedTo: "C", amount: 5000 },
    ];

    const summary = getUserDebtSummary("A", debts);

    expect(summary.owes).toBe(0);
    expect(summary.owed).toBe(0);
  });
});
