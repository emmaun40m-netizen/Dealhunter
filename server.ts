import express from "express";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { store } from "./src/services/store";
import { parseDealHunterCommand } from "./src/services/geminiService";
import { STATE_WHOLESALE_RULES, LIVE_REAL_ESTATE_NEWS, getStateWholesaleInfo } from "./src/services/complianceData";
import { CONTRACT_TEMPLATES } from "./src/services/contractTemplatesData";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      version: "2.0.0",
      app: "DealHunter AI Properties",
      timestamp: new Date().toISOString(),
    });
  });

  // --- Real Estate Wholesale Legal Compliance & Licensing (50 States) ---
  app.get("/api/compliance/states", (_req, res) => {
    res.json({ success: true, states: STATE_WHOLESALE_RULES });
  });

  app.get("/api/compliance/states/:code", (req, res) => {
    const info = getStateWholesaleInfo(req.params.code);
    res.json({ success: true, rule: info });
  });

  app.get("/api/compliance/news", (_req, res) => {
    res.json({ success: true, news: LIVE_REAL_ESTATE_NEWS });
  });

  // --- Contract Templates (Seller, Buyer, Investor with Owner Edit/CRUD & $0 Down EMD Handling) ---
  app.get("/api/contract-templates", (_req, res) => {
    res.json({ success: true, templates: store.getContractTemplates() });
  });

  app.post("/api/contract-templates", (req, res) => {
    try {
      const created = store.createContractTemplate(req.body);
      res.json({ success: true, template: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put("/api/contract-templates/:id", (req, res) => {
    try {
      const updated = store.updateContractTemplate(req.params.id, req.body);
      res.json({ success: true, template: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/contract-templates/:id", (req, res) => {
    const deleted = store.deleteContractTemplate(req.params.id);
    res.json({ success: deleted });
  });

  app.post("/api/contract-templates/reset", (_req, res) => {
    const templates = store.resetContractTemplates();
    res.json({ success: true, templates });
  });

  // --- Multi-Language Contract Translation & Dispatch ---
  app.post("/api/contract-templates/translate", async (req, res) => {
    try {
      const { contractText, targetLanguage } = req.body;
      if (!contractText || !targetLanguage) {
        res.status(400).json({ success: false, error: "contractText and targetLanguage are required" });
        return;
      }
      const result = await store.translateContractText({
        contractText,
        targetLanguage,
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/contract-templates/dispatch", (req, res) => {
    try {
      const record = store.dispatchContract(req.body);
      res.json({ success: true, record });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.get("/api/contract-templates/dispatches", (_req, res) => {
    res.json({ success: true, dispatches: store.getContractDispatches() });
  });

  app.patch("/api/contract-templates/dispatches/:id/status", (req, res) => {
    const updated = store.updateDispatchStatus(req.params.id, req.body.status);
    if (!updated) {
      res.status(404).json({ success: false, error: "Dispatch record not found" });
      return;
    }
    res.json({ success: true, record: updated });
  });

  // --- Payment Portal, Escrow Wallet & Bank Cashout ---
  app.get("/api/payments/wallet", (_req, res) => {
    res.json({
      success: true,
      wallet: store.getWalletBalance(),
      bankAccounts: store.getBankAccounts(),
      transactions: store.getPaymentTransactions(),
      invoices: store.getPaymentInvoices(),
    });
  });

  app.get("/api/payments/banks", (_req, res) => {
    res.json({ success: true, bankAccounts: store.getBankAccounts() });
  });

  app.post("/api/payments/link-bank", (req, res) => {
    try {
      const bank = store.linkBankAccount(req.body);
      res.json({ success: true, bankAccount: bank });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post("/api/payments/set-default-bank", (req, res) => {
    const success = store.setDefaultBankAccount(req.body.id);
    res.json({ success, bankAccounts: store.getBankAccounts() });
  });

  app.post("/api/payments/cashout", (req, res) => {
    try {
      const result = store.cashoutToBank(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post("/api/payments/receive", (req, res) => {
    try {
      const tx = store.receiveEscrowDeposit(req.body);
      res.json({ success: true, transaction: tx, wallet: store.getWalletBalance() });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post("/api/payments/release-escrow/:id", (req, res) => {
    const success = store.releaseEscrowToAvailable(req.params.id);
    res.json({ success, wallet: store.getWalletBalance() });
  });

  app.get("/api/payments/transactions", (_req, res) => {
    res.json({ success: true, transactions: store.getPaymentTransactions() });
  });

  app.get("/api/payments/invoices", (_req, res) => {
    res.json({ success: true, invoices: store.getPaymentInvoices() });
  });

  app.post("/api/payments/invoices", (req, res) => {
    try {
      const invoice = store.createPaymentInvoice(req.body);
      res.json({ success: true, invoice });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // --- Live Real Estate AI Legal Advisor Chat ---
  app.get("/api/chat/messages", (_req, res) => {
    res.json({ success: true, messages: store.chatMessages });
  });

  app.post("/api/chat/ask", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question || !question.trim()) {
        res.status(400).json({ success: false, error: "Question cannot be empty" });
        return;
      }
      const aiReply = await store.askLegalAdvisor(question);
      res.json({ success: true, message: aiReply, messages: store.chatMessages });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Agent 4: Desktop Underwriting, Title & Escrow Audit, Virtual Closer ---
  app.post("/api/closer/underwrite/:dealId", async (req, res) => {
    try {
      const report = await store.runDesktopUnderwritingAndClose(req.params.dealId, req.body);
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/closer/reports/:dealId", (req, res) => {
    const report = store.getDesktopReport(req.params.dealId);
    if (!report) {
      res.status(404).json({ success: false, error: "Report not found" });
      return;
    }
    res.json({ success: true, report });
  });

  // --- Search Profiles (Section 20, 23) ---
  app.get("/api/search-profiles", (_req, res) => {
    res.json({ success: true, data: store.searchProfiles });
  });

  app.post("/api/search-profiles", (req, res) => {
    const newProfile = {
      id: `sp-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    store.searchProfiles.push(newProfile);
    res.json({ success: true, profile: newProfile });
  });

  app.put("/api/search-profiles/:id", (req, res) => {
    const idx = store.searchProfiles.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: "Profile not found" });
      return;
    }
    store.searchProfiles[idx] = { ...store.searchProfiles[idx], ...req.body };
    res.json({ success: true, profile: store.searchProfiles[idx] });
  });

  // --- Properties (Section 19, 23) ---
  app.get("/api/properties/search", (req, res) => {
    const criteria = {
      maxPrice: Number(req.query.maxPrice || store.config.defaultMaxPrice),
      minProfit: Number(req.query.minProfit || store.config.minProfit),
      minROI: Number(req.query.minROI || store.config.minROI),
      states: String(req.query.states || "")
        .split(",")
        .filter(Boolean),
      propertyTypes: String(req.query.propertyTypes || "")
        .split(",")
        .filter(Boolean),
    };

    const results = store.searchProperties(criteria);
    res.json({
      success: true,
      criteria,
      count: results.length,
      results,
    });
  });

  app.get("/api/properties/:id", (req, res) => {
    const property = store.getProperty(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, error: "Property not found" });
      return;
    }
    res.json({ success: true, property });
  });

  // --- Deals (Section 23) ---
  app.get("/api/deals", (_req, res) => {
    res.json({ success: true, deals: store.getDeals() });
  });

  app.get("/api/deals/:id", (req, res) => {
    const deal = store.getDeal(req.params.id);
    if (!deal) {
      res.status(404).json({ success: false, error: "Deal not found" });
      return;
    }
    res.json({ success: true, deal });
  });

  app.post("/api/deals/:id/analyze", async (req, res) => {
    try {
      const deal = await store.analyzeDeal(req.params.id, req.body.financials);
      res.json({ success: true, deal });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/deals/:id/stage", (req, res) => {
    try {
      const { stage, notes } = req.body;
      const deal = store.updateDealStage(req.params.id, stage, notes);
      res.json({ success: true, deal });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/deals/:id/realized", (req, res) => {
    try {
      store.recordRealizedDeal({
        dealId: req.params.id,
        ...req.body,
        closedDate: req.body.closedDate || new Date().toISOString().split("T")[0],
      });
      res.json({ success: true, message: "Realized profit recorded." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Agents Workforce & NL Command (Section 8, 9, 11, 21) ---
  app.get("/api/agents", (_req, res) => {
    res.json({
      success: true,
      agents: store.agentsStatus,
      tasks: store.tasks,
    });
  });

  app.get("/api/agents/:agent", (req, res) => {
    const agent = store.agentsStatus[req.params.agent.toUpperCase()];
    if (!agent) {
      res.status(404).json({ success: false, error: "Agent not found" });
      return;
    }
    res.json({ success: true, agent });
  });

  app.post("/api/agents/command", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command) {
        res.status(400).json({ success: false, error: "Command required" });
        return;
      }

      store.log("DEALHUNTER", "NL Command Received", `"${command}"`, "INFO");
      const parsed = await parseDealHunterCommand(command);

      // Execute pipeline based on parsed criteria
      const results = await store.runFullAgentPipeline(parsed.criteria);

      res.json({
        success: true,
        command,
        parsed,
        results,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/agents/run-pipeline", async (req, res) => {
    try {
      const results = await store.runFullAgentPipeline(req.body.criteria);
      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Investors & Matching (Section 23) ---
  app.get("/api/investors", (_req, res) => {
    res.json({ success: true, investors: store.investors });
  });

  app.post("/api/investors", (req, res) => {
    const newInv = {
      id: `inv-${Date.now()}`,
      ...req.body,
      activeDealsCount: 0,
    };
    store.investors.push(newInv);
    res.json({ success: true, investor: newInv });
  });

  app.get("/api/investors/match/:dealId", (req, res) => {
    const matches = store.matchInvestorsForDeal(req.params.dealId);
    res.json({ success: true, matches });
  });

  // --- Contacts (Section 23) ---
  app.get("/api/contacts", (_req, res) => {
    res.json({ success: true, contacts: store.contacts });
  });

  app.get("/api/contacts/:id", (req, res) => {
    const contact = store.contacts.find((c) => c.id === req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, error: "Contact not found" });
      return;
    }
    res.json({ success: true, contact });
  });

  app.patch("/api/contacts/:id", (req, res) => {
    const contact = store.contacts.find((c) => c.id === req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, error: "Contact not found" });
      return;
    }
    Object.assign(contact, req.body);
    res.json({ success: true, contact });
  });

  // --- Outreach (Section 11, 12, 13, 23) ---
  app.get("/api/outreach", (_req, res) => {
    res.json({
      success: true,
      messages: store.outreachMessages,
      sentToday: store.countSentToday(),
      dailyLimit: store.config.dailyOutreachLimit,
    });
  });

  app.post("/api/outreach/draft", async (req, res) => {
    try {
      const { propertyId, tone } = req.body;
      const draft = await store.createOutreachDraft(propertyId, tone);
      res.json({ success: true, draft });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/outreach/:id/send", (req, res) => {
    const result = store.sendOutreachMessage(req.params.id);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message });
      return;
    }
    res.json({ success: true, message: result.message });
  });

  // --- Contracts (Section 23) ---
  app.get("/api/contracts", (_req, res) => {
    res.json({ success: true, contracts: store.contracts });
  });

  app.post("/api/contracts/draft", async (req, res) => {
    try {
      const contract = await store.createContractDraft(req.body);
      res.json({ success: true, contract });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/contracts/:id/sign", (req, res) => {
    const cnt = store.contracts.find((c) => c.id === req.params.id);
    if (!cnt) {
      res.status(404).json({ success: false, error: "Contract not found" });
      return;
    }
    cnt.status = "EXECUTED";
    cnt.updatedAt = new Date().toISOString();
    store.log("HUMAN", "Contract Executed", `Signed ${cnt.type} for ${cnt.propertyAddress}`, "SUCCESS");
    res.json({ success: true, contract: cnt });
  });

  // --- Human Approvals (Section 17, 18, 23) ---
  app.get("/api/approvals", (_req, res) => {
    res.json({ success: true, approvals: store.approvals });
  });

  app.post("/api/approvals/:id/approve", (req, res) => {
    try {
      const approval = store.approveRequest(req.params.id, req.body.notes);
      res.json({ success: true, approval });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/approvals/:id/reject", (req, res) => {
    try {
      const approval = store.rejectRequest(req.params.id, req.body.notes);
      res.json({ success: true, approval });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Background Sync & Offline Actions Batch API ---
  app.get("/api/sync/status", (_req, res) => {
    res.json({
      success: true,
      serviceWorkerSupport: true,
      backgroundSyncReady: true,
      timestamp: new Date().toISOString(),
      activeDealsCount: store.getDeals().length,
      pendingApprovalsCount: store.approvals.filter((a) => a.status === "PENDING").length,
    });
  });

  app.post("/api/sync/batch", async (req, res) => {
    try {
      const { actions = [] } = req.body;
      const results: any[] = [];
      let successCount = 0;
      let failureCount = 0;

      for (const act of actions) {
        try {
          if (act.type === "DEAL_APPROVAL") {
            const approvalId = act.metadata?.entityId || act.body?.approvalId || act.endpoint?.split("/")[3];
            const notes = act.body?.notes || "Approved via Offline Action Queue Sync";
            if (approvalId) {
              const approval = store.approveRequest(approvalId, notes);
              results.push({ id: act.id, status: "SYNCED", result: approval });
              successCount++;
            }
          } else if (act.type === "DEAL_REJECTION") {
            const approvalId = act.metadata?.entityId || act.body?.approvalId || act.endpoint?.split("/")[3];
            const notes = act.body?.notes || "Rejected via Offline Action Queue Sync";
            if (approvalId) {
              const approval = store.rejectRequest(approvalId, notes);
              results.push({ id: act.id, status: "SYNCED", result: approval });
              successCount++;
            }
          } else if (act.type === "CONTRACT_SIGN") {
            const contractId = act.metadata?.entityId || act.endpoint?.split("/")[3];
            const cnt = store.contracts.find((c) => c.id === contractId);
            if (cnt) {
              cnt.status = "EXECUTED";
              cnt.updatedAt = new Date().toISOString();
              store.log("HUMAN", "Contract Executed (Offline Sync)", `Signed ${cnt.type} for ${cnt.propertyAddress}`, "SUCCESS");
              results.push({ id: act.id, status: "SYNCED", result: cnt });
              successCount++;
            }
          } else if (act.type === "OUTREACH_SEND") {
            const messageId = act.metadata?.entityId || act.endpoint?.split("/")[3];
            if (messageId) {
              const sendResult = store.sendOutreachMessage(messageId);
              results.push({ id: act.id, status: sendResult.success ? "SYNCED" : "FAILED", result: sendResult });
              if (sendResult.success) successCount++;
              else failureCount++;
            }
          } else if (act.type === "DEAL_STAGE_UPDATE") {
            const dealId = act.metadata?.entityId || act.endpoint?.split("/")[3];
            const { stage, notes } = act.body || {};
            if (dealId && stage) {
              const deal = store.updateDealStage(dealId, stage, notes);
              results.push({ id: act.id, status: "SYNCED", result: deal });
              successCount++;
            }
          } else {
            // General acknowledgment
            results.push({ id: act.id, status: "SYNCED", message: "Action accepted" });
            successCount++;
          }
        } catch (actErr: any) {
          results.push({ id: act.id, status: "FAILED", error: actErr.message });
          failureCount++;
        }
      }

      store.log(
        "SYSTEM",
        "Offline Actions Batch Synced",
        `Processed ${actions.length} actions: ${successCount} successful, ${failureCount} failed`,
        "SUCCESS"
      );

      res.json({
        success: true,
        processedCount: actions.length,
        successCount,
        failureCount,
        results,
        syncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Dashboard & Profit Analytics (Section 23, 28, 30) ---
  app.get("/api/dashboard", (_req, res) => {
    res.json({
      success: true,
      ...store.getDashboardMetrics(),
    });
  });

  app.get("/api/profits", (_req, res) => {
    res.json({
      success: true,
      snapshots: store.profitSnapshots,
      realizedDeals: store.realizedDeals,
      metrics: store.getDashboardMetrics(),
    });
  });

  app.get("/api/profits/export-csv", (_req, res) => {
    const csv = store.exportProfitAnalyticsCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="dealhunter_profit_analytics_${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  });

  // --- Sellers, Buyers & Sourcing Endpoints ---
  app.get("/api/sellers", (_req, res) => {
    res.json({ success: true, sellers: store.getSellers() });
  });

  app.post("/api/sellers", (req, res) => {
    try {
      const seller = store.addSeller(req.body);
      res.json({ success: true, seller });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put("/api/sellers/:id/status", (req, res) => {
    const seller = store.updateSellerStatus(req.params.id, req.body.status, req.body.notes);
    if (!seller) {
      res.status(404).json({ success: false, error: "Seller not found" });
      return;
    }
    res.json({ success: true, seller });
  });

  app.get("/api/buyers", (_req, res) => {
    res.json({ success: true, buyers: store.getBuyers() });
  });

  app.post("/api/buyers", (req, res) => {
    try {
      const buyer = store.addBuyer(req.body);
      res.json({ success: true, buyer });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // --- Property Inspections Calendar Endpoints ---
  app.get("/api/inspections", (_req, res) => {
    res.json({ success: true, inspections: store.getInspections() });
  });

  app.post("/api/inspections", (req, res) => {
    try {
      const insp = store.addInspection(req.body);
      res.json({ success: true, inspection: insp });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put("/api/inspections/:id/status", (req, res) => {
    const insp = store.updateInspectionStatus(
      req.params.id,
      req.body.status,
      req.body.findingsSummary,
      req.body.criticalIssuesCount
    );
    if (!insp) {
      res.status(404).json({ success: false, error: "Inspection not found" });
      return;
    }
    res.json({ success: true, inspection: insp });
  });

  // --- BuyerScoutAgent & Velocity Analytics Endpoints ---
  app.get("/api/agents/velocity", (_req, res) => {
    res.json({ success: true, velocity: store.getWeeklyVelocityMetrics() });
  });

  app.get("/api/agents/reports", (_req, res) => {
    res.json({ success: true, reports: store.getAgentReports() });
  });

  app.post("/api/agents/buyer-scout/run", async (req, res) => {
    try {
      const { county, state, customQuery } = req.body;
      const result = await store.runBuyerScoutSession({
        county: county || "Cumberland County",
        state: state || "TN",
        customQuery,
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Embedded Code Editor & Admin Gate Endpoints ---
  const WORKSPACE_ROOT = process.cwd();
  const IGNORED_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    ".aistudio",
    ".cache",
    ".system_generated",
  ]);

  interface FileTreeNode {
    name: string;
    path: string;
    type: "file" | "directory";
    size?: number;
    extension?: string;
    children?: FileTreeNode[];
  }

  async function buildFileTree(dir: string, baseDir: string = dir): Promise<FileTreeNode[]> {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    const nodes: FileTreeNode[] = [];

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        const children = await buildFileTree(fullPath, baseDir);
        nodes.push({
          name: entry.name,
          path: relPath,
          type: "directory",
          children,
        });
      } else {
        const stats = await fsPromises.stat(fullPath);
        const ext = path.extname(entry.name).toLowerCase();
        nodes.push({
          name: entry.name,
          path: relPath,
          type: "file",
          size: stats.size,
          extension: ext,
        });
      }
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });
  }

  function getLanguageFromExtension(ext: string): string {
    switch (ext) {
      case ".ts":
      case ".tsx":
        return "typescript";
      case ".js":
      case ".jsx":
        return "javascript";
      case ".json":
        return "json";
      case ".html":
        return "html";
      case ".css":
        return "css";
      case ".md":
        return "markdown";
      case ".sh":
        return "shell";
      case ".yml":
      case ".yaml":
        return "yaml";
      default:
        return "plaintext";
    }
  }

  app.post("/api/code/verify-admin", (req, res) => {
    const { passkey } = req.body;
    // Allow secure owner master key or standard admin pin
    const valid =
      passkey === "dealhunter-admin-2026" ||
      passkey === "admin" ||
      passkey === "boss-mode" ||
      passkey === "owner";
    if (valid) {
      res.json({
        success: true,
        role: "OWNER_ADMIN",
        authenticatedAs: "emmaun40m@gmail.com",
        sessionToken: `auth-${Date.now()}`,
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Invalid Owner Passkey. Access restricted to application administrator.",
      });
    }
  });

  app.get("/api/code/tree", async (_req, res) => {
    try {
      const tree = await buildFileTree(WORKSPACE_ROOT);
      res.json({ success: true, tree, root: WORKSPACE_ROOT });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/code/file", async (req, res) => {
    try {
      const filePath = String(req.query.path || "").trim();
      if (!filePath) {
        res.status(400).json({ success: false, error: "File path is required" });
        return;
      }
      const safePath = path.resolve(WORKSPACE_ROOT, filePath);
      if (!safePath.startsWith(WORKSPACE_ROOT)) {
        res.status(403).json({ success: false, error: "Access denied: outside workspace root" });
        return;
      }

      const content = await fsPromises.readFile(safePath, "utf8");
      const ext = path.extname(safePath).toLowerCase();
      const stats = await fsPromises.stat(safePath);

      res.json({
        success: true,
        path: filePath,
        content,
        language: getLanguageFromExtension(ext),
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/code/save", async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath || typeof content !== "string") {
        res.status(400).json({ success: false, error: "File path and content are required" });
        return;
      }
      const safePath = path.resolve(WORKSPACE_ROOT, filePath);
      if (!safePath.startsWith(WORKSPACE_ROOT)) {
        res.status(403).json({ success: false, error: "Access denied: outside workspace root" });
        return;
      }

      await fsPromises.writeFile(safePath, content, "utf8");
      store.log("SYSTEM", "Code Editor Save", `Admin modified and saved file: ${filePath}`, "INFO");

      res.json({
        success: true,
        path: filePath,
        savedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- ROI Heatmap & Daily Digest ---
  app.get("/api/roi-heatmap", (_req, res) => {
    res.json({ success: true, heatmap: store.getZipCodeHeatmapData() });
  });

  app.get("/api/daily-digest", (_req, res) => {
    res.json({ success: true, digest: store.getDailyDigest() });
  });

  app.get("/api/audit-logs", (_req, res) => {
    res.json({ success: true, logs: store.auditLogs });
  });

  // --- Config Settings ---
  app.get("/api/config", (_req, res) => {
    res.json({ success: true, config: store.config });
  });

  app.post("/api/config", (req, res) => {
    store.config = { ...store.config, ...req.body };
    res.json({ success: true, config: store.config });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DealHunter AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
