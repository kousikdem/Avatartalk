import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, TrendingUp, DollarSign, ShoppingCart, MapPin, Calendar, Download, Printer, Percent } from 'lucide-react';
import { useOrders, Order } from '@/hooks/useOrders';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDistanceToNow, format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { DeliveryTracker } from '@/components/DeliveryTracker';
import { InvoiceGenerator } from '@/components/InvoiceGenerator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface OrdersDashboardProps {
  type: 'buyer' | 'seller';
}

export const OrdersDashboard = ({ type }: OrdersDashboardProps) => {
  const { profileData } = useUserProfile();
  const { orders: buyerOrders } = useOrders(profileData?.id, 'buyer');
  const { orders: sellerOrders } = useOrders(profileData?.id, 'seller');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  const orders = type === 'buyer' ? buyerOrders : sellerOrders;

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    if (!startDate && !endDate) return true;
    const orderDate = parseISO(order.created_at);
    const start = startDate ? startOfDay(parseISO(startDate)) : new Date(0);
    const end = endDate ? endOfDay(parseISO(endDate)) : new Date();
    return isWithinInterval(orderDate, { start, end });
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  // Calculate stats
  const capturedOrders = orders.filter(o => o.payment_status === 'captured');
  const totalOrders = capturedOrders.length;
  const totalSpent = capturedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalEarnings = capturedOrders.reduce((sum, o) => sum + (o.seller_earnings || 0), 0);
  const totalRevenue = capturedOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalPlatformFees = capturedOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);

  // Generate single invoice PDF
  const generateInvoicePDF = (order: Order): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const primaryColor: [number, number, number] = [59, 130, 246];
    const darkColor: [number, number, number] = [31, 41, 55];
    const grayColor: [number, number, number] = [107, 114, 128];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: INV-${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 18, { align: 'right' });
    doc.text(`Date: ${format(new Date(order.created_at), 'dd MMM yyyy')}`, pageWidth - 20, 28, { align: 'right' });

    // Seller/Buyer Info
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(type === 'seller' ? 'From:' : 'To:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(profileData?.display_name || profileData?.username || 'User', 20, 63);

    if (order.shipping_address) {
      doc.setTextColor(...darkColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ship To:', pageWidth / 2, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const addr = order.shipping_address;
      doc.text(addr.full_name || 'Customer', pageWidth / 2, 63);
      doc.setTextColor(...grayColor);
      doc.text(addr.address_line1 || '', pageWidth / 2, 70);
      if (addr.address_line2) {
        doc.text(addr.address_line2, pageWidth / 2, 77);
      }
      doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, pageWidth / 2, addr.address_line2 ? 84 : 77);
      doc.text(`Phone: ${addr.phone || 'N/A'}`, pageWidth / 2, addr.address_line2 ? 91 : 84);
    }

    // Order Details Table
    const tableStartY = 110;
    
    doc.setFillColor(243, 244, 246);
    doc.rect(20, tableStartY, pageWidth - 40, 12, 'F');
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, tableStartY + 8);
    doc.text('Qty', 110, tableStartY + 8);
    doc.text('Rate', 130, tableStartY + 8);
    doc.text('Amount', pageWidth - 25, tableStartY + 8, { align: 'right' });

    let currentY = tableStartY + 20;
    doc.setFont('helvetica', 'normal');
    doc.text(order.metadata?.product_title || 'Product', 25, currentY);
    doc.text(String(order.quantity), 110, currentY);
    doc.text(formatCurrency(order.amount / order.quantity, order.currency), 130, currentY);
    doc.text(formatCurrency(order.amount, order.currency), pageWidth - 25, currentY, { align: 'right' });

    // Divider
    currentY += 15;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, currentY, pageWidth - 20, currentY);

    // Totals
    currentY += 15;
    doc.setTextColor(...grayColor);
    doc.text('Subtotal:', 130, currentY);
    doc.setTextColor(...darkColor);
    doc.text(formatCurrency(order.amount, order.currency), pageWidth - 25, currentY, { align: 'right' });

    if (order.discount_amount && order.discount_amount > 0) {
      currentY += 10;
      doc.setTextColor(34, 197, 94);
      doc.text('Discount:', 130, currentY);
      doc.text(`-${formatCurrency(order.discount_amount, order.currency)}`, pageWidth - 25, currentY, { align: 'right' });
    }

    if (order.tax_amount && order.tax_amount > 0) {
      currentY += 10;
      doc.setTextColor(...grayColor);
      doc.text('Tax (GST):', 130, currentY);
      doc.setTextColor(...darkColor);
      doc.text(formatCurrency(order.tax_amount, order.currency), pageWidth - 25, currentY, { align: 'right' });
    }

    if (order.shipping_amount && order.shipping_amount > 0) {
      currentY += 10;
      doc.setTextColor(...grayColor);
      doc.text('Shipping:', 130, currentY);
      doc.setTextColor(...darkColor);
      doc.text(formatCurrency(order.shipping_amount, order.currency), pageWidth - 25, currentY, { align: 'right' });
    }

    // Platform fee for seller
    if (type === 'seller' && order.platform_fee && order.platform_fee > 0) {
      currentY += 10;
      doc.setTextColor(239, 68, 68);
      doc.text('Platform Fee:', 130, currentY);
      doc.text(`-${formatCurrency(order.platform_fee, order.currency)}`, pageWidth - 25, currentY, { align: 'right' });
    }

    // Total
    currentY += 15;
    doc.setFillColor(...primaryColor);
    doc.rect(120, currentY - 7, pageWidth - 140, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 125, currentY + 2);
    doc.text(formatCurrency(order.total_amount, order.currency), pageWidth - 25, currentY + 2, { align: 'right' });

    // Net Earnings for seller
    if (type === 'seller' && order.seller_earnings) {
      currentY += 20;
      doc.setFillColor(34, 197, 94);
      doc.rect(120, currentY - 7, pageWidth - 140, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Net Earnings:', 125, currentY + 2);
      doc.text(formatCurrency(order.seller_earnings, order.currency), pageWidth - 25, currentY + 2, { align: 'right' });
    }

    // Payment Info
    currentY += 30;
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Payment Method: ${order.payment_method.toUpperCase()}`, 20, currentY + 10);
    doc.text(`Payment Status: ${order.payment_status.toUpperCase()}`, 20, currentY + 18);
    if (order.razorpay_payment_id) {
      doc.text(`Transaction ID: ${order.razorpay_payment_id}`, 20, currentY + 26);
    }

    // Footer
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 270, pageWidth, 27, 'F');
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.text('Thank you for your purchase!', pageWidth / 2, 280, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, 287, { align: 'center' });

    return doc;
  };

  const downloadInvoice = (order: Order) => {
    const doc = generateInvoicePDF(order);
    doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
    toast({
      title: "Invoice Downloaded",
      description: `Invoice for order #${order.id.slice(0, 8)} has been downloaded.`,
    });
  };

  const printInvoice = (order: Order) => {
    const doc = generateInvoicePDF(order);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const bulkDownloadInvoices = async () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No orders",
        description: "No orders found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    const capturedFiltered = filteredOrders.filter(o => o.payment_status === 'captured');
    
    for (const order of capturedFiltered) {
      const doc = generateInvoicePDF(order);
      doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    toast({
      title: "Invoices Downloaded",
      description: `${capturedFiltered.length} invoices have been downloaded.`,
    });
  };

  const bulkPrintInvoices = async () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No orders",
        description: "No orders found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    const capturedFiltered = filteredOrders.filter(o => o.payment_status === 'captured');
    
    for (const order of capturedFiltered) {
      const doc = generateInvoicePDF(order);
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast({
      title: "Print Jobs Sent",
      description: `${capturedFiltered.length} invoices opened for printing.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className={`grid gap-4 ${type === 'seller' ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-3'}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {type === 'buyer' ? 'Total Orders' : 'Total Sales'}
                </p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {type === 'buyer' ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalSpent, 'INR')}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter(o => o.order_status === 'completed').length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalRevenue, 'INR')}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fees</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalPlatformFees, 'INR')}
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalEarnings, 'INR')}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {orders.filter(o => o.payment_status === 'pending').length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">
            {type === 'buyer' ? 'My Purchases' : 'Sales Orders'}
          </h3>
          
          {type === 'seller' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[140px]"
                  placeholder="Start Date"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[140px]"
                  placeholder="End Date"
                />
              </div>
              <Button variant="outline" size="sm" onClick={bulkDownloadInvoices} className="gap-2">
                <Download className="w-4 h-4" />
                Bulk Download
              </Button>
              <Button variant="outline" size="sm" onClick={bulkPrintInvoices} className="gap-2">
                <Printer className="w-4 h-4" />
                Bulk Print
              </Button>
              <InvoiceGenerator 
                orders={orders} 
                sellerName={profileData?.display_name || profileData?.username || 'Seller'} 
              />
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {type === 'buyer' ? 'No purchases yet' : 'No sales yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                      <Badge variant="outline">
                        {order.order_status}
                      </Badge>
                      {order.payment_status === 'captured' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => downloadInvoice(order)}
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => printInvoice(order)}
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Product</p>
                      <p className="font-medium">{order.metadata?.product_title || 'Product'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {formatCurrency(order.amount, order.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(order.total_amount, order.currency)}
                      </p>
                    </div>
                  </div>

                  {type === 'seller' && order.payment_status === 'captured' && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span className="text-red-600">
                          - {formatCurrency(order.platform_fee || 0, order.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold mt-1">
                        <span>Your Earnings</span>
                        <span className="text-green-600">
                          {formatCurrency(order.seller_earnings || 0, order.currency)}
                        </span>
                      </div>
                    </div>
                  )}

                  {order.shipping_address && (
                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">{order.shipping_address.full_name}</p>
                          <p className="text-muted-foreground">
                            {order.shipping_address.address_line1}
                            {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                          </p>
                          <p className="text-muted-foreground">
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                          </p>
                          <p className="text-muted-foreground">
                            Phone: {order.shipping_address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        Tracking: <span className="font-mono font-medium text-foreground">{order.tracking_number}</span>
                      </p>
                    </div>
                  )}

                  {(order.order_status === 'completed' || order.order_status === 'shipped') && (
                    <DeliveryTracker order={order} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
