import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials - Nivaro",
  description: "See what our community says about Nivaro. Real reviews from club leaders and members who use our platform.",
};

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "President, Tech Innovation Club",
      organization: "Stanford University",
      avatar: "SC",
      content: "Nivaro transformed how we manage our 150+ member tech club. The event management and project collaboration features have made everything so much smoother. Our member engagement has increased by 40% since we started using it.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Community Manager",
      organization: "Local Entrepreneurs Network",
      avatar: "MJ",
      content: "As someone who manages multiple entrepreneur meetups, Nivaro has been a game-changer. The RSVP tracking and automated reminders alone have saved me hours each week. The platform just works.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Student Activities Coordinator",
      organization: "City College",
      avatar: "ER",
      content: "We use Nivaro for all our student organizations. The ability to create custom clubs with their own branding and manage everything from one platform is incredible. Students love how easy it is to join and participate.",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Founder",
      organization: "Developer Study Group",
      avatar: "DK",
      content: "The learning center and code collaboration features are exactly what our study group needed. Members can share projects, learn together, and track their progress. It's like having a virtual campus for our community.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "President",
      organization: "Photography Club",
      avatar: "LT",
      content: "Nivaro made it so easy to organize our photography walks and workshops. The free plan has everything we need for our small club, and the member forum has brought our community closer together.",
      rating: 5
    },
    {
      name: "Alex Rivera",
      role: "Team Lead",
      organization: "Hackathon Organizers",
      avatar: "AR",
      content: "Managing hackathon teams used to be chaos. Nivaro's project collaboration tools and team management features have streamlined everything. Participants can form teams, share code, and coordinate seamlessly.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Clubs" },
    { number: "500,000+", label: "Community Members" },
    { number: "1M+", label: "Events Organized" },
    { number: "98%", label: "Customer Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of clubs and communities who trust Nivaro to bring their members together and achieve their goals.
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.organization}</p>
                </div>
              </div>
              
              <div className="mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-gray-600 italic">
                &quot;{testimonial.content}&quot;
              </blockquote>
            </div>
          ))}
        </div>

        {/* Success Stories Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">University Robotics Club</h3>
              <p className="text-gray-600 mb-4">
                After switching to Nivaro, the Robotics Club saw a 60% increase in project completion rates and organized their most successful competition yet with 200+ participants.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Results:</strong> 60% higher project completion, 200+ competition participants
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Local Book Club Network</h3>
              <p className="text-gray-600 mb-4">
                A network of 12 book clubs streamlined their coordination using Nivaro, leading to joint events and a 40% increase in cross-club participation.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Results:</strong> 12 clubs coordinated, 40% increase in participation
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Development Group</h3>
              <p className="text-gray-600 mb-4">
                A career development group used Nivaro&apos;s learning center to create a mentorship program that helped 85% of members advance in their careers.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Results:</strong> 85% career advancement rate through mentorship
              </div>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gaming Community</h3>
              <p className="text-gray-600 mb-4">
                A gaming community organized their first major tournament using Nivaro, attracting 500+ gamers and establishing regular competitive events.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Results:</strong> 500+ tournament participants, regular events established
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Start building stronger connections and achieving more with your community today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/onboarding/create" className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors font-semibold">
              Create Your Club
            </a>
            <a href="/pricing" className="border border-white text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors">
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}