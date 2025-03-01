import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import Head from 'next/head';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) setError(error.message);
      else setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Dashboard - Sniplinks</title>
        <meta name="description" content="Admin dashboard to manage users." />
        <meta property="og:title" content="Admin Dashboard - Sniplinks" />
        <meta property="og:description" content="Admin dashboard to manage users." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/admin" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          {error && <p className="text-red-500">{error}</p>}
          <ul>
            {users.map((user) => (
              <li key={user.id} className="mb-2">
                {user.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;