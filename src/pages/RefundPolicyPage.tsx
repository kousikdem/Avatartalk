import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, Sparkles, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" strokeWidth={2.5} />
              <Sparkles className="absolute -top-0.5 -right-0.5 w-2 h-2 text-yellow-300" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">AvatarTalk.Co</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 10, 2026</p>

        {/* Quick Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">7-Day Guarantee</h3>
            <p className="text-sm text-muted-foreground">Full refund within 7 days of purchase</p>
          </Card>
          <Card className="p-6 text-center">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">5-7 Business Days</h3>
            <p className="text-sm text-muted-foreground">Refund processing time</p>
          </Card>
          <Card className="p-6 text-center">
            <Mail className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Easy Process</h3>
            <p className="text-sm text-muted-foreground">Just email us to request a refund</p>
          </Card>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              At AvatarTalk.Co, we want you to be completely satisfied with your purchase. This Refund Policy outlines the terms and conditions under which we offer refunds for our subscription plans and services. We strive to be fair and transparent in all our policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Subscription Plan Refunds</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6">2.1 7-Day Money-Back Guarantee</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All paid subscription plans (Starter, Creator, Pro, Enterprise) come with a 7-day money-back guarantee. If you are not satisfied with our Services for any reason, you may request a full refund within 7 days of your initial purchase. This applies to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>First-time subscription purchases</li>
              <li>Plan upgrades (refund of the difference only)</li>
              <li>Monthly, quarterly, semi-annual, and annual plans</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Refunds After 7 Days</h3>
            <p className="text-muted-foreground leading-relaxed">
              After the 7-day period, subscription fees are non-refundable. However, you may cancel your subscription at any time to prevent future charges. Your access to paid features will continue until the end of your current billing period.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">2.3 Renewal Refunds</h3>
            <p className="text-muted-foreground leading-relaxed">
              If your subscription auto-renews and you did not intend to renew, you may request a refund within 48 hours of the renewal charge, provided you have not used any of the renewed plan's resources (AI tokens, features, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. AI Token Purchases</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Separately purchased AI token packages are generally non-refundable once purchased. However, we may offer refunds in the following cases:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Technical issues on our end that prevented token usage</li>
              <li>Duplicate purchases made in error (within 24 hours)</li>
              <li>Service unavailability for extended periods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Product Marketplace Purchases</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6">4.1 Digital Products</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds for digital products purchased through our marketplace are handled by individual sellers. Each seller may have their own refund policy. We recommend reviewing the seller's refund policy before making a purchase.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">4.2 Virtual Collaborations</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For virtual collaboration sessions (video calls, consultations, etc.):
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Cancellations 24+ hours before the session: Full refund</li>
              <li>Cancellations within 24 hours: 50% refund</li>
              <li>No-shows without prior notice: No refund</li>
              <li>Host cancellation: Full refund</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">4.3 Physical Products</h3>
            <p className="text-muted-foreground leading-relaxed">
              Physical product refunds are subject to the seller's individual return policy. Generally, items must be returned in original condition within 14 days. Shipping costs for returns may be the buyer's responsibility unless the item is defective or incorrectly shipped.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Non-Refundable Items</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The following are generally not eligible for refunds:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">AI tokens that have been consumed</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Completed virtual collaboration sessions</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Downloaded digital products</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Subscription fees after 7 days</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Custom development or personalization work</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Gift token purchases that have been claimed</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To request a refund, please follow these steps:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3 ml-4">
              <li>Send an email to <strong>refunds@avatartalk.co</strong> with the subject line "Refund Request"</li>
              <li>Include your registered email address and account details</li>
              <li>Provide the order ID or transaction reference</li>
              <li>Briefly explain the reason for your refund request</li>
              <li>Attach any relevant screenshots or documentation (if applicable)</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our team will review your request and respond within 2-3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Refund Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once your refund request is approved:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Refunds will be processed to your original payment method</li>
              <li>Credit/debit card refunds: 5-7 business days</li>
              <li>UPI/Net banking refunds: 3-5 business days</li>
              <li>International payments: 7-14 business days</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You will receive an email confirmation once the refund has been initiated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Chargebacks</h2>
            <p className="text-muted-foreground leading-relaxed">
              We encourage you to contact us before initiating a chargeback with your bank or payment provider. Chargebacks may result in temporary suspension of your account while we investigate. If a chargeback is found to be fraudulent, we reserve the right to recover the disputed amount and any associated fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Special Circumstances</h2>
            <p className="text-muted-foreground leading-relaxed">
              We understand that special circumstances may arise. If you have an exceptional situation that doesn't fit within our standard policy, please contact us at refunds@avatartalk.co. We review such cases individually and will do our best to find a fair resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Refund Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. The policy in effect at the time of your purchase will apply to that transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Refund Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">AvatarTalk.Co - Refunds Team</p>
              <p className="text-muted-foreground">Email: refunds@avatartalk.co</p>
              <p className="text-muted-foreground">General inquiries: support@avatartalk.co</p>
              <p className="text-muted-foreground">Response time: 2-3 business days</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap gap-4">
            <Link to="/terms">
              <Button variant="outline">Terms & Conditions</Button>
            </Link>
            <Link to="/privacy-policy">
              <Button variant="outline">Privacy Policy</Button>
            </Link>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicyPage;
