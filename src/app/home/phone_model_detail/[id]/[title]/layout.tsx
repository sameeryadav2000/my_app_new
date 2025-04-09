import type { Metadata } from "next";

// Define the types needed for structured data
interface Products {
  id: number;
  phoneModelId: number;
  condition: string;
  storage: string;
  colorId: number | null;
  colorName: string;
  price: number;
  sellerId: string | null;
  sellerName: string | null;
  phoneName: string;
  phoneModel: string;
  images: ProductImage[];
}

interface ProductImage {
  image: string;
  mainImage: boolean;
}

interface ReviewData {
  reviewCount: number;
  averageRating: number;
}

interface Review {
  id: number;
  colorName?: string;
  phoneModelName?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  userName: string;
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string; title: string }>;
};

// Function to fetch phone model details
async function getPhoneModelData(phoneModelId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/phone_model_details?id=${phoneModelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    const result = await response.json();

    if (result.success && result.data) {
      return {
        variations: result.data as Products[],
      };
    }

    return { variations: [] as Products[] };
  } catch (error) {
    console.error("Failed to fetch phone model details for structured data:", error);
    return { variations: [] as Products[] };
  }
}

// Function to fetch review data - modified to only use modelId
async function getReviewData(phoneModelId: string) {
  try {
    const url = `${process.env.NEXTAUTH_URL}/api/reviews?phoneModelId=${phoneModelId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    const result = await response.json();

    if (!result.success) {
      return { averageRating: 0, reviewCount: 0 };
    }

    if (Array.isArray(result.data) && result.data.length > 0) {
      const reviews = result.data as Review[];
      const total = reviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
      const avgRating = parseFloat((total / reviews.length).toFixed(1));

      return {
        averageRating: avgRating,
        reviewCount: reviews.length,
      };
    }

    return { averageRating: 0, reviewCount: 0 };
  } catch (error) {
    console.error("Error fetching reviews: ", error);
    return { averageRating: 0, reviewCount: 0 };
  }
}

function generateProductStructuredData(variations: Products[], reviewData: ReviewData, modelId: string, urlTitle: string) {
  if (!variations.length) return null;

  // Use the first variation to get model details
  const firstVariation = variations[0];
  const productUrl = `https://mobileloom.com/home/phone_model_detail/${modelId}/${urlTitle}`;

  // Get main image
  const mainImage =
    variations.flatMap((v) => v.images).find((img) => img.mainImage)?.image ||
    (firstVariation.images.length > 0 ? firstVariation.images[0].image : "");

  // Extract brand name safely
  const brandName = firstVariation.phoneName ? firstVariation.phoneName.split(" ")[0] : "";

  // Get price range
  const prices = variations.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Get all available colors, storage options, and conditions
  const colors = [...new Set(variations.map((v) => v.colorName))];
  const storageOptions = [...new Set(variations.map((v) => v.storage))];
  const conditions = [...new Set(variations.map((v) => v.condition))];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: firstVariation.phoneModel,
    image: mainImage,
    url: productUrl,
    description: `Buy ${firstVariation.phoneModel} in Nepal. Available in ${colors.join(", ")} colors and ${storageOptions.join(
      ", "
    )} storage options. All devices come with 6-month warranty.`,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "NPR",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: variations.length,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "MobileLoom",
      },
    },
    aggregateRating:
      reviewData.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: reviewData.averageRating.toFixed(1),
            reviewCount: reviewData.reviewCount,
          }
        : undefined,
    // List available storage, colors, and conditions as product features
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Available Storage Options",
        value: storageOptions.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Available Colors",
        value: colors.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Available Conditions",
        value: conditions.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Warranty",
        value: "6 months",
      },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get the model ID and title from the URL parameters
  const { id, title } = await params;

  // Decode the title if it's URL encoded
  let modelName = decodeURIComponent(title);

  // Format model name - capitalize 'P' in iPhone or first letter for other brands
  if (modelName.toLowerCase().startsWith("iphone")) {
    modelName = "i" + modelName.charAt(1).toUpperCase() + modelName.slice(2);
  } else {
    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  }

  // Fetch data to build better metadata
  const { variations } = await getPhoneModelData(id);

  if (!variations || variations.length === 0) {
    return {
      title: `${modelName} Price in Nepal | MobileLoom`,
      description: `Buy ${modelName} in Nepal at the best price. Quality assured with 6-month warranty. Free shipping across Nepal.`,
      keywords: `${modelName} price in Nepal, buy ${modelName} Nepal, ${modelName} specifications, ${modelName} features, smartphone prices Nepal`,
      alternates: {
        canonical: `https://mobileloom.com/home/phone_model_detail/${id}/${title}`,
      },
    };
  }

  // Get price range
  const prices = variations.map((v) => v.price);
  const minPrice = Math.min(...prices);

  // Get all unique properties for the description
  const uniqueColors = [...new Set(variations.map((v) => v.colorName))].join(", ");
  const uniqueStorage = [...new Set(variations.map((v) => v.storage))].join(", ");
  const uniqueConditions = [...new Set(variations.map((v) => v.condition))].join(", ");

  return {
    title: `${modelName} Price in Nepal | Buy ${modelName} @ Best Price | MobileLoom`,
    description: `Buy ${modelName} in Nepal starting at NPR ${minPrice}. Available in ${uniqueColors} colors with ${uniqueStorage} storage options in ${uniqueConditions} condition. 6-month warranty with Free Shipping across Nepal.`,
    keywords: `${modelName} price in Nepal, buy ${modelName} Nepal, ${modelName} specifications, ${modelName} features, smartphone prices Nepal, ${uniqueColors}, ${uniqueStorage}`,
    alternates: {
      canonical: `https://mobileloom.com/home/phone_model_detail/${id}/${title}`,
    },
  };
}

export default async function Layout({ children, params }: Props & { children: React.ReactNode }) {
  // Get the model ID and title from the URL parameters
  const { id, title } = await params;

  // Fetch phone model data for structured data
  const { variations } = await getPhoneModelData(id);

  // Fetch review data separately - simplified to only use modelId
  const reviewData = await getReviewData(id);

  // Only generate structured data if we have variations
  let structuredData = null;

  if (variations && variations.length > 0) {
    structuredData = generateProductStructuredData(variations, reviewData, id, title);
  }

  return (
    <>
      {/* Add structured data script only if we have data to show */}
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />}
      {children}
    </>
  );
}
