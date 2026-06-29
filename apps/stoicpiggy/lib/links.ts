// Public contact + legal links surfaced in Settings and the coach safety line.
// Single source of truth so the App Store reviewer always finds a reachable
// Privacy Policy, Terms, and support contact.
//
// TODO(founder): replace these placeholders with your real production values
// before submitting. The privacy URL here must match the Privacy Policy URL set
// in App Store Connect. See docs/compliance/ios-appstore-review.md.
export const LANDING_URL = 'https://stoicpiggy.app';
export const PRIVACY_URL = `${LANDING_URL}/privacy`;
export const TERMS_URL = `${LANDING_URL}/terms`;
export const SUPPORT_EMAIL = 'support@stoicpiggy.app';

/** A prefilled mailto: for the in-app "report a concern" / contact affordances. */
export function supportMailto(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
