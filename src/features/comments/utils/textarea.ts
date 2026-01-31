import type { FormEvent } from "react";

export function handleAutoResize(event: FormEvent<HTMLTextAreaElement>) {
  const target = event.currentTarget;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
}
