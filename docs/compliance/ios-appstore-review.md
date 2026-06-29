# Stoic Piggy (Kid App) — iOS App Store Remediation Report

**Binary under review:** `apps/stoicpiggy` (the native kid app). iOS-first; Android items deferred to a follow-up section.

**Overall:** The app's *architecture* is clean for a kids' fintech-education app — no ad/analytics/tracker SDKs (only first-party `expo-observe`), the AI coach runs fully on-device (`react-native-executorch`, Qwen3 0.6B, no data egress), and the Prisma cascade graph already supports full data erasure. The blockers are almost entirely **missing disclosure artifacts and missing entry-point UI**, not bad data handling. Most fixes are App Store Connect config + a few new files, not a re-architecture.

---

## 0. Implementation status (this branch)

Built and verified (typecheck ✓, lint ✓, unit tests ✓ — backend 94/94, parents 24, landing 5, mobile pass; one pre-existing unrelated `Goals.test` jest-transform failure):

| Done | Where |
|------|-------|
| ✅ Kid-app **Settings screen** (gear in Home header → modal) | `apps/stoicpiggy/app/settings.tsx`, `_layout.tsx`, `components/screens/Home.tsx` |
| ✅ In-app **Privacy + Terms links**, **Contact/Report**, **Sign out**, **Delete account** | `app/settings.tsx`, `lib/links.ts` |
| ✅ **Account deletion** — `parent.delete` (cascade) + kid-side `requestAccountDeletion` (emails parent) | `apps/backend` auth.service/app.router/mail.service, `packages/api` hooks |
| ✅ **Parent-web "Delete my account"** danger zone (the 5.1.1(v) creation-surface path) | `apps/parents/components/SettingsView.tsx` |
| ✅ **Coach AI disclosure + "Report" affordance** (always visible) | `apps/stoicpiggy/components/screens/Coach.tsx`, `app/index.tsx`, `lib/content.ts` |
| ✅ **Privacy Policy + Terms pages** (COPPA/GDPR-K, under-13) hosted on landing + footer links | `apps/landing/app/privacy`, `/terms`, `components/LegalPage.tsx`, `lib/legal.ts` |
| ✅ **Parent sign-up consent** line (COPPA consent vector) | `apps/parents/components/form/AuthForms.tsx` |
| ✅ **iOS privacy manifest** (`NSPrivacyTracking=false` + required-reason APIs) via app.json | `apps/stoicpiggy/app.json` |
| ✅ Schema sub-processor comment fixed (Neon, not Supabase) | `apps/backend/prisma/schema.prisma` |

**Still needs you (cannot be done from code):**
1. Fill the `[BRACKETED]` placeholders in `apps/landing/lib/legal.ts` (legal entity, address, jurisdiction, effective date) and the real domain/emails in `apps/{stoicpiggy,parents}/lib/links.ts` (currently `stoicpiggy.app` / `support@` / `privacy@`).
2. **App Store Connect**: complete the age-rating questionnaire (4+, not Kids Category), fill the App Privacy nutrition label per §5, set Tracking = None, set Support URL + Privacy Policy URL (`https://<domain>/privacy`), confirm the EULA.
3. Verify outbound email from the app domain (Resend) so deletion-request + verification mails deliver.

---

## 1. Executive summary — what gets this rejected today

- **No Privacy Policy URL.** Mandatory App Store Connect metadata field (5.1.1(i)); for a children's app it must be COPPA/GDPR-K aware. There are **zero** legal docs anywhere in the repo. Hard blocker, web-hostable in hours.
- **Age-rating questionnaire never completed.** `eas.json` carries only `ascAppId`; the App Store Connect age-rating + App Privacy "nutrition label" are unfilled. Cannot submit without them. Pure ASC config, minutes of work.
- **No account-deletion path on the account-creation surface.** Apple 5.1.1(v) is triggered by account *creation* — which happens in the **parents web app** (`registerParent` / `createChild`), not the kid app. There is no `parent.delete` / `deleteAccount` mutation anywhere; the only delete is `children.delete` (parent-deletes-child admin, no UI). High-risk blocker — but the obligation lands on the parent web app, with at most a thin pointer in the kid app (see §4 correction).
- **The kid app has no Settings/About screen at all.** Only 4 routes (`index`, `task-history`, `mission-history`, `goal-new`) + a 5-tab bar. There is *literally nowhere* to surface a Privacy/Terms link or any deletion affordance. This is the structural gap that blocks several of the above at once.
- **Child-facing generative AI with no report path or AI disclosure.** A 7–14 y/o types free text into the coach and an on-device LLM replies verbatim; the only safeguard is a system-prompt line, and there's no "report a concern" affordance, no AI disclosure, and no published support contact. Not a full UGC stack (content is family-scoped, not user-to-user) — but reviewers actively flag child-facing GenAI lacking any safety/reporting path. High, not blocker.

---

## 2. Review blockers (iOS)

| # | Issue | Guideline | Status | What Apple requires | Effort |
|---|-------|-----------|--------|---------------------|--------|
| 1 | **Privacy Policy URL missing** (no legal docs in repo) | 5.1.1(i); 5.1.4 | Missing — **blocker** | A publicly reachable Privacy Policy URL in ASC metadata, COPPA/GDPR-K aware, listing data collected + sub-processors. Must also be linkable in-app. | M (write) + S (host) |
| 2 | **Age rating + App Privacy label not completed** | 1.3; 5.1.1; ASC App Privacy | Missing — **blocker** | Complete the age-rating questionnaire (expect 4+) and the App Privacy nutrition label; Tracking = OFF. No code. | S |
| 3 | **No account-deletion path** (no `parent.delete`/`deleteAccount`; only admin `children.delete`) | 5.1.1(v) | Missing — **high-risk blocker** | A self-serve "delete my account" path on the **account-creation surface (parents web)** → `prisma.parent.delete` (cascade handles the rest). Logout is explicitly not deletion. Kid app needs at most a reachable in-app affordance that *initiates a request* or *explains how the parent deletes* — not necessarily a hard delete button (parent-provisioned-account carve-out, see §4). | M (backend+web) + S (kid pointer) |
| 4 | **Kid app has NO Settings/About screen** | 5.1.1(v); 5.1.1(i); metadata | Missing — **structural blocker** | A reachable in-app surface to host the Privacy/Terms links and the deletion affordance. Without it, #1 and #3's in-app requirements can't be met. New route + header entry. | M |
| 5 | **Child-facing GenAI: no report affordance, no AI disclosure, no published contact** | 1.2 (GenAI/safeguard lens); 1.3; 5.1.4 | Partial — **high** | (a) a "report a concern" affordance on coach replies; (b) a one-line AI disclosure; (c) published support contact (ASC Support URL + email + landing contact page). NOT a full UGC stack — content is family-scoped, on-device, ephemeral. | S + S + M |
| 6 | **Terms / EULA absent** | 5.1.1; Schedule 1 EULA | Missing — medium | Apple standard EULA is acceptable; or host a custom Terms and link it. Still needs an in-app link (depends on #4). | S |
| 7 | **iOS privacy manifest under-declares + wrong fix mechanism** | 5.1.1; ATT manifest rules | Partial — medium | Declare collected data types + `NSPrivacyTracking=false`. **Do not hand-edit `ios/.../PrivacyInfo.xcprivacy` — `ios/` is gitignored prebuild output and gets wiped.** Declare via `app.json` → `ios.privacyManifests` (or a config plugin). | S |

---

## 3. Recommended remediation plan (iOS-first, ordered)

### (a) Must-fix before submit

1. **Create the kid-app Settings/About screen** — the keystone that unblocks #1, #3, #6.
   - New route: `apps/stoicpiggy/app/settings.tsx`, registered in the Stack in `apps/stoicpiggy/app/_layout.tsx` (alongside the existing `goal-new`/`mission-history`/`task-history` entries).
   - Entry point: a gear in the Home header (cheaper than a 6th tab — `onLogout` already wires through Home). Contents: Privacy Policy link, Terms link, "Delete account" affordance, app version.
   - Reuse the `Alert.alert` confirm pattern already in `Goals.tsx onDelete`. Add `deleteAccount`/`requestAccountDeletion` to `apps/stoicpiggy/lib/auth.tsx` next to the existing `logout`.

2. **Write + host Privacy Policy and Terms.**
   - Content source-of-truth: `apps/landing/lib/legal.ts` (or `packages/legal/`).
   - Public routes: `apps/landing/app/privacy/page.tsx` and `apps/landing/app/terms/page.tsx` (static Next.js routes).
   - Link them from the landing footer (`apps/landing/components/LandingPage.tsx` + `content.ts` footer strings — today it's only a copyright tagline).
   - Paste the `/privacy` URL into ASC. Use Apple's standard EULA unless a custom one is wanted.

3. **Backend deletion mutation (on the account-creation surface).**
   - `apps/backend/src/auth/auth.service.ts`: add `deleteAccount(parentId)` → `prisma.parent.delete` (existing `onDelete: Cascade` removes Child, PiggyBank, Transaction, SavingsGoal, Quest, Task, ResistedImpulse, EmailVerificationToken, PasswordResetToken).
   - `apps/backend/src/trpc/app.router.ts`: expose `parent.delete` (parentProcedure). The parent web app (`apps/parents`, SettingsView) gets the self-serve "Delete my account" button wired to it.
   - Kid app: a `childProcedure requestAccountDeletion` that flags + notifies the parent is a *nice-to-have*, not required. The lazy-correct minimum is the kid Settings screen showing a "Request account deletion / how your parent deletes this account" affordance that either fires that request or points to the parent flow. **ponytail:** don't build the queue/notify machinery unless review pushes back.

4. **App Store Connect config (no code):** complete the age-rating questionnaire (expect 4+, **do not select Kids Category** — see §4), fill the App Privacy label per §5, set Tracking = OFF, set Support URL + the Privacy Policy URL, confirm the EULA. Add review notes stating: all free-text is family-scoped and on-device; the coach is on-device AI with no server round-trip; chat is ephemeral.

5. **iOS privacy manifest the durable way:** add `ios.privacyManifests` to `apps/stoicpiggy/app.json` (where `ITSAppUsesNonExemptEncryption` already lives) declaring the collected data types + `NSPrivacyTracking=false`. **Do not edit `apps/stoicpiggy/ios/StoicPiggy/PrivacyInfo.xcprivacy` directly — `ios/` is gitignored and regenerated by `expo prebuild`.**

### (b) Should-fix (ship soon; not all are iOS-build blockers)

6. **Coach safety trio** (`apps/stoicpiggy/components/screens/Coach.tsx`, `lib/content.ts`, `lib/coach-llm.ts`):
   - "Report a concern" affordance on `piggy` messages (long-press or header link → mailto/support form). A single affordance satisfies the report expectation for an AI-only app.
   - One-line AI disclosure near the header/first message ("Zen Piggy is an AI coach and may be wrong — talk to a grown-up about money decisions"), added to es/en `coach.*` strings.
   - Minimal output-side guard in `ask()` (length/denylist, or fall back to the canned `REPLIES` template on empty/suspect output) — today only `stripThinking` runs, which is not a safety filter.

7. **Landing contact/privacy surface** (`apps/landing` new contact route + support email) so there is a real published contact.

8. **COPPA consent notice at the consent vector** — the parent provisioning the Child account on the web app *is* the verifiable-parental-consent act. Surface a consent + privacy notice in the `apps/parents` child-creation flow and a Terms/Privacy checkbox on the parent sign-up form (`AuthForms.tsx`). Document this flow in the policy. **This is a legal obligation, not an iOS-build blocker.**

9. **Reconcile datastore name:** `apps/backend/prisma/schema.prisma:1` header says "Supabase" but deployment is **Neon** — fix the comment so the privacy policy names the correct sub-processor.

### (c) Android follow-ups (deferred)

- Content Rating (IARC) questionnaire → expect "Everyone".
- Data Safety form: declare the same categories, "encrypted in transit", "users can request deletion", "collects info from children". Same Privacy Policy URL.
- Target Audience & Content (Families) declaration — mirror the iOS 4+/not-Kids decision to keep stores consistent. The zero-ad-SDK posture already satisfies Families ad/SDK rules.
- Play requires an in-app **and** web account-deletion path — the same `parent.delete` + landing instructions cover it.

---

## 4. Kids Category decision (corrected)

**Recommendation: ship as a 4+ general "family financial-literacy" app — NOT the Kids Category.**

- The audience is "kids to adults." Apple's Kids Category (1.3) is reserved for apps whose *primary* audience is children and is the stricter path (mandatory parental gates on every external link/purchase, zero third-party analytics/ads forever, separate attestation). A 4+ general rating legitimately spans the whole audience and is the lower-rejection-risk path.
- The app already clears the hardest Kids bars (no ads, no 3rd-party analytics, on-device AI), so a future pivot stays open — but you don't need the extra scrutiny now.

**Two corrections to the raw audit (do not act on these as originally written):**

1. **No in-app parental/age gate is required on the 4+ path.** The absence of an age/parental gate is *not* a 4+ blocker. COPPA "verifiable parental consent" is satisfied by the parent provisioning the Child account on the web app — that needs a *consent notice + disclosure*, not an in-app math-challenge gate. **Do not build a parental gate for the 4+ path.** (Build one only if you later choose Kids Category, gating external links/purchases/account-exits — none of which exist in the kid app today.)

2. **5.1.1(v) is triggered by account *creation*, not login.** The kid app does child *login only*; the account is created by the parent on the web dashboard. Apple's published carve-out for accounts "created/managed outside the app" (institutional/third-party provisioning) plausibly applies, so an in-app hard *delete button in the kid app is not strictly mandated*. The real obligation sits on the parents web app (the creation surface). Shipping a thin in-app "request deletion / how the parent deletes" affordance in the kid binary is **risk-reduction**, not a hard mandate. Severity is therefore high-risk rather than guaranteed rejection — but still fix before submit.

**Exact ASC + in-app settings:**
- ASC: Age rating → 4+ (do not check Kids Category boxes). App Privacy → data linked to user (Name, User ID, Financial Info, Other Usage), Tracking = None. Support URL + Privacy Policy URL set. EULA confirmed.
- In-app (new Settings screen): Privacy Policy link, Terms/EULA link, account-deletion affordance.
- Marketing consistency (1.3 / 2.3): pick ONE frame across the App Store listing, screenshots, and landing copy — "a family financial-literacy app parents set up for their kids (~6–16), usable together." Avoid copy that markets it *as* a kids' app while rating it 4+ general; reviewers cross-check listing vs. rating.

---

## 5. Privacy data inventory (App Privacy label + policy content)

All purposes are **App Functionality** (+ educational coaching). **None** is used for Tracking or advertising. **No** analytics/ad/crash SDKs ship.

| Data type | ASC nutrition-label category | Linked to user | From a child? | Purpose | Sub-processor(s) |
|-----------|------------------------------|----------------|---------------|---------|------------------|
| Parent email | Contact Info | Yes | No | Auth + transactional email | Neon, Render, Resend |
| Parent password (bcrypt) | — (not user-facing) | Yes | No | Auth | Neon, Render |
| Parent display name | Name | Yes | No | Account display | Neon, Render |
| **Child display name** | Name | Yes | **Yes** | Account display | Neon, Render |
| **Child username** | User ID | Yes | **Yes** | Kid login | Neon, Render |
| **Child password (bcrypt)** | — | Yes | **Yes** | Kid auth | Neon, Render |
| **Child age** (optional) | Other Data | Yes | **Yes** | Gameplay tailoring | Neon, Render |
| PiggyBank / Transaction / SavingsGoal / ResistedImpulse / Task (amounts, free-text notes/items) | Financial Info + User Content | Yes | **Yes** | App functionality / coaching | Neon, Render |
| Quest / lesson progress | Other Usage Data | Yes | **Yes** | App functionality | Neon, Render |
| Kid JWT | — | Yes | **Yes** | Session auth | Device keychain only (`expo-secure-store`) |
| Derived patterns (saveRate/patienceScore) | — | Yes | **Yes** | On-device coaching | Stays on device; Neon-sourced; **no AI sub-processor** |

**Sub-processors to disclose in the policy:** Render (API hosting, US-Oregon), Neon (Postgres datastore), Resend (transactional email — *parent email + link only, no child data*), Cloudflare (web/DNS). HuggingFace CDN serves the on-device model binary (one-way asset download, no user data).

**Privacy-positive facts to state explicitly (pre-empt reviewer questions):** on-device AI coach, no data sent to any AI provider; ~300 MB model downloads lazily only after opt-in; chat is ephemeral React state, never persisted or sent to the backend; no tracking/advertising/3rd-party analytics anywhere.

---

## 6. Legal documents

**Where to host:** canonical public pages on the landing site — `apps/landing/app/privacy/page.tsx` and `apps/landing/app/terms/page.tsx`.

**Where to link:** ASC Privacy Policy URL (mandatory) + ASC Support URL; in-app from the new kid Settings screen; landing footer; parent web footer + sign-up consent checkbox.

**Privacy Policy must contain (children's fintech-education / COPPA + GDPR-K):**
- **What is collected**, per §5 inventory — explicitly call out child data: name, username, age, balances, savings goals, impulse logs, task/quest history.
- **Verifiable parental consent model:** the parent creates and manages the Child account on the web dashboard; that provisioning act is the consent vector. Describe it.
- **Children's data section:** COPPA notice (US <13) and GDPR-K (EU child consent) handling; parental rights to review and delete child data.
- **On-device AI guarantee:** coach inference is fully local; child financial behavior never leaves the device to any AI/LLM provider.
- **Sub-processors:** Render, Neon, Resend, Cloudflare — what each receives.
- **Retention & deletion:** note that `deactivatedAt` is a soft-delete; a true erasure path (`parent.delete` cascade) is offered; how to request deletion + contact email.
- **No tracking / no ads / no third-party analytics.**

**Terms / EULA:** Apple's standard EULA is acceptable (link it) or host a custom Terms covering acceptable use, the parent-as-account-holder relationship, and the AI coach disclaimer ("educational, may be imperfect, not financial advice"). Add a Terms/Privacy acceptance checkbox on the parent web sign-up form.

---

## Open questions (founder input needed before drafting legal docs)

1. **Legal entity name + registered business address** — must name the data controller/operator and a contact address (COPPA, GDPR, ASC metadata).
2. **Governing-law jurisdiction** (state/country) for the Terms/EULA dispute clause; affects GDPR-K obligations.
3. **Support/privacy contact email** (e.g. `support@` / `privacy@` your domain) — Apple requires published contact; report-a-concern needs a destination; COPPA/GDPR need a data-request contact.
4. **Intended minimum age + will it serve under-13?** — under-13 triggers full COPPA; under-16 EU triggers GDPR-K. `Child.age` is optional; goal suggestions span ages 5–13, so confirm the real floor.
5. **Confirm 4+ general (not Kids Category)** — and will you ever add ads / third-party analytics / IAP? (Any of those changes the label + parental-gate obligations.)
6. **Production landing domain** + Apple standard EULA vs. custom — ASC needs the literal `https://<domain>/privacy` URL.
7. **App Store Connect access** to complete the age-rating questionnaire, App Privacy label, Support/Privacy URLs, and EULA (cannot be done from the codebase).
