import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description: string | null;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  flag_name: string;
  is_enabled: boolean;
  description: string | null;
  affected_roles: string[];
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  created_at: string;
}

export interface TokenConfig {
  id: string;
  config_key: string;
  config_value: Record<string, any>;
  description: string | null;
  updated_at: string;
}

export interface AILimit {
  id: string;
  limit_key: string;
  limit_value: Record<string, any>;
  description: string | null;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export const useSuperAdmin = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tokenConfigs, setTokenConfigs] = useState<TokenConfig[]>([]);
  const [aiLimits, setAILimits] = useState<AILimit[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const { toast } = useToast();

  const checkSuperAdminStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        setIsSuperAdmin(false);
      } else {
        setIsSuperAdmin(data?.role === 'super_admin');
      }
    } catch (error) {
      console.error('Error checking super admin status:', error);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlatformSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .order('setting_key');

    if (!error && data) {
      setPlatformSettings(data as PlatformSetting[]);
    }
  }, []);

  const fetchFeatureFlags = useCallback(async () => {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('flag_name');

    if (!error && data) {
      setFeatureFlags(data as FeatureFlag[]);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    if (!isSuperAdmin) return;

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setAuditLogs(data as AuditLog[]);
    }
  }, [isSuperAdmin]);

  const fetchTokenConfigs = useCallback(async () => {
    const { data, error } = await supabase
      .from('token_configuration')
      .select('*')
      .order('config_key');

    if (!error && data) {
      setTokenConfigs(data as TokenConfig[]);
    }
  }, []);

  const fetchAILimits = useCallback(async () => {
    const { data, error } = await supabase
      .from('ai_system_limits')
      .select('*')
      .order('limit_key');

    if (!error && data) {
      setAILimits(data as AILimit[]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (profilesError || !profiles) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

    const usersWithRoles: UserWithRole[] = profiles.map(p => ({
      id: p.id,
      email: p.email || '',
      full_name: p.full_name,
      role: roleMap.get(p.id) || 'user',
      created_at: p.created_at || ''
    }));

    setUsers(usersWithRoles);
  }, [isSuperAdmin]);

  const updatePlatformSetting = async (id: string, value: Record<string, any>) => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update setting', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Setting updated successfully' });
    await fetchPlatformSettings();
    return true;
  };

  const toggleFeatureFlag = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to toggle feature', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: `Feature ${enabled ? 'enabled' : 'disabled'}` });
    await fetchFeatureFlags();
    return true;
  };

  const updateTokenConfig = async (id: string, value: Record<string, any>) => {
    const { error } = await supabase
      .from('token_configuration')
      .update({ config_value: value, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update token config', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Token configuration updated' });
    await fetchTokenConfigs();
    return true;
  };

  const updateAILimit = async (id: string, value: Record<string, any>) => {
    const { error } = await supabase
      .from('ai_system_limits')
      .update({ limit_value: value, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update AI limit', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'AI limit updated' });
    await fetchAILimits();
    return true;
  };

  const assignRole = async (userId: string, role: string) => {
    // First delete any existing role
    await supabase.from('user_roles').delete().eq('user_id', userId);

    // Then insert the new role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: role as any });

    if (error) {
      toast({ title: 'Error', description: 'Failed to assign role', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: `Role assigned: ${role}` });
    await fetchUsers();
    return true;
  };

  const addTokensToUser = async (userId: string, amount: number) => {
    const { error } = await supabase.rpc('credit_user_tokens', {
      p_user_id: userId,
      p_tokens: amount,
      p_reason: 'bonus'
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add tokens', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: `Added ${amount} tokens` });
    return true;
  };

  useEffect(() => {
    checkSuperAdminStatus();
  }, [checkSuperAdminStatus]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPlatformSettings();
      fetchFeatureFlags();
      fetchAuditLogs();
      fetchTokenConfigs();
      fetchAILimits();
      fetchUsers();
    }
  }, [isSuperAdmin, fetchPlatformSettings, fetchFeatureFlags, fetchAuditLogs, fetchTokenConfigs, fetchAILimits, fetchUsers]);

  return {
    isSuperAdmin,
    loading,
    platformSettings,
    featureFlags,
    auditLogs,
    tokenConfigs,
    aiLimits,
    users,
    updatePlatformSetting,
    toggleFeatureFlag,
    updateTokenConfig,
    updateAILimit,
    assignRole,
    addTokensToUser,
    refetch: {
      platformSettings: fetchPlatformSettings,
      featureFlags: fetchFeatureFlags,
      auditLogs: fetchAuditLogs,
      tokenConfigs: fetchTokenConfigs,
      aiLimits: fetchAILimits,
      users: fetchUsers
    }
  };
};
