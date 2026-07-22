import { GOOGLE_FONTS_STYLESHEET_HREF } from "@/lib/google-fonts";

/** Exam passage fonts — mount only on test/diagnostic routes, not marketing. */
export function GoogleFontsLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link href={GOOGLE_FONTS_STYLESHEET_HREF} rel="stylesheet" />
    </>
  );
}
