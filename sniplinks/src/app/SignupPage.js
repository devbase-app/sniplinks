import React, { useState } from 'react';
import supabase from '../supabaseClient';
import Head from 'next/head';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://sniplinks.com/welcome',
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('A verification email has been sent to your email address. Please verify your email before logging in.');
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Sniplinks</title>
        <meta name="description" content="Sign up for a Sniplinks account to start managing your links." />
        <meta property="og:title" content="Sign Up - Sniplinks" />
        <meta property="og:description" content="Sign up for a Sniplinks account to start managing your links." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/signup" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Sign Up</h1>
          <form className="space-y-4" onSubmit={handleSignup}>
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
            {message && <p className="text-green-500">{message}</p>}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Sign Up</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignupPage;