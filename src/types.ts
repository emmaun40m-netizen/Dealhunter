export type AgentName = "DEALHUNTER" | "ANALYST" | "OUTREACH" | "CLOSER" | "BUYER_SCOUT" | "HUMAN" | "SYSTEM";

export type TaskType =
  | "SEARCH"
  | "ANALYZE"
  | "VERIFY"
  | "CALCULATE_PROFIT"
  | "FIND_AGENT"
  | "MATCH_INVESTORS"
  | "PREPARE_OUTREACH"
  | "FOLLOW_UP"
  | "CLASSIFY_RESPONSE"
  | "PREPARE_OFFER"
  | "PREPARE_CONTRACT"
  | "DESKTOP_UNDERWRITING"
  | "TITLE_ESCROW_AUDIT"
  | "VIRTUAL_CLOSING";

export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type DealRecommendation = "PURSUE" | "REVIEW" | "HIGH_RISK" | "REJECT";

export type DealStage =
  | "DISCOVERED"
  | "ANALYSIS"
  | "OFFER"
  | "NEGOTIATION"
  | "CONTRACT"
  | "UNDERWRITING_TITLE"
  | "CLOSING"
  | "REALIZED"
  | "REJECTED";

export interface StateWholesaleRule {
  stateCode: string;
  stateName: string;
  licenseStatus: "LICENSE_REQUIRED" | "DISCLOSURE_REQUIRED" | "DIRECT_ASSIGNMENT_ALLOWED";
  badgeLabel: string;
  badgeColor: "red" | "amber" | "emerald";
  statute: string;
  summary: string;
  recommendedStrategy: "Double Close (A-B/B-C)" | "Equitable Interest Disclosure" | "Standard Assignment" | "Novation / LLC Transfer";
  earnestMoneyStandard: "Optional / $0" | "$10 - $100 Token" | "$500 - $2,500 Typical";
  penaltiesSummary: string;
  compliantClauses: string[];
}

export type ContractCategory = "SELLER" | "BUYER" | "INVESTOR";
export type EarnestMoneyOption = "ZERO_WAIVED" | "NOMINAL_10_100" | "STANDARD_500_2500" | "CUSTOM";

export interface ContractTemplate {
  id: string;
  name: string;
  category: ContractCategory;
  type: string;
  tagline: string;
  description: string;
  defaultEarnestMoney: number;
  earnestMoneyOption: EarnestMoneyOption;
  earnestMoneyNote: string;
  inspectionPeriodDays: number;
  closingPeriodDays: number;
  assignmentFee?: number;
  keyClauses: string[];
  templateText: string;
  bestFor: string;
  jurisdictionRulesNote: string;
  isCustom?: boolean;
  lastModified?: string;
}

export type SupportedContractLanguage =
  | "en"
  | "es"
  | "fr"
  | "zh"
  | "de"
  | "pt"
  | "tl"
  | "vi"
  | "ar"
  | "it"
  | "ko"
  | "ru";

export interface ContractLanguageInfo {
  code: SupportedContractLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ContractDispatchRecord {
  id: string;
  templateId: string;
  templateName: string;
  dealId?: string;
  propertyAddress: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientRole: "SELLER" | "BUYER" | "INVESTOR" | "TITLE_ESCROW";
  channel: "ESIGN" | "EMAIL_PDF" | "SMS_LINK" | "RON_NOTARY";
  language: SupportedContractLanguage;
  languageName: string;
  contractText: string;
  status: "DELIVERED" | "SIGNED" | "PENDING_SIGNATURE" | "OPENED";
  trackingNumber: string;
  signingUrl: string;
  sentAt: string;
  signedAt?: string;
}

export interface WalletBalance {
  availableBalance: number;
  inEscrowBalance: number;
  totalRealizedProfit: number;
  pendingCashout: number;
  currency: string;
  lastUpdated: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumberMasked: string;
  accountType: "CHECKING" | "SAVINGS";
  isDefault: boolean;
  verified: boolean;
  linkedAt: string;
}

export type PaymentTransactionType =
  | "EMD_DEPOSIT"
  | "ASSIGNMENT_FEE_RECEIVED"
  | "JV_PROFIT_SPLIT"
  | "CASHOUT_BANK_TRANSFER"
  | "TRANSACTIONAL_FUNDING_FEE"
  | "ESCROW_DISBURSEMENT";

export interface PaymentTransaction {
  id: string;
  type: PaymentTransactionType;
  title: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "COMPLETED" | "IN_ESCROW" | "PROCESSING" | "FAILED";
  direction: "INFLOW" | "OUTFLOW" | "ESCROW_HOLD";
  sourceOrRecipient: string;
  dealAddress?: string;
  dealId?: string;
  referenceNumber: string;
  createdAt: string;
  payoutSpeed?: "INSTANT" | "STANDARD";
  bankAccountMasked?: string;
  receiptNote?: string;
}

export interface PaymentInvoice {
  id: string;
  title: string;
  dealId?: string;
  propertyAddress: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  payerType: "BUYER" | "INVESTOR" | "TITLE_COMPANY";
  purpose: "EMD_DEPOSIT" | "ASSIGNMENT_FEE" | "PURCHASE_PRICE" | "JV_SPLIT";
  dueDate: string;
  paymentLink: string;
  status: "PAID" | "PENDING_PAYMENT" | "EXPIRED";
  createdAt: string;
  paidAt?: string;
}

export interface DesktopUnderwritingReport {
  id: string;
  dealId: string;
  propertyAddress: string;
  conditionGrade: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  conditionDescription: string;
  avmLow: number;
  avmHigh: number;
  avmMedian: number;
  compsConfidenceScore: number;
  repairContingencyBuffer: number;
  titleClearanceScore: number;
  titleStatus: "CLEAN_MARKETABLE" | "PENDING_RESOLUTION" | "TITLE_DEFECT_FLAGGED";
  lienChecks: {
    item: string;
    status: "CLEARED" | "FLAGGED" | "IN_PROGRESS";
    details: string;
  }[];
  settlementStatement: {
    purchasePrice: number;
    earnestMoneyDeposit: number;
    titleInsuranceFee: number;
    escrowSettlementFee: number;
    recordingFees: number;
    municipalTransferTax: number;
    proratedPropertyTaxes: number;
    netProceedsToSeller: number;
    cashRequiredToCloseBuyer: number;
    assignmentFeePayout?: number;
  };
  ronStatus: "READY_FOR_REMOTE_NOTARY" | "ID_VERIFIED" | "PENDING_DOC_DISPATCH" | "EXECUTED_CERTIFIED";
  transactionalFunding?: {
    required: boolean;
    loanAmount: number;
    pointsFee: number;
    totalFee: number;
    holdingHours: number;
    lenderPartner: string;
    proofOfFundsStatus: "VERIFIED" | "ISSUED";
  };
  closingTimelineDays: number;
  closerChecklist: { task: string; completed: boolean }[];
  closerVerdict: "CLEAR_TO_CLOSE" | "CONTINGENT_ON_TITLE" | "HOLD_FOR_DOCUMENTS";
  generatedAt: string;
}

export interface RealEstateChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  category?: "LEGAL_COMPLIANCE" | "WHOLESALE_STRATEGY" | "STATE_STATUTES" | "MARKET_INTELLIGENCE" | "CONTRACT_STRUCTURING";
  stateReferences?: string[];
  sources?: string[];
}

export interface MarketNewsTicker {
  id: string;
  headline: string;
  category: "REGULATORY" | "INTEREST_RATES" | "DISTRESSED_INVENTORY" | "WHOLESALE_UPDATE";
  state?: string;
  timestamp: string;
  impact: "CRITICAL" | "HIGH" | "INFO";
  summary: string;
}

export type RealEstateMarketNews = MarketNewsTicker;

export interface AgentTask {
  id: string;
  fromAgent: AgentName;
  toAgent: AgentName;
  type: TaskType;
  priority: TaskPriority;
  propertyId?: string;
  dealId?: string;
  requiresHumanApproval: boolean;
  payload: Record<string, unknown>;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REQUIRES_APPROVAL";
  result?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface DealInput {
  purchasePrice: number;
  repairs: number;
  closingCosts: number;
  holdingCosts: number;
  financingCosts: number;
  taxes: number;
  insurance: number;
  utilities: number;
  otherCosts: number;
  earnestMoney?: number;

  expectedSalePrice: number;
  sellingCosts: number;
  commissions: number;
  concessions: number;
}

export interface DealProfitOutput {
  totalInvestment: number;
  netProceeds: number;
  projectedProfit: number;
  roi: number;
}

export interface DealScoreInput {
  financialOpportunity: number;
  discount: number;
  compsConfidence: number;
  repairConfidence: number;
  marketLiquidity: number;
  exitPotential: number;
  daysOnMarket: number;
  dataConfidence: number;
}

export interface SearchCriteria {
  id?: string;
  name?: string;
  country?: string;
  states?: string[];
  maxPrice: number;
  minProfit: number;
  minROI: number;
  propertyTypes?: string[];
  minBedrooms?: number;
  minSquareFeet?: number;
  maxDaysOnMarket?: number;
  createdAt?: string;
}

export type SearchProfile = SearchCriteria;

export interface PropertyComp {
  address: string;
  salePrice: number;
  sqft: number;
  distanceMiles: number;
  soldDate: string;
  similarityScore: number;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county?: string;
  parcelId?: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSizeAcres?: number;
  zoning?: string;
  roadAccess?: string;
  utilitiesAvailable?: string;
  yearBuilt?: number;
  askingPrice: number;
  estimatedValue: number;
  estimatedRepairs: number;
  expectedSalePrice: number;
  daysOnMarket: number;
  source: string;
  sourceUrl?: string;
  status: "DISCOVERED" | "ANALYZING" | "QUALIFIED" | "OFFER_STAGE" | "UNDER_CONTRACT" | "CLOSED" | "PASSED";
  imageUrl: string;
  latitude: number;
  longitude: number;
  listingAgent?: {
    name: string;
    agency: string;
    phone: string;
    email: string;
    verified: boolean;
  };
  comps?: PropertyComp[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  propertyId: string;
  property: Property;
  financials: DealInput;
  metrics: DealProfitOutput;
  dealScore: number;
  confidence: number;
  recommendation: DealRecommendation;
  status: DealStage;
  verifiedFacts: string[];
  estimates: string[];
  unknowns: string[];
  risks: string[];
  nextAction: string;
  assignedInvestorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealAnalysisResponse {
  financials: DealInput;
  metrics: DealProfitOutput;
  dealScore: number;
  confidence: number;
  recommendation: DealRecommendation;
  verifiedFacts: string[];
  estimates: string[];
  unknowns: string[];
  risks: string[];
  nextAction: string;
}

export interface ProfitSnapshot {
  id: string;
  dealId: string;
  propertyAddress: string;
  purchasePrice: number;
  totalInvestment: number;
  expectedSalePrice: number;
  netProceeds: number;
  projectedProfit: number;
  projectedROI: number;
  roi?: number;
  stage: DealStage;
  notes?: string;
  reason?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface RealizedDealData {
  dealId: string;
  actualPurchasePrice: number;
  actualRepairCosts?: number;
  actualRepairs?: number;
  actualClosingCosts: number;
  actualHoldingCosts: number;
  actualFinancingCosts?: number;
  actualOtherCosts?: number;
  actualSalePrice: number;
  actualSellingCosts: number;
  actualCommissions?: number;
  closedDate: string;
  notes?: string;
}

export interface RealizedProfitOutput {
  totalCost: number;
  proceeds: number;
  realizedProfit: number;
  roi: number;
  totalActualInvestment?: number;
  netRealizedProceeds?: number;
}

export type Seller = SellerRecord;
export type Buyer = BuyerRecord;

export interface RealizedDeal {
  id: string;
  dealId: string;
  propertyAddress: string;
  projectedProfit: number;
  projectedROI: number;
  actualPurchasePrice: number;
  actualRepairs: number;
  actualClosingCosts: number;
  actualHoldingCosts: number;
  actualSellingCosts: number;
  actualSalePrice: number;
  actualTotalInvestment: number;
  actualNetProceeds: number;
  realizedProfit: number;
  realizedROI: number;
  variance: number;
  variancePercentage: number;
  closedDate: string;
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  company?: string;
  role: "LISTING_AGENT" | "PROPERTY_OWNER" | "BROKER" | "WHOLESALER";
  phone: string;
  email: string;
  emailVerified: boolean;
  doNotContact: boolean;
  unsubscribed: boolean;
  source?: string;
  source_url?: string | null;
  sourceUrl?: string | null;
  sourceCategory?: string;
  status?: "NEW" | "CONTACTED" | "NEGOTIATING" | "UNDER_CONTRACT" | "CLOSED" | "PAUSED";
  fitReason?: string;
  notes?: string;
  lastContactedAt?: string;
  lastNotesUpdate?: string;
  propertiesAssociated: string[];
}

export interface OutreachMessage {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  recipientName?: string;
  recipientEmail?: string;
  dealId?: string;
  propertyAddress?: string;
  channel: "EMAIL" | "SMS" | "CALL";
  subject: string;
  body: string;
  tone?: "cash_buyer" | "direct" | "relationship";
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SENT" | "REPLIED" | "OPTED_OUT";
  responded: boolean;
  replyReceived?: boolean;
  doNotContact: boolean;
  sequenceStep: number;
  scheduledAt?: string;
  sentAt?: string;
  respondedAt?: string;
  replyText?: string;
  createdAt: string;
}

export interface Investor {
  id: string;
  name: string;
  company: string;
  contactPerson?: string;
  email: string;
  phone: string;
  targetMarkets: string[];
  targetStates?: string[];
  maxPurchasePrice: number;
  minROI: number;
  minProfit: number;
  preferredTypes: string[];
  availableCapital: number;
  activeDealsCount: number;
  buyBoxMatchCount?: number;
  isWholesalerReady?: boolean;
  wholesaleTags?: string[];
  priority?: "HIGH" | "CRITICAL" | "STANDARD" | "MEDIUM" | "LOW";
  acceptsAssignments?: boolean;
  targetAssignmentFeeRange?: string;
  wholesalerForumNote?: string;
  source?: string;
  source_url?: string | null;
  sourceUrl?: string | null;
  sourceCategory?: string;
  status?: "ACTIVE" | "PAUSED" | "ENGAGED" | "NEW";
  lastContactedAt?: string;
  lastNotesUpdate?: string;
  notes?: string;
}

export interface SellerRecord {
  id: string;
  name: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip?: string;
  propertyType: "land" | "single_family" | "multifamily" | "commercial";
  lotSizeAcres?: number;
  sqft?: number;
  askingPrice: number;
  estimatedValue?: number;
  estimatedRepairs?: number;
  phone: string;
  email: string;
  status: "NEW" | "CONTACTED" | "NEGOTIATING" | "UNDER_CONTRACT" | "CLOSED" | "PAUSED";
  source: string;
  source_url: string | null;
  sourceCategory: "PUBLIC_LISTING" | "OFF_MARKET_TAX" | "DIRECT_MAIL" | "SATELLITE" | "PROBATE" | "FSBO";
  fitReason?: string;
  notes?: string;
  lastContactedAt?: string;
  lastNotesUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerRecord {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  contactFormUrl?: string;
  targetMarkets: string[];
  targetTypes: string[];
  targetSubmarket?: string;
  maxBudget: number;
  minROI: number;
  acreagePreferences?: string;
  pricePreferences?: string;
  status: "ACTIVE" | "PAUSED" | "ENGAGED" | "NEW";
  source: string;
  source_url: string | null;
  sourceCategory: "FACEBOOK_GROUPS" | "BIGGERPOCKETS" | "LANDMODO" | "BUILDER_ASSOC" | "REI_MEETUP" | "COUNTY_RECORDS" | "LIVE_SEARCH";
  buyBoxSummary: string;
  foundBy?: string;
  confidenceScore?: number;
  isWholesalerReady?: boolean;
  wholesaleTags?: string[];
  priority?: "HIGH" | "CRITICAL" | "STANDARD" | "MEDIUM" | "LOW";
  acceptsAssignments?: boolean;
  targetAssignmentFeeRange?: string;
  wholesalerForumNote?: string;
  notes?: string;
  lastContactedAt?: string;
  lastNotesUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentReport {
  id: string;
  agentName: "BUYER_SCOUT" | "DEALHUNTER" | "ANALYST" | "OUTREACH" | "CLOSER";
  title: string;
  sessionTimestamp: string;
  countiesCovered: string[];
  queriesExecuted: string[];
  newBuyersFoundCount: number;
  duplicatesSkippedCount: number;
  lowConfidenceSkippedCount: number;
  findings: {
    buyerName: string;
    company?: string;
    targetArea: string;
    contactMethod: string;
    sourceUrl: string;
    status: "SAVED" | "DUPLICATE" | "LOW_CONFIDENCE";
  }[];
  summary: string;
  includedInDailyDigest: boolean;
}

export interface AgentVelocityMetric {
  agentKey: string;
  agentName: string;
  role: string;
  weeklyQuota: number;
  convertedLeads: number;
  conversionYieldRate: number;
  pacePercentage: number;
  status: "EXCEEDING" | "ON_PACE" | "BEHIND";
  dailyProgress: {
    day: string;
    converted: number;
    target: number;
  }[];
}

export interface PropertyInspection {
  id: string;
  dealId: string;
  propertyId: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip?: string;
  inspectionType: "PHYSICAL_STRUCTURAL" | "PEST_TERMITE" | "SEWER_LATERAL" | "SOIL_PERC" | "ENVIRONMENTAL_PHASE1" | "TITLE_SURVEY" | "GENERAL_HOME";
  scheduledDate: string; // YYYY-MM-DD
  deadlineDate: string;  // Contingency deadline YYYY-MM-DD
  inspectorName?: string;
  inspectorCompany?: string;
  inspectorPhone?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "PASSED" | "ISSUES_FOUND" | "COMPLETED" | "CANCELLED";
  contingencyDaysLeft: number;
  cost?: number;
  findingsSummary?: string;
  criticalIssuesCount?: number;
  reportUrl?: string;
}

export interface ZipROIHeatmapData {
  zip: string;
  city: string;
  state: string;
  dealCount: number;
  propertyCount: number;
  avgROI: number;
  maxROI: number;
  minROI: number;
  avgProjectedProfit: number;
  totalProjectedProfit: number;
  medianAskingPrice: number;
  medianExpectedARV: number;
  avgDiscountRate: number;
  heatLevel: "ULTRA_HIGH" | "HIGH" | "MEDIUM" | "MODERATE" | "LOW";
  colorClass: string;
  topDeals: { id: string; address: string; profit: number; roi: number; propertyType: string }[];
  primaryStrategy: string;
}

export interface DailyDigestMatch {
  id: string;
  sellerId: string;
  sellerName: string;
  propertyAddress: string;
  sellerSource: string;
  sellerSourceUrl: string | null;
  buyerId: string;
  buyerName: string;
  buyerSource: string;
  buyerSourceUrl: string | null;
  projectedProfit: number;
  estimatedROI: number;
  matchReason: string;
  matchedAt: string;
  isNewSinceLastDigest: boolean;
}

export interface DailyDigestStatusChange {
  id: string;
  recordType: "SELLER" | "BUYER";
  name: string;
  companyOrAddress: string;
  oldStatus: string;
  newStatus: string;
  source: string;
  sourceUrl: string | null;
  timestamp: string;
}

export interface DailyDigestNewLead {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  askingPrice: number;
  lotSizeOrSqft: string;
  source: string;
  sourceUrl: string | null;
  fitReason: string;
  foundAt: string;
}

export interface DailyDigestOverdueTask {
  id: string;
  recordId: string;
  recordType: "SELLER" | "BUYER";
  name: string;
  addressOrCompany: string;
  status: "CONTACTED" | "NEGOTIATING";
  daysUntouched: number;
  lastNotesUpdate: string;
  recommendedAction: string;
  phone: string;
  email: string;
  sourceUrl: string | null;
}

export interface WholesalerReadyBuyerSummary {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  targetMarkets: string[];
  maxBudget: number;
  minROI: number;
  source: string;
  sourceUrl: string;
  wholesalerTags: string[];
  assignmentFeeRange?: string;
  priority: "HIGH" | "CRITICAL";
  foundAt: string;
  identifiedReason: string;
}

export interface DailyDigestData {
  generatedAt: string;
  newMatches: DailyDigestMatch[];
  statusChanges24h: DailyDigestStatusChange[];
  newLeads: DailyDigestNewLead[];
  overdueTasks: DailyDigestOverdueTask[];
  newWholesalerReadyBuyers?: WholesalerReadyBuyerSummary[];
  buyerScoutReports?: AgentReport[];
  buyerScoutSummary?: string;
}

export interface InvestorMatch {
  investor: Investor;
  matchScore: number;
  reasons: string[];
}

export interface Contract {
  id: string;
  dealId: string;
  propertyAddress: string;
  type: "PURCHASE_AND_SALE" | "ASSIGNMENT" | "LETTER_OF_INTENT";
  buyerName: string;
  sellerName: string;
  purchasePrice: number;
  earnestMoney: number;
  inspectionPeriodDays: number;
  closingPeriodDays: number;
  assignmentFee?: number;
  contingencies: string[];
  status: "DRAFT" | "PENDING_APPROVAL" | "SENT_FOR_SIGNATURE" | "EXECUTED";
  documentText?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractDraft = Contract;

export interface ApprovalRequest {
  id: string;
  action: string;
  type: "SEND_OUTREACH" | "SUBMIT_OFFER" | "SIGN_CONTRACT" | "ASSIGN_DEAL" | "DISQUALIFY_DEAL";
  dealId?: string;
  propertyAddress?: string;
  details: Record<string, unknown>;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedBy: AgentName;
  decisionBy?: string;
  decisionNotes?: string;
  createdAt: string;
  decidedAt?: string;
}

export interface AgentStatusInfo {
  name: AgentName;
  title: string;
  tagline: string;
  status: "IDLE" | "ACTIVE" | "ANALYZING" | "DISPATCHING" | "PROCESSING";
  currentTask?: string;
  processedCount: number;
  successRate: number;
  lastActive: string;
  systemPromptRole: string;
}

export interface DashboardMetrics {
  properties: number;
  analyzed: number;
  qualified: number;
  outreach: number;
  replies: number;
  negotiations: number;
  projected: {
    totalProfit: number;
    avgROI: number;
    avgScore: number;
    activeDealsCount: number;
  };
  realized: {
    totalProfit: number;
    closedDealsCount: number;
    avgROI: number;
  };
  dailyOutreachCount: number;
  dailyOutreachLimit: number;
}

export interface TargetArea {
  id: string;
  county: string;
  state: string;
  notes?: string;
  active: boolean;
}

export interface SearchSourceConfig {
  id: "landwatch" | "land_and_farm" | "county_assessor" | "biggerpockets" | "facebook_groups";
  label: string;
  category: "PUBLIC_PORTAL" | "OFF_MARKET_TAX" | "REI_COMMUNITY" | "SOCIAL_GROUP";
  enabled: boolean;
  description: string;
}

export type AgentPersona =
  | "AGGRESSIVE_INVESTOR"
  | "ANALYTICAL_UNDERWRITER"
  | "DIPLOMATIC_NEGOTIATOR"
  | "DIRECT_PROBLEM_SOLVER"
  | "WHOLESALE_SPEEDSTER";

export interface AppConfig {
  dailyOutreachLimit: number;
  minProfit: number;
  minROI: number;
  defaultMaxPrice: number;
  humanApprovalRequired: boolean;
  agentPersona?: AgentPersona;

  // Account & Access
  adminEmail: string;
  mainContactEmail?: string;
  executivePointOfContact?: string;
  integrations: {
    databaseUrl: string;
    redisUrl: string;
    resendApiKey: string;
  };

  // Search & Agent Config
  targetAreas: TargetArea[];
  searchSources: SearchSourceConfig[];
  matchingTolerance: {
    acreagePercent: number;
    pricePercent: number;
  };
  agentSchedule: {
    dailyRunTime: string; // e.g. "08:00"
    timezone: string;
    autoRunEnabled: boolean;
    lastManualRun?: string;
  };

  // Digest & Notifications
  digestNotifications: {
    voicePlaybackEnabled: boolean;
    autoplayVoiceOnOpen: boolean;
    deliveryMethod: "IN_APP" | "EMAIL" | "BOTH";
    notificationEmail: string;
    skipOnZeroActivity: boolean;
  };

  // Data Management
  devModeEnabled: boolean;
  developerTraceEnabled?: boolean;
  developerTraceVerbosity?: "FULL_AST_TRACE" | "AGENT_PAYLOADS_ONLY" | "PERFORMANCE_BENCHMARKS";
  systemHeartbeatIntervalMs?: number;
}

export interface DeveloperTraceEntry {
  id: string;
  timestamp: string;
  source: "BuyerScoutAgent" | "InvestorMatcher" | "UnderwritingMAO" | "DesktopCloser" | "SafetyDispatcher" | "LiveDebugAgent" | "ProfitEngine" | "SystemPipeline";
  action: string;
  level: "TRACE" | "INFO" | "WARN" | "ERROR" | "EXEC";
  message: string;
  executionTimeMs: number;
  inputPayload?: any;
  outputPayload?: any;
  astNode?: string;
  codeRef?: string;
}

export interface DebugSessionReport {
  id: string;
  timestamp: string;
  component: string;
  status: "AUTO_HEALED" | "RESOLVED" | "ACTIVE_MONITORING" | "SUGGESTION";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  rootCause: string;
  fixApplied: string;
  actionRecommendation: string;
  canAutoRemediate: boolean;
  remediatedAt?: string;
  traceId?: string;
}

export interface SystemDiagnosticReport {
  id: string;
  timestamp: string;
  overallStatus: "HEALTHY" | "WARNING" | "CRITICAL";
  healthScore: number; // 0 - 100
  checks: {
    name: string;
    category: "AI_QUOTA" | "DATABASE" | "SCRAPER_FEEDS" | "TRANSACTIONS" | "AUDIO_ENGINE";
    status: "PASS" | "WARN" | "FAIL";
    latencyMs: number;
    detail: string;
    autoFixAvailable: boolean;
  }[];
  autoRemediationsApplied?: string[];
}

export interface AgentMilestone {
  id: string;
  agentKey: string;
  agentName: string;
  title: string;
  metric: string;
  timestamp: string;
  achievedValue: string | number;
  targetValue: string | number;
  category: "VOLUME" | "SLA" | "CONVERSION" | "PROFIT";
  badge: string;
}

export interface LiveScriptStep {
  stepIndex: number;
  lineNumber: number;
  codeLine: string;
  actionDescription: string;
  variableDeltas: Record<string, any>;
  callStack: string[];
  executionTimeUs: number;
  memoryUsageMb: number;
  logType?: "info" | "success" | "warn" | "error" | "trace";
  logMessage?: string;
}

export interface LiveScriptEngineModule {
  id: string;
  name: string;
  fileName: string;
  category: "UNDERWRITING" | "LEAD_SCRAPER" | "SAFETY_OUTREACH" | "TITLE_CLOSER" | "LEGAL_COMPLIANCE" | "ESCROW_PAYOUT";
  description: string;
  code: string;
  language: "typescript" | "javascript";
  sampleInput: Record<string, any>;
  activeStepCount: number;
  steps: LiveScriptStep[];
}

export interface ContractsVaultSnapshot {
  snapshotId: string;
  version: string;
  exportedAt: string;
  generatedBy: string;
  totalContracts: number;
  activeExecutedCount: number;
  pendingSignatureCount: number;
  totalTransactionVolume: number;
  contracts: Contract[];
  templates: ContractTemplate[];
  dispatches: ContractDispatchRecord[];
  checksum: string;
}

export interface AgentPerformanceReportData {
  reportId: string;
  generatedAt: string;
  period: "THIS_WEEK" | "LAST_7_DAYS" | "MONTH_TO_DATE" | "ALL_TIME";
  startDate: string;
  endDate: string;
  executiveSummary: string;
  overallScore: number; // 0-100
  totalPipelineVolume: number;
  totalProjectedProfit: number;
  realizedProfitSettled: number;
  conversionRatePercent: number;
  agentMetrics: {
    name: AgentName;
    title: string;
    throughputCount: number;
    avgLatencyMs: number;
    successRatePct: number;
    errorRatePct: number;
    dealsProcessed: number;
    topAccomplishment: string;
    speedScore: number;
    accuracyScore: number;
  }[];
  weeklyVelocityTrends: {
    day: string;
    dealsDiscovered: number;
    underwritten: number;
    outreachSent: number;
    contractsDrafted: number;
    projectedSpread: number;
  }[];
  recommendations: string[];
}



