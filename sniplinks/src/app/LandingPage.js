'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UrlShortener from './components/UrlShortener';

const LandingPage = () => {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="w-full bg-gray-800 p-4 shadow-lg fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image src="/file.svg" alt="Logo" width={24} height={24} className="text-purple-400" />
            <span className="ml-2 text-xl font-bold text-purple-400">Sniplinks</span>
          </button>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => handleNavigation('/pricing')}
              className="px-4 py-2 text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavigation('/login')}
              className="px-4 py-2 text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleNavigation('/signup')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 pt-24">
        {/* Hero Section */}
        <motion.section 
          className="text-center py-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-5xl font-bold text-purple-400 mb-6"
            variants={itemVariants}
          >
            Shorten Your Links, Expand Your Reach
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Transform long URLs into memorable, trackable links. Perfect for social media, marketing campaigns, or sharing with your audience.
          </motion.p>
          
          {/* URL Shortener Component */}
          <motion.div variants={itemVariants}>
            <UrlShortener />
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center text-purple-400 mb-12">Why Choose Sniplinks?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Image src="/globe.svg" alt="Global" width={24} height={24} />
              </div>
              <h3 className="text-xl font-semibold text-purple-400 mb-3">Global Reach</h3>
              <p className="text-gray-400">Share your links worldwide with fast, reliable redirection and tracking.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Image src="/window.svg" alt="Analytics" width={24} height={24} />
              </div>
              <h3 className="text-xl font-semibold text-purple-400 mb-3">Detailed Analytics</h3>
              <p className="text-gray-400">Track clicks, analyze traffic sources, and understand your audience better.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Image src="/file.svg" alt="Customize" width={24} height={24} />
              </div>
              <h3 className="text-xl font-semibold text-purple-400 mb-3">Custom Links</h3>
              <p className="text-gray-400">Create branded, memorable links that reflect your identity.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <h2 className="text-3xl font-bold text-purple-400 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Sniplinks for their link management needs.
          </p>
          <button
            onClick={() => handleNavigation('/signup')}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
          >
            Create Your Free Account
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Sniplinks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;