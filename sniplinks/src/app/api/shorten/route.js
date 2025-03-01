import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import supabase from '../../../supabaseClient';

export async function POST(request) {
  try {
    // Ensure the request can be parsed as JSON
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('JSON parsing error:', e);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Generate a short code
    const shortCode = nanoid(8);

    console.log('Attempting to insert URL:', {
      original_url: url,
      short_code: shortCode,
      created_at: new Date().toISOString()
    });

    // Insert the URL into the database
    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          original_url: url,
          short_code: shortCode,
          created_at: new Date().toISOString(),
          clicks: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ 
        error: 'Failed to create short URL',
        details: error.message 
      }, { status: 500 });
    }

    // Set appropriate headers
    return NextResponse.json({
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`,
      shortCode,
      originalUrl: url
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Detailed error:', {
      error,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}