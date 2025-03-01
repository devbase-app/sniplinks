import React, { useState } from 'react';
import supabase from '../supabaseClient';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Sniplinks</title>
        <meta name="description" content="Login to your Sniplinks account to manage your shortened links." />
        <meta property="og:title" content="Login - Sniplinks" />
        <meta property="og:description" content="Login to your Sniplinks account." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/login" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Image src="/file.svg" alt="Logo" width={32} height={32} className="text-purple-400" />
            <h1 className="text-4xl font-bold ml-3 text-purple-400">Login</h1>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border-2 border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none bg-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border-2 border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none bg-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-center text-gray-400">
            Don't have an account?{' '}
            <button onClick={() => router.push('/signup')} className="text-purple-400 hover:text-purple-500">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;