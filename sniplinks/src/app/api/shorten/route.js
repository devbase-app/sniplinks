import { NextResponse } from 'next/server';
import supabase from '../../../supabaseClient';

function generateShortCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function checkCustomCodeAvailability(code) {
  const { data } = await supabase
    .from('links')
    .select('id')
    .eq('short_code', code)
    .single();

  return !data; // Return true if code is available (no matching record found)
}

async function checkUserLimits(userId) {
  // Get the current month's start and end dates
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  // Check if user is premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  // If user is premium, no limits apply
  if (profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise') {
    return { allowed: true, isPremium: true };
  }

  // Count user's links for the current month
  const { data, error } = await supabase
    .from('links')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd);

  if (error) {
    throw error;
  }

  // Free tier limit: 10 links per month
  const monthlyLimit = 10;
  return {
    allowed: data.length < monthlyLimit,
    current: data.length,
    limit: monthlyLimit,
    isPremium: false
  };
}

export async function POST(request) {
  try {
    const { url, customCode } = await request.json();

    // Basic validation
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Check rate limits and premium status for authenticated users
    let isPremium = false;
    if (userId) {
      const limits = await checkUserLimits(userId);
      if (!limits.allowed) {
        return NextResponse.json({
          error: `You've reached your monthly limit of ${limits.limit} links. Upgrade to Premium for unlimited links!`
        }, { status: 429 });
      }
      isPremium = limits.isPremium;
    }

    let shortCode;

    // Handle custom code for premium users
    if (customCode) {
      if (!isPremium) {
        return NextResponse.json({
          error: 'Custom short codes are only available for premium users'
        }, { status: 403 });
      }

      // Validate custom code format
      if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
        return NextResponse.json({
          error: 'Custom code can only contain letters, numbers, hyphens, and underscores'
        }, { status: 400 });
      }

      // Check if custom code is available
      const isAvailable = await checkCustomCodeAvailability(customCode);
      if (!isAvailable) {
        return NextResponse.json({
          error: 'This custom code is already taken'
        }, { status: 409 });
      }

      shortCode = customCode;
    } else {
      // Generate a random code if no custom code provided
      shortCode = generateShortCode();
    }

    // Save to database
    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          original_url: url,
          short_code: shortCode,
          user_id: userId || null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving to database:', error);
      return NextResponse.json({ error: 'Failed to create short link' }, { status: 500 });
    }

    // Construct the short URL using the host from the request
    const shortUrl = `${request.headers.get('host')}/${shortCode}`;

    return NextResponse.json({ shortUrl, shortCode });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}