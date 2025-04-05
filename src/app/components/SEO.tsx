// components/SEO.tsx
import Head from "next/head";

interface ListItem {
  "@type"?: string;
  position?: number;
  name?: string;
  url?: string;
  [key: string]: unknown;
}

interface ItemList {
  "@type"?: string;
  itemListElement?: Array<ListItem>;
  [key: string]: unknown;
}

interface PropertyValue {
  "@type"?: string;
  name?: string;
  value?: string | number;
}

interface Brand {
  "@type"?: string;
  name?: string;
}

interface Offer {
  "@type"?: string;
  priceCurrency?: string;
  price?: number;
  itemCondition?: string;
  availability?: string;
  seller?: {
    "@type"?: string;
    name?: string;
  };
}

interface AggregateRating {
  "@type"?: string;
  ratingValue?: string | number;
  reviewCount?: number;
}

interface StructuredData {
  "@context"?: string;
  "@type"?: string;
  name?: string;
  description?: string;
  url?: string;
  image?: string | string[];
  brand?: Brand;
  offers?: Offer;
  mainEntity?: ItemList | Record<string, unknown>;
  additionalProperty?: Array<PropertyValue>;
  aggregateRating?: AggregateRating;
  [key: string]: unknown;
}

interface SEOProps {
  title: string; // Most critical - include phones, Nepal, prices
  description: string; // Important for CTR - be specific about phone models
  canonical?: string; // Important for preventing duplicate content
  structuredData?: StructuredData | null; // Critical for product rich results
  keywords?: string; // Still somewhat useful for context
  isProduct?: boolean; // Flag for phone product pages
  noIndex?: boolean; // Control indexing
}

export default function SEO({
  title,
  description,
  canonical,
  structuredData,
  keywords = "smartphones Nepal, mobile phones Nepal, smartphone price Nepal",
  isProduct = false,
  noIndex = false,
}: SEOProps) {
  const siteUrl = "https://mobileloom.com"; // Replace with your domain
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Head>
      {/* Primary SEO Tags - Critical for Rankings */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />

      {/* Indexing Controls - Important for search visibility */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Mobile Optimization - Critical for phone searches */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

      {/* Nepal-specific Tag - Important for country targeting */}
      <meta name="geo.region" content="NP" />
      <meta name="geo.placename" content="Nepal" />

      {/* Enhanced Product Structured Data - Critical for phone products */}
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />}

      {/* Breadcrumb structured data - Helps with site navigation in search */}
      {isProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Phones",
                  item: `${siteUrl}/phone_model`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: title,
                  item: fullCanonical,
                },
              ],
            }),
          }}
        />
      )}
    </Head>
  );
}
