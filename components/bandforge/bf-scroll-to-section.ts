/** Smooth-scroll to a same-page marketing section hash (`/#modules`). */
export function scrollToMarketingHash(
  href: string,
  event?: { preventDefault: () => void },
): boolean {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return false;
  const id = href.slice(hashIndex + 1);
  if (!id) return false;

  const el = document.getElementById(id);
  if (!el) return false;

  event?.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", `/#${id}`);
  return true;
}

/** After route load / dynamic section mount, scroll if URL has a hash. */
export function scheduleMarketingHashScroll(maxMs = 2500): () => void {
  if (typeof window === "undefined") return () => {};
  const id = window.location.hash.slice(1);
  if (!id) return () => {};

  const tryScroll = () => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  if (tryScroll()) return () => {};

  const interval = window.setInterval(() => {
    if (tryScroll()) window.clearInterval(interval);
  }, 80);
  const timeout = window.setTimeout(() => window.clearInterval(interval), maxMs);

  return () => {
    window.clearInterval(interval);
    window.clearTimeout(timeout);
  };
}
