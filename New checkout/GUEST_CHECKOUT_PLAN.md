# Express Checkout — Implementation Plan (Guest Checkout + Checkout Redesign)

Allow shoppers to complete a purchase on the Fortis storefront without creating or signing in to a Kibo account, **and** rebuild the checkout page to match the design team's "Express Checkout" mockups (`New checkout/Fortis - Designs/`). Today, the cart-to-checkout transition forces login via [src/middleware.ts:167-179](src/middleware.ts#L167-L179) and the [CartTemplate](components/page-templates/CartTemplate/CartTemplate.tsx) `LoginDialog` gate.

This plan covers **two workstreams**:

- **A — Guest enablement (Kibo/auth side):** remove the auth gate, validate the anonymous Kibo order flow end-to-end.
- **B — Checkout UI redesign (design side):** replace the `KiboStepper` flow with the single-page accordion checkout shown in the designs.

> **Decisions locked (2026-07-09):**
>
> 1. The accordion redesign applies to **both guest and signed-in checkout** — one shared UI, no fork.
> 2. **Analytics must not regress.** All existing GTM/GA4, Algolia Insights, and page-level trackers (Microsoft Clarity, HubSpot) keep firing with equivalent semantics. See the Analytics inventory section.

## Goals

- A first-time visitor can put items in their cart, click **Checkout**, enter contact + shipping + payment on a single accordion page, place an order, and see a confirmation — without ever logging in or registering.
- A guest receives an order confirmation email containing a confirmation URL they can return to in order to view the placed order.
- Returning customers retain the option to sign in at any point ("Have an Account? Login" in the checkout header, and the "Welcome Back" login page with "Continue as a Guest").
- Signed-in customers get the same accordion UI, with contact info prefilled and saved addresses/cards available.
- Behavior is gated behind feature flags so it can be rolled back quickly (see Rollout for the two-flag strategy).
- No analytics regression: every checkout-funnel event that fires today fires after the redesign, plus a new `customerType: 'guest' | 'registered'` dimension.

## Non-goals (v1)

- Letting guests see authenticated-only data (order history, saved addresses, wishlist).
- B2B / quote / approval flows (these stay account-gated).
- Migrating an existing anonymous order onto an account that signs in mid-checkout (covered as a stretch item).
- **In-checkout account creation.** The current ReviewStep "create an account" fields ([ReviewStep.tsx:258-271](components/checkout/ReviewStep/ReviewStep.tsx#L258-L271)) are removed per the designs; account creation moves post-purchase (Phase 7, optional).
- The **"Bank" payment tab** shown in the payment mockup — **dropped entirely (decided with design, 2026-07-09)**: bank/ACH payments will not be built and are not on the roadmap. Guests pay by card only; Purchase Order stays available for signed-in B2B where it exists today. Design will remove the tab from the mockups.

> **Note on "guest accounts":** Per the [Kibo Customers overview](https://docs.kibocommerce.com/pages/customers-overview), Kibo automatically creates a **guest account** (unique ID, no username/password) whenever an order is placed without registration. So we are not silently registering shoppers — we're relying on Kibo's first-class guest-account concept. This is distinct from a **registered shopper** (username/password). We do not need to provision these accounts ourselves.

---

## Design reference — mockup → scope mapping

| Mockup                                | What it shows                                                                                                                                                    | Status vs. codebase                                                                                                                                                                                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Checkout Flow.jpg`                   | Accordion step 1: Contact Information (first name, last name, email, phone w/ country picker), Shipping + Payment locked below                                   | **New**: accordion layout; DetailsStep collects email only today, no phone field, no intl phone input dependency                                                                                                                                                                                         |
| `Checkout Flow - In Accordion*.jpg`   | Guest banner, collapsed Contact summary w/ Edit, shipping address form, shipping methods (Fortis Overnight / FedEx account / UPS account), FedEx ⓘ tooltip       | Shipping methods + FedEx/UPS account validation **already exist** ([ShippingMethod.tsx](components/checkout/ShippingMethod/ShippingMethod.tsx#L55-L104)); accordion shell + tooltip copy are new                                                                                                         |
| `Checkout Flow - error in id.jpg`     | FedEx account-number validation error state                                                                                                                      | Matches existing yup schema (9-digit); only styling/copy                                                                                                                                                                                                                                                 |
| `Checkout Flow - payment.jpg`         | Payment section: Card/Bank tabs, billing same-as-shipping, Special Instruction (order notes, 0/500), T&C checkbox, **Confirm payment** — no separate Review step | ReviewStep functionality merges into Payment section; order notes exist via `shopperNotes.comments` ([ReviewStep.tsx:274-276](components/checkout/ReviewStep/ReviewStep.tsx#L274-L276)); Bank tab **dropped** (2026-07-09 decision — see Non-goals); `PaymentType` enum stays CreditCard + PurchaseOrder |
| `Checkout Flow - order Status.jpg`    | Rich order-status page: delivery timeline, tracking #, carrier link, shipping/billing details                                                                    | An [order-status page exists](src/pages/order-status.tsx) but is account-scoped (`useGetCustomerOrders`); needs replacement + security model (Phase 6)                                                                                                                                                   |
| Order Confirmed mockup                | Confirmation page with Download Receipt / Track Order / Continue Browsing                                                                                        | Mostly matches [OrderConfirmation](components/order/OrderConfirmation/OrderConfirmation.tsx); Download Receipt is net-new (Phase 5 decision)                                                                                                                                                             |
| `Sign in for checkout*.jpg`           | "Welcome Back" full login page with "Continue as a Guest"                                                                                                        | **New page** — login is currently a modal (`LoginDialog`); no `/login` route exists                                                                                                                                                                                                                      |
| `Cart Empty*.jpg` + mini-cart mockups | Header cart dropdown (items/empty states, Login button), empty-cart page w/ category grid                                                                        | Mini-cart dropdown is **net-new** (Phase 8, separable); empty-cart page achievable via existing `cartEmptyContentSection` Builder slot ([CartTemplate.tsx:484-486](components/page-templates/CartTemplate/CartTemplate.tsx#L484-L486))                                                                   |

---

## Current state (verified)

| Concern              | Location                                                                                                                                                | Today's behavior                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route guard          | [src/middleware.ts:167-179](src/middleware.ts#L167-L179)                                                                                                | Redirects unauthenticated `/checkout/*` requests to `/cart`; `/my-account/*` to home.                                                                                                                                                                                                       |
| Cart → checkout gate | [components/page-templates/CartTemplate/CartTemplate.tsx:127-163](components/page-templates/CartTemplate/CartTemplate.tsx#L127-L163)                    | Opens `LoginDialog` if `!isAuthenticated`; re-opens it on `initiateOrder`/`initiateCheckout` failure.                                                                                                                                                                                       |
| Checkout layout      | [components/checkout/CheckoutUITemplate/CheckoutUITemplate.tsx](components/checkout/CheckoutUITemplate/CheckoutUITemplate.tsx) + `KiboStepper`          | Stepper: one step visible at a time, single global Continue button. Promo code already wired via `PromoCodeBadge` (lines 225-231).                                                                                                                                                          |
| Email capture        | [components/checkout/DetailsStep/DetailsStep.tsx](components/checkout/DetailsStep/DetailsStep.tsx)                                                      | Email only for guests; first/last name only behind the account-creation toggle; **no phone field**. Commented out of StandardShip template ([StandardShipCheckoutTemplate.tsx:217-220](components/page-templates/StandardShipCheckoutTemplate/StandardShipCheckoutTemplate.tsx#L217-L220)). |
| Shipping methods     | [components/checkout/ShippingMethod/ShippingMethod.tsx](components/checkout/ShippingMethod/ShippingMethod.tsx#L55-L104)                                 | Fortis Overnight / FedEx account / UPS account with yup validation already implemented.                                                                                                                                                                                                     |
| Payment              | [components/checkout/PaymentStep/PaymentStep.tsx](components/checkout/PaymentStep/PaymentStep.tsx)                                                      | Tabs for `CreditCard` + `PurchaseOrder` (see `PaymentType` in [lib/constants/index.ts:17](lib/constants/index.ts#L17)). No Bank/ACH.                                                                                                                                                        |
| Review / submit      | [components/checkout/ReviewStep/ReviewStep.tsx:258-309](components/checkout/ReviewStep/ReviewStep.tsx#L258-L309)                                        | T&C checkbox, optional account creation, `shopperNotes` write, `onCreateOrder` submit, Algolia purchase event. All merges into the Payment section per design.                                                                                                                              |
| Order submission     | [lib/gql/mutations/checkout/create-order-mutation.ts](lib/gql/mutations/checkout/create-order-mutation.ts)                                              | Returns order number/email/userId — `userId` will be null/anonymous for guest.                                                                                                                                                                                                              |
| Confirmation page    | [src/pages/order-confirmation.tsx](src/pages/order-confirmation.tsx), [OrderConfirmation.tsx](components/order/OrderConfirmation/OrderConfirmation.tsx) | Looks up by `checkoutId` query param; **no auth required**. Already guest-compatible.                                                                                                                                                                                                       |
| Order status         | [src/pages/order-status.tsx](src/pages/order-status.tsx) → [OrderStatusTemplate](components/page-templates/OrderStatusTemplate/OrderStatusTemplate.tsx) | **Exists** but built on account-scoped `useGetCustomerOrders`. Must be replaced/extended for guests (Phase 6).                                                                                                                                                                              |
| Login                | `LoginDialog` modal (no `/login` page)                                                                                                                  | Design requires a dedicated "Welcome Back" page with "Continue as a Guest".                                                                                                                                                                                                                 |

---

## Analytics inventory — must not regress

Every event below fires today and **must still fire, with the same GA4/Algolia semantics, after the accordion restructure**. The step components move; the events move with them. Add `customerType: 'guest' | 'registered'` to the GTM events.

### Google (GTM → GA4) — `lib/utils/google-tag-manager`

| Event                                    | Fires from                                                                                                                                    | Redesign impact                                                                                                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `begin_checkout` (`beginCheckoutGTM`)    | [CartTemplate.tsx:153](components/page-templates/CartTemplate/CartTemplate.tsx#L153)                                                          | Keep on checkout initiation; also fire from mini-cart Checkout button (Phase 8) and the login page's "Continue as a Guest" path if initiation moves there. Exactly once per initiation. |
| `add_shipping_info` + `add_ship_method`  | [StandardShippingStep.tsx:331-332](components/checkout/StandardShippingStep/StandardShippingStep.tsx#L331-L332)                               | Move to the accordion Shipping section's "Continue to Payment" confirm.                                                                                                                 |
| `add_payment_info` (`addPaymentInfoGTM`) | [StandardShipCheckoutTemplate.tsx:138](components/page-templates/StandardShipCheckoutTemplate/StandardShipCheckoutTemplate.tsx#L138)          | Now that payment entry and submission collapse into one section, fire when payment details validate (card tokenized), **before** `purchase`.                                            |
| `purchase` (`purchaseGTM`)               | [StandardShipCheckoutTemplate.tsx:188-194](components/page-templates/StandardShipCheckoutTemplate/StandardShipCheckoutTemplate.tsx#L188-L194) | Fires on successful `onCreateOrder` from the new "Confirm payment" handler. Must pass null-safe `userId` for guests.                                                                    |
| `checkoutFailure`                        | same template                                                                                                                                 | Keep on submit failure; ensure the consolidated confirm handler distinguishes tokenization vs. submit failures.                                                                         |
| Cart events (`remove_from_cart`, etc.)   | CartTemplate                                                                                                                                  | Unchanged; mini-cart (Phase 8) must reuse the same helpers.                                                                                                                             |

### Algolia Insights (`search-insights`)

| Event                                        | Fires from                                                                                                                 | Redesign impact                                                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `purchasedObjectIDsAfterSearch`              | [ReviewStep.tsx:286-309](components/checkout/ReviewStep/ReviewStep.tsx#L286-L309) (reads `queryIdArray` from localStorage) | **Moves with the submit chain** into the new Confirm payment handler. Easy to lose in the refactor — add an explicit test.     |
| `setAuthenticatedUserToken` / `getUserToken` | [FortisHeader.tsx](components/layout/FortisHeader/Common/FortisHeader.tsx)                                                 | Guests stay on the anonymous token — verify purchase events attribute correctly for guest orders (no authenticated token set). |

### Page-level trackers

- **Microsoft Clarity** and **HubSpot** are embedded site-wide in [src/pages/\_document.tsx](src/pages/_document.tsx). They keep working automatically, **but**: any Clarity funnels/segments and HubSpot reports keyed to checkout step URLs or DOM structure will break when the stepper becomes one page. Notify whoever owns those dashboards before rollout.

### Verification (part of Phase 9 exit criteria)

- GTM Preview session for each persona (guest / signed-in) × happy path: assert `begin_checkout → add_shipping_info → add_ship_method → add_payment_info → purchase` fire once each, in order, with correct payloads and `customerType`.
- Algolia Insights debugger: assert `purchasedObjectIDsAfterSearch` fires with queryIDs after a search-led purchase, for both personas.
- A failed submit fires `checkoutFailure` and does **not** fire `purchase`.

---

## Implementation phases

### Phase 0 — Discovery & prerequisites

- [x] ~~Confirm the **`customerCheckoutType` site setting** is `LoginOptional` rather than `LoginRequired`~~ — **resolved 2026-05-26**: `GET /api/commerce/settings/checkout/customercheckoutsettings` returned `customerCheckoutType: "LoginOptional"`. Kibo is not gating guest checkout; all remaining work is on the storefront side.
- [ ] **Anonymous-checkout reproducer (gating prerequisite for Phase 2).** Run `getOrCreateCheckoutFromCart` against `/api/graphql` with only an anonymous `kibo_at` cookie (no signed-in user). Captures three answers at once:

  1. Does the call succeed at all?
  2. Is a `customerAccountId` populated on the response (i.e. does Kibo create the guest account at checkout-init, not at SubmitOrder)?
  3. If it fails, is the rejection on our Next.js proxy (`src/pages/api/graphql.ts`) or from Kibo itself?

  **Working assumption pending the result:** earlier calls accept an anonymous token with a null `customerAccountId`, and Kibo backfills the guest-account id at `SubmitOrder` (per the [Customers overview](https://docs.kibocommerce.com/pages/customers-overview)). The reproducer either confirms this or tells us which branch of Phase 2 to take.

- [ ] Confirm whether the project ships **StandardShip** or **MultiShip** to production (the `isMultiShipEnabled` flag). The accordion designs show a single-destination flow; if MultiShip is live, decide whether it gets the accordion in v1 or keeps the stepper temporarily.
- [ ] **Flag strategy (two flags, decided here):**
  - `NEXT_PUBLIC_FEATURE_CHECKOUT_ACCORDION` — the new UI, for all users.
  - `NEXT_PUBLIC_FEATURE_GUEST_CHECKOUT` — the auth-gate removal.
    These roll out independently (see Phase 10). Document where they live (env var vs. Builder.io setting).
- [ ] Identify the transactional-email template Kibo uses for order confirmation and confirm it sends to the order's `email` field on guest-account orders (not just registered-shopper orders).
- [ ] **Product decisions needed before Phase 3 build:**
  - [x] ~~"Bank" payment tab~~ — **resolved 2026-07-09**: design confirmed it meant an ACH-style bank payment (bank dropdown + account-holder name + account number). After discussion, **dropped entirely — not built, not planned**. It would have required a payments-integration project (processor, Kibo gateway config, NACHA compliance, async-settlement handling that conflicts with overnight shipping). Design removes the tab from the mockups; the Card form becomes the only payment UI for guests.
  - [ ] "Download Receipt" on confirmation: print-friendly page (cheap) vs. generated PDF (new work)? **Recommendation: print stylesheet + `window.print()` for v1.**
  - [ ] Is the phone number in Contact Information required or optional? Which countries in the country-code picker? Pick the intl phone input library (none in package.json today).
  - [ ] Order-status page access model for guests (see Phase 6) — bearer URL only, or URL + lookup form?
- [ ] **Send the design QA list back to the design team** (see "Design open items" section) so placeholder math is fixed before implementation references it.

### Phase 1 — Remove the auth gate + login page

> **Ordering:** the gate-removal code itself can land at any time (behind `NEXT_PUBLIC_FEATURE_GUEST_CHECKOUT`, off by default). But **enabling the flag in any environment requires Phase 2 to be green**.

- [ ] Build the **`/login` page** ("Welcome Back" mockup): email + password, forgot password, **Continue as a Guest**, Create an account. Reuse the existing login mutation/logic from `LoginDialog`; the dialog remains for other entry points (or is retired in a follow-up).
- [ ] In [src/middleware.ts:167-179](src/middleware.ts#L167-L179): when the guest flag is **on**, stop redirecting unauthenticated `/checkout/*` to `/cart`. When **off**, redirect to `/login?returnUrl=<checkout-url>` instead of `/cart` (aligns the legacy behavior with the new page). `/my-account/*` keeps its guard unconditionally.
- [ ] In [CartTemplate.tsx:127-163](components/page-templates/CartTemplate/CartTemplate.tsx#L127-L163):
  - [ ] Flag on: **Checkout goes straight to `handleGotoCheckout()`** (frictionless guest path per the designs — sign-in is offered inside checkout via "Have an Account? Login" → `/login?returnUrl=...`). Flag off: route to `/login` instead of opening `LoginDialog`.
  - [ ] Remove the catch-block fallback that re-opens `LoginDialog` on `initiateOrder` failure; narrow it to actual auth errors and surface real errors as snackbars.
- [ ] Audit any other `<Link href="/checkout/..." />` or programmatic redirect that assumes auth (search `isAuthenticated`, `useAuthContext` near the cart/checkout flow).

### Phase 2 — Make anonymous order creation actually work

> **Depends on the Phase 0 reproducer result.** If the reproducer returns a valid checkout id with no fixes, Phase 2 collapses to just the cart-merge regression test below.

- [ ] **If the failure is on our side** (Next.js proxy at [src/pages/api/graphql.ts](src/pages/api/graphql.ts), missing auth headers, gateway middleware stripping the anonymous token): fix the proxy/headers and let Kibo's native guest-account creation handle the rest at submit time.
- [ ] **If Kibo itself rejects**: escalate to the Kibo admin — do **not** try to provision shopper accounts manually.
- [ ] **Cart-merge regression test (always required).** When a guest signs in mid-flow (via the new `/login?returnUrl` path), the existing `mergeCart` behavior should attach the anonymous cart to the newly-authenticated account without losing items — and return the user to checkout, not the home page. Verify empirically and lock in with a test.
- [ ] Guest orders must persist the contact fields from Phase 3 (first/last name, phone) onto the order (`fulfillmentContact` / order-level contact) so confirmation, email, and order-status render them.

### Phase 3 — Checkout UI restructure: the accordion (guest + signed-in)

> **The biggest workstream.** Replaces the `KiboStepper` flow in [CheckoutUITemplate](components/checkout/CheckoutUITemplate/CheckoutUITemplate.tsx) with the designs' single-page accordion. Behind `NEXT_PUBLIC_FEATURE_CHECKOUT_ACCORDION`; the stepper stays in the codebase until the flag is removed (Phase 10).

**Accordion shell**

- [ ] Rework the checkout step context (`useCheckoutStepContext`) into section states: `locked` (grayed header), `active` (expanded form + section CTA), `complete` (collapsed summary + **Edit** link). Sections: Contact Information → Shipping Information → Payment Information.
- [ ] Per-section CTAs replace the stepper's global Continue: **Confirm Information**, **Continue to Payment**, **Confirm payment**. Editing a completed section re-collapses the later ones or marks them stale — define and test this state machine explicitly.
- [ ] Keep the Cart Overview sidebar (order summary, per-item ship-date badges, promo code via the existing `PromoCodeBadge`) visible throughout, per designs.
- [ ] Guest banner ("Guest Checkout: Credit card, no account needed…") shown only when unauthenticated; "Have an Account? Login" header link → `/login?returnUrl=...`.

**Contact Information section** (evolves [DetailsStep](components/checkout/DetailsStep/DetailsStep.tsx))

- [ ] Fields per design: First Name, Last Name, Email, Phone with international country-code picker (new dependency — Phase 0 decision). One yup schema shared by guest and signed-in flows.
- [ ] Persist via `setPersonalInfo` (email) + order contact for name/phone (Phase 2 item).
- [ ] Signed-in: prefill from `useGetCurrentCustomer` and render the section pre-completed (collapsed with Edit), matching the "confirmed contact" mockup state.
- [ ] Remove the in-checkout account-creation fields (`showAccountFields`, password) — out of scope for v1 per designs.

**Shipping Information section** (evolves [StandardShippingStep](components/checkout/StandardShippingStep/StandardShippingStep.tsx))

- [ ] Address form (Street 1/2, City, State, Country, Zip) + existing shipping methods. FedEx/UPS account logic is already implemented — do not rewrite; restyle.
- [ ] Add the ⓘ "Where to find" expandable helper for FedEx/UPS account numbers (copy in mockups).
- [ ] Signed-in: saved-address picker; guests: plain form (confirm `customerContact` queries return empty gracefully for guests).

**Payment Information section** (merges [PaymentStep](components/checkout/PaymentStep/PaymentStep.tsx) + [ReviewStep](components/checkout/ReviewStep/ReviewStep.tsx))

- [ ] Card form (number, cardholder, expiration, CVC). No Bank tab (dropped — see Phase 0). Guests: Card only; Purchase Order remains for signed-in users where currently offered. If only one method is available, render the form without a tab bar.
- [ ] Billing Information with "Same as Shipping" checkbox (default checked, per design).
- [ ] Special Instruction / Order Notes (500-char counter) → existing `shopperNotes.comments` write.
- [ ] T&C checkbox gating the submit button (client-side, relocated from ReviewStep).
- [ ] "Your payment is processed securely…" reassurance strip.
- [ ] **Consolidated Confirm-payment handler** — one click now runs the full chain: tokenize card → attach payment action → write `shopperNotes` → `onCreateOrder` submit → analytics (see inventory) → route to confirmation. Requirements:
  - [ ] Distinct, user-readable errors for tokenization failure vs. declined payment vs. submit failure (no silent `console.log` like today's [ReviewStep.tsx:282-284](components/checkout/ReviewStep/ReviewStep.tsx#L282-L284)).
  - [ ] Double-submit protection (the stepper's global disabled-button logic must be reimplemented on this button).
  - [ ] Saved-cards tab hidden for guests; default to new-card form.
- [ ] MultiShip: apply the same treatment to [MultiShipCheckoutTemplate](components/page-templates/MultiShipCheckoutTemplate/MultiShipCheckoutTemplate.tsx) **if** Phase 0 confirms MultiShip is live; otherwise leave it on the stepper and note the debt.

### Phase 4 — Analytics preservation & additions

> Do this **inside** Phase 3's PRs, not after — events move with the components. This phase is the checklist + verification.

- [ ] Relocate every event in the Analytics inventory to its new trigger point (table above says where each one goes).
- [ ] Add `customerType: 'guest' | 'registered'` to `beginCheckoutGTM`, `addShippingInfoGTM`, `addShipMethodGTM`, `addPaymentInfoGTM`, `purchaseGTM`, `checkoutFailure`. Coordinate the dimension name with the analytics owner.
- [ ] `purchaseGTM` and the Algolia purchase event must handle `userId` null/anonymous safely.
- [ ] Add a server-side log line at order submit recording `{ orderId, customerType }` so guest-vs-registered conversion is monitorable without GA.
- [ ] Notify Clarity/HubSpot dashboard owners that checkout becomes a single URL (funnels keyed to step URLs/DOM will need rebuilding).
- [ ] Run the verification protocol (GTM Preview + Algolia debugger, both personas) — exit criterion for enabling the accordion flag anywhere.

### Phase 5 — Order confirmation & receipt

> **Security model — explicit decision (unchanged).** The confirmation page is accessible to anyone with the `checkoutId` (no auth check in `getServerSideProps`). For v1 we **adopt this URL-as-bearer-token model** (same pattern as Stripe/Shopify receipts). This means: (a) `checkoutId` must remain a high-entropy server-generated id — never expose it in analytics URLs or referer headers; (b) the confirmation page must send `Cache-Control: no-store`; (c) the Phase 6 page is the supported re-find path for guests who lose the URL.

- [ ] Confirm [src/pages/order-confirmation.tsx](src/pages/order-confirmation.tsx) still loads for an anonymous order returned from `getCheckout(checkoutId)`.
- [ ] Set `Cache-Control: no-store` (and `Referrer-Policy: same-origin` if not already global) on the confirmation response.
- [ ] Verify the Kibo-side transactional email actually sends to the guest's email. **Do not** send confirmation email from the storefront as a fallback.
- [ ] Align the page with the "Order Confirmed!" mockup: order number + email callout, estimated delivery, shipping/contact/billing cards, order items, order summary, "What's Next?" panel.
- [ ] **Download Receipt** button per Phase 0 decision (print stylesheet recommended for v1).
- [ ] **Track Order** button → Phase 6 page (hide until Phase 6 ships if it lands later).
- [ ] Add a "Save this URL to view your order" hint for guests.

### Phase 6 — Guest order status / tracking page

> The designs make this part of the flow (linked from confirmation), not an optional fast-follow — and a rich page (delivery timeline, tracking number, carrier link, shipping + billing details), not a bare lookup. **It shows PII, so its access model inherits the Phase 5 security decision and its hardening.**

- [ ] **Replace** the existing account-scoped [order-status page](src/pages/order-status.tsx) (`useGetCustomerOrders`-based) with the designed template. Audit existing links to it (footer, my-account) before removing the old behavior.
- [ ] Access model (Phase 0 decision): bearer URL (`checkoutId`/order token) from the confirmation page + email link, **plus** a lookup form (order number + email, server-side validated, rate-limited) for guests who lost the URL. The mockup omits the lookup form — request that state from design.
- [ ] `Cache-Control: no-store` on this page too; rate-limit the lookup endpoint to deter enumeration.
- [ ] Delivery timeline (Order Placed → Processing → Handed to delivery partner → Shipped → Delivered) mapped from Kibo order/fulfillment status; tracking number + carrier link from fulfillment info. Verify which of these states Kibo actually emits for Fortis's fulfillment setup before promising all five.
- [ ] Link from the global footer and the confirmation page.
- [ ] Out of scope: surfacing it inside `/my-account` (stays auth-gated).

### Phase 7 — Optional: post-purchase account creation

> **In/out for v1 — scoping call needed.** The confirmation mockup does **not** include this panel, so if product wants it in v1, a design is missing — request it. Include in v1 _only_ if the Phase 0 reproducer also confirms the guest-to-registered linkage works in a sandbox; otherwise punt to v1.1.

- [ ] On the confirmation page, when the order is owned by a guest account, show an inline "Create an account to track this order" panel with email pre-filled and a password field.
- [ ] Handle the email-uniqueness rule (unlimited guest accounts per email, but only **one** registered shopper): if the email already maps to a registered shopper, surface "An account with this email already exists — sign in to link this order" and route to `/login`.
- [ ] On successful registration, link the just-placed order via [`addLoginToExistingCustomer`](https://docs.kibocommerce.com/api-reference/customeraccount/add-login-to-existing-customer.md) — attach credentials to the existing guest customer record rather than create a new account. Verify in a sandbox that this preserves `customerAccountId` and does not re-submit payment.

### Phase 8 — Mini-cart dropdown & empty-cart page (separable)

> Net-new header UI from the designs, tangential to guest checkout. Can ship before, with, or after the checkout work — treat as its own ticket if timeline is tight.

- [ ] Header cart dropdown: item list (name, qty, price), subtotal, **Checkout** button (fires `beginCheckoutGTM` and the same `handleGotoCheckout` path as the cart page).
- [ ] Empty state: "Your cart is empty" + Browse Our Categories links; unauthenticated variant adds the **Login** button (per the two mockups).
- [ ] Empty-cart **page** ("Your Shopping Cart Is Empty" + category grid): build as Builder.io content in the existing `cartEmptyContentSection` slot — no code expected.

### Phase 9 — Testing

- [ ] **Unit/integration**
  - [ ] Middleware: `/checkout/*` passes anonymously with guest flag on; redirects to `/login?returnUrl` with flag off; `/my-account` always guarded.
  - [ ] Accordion state machine: section lock/unlock/edit transitions, including editing an earlier section after completing later ones.
  - [ ] Contact section validates first/last/email/phone for guest and signed-in.
  - [ ] Consolidated confirm handler: tokenization failure, declined payment, and submit failure each surface distinct errors and never double-submit.
  - [ ] `initiateOrder` succeeds with anonymous session (mock at the GraphQL layer); `useUpdateOrderPersonalInfo` accepts a guest order.
  - [ ] **Analytics unit tests**: each GTM helper called once with `customerType` on the happy path; Algolia purchase event called with queryIDs (this is the event most likely to be dropped in the refactor).
- [ ] **E2E** — full happy paths:
  - [ ] Guest places an order (accordion).
  - [ ] Signed-in user places an order (accordion) — prefilled contact, saved addresses/cards.
  - [ ] Guest signs in mid-checkout via `/login?returnUrl` — cart merges, user returns to checkout.
  - [ ] FedEx/UPS account-number paths incl. the invalid-account error state.
  - [ ] Stepper still works with the accordion flag off (regression until flag removal).
- [ ] **Analytics QA** — the Phase 4 verification protocol, in a staging environment with real GTM/Algolia containers.
- [ ] **Manual QA matrix** — desktop + mobile, Safari + Chrome, with/without ad-blockers, coupon applied, multi-line-item cart, digital-only cart. (Accordion designs are desktop-only — request mobile mockups or agree responsive behavior with design.)
- [ ] **Email QA** — guest confirmation email lands in Gmail, Outlook, Apple Mail; confirmation URL works from the email.

### Phase 10 — Rollout

Two flags, sequenced independently:

1. **Accordion UI** (`NEXT_PUBLIC_FEATURE_CHECKOUT_ACCORDION`) — affects all users, so it carries the regression risk for existing signed-in revenue. Enable in dev/staging → run QA + analytics verification → soft-launch % → 100%. Monitor signed-in conversion and `checkoutFailure` rate against the pre-launch baseline; capture that baseline **before** enabling anywhere.
2. **Guest checkout** (`NEXT_PUBLIC_FEATURE_GUEST_CHECKOUT`) — enable after (or together with) the accordion per product's call; requires Phase 2 green. Monitor `customerType: 'guest'` conversion, `initiateOrder`/`createOrder` error rates, and support tickets containing "guest" or "couldn't place order".

- [ ] Ramp each to 100% once metrics look healthy for a defined window (suggest 1 week each).
- [ ] Remove both flags, the `KiboStepper` checkout path, and `ReviewStep` after one full release cycle at 100%.

---

## Risks & open questions

- **Signed-in checkout regression is now the top revenue risk.** The accordion replaces the UI for _paying customers who already convert today_. Mitigations: flag-gated rollout with baseline metrics, stepper kept until flag removal, E2E regression on the signed-in path.
- **Analytics regression.** The purchase-event chain is being relocated wholesale; the Algolia `purchasedObjectIDsAfterSearch` event (buried in ReviewStep with localStorage state) is the most likely casualty. Mitigation: Phase 4 inventory + unit tests + GTM/Algolia verification as an explicit flag-flip exit criterion.
- **Kibo guest-account creation timing isn't documented — only inferred.** Working assumption: created at `SubmitOrder`. Phase 0 must verify empirically. If wrong, Phase 2 expands.
- **Consolidated submit chain has more failure modes.** Tokenize + attach payment + notes + submit now happen on one click. Partial-failure states (payment attached but submit failed) need defined recovery UX.
- **Order-status page shows PII behind a bearer URL.** The Phase 5 security model now covers a page with full billing details. Rate-limiting + `no-store` + high-entropy ids are mandatory; get a security review sign-off on Phase 6 before launch.
- **Email uniqueness asymmetry** (unlimited guest accounts per email, one registered) — affects Phase 7's collision UX.
- **Guest → registered promotion path is plausible but unverified** (`addLoginToExistingCustomer`) — sandbox spike before committing Phase 7 to v1.
- **Cart merge on mid-flow sign-in** — easy to regress; needs explicit test coverage; return-to-checkout after login is new behavior.
- **Fraud / abuse** — guest checkout is a common card-testing vector. Coordinate with whoever owns fraud rules before 100%.
- **Marketing-opt-in default** — off by default for GDPR/CCPA unless legal says otherwise.
- **B2B / restricted-product flows** — if any SKUs require an approved account, the guest path must block them or surface "sign in to purchase." Audit before launch.
- **MultiShip parity** — if MultiShip is live, accordion parity is extra scope; if deferred, we temporarily run two checkout UIs (the thing we're trying to avoid).
- **No mobile mockups for the accordion** — request from design before build; the sidebar/summary placement on small screens is non-obvious.

## Design open items (send back to the design team)

Placeholder-data errors in the mockups that will mislead implementation if not fixed:

1. **Order Summary math** (confirmation + order status): Subtotal $0.00, promo code as a **positive** +$9.99 line, Total $448.00. Promo must render as a negative discount line everywhere (checkout sidebar correctly shows −$50).
2. Mini-cart: 3 × $120 items shown with $448.00 subtotal; checkout sidebar quantities ("1 x 2") don't reconcile with the $360/$310 totals.
3. Confirmation "sent to **jane@institution.edu**" vs. contact johnDoe123@email.com.
4. Order status shows a **USPS** tracking link; the only methods are Fortis Overnight / FedEx / UPS.
5. Date conflicts: shipped May 28, expected June 3, line item "Ships June 11"; "Estimated Delivery Jun 22–24" paired with "Fortis **Overnight** Shipping."
6. In the payment mockup the −$50 promo line moves under item 1 instead of the summary block — confirm intended placement.
7. **Remove the Bank tab from the payment mockups** — bank/ACH payments were dropped entirely (decided 2026-07-09). The Card form becomes the only payment UI for guests; without a second method the Card/Bank tab bar itself should go.
8. Missing states to request: mobile layouts; order-status lookup form (for guests without the URL); Phase 7 post-purchase account panel (if in scope); accordion error/stale states when editing an earlier section.

## Out of scope (explicit)

- Order history page for guests.
- Saved addresses / saved payment methods for guests.
- Subscription / recurring-order purchase as a guest.
- In-checkout account creation (removed; post-purchase panel is Phase 7, optional).
- Bank/ACH payments — dropped entirely (2026-07-09), not on any roadmap.
