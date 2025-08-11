import React from 'react';
import { allContent } from '../../utils/local-content';
import { getComponent } from '../../components/components-registry';
import { seoGenerateTitle, seoGenerateMetaTags, seoGenerateMetaDescription } from '../../utils/seo-utils';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const data = allContent();
  // Assuming resolveStaticPaths returns array of { slug: string[] }
  const paths = require('../../utils/static-paths-resolvers').resolveStaticPaths(data);
  return paths.map((p: any) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const data = allContent();
  const urlPath = '/' + (params.slug || []).join('/');
  const props = await require('../../utils/static-props-resolvers').resolveStaticProps(urlPath, data);
  const { page, site } = props;
  return {
    title: seoGenerateTitle(page, site),
    description: seoGenerateMetaDescription(page, site),
    // Add more metadata as needed
  };
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const data = allContent();
  const urlPath = '/' + (params.slug || []).join('/');
  const props = await require('../../utils/static-props-resolvers').resolveStaticProps(urlPath, data);
  const { page, site } = props;
  const { modelName } = page.__metadata;
  if (!modelName) {
    throw new Error(`page has no type, page '${urlPath}'`);
  }
  const PageLayout = getComponent(modelName) as React.ComponentType<{ page: any; site: any }>;
  if (!PageLayout) {
    throw new Error(`no page layout matching the page model: ${modelName}`);
  }
  return <PageLayout page={page} site={site} />;
}
