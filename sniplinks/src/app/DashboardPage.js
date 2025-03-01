import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import supabase from '../supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const DashboardPage = () => {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [stats, setStats] = useState({
    totalClicks: 0,
    monthlyClicks: 0,
    avgClicksPerLink: 0
  });
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      router.push('/login');
      return;
    }

    setUser(session.user);

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();

    const userIsPremium = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise';
    setIsPremium(userIsPremium);

    await fetchLinks(session.user.id, userIsPremium);
    setLoading(false);
  };

  const fetchLinks = async (userId, isPremium) => {
    try {
      // Get links with their clicks
      let query = supabase
        .from('links')
        .select(`
          *,
          clicks (
            clicked_at,
            referrer,
            user_agent
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      setLinks(data || []);

      // Calculate stats using detailed click data
      const totalClicks = data.reduce((sum, link) => sum + (link.clicks?.length || 0), 0);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      const dailyClicksData = data.reduce((acc, link) => {
        (link.clicks || []).forEach(click => {
          const clickDate = new Date(click.clicked_at);
          if (clickDate >= last30Days) {
            const dateKey = clickDate.toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + 1;
          }
        });
        return acc;
      }, {});

      // Convert to array and fill in missing dates
      const clicksOverTime = [];
      for (let d = new Date(last30Days); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        clicksOverTime.push({
          date: dateKey,
          clicks: dailyClicksData[dateKey] || 0
        });
      }

      const monthlyClicks = data.reduce((sum, link) => {
        return sum + (link.clicks || []).filter(click => {
          const clickDate = new Date(click.clicked_at);
          return clickDate >= monthStart;
        }).length;
      }, 0);

      const avgClicksPerLink = data.length ? Math.round(totalClicks / data.length) : 0;

      // Top performing links with detailed click data
      const topLinks = [...data]
        .sort((a, b) => (b.clicks?.length || 0) - (a.clicks?.length || 0))
        .slice(0, 5)
        .map(link => ({
          ...link,
          clicksByPlatform: (link.clicks || []).reduce((acc, click) => {
            const userAgent = click.user_agent || 'Unknown';
            const platform = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
            acc[platform] = (acc[platform] || 0) + 1;
            return acc;
          }, {}),
          clicksByReferrer: (link.clicks || []).reduce((acc, click) => {
            const referrer = new URL(click.referrer || window.location.origin).hostname;
            acc[referrer] = (acc[referrer] || 0) + 1;
            return acc;
          }, {})
        }));

      setStats({
        totalClicks,
        monthlyClicks,
        avgClicksPerLink,
        clicksOverTime,
        topLinks
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching links');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLinks(links.filter(link => link.id !== id));
    } catch (error) {
      console.error('Error:', error);
      setError('Error deleting link');
    }
  };

  const copyToClipboard = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      // Visual feedback could be added here
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Sniplinks</title>
        <meta name="description" content="Manage your shortened links in the Sniplinks dashboard." />
        <meta property="og:title" content="Dashboard - Sniplinks" />
        <meta property="og:description" content="Manage your links in the Sniplinks dashboard." />
        <meta property="og:image" content="/public/og-image.png" />
        <meta property="og:url" content="https://sniplinks.com/dashboard" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Image src="/file.svg" alt="Logo" width={24} height={24} className="text-purple-400" />
                <span className="ml-2 text-xl font-bold text-purple-400">Sniplinks</span>
              </div>
              <div className="flex items-center gap-4">
                {!isPremium && (
                  <button
                    onClick={() => router.push('/premium')}
                    className="px-4 py-2 text-purple-400 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Upgrade to Premium
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analytics Overview */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Total Clicks</h3>
                <p className="text-3xl font-bold text-purple-500">{stats.totalClicks}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-purple-500">{stats.monthlyClicks}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Avg. per Link</h3>
                <p className="text-3xl font-bold text-purple-500">{stats.avgClicksPerLink}</p>
              </div>
            </div>
            
            {isPremium && links.length > 0 && (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Clicks Over Time (Last 30 Days)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.clicksOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value) => [`${value} clicks`]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="#7C3AED" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {stats.topLinks && stats.topLinks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Top Performing Links</h3>
                    <div className="space-y-4">
                      {stats.topLinks.map((link) => (
                        <div key={link.id} className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-grow truncate mr-4">
                              <p className="text-sm text-purple-500 font-medium truncate">{link.original_url}</p>
                              <p className="text-xs text-purple-400">{`${window.location.host}/${link.short_code}`}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-purple-500">{link.clicks?.length || 0} clicks</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                            {/* Platform breakdown */}
                            <div className="bg-gray-800 p-3 rounded-lg">
                              <h4 className="font-medium text-purple-400 mb-2">Platform Breakdown</h4>
                              <div className="space-y-2">
                                {Object.entries(link.clicksByPlatform || {}).map(([platform, count]) => (
                                  <div key={platform} className="flex justify-between items-center">
                                    <span className="text-slate-400">{platform}</span>
                                    <span className="font-medium">{count} clicks</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Top referrers */}
                            <div className="bg-gray-800 p-3 rounded-lg">
                              <h4 className="font-medium text-purple-400 mb-2">Top Referrers</h4>
                              <div className="space-y-2">
                                {Object.entries(link.clicksByReferrer || {})
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 3)
                                  .map(([referrer, count]) => (
                                    <div key={referrer} className="flex justify-between items-center">
                                      <span className="text-slate-400 truncate">{referrer}</span>
                                      <span className="font-medium">{count} clicks</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400">Your Links</h2>
              {isPremium && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Premium User
                </span>
              )}
            </div>
            
            {error && (
              <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {links.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Image src="/file.svg" alt="No links" width={48} height={48} className="mx-auto mb-4 opacity-50" />
                <p>You haven't created any links yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link.id} className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex-grow space-y-2 w-full">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                        <span className="text-sm text-slate-400">Original URL:</span>
                        <p className="text-slate-300 truncate flex-grow">{link.original_url}</p>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                        <span className="text-sm text-slate-400">Short URL:</span>
                        <p className="text-purple-400 font-medium">{`${window.location.host}/${link.short_code}`}</p>
                      </div>
                      {isPremium && (
                        <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                          <span className="text-sm text-slate-400">Performance:</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{link.clicks || 0} clicks</span>
                            <span className="text-sm">Created: {new Date(link.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(`${window.location.host}/${link.short_code}`)}
                        className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2  3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;