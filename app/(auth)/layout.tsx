import { Bitter, Lora } from "next/font/google";

const bitter = Bitter({
  variable: "--font-bitter-loaded",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora-loaded",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${bitter.variable} ${lora.variable} min-h-dvh`}>
      {children}
    </div>
  );
}
