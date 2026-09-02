import {
  DealInput,
  DealProfitOutput,
  DealScoreInput,
  DealRecommendation,
  RealizedDealData,
  RealizedProfitOutput,
} from "../types";

/**
 * Profit Engine (Blueprint Section 5)
 * Calculates total investment, net proceeds, projected profit, and ROI.
 */
export function calculateDealProfit(data: DealInput): DealProfitOutput {
  const totalInvestment =
    Number(data.purchasePrice || 0) +
    Number(data.repairs || 0) +
    Number(data.closingCosts || 0) +
    Number(data.holdingCosts || 0) +
    Number(data.financingCosts || 0) +
    Number(data.taxes || 0) +
    Number(data.insurance || 0) +
    Number(data.utilities || 0) +
    Number(data.otherCosts || 0);

  const netProceeds =
    Number(data.expectedSalePrice || 0) -
    Number(data.sellingCosts || 0) -
    Number(data.commissions || 0) -
    Number(data.concessions || 0);

  const projectedProfit = netProceeds - totalInvestment;

  const roi =
    totalInvestment > 0
      ? (projectedProfit / totalInvestment) * 100
      : 0;

  return {
    totalInvestment: Math.round(totalInvestment),
    netProceeds: Math.round(netProceeds),
    projectedProfit: Math.round(projectedProfit),
    roi: Number(roi.toFixed(1)),
  };
}

/**
 * Deal Scoring Engine (Blueprint Section 6)
 * Weighted multi-factor deal evaluation formula.
 */
export function calculateDealScore(data: DealScoreInput): number {
  const score =
    (data.financialOpportunity || 0) * 0.25 +
    (data.discount || 0) * 0.20 +
    (data.compsConfidence || 0) * 0.15 +
    (data.repairConfidence || 0) * 0.10 +
    (data.marketLiquidity || 0) * 0.10 +
    (data.exitPotential || 0) * 0.10 +
    (data.daysOnMarket || 0) * 0.05 +
    (data.dataConfidence || 0) * 0.05;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Deal Recommendation (Blueprint Section 7)
 * Configurable thresholds for pursuing, reviewing, high risk, or rejecting.
 */
export function getRecommendation(
  score: number,
  profit: number,
  roi: number,
  minProfit: number = 20000,
  minROI: number = 25
): DealRecommendation {
  if (score >= 85 && profit >= minProfit && roi >= minROI) {
    return "PURSUE";
  }

  if (score >= 70) {
    return "REVIEW";
  }

  if (score >= 50) {
    return "HIGH_RISK";
  }

  return "REJECT";
}

/**
 * Realized Profit Calculator (Blueprint Section 29)
 * Calculates actual historical returns upon deal closing.
 */
export function calculateRealizedProfit(data: {
  actualPurchasePrice: number;
  actualRepairCosts?: number;
  actualRepairs?: number;
  actualClosingCosts?: number;
  actualHoldingCosts?: number;
  actualFinancingCosts?: number;
  actualOtherCosts?: number;
  actualSalePrice: number;
  actualSellingCosts?: number;
  actualCommissions?: number;
}): RealizedProfitOutput {
  const repairs = data.actualRepairCosts ?? data.actualRepairs ?? 0;
  const totalCost =
    Number(data.actualPurchasePrice || 0) +
    Number(repairs) +
    Number(data.actualClosingCosts || 0) +
    Number(data.actualHoldingCosts || 0) +
    Number(data.actualFinancingCosts || 0) +
    Number(data.actualOtherCosts || 0);

  const proceeds =
    Number(data.actualSalePrice || 0) -
    Number(data.actualSellingCosts || 0) -
    Number(data.actualCommissions || 0);

  const realizedProfit = proceeds - totalCost;

  const roi = totalCost > 0 ? (realizedProfit / totalCost) * 100 : 0;

  return {
    totalCost: Math.round(totalCost),
    proceeds: Math.round(proceeds),
    realizedProfit: Math.round(realizedProfit),
    roi: Number(roi.toFixed(1)),
  };
}
