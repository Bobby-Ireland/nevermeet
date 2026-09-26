import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEVERMEET — Match. Flirt. Never meet.",
  description: "Fake dating. Real dopamine. Swipe fictional profiles, get suspiciously good matches and chat into the void. No signup. No rejection. No actual date.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {title:"NEVERMEET — Match. Flirt. Never meet.",description:"All the butterflies. None of the plans. A fictional dating simulation.",type:"website"},
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
