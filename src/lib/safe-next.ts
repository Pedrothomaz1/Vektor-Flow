// Return `next` only when it is a safe same-origin relative path ("/...").
export function safeNextParam(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw) return null;
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  } catch {
    return null;
  }
}