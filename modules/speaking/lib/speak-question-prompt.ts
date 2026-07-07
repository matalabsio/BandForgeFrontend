/** Flatten cue-card / multi-line prompts into spoken text. */
export function promptToSpeechText(prompt: string): string {
  const lines = prompt
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("•"))
    .filter((l) => !l.toLowerCase().startsWith("you should"));

  return lines.join(". ").replace(/\s+/g, " ").trim();
}

export function canSpeakPrompt(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speak prompt text once; returns cancel function. */
export function speakPromptText(
  text: string,
  onEnd?: () => void,
): () => void {
  if (!canSpeakPrompt()) {
    onEnd?.();
    return () => {};
  }

  const spoken = promptToSpeechText(text);
  if (!spoken) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onEnd?.();
  };

  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.speak(utterance);

  return () => {
    finished = true;
    window.speechSynthesis.cancel();
  };
}

export function stopSpeakingPrompt(): void {
  if (canSpeakPrompt()) {
    window.speechSynthesis.cancel();
  }
}
