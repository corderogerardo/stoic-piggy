// Single source of truth for the legal documents' facts.
//
// Operator is an individual (sole developer), not a company — that's fine for
// the App Store, COPPA, and GDPR. See docs/compliance/ios-appstore-review.md.
export const LEGAL = {
  appName: 'Stoic Piggy',
  /** The individual who operates the app (the data controller/operator). */
  company: 'Gerardo Cordero',
  // TODO(founder): once you have a PO box / virtual mailbox, put the full line
  // here (COPPA expects a contact address). City + country is the interim.
  address: 'Barquisimeto, Lara, Venezuela',
  /** Governing-law jurisdiction for the Terms. Kept to "Venezuela" so it reads
   *  cleanly in both the English and Spanish documents. */
  jurisdiction: 'Venezuela',
  /** Published privacy / data-request contact (role email on the root domain). */
  privacyEmail: 'privacy@noofficelocation.com',
  /** Published support / report-a-concern contact. */
  supportEmail: 'support@noofficelocation.com',
  /** Date these documents take effect. Update at launch if later. */
  effectiveDate: { es: '29 de junio de 2026', en: 'June 29, 2026' },
} as const;
