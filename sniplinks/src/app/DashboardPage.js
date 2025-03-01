import React from 'react';
import Head from 'next/head';

const DashboardPage = () => {
  return (
    <>
      <Head>
        <title>Dashboard - Sniplinks</title>
        <meta name="description" content="Manage your links in the Sniplinks dashboard." />
        <meta property="og:title" content="Dashboard - Sniplinks" />
        <meta property="og:description" content="Manage your links in the Sniplinks dashboard." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/dashboard" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-lg mb-8">Manage your links here.</p>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;