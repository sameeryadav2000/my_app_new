import Home from "@/src/app/home/home_client";

export default function HomePage() {
  // Define the structured data outside the component
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "MobileLoom - Latest Smartphones in Nepal with Prices",
    description:
      "Explore the latest iPhones, Samsung, Xiaomi, Vivo and other smartphones available in Nepal with updated prices and specifications.",
    url: "https://mobileloom.com",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "iPhone",
          url: "https://mobileloom.com/home/phone_model/1/iphone",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Samsung",
          url: "https://mobileloom.com/home/phone_model/2/samsung",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Xiaomi",
          url: "https://mobileloom.com/home/phone_model/3/xiaomi",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Vivo",
          url: "https://mobileloom.com/home/phone_model/4/vivo",
        },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }} />
      <Home />
    </>
  );
}
