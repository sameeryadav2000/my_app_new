// // app/sitemap.ts
// import { MetadataRoute } from "next";
// import slugify from "slugify";

// // We'll use statically generated sitemap with revalidation
// // Note: No dynamic = 'force-dynamic' to allow static generation

// interface Phone {
//   id: number;
//   phone: string;
//   image: string;
// }

// interface PhoneModel {
//   id: number;
//   model: string;
//   startingPrice: number;
//   phoneId: number;
//   image: string;
// }

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const phones: Phone[] = await fetchAllPhones();
//   const phoneModels: PhoneModel[] = await fetchAllPhoneModels();

//   // Current date
//   const currentDate = new Date();

//   // Base URLs
//   const staticPages = [
//     {
//       url: `${process.env.NEXTAUTH_URL}`,
//       lastModified: currentDate,
//       changeFrequency: "daily" as const,
//       priority: 1,
//     },
//     {
//       url: `${process.env.NEXTAUTH_URL}/home`,
//       lastModified: currentDate,
//       changeFrequency: "daily" as const,
//       priority: 0.9,
//     },
//     {
//       url: `${process.env.NEXTAUTH_URL}/home/account`,
//       lastModified: currentDate,
//       changeFrequency: "monthly" as const,
//       priority: 0.7,
//     },
//     // Add other important static pages as needed
//   ];

//   // Brand pages
//   const phonePages = phones.map((phone) => ({
//     url: `${process.env.NEXTAUTH_URL}/home/phone_model/${encodeURIComponent(phone.id)}/${encodeURIComponent(phone.phone)}`,
//     lastModified: currentDate,
//     changeFrequency: "weekly" as const,
//     priority: 0.8,
//   }));

//   // Phone model pages
//   const phoneModelPages = phoneModels.map((phoneModel) => ({
//     url: `${process.env.NEXTAUTH_URL}/home/phone_model_detail/${phoneModel.id}/${slugify(phoneModel.model, { lower: true, strict: true })}`,
//     lastModified: currentDate,
//     changeFrequency: "weekly" as const,
//     priority: 0.7,
//   }));

//   return [...staticPages, ...phonePages, ...phoneModelPages];
// }

// // Data fetching function for phones
// async function fetchAllPhones(): Promise<Phone[]> {
//   try {
//     // Use revalidate without cache: "no-store" for static generation with periodic updates
//     const response = await fetch(`${process.env.NEXTAUTH_URL}/api/phone`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       next: { revalidate: 3600 }, // Revalidate every hour
//     });

//     const result = await response.json();

//     if (!result.success) {
//       console.error("Error fetching phones for sitemap:", result.message);
//       return []; // Return empty array on error
//     }

//     return result.phones || [];
//   } catch (error) {
//     console.error("Failed to load phones for sitemap: ", error);
//     return []; // Return empty array on error
//   }
// }

// // Data fetching function for phone models
// async function fetchAllPhoneModels(): Promise<PhoneModel[]> {
//   try {
//     // Use revalidate without cache: "no-store" for static generation with periodic updates
//     const response = await fetch(`${process.env.NEXTAUTH_URL}/api/phone_model`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       next: { revalidate: 3600 }, // Revalidate every hour
//     });

//     const result = await response.json();

//     if (!result.success) {
//       console.error("Error fetching phone models for sitemap:", result.message);
//       return []; // Return empty array on error
//     }

//     return result.phoneModels || [];
//   } catch (error) {
//     console.error("Failed to load phone models for sitemap: ", error);
//     return []; // Return empty array on error
//   }
// }

// app/sitemap.ts
import { MetadataRoute } from "next";
import slugify from "slugify";
import prisma from "@/lib/prisma"; // Import your Prisma client

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get phones directly from database - no images
    const phones = await prisma.phone.findMany({
      select: {
        id: true,
        phone: true,
      },
    });

    // Get phone models directly from database - no images
    const phoneModels = await prisma.phoneModel
      .findMany({
        where: {
          phoneModelDetails: {
            some: {
              available: true,
            },
          },
        },
        select: {
          id: true,
          model: true,
          phoneId: true,
          phoneModelDetails: {
            where: { available: true },
            orderBy: { price: "asc" },
            select: { price: true },
            take: 1,
          },
        },
      })
      .then((data) =>
        data.map((model) => ({
          id: model.id,
          model: model.model,
          phoneId: model.phoneId,
          startingPrice: model.phoneModelDetails[0]?.price || null,
        }))
      );

    // Current date
    const currentDate = new Date();

    // Base URLs
    const staticPages = [
      {
        url: `${process.env.NEXTAUTH_URL}`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${process.env.NEXTAUTH_URL}/home`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${process.env.NEXTAUTH_URL}/home/account`,
        lastModified: currentDate,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ];

    // Brand pages
    const phonePages = phones.map((phone) => ({
      url: `${process.env.NEXTAUTH_URL}/home/phone_model/${encodeURIComponent(phone.id)}/${slugify(phone.phone, {
        lower: true,
        strict: true,
      })}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Phone model pages
    const phoneModelPages = phoneModels.map((phoneModel) => ({
      url: `${process.env.NEXTAUTH_URL}/home/phone_model_detail/${phoneModel.id}/${slugify(phoneModel.model, {
        lower: true,
        strict: true,
      })}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...phonePages, ...phoneModelPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return just static pages if there's an error
    return [
      {
        url: `${process.env.NEXTAUTH_URL}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
    ];
  }
}
