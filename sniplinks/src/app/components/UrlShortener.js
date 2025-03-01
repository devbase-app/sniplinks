'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import supabase from '../../supabaseClient';

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single();
      
      setIsPremium(profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise');
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    setError('');
    try {
      // Basic URL validation on client side
      try {
        new URL(url);
      } catch (e) {
        throw new Error('Please enter a valid URL');
      }

      const payload = {
        url: url.trim(),
        ...(isPremium && customCode && { customCode: customCode.trim() })
      };

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setShortUrl(data.shortUrl);
      setUrl(''); // Clear input after successful shortening
      setCustomCode('');
    } catch (error) {
      console.error('Error shortening URL:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      // Visual feedback for copy success
      const button = document.activeElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16">
        <Image
          src="/globe.svg"
          alt="Globe"
          width={200}
          height={200}
          className="opacity-10"
        />
      </div>
      
      <h3 className="text-2xl font-bold mb-6 text-purple-600">Try it now!</h3>
      <form onSubmit={handleShorten} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-grow w-full space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="w-full p-4 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              required
            />
            {isPremium && (
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Custom short code (optional)"
                className="w-full p-4 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                pattern="[a-zA-Z0-9-_]+"
                title="Only letters, numbers, hyphens, and underscores allowed"
              />
            )}
          </div>
          <motion.button
            type="submit"
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!url || isLoading}
          >
            <Image src="/file.svg" alt="Link" width={20} height={20} className="invert" />
            {isLoading ? 'Processing...' : 'Shorten URL'}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {shortUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 items-center p-4 bg-purple-50 rounded-lg"
          >
            <span className="flex-grow font-medium text-purple-700 break-all">{shortUrl}</span>
            <motion.button
              type="button"
              onClick={copyToClipboard}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Copy
            </motion.button>
          </motion.div>
        )}
      </form>
      <p className="mt-4 text-sm text-slate-500">
        {isPremium ? (
          'You have access to premium features like custom short codes!'
        ) : (
          <button 
            onClick={() => router.push('/premium')}
            className="text-purple-600 hover:text-purple-700"
          >
            Sign up for premium to customize your shortened links and track their performance!
          </button>
        )}
      </p>
    </div>
  );
};

export default UrlShortener;