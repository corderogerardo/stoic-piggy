// Public contact + legal links surfaced in Settings and the coach safety line.
// Single source of truth so the App Store reviewer always finds a reachable
// Privacy Policy, Terms, and support contact.
//
// PRIVACY_URL must match the Privacy Policy URL set in App Store Connect.
export const LANDING_URL = 'https://stoic-piggy.noofficelocation.com';
export const PRIVACY_URL = `${LANDING_URL}/privacy`;
export const TERMS_URL = `${LANDING_URL}/terms`;
export const SUPPORT_EMAIL = 'gerardo@noofficelocation.com';

/** A prefilled mailto: for the in-app "report a concern" / contact affordances. */
export function supportMailto(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
