import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, RefreshCw, AlertTriangle, CheckCircle, XCircle, 
  RotateCcw, DollarSign, FileText, Ban, Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  WebhookLog, 
  PaymentFailureLog, 
  RefundOverride, 
  SettlementLog,
  TaxConfiguration,
  CountryPaymentRule
} from '@/hooks/useSuperAdminIntegrations';

interface Props {
  webhookLogs: WebhookLog[];
  paymentFailures: PaymentFailureLog[];
  refundOverrides: RefundOverride[];
  settlementLogs: SettlementLog[];
  taxConfigurations: TaxConfiguration[];
  countryPaymentRules: CountryPaymentRule[];
  onRetryWebhook: (id: string) => Promise<boolean>;
  onResolveFailure: (id: string) => Promise<boolean>;
  onCreateRefund: (refund: Partial<RefundOverride>) => Promise<boolean>;
  onUpdateTax: (tax: Partial<TaxConfiguration>) => Promise<boolean>;
  onUpdatePaymentRule: (rule: Partial<CountryPaymentRule>) => Promise<boolean>;
  onRefresh: () => void;
}

export const RazorpayManagement = ({
  webhookLogs,
  paymentFailures,
  refundOverrides,
  settlementLogs,
  taxConfigurations,
  countryPaymentRules,
  onRetryWebhook,
  onResolveFailure,
  onCreateRefund,
  onUpdateTax,
  onUpdatePaymentRule,
  onRefresh
}: Props) => {
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  const [newRefund, setNewRefund] = useState<Partial<RefundOverride>>({});
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Partial<TaxConfiguration> | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<CountryPaymentRule> | null>(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      pending: 'secondary',
      failed: 'destructive',
      retrying: 'outline',
      processing: 'outline',
      completed: 'default',
      processed: 'default'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const handleCreateRefund = async () => {
    const success = await onCreateRefund(newRefund);
    if (success) {
      setNewRefund({});
      setIsRefundDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Controls */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
          <CardDescription>Instantly disable all payments platform-wide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
            <div>
              <p className="font-medium">Payments Enabled</p>
              <p className="text-sm text-muted-foreground">
                Toggle to instantly enable/disable all payment processing
              </p>
            </div>
            <Switch
              checked={paymentsEnabled}
              onCheckedChange={setPaymentsEnabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="webhooks">Webhook Logs</TabsTrigger>
          <TabsTrigger value="failures">Payment Failures</TabsTrigger>
          <TabsTrigger value="refunds">Refund Overrides</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="taxes">GST/VAT Config</TabsTrigger>
          <TabsTrigger value="countries">Country Rules</TabsTrigger>
        </TabsList>

        {/* Webhook Logs */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhook Logs</CardTitle>
                <CardDescription>Monitor and retry failed webhooks</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{log.retry_count}/{log.max_retries}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.error_message || '-'}
                      </TableCell>
                      <TableCell>
                        {log.status === 'failed' && log.retry_count < log.max_retries && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRetryWebhook(log.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {webhookLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No webhook logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Failures */}
        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Payment Failures
              </CardTitle>
              <CardDescription>Monitor and resolve payment failures</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentFailures.map((failure) => (
                    <TableRow key={failure.id}>
                      <TableCell className="text-sm">
                        {format(new Date(failure.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {failure.razorpay_order_id?.slice(-8) || '-'}
                      </TableCell>
                      <TableCell>
                        {failure.currency} {failure.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          <p className="font-medium text-destructive">{failure.error_code}</p>
                          <p className="text-muted-foreground truncate">{failure.error_description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={failure.resolved ? 'default' : 'destructive'}>
                          {failure.resolved ? 'Resolved' : 'Unresolved'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!failure.resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onResolveFailure(failure.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentFailures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payment failures found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Overrides */}
        <TabsContent value="refunds">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Refund Overrides</CardTitle>
                <CardDescription>Create and manage manual refund overrides</CardDescription>
              </div>
              <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Refund
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Refund Override</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Razorpay Payment ID</Label>
                      <Input
                        value={newRefund.razorpay_payment_id || ''}
                        onChange={(e) => setNewRefund(prev => ({ ...prev, razorpay_payment_id: e.target.value }))}
                        placeholder="pay_xxxxxxxxxxxxx"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Original Amount</Label>
                        <Input
                          type="number"
                          value={newRefund.original_amount || ''}
                          onChange={(e) => setNewRefund(prev => ({ ...prev, original_amount: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Refund Amount</Label>
                        <Input
                          type="number"
                          value={newRefund.refund_amount || ''}
                          onChange={(e) => setNewRefund(prev => ({ ...prev, refund_amount: parseFloat(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Override Reason</Label>
                      <Textarea
                        value={newRefund.override_reason || ''}
                        onChange={(e) => setNewRefund(prev => ({ ...prev, override_reason: e.target.value }))}
                        placeholder="Reason for manual refund..."
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateRefund}>
                      Create Refund Override
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>Refund</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refundOverrides.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="text-sm">
                        {format(new Date(refund.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {refund.razorpay_payment_id?.slice(-8) || '-'}
                      </TableCell>
                      <TableCell>₹{refund.original_amount.toLocaleString()}</TableCell>
                      <TableCell>₹{refund.refund_amount.toLocaleString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{refund.override_reason}</TableCell>
                      <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    </TableRow>
                  ))}
                  {refundOverrides.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No refund overrides found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlement Logs */}
        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Settlement & Payout Logs
              </CardTitle>
              <CardDescription>Track all settlements and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Settlement ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>UTR</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlementLogs.map((settlement) => (
                    <TableRow key={settlement.id}>
                      <TableCell className="text-sm">
                        {settlement.settlement_date 
                          ? format(new Date(settlement.settlement_date), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {settlement.settlement_id?.slice(-8) || '-'}
                      </TableCell>
                      <TableCell>{settlement.currency} {settlement.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {settlement.currency} {settlement.fees.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {settlement.currency} {settlement.net_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{settlement.utr || '-'}</TableCell>
                      <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                    </TableRow>
                  ))}
                  {settlementLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No settlement logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Configuration */}
        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>GST/VAT Configuration</CardTitle>
              <CardDescription>Configure country-wise tax rates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Tax Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Inclusive</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxConfigurations.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tax.country_code}</span>
                          <span>{tax.country_name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{tax.tax_type}</Badge></TableCell>
                      <TableCell className="font-medium">{tax.tax_rate}%</TableCell>
                      <TableCell>{tax.tax_name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={tax.is_inclusive}
                          onCheckedChange={(checked) => onUpdateTax({ id: tax.id, is_inclusive: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tax.is_active}
                          onCheckedChange={(checked) => onUpdateTax({ id: tax.id, is_active: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTax(tax)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Country Payment Rules */}
        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Country-wise Payment Rules
              </CardTitle>
              <CardDescription>Configure payment rules for each country</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Max Order</TableHead>
                    <TableHead>Methods</TableHead>
                    <TableHead>KYC Required</TableHead>
                    <TableHead>Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryPaymentRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{rule.country_code}</span>
                          <span>{rule.country_name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge>{rule.currency}</Badge></TableCell>
                      <TableCell>{rule.min_order_amount}</TableCell>
                      <TableCell>{rule.max_order_amount || '∞'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rule.allowed_methods.map((method: string) => (
                            <Badge key={method} variant="secondary" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.requires_kyc}
                          onCheckedChange={(checked) => onUpdatePaymentRule({ id: rule.id, requires_kyc: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.payment_enabled}
                          onCheckedChange={(checked) => onUpdatePaymentRule({ id: rule.id, payment_enabled: checked })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
