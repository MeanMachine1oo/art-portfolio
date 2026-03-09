import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtworkBySlug, getAllArtworkSlugs, getAllArtworks } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import type { Artwork } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllArtworkSlugs();
  return slugs.map((s) => ({ slug: s.slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const artwork = await getArtworkBySlug(params.slug);
  if (!artwork) return {};
  return {
    title: `${artwork.title} — Wildcard Design`,
    description: artwork.description,
    openGraph: {
      images: artwork.image
        ? [{ url: urlFor(artwork.image).width(1200).height(630).url() }]
        : [],
    },
  };
}

export default async function ArtworkDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [artwork, allArtworks] = await Promise.all([
    getArtworkBySlug(params.slug),
    getAllArtworks(),
  ]);

  if (!artwork) notFound();

  // Adjacent artworks for prev/next
  const currentIndex = allArtworks.findIndex(
    (a) => a.slug.current === params.slug
  );
  const prevArtwork = currentIndex > 0 ? allArtworks[currentIndex - 1] : null;
  const nextArtwork =
    currentIndex < allArtworks.length - 1
      ? allArtworks[currentIndex + 1]
      : null;

  const heroUrl = artwork.image
    ? urlFor(artwork.image).width(1600).height(1000).url()
    : null;

  // Related works from same series (excluding current)
  const relatedWorks = artwork.series
    ? allArtworks
        .filter(
          (a) => a.series === artwork.series && a._id !== artwork._id
        )
        .slice(0, 3)
    : [];

  return (
    <div style={{ paddingTop: "56px" }}>
      {/* ── Breadcrumb ── */}
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "24px var(--page-gutter) 0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Link
          href="/gallery"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-text-tertiary)",
            transition: "color 250ms ease",
          }}
        >
          Gallery
        </Link>
        <span
          style={{
            color: "var(--color-border)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
          }}
        >
          /
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            letterSpacing: "0.06em",
          }}
        >
          {artwork.title}
        </span>
      </div>

      {/* ── Hero Image ── */}
      {heroUrl && (
        <section
          style={{
            maxWidth: "var(--container-max)",
            margin: "32px auto 0",
            padding: "0 var(--page-gutter)",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "16/10",
              overflow: "hidden",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <Image
              src={heroUrl}
              alt={artwork.title}
              fill
              style={{ objectFit: "cover" }}
              priority
              sizes="(max-width: 960px) 100vw, 960px"
            />
          </div>
        </section>
      )}

      {/* ── Title & Meta ── */}
      <section
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "48px var(--page-gutter) 0",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "40px",
          alignItems: "start",
        }}
      >
        <div>
          {artwork.series && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
                marginBottom: "16px",
              }}
            >
              {artwork.series}
            </p>
          )}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-4xl)",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              marginBottom: "24px",
            }}
          >
            {artwork.title}
          </h1>

          {artwork.description && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-md)",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
                maxWidth: "var(--content-max-width)",
              }}
            >
              {artwork.description}
            </p>
          )}
        </div>

        {/* Metadata panel */}
        <div
          style={{
            minWidth: "200px",
            borderLeft: "1px solid var(--color-border)",
            paddingLeft: "32px",
          }}
        >
          {artwork.year && <MetaRow label="Year" value={String(artwork.year)} />}
          {artwork.medium && <MetaRow label="Medium" value={artwork.medium} />}
          {artwork.dimensions && (
            <MetaRow label="Dimensions" value={artwork.dimensions} />
          )}
          <MetaRow
            label="Availability"
            value={artwork.forSale ? "Available" : "Not for sale"}
            accent={artwork.forSale}
          />
        </div>
      </section>

      {/* ── Enquire CTA ── */}
      {artwork.forSale && (
        <section
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "40px var(--page-gutter) 0",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              padding: "32px 40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 300,
                  color: "var(--color-text)",
                  marginBottom: "4px",
                }}
              >
                This work is available.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-base)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Enquire about acquisition, pricing, or framing options.
              </p>
            </div>
            <a
              href={`mailto:nitin@wildcarddesign.in?subject=Enquiry: ${artwork.title}`}
              style={{
                display: "inline-block",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                padding: "12px 28px",
                flexShrink: 0,
                transition: "background-color 250ms ease",
              }}
            >
              Enquire
            </a>
          </div>
        </section>
      )}

      {/* ── Related Works ── */}
      {relatedWorks.length > 0 && (
        <section
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "var(--section-gap) var(--page-gutter) 0",
          }}
        >
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "40px",
              marginBottom: "32px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
              }}
            >
              From the same series
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "2px",
            }}
          >
            {relatedWorks.map((r) => (
              <RelatedCard key={r._id} artwork={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── Prev / Next Navigation ── */}
      <nav
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--section-gap) var(--page-gutter)",
          borderTop: "1px solid var(--color-border)",
          marginTop: "var(--section-gap)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {prevArtwork ? (
          <PrevNextLink direction="← Prev" artwork={prevArtwork} />
        ) : (
          <div />
        )}
        <Link
          href="/gallery"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-text-tertiary)",
            transition: "color 250ms ease",
          }}
        >
          All Works
        </Link>
        {nextArtwork ? (
          <PrevNextLink direction="Next →" artwork={nextArtwork} align="right" />
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}

function MetaRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--color-text-tertiary)",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          fontWeight: accent ? 600 : 300,
          color: accent ? "var(--color-accent)" : "var(--color-text)",
          lineHeight: 1.4,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function RelatedCard({ artwork }: { artwork: Artwork }) {
  const imgUrl = artwork.image
    ? urlFor(artwork.image).width(480).height(480).url()
    : null;

  return (
    <Link href={`/gallery/${artwork.slug.current}`}>
      <div className="related-card">
        <div
          style={{
            position: "relative",
            aspectRatio: "1/1",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {imgUrl && (
            <Image
              src={imgUrl}
              alt={artwork.title}
              fill
              style={{
                objectFit: "cover",
                transition: "transform 400ms ease",
              }}
              className="related-card-img"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          )}
        </div>
        <div style={{ padding: "12px 0 20px" }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-lg)",
              fontWeight: 300,
              color: "var(--color-text)",
              transition: "color 250ms ease",
            }}
            className="related-card-title"
          >
            {artwork.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-tertiary)",
              marginTop: "4px",
            }}
          >
            {artwork.year}
          </p>
        </div>
      </div>
      <style>{`
        .related-card:hover .related-card-img { transform: scale(1.04); }
        .related-card:hover .related-card-title { color: var(--color-accent) !important; }
      `}</style>
    </Link>
  );
}

function PrevNextLink({
  direction,
  artwork,
  align = "left",
}: {
  direction: string;
  artwork: Artwork;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={`/gallery/${artwork.slug.current}`}
      style={{
        textAlign: align,
        maxWidth: "240px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-text-tertiary)",
          marginBottom: "6px",
        }}
      >
        {direction}
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-xl)",
          fontWeight: 300,
          color: "var(--color-text)",
          lineHeight: 1.2,
          transition: "color 250ms ease",
        }}
      >
        {artwork.title}
      </p>
    </Link>
  );
}
