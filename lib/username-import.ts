import { createHash } from "node:crypto";

import { slugifyClueCardSegment } from "@/lib/clue-cards";

const fakeEmailDomain = "germix.local";

// export function buildFakeEmailForUsername(username: string) {
//   const safeUsername = slugifyClueCardSegment(username) || "user";
//   const hash = createHash("sha256").update(username).digest("hex").slice(0, 10);
//   return `${safeUsername}-${hash}@${fakeEmailDomain}`;
// }

export function buildFakeEmailForUsername(username: string) {
    return `${Buffer.from(username, 'utf8').toString('base64url')}@${fakeEmailDomain}`;
}
