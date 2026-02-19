import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsPage = () => {
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
        <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 10, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to AvatarTalk.Co ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our website, applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features of our Services, you may be required to create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information as needed</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Services Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              AvatarTalk.Co provides AI-powered avatar creation and interaction services that allow users to create personalized digital avatars, train AI models, sell digital and physical products, offer virtual collaborations, and engage with their audience. Our Services include but are not limited to avatar customization tools, AI chat capabilities, voice cloning features, product marketplace, virtual meeting integration, and analytics dashboards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription Plans and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We offer various subscription plans with different features and pricing. By subscribing to a paid plan, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Pay all fees associated with your selected plan</li>
              <li>Provide valid payment information</li>
              <li>Authorize us to charge your payment method on a recurring basis</li>
              <li>Understand that subscriptions auto-renew unless cancelled</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              All payments are processed securely through our payment partners. Prices are displayed in INR and USD and are subject to change with prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. AI Token Usage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Each subscription plan includes a monthly allocation of AI tokens. Tokens are consumed when using AI features such as chat interactions, avatar generation, and voice synthesis. Unused tokens expire at the end of each billing cycle and do not roll over unless explicitly stated in your plan. Additional tokens can be purchased separately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of all content you upload, create, or share through our Services ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, reproduce, and distribute your User Content solely for the purpose of providing and improving our Services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for your User Content and represent that you have all necessary rights to submit such content and that it does not violate any laws or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Use our Services for any illegal or unauthorized purpose</li>
              <li>Create content that is harmful, offensive, defamatory, or infringes on others' rights</li>
              <li>Impersonate others or create misleading avatars without consent</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt our Services or servers</li>
              <li>Use automated means to access our Services without permission</li>
              <li>Sell, resell, or exploit our Services for commercial purposes beyond permitted use</li>
              <li>Create content depicting minors or non-consensual activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All intellectual property rights in our Services, including but not limited to software, designs, logos, trademarks, and content created by us, remain our exclusive property. You may not copy, modify, distribute, sell, or lease any part of our Services without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services may integrate with or contain links to third-party services (e.g., Zoom, Google Calendar, payment processors). We are not responsible for the content, privacy practices, or terms of these third-party services. Your use of such services is governed by their respective terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF OUR SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless AvatarTalk.Co and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our Services, your User Content, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to our Services at any time, with or without cause, and with or without notice. Upon termination, your right to use our Services will immediately cease. Provisions that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on our website and updating the "Last updated" date. Your continued use of our Services after such changes constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">17. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">AvatarTalk.Co</p>
              <p className="text-muted-foreground">Email: legal@avatartalk.co</p>
              <p className="text-muted-foreground">Address: Bangalore, India</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy-policy">
              <Button variant="outline">Privacy Policy</Button>
            </Link>
            <Link to="/refund-policy">
              <Button variant="outline">Refund Policy</Button>
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

export default TermsPage;
