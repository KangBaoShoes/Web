/** Build a draft-only email link; sending remains the visitor's action. */
export function createEmailDraftLink(
  recipient: string,
  subject: string,
  body: string,
) {
  const normalizedBody = body.replace(/\r\n|\r|\n/g, "\r\n");
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(normalizedBody)}`;
}
