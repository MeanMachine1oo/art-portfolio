import { createClient } from "@sanity/client";
import Image from "next/image";
import Link from "next/link";

// ─── Sanity client (server-side only) ────────────────────────────────────────
const client = createClient({
  projectId: "cpmtvctn",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface SanityImageAsset {
  _id: string;
  url: string;
  metadata: {
    dimensions: { width: number; height: number; aspectRatio: number };
    lqip: string;
  };
}

interface Artwork {
  _id: string;
  title: string;
  slug: { current: string };
  year: number;
  medium: string;
  dimensions: string;
  description: string;
  series: string;
  forSale: boolean;
  image: {
    asset: SanityImageAsset;
    alt: string;
  };
}

// ─── GROQ query ───────────────────────────────────────────────────────────────
const ARTWORKS_QUERY = `*[_type == "artwork"] | order(year desc) {
  _id,
  title,
  slug,
  year,
  medium,
  dimensions,
  description,
  series,
  forSale,
  image {
    asset-> {
      _id,
      url,
      metadata {
        dimensions,
        lqip
      }
    },
    alt
  }
}`;

// ─── Page (Server Component) ──────────────────────────────────────────────────
export default async function Home() {
  const artworks: Artwork[] = await client.fetch(ARTWORKS_QUERY);

  return (
    <>
      <style>{`
        /* ── Design tokens ─────────────────────────────────────── */
        :root {
          --ink:        #111010;
          --paper:      #f5f3ef;
          --muted:      #8a8680;
          --accent:     #c8502a;
          --rule:       rgba(17,16,16,0.12);

          --font-display: 'Times New Roman', Times, serif;
          --font-body:    'Georgia', serif;
          --font-mono:    'Courier New', Courier, monospace;

          --gap:   clamp(1rem, 2vw, 2rem);
          --page:  clamp(1.5rem, 5vw, 5rem);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Site header ───────────────────────────────────────── */
        .site-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 1.5rem var(--page);
          border-bottom: 1px solid var(--rule);
          position: sticky;
          top: 0;
          background: var(--paper);
          z-index: 10;
        }

        .site-header__wordmark {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
        }

        .site-header__nav {
          display: flex;
          gap: 2rem;
          list-style: none;
        }

        .site-header__nav a {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .site-header__nav a:hover { color: var(--ink); }

        /* ── Hero ──────────────────────────────────────────────── */
        .hero {
          padding: clamp(4rem, 10vw, 9rem) var(--page) clamp(3rem, 6vw, 6rem);
          border-bottom: 1px solid var(--rule);
          display: grid;
          grid-template-columns: 1fr;
          row-gap: 1.25rem;
        }

        .hero__eyebrow {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .hero__title {
          font-family: var(--font-display);
          font-size: clamp(4.5rem, 14vw, 14rem);
          font-weight: 400;
          line-height: 0.9;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .hero__title em {
          font-style: italic;
          color: var(--accent);
        }

        .hero__sub {
          max-width: 38ch;
          font-family: var(--font-body);
          font-size: clamp(0.95rem, 1.6vw, 1.15rem);
          line-height: 1.65;
          color: var(--muted);
          margin-top: 0.5rem;
        }

        .hero__rule {
          width: 2.5rem;
          height: 1px;
          background: var(--accent);
          margin-top: 0.25rem;
        }

        /* ── Gallery section ───────────────────────────────────── */
        .gallery-section {
          padding: clamp(3rem, 6vw, 6rem) var(--page);
        }

        .gallery-section__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--rule);
        }

        .gallery-section__label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .gallery-section__count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--muted);
        }

        /* ── Grid ──────────────────────────────────────────────── */
        .artwork-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: var(--gap);
        }

        /* ── Artwork card ──────────────────────────────────────── */
        .artwork-card {
          display: flex;
          flex-direction: column;
          gap: 0;
          text-decoration: none;
          color: inherit;
          group: card;
        }

        .artwork-card__image-wrap {
          position: relative;
          overflow: hidden;
          background: rgba(17,16,16,0.04);
        }

        .artwork-card__image-wrap img {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      filter 0.4s ease;
          filter: saturate(0.9);
        }

        .artwork-card:hover .artwork-card__image-wrap img {
          transform: scale(1.025);
          filter: saturate(1);
        }

        .artwork-card__badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: var(--ink);
          color: var(--paper);
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          pointer-events: none;
        }

        .artwork-card__meta {
          padding: 1rem 0 0;
          border-top: 1px solid var(--rule);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.2rem 1rem;
          align-items: start;
        }

        .artwork-card__title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 400;
          font-style: italic;
          line-height: 1.2;
          color: var(--ink);
          grid-column: 1;
          grid-row: 1;
          transition: color 0.2s;
        }

        .artwork-card:hover .artwork-card__title { color: var(--accent); }

        .artwork-card__year {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--muted);
          grid-column: 2;
          grid-row: 1;
          white-space: nowrap;
          padding-top: 0.1rem;
        }

        .artwork-card__medium {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--muted);
          letter-spacing: 0.02em;
          grid-column: 1 / -1;
          grid-row: 2;
          margin-top: 0.1rem;
        }

        .artwork-card__series {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          grid-column: 1 / -1;
          grid-row: 3;
          margin-top: 0.2rem;
        }

        /* ── Empty state ───────────────────────────────────────── */
        .empty-state {
          grid-column: 1 / -1;
          padding: 5rem 0;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ── Footer ────────────────────────────────────────────── */
        .site-footer {
          padding: 2rem var(--page);
          border-top: 1px solid var(--rule);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .site-footer__copy {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          color: var(--muted);
        }

        /* ── Reduced motion ────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .artwork-card__image-wrap img { transition: none; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="site-header">
        <a href="/" className="site-header__wordmark">Nitin Jerath</a>
        <nav>
          <ul className="site-header__nav">
            <li><a href="#work">Work</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <p className="hero__eyebrow">Portfolio</p>
          <h1 className="hero__title">
            Stu<em>dio</em>
          </h1>
          <div className="hero__rule" aria-hidden="true" />
          <p className="hero__sub">
            A space for personal explorations and practice by Nitin Jerath.
          </p>
        </section>

        {/* ── Gallery ── */}
        <section className="gallery-section" id="work">
          <div className="gallery-section__header">
            <span className="gallery-section__label">All Works</span>
            {artworks.length > 0 && (
              <span className="gallery-section__count">
                {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
              </span>
            )}
          </div>

          <div className="artwork-grid">
            {artworks.length === 0 ? (
              <p className="empty-state">No works found.</p>
            ) : (
              artworks.map((artwork) => {
                const { asset } = artwork.image ?? {};
                const w = asset?.metadata?.dimensions?.width ?? 800;
                const h = asset?.metadata?.dimensions?.height ?? 600;

                return (
                  <Link
                    key={artwork._id}
                    href={`/work/${artwork.slug?.current ?? artwork._id}`}
                    className="artwork-card"
                  >
                    <div className="artwork-card__image-wrap">
                      {asset?.url ? (
                        <Image
                          src={`${asset.url}?w=900&auto=format&q=85`}
                          alt={artwork.image.alt ?? artwork.title}
                          width={w}
                          height={h}
                          placeholder={asset.metadata?.lqip ? "blur" : "empty"}
                          blurDataURL={asset.metadata?.lqip}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          style={{
                            aspectRatio: "4/3",
                            background: "rgba(17,16,16,0.06)",
                          }}
                        />
                      )}
                      {artwork.forSale && (
                        <span className="artwork-card__badge">Available</span>
                      )}
                    </div>

                    <div className="artwork-card__meta">
                      <h2 className="artwork-card__title">{artwork.title}</h2>
                      {artwork.year && (
                        <span className="artwork-card__year">{artwork.year}</span>
                      )}
                      {artwork.medium && (
                        <p className="artwork-card__medium">{artwork.medium}</p>
                      )}
                      {artwork.series && (
                        <p className="artwork-card__series">{artwork.series}</p>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <p className="site-footer__copy">
          © {new Date().getFullYear()} Nitin Jerath. All rights reserved.
        </p>
        <p className="site-footer__copy">Studio</p>
      </footer>
    </>
  );
}
