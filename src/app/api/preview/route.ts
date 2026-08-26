import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { previewClient } from '@/lib/cms/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const type = searchParams.get('type');

  // Check the secret and next parameters
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // Fetch the content to check that it exists
  if (slug && type) {
    let query = '';
    let redirectPath = '';

    switch (type) {
      case 'person':
        query = `*[_type == "person" && slug.current == $slug][0]`;
        redirectPath = `/people/${slug}`;
        break;
      case 'publication':
        query = `*[_type == "publication" && slug.current == $slug][0]`;
        redirectPath = `/publications/${slug}`;
        break;
      case 'news':
        query = `*[_type == "news" && slug.current == $slug][0]`;
        redirectPath = `/news/${slug}`;
        break;
      case 'project':
        query = `*[_type == "project" && slug.current == $slug][0]`;
        redirectPath = `/projects/${slug}`;
        break;
      default:
        return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
    }

    // Look the document up through the preview client. The published client
    // cannot see a draft, so checking with it would 404 exactly the documents
    // preview exists to show.
    const content = await previewClient.fetch(query, { slug });

    // If the content doesn't exist prevent preview mode from being enabled
    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    // Enable draft mode through Next's own API. Setting `__prerender_bypass`
    // by hand does not work: the name is reserved, and Next clears the cookie
    // when its value does not match the preview id Next generated, so preview
    // would survive only a handful of requests before pages started 404ing.
    (await draftMode()).enable();
    redirect(redirectPath);
  }

  // If no specific content is being previewed, redirect to home with draft mode enabled
  (await draftMode()).enable();
  redirect('/');
}
