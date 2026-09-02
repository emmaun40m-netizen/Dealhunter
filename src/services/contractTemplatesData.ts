import { ContractTemplate, ContractLanguageInfo, SupportedContractLanguage } from "../types";

export const CONTRACT_LANGUAGES: ContractLanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "zh", name: "Mandarin Chinese", nativeName: "中文 (简体)", flag: "🇨🇳" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "tl", name: "Tagalog", nativeName: "Filipino / Tagalog", flag: "🇵🇭" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  // ==========================================
  // 1. SELLER CONTRACTS & PRESENTATION PACKETS
  // ==========================================
  {
    id: "tpl-seller-presentation-packet",
    name: "Prime Equity Holdings LLC – Seller Presentation Packet",
    category: "SELLER",
    type: "SELLER_PRESENTATION_PACKET",
    tagline: "First Point of Contact Presentation Packet: Fast • Transparent • Professional",
    description: "Official introductory packet sent at the first point of contact to homeowners and property sellers detailing company credentials, cash purchase benefits, zero commissions, and the simple 4-step closing process.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 (Informational & Presentation Packet - No Earnest Deposit Required)",
    inspectionPeriodDays: 14,
    closingPeriodDays: 21,
    keyClauses: [
      "Company Profile & Credibility Overview (Prime Equity Holdings LLC)",
      "Zero Commission & Zero Hidden Fees Guarantee ($0 Realtor Commissions)",
      "100% As-Is Cash Acquisition Guarantee (No Cleaning, Repairs, or Staging)",
      "Flexible 7 to 60 Day Closing Timeline on Seller's Exact Terms",
      "Transparent 4-Step Acquisitions Process (Contact -> Valuation -> Cash Offer -> Title Payout)",
    ],
    bestFor: "First point of contact for all property owners, off-market motivated sellers, probate heirs, and tired landlords to build immediate trust and explain the cash purchase workflow.",
    jurisdictionRulesNote: "Universal introductory packet suitable for distribution in all 50 states prior to or alongside purchase agreements.",
    templateText: `PRIME EQUITY HOLDINGS LLC
SELLER PRESENTATION PACKET
Fast • Transparent • Professional

Prepared for: {{SELLER_NAME}}
Property Address: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}
Date: {{CURRENT_DATE}}

==================================================
🏡 ABOUT US
==================================================
Prime Equity Holdings LLC is a premier real estate investment firm dedicated to providing homeowners with quick, reliable, and hassle-free solutions for selling their properties. Whether you are facing foreclosure, dealing with an inherited property, tired of being a landlord, or simply need to sell fast for cash, we are here to help.

==================================================
✨ WHY WORK WITH US?
==================================================
✅ Fast Cash Offers – We can present a fair, no-obligation cash offer within 24 to 48 hours.
✅ Sell "As-Is" – No repairs, no cleaning, no inspections to worry about. We buy properties in any condition.
✅ Zero Commissions or Hidden Fees – You pay $0 in real estate commissions and we cover standard closing costs.
✅ Flexible Closing Timelines – We close on YOUR schedule, whether in 7 days or 60 days.
✅ Guaranteed Transparency – Clear, honest communication from start to finish.

==================================================
📋 OUR SIMPLE 4-STEP PROCESS:
==================================================
1. Contact & Discovery – We gather basic details about your property and your selling goals.
2. Property Valuation – Our team conducts a thorough desktop analysis and valuation of your home.
3. Present Fair Offer – We present a transparent, no-obligation cash proposal tailored to your needs.
4. Closing & Payout – We close with a reputable local title company and funds are wired directly to you.

==================================================
📞 CONTACT US:
==================================================
Prime Equity Holdings LLC
Acquisitions Department
Email: contact@primeequityholdings.com | acquisitions@primeequityholdings.com
Phone: (800) 555-0199
Corporate Address: 100 Renaissance Center, Suite 1400, Detroit, MI 48243`,
  },
  {
    id: "tpl-seller-psa-zero-emd",
    name: "Purchase & Sale Agreement ($0 Down / No Earnest Deposit)",
    category: "SELLER",
    type: "PURCHASE_AND_SALE_ZERO_EMD",
    tagline: "Standard Cash Acquisition without Upfront Cash Deposit Requirement",
    description: "Enforceable bilateral purchase contract binding the seller where consideration is satisfied by mutual promises and inspection due diligence. Ideal for rapid off-market wholesale acquisitions.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 (Waived — Consideration established via mutual contractual covenants and buyer inspection expenditure)",
    inspectionPeriodDays: 14,
    closingPeriodDays: 21,
    keyClauses: [
      "No Earnest Money Required ($0 Down Promissory Consideration)",
      "Unconditional 14-Day Buyer Inspection & Feasibility Contingency",
      "Full Right of Assignment to Designated Partner or Entity",
      "Seller Pays Standard Back Taxes, Liens & Clear Marketable Title Expenses",
      "Cash Closing with No Financing Contingency Required from Buyer",
    ],
    bestFor: "Motivated sellers, off-market distressed owners, probate and tax delinquent acquisitions where seller does not demand upfront earnest money deposit.",
    jurisdictionRulesNote: "Valid in all 50 states under mutual consideration doctrine. Seller acknowledges contract is binding upon signature.",
    templateText: `REAL ESTATE PURCHASE AND SALE AGREEMENT
[NO EARNEST MONEY DEPOSIT REQUIRED - ZERO DOWN]

1. PARTIES:
This Agreement is entered into on this _____ day of ____________, 2026, by and between:
SELLER: {{SELLER_NAME}} ("Seller")
Mailing Address: {{SELLER_ADDRESS}}
Phone / Contact: {{SELLER_PHONE}}

BUYER: {{BUYER_NAME}} ("Buyer and/or assigns")
Mailing Address: 100 Renaissance Center, Suite 1400, Detroit, MI 48243

2. PROPERTY DESCRIPTION:
Seller agrees to sell and Buyer agrees to purchase the real property, together with all improvements, fixtures, and appurtenances, located at:
Property Address: {{PROPERTY_ADDRESS}}
City, State, Zip: {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}
APN / Parcel ID: {{PROPERTY_PARCEL_ID}}
Legal Description: As recorded in the public records of {{PROPERTY_COUNTY}} County.

3. PURCHASE PRICE & CONSIDERATION:
The total agreed purchase price for the Property is:
TOTAL PURCHASE PRICE: \${{PURCHASE_PRICE}} (USD)
Payable as follows:
(a) Earnest Money Deposit: \${{EARNEST_MONEY}} (ZERO DOLLARS / WAIVED)
    The parties explicitly acknowledge and agree that no cash earnest money deposit is required. Adequate legal consideration is established by the mutual promises herein and the Buyer's expenditure of time and capital in performing property due diligence.
(b) Balance of Purchase Price: \${{BALANCE_DUE}} to be paid in certified funds or wire transfer at closing.

4. INSPECTION & FEASIBILITY CONTINGENCY:
Buyer shall have an inspection period of {{INSPECTION_DAYS}} business days from the effective date to inspect the Property, conduct environmental/structural evaluations, examine title records, and verify repair scopes. Buyer reserves the absolute right to cancel this Agreement for any reason during this period without penalty or liability upon written notice to Seller.

5. CLOSING & TITLE:
Closing shall take place on or before {{CLOSING_DAYS}} days from the expiration of the Inspection Period, or earlier at Buyer's election, through {{TITLE_COMPANY}} or a licensed title/escrow company chosen by Buyer. Seller warrants that title conveyed at closing shall be good, marketable, and free of all liens, encumbrances, and municipal assessments.

6. RIGHT OF ASSIGNMENT:
Seller expressly acknowledges and agrees that Buyer has the unrestricted right to assign, transfer, or convey its contractual rights and obligations under this Agreement to any partner, LLC, entity, or third-party assignee without additional consent from Seller.

7. ACCESS TO PROPERTY:
Seller shall provide Buyer, Buyer's contractors, partners, inspectors, appraisers, and prospective assignees reasonable access to the property upon 24 hours advance notice.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.

SELLER: _____________________________   Date: _______________
Printed: {{SELLER_NAME}}

BUYER: ______________________________   Date: _______________
Printed: {{BUYER_NAME}}`,
  },
  {
    id: "tpl-seller-psa-nominal-emd",
    name: "Purchase & Sale Agreement ($10 - $100 Token Earnest Deposit)",
    category: "SELLER",
    type: "PURCHASE_AND_SALE_NOMINAL_EMD",
    tagline: "Formal Contract with Nominal $10 to $100 Token Earnest Deposit",
    description: "Standard wholesale purchase agreement where a nominal cash token ($10, $50, or $100) is deposited into title/escrow to provide explicit cash consideration on the public HUD-1 settlement sheet.",
    defaultEarnestMoney: 100,
    earnestMoneyOption: "NOMINAL_10_100",
    earnestMoneyNote: "$100.00 (Nominal token deposit deposited with closing title agent within 3 business days of mutual execution)",
    inspectionPeriodDays: 10,
    closingPeriodDays: 14,
    keyClauses: [
      "Nominal $100 Token Earnest Money to Title Company",
      "10-Day Complete Feasibility & Inspection Period",
      "Express Equitable Interest and Assignability Provisions",
      "Seller Concession of Closing and Title Search Costs",
      "Immediate Remote Online Notarization (RON) Acceptance",
    ],
    bestFor: "Sellers who prefer seeing a formal earnest money line item on paperwork, or jurisdictions where title agencies recommend explicit cash consideration.",
    jurisdictionRulesNote: "Fully compliant with state title agency settlement guidelines nationwide.",
    templateText: `REAL ESTATE PURCHASE AND SALE AGREEMENT
[NOMINAL EARNEST MONEY TOKEN CONSIDERATION]

1. AGREEMENT OF SALE:
{{SELLER_NAME}} ("Seller") agrees to sell to {{BUYER_NAME}} and/or assigns ("Buyer") the real property at:
{{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}

2. FINANCIAL TERMS:
Purchase Price: \${{PURCHASE_PRICE}}
Earnest Money Deposit: \${{EARNEST_MONEY}} (Deposited with {{TITLE_COMPANY}} within 72 hours of execution)
Cash Balance at Closing: \${{BALANCE_DUE}}

3. INSPECTION CONTINGENCY:
Buyer's obligation to close is contingent on Buyer's sole approval of property condition within {{INSPECTION_DAYS}} days. If Buyer disapproves of the property condition, Buyer may terminate this agreement and the earnest money shall be refunded in full immediately.

4. CLOSING:
Closing shall occur within {{CLOSING_DAYS}} days of contract execution. Seller shall deliver vacant possession and fee simple marketable warranty deed.

5. ASSIGNABILITY:
Buyer reserves the unilateral right to assign its equitable interest to any related affiliate or third party.

SELLER: _____________________________   Date: _______________
BUYER: ______________________________   Date: _______________`,
  },
  {
    id: "tpl-seller-subject-to",
    name: "Subject-To Purchase Agreement (Existing Financing Wrap & Authorization)",
    category: "SELLER",
    type: "SUBJECT_TO_PURCHASE_AGREEMENT",
    tagline: "Acquires Real Property Subject to Existing Low-Interest Underlying Mortgages",
    description: "Comprehensive creative financing agreement allowing Buyer to purchase real property subject to existing underlying mortgage notes without paying off the debt at closing. Includes Due-on-Sale Disclosures and Limited Power of Attorney.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 (Waived — Buyer assumes monthly debt service obligations)",
    inspectionPeriodDays: 14,
    closingPeriodDays: 30,
    keyClauses: [
      "Explicit Conveyance Subject to Existing Encumbrances / Deeds of Trust",
      "Seller Grant of Irrevocable Limited Power of Attorney for Loan Administration",
      "Due-on-Sale (Garn-St. Germain Act) Voluntary Seller Disclosure & Waiver",
      "Escrow Impound Account Authorization & Insurance Loss Payee Endorsement",
      "Right to Assign Equitable & Legal Title to Land Trust or Holding LLC",
    ],
    bestFor: "Motivated sellers with low fixed-rate mortgages (2%–4%), little to no equity, pre-foreclosure payment arrears, or sellers seeking debt relief without price discount.",
    jurisdictionRulesNote: "Subject-to transactions are legal in all 50 states. Title company requires standard Subject-To Disclosure Riders and Mortgage Verification Forms.",
    templateText: `REAL ESTATE PURCHASE AND SALE AGREEMENT
[SUBJECT-TO EXISTING UNDERLYING FINANCING]

THIS AGREEMENT is entered into on {{CURRENT_DATE}}, by and between:
SELLER: {{SELLER_NAME}} ("Seller")
BUYER: {{BUYER_NAME}} and/or assigns ("Buyer")
PROPERTY ADDRESS: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}

1. PURCHASE STRUCTURE & UNDERLYING FINANCING:
Buyer agrees to purchase the Property for a total consideration of \${{PURCHASE_PRICE}}, structured as follows:
(a) Existing Underlying Mortgage Principal Balance: Approximately \${{EXISTING_LOAN_BALANCE}} currently serviced by {{LENDER_NAME}} (Loan # {{LOAN_NUMBER}}).
(b) Cash to Seller at Closing: \${{CASH_TO_SELLER}}
(c) Earnest Money: \${{EARNEST_MONEY}} (ZERO DOWN / WAIVED)

2. SUBJECT-TO COVENANT & PAYMENTS:
Seller agrees to convey title via Special Warranty Deed or Grant Deed SUBJECT TO the existing underlying Deed of Trust/Mortgage. Buyer or Buyer's servicing trustee shall make monthly principal, interest, taxes, and insurance (PITI) payments directly to loan servicer commencing on {{FIRST_PAYMENT_DATE}}.

3. DUE-ON-SALE DISCLOSURE:
Seller and Buyer acknowledge that the underlying mortgage documents may contain a "Due-on-Sale" acceleration clause. Seller acknowledges that Buyer is not assuming personal liability to the lender, and Seller knowingly authorizes transfer of title subject to said loan.

4. LIMITED POWER OF ATTORNEY:
Seller hereby grants Buyer an irrevocable Limited Power of Attorney to communicate with the lender, escrow servicer, insurance carrier, and tax collector regarding loan # {{LOAN_NUMBER}}.

5. CLOSING & RECORDING:
Closing shall take place with {{TITLE_COMPANY}} on or before {{CLOSING_DAYS}} days from effective date.

SELLER: _____________________________   Date: _______________
Printed: {{SELLER_NAME}}

BUYER: ______________________________   Date: _______________
Printed: {{BUYER_NAME}}`,
  },
  {
    id: "tpl-seller-financing",
    name: "Seller Financing Purchase Agreement (Owner Carryback Promissory Note)",
    category: "SELLER",
    type: "SELLER_FINANCING_PURCHASE_AGREEMENT",
    tagline: "Owner-Financed Acquisition with Customized Installment Note & Deed of Trust",
    description: "Installment purchase contract where the seller acts as the bank, carrying back a first or second promissory note secured by a deed of trust/mortgage against the subject property at agreed interest rates and amortized balloon schedules.",
    defaultEarnestMoney: 100,
    earnestMoneyOption: "NOMINAL_10_100",
    earnestMoneyNote: "$100.00 Token Consideration (Down payment paid at closing per promissory note)",
    inspectionPeriodDays: 14,
    closingPeriodDays: 21,
    keyClauses: [
      "Customized Owner Carryback Promissory Note & Trust Deed Security",
      "Flexible Interest Rate (0%–6% Fixed) & Custom Amortization Schedule",
      "No Prepayment Penalty Clause for Early Full Payoff",
      "Non-Recourse Principal Protection for Wholesale Holding Entity",
      "Grace Period and Default Notice Protections for Buyer",
    ],
    bestFor: "Free-and-clear property owners, retired landlords wanting passive monthly income, and sellers looking to minimize capital gains tax via installment sales.",
    jurisdictionRulesNote: "Complies with Dodd-Frank and SAFE Act commercial investment exemptions for non-owner occupied properties.",
    templateText: `REAL ESTATE PURCHASE AGREEMENT WITH SELLER FINANCING
[OWNER CARRYBACK NOTE & DEED OF TRUST]

DATE: {{CURRENT_DATE}}
SELLER (Lender): {{SELLER_NAME}}
BUYER (Borrower): {{BUYER_NAME}} and/or assigns
PROPERTY: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}

1. PURCHASE PRICE & FINANCING TERMS:
Total Purchase Price: \${{PURCHASE_PRICE}}
(a) Down Payment at Closing: \${{DOWN_PAYMENT}}
(b) Promissory Note Principal (Financed by Seller): \${{NOTE_PRINCIPAL}}
(c) Interest Rate: {{INTEREST_RATE}}% per annum
(d) Monthly Payment (P&I): \${{MONTHLY_PAYMENT}}
(e) Maturity / Balloon Date: {{BALLOON_YEARS}} years from closing date.

2. SECURITY INSTRUMENT:
Buyer shall execute a standard Promissory Note and first-position Deed of Trust / Mortgage in favor of Seller, recorded concurrently with the Warranty Deed at {{TITLE_COMPANY}}.

3. PREPAYMENT:
Buyer may prepay any portion or all of the principal balance at any time without penalty or fee.

4. INSPECTION CONTINGENCY:
Buyer shall have {{INSPECTION_DAYS}} days to inspect the premises and confirm title clarity.

SELLER: _____________________________   Date: _______________
BUYER: ______________________________   Date: _______________`,
  },
  {
    id: "tpl-seller-loi",
    name: "Seller Letter of Intent (Non-Binding Cash LOI)",
    category: "SELLER",
    type: "LETTER_OF_INTENT",
    tagline: "Rapid Preliminary Cash Offer to Gauge Seller Price Acceptance",
    description: "Clean, non-binding Letter of Intent used to submit rapid cash acquisition terms to motivated sellers or listing agents before drafting formal legal purchase contracts.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 at LOI stage (Subject to definitive contract)",
    inspectionPeriodDays: 7,
    closingPeriodDays: 10,
    keyClauses: [
      "Non-Binding Framework for Rapid Price Negotiation",
      "All-Cash Offer with Zero Lender Financing Contingencies",
      "As-Is Condition with Zero Repair Requests",
      "Fast 7-14 Day Expedited Closing Schedule",
    ],
    bestFor: "Submitting multiple offers per day across national markets and MLS listed properties to establish instant dialogue with listing agents.",
    jurisdictionRulesNote: "Non-binding statement of purchase intent. Does not create encumbrance until formal agreement is executed.",
    templateText: `NON-BINDING LETTER OF INTENT (LOI) TO PURCHASE REAL ESTATE

Date: {{CURRENT_DATE}}
To: {{SELLER_NAME}} / Listing Agent
Regarding Property: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}}

Dear Property Owner / Representative,

{{BUYER_NAME}} is pleased to submit this non-binding Letter of Intent to acquire the above-referenced property on an all-cash, as-is basis:

1. OFFERED PURCHASE PRICE: \${{PURCHASE_PRICE}} Net Cash to Seller
2. EARNEST MONEY: \${{EARNEST_MONEY}} ($0 or Nominal upon definitive agreement)
3. TERMS: 100% Cash / No Mortgage Contingency
4. CONDITION: 100% "AS-IS, WHERE-IS" with no seller repairs or municipal warranties required
5. DUE DILIGENCE: {{INSPECTION_DAYS}} business days from contract signing
6. CLOSING TIMELINE: On or before {{CLOSING_DAYS}} days from completed inspection
7. CLOSING AGENT: Local reputable title and escrow company

This Letter of Intent serves to express mutual economic terms and is non-binding until a formal Purchase and Sale Agreement is executed by both parties.

Sincerely,
{{BUYER_NAME}}
Acquisitions Department`,
  },

  // ==========================================
  // 2. BUYER CONTRACTS & PRESENTATION PACKETS
  // ==========================================
  {
    id: "tpl-buyer-presentation-packet",
    name: "Prime Equity Holdings LLC – Buyer & Investor Presentation Packet",
    category: "BUYER",
    type: "BUYER_PRESENTATION_PACKET",
    tagline: "First Point of Contact VIP Buyer Packet: Exclusive Off-Market Deals • High-Yield Margins",
    description: "Official introductory packet sent at first point of contact to cash buyers, hedge funds, and flippers detailing company credentials, off-market inventory access, minimum 25%+ ROI underwriting standards, and frictionless escrow assignments.",
    defaultEarnestMoney: 2500,
    earnestMoneyOption: "STANDARD_500_2500",
    earnestMoneyNote: "$2,500.00 (Standard EMD into escrow upon contract lock)",
    inspectionPeriodDays: 3,
    closingPeriodDays: 7,
    assignmentFee: 15000,
    keyClauses: [
      "Exclusive Off-Market Property Pipeline (Zero MLS or Retail Competition)",
      "Rigorous Forensic Underwriting & Verified Comps (ARV, Repairs, Title)",
      "Instant Equity & Minimum 25%+ Target ROI on All Assets",
      "Seamless Legal Assignment and Clean Title Transfer Protocol",
      "Simple 4-Step VIP Buyer Onboarding (VIP List -> Deal Alert -> EMD Lock -> Closing)",
    ],
    bestFor: "First point of contact for new cash buyers, hedge fund acquisition managers, REI portfolio holders, and fix-and-flip investors joining the buyer network.",
    jurisdictionRulesNote: "Universal introductory packet suitable for distribution across all national investment markets.",
    templateText: `PRIME EQUITY HOLDINGS LLC
BUYER & INVESTOR PRESENTATION PACKET
Exclusive Off-Market Inventory • Deep Discounts • High-Yield Opportunities

Prepared for: {{BUYER_NAME}}
VIP Investor Group / Entity: {{BUYER_COMPANY}}
Date: {{CURRENT_DATE}}

==================================================
🏢 ABOUT US
==================================================
Prime Equity Holdings LLC sources deeply discounted, off-market real estate opportunities for active real estate investors, hedge funds, fix-and-flippers, and buy-and-hold portfolio builders across high-growth national markets.

==================================================
💎 WHAT WE OFFER OUR BUYERS:
==================================================
✅ Exclusive Off-Market Deals – Direct access to properties before they hit the MLS or public portals.
✅ Accurate Underwriting – Full repair estimates, ARV projections, comparable sales, and title clearance.
✅ Instant Equity & High ROI – Target minimum 25%+ projected return or substantial margin spread.
✅ Seamless Transactions – Assigned or double-closed with reputable local title companies for clean transfers.

==================================================
📊 BUYER CRITERIA & PREFERRED ASSETS:
==================================================
• Single Family Fix & Flips (Light cosmetic to full gut renovations)
• Multi-Family & Small Portfolios (Value-add cash-flowing assets)
• Infill Residential & Rural Land (Subdivision, build-to-suit, or agricultural holds)

==================================================
🤝 HOW WE WORK TOGETHER:
==================================================
1. Join VIP Buyer List – Submit your target markets, price ranges, and buy-box criteria.
2. Receive Live Deal Signal – Get first look at verified deals matching your parameters.
3. Lock Contract – Submit non-refundable EMD deposit with escrow within 24-48 hours.
4. Close & Execute – Transfer title and begin your renovation or tenant placement.

==================================================
📞 CONTACT OUR DISPOSITIONS DESK:
==================================================
Prime Equity Holdings LLC
Dispositions & Capital Markets
Email: buyers@primeequityholdings.com | vip@primeequityholdings.com
Phone: (800) 555-0199
Address: 100 Renaissance Center, Suite 1400, Detroit, MI 48243`,
  },
  {
    id: "tpl-buyer-assignment",
    name: "Wholesale Assignment of Contract (Cash Buyer)",
    category: "BUYER",
    type: "ASSIGNMENT_AGREEMENT",
    tagline: "Assigns Equitable Contract Rights to Cash Buyer for Assignment Fee",
    description: "Legally transfers Assignor's equitable interest in the underlying purchase contract to an end cash investor in exchange for an agreed wholesale assignment fee. Protects Assignor's fee payout at closing.",
    defaultEarnestMoney: 2500,
    earnestMoneyOption: "STANDARD_500_2500",
    earnestMoneyNote: "$2,500.00 Non-Refundable Assignment Deposit directly to Title Company",
    inspectionPeriodDays: 0,
    closingPeriodDays: 7,
    assignmentFee: 20000,
    keyClauses: [
      "Explicit Assignment of All Contractual Rights & Equitable Interest",
      "Non-Refundable End-Buyer Earnest Money Deposit ($2,500+)",
      "Direct Payout of Wholesale Assignment Fee on Closing HUD/ALTA Statement",
      "Assignee Assumes All Performance Obligations & Closing Timelines",
      "No Financing or Inspection Delays Permitted for Assignee",
    ],
    bestFor: "Locking in end cash buyers, flippers, and landlords to take over your purchase contract with guaranteed assignment fee disbursement.",
    jurisdictionRulesNote: "Compliant with national assignment doctrines. Include state-specific equitable interest disclosure riders where required (TX, AZ, OK, IL).",
    templateText: `ASSIGNMENT OF REAL ESTATE PURCHASE AND SALE CONTRACT

FOR VALUE RECEIVED, this Assignment Agreement is made on {{CURRENT_DATE}}, by and between:
ASSIGNOR: {{BUYER_NAME}} ("Assignor")
ASSIGNEE: {{ASSIGNEE_NAME}} ("Assignee")

RECITALS:
A. Assignor entered into a Real Estate Purchase and Sale Agreement dated {{ORIGINAL_CONTRACT_DATE}} as Buyer with {{SELLER_NAME}} as Seller, for the purchase of:
{{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}
Original Purchase Price: \${{PURCHASE_PRICE}}

B. Assignor desires to assign all rights, title, and equitable interest in said contract to Assignee, and Assignee desires to assume all obligations therein.

AGREEMENT:
1. ASSIGNMENT FEE:
Assignee agrees to pay Assignor an Assignment Fee of \${{ASSIGNMENT_FEE}} (USD).
(a) Non-Refundable Deposit: Assignee shall deposit \${{EARNEST_MONEY}} with {{TITLE_COMPANY}} immediately upon execution of this Assignment.
(b) Balance of Assignment Fee: The remaining balance of \${{ASSIGNMENT_FEE_BALANCE}} shall be disbursed to Assignor by the closing agent on the final closing settlement statement.

2. TOTAL ACQUISITION COST TO ASSIGNEE:
Underlying Contract Price: \${{PURCHASE_PRICE}}
Wholesale Assignment Fee: \${{ASSIGNMENT_FEE}}
TOTAL PURCHASE EXPENSE TO ASSIGNEE: \${{TOTAL_ASSIGNEE_PRICE}} + Closing Costs

3. CLOSING DATE & PERFORMANCE:
Assignee agrees to close title strictly on or before {{CLOSING_DATE}}. Assignee acknowledges that time is of the essence. Failure of Assignee to close shall result in forfeiture of deposit to Assignor without prejudice to further legal remedies.

4. AS-IS CONDITION:
Assignee acknowledges having conducted all necessary due diligence prior to executing this Assignment and accepts the property in 100% "AS-IS" condition.

ASSIGNOR: ___________________________   Date: _______________
Printed: {{BUYER_NAME}}

ASSIGNEE: ___________________________   Date: _______________
Printed: {{ASSIGNEE_NAME}}`,
  },
  {
    id: "tpl-buyer-double-close",
    name: "B-to-C Resale Agreement (Double Closing / Transactional Funding)",
    category: "BUYER",
    type: "DOUBLE_CLOSE_RESALE",
    tagline: "Separate Resale Contract for Strict Licensing States (OK, IL, SC, PA)",
    description: "Standalone purchase agreement where wholesaler sells property directly to end buyer on the B-to-C side of a double close. Hides assignment fee spread and avoids wholesale licensing prohibitions.",
    defaultEarnestMoney: 3000,
    earnestMoneyOption: "STANDARD_500_2500",
    earnestMoneyNote: "$3,000.00 Hard Earnest Money Deposit into Escrow",
    inspectionPeriodDays: 3,
    closingPeriodDays: 7,
    keyClauses: [
      "Separate B-to-C Standalone Contract (No Assignment Language)",
      "Protects Confidentiality of A-to-B Acquisition Spread",
      "Contingent Upon Seller (Wholesaler) Completing Fee Simple Acquisition",
      "Hard Non-Refundable End-Buyer Earnest Money",
      "Same-Day Back-to-Back Closing via Transactional Funding",
    ],
    bestFor: "High-profit deals ($25,000+ spread) and states where direct assignment is regulated or prohibited (Oklahoma, Illinois, South Carolina).",
    jurisdictionRulesNote: "100% compliant in all 50 states because wholesaler acquires legal title on A-B leg before conveying on B-C leg.",
    templateText: `AGREEMENT FOR PURCHASE AND SALE OF REAL ESTATE
[B-TO-C TRANSACTIONAL RESALE AGREEMENT]

SELLER: {{BUYER_NAME}} (B Party / Interim Titleholder)
BUYER: {{ASSIGNEE_NAME}} (C Party / End Cash Buyer)
PROPERTY: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}}

1. PURCHASE PRICE: \${{TOTAL_ASSIGNEE_PRICE}}
2. EARNEST MONEY: \${{EARNEST_MONEY}} deposited with {{TITLE_COMPANY}} within 24 hours.
3. CONTINGENCY DISCLOSURE:
Buyer understands that Seller has equitable ownership interest and closing is contingent upon Seller's concurrent settlement and recordation of fee simple title on the property.
4. CLOSING: Same-day escrow closing on {{CLOSING_DATE}}.

SELLER: _____________________________   Date: _______________
BUYER: ______________________________   Date: _______________`,
  },

  // ==========================================
  // 3. INVESTOR CONTRACTS
  // ==========================================
  {
    id: "tpl-investor-jv",
    name: "Co-Wholesaling Joint Venture (JV) Agreement",
    category: "INVESTOR",
    type: "JOINT_VENTURE_AGREEMENT",
    tagline: "50/50 Profit Split Agreement with Partner Wholesalers or Dispo Specialists",
    description: "Legally defines the co-wholesaling partnership where one party provides the locked contract (Acquisitions) and the other party brings the qualified cash buyer (Dispositions). Splits the assignment fee cleanly at title.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 (Partnership consideration based on mutual deal contribution)",
    inspectionPeriodDays: 0,
    closingPeriodDays: 14,
    assignmentFee: 20000,
    keyClauses: [
      "50% / 50% Clean Assignment Profit Split",
      "Exclusivity for Dispositions Partner during Contract Period",
      "Irrevocable Closing Instruction for Separate Title Wire Splits",
      "Mutual Non-Circumvention and Non-Disclosure (NCND)",
    ],
    bestFor: "Partnering with local wholesalers, dispositions managers, or hedge fund allocators to liquidate deals nationally.",
    jurisdictionRulesNote: "Fully legal business co-venture agreement between independent investment principals.",
    templateText: `CO-WHOLESALING JOINT VENTURE (JV) AGREEMENT

This Joint Venture Agreement is entered into on {{CURRENT_DATE}}, by:
PARTY A (Acquisitions Lead): {{BUYER_NAME}}
PARTY B (Dispositions Lead): {{INVESTOR_NAME}}
SUBJECT PROPERTY: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}}

1. PURPOSE:
Party A holds an enforceable contract to purchase the Subject Property. Party B has access to ready, willing, and able cash buyers. The parties agree to collaborate to assign or resell the contract.

2. PROFIT SPLIT:
Total Wholesale Assignment Fee / Net Profit shall be divided as follows:
Party A: 50% of Net Assignment Fee
Party B: 50% of Net Assignment Fee
Title company {{TITLE_COMPANY}} is hereby instructed to issue two separate wire payments at closing.

3. NON-CIRCUMVENTION:
Party B shall not contact the original property owner directly or attempt to negotiate around Party A.

PARTY A: ___________________________   Date: _______________
PARTY B: ___________________________   Date: _______________`,
  },
  {
    id: "tpl-investor-pml-note",
    name: "Private Money Lending (PML) Note & Security Agreement",
    category: "INVESTOR",
    type: "PRIVATE_MONEY_LENDING_NOTE",
    tagline: "Formally Secures Private Lender Capital with Fixed APR & Deed of Trust Security",
    description: "Complete private promissory note and loan security agreement for borrowing private capital to fund real estate flips, buy-and-holds, or earnest deposits, backed by a first-position deed of trust / mortgage.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 (Standard Promissory Note Principal Disbursement)",
    inspectionPeriodDays: 0,
    closingPeriodDays: 7,
    keyClauses: [
      "Promissory Note with Fixed Annual Percentage Rate (8%–14% APR)",
      "First or Second Position Deed of Trust / Mortgage Security Collateral",
      "Defined Loan Term (6–24 Months) with Interest-Only Monthly Payments",
      "Lender Title Insurance Policy & Hazard Insurance Loss Payee Protection",
      "Standard Default Remedies & Acceleration Covenants",
    ],
    bestFor: "Securing private funds from high-net-worth individuals, doctors, attorneys, and self-directed IRA investors for acquisitions and bridge funding.",
    jurisdictionRulesNote: "Commercial investment loan exemption under state usury and lending regulations.",
    templateText: `PROMISSORY NOTE AND REAL ESTATE SECURITY AGREEMENT
[PRIVATE MONEY LENDER FIRST LIEN INSTRUMENT]

DATE: {{CURRENT_DATE}}
BORROWER: {{BUYER_NAME}} ("Borrower")
LENDER: {{INVESTOR_NAME}} ("Lender")
COLLATERAL PROPERTY: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}

1. PRINCIPAL LOAN AMOUNT & INTEREST:
For value received, Borrower promises to pay to the order of Lender the principal sum of \${{LOAN_AMOUNT}} (USD) together with interest from the funding date at the fixed rate of {{INTEREST_RATE}}% per annum.

2. PAYMENT SCHEDULE:
(a) Monthly Interest Payments: Borrower shall pay monthly interest-only payments of \${{MONTHLY_PAYMENT}} due on the 1st day of each month.
(b) Maturity Date: The entire unpaid principal balance plus accrued interest shall be due in full on {{MATURITY_DATE}} (12 Months from Funding).
(c) Prepayment: Borrower may prepay this Note in whole or in part at any time without penalty.

3. SECURITY & COLLATERAL:
This Note is secured by a first-lien Deed of Trust / Mortgage of even date herewith encumbering the real property located at {{PROPERTY_ADDRESS}}. Lender shall be named as Additional Insured Loss Payee on all hazard/property insurance policies.

4. DEFAULT:
If any payment is not received within 15 days of its due date, Lender may declare the entire unpaid balance immediately due and payable.

BORROWER: __________________________   Date: _______________
Printed: {{BUYER_NAME}}

LENDER: ____________________________   Date: _______________
Printed: {{INVESTOR_NAME}}`,
  },
  {
    id: "tpl-investor-trans-funding",
    name: "Transactional Funding (1-Day Flash Loan) Agreement",
    category: "INVESTOR",
    type: "TRANSACTIONAL_FUNDING_AGREEMENT",
    tagline: "Short-Term 24-Hour Bridge Loan Agreement for Double Closings",
    description: "Financing agreement for 100% purchase funding on the A-to-B closing leg of a double closing, secured against the verified end-buyer escrow deposit on the B-to-C closing leg.",
    defaultEarnestMoney: 0,
    earnestMoneyOption: "ZERO_WAIVED",
    earnestMoneyNote: "$0.00 (Funded 100% by Flash Lender for 1-2 points fee)",
    inspectionPeriodDays: 0,
    closingPeriodDays: 1,
    keyClauses: [
      "100% Financing of A-to-B Acquisition Price ($0 Down from Wholesaler)",
      "Standard 1.0% - 1.5% Flash Loan Fee ($1,000 Minimum)",
      "Contingent on Verified Proof of Funds from C-Buyer Escrow",
      "Automatic Repayment upon B-to-C Escrow Settlement (Same Day)",
    ],
    bestFor: "Executing double closings without using personal capital in states requiring title transfer.",
    jurisdictionRulesNote: "Standard commercial transactional bridge financing instrument.",
    templateText: `TRANSACTIONAL FLASH FUNDING MEMORANDUM & ESCROW INSTRUCTION

BORROWER (Wholesaler): {{BUYER_NAME}}
LENDER: DealHunter Capital Partners / Flash Funding Trust
SUBJECT PROPERTY: {{PROPERTY_ADDRESS}}, {{PROPERTY_CITY}}, {{PROPERTY_STATE}}

1. LOAN AMOUNT: \${{PURCHASE_PRICE}} (100% of A-B Contract Price)
2. ORIGINATION / FLASH FEE: \${{TRANSACTIONAL_FEE}} (1.25% or \$1,000 minimum)
3. MATURITY: Same-day 24-hour closing cycle upon recordation of B-to-C sale.
4. TITLE ESCROW INSTRUCTION: Title company {{TITLE_COMPANY}} is instructed to wire back loan principal plus fee immediately from B-to-C closing proceeds.

BORROWER: __________________________   Date: _______________
LENDER: ____________________________   Date: _______________`,
  },
];

/**
 * Pre-translated legal lexicons for instant multilingual contract generation
 */
export const MULTILINGUAL_LEGAL_DICTIONARY: Record<SupportedContractLanguage, Record<string, string>> = {
  en: {
    title_psa: "REAL ESTATE PURCHASE AND SALE AGREEMENT",
    parties: "1. PARTIES",
    seller: "SELLER",
    buyer: "BUYER",
    property_desc: "2. PROPERTY DESCRIPTION",
    purchase_price: "3. PURCHASE PRICE & CONSIDERATION",
    earnest_money: "Earnest Money Deposit",
    waived_note: "ZERO DOLLARS / WAIVED (Adequate legal consideration established by mutual covenants and buyer due diligence expenditure)",
    inspection: "4. INSPECTION & FEASIBILITY CONTINGENCY",
    closing_title: "5. CLOSING & TITLE",
    assignment: "6. RIGHT OF ASSIGNMENT",
    access: "7. ACCESS TO PROPERTY",
    in_witness: "IN WITNESS WHEREOF, the parties have executed this Agreement.",
  },
  es: {
    title_psa: "CONTRATO DE COMPRAVENTA DE BIENES RAÍCES",
    parties: "1. PARTES CONTRATANTES",
    seller: "VENDEDOR",
    buyer: "COMPRADOR Y/O CESIONARIOS",
    property_desc: "2. DESCRIPCIÓN DEL INMUEBLE",
    purchase_price: "3. PRECIO DE COMPRA Y CONTRAPRESTACIÓN",
    earnest_money: "Depósito de Garantía (Earnest Money)",
    waived_note: "CERO DÓLARES / EXONERADO (La contraprestación legal válida se establece mediante las promesas mutuas y los gastos de inspección del comprador)",
    inspection: "4. CONTINGENCIA DE INSPECCIÓN Y VIABILIDAD",
    closing_title: "5. CIERRE Y TÍTULO DE PROPIEDAD",
    assignment: "6. DERECHO DE CESIÓN",
    access: "7. ACCESO AL INMUEBLE",
    in_witness: "EN FE DE LO CUAL, las partes suscriben el presente contrato en la fecha indicada.",
  },
  fr: {
    title_psa: "CONTRAT D'ACHAT ET DE VENTE IMMOBILIÈRE",
    parties: "1. PARTIES",
    seller: "VENDEUR",
    buyer: "ACHETEUR ET/OU AYANTS DROIT",
    property_desc: "2. DESCRIPTION DU BIEN IMMOBILIER",
    purchase_price: "3. PRIX D'ACHAT ET CONTREPARTIE",
    earnest_money: "Dépôt de Garantie (Arrhes)",
    waived_note: "ZÉRO DOLLAR / DISPENSÉ (Contrepartie juridique valide établie par les engagements mutuels et les frais d'audit)",
    inspection: "4. CONDITION SUSPENSIVE D'INSPECTION",
    closing_title: "5. CLÔTURE ET TITRE DE PROPRIÉTÉ",
    assignment: "6. DROIT DE CESSION",
    access: "7. ACCÈS AU BIEN IMMOBILIER",
    in_witness: "EN FOI DE QUOI, les parties ont signé le présent contrat.",
  },
  zh: {
    title_psa: "房地产买卖与转让协议",
    parties: "1. 合同双方",
    seller: "卖方 (Seller)",
    buyer: "买方及/或指定受让人 (Buyer and/or assigns)",
    property_desc: "2. 物业标的描述",
    purchase_price: "3. 购买价格与对价条款",
    earnest_money: "定金 (Earnest Money Deposit)",
    waived_note: "0美元 / 免除现金定金 (双方互为法律对价，买方承担尽职调查与房屋检验成本)",
    inspection: "4. 房屋检验与尽职调查前置条件",
    closing_title: "5. 过户结算与产权交割",
    assignment: "6. 合同转让权利 (Right of Assignment)",
    access: "7. 物业查验准入权限",
    in_witness: "本协议经双方签署，自签署之日起具备法律效力。",
  },
  de: {
    title_psa: "IMMOBILIENKAUF- UND ÜBERTRAGUNGSVERTRAG",
    parties: "1. VERTRAGSPARTEIEN",
    seller: "VERKÄUFER",
    buyer: "KÄUFER UND/ODER RECHTSNACHFOLGER",
    property_desc: "2. OBJEKTBESCHREIBUNG",
    purchase_price: "3. KAUFPREIS UND GEGENLEISTUNG",
    earnest_money: "Kaufpreisanzahlung / Reugeld",
    waived_note: "0,00 USD / ERLASSEN (Rechtsgültige Gegenleistung durch gegenseitige Verpflichtungen begründet)",
    inspection: "4. PRÜFUNGS- UND INSPEKTIONSVORBEHALT",
    closing_title: "5. ABWICKLUNG UND EIGENTUMSÜBERTRAGUNG",
    assignment: "6. ABTRETUNGSRECHT",
    access: "7. ZUTRITTSRECHT ZUR IMMOBILIE",
    in_witness: "ZU URKUND DESSEN haben die Parteien diesen Vertrag unterzeichnet.",
  },
  pt: {
    title_psa: "CONTRATO DE COMPRA E VENDA DE IMÓVEL",
    parties: "1. PARTES CONTRATANTES",
    seller: "VENDEDOR",
    buyer: "COMPRADOR E/OU CESSIONÁRIOS",
    property_desc: "2. DESCRIÇÃO DO IMÓVEL",
    purchase_price: "3. PREÇO DE COMPRA E CONTRAPRESTAÇÃO",
    earnest_money: "Depósito de Sinal (Sinal/Arras)",
    waived_note: "ZERO DÓLARES / ISENTO (Consideração legal válida estabelecida por compromissos mútuos)",
    inspection: "4. CLÁUSULA DE INSPEÇÃO E DILIGÊNCIA",
    closing_title: "5. FECHAMENTO E ESCRITURAÇÃO",
    assignment: "6. DIREITO DE CESSÃO DE DIREITOS",
    access: "7. ACESSO AO IMÓVEL",
    in_witness: "EM TESTEMUNHO DO QUE, as partes firmam o presente contrato.",
  },
  tl: {
    title_psa: "KASUNDUAN SA PAGBILI AT PAGBEBENTA NG ARI-ARIAN",
    parties: "1. MGA PARTIDO",
    seller: "NAGBEBENTA (Seller)",
    buyer: "BUMIBILI AT/O MGA ITINALAGA (Buyer)",
    property_desc: "2. PAGLALARAWAN NG ARI-ARIAN",
    purchase_price: "3. PRESYO AT KABAYARAN",
    earnest_money: "Paunang Bayad (Earnest Money)",
    waived_note: "WALANG DEPOSITO / LIBRE ($0 Down)",
    inspection: "4. PANAHON NG PAGSUSURI (Inspection)",
    closing_title: "5. PAGSASARA AT TITULO",
    assignment: "6. KARAPATANG MAGLIPAT (Assignment)",
    access: "7. KARAPATANG PUMASOK SA ARI-ARIAN",
    in_witness: "BILANG PATUNAY, nilagdaan ng mga partido ang kasunduang ito.",
  },
  vi: {
    title_psa: "HỢP ĐỒNG MUA BÁN VÀ CHUYỂN NHƯỢNG BẤT ĐỘNG SẢN",
    parties: "1. CÁC BÊN THAM GIA",
    seller: "BÊN BÁN (Seller)",
    buyer: "BÊN MUA VÀ/HOẶC BÊN ĐƯỢC CHỈ ĐỊNH",
    property_desc: "2. MÔ TẢ BẤT ĐỘNG SẢN",
    purchase_price: "3. GIÁ MUA VÀ ĐIỀU KHOẢN THANH TOÁN",
    earnest_money: "Tiền đặt cọc (Earnest Money)",
    waived_note: "0 ĐÔ LA / MIỄN TIỀN ĐẶT CỌC (Căn cứ vào cam kết song phương)",
    inspection: "4. ĐIỀU KHOẢN KIỂM ĐỊNH TÌNH TRẠNG NHÀ",
    closing_title: "5. HOÀN TẤT THỦ TỤC VÀ SỔ HỒNG/SỔ ĐỎ",
    assignment: "6. QUYỀN CHUYỂN NHƯỢNG HỢP ĐỒNG",
    access: "7. QUYỀN TIẾP CẬN BẤT ĐỘNG SẢN",
    in_witness: "ĐỂ LÀM BẰNG CHỨNG, các bên đã ký kết hợp đồng này.",
  },
  ar: {
    title_psa: "اتفاقية شراء وبيع العقارات وتنازل الحقوق",
    parties: "1. أطراف الاتفاقية",
    seller: "البائع (Seller)",
    buyer: "المشتري و/أو المتنازل لهم (Buyer)",
    property_desc: "2. وصف العقار القانوني",
    purchase_price: "3. سعر الشراء والمقابل المالي",
    earnest_money: "عربون التأمين (Earnest Money)",
    waived_note: "صفر دولار / معفى (المقابل القانوني قائم على التعهدات المتبادلة وتكاليف الفحص)",
    inspection: "4. شرط المعاينة والفحص الفني",
    closing_title: "5. الإقفال ونقل الملكية الطابو",
    assignment: "6. الحق غير المشروط في التنازل وإسناد العقد",
    access: "7. تصريح معاينة ودخول العقار",
    in_witness: "وإثباتاً لما تقدم، قام الطرفان بتوقيع هذه الاتفاقية في التاريخ المذكور أعلاه.",
  },
  it: {
    title_psa: "CONTRATTO DI COMPRAVENDITA IMMOBILIARE",
    parties: "1. PARTI CONTRAENTI",
    seller: "VENDITORE",
    buyer: "ACQUIRENTE E/O CESSIONARI",
    property_desc: "2. DESCRIZIONE DELL'IMMOBILE",
    purchase_price: "3. PREZZO DI ACQUISTO E CORRISPETTIVO",
    earnest_money: "Caparra Confirmatoria",
    waived_note: "ZERO DOLLARI / RINUNCIATA (Valido corrispettivo costituito da impegni reciproci)",
    inspection: "4. CLAUSOLA DI ISPEZIONE E FATTIBILITÀ",
    closing_title: "5. ROGITO E PASSAGGIO DI PROPRIETÀ",
    assignment: "6. DIRITTO DI CESSIONE DEL CONTRATTO",
    access: "7. ACCESSO ALL'IMMOBILE",
    in_witness: "IN FEDE DI CHE, le parti hanno sottoscritto il presente accordo.",
  },
  ko: {
    title_psa: "부동산 매매 및 권리 양도 계약서",
    parties: "1. 계약 당사자",
    seller: "매도인 (Seller)",
    buyer: "매수인 및/또는 승계인 (Buyer)",
    property_desc: "2. 부동산의 표시",
    purchase_price: "3. 매매 대금 및 계약 조건",
    earnest_money: "계약금 (Earnest Money Deposit)",
    waived_note: "0달러 / 면제 (상호 약정 및 실사 비용으로 법적 대가 성립)",
    inspection: "4. 하자 점검 및 실사 조건",
    closing_title: "5. 소유권 이전 및 잔금 정산",
    assignment: "6. 계약 양도권 (Assignment Rights)",
    access: "7. 부동산 출입 및 점검 권한",
    in_witness: "본 계약을 증명하기 위하여 당사자들은 서명 날인한다.",
  },
  ru: {
    title_psa: "ДОГОВОР КУПЛИ-ПРОДАЖИ И УСТУПКИ ПРАВ НА НЕДВИЖИМОСТЬ",
    parties: "1. СТОРОНЫ ДОГОВОРА",
    seller: "ПРОДАВЕЦ (Seller)",
    buyer: "ПОКУПАТЕЛЬ И/ИЛИ ЦЕССИОНАРИИ (Buyer)",
    property_desc: "2. ОПИСАНИЕ ОБЪЕКТА НЕДВИЖИМОСТИ",
    purchase_price: "3. СТОИМОСТЬ СДЕЛКИ И УСЛОВИЯ ОПЛАТЫ",
    earnest_money: "Задаток (Earnest Money Deposit)",
    waived_note: "0 ДОЛЛАРОВ / БЕЗ ЗАДАТКА (Правовое основание подтверждено взаимными обязательствами)",
    inspection: "4. ПЕРИОД ТЕХНИЧЕСКОЙ ЭКСПЕРТИЗЫ",
    closing_title: "5. ЗАКРЫТИЕ СДЕЛКИ И РЕГИСТРАЦИЯ ПРАВА СОБСТВЕННОСТИ",
    assignment: "6. ПРАВО УСТУПКИ ТРЕБОВАНИЯ (ЦЕССИЯ)",
    access: "7. ДОСТУП К ОБЪЕКТУ НЕДВИЖИМОСТИ",
    in_witness: "В УДОСТОВЕРЕНИЕ ЧЕГО стороны подписали настоящий договор.",
  },
};
