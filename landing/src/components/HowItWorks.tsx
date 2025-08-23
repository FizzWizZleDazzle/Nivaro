import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiUserAdd, HiAcademicCap, HiTrendingUp } from 'react-icons/hi';

const HowItWorks: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const steps = [
    {
      id: 1,
      icon: HiUserAdd,
      title: 'Create Your Club',
      description: 'Set up your club in minutes with our intuitive onboarding process. Invite members and customize your learning environment.'
    },
    {
      id: 2,
      icon: HiAcademicCap,
      title: 'Build Your Curriculum',
      description: 'Design structured learning paths with modules, assignments, and assessments. Upload content or use our library of templates.'
    },
    {
      id: 3,
      icon: HiTrendingUp,
      title: 'Track Progress & Engage',
      description: 'Monitor member progress, facilitate peer reviews, and award achievements. Watch your community thrive and learn together.'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Get your club up and running in three simple steps. 
            No technical expertise required – just your passion for teaching and learning.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 transform -translate-y-1/2" />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10"
          >
            {steps.map((step) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.id}
                  variants={itemVariants}
                  className="text-center group"
                >
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="flex items-center justify-center w-20 h-20 bg-white border-4 border-primary-200 rounded-full mx-auto group-hover:border-primary-400 transition-colors duration-300 shadow-lg">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.id}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Club?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of clubs already using Cursoset to create engaging learning experiences.
            </p>
            <button
              onClick={() => {
                window.location.href = import.meta.env.VITE_APP_URL || 'http://localhost:3001';
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Your Free Trial
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;