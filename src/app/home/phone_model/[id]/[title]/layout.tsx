import type { Metadata } from "next";
import slugify from "slugify";

interface PhoneModel {
  id: number;
  model: string;
  startingPrice: number;
  phoneId: number;
  image: string;
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string; title: string }>;
};

// Function to fetch phone models for the specified brand
async function getPhoneModels(brandId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/phone_model?limit=100&id=${brandId}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch phone models for structured data:", error);
    return [];
  }
}

// Define structured data for brand pages
const getBrandStructuredData = (brandName: string, brandId: string, models: PhoneModel[] = []) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brandName} Models in Nepal with Prices`,
    description: `Latest ${brandName} models available in Nepal with updated prices and specifications. Find the best ${brandName} phones at MobileLoom.`,
    url: `https://mobileloom.com/home/phone_model/${encodeURIComponent(brandId)}/${encodeURIComponent(brandName)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: models.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: model.model,
        url: `https://mobileloom.com/home/phone_model_detail/${encodeURIComponent(model.id)}/${slugify(model.model)}`,
      })),
    },
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get the brand name and ID from the URL parameters
  const { id, title } = await params;

  // Decode the title if it's URL encoded
  let brandName = decodeURIComponent(title);

  // Special case for iPhone
  if (brandName.toLowerCase() === "iphone") {
    brandName = "iPhone";
  } else {
    // Capitalize only the first letter for other brands
    brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
  }

  return {
    title: `${brandName} Price in Nepal 2025 - Latest Models & Specifications | MobileLoom`,
    description: `Find the latest ${brandName} phones in Nepal with updated prices. Compare specifications and features of popular ${brandName} smartphones available in Nepal at MobileLoom.`,
    keywords: `${brandName} price in Nepal, ${brandName} phones Nepal, buy ${brandName} Nepal, ${brandName} specifications, ${brandName} features, smartphone prices Nepal`,
    alternates: {
      canonical: `https://mobileloom.com/home/phone_model/${id}/${title}`,
    },
  };
}

export default async function Layout({ children, params }: Props & { children: React.ReactNode }) {
  // Get the brand name and ID from the URL parameters
  const { id, title } = await params;

  // Fetch phone models for this brand to use in structured data
  const models = await getPhoneModels(id);

  // Generate structured data
  const structuredData = getBrandStructuredData(decodeURIComponent(title), id, models);

  return (
    <>
      {/* Add structured data script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {children}
    </>
  );
}
