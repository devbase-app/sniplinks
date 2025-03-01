import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseServer } from '../../lib/supabase-server';
import 'server-only';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  if (!params?.shortCode) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  try {
    const headersList = headers();

    // Find the link in the database
    const { data: link } = await supabaseServer
      .from('links')
      .select('*')
      .eq('short_code', params.shortCode)
      .single();

    if (!link?.original_url) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // Fire and forget analytics update
    Promise.allSettled([
      supabaseServer
        .from('clicks')
        .insert([
          {
            link_id: link.id,
            clicked_at: new Date().toISOString(),
            referrer: headersList.get('referer') || null,
            user_agent: headersList.get('user-agent') || null
          }
        ]),
      supabaseServer
        .from('links')
        .update({ clicks: (link.clicks || 0) + 1 })
        .eq('id', link.id)
    ]).catch(console.error); // Handle errors silently to not affect redirect

    return NextResponse.redirect(link.original_url);
  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.redirect(new URL('/not-found', request.url));
  }
}