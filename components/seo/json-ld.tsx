type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

type JsonLdProps = {
  data: JsonLdData;
};

/**
 * Server-rendered JSON-LD script tag for schema.org structured data.
 * Prefer a single object with `@context` + `@graph` to avoid duplicate nodes.
 */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
