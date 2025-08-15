import React from 'react';
import { allContent } from '../../utils/local-content';
import { getComponent } from '../../components/components-registry';
import { resolveStaticProps } from '../../utils/static-props-resolvers';
import { resolveStaticPaths } from '../../utils/static-paths-resolvers';
import { seoGenerateTitle, seoGenerateMetaTags, seoGenerateMetaDescription } from '../../utils/seo-utils';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

// Generate static parameters for all pages
export async function generateStaticParams(): Promise<{ slug?: string[] }[]> {
  const data = allContent();
  const paths = resolveStaticPaths(data);
  
  return paths
    .filter((path: string) => {
      // Filter out static assets and API routes
      return !path.match(/\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|css|js|map)$/i) &&
             !path.startsWith('/api/') &&
             !path.startsWith('/_next/') &&
             !path.startsWith('/fonts/');
    })
    .map((path: string) => {
      // Remove leading slash and split into segments
      const slugSegments = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
      // Filter out empty segments
      const filteredSegments = slugSegments.filter(segment => segment.length > 0);
      
      // Handle root path case
      if (filteredSegments.length === 0) {
        return {}; // No slug for root path
      }
      
      return {
        slug: filteredSegments
      };
    });
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const data = allContent();
    const urlPath = '/' + (resolvedParams.slug || []).join('/');
    
    // Skip static assets and API routes
    if (urlPath.match(/\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|css|js|map)$/i) || 
        urlPath.startsWith('/api/') || 
        urlPath.startsWith('/_next/') ||
        urlPath.startsWith('/fonts/')) {
      return {
        title: 'ZKTheory',
        description: 'Mathematics, cryptography, and visualization tools',
      };
    }
    
    const props = await resolveStaticProps(urlPath, data);
    
    // Check if props is null or undefined
    if (!props) {
      console.warn('No props returned for path:', urlPath);
      return {
        title: 'ZKTheory',
        description: 'Mathematics, cryptography, and visualization tools',
      };
    }
    
    const { page, site } = props;
    
    const title = seoGenerateTitle(page, site);
    const description = seoGenerateMetaDescription(page, site);
    const metaTags = seoGenerateMetaTags(page, site);
    
    // Build metadata object
    const metadata: Metadata = {
      title,
      description,
    };
    
    // Add OpenGraph and other meta tags
    const openGraph: any = {};
    const twitter: any = {};
    const other: any = {};
    
    metaTags.forEach((metaTag: any) => {
      if (metaTag.property?.startsWith('og:')) {
        const key = metaTag.property.replace('og:', '');
        openGraph[key] = metaTag.content;
      } else if (metaTag.property?.startsWith('twitter:')) {
        const key = metaTag.property.replace('og:', '');
        twitter[key] = metaTag.content;
      } else if (metaTag.property) {
        other[metaTag.property] = metaTag.content;
      }
    });
    
    if (Object.keys(openGraph).length > 0) {
      metadata.openGraph = openGraph;
    }
    
    if (Object.keys(twitter).length > 0) {
      metadata.twitter = twitter;
    }
    
    if (Object.keys(other).length > 0) {
      metadata.other = other;
    }
    
    // Add favicon if available
    if (site.favicon) {
      metadata.icons = {
        icon: site.favicon,
      };
    }
    
    return metadata;
  } catch (error) {
    const resolvedParams = await params;
    console.error('Error generating metadata for path:', '/' + (resolvedParams.slug || []).join('/'), error);
    return {
      title: 'ZKTheory',
      description: 'Mathematics, cryptography, and visualization tools',
    };
  }
}

// Main page component
export default async function Page({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const data = allContent();
    const urlPath = '/' + (resolvedParams.slug || []).join('/');
    
    // Skip static assets and API routes
    if (urlPath.match(/\.(woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico|css|js|map)$/i) || 
        urlPath.startsWith('/api/') || 
        urlPath.startsWith('/_next/') ||
        urlPath.startsWith('/fonts/')) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Static Asset</h1>
            <p className="text-gray-600 mb-8">
              This is a static asset and cannot be rendered as a page.
            </p>
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              Return to Home
            </a>
          </div>
        </div>
      );
    }
    
    const props = await resolveStaticProps(urlPath, data);
    
    // Check if props is null or undefined
    if (!props) {
      console.warn('No props returned for path:', urlPath);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or there was an error loading it.
            </p>
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              Return to Home
            </a>
          </div>
        </div>
      );
    }
    
    const { page, site } = props;
    
    const { modelName } = page.__metadata;
    
    if (!modelName) {
      throw new Error(`Page has no type, page '${urlPath}'`);
    }
    
    const PageLayout = getComponent(modelName) as React.ComponentType<{ page: any; site: any }>;
    
    if (!PageLayout) {
      throw new Error(`No page layout matching the page model: ${modelName}`);
    }
    
    return <PageLayout page={page} site={site} />;
  } catch (error) {
    const resolvedParams = await params;
    console.error('Error rendering page:', '/' + (resolvedParams.slug || []).join('/'), error);
    
    // Return a basic error page
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or there was an error loading it.
          </p>
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }
}
