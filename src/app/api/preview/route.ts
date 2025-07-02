import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/cms/client';

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

    const content = await client.fetch(query, { slug });

    // If the content doesn't exist prevent preview mode from being enabled
    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    // Enable Preview Mode by setting the cookies
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    response.cookies.set('__prerender_bypass', '1', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none'
    });
    response.cookies.set('__next_preview_data', '1', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none'
    });

    return response;
  }

  // If no specific content is being previewed, redirect to home with preview mode enabled
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('__prerender_bypass', '1', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });
  response.cookies.set('__next_preview_data', '1', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });

  return response;
}