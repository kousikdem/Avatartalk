import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const SupabaseDiagnostic: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {};

    try {
      // Test 1: Check environment variables
      diagnostics.env = {
        url: import.meta.env.VITE_SUPABASE_URL,
        keyExists: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        keyPreview: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30) + '...'
      };

      // Test 2: Check auth
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      diagnostics.auth = {
        hasSession: !!sessionData.session,
        user: sessionData.session?.user?.email || 'Not logged in',
        error: sessionError?.message
      };

      // Test 3: Try to fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, email')
        .limit(5);

      diagnostics.profiles = {
        count: profilesData?.length || 0,
        error: profilesError?.message,
        sample: profilesData?.[0],
        columns: profilesData?.[0] ? Object.keys(profilesData[0]) : []
      };

      // Test 4: Check other tables
      const tables = ['user_stats', 'products', 'events', 'social_links', 'avatar_configurations'];
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        diagnostics[table] = {
          exists: !error,
          error: error?.message,
          hasData: (data?.length || 0) > 0
        };
      }

    } catch (error: any) {
      diagnostics.criticalError = error.message;
    }

    setResults(diagnostics);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? 'Running...' : 'Re-run Diagnostics'}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {results.profiles && results.profiles.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found {results.profiles.count} User Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Sample profile: {results.profiles.sample?.username || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              Columns: {results.profiles.columns.join(', ')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupabaseDiagnostic;
