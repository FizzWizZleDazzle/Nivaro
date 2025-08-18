import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Nivaro",
  description: "Find answers to common questions about Nivaro club management platform, pricing, features, and support.",
};

export default function FAQPage() {
  const faqSections = [
    {
      title: "Getting Started",
      questions: [
        {
          q: "How do I create a new club on Nivaro?",
          a: "Simply click 'Create a Club' on our homepage, fill in your club details, and you'll have a fully functional club management system in minutes. You can invite members and start organizing events right away."
        },
        {
          q: "Can I join multiple clubs?",
          a: "Yes! You can be a member of multiple clubs using the same account. Each club operates independently with its own settings, members, and events."
        },
        {
          q: "How do I invite members to my club?",
          a: "Go to your club's member management section and generate an invite code or send direct email invitations. Members can join instantly using the invite code."
        }
      ]
    },
    {
      title: "Features & Functionality",
      questions: [
        {
          q: "What event management features are included?",
          a: "Nivaro includes event creation, RSVP tracking, calendar integration, automated reminders, attendance tracking, and post-event feedback collection."
        },
        {
          q: "Can I use Nivaro for project collaboration?",
          a: "Absolutely! Our platform includes project boards, file sharing, code collaboration tools, and team communication features to support collaborative projects."
        },
        {
          q: "Is there a mobile app available?",
          a: "Currently, Nivaro is a responsive web application that works great on all devices. Native mobile apps are planned for future releases."
        },
        {
          q: "Can I customize the appearance of my club?",
          a: "Yes, you can customize your club's colors, logo, and basic branding to match your organization's identity."
        }
      ]
    },
    {
      title: "Pricing & Plans",
      questions: [
        {
          q: "Is Nivaro really free for small clubs?",
          a: "Yes! Our Starter plan is completely free for clubs with up to 25 members and includes core features like event management and community forums."
        },
        {
          q: "What happens if my club grows beyond my plan's limits?",
          a: "You'll receive notifications when approaching your plan limits and can easily upgrade to accommodate more members. Your data and settings remain intact during upgrades."
        },
        {
          q: "Do you offer discounts for educational institutions?",
          a: "Yes, we offer special pricing for schools, universities, and non-profit organizations. Contact our sales team for more information."
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes, you can cancel your subscription at any time. Your club will continue to function until the end of your billing period, then revert to the free plan features."
        }
      ]
    },
    {
      title: "Technical Support",
      questions: [
        {
          q: "What browsers are supported?",
          a: "Nivaro works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience."
        },
        {
          q: "Is my data secure on Nivaro?",
          a: "Yes, we use enterprise-grade security measures including SSL encryption, secure data centers, and regular security audits to protect your information."
        },
        {
          q: "Can I export my club data?",
          a: "Yes, you can export your club's data including member lists, event histories, and content at any time. We believe your data belongs to you."
        },
        {
          q: "How do I report a bug or request a feature?",
          a: "You can contact our support team through the contact form or email us directly. We actively collect feedback and regularly release updates based on user suggestions."
        }
      ]
    },
    {
      title: "Privacy & Legal",
      questions: [
        {
          q: "How do you handle member privacy?",
          a: "We take privacy seriously and only collect necessary information. Members control their own profile visibility and can manage their privacy settings at any time."
        },
        {
          q: "Do you share data with third parties?",
          a: "No, we never sell or share your personal data with third parties. We only use trusted service providers for essential functions like payment processing."
        },
        {
          q: "How long do you retain data?",
          a: "We retain data as long as your account is active. When you delete your account, we remove all personal data within 30 days, except where required by law."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about Nivaro. Can&apos;t find what you&apos;re looking for? <a href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</a>.
            </p>
          </div>

          <div className="space-y-12">
            {faqSections.map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of Nivaro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Contact Support
              </a>
              <a href="/onboarding/create" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}