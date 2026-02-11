import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicyPage = () => {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 10, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              AvatarTalk.Co ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Services"). Please read this Privacy Policy carefully. By using our Services, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Name and display name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Profile pictures and avatar images</li>
              <li>Payment and billing information</li>
              <li>Social media handles and links</li>
              <li>Voice recordings (for voice cloning features)</li>
              <li>Documents and files you upload for AI training</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you access our Services, we automatically collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Device information (type, operating system, browser)</li>
              <li>IP address and location data</li>
              <li>Usage data and interaction patterns</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log data (access times, pages viewed, referral URLs)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.3 AI Interaction Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We collect data related to your AI interactions, including chat messages, training data, custom Q&A pairs, and feedback you provide to improve AI responses. This data is used to personalize your AI avatar and improve our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide, maintain, and improve our Services</li>
              <li>Create and manage your account</li>
              <li>Process transactions and send related information</li>
              <li>Train and personalize your AI avatar</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage trends and preferences</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third-party vendors who assist us in providing our Services (payment processors, cloud hosting, analytics)</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you have given explicit permission</li>
              <li><strong>Public Profile:</strong> Information you choose to make public on your profile</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, access controls, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you Services. We will also retain and use your information to comply with legal obligations, resolve disputes, and enforce our agreements. AI training data and conversation history are retained to maintain the continuity of your AI avatar's personality and knowledge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@avatartalk.co.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze how our Services are used</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. About AvatarTalk Turbo</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AvatarTalk Turbo is our proprietary AI engine, fine-tuned on top of the finest large language models (including Gemini and ChatGPT architectures) specifically optimized for natural language processing and conversational AI experiences. AvatarTalk Turbo powers all AI-driven features on our platform, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Personalized AI Chat:</strong> Intelligent, context-aware conversations tailored to each creator's profile and training data</li>
              <li><strong>Voice Chat & Synthesis:</strong> Natural voice generation and real-time voice interaction capabilities</li>
              <li><strong>Content Understanding:</strong> Advanced comprehension of documents, web content, and custom Q&A data for accurate AI responses</li>
              <li><strong>Token-Based Processing:</strong> Efficient token consumption model that counts both input and output processing for transparent billing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              AvatarTalk Turbo processes your data securely and does not share conversation data with third-party AI providers beyond what is necessary for generating responses. All AI interactions are subject to the data handling practices described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services may integrate with third-party platforms such as Zoom, Google Calendar, Razorpay, and social media networks. These third parties have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services are not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Services, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">AvatarTalk.Co - Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@avatartalk.co</p>
              <p className="text-muted-foreground">Address: Bangalore, India</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Grievance Officer</h2>
            <p className="text-muted-foreground leading-relaxed">
              In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">Grievance Officer</p>
              <p className="text-muted-foreground">AvatarTalk.Co</p>
              <p className="text-muted-foreground">Email: grievance@avatartalk.co</p>
              <p className="text-muted-foreground">Time: Monday to Friday, 10:00 AM to 6:00 PM IST</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap gap-4">
            <Link to="/terms">
              <Button variant="outline">Terms & Conditions</Button>
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

export default PrivacyPolicyPage;
