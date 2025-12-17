import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationSecret {
  id: string;
  integration_name: string;
  secret_key: string;
  secret_value: string | null;
  environment: 'test' | 'live';
  is_active: boolean;
  last_verified_at: string | null;
  verification_status: 'pending' | 'verified' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  integration_name: string;
  event_type: string;
  payload: Record<string, any> | null;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  created_at: string;
  processed_at: string | null;
}

export interface PaymentFailureLog {
  id: string;
  order_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  failure_reason: string | null;
  error_code: string | null;
  error_description: string | null;
  amount: number | null;
  currency: string;
  user_id: string | null;
  seller_id: string | null;
  metadata: Record<string, any> | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface RefundOverride {
  id: string;
  order_id: string | null;
  razorpay_payment_id: string | null;
  original_amount: number;
  refund_amount: number;
  refund_reason: string | null;
  override_reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  razorpay_refund_id: string | null;
  initiated_by: string;
  approved_by: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface SettlementLog {
  id: string;
  settlement_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  utr: string | null;
  settlement_type: string | null;
  fees: number;
  tax: number;
  net_amount: number | null;
  settlement_date: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface TaxConfiguration {
  id: string;
  country_code: string;
  country_name: string;
  tax_type: string;
  tax_rate: number;
  tax_name: string;
  is_inclusive: boolean;
  is_active: boolean;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CountryPaymentRule {
  id: string;
  country_code: string;
  country_name: string;
  payment_enabled: boolean;
  allowed_methods: string[];
  min_order_amount: number;
  max_order_amount: number | null;
  currency: string;
  requires_kyc: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  setting_category: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useSuperAdminIntegrations = () => {
  const [integrationSecrets, setIntegrationSecrets] = useState<IntegrationSecret[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [paymentFailures, setPaymentFailures] = useState<PaymentFailureLog[]>([]);
  const [refundOverrides, setRefundOverrides] = useState<RefundOverride[]>([]);
  const [settlementLogs, setSettlementLogs] = useState<SettlementLog[]>([]);
  const [taxConfigurations, setTaxConfigurations] = useState<TaxConfiguration[]>([]);
  const [countryPaymentRules, setCountryPaymentRules] = useState<CountryPaymentRule[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrationSecrets = useCallback(async () => {
    const { data, error } = await supabase
      .from('platform_integration_secrets')
      .select('*')
      .order('integration_name');

    if (!error && data) {
      setIntegrationSecrets(data as IntegrationSecret[]);
    }
  }, []);

  const fetchWebhookLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setWebhookLogs(data as WebhookLog[]);
    }
  }, []);

  const fetchPaymentFailures = useCallback(async () => {
    const { data, error } = await supabase
      .from('payment_failure_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setPaymentFailures(data as PaymentFailureLog[]);
    }
  }, []);

  const fetchRefundOverrides = useCallback(async () => {
    const { data, error } = await supabase
      .from('refund_overrides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setRefundOverrides(data as RefundOverride[]);
    }
  }, []);

  const fetchSettlementLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('settlement_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setSettlementLogs(data as SettlementLog[]);
    }
  }, []);

  const fetchTaxConfigurations = useCallback(async () => {
    const { data, error } = await supabase
      .from('tax_configurations')
      .select('*')
      .order('country_name');

    if (!error && data) {
      setTaxConfigurations(data as TaxConfiguration[]);
    }
  }, []);

  const fetchCountryPaymentRules = useCallback(async () => {
    const { data, error } = await supabase
      .from('country_payment_rules')
      .select('*')
      .order('country_name');

    if (!error && data) {
      setCountryPaymentRules(data as CountryPaymentRule[]);
    }
  }, []);

  const fetchSiteSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_category');

    if (!error && data) {
      setSiteSettings(data as SiteSetting[]);
    }
  }, []);

  const saveIntegrationSecret = async (secret: Partial<IntegrationSecret>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (secret.id) {
      const { error } = await supabase
        .from('platform_integration_secrets')
        .update({
          integration_name: secret.integration_name,
          secret_key: secret.secret_key,
          secret_value: secret.secret_value,
          environment: secret.environment,
          is_active: secret.is_active,
          updated_by: user?.id
        })
        .eq('id', secret.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update secret', variant: 'destructive' });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('platform_integration_secrets')
        .insert({
          integration_name: secret.integration_name!,
          secret_key: secret.secret_key!,
          secret_value: secret.secret_value,
          environment: secret.environment,
          is_active: secret.is_active,
          updated_by: user?.id
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to save secret', variant: 'destructive' });
        return false;
      }
    }

    toast({ title: 'Success', description: 'Secret saved successfully' });
    await fetchIntegrationSecrets();
    return true;
  };

  const deleteIntegrationSecret = async (id: string) => {
    const { error } = await supabase
      .from('platform_integration_secrets')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete secret', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Secret deleted' });
    await fetchIntegrationSecrets();
    return true;
  };

  const retryWebhook = async (webhookId: string) => {
    const { error } = await supabase
      .from('webhook_logs')
      .update({
        status: 'retrying',
        retry_count: supabase.rpc ? 0 : 0, // Will be incremented by actual retry logic
        next_retry_at: new Date().toISOString()
      })
      .eq('id', webhookId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to retry webhook', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Webhook retry scheduled' });
    await fetchWebhookLogs();
    return true;
  };

  const resolvePaymentFailure = async (failureId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('payment_failure_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id
      })
      .eq('id', failureId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to resolve payment failure', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Payment failure marked as resolved' });
    await fetchPaymentFailures();
    return true;
  };

  const createRefundOverride = async (refund: Partial<RefundOverride>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('refund_overrides')
      .insert({
        order_id: refund.order_id,
        razorpay_payment_id: refund.razorpay_payment_id,
        original_amount: refund.original_amount!,
        refund_amount: refund.refund_amount!,
        refund_reason: refund.refund_reason,
        override_reason: refund.override_reason!,
        initiated_by: user?.id!,
        status: 'pending'
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create refund override', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Refund override created' });
    await fetchRefundOverrides();
    return true;
  };

  const updateTaxConfiguration = async (tax: Partial<TaxConfiguration>) => {
    if (tax.id) {
      const updateData: Record<string, any> = {};
      if (tax.country_code !== undefined) updateData.country_code = tax.country_code;
      if (tax.country_name !== undefined) updateData.country_name = tax.country_name;
      if (tax.tax_type !== undefined) updateData.tax_type = tax.tax_type;
      if (tax.tax_rate !== undefined) updateData.tax_rate = tax.tax_rate;
      if (tax.tax_name !== undefined) updateData.tax_name = tax.tax_name;
      if (tax.is_inclusive !== undefined) updateData.is_inclusive = tax.is_inclusive;
      if (tax.is_active !== undefined) updateData.is_active = tax.is_active;

      const { error } = await supabase
        .from('tax_configurations')
        .update(updateData)
        .eq('id', tax.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update tax configuration', variant: 'destructive' });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('tax_configurations')
        .insert({
          country_code: tax.country_code!,
          country_name: tax.country_name!,
          tax_type: tax.tax_type!,
          tax_rate: tax.tax_rate!,
          tax_name: tax.tax_name!,
          is_inclusive: tax.is_inclusive,
          is_active: tax.is_active
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create tax configuration', variant: 'destructive' });
        return false;
      }
    }

    toast({ title: 'Success', description: 'Tax configuration saved' });
    await fetchTaxConfigurations();
    return true;
  };

  const updateCountryPaymentRule = async (rule: Partial<CountryPaymentRule>) => {
    if (rule.id) {
      const updateData: Record<string, any> = {};
      if (rule.country_code !== undefined) updateData.country_code = rule.country_code;
      if (rule.country_name !== undefined) updateData.country_name = rule.country_name;
      if (rule.payment_enabled !== undefined) updateData.payment_enabled = rule.payment_enabled;
      if (rule.allowed_methods !== undefined) updateData.allowed_methods = rule.allowed_methods;
      if (rule.min_order_amount !== undefined) updateData.min_order_amount = rule.min_order_amount;
      if (rule.max_order_amount !== undefined) updateData.max_order_amount = rule.max_order_amount;
      if (rule.currency !== undefined) updateData.currency = rule.currency;
      if (rule.requires_kyc !== undefined) updateData.requires_kyc = rule.requires_kyc;
      if (rule.notes !== undefined) updateData.notes = rule.notes;

      const { error } = await supabase
        .from('country_payment_rules')
        .update(updateData)
        .eq('id', rule.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update payment rule', variant: 'destructive' });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('country_payment_rules')
        .insert({
          country_code: rule.country_code!,
          country_name: rule.country_name!,
          currency: rule.currency!,
          payment_enabled: rule.payment_enabled,
          allowed_methods: rule.allowed_methods,
          min_order_amount: rule.min_order_amount,
          max_order_amount: rule.max_order_amount,
          requires_kyc: rule.requires_kyc,
          notes: rule.notes
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create payment rule', variant: 'destructive' });
        return false;
      }
    }

    toast({ title: 'Success', description: 'Payment rule saved' });
    await fetchCountryPaymentRules();
    return true;
  };

  const updateSiteSetting = async (setting: Partial<SiteSetting>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (setting.id) {
      const updateData: Record<string, any> = { updated_by: user?.id };
      if (setting.setting_category !== undefined) updateData.setting_category = setting.setting_category;
      if (setting.setting_key !== undefined) updateData.setting_key = setting.setting_key;
      if (setting.setting_value !== undefined) updateData.setting_value = setting.setting_value;
      if (setting.description !== undefined) updateData.description = setting.description;
      if (setting.is_public !== undefined) updateData.is_public = setting.is_public;

      const { error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', setting.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update site setting', variant: 'destructive' });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('site_settings')
        .insert({
          setting_category: setting.setting_category!,
          setting_key: setting.setting_key!,
          setting_value: setting.setting_value!,
          description: setting.description,
          is_public: setting.is_public,
          updated_by: user?.id
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create site setting', variant: 'destructive' });
        return false;
      }
    }

    toast({ title: 'Success', description: 'Site setting saved' });
    await fetchSiteSettings();
    return true;
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchIntegrationSecrets(),
      fetchWebhookLogs(),
      fetchPaymentFailures(),
      fetchRefundOverrides(),
      fetchSettlementLogs(),
      fetchTaxConfigurations(),
      fetchCountryPaymentRules(),
      fetchSiteSettings()
    ]);
    setLoading(false);
  }, [
    fetchIntegrationSecrets,
    fetchWebhookLogs,
    fetchPaymentFailures,
    fetchRefundOverrides,
    fetchSettlementLogs,
    fetchTaxConfigurations,
    fetchCountryPaymentRules,
    fetchSiteSettings
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    loading,
    integrationSecrets,
    webhookLogs,
    paymentFailures,
    refundOverrides,
    settlementLogs,
    taxConfigurations,
    countryPaymentRules,
    siteSettings,
    saveIntegrationSecret,
    deleteIntegrationSecret,
    retryWebhook,
    resolvePaymentFailure,
    createRefundOverride,
    updateTaxConfiguration,
    updateCountryPaymentRule,
    updateSiteSetting,
    refetch: {
      integrationSecrets: fetchIntegrationSecrets,
      webhookLogs: fetchWebhookLogs,
      paymentFailures: fetchPaymentFailures,
      refundOverrides: fetchRefundOverrides,
      settlementLogs: fetchSettlementLogs,
      taxConfigurations: fetchTaxConfigurations,
      countryPaymentRules: fetchCountryPaymentRules,
      siteSettings: fetchSiteSettings,
      all: fetchAllData
    }
  };
};
