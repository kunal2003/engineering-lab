import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Kunal Matta — Make it useful.", template: "%s | Kunal Matta" },
  description:
    "Software, intelligent systems, and the people they serve. Selected projects, three interactive engineering experiments, and community leadership. Graduating from GW in May 2027.",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg` },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <header className="site-header wrap">
          <Link href="/" className="brand">
            Kunal Matta<span className="brand-dot">.</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/#work">Work</Link>
            <Link href="/#lab">Lab</Link>
            <Link href="/#about">About</Link>
            <Link href="/#contact">Contact</Link>
          </nav>
        </header>
        {children}
        <footer className="wrap footer">
          <Link href="/">Kunal Matta</Link>
          <span>Washington, DC · May 2027</span>
          <em>Make it useful.</em>
        </footer>
      </body>
    </html>
  );
}
