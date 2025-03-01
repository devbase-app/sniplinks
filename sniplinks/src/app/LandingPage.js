import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';

const LandingPage = () => {
  return (
    <>
      <Head>
        <title>Sniplinks - Shorten and Manage Your Links</title>
        <meta name="description" content="Shorten and manage your links with ease using Sniplinks." />
        <meta property="og:title" content="Sniplinks - Shorten and Manage Your Links" />
        <meta property="og:description" content="Shorten and manage your links with ease using Sniplinks." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.cc" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to Sniplinks</h1>
          <p className="text-lg mb-8">Shorten and manage your links with ease.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Get Started</button>
        </motion.div>
      </div>
    </>
  );
};

export default LandingPage;