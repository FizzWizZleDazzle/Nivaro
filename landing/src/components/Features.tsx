import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HiViewGrid, 
  HiAcademicCap, 
  HiDocumentText, 
  HiUserGroup, 
  HiBadgeCheck, 
  HiChat 
} from 'react-icons/hi';

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      id: 'dashboard',
      icon: HiViewGrid,
      title: 'Club Dashboard',
      description: 'Centralized hub for managing your club with announcements, member overview, and activity tracking all in one place.'
    },
    {
      id: 'curriculum',
      icon: HiAcademicCap,
      title: 'Curriculum Builder',
      description: 'Create structured learning paths with modules, lessons, quizzes, and multimedia content tailored to your club\'s goals.'
    },
    {
      id: 'assignments',
      icon: HiDocumentText,
      title: 'Assignment Management',
      description: 'Streamline project submissions with support for documents, links, videos, and automated deadline tracking.'
    },
    {
      id: 'peer-review',
      icon: HiUserGroup,
      title: 'Peer Review System',
      description: 'Foster community engagement with structured peer feedback using customizable rubrics and collaborative evaluation.'
    },
    {
      id: 'badges',
      icon: HiBadgeCheck,
      title: 'Badges & Certificates',
      description: 'Motivate members with digital achievements, completion certificates, and progress milestones that showcase their learning journey.'
    },
    {
      id: 'discussions',
      icon: HiChat,
      title: 'Discussion Forums',
      description: 'Enable rich conversations with threaded discussions, Q&A sections, and collaborative spaces for each module.'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="features" className="py-20 bg-gray-50">
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
            Everything Your Club Needs
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Powerful features designed to transform how clubs manage learning experiences 
            and foster meaningful collaboration between members.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mt-16"
        >
          <button
            onClick={() => {
              window.location.href = import.meta.env.VITE_APP_URL || 'http://localhost:3001';
            }}
            className="btn-primary text-lg px-8 py-4"
          >
            Explore All Features
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;