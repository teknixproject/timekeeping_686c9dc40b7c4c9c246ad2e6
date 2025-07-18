import _ from 'lodash';
import { Metadata } from 'next';
import Head from 'next/head';
import { headers } from 'next/headers';
import { FC, Suspense } from 'react';

import { fetchMetadata } from '@/app/actions/server';
import { getMatchingRoutePattern } from '@/uitls/pathname';

import { RenderUIClient } from '../grid-systems/ClientWrapGridSystem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
interface MetadataIcon {
  data?: {
    form?: {
      icon?: {
        icon?: string;
        apple?: string;
        shortcut?: string;
      };
    };
  };
}
export async function generateMetadata(): Promise<Metadata> {
  const path = 'NextJS';

  const metadata = await fetchMetadata(path);
  const formMetadata = _.get(metadata, 'data.form');

  if (!formMetadata) {
    return {
      title: 'NextJS',
      description: 'NextJS 15',
    };
  }
  const iconConfig = {
    icon: _.get(formMetadata, 'icon.icon'),
    shortcut: _.get(formMetadata, 'icon.shortcut'),
    apple: _.get(formMetadata, 'icon.apple'),
  };

  return {
    title: {
      default: formMetadata?.title?.default || 'NextJS PAGE',
      template: formMetadata?.title.template,
    },
    description: formMetadata?.description || 'Default NextJS Page.',
    keywords: formMetadata?.keywords,
    authors: formMetadata?.authors?.map((author: any) => ({
      name: author.name,
      url: author.url,
    })),
    openGraph: {
      title: formMetadata?.openGraph?.title || 'NEXTJS PAGE',
      description: formMetadata?.openGraph?.description || 'Default NextJS page.',
      url: formMetadata?.openGraph?.url,
      siteName: formMetadata?.openGraph?.siteName,
      images: formMetadata?.openGraph?.images?.map((image: any) => ({
        url: image?.url,
        width: image?.width,
        height: image?.height,
        alt: image?.alt,
        secureUrl: image?.secure_url,
        type: image?.type || 'image/jpeg',
      })),
      locale: formMetadata?.openGraph?.locale || 'en_US',
      type: formMetadata?.openGraph?.type || 'website',
      modifiedTime: formMetadata?.openGraph?.updated_time,
    },
    twitter: {
      card: formMetadata?.twitter?.card || 'summary',
      title: formMetadata?.twitter?.title,
      description: formMetadata?.twitter?.description,
      images: formMetadata?.twitter?.images,
    },
    robots: {
      index: formMetadata?.robots?.index,
      follow: formMetadata?.robots?.follow,
      nocache: formMetadata?.robots?.nocache,
      'max-snippet': formMetadata?.robots?.maxSnippet,
      'max-video-preview': formMetadata?.robots?.maxVideoPreview,
      'max-image-preview': formMetadata?.robots?.maxImagePreview,
      googleBot: formMetadata?.robots?.googleBot
        ? {
            index: formMetadata?.robots?.googleBot?.index,
            follow: formMetadata?.robots?.googleBot?.follow,
            noimageindex: formMetadata?.robots?.googleBot?.noimageindex,
          }
        : undefined,
    },
    icons: {
      icon: iconConfig.icon || undefined,
      shortcut: iconConfig.shortcut || undefined,
      apple: iconConfig.apple || undefined,
    },
    alternates: {
      canonical: formMetadata?.alternates?.canonical || undefined,
    },
  };
}
// utils/getOrigin.ts

export async function getOrigin() {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');
  const origin = `${proto}://${host}`;

  return origin;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getPatterns = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API_URL}/document/uids?projectId=${PROJECT_ID || ''}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    const uids = Array.isArray(data) ? data.map((item: any) => item?.uid).filter(Boolean) : [];
    return uids;
  } catch (error) {
    console.log('🚀 ~ getPatterns ~ error:', error);
    return [];
  }
};
const EntryPage: FC = async () => {
  const patterns: string[] = await getPatterns();

  // Get pathname from headers
  const headerList = await headers();
  const pathname = headerList.get('x-path-name');
  if (!pathname) {
    return <div>Error: Pathname not found</div>;
  }

  // Find matching pattern
  const matchingPattern = getMatchingRoutePattern(pathname, patterns);

  // Fetch metadata
  const metadata: MetadataIcon = await fetchMetadata(matchingPattern || '');

  // Safely access metadata
  const formMetadata = metadata?.data?.form || {};
  const iconUrl = formMetadata?.icon?.icon || '/favicon.ico';
  const appleIcon = formMetadata?.icon?.apple || '/apple-icon.png';
  const shortcutIcon = formMetadata?.icon?.shortcut || '/shortcut-icon.png';

  return (
    <>
      <Head>
        <link rel="icon" href={iconUrl} type="image/png" />
        <link rel="preload" href={iconUrl} as="image" />
        <link rel="apple-touch-icon" href={appleIcon} />
        <link rel="shortcut icon" href={shortcutIcon} />
      </Head>
      <Suspense fallback={<div>Loading UI...</div>}>
        <RenderUIClient />
      </Suspense>
    </>
  );
};
export default EntryPage;
