/**
 * Basic content filter for family-friendly enforcement.
 * Checks for common profanity / slurs using whole-word matching.
 * Not exhaustive — server-side moderation via reports is the primary defense.
 */

const BLOCKED: string[] = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "cock", "pussy",
  "nigger", "nigga", "faggot", "retard", "whore", "slut", "bastard",
  "motherfucker", "goddamn", "bullshit", "ass", "piss", "damn",
];

// Build regex: whole-word, case-insensitive, with common letter substitutions
function buildPattern(word: string): RegExp {
  // Allow common substitutions: a→@/4, e→3, i→1/!, o→0, s→$
  const escaped = word.split("").map((c) => {
    switch (c) {
      case "a": return "[a@4]";
      case "e": return "[e3]";
      case "i": return "[i1!]";
      case "o": return "[o0]";
      case "s": return "[s$]";
      default:  return c;
    }
  }).join("[\\W_]*"); // allow characters between letters (f**k, f.u.c.k)
  return new RegExp(`\\b${escaped}\\b`, "i");
}

const PATTERNS = BLOCKED.map(buildPattern);

export function containsProfanity(text: string): boolean {
  return PATTERNS.some((p) => p.test(text));
}

export function filterCheck(text: string): string | null {
  if (containsProfanity(text)) {
    return "Your message contains language that isn't allowed. Please keep it family-friendly.";
  }
  return null;
}
