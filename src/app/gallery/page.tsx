import Image from "next/image";
import Link from "next/link";
import { getAllArtworks } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import type { Artwork } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Gallery — Wildcard Design",
  description: "A collection of works spanning medium, series, and year.",
};

export default async function GalleryPage() {
  const artworks = await getAllArtworks();

  // Build unique series list for filtering label
  const series = Array.from(
    new Set(artworks.map((a) => a.series).filter(Boolean))
  ) as string[];

  // Group by series (ungrouped → "Other")
  const grouped: Record<string, Artwork[]> = {};
  for (const artwork of artworks) {
    const key = artwork.series ?? "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(artwork);
  }

  const groupKeys = [
    ...series,
    ...(grouped["Other"] ? ["Other"] : []),
  ];

  return (
    <div style={{ paddingTop: "56px" }}>
      {/* ── Page Header ── */}
      <section
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding:
            "clamp(48px, 8vw, 96px) var(--page-gutter) 0",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                marginBottom: "16px",
              }}
            >
              Gallery
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--text-4xl)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              Select Works
            </h1>
          </div>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-tertiary)",
              letterSpacing: "0.06em",
            }}
          >
            {artworks.length} work{artworks.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* ── Series Groups ── */}
      {groupKeys.length > 1 ? (
        groupKeys.map((group) => (
          <SeriesSection
            key={group}
            title={group}
            artworks={grouped[group]}
          />
        ))
      ) : (
        <section
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "48px var(--page-gutter) var(--section-gap)",
          }}
        >
          {artworks.length === 0 ? (
            <EmptyState />
          ) : (
            <ArtworkGrid artworks={artworks} />
          )}
        </section>
      )}
    </div>
  );
}

function SeriesSection({
  title,
  artworks,
}: {
  title: string;
  artworks: Artwork[];
}) {
  return (
    <section
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "48px var(--page-gutter) 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "16px",
          marginBottom: "32px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-2xl)",
            fontWeight: 300,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.12em",
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
          }}
        >
          {artworks.length}
        </span>
      </div>
      <div style={{ marginBottom: "var(--section-gap)" }}>
        <ArtworkGrid artworks={artworks} />
      </div>
    </section>
  );
}

function ArtworkGrid({ artworks }: { artworks: Artwork[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "2px",
      }}
    >
      {artworks.map((artwork, i) => (
        <GalleryCard key={artwork._id} artwork={artwork} index={i} />
      ))}
    </div>
  );
}

function GalleryCard({
  artwork,
  index,
}: {
  artwork: Artwork;
  index: number;
}) {
  const imgUrl = artwork.image
    ? urlFor(artwork.image).width(560).height(700).url()
    : null;

  // Vary aspect ratios slightly for visual rhythm
  const aspects = ["4/5", "1/1", "4/5", "3/4", "1/1", "4/5"];
  const aspect = aspects[index % aspects.length];

  return (
    <Link href={`/gallery/${artwork.slug.current}`}>
      <article className="gallery-card" style={{ position: "relative" }}>
        {/* Image */}
        <div
          style={{
            position: "relative",
            aspectRatio: aspect,
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={artwork.title}
              fill
              style={{
                objectFit: "cover",
                transition: "transform 500ms ease",
              }}
              className="gallery-card-img"
              sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "var(--color-surface)",
              }}
            />
          )}

          {/* For Sale badge */}
          {artwork.forSale && (
            <span
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                padding: "4px 10px",
              }}
            >
              Available
            </span>
          )}
        </div>

        {/* Meta */}
        <div
          style={{
            padding: "16px 0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--text-lg)",
                fontWeight: 300,
                lineHeight: 1.25,
                color: "var(--color-text)",
                transition: "color 250ms ease",
              }}
              className="gallery-card-title"
            >
              {artwork.title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
                letterSpacing: "0.06em",
                marginTop: "4px",
              }}
            >
              {artwork.medium}
            </p>
          </div>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-tertiary)",
              letterSpacing: "0.06em",
              paddingTop: "2px",
              flexShrink: 0,
              marginLeft: "12px",
            }}
          >
            {artwork.year}
          </span>
        </div>

        <style>{`
          .gallery-card:hover .gallery-card-img {
            transform: scale(1.04);
          }
          .gallery-card:hover .gallery-card-title {
            color: var(--color-accent) !important;
          }
        `}</style>
      </article>
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: "80px 0",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-2xl)",
          fontWeight: 300,
          color: "var(--color-text-tertiary)",
          fontStyle: "italic",
        }}
      >
        No works yet.
      </p>
    </div>
  );
}
