import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLinks: 0,
    totalClicks: 0,
  });
  const router = useRouter();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Check if user is admin (you should have an is_admin column in your users table)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        router.push('/dashboard');
        return;
      }

      // Load all data
      await Promise.all([
        fetchUsers(),
        fetchLinks(),
        fetchStats(),
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load admin dashboard');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setLinks(data || []);
  };

  const fetchStats = async () => {
    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('clicks');

    if (linksError) throw linksError;

    const totalClicks = linksData.reduce((sum, link) => sum + (link.clicks || 0), 0);

    setStats({
      totalUsers: users.length,
      totalLinks: links.length,
      totalClicks,
    });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete all user data including their links.')) {
      return;
    }

    try {
      // First delete all user's links
      const { error: linksError } = await supabase
        .from('links')
        .delete()
        .eq('user_id', userId);

      if (linksError) throw linksError;

      // Then delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Finally delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw authError;

      // Refresh data
      await fetchUsers();
      await fetchLinks();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Sniplinks</title>
        <meta name="description" content="Admin dashboard to manage users and view analytics." />
        <meta property="og:title" content="Admin Dashboard - Sniplinks" />
        <meta property="og:description" content="Admin dashboard to manage users and analytics." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/admin" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Image src="/file.svg" alt="Logo" width={24} height={24} className="text-purple-400" />
                <span className="ml-2 text-xl font-bold text-purple-400">Sniplinks Admin</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-purple-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Exit Admin Mode
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-8 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-400">Total Users</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.totalUsers}</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-400">Total Links</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.totalLinks}</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-400">Total Clicks</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.totalClicks}</p>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3">Links</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-50">
                      <td className="py-3 text-white">{user.email}</td>
                      <td className="py-3 text-white">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-white">
                        {links.filter(link => link.user_id === user.id).length}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Links */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Recent Links</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-100">
                    <th className="pb-3">Original URL</th>
                    <th className="pb-3">Short Code</th>
                    <th className="pb-3">Created By</th>
                    <th className="pb-3">Clicks</th>
                    <th className="pb-3">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-b border-slate-50">
                      <td className="py-3 max-w-xs truncate text-white">{link.original_url}</td>
                      <td className="py-3 text-white">{link.short_code}</td>
                      <td className="py-3 text-white">{link.profiles?.email || 'Anonymous'}</td>
                      <td className="py-3 text-white">{link.clicks || 0}</td>
                      <td className="py-3 text-white">{new Date(link.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;