import { Fredoka, Nunito } from "next/font/google";
import "@english/english-forge.css";

const efDisplay = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ef-display",
  display: "swap",
});

const efBody = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ef-body",
  display: "swap",
});

/** English Forge–only fonts + clay CSS. Does not affect BandForge marketing. */
export default function EnglishForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${efDisplay.variable} ${efBody.variable}`}>
      {children}
    </div>
  );
}
