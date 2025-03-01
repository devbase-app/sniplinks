import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseServer } from '../../lib/supabase-server';
import 'server-only';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  // Extract shortCode from URL
  const url = new URL(request.url);
  const shortCode = url.pathname.substring(1); // Remove leading slash

  if (!shortCode) {
    return Response.redirect(new URL('/not-found', url));
  }

  try {
    const headersList = headers();
    const { data: link } = await supabaseServer
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (!link?.original_url) {
      return Response.redirect(new URL('/not-found', url));
    }

    // Record click and update count concurrently
    await Promise.allSettled([
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
    ]);

    // Return permanent redirect
    return Response.redirect(link.original_url, 301);
  } catch (error) {
    console.error('Error processing redirect:', error);
    return Response.redirect(new URL('/not-found', url));
  }
}