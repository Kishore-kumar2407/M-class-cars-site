# M Class Cars showroom website: reference audit and implementation brief

**Reference audited:** [getmycars.ai](https://getmycars.ai/)  
**Audit date:** 14 October 2026  
**Scope:** Public browser-visible pages and controls. The site is dynamic; the notes below distinguish observed behavior from unverified behavior.

## Executive summary

GetMyCars is presented as a two-sided used-car marketplace. Its visible structure links a buyer discovery flow (`/buy`), seller entry that requires login, public company/contact pages, and three policy pages. The homepage also combines a natural-language seller price prompt with latest-car cards and a separate buyer search prompt. Inventory cards offer sharing, liking, assistant chat, offers, and seller contact; only the contact action was represented as a direct phone link in the accessible page view.

For M Class Cars, adapt the useful showroom patterns—searchable inventory, clear vehicle cards, detailed vehicle pages, prominent enquiry/call/WhatsApp actions, trust information, and simple seller intake—into a dealer-owned site. Use original M Class Cars branding, photography, copy, and workflows. Avoid claiming AI inspection, verified status, financing, warranty, or other services unless the showroom actually provides them.

## Reference site map and connections

```text
Home /
├── Buyer search → /buy
├── Latest Cars → cards (vehicle detail destination not exposed in page accessibility view)
│   ├── Share (button)
│   ├── Like (button; account behavior not confirmed)
│   ├── Chat with DA (button; destination/behavior not confirmed)
│   ├── Make Offer (button; destination/behavior not confirmed)
│   └── Contact Seller → tel:7540000100
├── Sell your car easily / bottom Sell → /login
├── Footer: About Us → /about
├── Footer: Contact Us → /contact
├── Footer: Buy Used Car / Car Listing → /buy
├── Footer: Sell Your Car → /sell/pricing (direct visit redirected to /; unverified)
└── Footer: Terms / Privacy / Refund → policy pages

/buy
├── Search cars (text field + voice-search button)
├── Special collections (verified dealer, budget friendly, luxury, first owner)
├── Budget shortcuts
├── Popular brand shortcuts
└── Listing area (cards did not appear in the captured buyer-page accessibility view)

/login
└── Mobile number +91 → Get OTP → later steps not tested
    ├── Terms & Conditions
    ├── Privacy Policy
    ├── Refund Policy
    └── Contact
```

The reference page also has a bottom navigation bar: Home, Explore, Sell, Activity, Profile. Explore opened `/buy`; Sell opened `/login`. Activity and Profile destinations were not tested. A location selector was present on the homepage header; its options and effect were not tested.

## Page and interaction audit

### Home — [https://getmycars.ai/](https://getmycars.ai/)

- Header branding and location selector; an additional unlabeled icon button was present.
- Seller section: headline “Get instant price & sell your car fast,” free-text vehicle-details field, voice-input control, **Get Instant Price**, and **Sell your car easily**.
- Seller-benefit claims: verified buyers/no middlemen; RC transfer, NOC and document support; assistance with calls, negotiation and test drives.
- Buyer section: search prompt, text field, voice search in English, **Search cars** button, and reassurance copy about matching alerts/no spam.
- Latest Cars: paginated feed showing 10 cards on page 1 of 7 and **View all / Explore All Cars** navigation. Visible sample inventory included Skoda Kushaq (featured), Hyundai i20, Maruti Swift Dzire, Nissan Micra, Tata Bolt, Hyundai Santro, Maruti Suzuki 800, Tata Punch, Hyundai i10 and Volkswagen Vento. Card text exposed year, model, odometer, fuel, owner count, listing date, price, EMI estimate, and seller verification badge.
- Per-card controls visible: Share, Like, Chat with DA, Make Offer, Contact Seller (telephone link). Card-to-detail navigation itself was not exposed by the page's accessibility tree.
- Footer: company description, support email and phone, Tamil Nadu location, company/discover/legal link groups, copyright/disclaimer.

### Buyer browse — [https://getmycars.ai/buy](https://getmycars.ai/buy)

- Heading “Browse Cars,” supporting copy, search field, voice-search button, Search button.
- **Special Collections:** Verified Dealer Cars (41), Budget Friendly under ₹5 lakh (41), Luxury Cars above ₹20 lakh (0), First Owner Cars (27).
- **Browse by Budget:** Under ₹3 lakh (24), ₹3–5 lakh (17), ₹5–8 lakh (19), ₹8–12 lakh (4), above ₹12 lakh (1).
- **Popular Brands:** Hyundai (18), Maruti Suzuki (12), Renault (7), Mahindra (5), Tata (4), Volkswagen (4), Chevrolet (3), Ford (3).
- These collection/budget/brand controls were visible as buttons, but I did not verify the filtered result state. The listings/loading content did not expose cards after the categories in the browser accessibility view, so the browse-to-detail/filter-result flow is not confirmed.

### About — [https://getmycars.ai/about](https://getmycars.ai/about)

- Explains the platform is a technology marketplace rather than a dealership.
- Describes AI vehicle analysis, confidence reports, seller capture flow, featured listing boosts, Deal Assistant, trust/verification.
- “How It Works,” mission, FAQ, and disclaimer sections. Claims include AI condition guidance, number-plate masking, RC verification, and coordinated buyer/seller interactions. These are reference-site claims, not endorsements or recommendations for M Class Cars.
- Terms link appears in disclaimer.

### Contact — [https://getmycars.ai/contact](https://getmycars.ai/contact)

- Support phone (`tel:+917540000100`), email (`mailto:support@getmycars.ai`), support hours, named grievance officer, and a “How We Can Help” list.
- No contact submission form was visible in the captured page. Contact links are direct phone/email actions.

### Login — [https://getmycars.ai/login](https://getmycars.ai/login)

- Mobile number input with +91 prefix and **Get OTP** button; terms/privacy consent text and policy/contact links.
- No number was entered and no OTP was requested. Authenticated flow is therefore unverified.
- Sell and Profile/Activity may require login, but only Sell was observed to route to login.

### Legal/help pages

- [Terms & Conditions](https://getmycars.ai/terms-conditions): platform nature, account/user obligations, media permissions, AI limitations, platform responsibility, payments, inspection/assistant services, misuse, IP, liability, account termination, grievance and jurisdiction. The visible section numbering had gaps (14 absent).
- [Privacy Policy](https://getmycars.ai/privacy-policy): collected account, vehicle, media, AI, engagement, payment and device data; processing/use/sharing/retention/rights/cookies; grievance and contact. Visible section numbering had gaps (8 absent).
- [Refund & Cancellation Policy](https://getmycars.ai/refund-policy): applicable only to platform-service charges, eligible/non-eligible refund cases, processing timeline, listing cancellation and refund request channels.

## What was blocked, dynamic, or not verifiable

- The site briefly displayed a startup loading screen on navigation; most public pages then became readable after loading.
- Direct navigation to `/sell/pricing` redirected to `/`, so the seller pricing/listing form was not accessible through that route during the audit.
- Tapping Sell opened the OTP login page. No login or OTP was attempted.
- Browse page showed data-backed collection counts and brand counts, but listing results were not visible in its captured accessibility view. Filter outcomes, pagination on `/buy`, and individual vehicle-detail URL patterns remain unverified.
- Card actions Share, Like, Chat with DA, Make Offer, voice input, homepage **Get Instant Price**, location selection, Activity/Profile, and the OTP continuation were not executed; their outcomes are unknown.
- No CAPTCHA, error, or explicit access denial appeared during the reviewed public pages. This is a browser-visible audit, not an inspection of private APIs or authenticated content.

## Recommended M Class Cars site map

```text
Home /
├── Browse Cars /cars
│   ├── Filtered inventory /cars?make=&model=&price=&year=&fuel=&transmission=&location=
│   └── Vehicle detail /cars/{slug-or-id}
│       ├── Gallery + specifications + condition/disclosure notes
│       ├── Call / WhatsApp enquiry
│       └── Test-drive/request-enquiry form
├── Sell or trade-in /sell
│   └── Seller enquiry form (vehicle + contact + preferred callback)
├── About the showroom /about
├── Visit us /contact (map, hours, phone, directions)
└── Footer: Privacy, Terms, contact details, social links
```

## Implementation brief

### 1. Positioning and audience

Build a mobile-first dealership website for **M Class Cars**, serving **Marudhalam, Ranipet**. Its main purpose is to help local visitors browse available cars and quickly contact the showroom. Secondary purpose: collect seller/trade-in enquiries and drive showroom visits. Confirm exact address, business hours, phone/WhatsApp number, service area, and any financing/inspection/warranty promises with the showroom before publishing.

### 2. Home page

- Original M Class Cars logo/wordmark and consistent showroom colors/type.
- Hero message focused on available pre-owned cars in Ranipet, with two clear actions: **Browse Cars** and **Call/WhatsApp**.
- Search or shortcut controls for budget, body style, make, and fuel; never imply filters work unless wired to inventory.
- Featured/latest inventory cards with photo, make/model/variant, year, kilometres, fuel/transmission, ownership if verified, asking price, and **View Details**.
- Short trust section using only verifiable facts: document checks performed, test-drive availability, support offered, or purchase process.
- Local showroom section with address, map/directions, hours, and phone.
- Seller CTA (“Sell or exchange your car”) linking to `/sell`.

### 3. Browse and vehicle detail

- `/cars`: searchable inventory with filters for make/model, price range, year, kilometres, fuel, transmission, body type, and availability. Show result count, clear active filters, reset, sort, and useful empty state.
- Vehicle cards should lead to a stable shareable detail URL. Make contact actions specific to that vehicle.
- `/cars/{slug-or-id}`: photo gallery, key facts, complete specs, price, condition/disclosure section, location, enquiry CTA, call/WhatsApp CTA, and related cars. Label unknown or unverified information instead of filling it in.
- Track listing status so sold cars are removed or clearly marked unavailable. Add no fake pagination/counts.

### 4. Seller enquiry

- `/sell`: simple form for make/model/year, kilometres, condition, location, name and phone, plus consent to be contacted. Provide photo upload only if the business can receive and manage images securely.
- State what happens after submission and show a confirmation. Send submissions to a configured showroom inbox/CRM; protect the endpoint against spam. Provide a direct call/WhatsApp fallback.
- Do not promise instant valuations unless there is a real pricing process. A safer original CTA is “Request an evaluation.”

### 5. Contact, trust, and policies

- `/contact`: verified address in Marudhalam, Ranipet, map/directions, opening hours, phone, WhatsApp, email if available, and a short enquiry form if supported.
- `/about`: concise showroom history and sales process; avoid copying the reference platform's marketplace/AI wording.
- Footer includes About, Browse Cars, Sell/Exchange, Contact, Privacy and Terms, plus copyright and showroom contact details.
- Publish legally reviewed privacy/terms text appropriate to the actual data collected and local business. Do not copy the reference site's legal text.

### 6. Navigation and page connections

Use a persistent mobile header with logo, Browse, Sell/Exchange, and Contact; on desktop expand to the same top-level links. Each inventory card routes to its vehicle page; every detail page offers a vehicle-specific contact action. Home search and category shortcuts feed `/cars` filters. Footer links mirror all public pages. Keep browsing and contact access available without forcing account creation.

### 7. Content and operations needed before launch

- Logo and brand palette; approved showroom photos.
- Exact map pin/address, business hours, phone/WhatsApp and email.
- Initial stock list, photos, asking prices, specs, availability, and approved disclosures.
- Seller enquiry recipient and response owner.
- Confirmed policies and any claims about finance, warranty, inspection, ownership/document checks, delivery, or exchange.

## Evidence links

The following are direct public reference pages inspected in the browser: [Home](https://getmycars.ai/), [Browse Cars](https://getmycars.ai/buy), [About](https://getmycars.ai/about), [Contact](https://getmycars.ai/contact), [Login](https://getmycars.ai/login), [Terms](https://getmycars.ai/terms-conditions), [Privacy](https://getmycars.ai/privacy-policy), [Refund Policy](https://getmycars.ai/refund-policy), and the observed redirecting [Sell pricing route](https://getmycars.ai/sell/pricing).

## Second-pass additions: vehicle detail page

A vehicle card is clickable and opens a detail URL. The Skoda Kushaq sample opened [`/car/20d5e475-b457-4c2f-856e-4e01573a2776`](https://getmycars.ai/car/20d5e475-b457-4c2f-856e-4e01573a2776), confirming a stable-looking `/car/{id}` route pattern (one observed example only).

The detail page includes:

- **Header actions:** wishlist and share.
- **Photo gallery:** categorized exterior, interior, tyre, and scratch/damage photos, previous/next controls, category counts, and thumbnail navigation. A displayed “AI Inspected” tag is present.
- **Condition analysis:** separate AI analysis sections for exterior, interior, tyres, and scratches/damage, with observations.
- **Vehicle summary:** model/variant, year, kilometres, fuel, ownership, transmission, masked plate, location, price, seller verification badge, and direct seller call link.
- **Finance and conversion:** EMI estimate with lender-eligibility button, **Make an Offer to Connect**, **Book This Car**, and **Contact Seller**. The actions beyond telephone were not submitted, so their next steps are unverified.
- **Features/specs modal:** “Explore Features & Specs” opens a dialog with Features and Specs tabs, a search field, category buttons (e.g. Safety, Engine, Transmission, Fuel & Performance, Dimensions & Weight), and categorized data.
- **Premium media and reports:** engine-performance section with report button and AI diagnostic summary; music-system video section with analysis; document availability (e.g. RC/insurance); additional feature highlights and confidence-oriented content. Purchase/paywall steps were not tested.
- **Deal Assistant section:** summarizes negotiation, seller coordination, test-drive scheduling, document verification, and deal support; includes WhatsApp chat link and telephone seller contact.

This fills in the key card-to-detail connection missing from the first pass. The exact buyer search/filter outcomes, next steps for offers/booking/eligibility, and account-gated actions remain unverified.

## Additional verified buyer behavior (second pass)

- Clicking the homepage **Get Instant Price** button with an empty seller prompt does not proceed; it displays a validation notice asking for car details, with an example format (year, make/model, fuel, kilometres). No seller data was entered.
- Clicking the **Under ₹3 Lakh** browse shortcut changed the URL to `/buy?search=under+3+lakh`, filled the search field with that phrase, and displayed matching vehicle cards with year, make/model, kilometres, fuel, city, owner count, price, EMI estimate, seller badge, Chat with DA, Make Offer, and seller phone link. This confirms the budget buttons act as prefilled text searches, not a separate advanced-filter drawer.
- Search-result pagination was present (three pages for that query). Exact result counts can change over time; category counts seen during separate visits differed, so the site data is dynamic.

## Logged-in seller flow observed in the user's Chrome session

The active Chrome GetMyCars tab exposed `/sell/pricing` with a five-stage progress indicator: **Car Details → Condition → Photos → Documents → Your Info**. The page was at an AI valuation result screen with the car summary and a value range. It then asked “How do you want to sell?” and offered **Sell Fast** (lower end of the displayed estimate), **Get Best Price** (upper end), or **Set Your Own Price**. Steps 2–5 were disabled at this point. I did not choose a pricing option or advance the flow, because that would express a sale preference in the user's active session. Therefore the exact fields and upload requirements within Condition, Photos, Documents, and Your Info are still unverified.
