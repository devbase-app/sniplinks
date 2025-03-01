import { NextResponse } from 'next/server';
import supabase from '../../supabaseClient';

export async function GET(request, { params }) {
  const shortCode = params.shortCode;

  try {
    // Query the original URL from the database
    const { data, error } = await supabase
      .from('links')
      .select('original_url')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment click count (optional)
    await supabase
      .from('links')
      .update({ clicks: supabase.sql`clicks + 1` })
      .eq('short_code', shortCode);

    // Redirect to the original URL
    return NextResponse.redirect(data.original_url);
  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}