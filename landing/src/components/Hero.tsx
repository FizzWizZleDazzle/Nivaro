import React from 'react';
import { motion } from 'framer-motion';
import { HiPlay, HiArrowRight } from 'react-icons/hi';

const Hero: React.FC = () => {
  const handleSignUp = () => {
    window.location.href = import.meta.env.VITE_APP_URL || 'http://localhost:3001';
  };

  const handleWatchDemo = () => {
    // Scroll to demo section or open demo modal
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-shape w-64 h-64 top-20 left-10 opacity-20" />
        <div className="floating-shape w-48 h-48 top-40 right-20 opacity-30" style={{ animationDelay: '2s' }} />
        <div className="floating-shape w-32 h-32 bottom-32 left-1/4 opacity-25" style={{ animationDelay: '4s' }} />
        <div className="floating-shape w-40 h-40 bottom-20 right-1/3 opacity-20" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Where{' '}
            <span className="text-yellow-300">Google Classroom</span>
            {' '}meets{' '}
            <span className="text-yellow-300">Coursera</span>
            {' '}for Clubs
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Streamline your club management with structured learning experiences. 
            Create curriculums, manage assignments, and foster peer collaboration 
            all in one powerful platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button
              onClick={handleSignUp}
              className="group bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <button
              onClick={handleWatchDemo}
              className="group flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors duration-200">
                <HiPlay className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium">Watch Demo</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto text-white"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
              <div className="text-gray-300">Active Clubs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500K+</div>
              <div className="text-gray-300">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
              <div className="text-gray-300">Courses Created</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <div className="w-1 h-16 bg-white/30 rounded-full mx-auto" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;