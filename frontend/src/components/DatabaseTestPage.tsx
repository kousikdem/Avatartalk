import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const DatabaseTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (name: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { name, status, message, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setTestResults([]);
    setLoading(true);

    // Test 1: Check Supabase connection
    try {
      addResult('Supabase Connection', 'success', 'Supabase client initialized');
    } catch (error) {
      addResult('Supabase Connection', 'error', `Failed: ${error}`);
    }

    // Test 2: Check anonymous access
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error && error.message !== 'Auth session missing!') throw error;
      addResult('Auth Check', 'success', user ? `Logged in as: ${user.email}` : 'Anonymous user (correct)');
    } catch (error: any) {
      addResult('Auth Check', 'error', `Error: ${error.message}`);
    }

    // Test 3: Try to fetch profiles (direct query)
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, username, display_name', { count: 'exact' })
        .not('username', 'is', null)
        .limit(5);

      if (error) throw error;
      addResult('Direct Profile Query', 'success', `Found ${count} profiles`, data);
    } catch (error: any) {
      addResult('Direct Profile Query', 'error', `Failed: ${error.message}`);
    }

    // Test 4: Try RPC function (if exists)
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username')
        .not('username', 'is', null)
        .limit(1)
        .single();

      if (profiles?.username) {
        const { data, error } = await supabase
          .rpc('get_public_profile_by_username', { p_username: profiles.username });

        if (error) throw error;
        addResult('RPC Function Test', 'success', `RPC function works!`, data);
      } else {
        addResult('RPC Function Test', 'error', 'No username found to test RPC');
      }
    } catch (error: any) {
      if (error.code === '42883') {
        addResult('RPC Function Test', 'error', 'RPC function does not exist - using fallback is OK');
      } else {
        addResult('RPC Function Test', 'error', `Failed: ${error.message}`);
      }
    }

    // Test 5: Test related tables
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .limit(1);

      if (error) throw error;
      addResult('User Stats Access', 'success', 'Can read user_stats table');
    } catch (error: any) {
      addResult('User Stats Access', 'error', `Failed: ${error.message}`);
    }

    // Test 6: Test products access
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .limit(1);

      if (error) throw error;
      addResult('Products Access', 'success', 'Can read published products');
    } catch (error: any) {
      addResult('Products Access', 'error', `Failed: ${error.message}`);
    }

    // Test 7: List available usernames
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name')
        .not('username', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      addResult('Available Usernames', 'success', `Found ${data?.length || 0} usernames`, data);
    } catch (error: any) {
      addResult('Available Usernames', 'error', `Failed: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
            <p className="text-sm text-gray-600">
              This page tests database connectivity and permissions. Use this to diagnose profile loading issues.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={loading} className="mb-4">
              {loading ? 'Running Tests...' : 'Run Database Tests'}
            </Button>

            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">
                      {result.status === 'success' ? '✅' : '❌'} {result.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={result.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {result.message}
                  </p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">Show data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {testResults.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-8">
                Click "Run Database Tests" to start diagnostics
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Manual Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>After running tests above:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Check if "Direct Profile Query" passes ✅</li>
                <li>If "RPC Function Test" fails, apply the SQL migration</li>
                <li>Copy a username from "Available Usernames"</li>
                <li>Open incognito window and visit: <code className="bg-gray-100 px-1">avatartalk.co/username</code></li>
                <li>Profile should load without login!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTestPage;
