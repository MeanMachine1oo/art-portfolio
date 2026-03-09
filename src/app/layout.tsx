import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "./components/Nav";

export const metadata: Metadata = {
  title: "Wildcard Design — Nitin Jarath",
  description: "Cross-disciplinary designer at the intersection of impact, technology, and storytelling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "40px var(--page-gutter)",
        marginTop: "var(--section-gap)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.06em",
          }}
        >
          © {new Date().getFullYear()} Wildcard Design
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.06em",
          }}
        >
          Nitin Jarath — wildcarddesign.in
        </span>
      </div>
    </footer>
  );
}
