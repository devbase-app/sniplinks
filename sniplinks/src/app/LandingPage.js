'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UrlShortener from './components/UrlShortener';

const LandingPage = () => {
  const router = useRouter();

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50 text-slate-700">
      <header className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white sticky top-0 z-50 shadow-lg">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/file.svg" alt="Logo" width={24} height={24} className="invert" />
          <h1 className="text-2xl font-bold">Sniplinks</h1>
        </motion.div>
        <motion.button 
          className="px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-100 transform hover:scale-105 transition-all shadow-md"
          onClick={() => router.push('/signup')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start p-6 max-w-6xl mx-auto w-full">
        <motion.section 
          className="text-center mb-16 mt-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Simplify Your Links
            </h2>
            <p className="text-xl mb-8 text-slate-600">Transform long, complicated URLs into clean, memorable links.</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            variants={containerVariants}
          >
            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-purple-400"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Image src="/file.svg" alt="Quick" width={40} height={40} className="mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3 text-purple-600">Quick & Easy</h3>
              <p className="text-slate-600">Shorten links in seconds with our intuitive interface</p>
            </motion.div>

            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-purple-500"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Image src="/window.svg" alt="Analytics" width={40} height={40} className="mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3 text-purple-600">Track & Analyze</h3>
              <p className="text-slate-600">Get detailed insights about your links' performance</p>
            </motion.div>

            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-purple-600"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Image src="/globe.svg" alt="Customize" width={40} height={40} className="mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3 text-purple-600">Customize</h3>
              <p className="text-slate-600">Create branded links that reflect your identity</p>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section 
          className="w-full my-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <UrlShortener />
        </motion.section>

        <motion.section 
          className="text-center bg-gradient-to-br from-purple-600 to-purple-700 text-white p-12 rounded-2xl w-full shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold mb-8">Premium Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Image src="/window.svg" alt="Analytics" width={32} height={32} className="mb-4 mx-auto invert" />
              <h4 className="text-xl font-semibold mb-2">Advanced Analytics</h4>
              <p className="text-purple-100">Deep insights into click patterns and user behavior</p>
            </motion.div>
            <motion.div 
              className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Image src="/globe.svg" alt="Domains" width={32} height={32} className="mb-4 mx-auto invert" />
              <h4 className="text-xl font-semibold mb-2">Custom Domains</h4>
              <p className="text-purple-100">Use your own domain for branded short links</p>
            </motion.div>
            <motion.div 
              className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Image src="/vercel.svg" alt="Support" width={32} height={32} className="mb-4 mx-auto invert" />
              <h4 className="text-xl font-semibold mb-2">Priority Support</h4>
              <p className="text-purple-100">24/7 dedicated customer support</p>
            </motion.div>
          </div>
          <motion.button 
            className="mt-12 px-8 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-purple-100 transform hover:scale-105 transition-all shadow-md"
            onClick={() => router.push('/premium')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade to Premium
          </motion.button>
        </motion.section>
      </main>
    </div>
  );
};

export default LandingPage;