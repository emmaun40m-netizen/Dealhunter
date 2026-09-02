import { useState, useEffect } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Send,
  Sparkles,
  ShieldCheck,
  Scale,
  Users,
  DollarSign,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Edit3,
  Plus,
  RotateCcw,
  Globe,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Clock,
  Trash2,
  Save,
  X,
} from "lucide-react";
import {
  ContractTemplate,
  ContractCategory,
  ContractDispatchRecord,
  SupportedContractLanguage,
} from "../types";
import {
  CONTRACT_TEMPLATES,
  CONTRACT_LANGUAGES,
  MULTILINGUAL_LEGAL_DICTIONARY,
} from "../services/contractTemplatesData";
import { store } from "../services/store";

interface ContractTemplatesStudioProps {
  onNavigateToVault?: () => void;
  onNavigateToPayments?: () => void;
}

export default function ContractTemplatesStudio({
  onNavigateToVault,
  onNavigateToPayments,
}: ContractTemplatesStudioProps) {
  const [templates, setTemplates] = useState<ContractTemplate[]>(CONTRACT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<ContractCategory | "LANGUAGE_SEND" | "DISPATCHES">("SELLER");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-seller-psa-zero-emd");
  const [copied, setCopied] = useState(false);
  const [pushedToVault, setPushedToVault] = useState(false);

  // Editing template modal state
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ContractTemplate>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Dynamic contract variables
  const [sellerName, setSellerName] = useState("John & Sarah Jenkins");
  const [buyerName, setBuyerName] = useState("DealHunter Capital Holdings LLC");
  const [propertyAddress, setPropertyAddress] = useState("8422 Artesian St, Detroit, MI 48228");
  const [propertyCity, setPropertyCity] = useState("Detroit");
  const [propertyState, setPropertyState] = useState("MI");
  const [propertyZip, setPropertyZip] = useState("48228");
  const [purchasePrice, setPurchasePrice] = useState<number>(24500);
  const [emdMode, setEmdMode] = useState<"ZERO_DOWN" | "NOMINAL" | "STANDARD" | "CUSTOM">("ZERO_DOWN");
  const [customEmd, setCustomEmd] = useState<number>(0);
  const [inspectionDays, setInspectionDays] = useState<number>(14);
  const [closingDays, setClosingDays] = useState<number>(21);
  const [assignmentFee, setAssignmentFee] = useState<number>(20000);
  const [escrowCompany, setEscrowCompany] = useState("First American Title / Priority Escrow");

  // Multi-Language & Dispatch Tab State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedContractLanguage>("es");
  const [translatedContractText, setTranslatedContractText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [dispatchRecipientName, setDispatchRecipientName] = useState("Carlos & Maria Hernandez");
  const [dispatchRecipientEmail, setDispatchRecipientEmail] = useState("hernandez.properties@gmail.com");
  const [dispatchRecipientPhone, setDispatchRecipientPhone] = useState("+1 (313) 555-0192");
  const [dispatchRecipientRole, setDispatchRecipientRole] = useState<"SELLER" | "BUYER" | "INVESTOR" | "TITLE_ESCROW">("SELLER");
  const [dispatchChannel, setDispatchChannel] = useState<"ESIGN" | "EMAIL_PDF" | "SMS_LINK" | "RON_NOTARY">("ESIGN");
  const [dispatches, setDispatches] = useState<ContractDispatchRecord[]>([]);
  const [dispatchSuccessNotice, setDispatchSuccessNotice] = useState<ContractDispatchRecord | null>(null);

  useEffect(() => {
    loadTemplates();
    loadDispatches();
  }, []);

  const loadTemplates = () => {
    fetch("/api/contract-templates")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      })
      .catch(() => setTemplates(CONTRACT_TEMPLATES));
  };

  const loadDispatches = () => {
    fetch("/api/contract-templates/dispatches")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.dispatches) {
          setDispatches(data.dispatches);
        }
      })
      .catch(() => setDispatches(store.getContractDispatches()));
  };

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === "LANGUAGE_SEND" || selectedCategory === "DISPATCHES") {
      return true;
    }
    return t.category === selectedCategory;
  });

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    filteredTemplates[0] ||
    templates[0];

  // Calculate active earnest money number
  const effectiveEmd =
    emdMode === "ZERO_DOWN"
      ? 0
      : emdMode === "NOMINAL"
      ? 100
      : emdMode === "STANDARD"
      ? 2500
      : customEmd;

  // Substitute variables into template text
  const compileTemplateText = (rawText: string) => {
    const totalAssignee = (purchasePrice || 0) + (assignmentFee || 0);
    const balanceDue = Math.max(0, (purchasePrice || 0) - effectiveEmd);
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return rawText
      .replace(/{{SELLER_NAME}}/g, sellerName)
      .replace(/{{BUYER_NAME}}/g, buyerName)
      .replace(/{{INVESTOR_NAME}}/g, "Apex Turnkey Capital Partners")
      .replace(/{{ASSIGNEE_NAME}}/g, "Apex Turnkey Capital Partners LLC")
      .replace(/{{LENDER_NAME}}/g, "DealHunter Commercial Flash Trust")
      .replace(/{{PROPERTY_ADDRESS}}/g, propertyAddress)
      .replace(/{{PROPERTY_CITY}}/g, propertyCity)
      .replace(/{{PROPERTY_STATE}}/g, propertyState)
      .replace(/{{PROPERTY_ZIP}}/g, propertyZip)
      .replace(/{{PROPERTY_COUNTY}}/g, "Wayne")
      .replace(/{{PROPERTY_PARCEL_ID}}/g, "W-48228-0912")
      .replace(/{{SELLER_ADDRESS}}/g, propertyAddress)
      .replace(/{{SELLER_PHONE}}/g, "+1 (313) 555-0144")
      .replace(/{{PURCHASE_PRICE}}/g, (purchasePrice ?? 0).toLocaleString())
      .replace(
        /{{EARNEST_MONEY}}/g,
        effectiveEmd === 0
          ? "$0.00 (Waived - Consideration established by mutual promise & due diligence)"
          : `$${(effectiveEmd ?? 0).toLocaleString()}`
      )
      .replace(/{{BALANCE_DUE}}/g, `$${balanceDue.toLocaleString()}`)
      .replace(/{{INSPECTION_DAYS}}/g, inspectionDays.toString())
      .replace(/{{CLOSING_DAYS}}/g, closingDays.toString())
      .replace(/{{ASSIGNMENT_FEE}}/g, (assignmentFee ?? 0).toLocaleString())
      .replace(/{{ASSIGNMENT_FEE_BALANCE}}/g, `$${Math.max(0, (assignmentFee ?? 0) - effectiveEmd).toLocaleString()}`)
      .replace(/{{TOTAL_ASSIGNEE_PRICE}}/g, totalAssignee.toLocaleString())
      .replace(/{{TITLE_COMPANY}}/g, escrowCompany)
      .replace(/{{TRANSACTIONAL_FEE}}/g, `$${Math.max(1000, Math.round((purchasePrice ?? 0) * 0.0125)).toLocaleString()}`)
      .replace(/{{ORIGINAL_CONTRACT_DATE}}/g, dateStr)
      .replace(/{{CLOSING_DATE}}/g, "Within 14 Calendar Days")
      .replace(/{{CURRENT_DATE}}/g, dateStr)
      .replace(/{{EXISTING_LOAN_BALANCE}}/g, "$18,400.00 (Fixed 3.25% APR)")
      .replace(/{{CASH_TO_SELLER}}/g, `$${(purchasePrice - 18400 > 0 ? purchasePrice - 18400 : 6100).toLocaleString()}`)
      .replace(/{{LOAN_NUMBER}}/g, "WF-994210-SUB2")
      .replace(/{{FIRST_PAYMENT_DATE}}/g, "1st of Next Calendar Month")
      .replace(/{{DOWN_PAYMENT}}/g, "$2,500.00")
      .replace(/{{NOTE_PRINCIPAL}}/g, `$${Math.max(0, (purchasePrice || 0) - 2500).toLocaleString()}`)
      .replace(/{{INTEREST_RATE}}/g, "4.5")
      .replace(/{{MONTHLY_PAYMENT}}/g, "$385.00")
      .replace(/{{BALLOON_YEARS}}/g, "5")
      .replace(/{{LOAN_AMOUNT}}/g, `$${(purchasePrice ?? 0).toLocaleString()}`)
      .replace(/{{MATURITY_DATE}}/g, "12 Months from Funding Date");
  };

  const compiledDocument = compileTemplateText(activeTemplate.templateText);

  // Handle translation when language tab is opened or language changed
  useEffect(() => {
    if (selectedCategory === "LANGUAGE_SEND") {
      translateDocument();
    }
  }, [selectedLanguage, selectedTemplateId, selectedCategory]);

  const translateDocument = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch("/api/contract-templates/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractText: compiledDocument,
          targetLanguage: selectedLanguage,
        }),
      });
      const data = await res.json();
      if (data.success && data.translatedText) {
        setTranslatedContractText(data.translatedText);
      } else {
        // Fallback to local dictionary
        const dict = MULTILINGUAL_LEGAL_DICTIONARY[selectedLanguage] || MULTILINGUAL_LEGAL_DICTIONARY.en;
        let draft = compiledDocument;
        if (dict.title_psa) draft = draft.replace(/REAL ESTATE PURCHASE AND SALE AGREEMENT/g, dict.title_psa);
        if (dict.parties) draft = draft.replace(/1\. PARTIES:/g, dict.parties);
        if (dict.seller) draft = draft.replace(/SELLER:/g, `${dict.seller}:`);
        if (dict.buyer) draft = draft.replace(/BUYER:/g, `${dict.buyer}:`);
        if (dict.purchase_price) draft = draft.replace(/3\. PURCHASE PRICE & CONSIDERATION:/g, dict.purchase_price);
        setTranslatedContractText(draft);
      }
    } catch {
      setTranslatedContractText(compiledDocument);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (textToDownload: string, filenamePrefix: string) => {
    const element = document.createElement("a");
    const file = new Blob([textToDownload], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${filenamePrefix}_${propertyAddress.split(",")[0].replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Owner Edit & Save Template
  const handleOpenEdit = (template: ContractTemplate) => {
    setEditFormData({
      ...template,
      keyClauses: [...template.keyClauses],
    });
    setIsCreatingNew(false);
    setIsEditingTemplate(true);
  };

  const handleOpenCreateNew = () => {
    const category = selectedCategory === "LANGUAGE_SEND" || selectedCategory === "DISPATCHES" ? "SELLER" : selectedCategory;
    setEditFormData({
      id: `tpl-custom-${Date.now()}`,
      name: "New Custom Agreement",
      category,
      type: "CUSTOM_AGREEMENT",
      tagline: "Custom Legal Instrument for Special Transactions",
      description: "Proprietary wholesale contract customized for specific deal structures and jurisdiction needs.",
      defaultEarnestMoney: 0,
      earnestMoneyOption: "ZERO_WAIVED",
      earnestMoneyNote: "$0.00 (Waived)",
      inspectionPeriodDays: 14,
      closingPeriodDays: 21,
      assignmentFee: 20000,
      keyClauses: [
        "Unrestricted Right of Assignment",
        "Clear Marketable Fee Simple Title",
        "Zero Lender Contingencies",
      ],
      templateText: `REAL ESTATE CONTRACT\n\n1. PARTIES: {{SELLER_NAME}} and {{BUYER_NAME}}\n2. PROPERTY: {{PROPERTY_ADDRESS}}\n3. PRICE: \${{PURCHASE_PRICE}}\n4. EARNEST MONEY: \${{EARNEST_MONEY}}\n\nSELLER: ________________  BUYER: ________________`,
      bestFor: "Custom transaction structures and specialized client agreements.",
      jurisdictionRulesNote: "Jurisdiction-compliant instrument.",
    });
    setIsCreatingNew(true);
    setIsEditingTemplate(true);
  };

  const handleSaveTemplate = async () => {
    if (!editFormData.name || !editFormData.templateText) return;

    try {
      if (isCreatingNew) {
        const res = await fetch("/api/contract-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        });
        const data = await res.json();
        if (data.success) {
          loadTemplates();
          setSelectedTemplateId(data.template.id);
          setSaveSuccessMsg("New Contract Template Created Successfully!");
        }
      } else {
        const res = await fetch(`/api/contract-templates/${editFormData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        });
        const data = await res.json();
        if (data.success) {
          loadTemplates();
          setSaveSuccessMsg("Contract Template Updated & Saved to System!");
        }
      }

      setTimeout(() => {
        setSaveSuccessMsg(null);
        setIsEditingTemplate(false);
      }, 1500);
    } catch (err) {
      console.error("Save template failed:", err);
    }
  };

  const handleResetTemplates = async () => {
    if (!window.confirm("Are you sure you want to restore factory default templates? Any custom edits will be reset.")) return;
    try {
      const res = await fetch("/api/contract-templates/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        setSaveSuccessMsg("Templates Reset to Factory Standards");
        setTimeout(() => setSaveSuccessMsg(null), 2000);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // Dispatch Contract to Recipient
  const handleDispatchContract = async () => {
    if (!dispatchRecipientName || !dispatchRecipientEmail) {
      alert("Please enter recipient name and email address");
      return;
    }

    try {
      const textToSend = translatedContractText || compiledDocument;
      const res = await fetch("/api/contract-templates/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          templateName: activeTemplate.name,
          propertyAddress,
          recipientName: dispatchRecipientName,
          recipientEmail: dispatchRecipientEmail,
          recipientPhone: dispatchRecipientPhone,
          recipientRole: dispatchRecipientRole,
          channel: dispatchChannel,
          language: selectedLanguage,
          contractText: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.record) {
        setDispatchSuccessNotice(data.record);
        loadDispatches();
      }
    } catch (err) {
      console.error("Dispatch failed:", err);
    }
  };

  const handlePushToVault = async () => {
    try {
      const typeEnum =
        activeTemplate.category === "BUYER"
          ? "ASSIGNMENT"
          : activeTemplate.category === "INVESTOR"
          ? "LETTER_OF_INTENT"
          : "PURCHASE_AND_SALE";

      await store.createContractDraft({
        dealId: store.deals[0]?.id || "deal-1",
        buyerName,
        sellerName,
        purchasePrice,
        earnestMoney: effectiveEmd,
        inspectionDays,
        type: typeEnum,
        assignmentFee: activeTemplate.category === "BUYER" ? assignmentFee : undefined,
      });

      setPushedToVault(true);
      setTimeout(() => setPushedToVault(false), 3000);
      if (onNavigateToVault) {
        setTimeout(onNavigateToVault, 1000);
      }
    } catch (err) {
      console.error("Push to vault failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide font-sans">
                  CONTRACT TEMPLATES STUDIO
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded">
                  OWNER STUDIO & MULTILINGUAL DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Categorized contracts for Sellers, Buyers & Investors with $0 Down EMD rules, owner template customization, and multilingual e-dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 rounded transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW TEMPLATE</span>
          </button>

          <button
            onClick={() => handleOpenEdit(activeTemplate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 rounded transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT ACTIVE TEMPLATE</span>
          </button>

          <button
            onClick={handleResetTemplates}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition"
            title="Reset to factory legal defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onNavigateToPayments && (
            <button
              onClick={onNavigateToPayments}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 rounded transition"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>PAYMENT PORTAL</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none bg-[#0B0E14] rounded-t p-1">
        <button
          onClick={() => setSelectedCategory("SELLER")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition rounded-sm whitespace-nowrap ${
            selectedCategory === "SELLER"
              ? "bg-slate-800 text-white border-l-2 border-emerald-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SELLER CONTRACTS (P&S, SUB-TO, SELLER FINANCING)</span>
        </button>

        <button
          onClick={() => setSelectedCategory("BUYER")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition rounded-sm whitespace-nowrap ${
            selectedCategory === "BUYER"
              ? "bg-slate-800 text-white border-l-2 border-blue-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Briefcase className="w-4 h-4 text-blue-400" />
          <span>BUYER CONTRACTS (ASSIGNMENT, A-B/B-C RESALE)</span>
        </button>

        <button
          onClick={() => setSelectedCategory("INVESTOR")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition rounded-sm whitespace-nowrap ${
            selectedCategory === "INVESTOR"
              ? "bg-slate-800 text-white border-l-2 border-purple-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span>INVESTOR CONTRACTS (JV AGREEMENT, PML NOTE)</span>
        </button>

        <button
          onClick={() => setSelectedCategory("LANGUAGE_SEND")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition rounded-sm whitespace-nowrap ${
            selectedCategory === "LANGUAGE_SEND"
              ? "bg-amber-950/80 text-amber-200 border-l-2 border-amber-500 shadow-sm"
              : "text-amber-400 hover:text-amber-200 hover:bg-slate-900"
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>LANGUAGE & SEND (MULTILINGUAL DISPATCH)</span>
        </button>

        <button
          onClick={() => setSelectedCategory("DISPATCHES")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition rounded-sm whitespace-nowrap ${
            selectedCategory === "DISPATCHES"
              ? "bg-slate-800 text-white border-l-2 border-indigo-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>DISPATCH TRACKING ({dispatches.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SELLER, BUYER & INVESTOR CONTRACT VIEWS */}
      {/* ========================================================================= */}
      {selectedCategory !== "LANGUAGE_SEND" && selectedCategory !== "DISPATCHES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template Selection and Dynamic Variables */}
          <div className="lg:col-span-5 space-y-4">
            {/* Template Selector Card */}
            <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Available {selectedCategory} Templates
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                  {filteredTemplates.length} Ready
                </span>
              </div>

              <div className="space-y-2">
                {filteredTemplates.map((t) => {
                  const isSelected = t.id === activeTemplate.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-3 rounded border text-left cursor-pointer transition ${
                        isSelected
                          ? "bg-slate-800/90 border-emerald-500 text-white shadow-sm"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{t.name}</span>
                        </div>
                        {t.isCustom && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-600/40 rounded">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {t.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                        <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-emerald-400">
                          EMD: ${t.defaultEarnestMoney.toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                          {t.inspectionPeriodDays}d Inspection
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                          {t.closingPeriodDays}d Close
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variable Customizer */}
            <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Deal Fill-In Variables
                </span>
                <span className="text-[10px] text-slate-500">Auto-injects into document</span>
              </div>

              {/* Earnest Money Strategy Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                  <span>Earnest Money Deposit (EMD) Option</span>
                  <span className="text-emerald-400 font-bold">
                    ${effectiveEmd.toLocaleString()}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEmdMode("ZERO_DOWN")}
                    className={`px-2 py-1.5 rounded text-[10px] border font-bold transition ${
                      emdMode === "ZERO_DOWN"
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    $0 WAIVED
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmdMode("NOMINAL")}
                    className={`px-2 py-1.5 rounded text-[10px] border font-bold transition ${
                      emdMode === "NOMINAL"
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    $100 TOKEN
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmdMode("STANDARD")}
                    className={`px-2 py-1.5 rounded text-[10px] border font-bold transition ${
                      emdMode === "STANDARD"
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    $2,500 ESCROW
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmdMode("CUSTOM")}
                    className={`px-2 py-1.5 rounded text-[10px] border font-bold transition ${
                      emdMode === "CUSTOM"
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    CUSTOM
                  </button>
                </div>
                {emdMode === "CUSTOM" && (
                  <input
                    type="number"
                    value={customEmd}
                    onChange={(e) => setCustomEmd(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-1"
                    placeholder="Enter Custom EMD Amount ($)"
                  />
                )}
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Seller Legal Name</label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Buyer / Assignor Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5"
                  />
                </div>
              </div>

              {/* Property Address */}
              <div>
                <label className="text-[11px] text-slate-400">Property Full Address</label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => {
                    setPropertyAddress(e.target.value);
                    const parts = e.target.value.split(",");
                    if (parts.length >= 2) {
                      setPropertyCity(parts[1].trim());
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5"
                />
              </div>

              {/* Price & Assignment Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Contract Purchase Price ($)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5 font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Wholesale Assignment Fee ($)</label>
                  <input
                    type="number"
                    value={assignmentFee}
                    onChange={(e) => setAssignmentFee(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5 font-bold text-blue-400"
                  />
                </div>
              </div>

              {/* Inspection & Closing Days */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Inspection Window (Days)</label>
                  <input
                    type="number"
                    value={inspectionDays}
                    onChange={(e) => setInspectionDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Closing Schedule (Days)</label>
                  <input
                    type="number"
                    value={closingDays}
                    onChange={(e) => setClosingDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5"
                  />
                </div>
              </div>

              {/* Title / Escrow Company */}
              <div>
                <label className="text-[11px] text-slate-400">Closing Title / Escrow Agent</label>
                <input
                  type="text"
                  value={escrowCompany}
                  onChange={(e) => setEscrowCompany(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contract Preview & Execution Desk */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Template Meta Details */}
            <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white font-sans">
                    {activeTemplate.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeTemplate.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(compiledDocument)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "COPIED" : "COPY"}</span>
                  </button>

                  <button
                    onClick={() => handleDownload(compiledDocument, activeTemplate.type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>TXT</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCategory("LANGUAGE_SEND");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-amber-600 hover:bg-amber-500 text-black rounded transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>TRANSLATE & SEND</span>
                  </button>
                </div>
              </div>

              {/* Key Enforceability Clauses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeTemplate.keyClauses.map((clause, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/70 p-2 rounded border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-[11px]">{clause}</span>
                  </div>
                ))}
              </div>

              {/* Jurisdiction Note */}
              <div className="bg-slate-900/50 border border-slate-800 rounded p-2.5 flex items-start gap-2 text-[11px] font-mono text-slate-400">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300">Statutory Notice: </strong>
                  {activeTemplate.jurisdictionRulesNote}
                </div>
              </div>
            </div>

            {/* Compiled Legal Contract Document Box */}
            <div className="bg-[#080B10] border border-slate-800 rounded-sm p-4 relative">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  BINDING LEGAL CONTRACT DRAFT
                </span>
                <span>{compiledDocument.length} Characters</span>
              </div>

              <textarea
                readOnly
                value={compiledDocument}
                rows={22}
                className="w-full bg-[#05070A] border border-slate-800/60 rounded p-3.5 text-xs font-mono text-slate-200 leading-relaxed resize-none focus:outline-none scrollbar-thin"
              />

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  * All signatures verified via 256-bit remote digital encryption.
                </span>

                <button
                  onClick={handlePushToVault}
                  disabled={pushedToVault}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded shadow transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{pushedToVault ? "PUSHED TO CONTRACTS VAULT!" : "PUSH TO CONTRACTS VAULT"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MULTI-LANGUAGE & DISPATCH TAB */}
      {/* ========================================================================= */}
      {selectedCategory === "LANGUAGE_SEND" && (
        <div className="space-y-6">
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  MULTILINGUAL CONTRACT TRANSLATOR & DIRECT DISPATCH DESK
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Translate active wholesale contracts into 12 languages with certified real estate terminology, then dispatch immediately via E-Sign, Remote Online Notary (RON), or SMS.
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Target Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as SupportedContractLanguage)}
                  className="bg-slate-900 border border-amber-500/50 text-amber-300 text-xs font-mono rounded px-3 py-1.5 focus:outline-none"
                >
                  {CONTRACT_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>

                <button
                  onClick={translateDocument}
                  disabled={isTranslating}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 rounded transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranslating ? "TRANSLATING..." : "RE-TRANSLATE"}</span>
                </button>
              </div>
            </div>

            {/* Notification if dispatch succeeded */}
            {dispatchSuccessNotice && (
              <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-100 p-4 rounded text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONTRACT DISPATCHED SUCCESSFULLY!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Sent {dispatchSuccessNotice.templateName} in {dispatchSuccessNotice.languageName} to {dispatchSuccessNotice.recipientName} ({dispatchSuccessNotice.recipientEmail})
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tracking ID: <strong className="text-emerald-300">{dispatchSuccessNotice.trackingNumber}</strong> | Method: {dispatchSuccessNotice.channel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={dispatchSuccessNotice.signingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <span>OPEN SIGNING PORTAL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(dispatchSuccessNotice.signingUrl);
                      alert("Signing link copied to clipboard!");
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 hover:bg-slate-800"
                  >
                    COPY LINK
                  </button>
                </div>
              </div>
            )}

            {/* Two-Column Editor & Dispatch Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Translated Document Text Editor */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Translated Document ({CONTRACT_LANGUAGES.find((l) => l.code === selectedLanguage)?.name})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(translatedContractText || compiledDocument)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </button>
                    <button
                      onClick={() => handleDownload(translatedContractText || compiledDocument, `${activeTemplate.type}_${selectedLanguage}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>SAVE</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={translatedContractText || compiledDocument}
                  onChange={(e) => setTranslatedContractText(e.target.value)}
                  rows={20}
                  className="w-full bg-[#05070A] border border-slate-800 rounded p-3.5 text-xs font-mono text-slate-200 leading-relaxed focus:border-amber-500/80 focus:outline-none scrollbar-thin"
                  placeholder="Translated contract text will appear here..."
                />
              </div>

              {/* Right Column: Dispatch & E-Sign Settings Form */}
              <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-sm p-4 space-y-4 text-xs font-mono">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-400" />
                    Dispatch Recipient & Channel
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Send legally binding agreement directly to seller or end buyer.
                  </p>
                </div>

                {/* Recipient Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Recipient Full Legal Name</label>
                    <input
                      type="text"
                      value={dispatchRecipientName}
                      onChange={(e) => setDispatchRecipientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Recipient Email (for Digital E-Sign)</label>
                    <input
                      type="email"
                      value={dispatchRecipientEmail}
                      onChange={(e) => setDispatchRecipientEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Recipient Mobile (for Instant SMS Alert)</label>
                    <input
                      type="tel"
                      value={dispatchRecipientPhone}
                      onChange={(e) => setDispatchRecipientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs mt-0.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Recipient Role</label>
                      <select
                        value={dispatchRecipientRole}
                        onChange={(e) => setDispatchRecipientRole(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs mt-0.5"
                      >
                        <option value="SELLER">Property Seller</option>
                        <option value="BUYER">End Cash Buyer</option>
                        <option value="INVESTOR">JV Partner / PML</option>
                        <option value="TITLE_ESCROW">Title & Escrow Officer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Delivery Channel</label>
                      <select
                        value={dispatchChannel}
                        onChange={(e) => setDispatchChannel(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs mt-0.5"
                      >
                        <option value="ESIGN">E-Sign Digital Portal</option>
                        <option value="RON_NOTARY">Remote Online Notary</option>
                        <option value="SMS_LINK">SMS Direct Text Link</option>
                        <option value="EMAIL_PDF">Email + Attached PDF</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dispatch Security Badge */}
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ESIGN ACT & UETA COMPLIANT</span>
                  </div>
                  <p>Includes audit trail, IP timestamp recordation, and automatic tamper-evident cryptographic sealing.</p>
                </div>

                {/* Submit Dispatch Button */}
                <button
                  onClick={handleDispatchContract}
                  className="w-full py-2.5 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded shadow flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>DISPATCH CONTRACT TO RECIPIENT NOW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISPATCHES TRACKING LEDGER */}
      {/* ========================================================================= */}
      {selectedCategory === "DISPATCHES" && (
        <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                CONTRACT DISPATCH & SIGNATURE TRACKING LEDGER
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time audit log of all contracts dispatched to sellers, buyers, and closing escrow agents.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded">
              {dispatches.length} Dispatched Records
            </span>
          </div>

          {dispatches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No contracts dispatched yet. Use the "LANGUAGE & SEND" tab to send your first agreement!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                    <th className="p-3">Tracking Code</th>
                    <th className="p-3">Contract Type</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Channel / Language</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Dispatched Time</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {dispatches.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-emerald-400">
                        {record.trackingNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{record.templateName}</div>
                        <div className="text-[10px] text-slate-400">{record.propertyAddress}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{record.recipientName}</div>
                        <div className="text-[10px] text-slate-400">{record.recipientEmail}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                          {record.channel}
                        </span>
                        <span className="ml-1.5 text-[10px] text-amber-300">
                          {record.languageName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            record.status === "SIGNED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                              : record.status === "DELIVERED"
                              ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                              : "bg-amber-950 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(record.sentAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={record.signingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] inline-flex items-center gap-1"
                        >
                          <span>VIEW</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OWNER TEMPLATE EDIT / CREATE MODAL */}
      {/* ========================================================================= */}
      {isEditingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0E14] border border-slate-700 rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0E1218]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm font-sans">
                  {isCreatingNew ? "CREATE CUSTOM CONTRACT TEMPLATE" : `EDIT TEMPLATE: ${editFormData.name}`}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingTemplate(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-300 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400">Template Title</label>
                  <input
                    type="text"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Category</label>
                  <select
                    value={editFormData.category || "SELLER"}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as ContractCategory })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                  >
                    <option value="SELLER">SELLER (Purchase & Sale, Sub-To, Seller Financing)</option>
                    <option value="BUYER">BUYER (Assignment of Contract, A-B/B-C Resale)</option>
                    <option value="INVESTOR">INVESTOR (JV Agreement, PML Note, Flash Loan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={editFormData.tagline || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, tagline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Description & Use Case</label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Default Earnest Money ($)</label>
                  <input
                    type="number"
                    value={editFormData.defaultEarnestMoney ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, defaultEarnestMoney: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Inspection Window (Days)</label>
                  <input
                    type="number"
                    value={editFormData.inspectionPeriodDays ?? 14}
                    onChange={(e) => setEditFormData({ ...editFormData, inspectionPeriodDays: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Closing Schedule (Days)</label>
                  <input
                    type="number"
                    value={editFormData.closingPeriodDays ?? 21}
                    onChange={(e) => setEditFormData({ ...editFormData, closingPeriodDays: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">
                  Full Contract Legal Body Text (Supports Placeholders like {"{{SELLER_NAME}}"}, {"{{PURCHASE_PRICE}}"}, {"{{PROPERTY_ADDRESS}}"})
                </label>
                <textarea
                  value={editFormData.templateText || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, templateText: e.target.value })}
                  rows={14}
                  className="w-full bg-[#05070A] border border-slate-700 rounded p-3 text-xs font-mono text-slate-200 mt-1 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#0E1218] flex items-center justify-between">
              <button
                onClick={() => setIsEditingTemplate(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
              >
                CANCEL
              </button>

              <button
                onClick={handleSaveTemplate}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs font-mono shadow transition"
              >
                <Save className="w-4 h-4" />
                <span>SAVE & UPDATE TEMPLATE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
