import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
};

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "u",
  "b",
  "i",
  "ul",
  "ol",
  "li",
]);

function looksLikeHtml(input: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(input);
}

export function sanitizeRichHtml(html: string): string {
  const withoutBlocks = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "");

  return withoutBlocks.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g,
    (full, name: string) => {
      const tag = name.toLowerCase();
      const closing = full.startsWith("</");
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (tag === "b") return closing ? "</strong>" : "<strong>";
      if (tag === "i") return closing ? "</em>" : "<em>";
      if (tag === "br") return "<br />";
      return closing ? `</${tag}>` : `<${tag}>`;
    },
  );
}

export function richTextToPlain(input: string): string {
  if (!input) return "";
  return sanitizeRichHtml(input)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRichInput(input: string): string {
  if (!input) return "";
  const source = input.replace(/\r\n/g, "\n");
  if (!looksLikeHtml(source)) return source;

  return source
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<(p|div|ul|ol|h1|h2|h3|h4|h5|h6|blockquote)[^>]*>/gi, "")
    .replace(/<(strong|b)>([\s\S]*?)<\/(strong|b)>/gi, "**$2**")
    .replace(/<(em|i)>([\s\S]*?)<\/(em|i)>/gi, "*$2*")
    .replace(/<u>([\s\S]*?)<\/u>/gi, "__$1__")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseInlineSegments(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|<strong>.*?<\/strong>|<b>.*?<\/b>|<em>.*?<\/em>|<i>.*?<\/i>|<u>.*?<\/u>)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    const markdownBold = token.startsWith("**") && token.endsWith("**");
    const markdownItalic =
      token.startsWith("*") && token.endsWith("*") && !token.startsWith("**");
    const markdownUnderline = token.startsWith("__") && token.endsWith("__");
    const htmlStrong = /^<strong>.*<\/strong>$/i.test(token);
    const htmlBold = /^<b>.*<\/b>$/i.test(token);
    const htmlEmphasis = /^<em>.*<\/em>$/i.test(token);
    const htmlItalic = /^<i>.*<\/i>$/i.test(token);
    const htmlUnderline = /^<u>.*<\/u>$/i.test(token);

    if (markdownBold) {
      nodes.push(<strong key={`${match.index}-md`}>{token.slice(2, -2)}</strong>);
    } else if (markdownItalic) {
      nodes.push(<em key={`${match.index}-md-i`}>{token.slice(1, -1)}</em>);
    } else if (markdownUnderline) {
      nodes.push(<u key={`${match.index}-md-u`}>{token.slice(2, -2)}</u>);
    } else if (htmlStrong) {
      nodes.push(
        <strong key={`${match.index}-strong`}>
          {token.replace(/^<strong>/i, "").replace(/<\/strong>$/i, "")}
        </strong>,
      );
    } else if (htmlBold) {
      nodes.push(
        <strong key={`${match.index}-b`}>
          {token.replace(/^<b>/i, "").replace(/<\/b>$/i, "")}
        </strong>,
      );
    } else if (htmlEmphasis) {
      nodes.push(
        <em key={`${match.index}-em`}>
          {token.replace(/^<em>/i, "").replace(/<\/em>$/i, "")}
        </em>,
      );
    } else if (htmlItalic) {
      nodes.push(
        <em key={`${match.index}-i`}>
          {token.replace(/^<i>/i, "").replace(/<\/i>$/i, "")}
        </em>,
      );
    } else if (htmlUnderline) {
      nodes.push(
        <u key={`${match.index}-u`}>
          {token.replace(/^<u>/i, "").replace(/<\/u>$/i, "")}
        </u>,
      );
    } else {
      nodes.push(token);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }
  return nodes;
}

export function RichText({ text, className }: Props) {
  if (!text) return null;

  if (looksLikeHtml(text)) {
    const safe = sanitizeRichHtml(text).trim();
    if (!safe) return null;
    const Tag = /<(p|ul|ol|li|br)\b/i.test(safe) ? "div" : "span";
    return (
      <Tag
        className={cn("bf-rich-text", className)}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }

  const normalized = normalizeRichInput(text);
  const lines = normalized.split("\n");
  return (
    <span className={cn("bf-rich-text", className)}>
      {lines.map((line, i) => (
        <span key={`line-${i}`}>
          {parseInlineSegments(line)}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}
