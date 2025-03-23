// src/app/homepage/product_page/[title]/layout.tsx
import { Metadata } from 'next';

type Props = {
  params: { title: string }
  children: React.ReactNode
}

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  // Wait for params to be fully resolved
  const params = await props.params;
  
  // Get the title safely
  const titleSlug = String(params.title || '');
  
  // Format the title from slug with better capitalization
  const formattedTitle = titleSlug
    .split('-')
    .map((word: string) => {
      if (word.toLowerCase() === 'iphone') return 'iPhone';
      if (word.toLowerCase() === 'ipad') return 'iPad';
      if (word.toLowerCase() === 'samsung') return 'Samsung';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  // Create image path
  const imagePath = `/images/categories/${titleSlug.split('-')[0]}.jpg`;
  
  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
    title: `Buy Refurbished ${formattedTitle} | Phone Store`,
    description: `Shop certified refurbished ${formattedTitle} with warranty.`,
    openGraph: {
      title: `Verified Refurbished ${formattedTitle}`,
      description: `Save on certified refurbished ${formattedTitle}.`,
      images: [imagePath],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Save on Refurbished ${formattedTitle}`,
      images: [imagePath],
    }
  };
}

export default function ProductPageLayout({ children }: Props) {
  return <>{children}</>;
}