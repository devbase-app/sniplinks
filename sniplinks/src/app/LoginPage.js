import React, { useState } from 'react';
import supabase from '../supabaseClient';
import Head from 'next/head';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signIn({ email, password });
    if (error) setError(error.message);
  };

  return (
    <>
      <Head>
        <title>Login - Sniplinks</title>
        <meta name="description" content="Login to your Sniplinks account to manage your links." />
        <meta property="og:title" content="Login - Sniplinks" />
        <meta property="og:description" content="Login to your Sniplinks account to manage your links." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/login" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Login</h1>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Login</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;