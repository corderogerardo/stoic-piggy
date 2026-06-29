// Single source of truth for the legal documents' fill-in-the-blank facts.
//
// TODO(founder): replace every [BRACKETED] placeholder before publishing — these
// strings render verbatim in the public Privacy Policy and Terms, and the App
// Store / Google Play reviews check that a real entity + contact are named.
// See docs/compliance/ios-appstore-review.md (Open questions).
export const LEGAL = {
  appName: 'Stoic Piggy',
  /** Registered legal entity that operates the app (the data controller/operator). */
  company: '[LEGAL ENTITY NAME]',
  /** Registered business mailing address. */
  address: '[REGISTERED BUSINESS ADDRESS]',
  /** Governing-law jurisdiction for the Terms (e.g. "the State of California, USA"). */
  jurisdiction: '[GOVERNING-LAW JURISDICTION]',
  /** Published privacy / data-request contact. */
  privacyEmail: 'privacy@stoicpiggy.app',
  /** Published support / report-a-concern contact. */
  supportEmail: 'support@stoicpiggy.app',
  /** Date these documents take effect (e.g. "June 29, 2026"). */
  effectiveDate: '[EFFECTIVE DATE]',
} as const;
