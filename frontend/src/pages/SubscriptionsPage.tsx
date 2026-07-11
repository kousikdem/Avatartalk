import React, { useState } from 'react';
import { Loader2, CreditCard, Smartphone, Pause, Play, XCircle, Shield, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSubscription, type PlanKey, type SubMethod } from '@/hooks/useSubscription';

const PLAN_PRICING: Record<PlanKey, { name: string; price: number; tokens: string; features: string[] }> = {
  creator:  { name: 'Creator',  price: 999,  tokens: '1M tokens/mo',  features: ['Custom AI avatar (2/mo)', 'Payments', 'Digital products', 'Zoom', 'Analytics'] },
  pro:      { name: 'Pro',      price: 1999, tokens: '2M tokens/mo',  features: ['Custom AI avatar (5/mo)', 'Voice clone', 'Virtual meetings', 'Multilingual AI'] },
  business: { name: 'Business', price: 4999, tokens: '5M tokens/mo',  features: ['Custom AI avatar (20/mo)', 'Physical products', 'Multi-currency', 'API access', 'Team'] },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { color: string; label: string }> = {
    active:        { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active' },
    authenticated: { color: 'bg-blue-100 text-blue-800 border-blue-200',          label: 'Authenticated' },
    created:       { color: 'bg-gray-100 text-gray-800 border-gray-200',          label: 'Pending' },
    pending:       { color: 'bg-amber-100 text-amber-800 border-amber-200',       label: 'Pending' },
    halted:        { color: 'bg-red-100 text-red-800 border-red-200',             label: 'Halted' },
    paused:        { color: 'bg-amber-100 text-amber-800 border-amber-200',       label: 'Paused' },
    cancelled:     { color: 'bg-gray-100 text-gray-500 border-gray-200',          label: 'Cancelled' },
    completed:     { color: 'bg-gray-100 text-gray-500 border-gray-200',          label: 'Completed' },
  };
  const meta = map[status] || { color: 'bg-gray-100 text-gray-700', label: status };
  return <Badge className={meta.color}>{meta.label}</Badge>;
};

const SubscriptionsPage: React.FC = () => {
  const { active, history, loading, subscribe, cancel, pause, resume, refresh } = useSubscription();
  const [busy, setBusy] = useState<string | null>(null);
  const [method, setMethod] = useState<SubMethod>('card');

  const handleSubscribe = async (planKey: PlanKey) => {
    setBusy(`subscribe:${planKey}`);
    const res = await subscribe(planKey, method, 12);
    setBusy(null);
    if (!res.success) toast.error(res.error || 'Failed to start subscription');
  };

  const handleAction = async (action: 'cancel' | 'pause' | 'resume', subId: string) => {
    setBusy(action);
    let res: { success: boolean; error?: string };
    if (action === 'cancel') res = await cancel(subId, true);
    else if (action === 'pause') res = await pause(subId);
    else res = await resume(subId);
    setBusy(null);
    if (res.success) toast.success(`Subscription ${action}${action === 'cancel' ? 'led' : 'd'}`);
    else toast.error(res.error || `${action} failed`);
  };

  const fmtDate = (ts: number | null | undefined) =>
    ts ? new Date(ts * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Subscriptions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your recurring plans and UPI Autopay mandates.</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Active subscription */}
        {active ? (
          <Card className="p-6 border-emerald-200 bg-emerald-50/40">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active.payment_method === 'upi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {active.payment_method === 'upi' ? <Smartphone className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {PLAN_PRICING[active.platform_plan_key]?.name || active.platform_plan_key} Plan
                    </h3>
                    <StatusBadge status={active.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {active.payment_method === 'upi' ? 'UPI Autopay eMandate' : 'Card recurring'}
                    · {active.paid_count}/{active.total_count} cycles billed
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Next charge: <span className="font-medium text-gray-700">{fmtDate(active.current_end)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{active.razorpay_subscription_id}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {active.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction('pause', active.razorpay_subscription_id)}
                    disabled={busy === 'pause'}
                  >
                    {busy === 'pause' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 mr-2" />}
                    Pause
                  </Button>
                )}
                {active.status === 'paused' && (
                  <Button
                    size="sm"
                    onClick={() => handleAction('resume', active.razorpay_subscription_id)}
                    disabled={busy === 'resume'}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {busy === 'resume' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Resume
                  </Button>
                )}
                {['active', 'paused', 'authenticated'].includes(active.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Cancel subscription at end of current cycle? You will keep access until then.')) {
                        handleAction('cancel', active.razorpay_subscription_id);
                      }
                    }}
                    disabled={busy === 'cancel'}
                  >
                    {busy === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Payment method selector */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Choose payment method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition text-left ${
                    method === 'card' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mb-2 ${method === 'card' ? 'text-violet-600' : 'text-gray-500'}`} />
                  <div className="font-semibold text-gray-900">Credit / Debit Card</div>
                  <p className="text-xs text-gray-500">Auto-charge from your card each month</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-4 rounded-2xl border-2 transition text-left ${
                    method === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 mb-2 ${method === 'upi' ? 'text-orange-600' : 'text-gray-500'}`} />
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    UPI Autopay <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px]">India</Badge>
                  </div>
                  <p className="text-xs text-gray-500">One-time eMandate authorization via any UPI app</p>
                </button>
              </div>
            </Card>

            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['creator', 'pro', 'business'] as PlanKey[]).map((k) => {
                const p = PLAN_PRICING[k];
                return (
                  <Card key={k} className="p-6 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-gray-900">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      <p className="text-xs text-violet-600 font-medium mt-1">{p.tokens}</p>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1.5 flex-1 mb-4">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <span className="text-emerald-500">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSubscribe(k)}
                      disabled={busy === `subscribe:${k}`}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      data-testid={`subscribe-${k}-${method}`}
                    >
                      {busy === `subscribe:${k}` ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening…</>
                      ) : (
                        <>
                          {method === 'upi' ? <Smartphone className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                          Subscribe via {method === 'upi' ? 'UPI' : 'Card'}
                        </>
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" /> Subscription history
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500 border-b">
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Method</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Cycles</th>
                    <th className="pb-2 pr-4">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium capitalize">{h.platform_plan_key}</td>
                      <td className="py-2 pr-4">
                        {h.payment_method === 'upi' ? (
                          <span className="inline-flex items-center gap-1 text-orange-700">
                            <Smartphone className="w-3.5 h-3.5" /> UPI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-700">
                            <CreditCard className="w-3.5 h-3.5" /> Card
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4"><StatusBadge status={h.status} /></td>
                      <td className="py-2 pr-4 text-gray-600">{h.paid_count}/{h.total_count}</td>
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
