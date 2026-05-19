"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const openMail = useCallback(() => {
    const subject = encodeURIComponent(
      `MATA Labs enquiry${name ? ` from ${name}` : ""}`,
    );
    const body = encodeURIComponent(
      [
        name ? `Name: ${name}` : null,
        email ? `Email: ${email}` : null,
        "",
        message || "(Your message)",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:hello@matalabs.io?subject=${subject}&body=${body}`;
  }, [name, email, message]);

  return (
    <form
      className="card-premium-elevated space-y-5 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        openMail();
      }}
    >
      <div>
        <label htmlFor="contact-name" className="text-meta font-medium text-navy">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-body text-ink shadow-[var(--shadow-soft)] transition-colors duration-200 placeholder:text-ink/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/25"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-meta font-medium text-navy">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-body text-ink shadow-[var(--shadow-soft)] transition-colors duration-200 placeholder:text-ink/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/25"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-meta font-medium text-navy">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-body text-ink shadow-[var(--shadow-soft)] transition-colors duration-200 placeholder:text-ink/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/25"
          placeholder="How can we help?"
          required
        />
      </div>
      <Button type="submit" variant="primary" className="w-full rounded-lg sm:w-auto">
        Open email draft
      </Button>
      <p className="text-meta leading-relaxed text-ink/55">
        This opens your mail app with a pre-filled message to hello@matalabs.io.
        You can edit before sending.
      </p>
    </form>
  );
}
