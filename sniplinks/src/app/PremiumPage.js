import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import supabase from '../supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const PremiumPage = () => {
  const [user, setUser] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      setCurrentTier(profile?.subscription_tier || 'free');
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    if (processingPayment) return;

    try {
      setProcessingPayment(true);
      setError('');

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user's subscription tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_tier: plan })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setCurrentTier(plan);
      alert('Subscription updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Premium Features - Sniplinks</title>
        <meta name="description" content="Upgrade to Sniplinks Premium for advanced link management features." />
        <meta property="og:title" content="Premium Features - Sniplinks" />
        <meta property="og:description" content="Upgrade to Sniplinks Premium for advanced link management features." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/premium" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Image src="/file.svg" alt="Logo" width={24} height={24} className="text-purple-400" />
                <span className="ml-2 text-xl font-bold text-purple-400">Sniplinks</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-400 mb-4">
              {currentTier === 'free' ? 'Upgrade to Premium' : 'Manage Your Subscription'}
            </h1>
            <p className="text-xl text-gray-400">
              {currentTier === 'free' 
                ? 'Choose the plan that\'s right for you'
                : `You\'re currently on the ${currentTier} plan`}
            </p>
          </div>

          {error && (
            <div className="mb-8 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className={`bg-gray-800 rounded-xl shadow-lg p-8 ${currentTier === 'free' ? 'border-2 border-purple-200' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-400 mb-4">Basic</h2>
              <p className="text-3xl font-bold text-purple-400 mb-6">Free</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 10 links/month
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic Analytics
                </li>
              </ul>
              {currentTier === 'free' ? (
                <button
                  className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade('free')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={processingPayment}
                >
                  Downgrade to Basic
                </button>
              )}
            </div>

            {/* Pro Plan */}
            <div className={`bg-gray-800 rounded-xl shadow-lg p-8 ${currentTier === 'pro' ? 'border-2 border-purple-600 transform scale-105' : ''}`}>
              <div className="absolute top-0 right-0 -mr-1 -mt-1 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
                Popular
              </div>
              <h2 className="text-2xl font-bold text-gray-400 mb-4">Pro</h2>
              <p className="text-3xl font-bold text-purple-400 mb-6">$9.99<span className="text-lg text-gray-500">/mo</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited links
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced Analytics
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom short links
                </li>
              </ul>
              {currentTier === 'pro' ? (
                <button
                  className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade('pro')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className={`bg-gray-800 rounded-xl shadow-lg p-8 ${currentTier === 'enterprise' ? 'border-2 border-purple-600' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-400 mb-4">Enterprise</h2>
              <p className="text-3xl font-bold text-purple-400 mb-6">$49.99<span className="text-lg text-gray-500">/mo</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority Support
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom domain
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Team collaboration
                </li>
              </ul>
              {currentTier === 'enterprise' ? (
                <button
                  className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade('enterprise')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors"
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Upgrade to Enterprise'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PremiumPage;