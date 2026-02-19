import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Printer, CheckSquare, Loader2 } from 'lucide-react';
import { Order } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface InvoiceGeneratorProps {
  orders: Order[];
  sellerName?: string;
}

export const InvoiceGenerator = ({ orders, sellerName = 'Seller' }: InvoiceGeneratorProps) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Filter only physical product orders with captured payment
  const physicalOrders = orders.filter(
    o => o.payment_status === 'captured' && o.metadata?.product_type === 'physical'
  );

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === physicalOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(physicalOrders.map(o => o.id));
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const generateInvoicePDF = (order: Order): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Colors
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

    // Seller Info
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(sellerName, 20, 63);
    doc.setTextColor(...grayColor);
    doc.text('Platform Seller', 20, 70);

    // Buyer Info
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth / 2, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (order.shipping_address) {
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
    
    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(20, tableStartY, pageWidth - 40, 12, 'F');
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, tableStartY + 8);
    doc.text('Qty', 110, tableStartY + 8);
    doc.text('Rate', 130, tableStartY + 8);
    doc.text('Amount', pageWidth - 25, tableStartY + 8, { align: 'right' });

    // Table Row
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

    // Total
    currentY += 15;
    doc.setFillColor(...primaryColor);
    doc.rect(120, currentY - 7, pageWidth - 140, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 125, currentY + 2);
    doc.text(formatCurrency(order.total_amount, order.currency), pageWidth - 25, currentY + 2, { align: 'right' });

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

  const downloadSingleInvoice = (order: Order) => {
    const doc = generateInvoicePDF(order);
    doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
    toast({
      title: "Invoice Downloaded",
      description: `Invoice for order #${order.id.slice(0, 8)} has been downloaded.`,
    });
  };

  const printSingleInvoice = (order: Order) => {
    const doc = generateInvoicePDF(order);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const downloadBulkInvoices = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to download invoices.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // For bulk download, we'll create individual PDFs and trigger downloads
      for (const orderId of selectedOrders) {
        const order = physicalOrders.find(o => o.id === orderId);
        if (order) {
          const doc = generateInvoicePDF(order);
          doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      toast({
        title: "Invoices Downloaded",
        description: `${selectedOrders.length} invoices have been downloaded.`,
      });
      setSelectedOrders([]);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download some invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printBulkInvoices = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to print invoices.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      for (const orderId of selectedOrders) {
        const order = physicalOrders.find(o => o.id === orderId);
        if (order) {
          const doc = generateInvoicePDF(order);
          doc.autoPrint();
          window.open(doc.output('bloburl'), '_blank');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "Print Jobs Sent",
        description: `${selectedOrders.length} invoices opened for printing.`,
      });
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Failed to print some invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (physicalOrders.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Bulk Invoices
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Manager - Physical Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Actions Bar */}
          <div className="flex flex-wrap gap-2 items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                {selectedOrders.length === physicalOrders.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Badge variant="secondary">
                {selectedOrders.length} selected
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBulkInvoices}
                disabled={isGenerating || selectedOrders.length === 0}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printBulkInvoices}
                disabled={isGenerating || selectedOrders.length === 0}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Selected
              </Button>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-2">
            {physicalOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`cursor-pointer transition-all ${
                  selectedOrders.includes(order.id) 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleOrder(order.id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          Order #{order.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {order.payment_status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.metadata?.product_title || 'Product'} × {order.quantity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: order.currency,
                          minimumFractionDigits: 0
                        }).format(order.total_amount / 100)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSingleInvoice(order);
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            printSingleInvoice(order);
                          }}
                        >
                          <Printer className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
