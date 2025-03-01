import React from 'react';
import Head from 'next/head';

const PremiumPage = () => {
  return (
    <>
      <Head>
        <title>Premium Features - Sniplinks</title>
        <meta name="description" content="Learn about the benefits of our premium features and upgrade your account." />
        <meta property="og:title" content="Premium Features - Sniplinks" />
        <meta property="og:description" content="Learn about the benefits of our premium features and upgrade your account." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/premium" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Premium Features</h1>
          <p className="text-lg mb-8">Learn about the benefits of our premium features and upgrade your account.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Upgrade Now</button>
        </div>
      </div>
    </>
  );
};

export default PremiumPage;