import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiLightBulb, HiUsers, HiTrendingUp, HiHeart } from 'react-icons/hi';
import type { TeamMember } from '../types';

const About: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alex Rivera',
      role: 'CEO & Co-Founder',
      bio: 'Former Google PM with 10+ years in EdTech. Passionate about democratizing quality education through technology.',
      avatar: '👨‍💼',
      linkedin: '#'
    },
    {
      id: '2',
      name: 'Sarah Kim',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Microsoft engineer specializing in scalable learning platforms. PhD in Computer Science from Stanford.',
      avatar: '👩‍💻',
      linkedin: '#'
    },
    {
      id: '3',
      name: 'Marcus Johnson',
      role: 'Head of Product',
      bio: 'Designer-turned-PM with deep expertise in user experience and community building platforms.',
      avatar: '👨‍🎨',
      linkedin: '#'
    },
    {
      id: '4',
      name: 'Dr. Elena Chen',
      role: 'Head of Learning Sciences',
      bio: 'Educational psychologist with 15+ years researching peer learning and collaborative education methods.',
      avatar: '👩‍🏫',
      linkedin: '#'
    }
  ];

  const values = [
    {
      icon: HiLightBulb,
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible in educational technology, creating tools that inspire and engage learners.'
    },
    {
      icon: HiUsers,
      title: 'Community',
      description: 'Learning is fundamentally social. We build platforms that foster genuine connections and collaborative growth between members.'
    },
    {
      icon: HiTrendingUp,
      title: 'Excellence',
      description: 'We\'re committed to delivering the highest quality experience, constantly improving based on user feedback and data.'
    },
    {
      icon: HiHeart,
      title: 'Accessibility',
      description: 'Quality education should be available to everyone, regardless of background, location, or economic circumstances.'
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Our Mission
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing how clubs and communities approach learning by combining 
              the organizational power of classroom management with the engagement of peer-driven education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                The Problem We Solve
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  Club leaders everywhere were struggling with the same challenges: managing members, 
                  creating structured learning experiences, and maintaining engagement beyond regular meetings.
                </p>
                <p>
                  Traditional tools were either too simple (basic communication apps) or too complex 
                  (enterprise LMS platforms). There was nothing designed specifically for the unique 
                  needs of clubs, societies, and community learning groups.
                </p>
                <p>
                  That's why we built Cursoset – a platform that understands that clubs are different. 
                  They're communities where peers learn from each other, where passion drives participation, 
                  and where flexible, engaging experiences matter more than rigid curricula.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 text-lg">
                  To empower every club and community to create exceptional learning experiences 
                  that bring people together and help them grow.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Our Values
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              The principles that guide everything we do at Cursoset.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A diverse group of educators, technologists, and community builders 
              united by our passion for transforming how people learn together.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {member.avatar}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a
                      href={member.linkedin}
                      className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Whether you're leading a club or looking to be part of the team, 
              we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.location.href = import.meta.env.VITE_APP_URL || 'http://localhost:3001';
                }}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Your Club Today
              </button>
              <button
                onClick={() => window.location.href = '/contact'}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Get in Touch
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;