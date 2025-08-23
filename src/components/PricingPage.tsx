
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react';
import Navbar from './Navbar';

const PricingPage = () => {
  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      icon: Star,
      color: "from-slate-400/70 to-slate-500/70",
      features: [
        "1 Avatar",
        "Basic customization", 
        "5 conversations/day",
        "Email support",
        "Basic analytics",
        "Public profile"
      ],
      popular: false
    },
    {
      name: "Creator",
      price: "$19",
      period: "/month",
      description: "For serious content creators",
      icon: Zap,
      color: "from-blue-400/80 to-purple-400/80",
      features: [
        "3 Avatars",
        "Advanced customization",
        "Unlimited conversations",
        "Voice cloning",
        "Advanced analytics",
        "Custom branding",
        "Priority support",
        "API access"
      ],
      popular: true
    },
    {
      name: "Business", 
      price: "$49",
      period: "/month",
      description: "For teams and businesses",
      icon: Crown,
      color: "from-purple-400/80 to-pink-400/80",
      features: [
        "Unlimited avatars",
        "Team collaboration",
        "White-label solution",
        "Custom integrations",
        "Advanced AI features",
        "24/7 phone support",
        "Custom domain",
        "SSO integration"
      ],
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      icon: Rocket,
      color: "from-orange-400/80 to-red-400/80",
      features: [
        "Everything in Business",
        "Dedicated account manager",
        "Custom AI training",
        "On-premise deployment",
        "SLA guarantee",
        "Custom contracts",
        "Advanced security",
        "Training & onboarding"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <Navbar showAuth={true} />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core avatar features.
            </p>
            
            <div className="flex justify-center items-center space-x-4 mb-8">
              <span className="text-slate-600">Monthly</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full shadow-inner"></div>
                <div className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow left-1 top-1 transition"></div>
              </div>
              <span className="text-slate-700">Yearly</span>
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">Save 20%</Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`bg-gradient-to-br from-white/90 via-blue-50/40 to-purple-50/30 border-slate-200/60 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105 ${plan.popular ? 'ring-2 ring-blue-400/60 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-400/80 to-purple-400/80 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 text-xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-slate-700 mb-2">
                    {plan.price}
                    {plan.period && <span className="text-lg text-slate-500">{plan.period}</span>}
                  </div>
                  <p className="text-slate-600 text-sm">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-slate-600 text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? `bg-gradient-to-r ${plan.color} hover:opacity-90` : 'bg-gradient-to-r from-slate-300/80 to-slate-400/80 hover:from-slate-400/90 hover:to-slate-500/90'} text-white shadow-lg hover:shadow-xl`}
                  >
                    {plan.price === "Free" ? "Get Started Free" : plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-white/80 to-blue-50/60 p-6 rounded-lg border border-slate-200/60">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Can I change plans anytime?</h3>
                  <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div className="bg-gradient-to-r from-white/80 to-purple-50/60 p-6 rounded-lg border border-slate-200/60">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">What's included in the free plan?</h3>
                  <p className="text-slate-600">The free plan includes 1 avatar, basic customization, and up to 5 conversations per day.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-white/80 to-blue-50/60 p-6 rounded-lg border border-slate-200/60">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Do you offer refunds?</h3>
                  <p className="text-slate-600">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
                </div>
                <div className="bg-gradient-to-r from-white/80 to-purple-50/60 p-6 rounded-lg border border-slate-200/60">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Is there a setup fee?</h3>
                  <p className="text-slate-600">No setup fees for any plan. You only pay the monthly or yearly subscription.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
