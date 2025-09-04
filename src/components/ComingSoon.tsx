import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  subtitle?: string;
  description?: string;
  expectedDate?: string;
  showBackButton?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  subtitle, 
  description, 
  expectedDate,
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-nushu-warm-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-nushu-cream rounded-full flex items-center justify-center mb-6">
              <Construction className="w-10 h-10 text-nushu-terracotta" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl lg:text-5xl font-normal text-nushu-sage mb-4">
            {title}
          </h1>
          
          {subtitle && (
            <h2 className="text-xl text-nushu-sage/80 font-medium mb-6">
              {subtitle}
            </h2>
          )}

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-nushu-terracotta/10 text-nushu-terracotta border border-nushu-terracotta/20 rounded-full mb-8">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>

          {/* Description */}
          <p className="text-lg text-nushu-sage/70 leading-relaxed mb-8 max-w-lg mx-auto">
            {description || "We're working hard to bring you this content. Please check back soon for updates."}
          </p>

          {/* Expected Date */}
          {expectedDate && (
            <div className="bg-white border border-nushu-sage/10 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 text-nushu-sage">
                <BookOpen className="w-5 h-5 text-nushu-terracotta" />
                <span className="font-medium">Expected: {expectedDate}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-nushu-sage text-white font-medium hover:bg-nushu-sage/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            )}
            
            <a
              href="/#join"
              className="inline-flex items-center gap-2 px-6 py-3 border border-nushu-terracotta text-nushu-terracotta font-medium hover:bg-nushu-terracotta hover:text-white transition-colors"
            >
              <span>Stay Updated</span>
            </a>
          </div>

          {/* Footer Note */}
          <p className="mt-12 text-sm text-nushu-sage/50">
            For questions or suggestions, please contact us via the main page.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;