import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiCheck } from 'react-icons/hi';
import type { PricingTier } from '../types';

const Pricing: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [isAnnual, setIsAnnual] = useState(true);

  const pricingTiers: PricingTier[] = [
    {
      name: 'Starter',
      price: 0,
      description: 'Perfect for small clubs getting started',
      features: [
        'Up to 25 members',
        '3 courses',
        'Basic discussion forums',
        'Member progress tracking',
        'Email support',
        'Mobile app access'
      ],
      buttonText: 'Get Started Free'
    },
    {
      name: 'Professional',
      price: isAnnual ? 19 : 25,
      description: 'Ideal for growing clubs with advanced needs',
      features: [
        'Up to 100 members',
        'Unlimited courses',
        'Peer review system',
        'Advanced analytics',
        'Custom branding',
        'Assignment management',
        'Badges & certificates',
        'Priority support',
        'Integrations (Zoom, Google)',
        'Advanced discussion tools'
      ],
      highlighted: true,
      buttonText: 'Start Pro Trial'
    },
    {
      name: 'Enterprise',
      price: isAnnual ? 49 : 65,
      description: 'For large organizations and institutions',
      features: [
        'Unlimited members',
        'Unlimited courses',
        'Advanced peer review',
        'Custom analytics dashboard',
        'White-label solution',
        'API access',
        'SSO integration',
        'Dedicated account manager',
        'Custom training',
        'SLA guarantee',
        'Advanced security features',
        'Bulk user management'
      ],
      buttonText: 'Contact Sales'
    }
  ];

  const handleGetStarted = (tierName: string) => {
    if (tierName === 'Enterprise') {
      // Scroll to contact form or open contact modal
      window.location.href = '/contact';
    } else {
      // Redirect to sign up
      window.location.href = import.meta.env.VITE_APP_URL || 'http://localhost:3001';
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Choose the perfect plan for your club. All plans include our core features 
              with a 14-day free trial and no setup fees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center items-center space-x-4"
          >
            <span className={`font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Save 20%
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  tier.highlighted 
                    ? 'ring-2 ring-primary-600 transform scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name & Price */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {tier.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gray-900">
                        ${tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-gray-600 ml-2">
                          /{isAnnual ? 'month' : 'month'}
                        </span>
                      )}
                    </div>
                    {tier.price > 0 && isAnnual && (
                      <p className="text-sm text-green-600">
                        Billed annually (${tier.price * 12})
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <HiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleGetStarted(tier.name)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                      tier.highlighted
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600 mb-6">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect immediately and billing is prorated.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens during the free trial?
              </h3>
              <p className="text-gray-600 mb-6">
                You get full access to all Professional features for 14 days. 
                No credit card required to start.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer discounts for educational institutions?
              </h3>
              <p className="text-gray-600 mb-6">
                Yes! We offer special pricing for schools, universities, and 
                non-profit organizations. Contact us for details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600 mb-6">
                Absolutely. You can cancel your subscription at any time. 
                You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Still have questions? We're here to help.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="btn-primary"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;