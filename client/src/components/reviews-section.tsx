import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function ReviewsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const reviews = [
    {
      name: "Michael Rodriguez",
      rating: 5,
      text: "Amazing work! The barbers here are true artists. Clean cuts, great atmosphere, and excellent customer service. Will definitely be coming back!",
      delay: 0.1
    },
    {
      name: "David Chen",
      rating: 5,
      text: "Best barbershop in Anaheim! They really know how to do a perfect fade. Professional service and reasonable prices. Highly recommended!",
      delay: 0.2
    },
    {
      name: "Carlos Martinez",
      rating: 5,
      text: "Top-notch service every time. The attention to detail is incredible. My beard and haircut always look fresh when I leave here.",
      delay: 0.3
    },
    {
      name: "James Thompson",
      rating: 5,
      text: "These guys are the real deal. Clean shop, skilled barbers, and they really listen to what you want. Kings Barber Shop is the place to go!",
      delay: 0.4
    },
    {
      name: "Anthony Garcia",
      rating: 5,
      text: "Excellent experience! Professional barbers who take their time to make sure everything is perfect. The shop has a great vibe too.",
      delay: 0.5
    },
    {
      name: "Robert Kim",
      rating: 5,
      text: "Consistently great cuts and service. The barbers are friendly and skilled. This is my go-to spot for haircuts and beard trims.",
      delay: 0.6
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: 0.5 + (i * 0.1)
        }}
        whileHover={{ scale: 1.2, rotate: 360 }}
      >
        <Star 
          className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
          size={16} 
        />
      </motion.div>
    ));
  };

  return (
    <section id="reviews" className="py-20 bg-medium-gray" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-black mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            WHAT OUR CLIENTS SAY
          </motion.h2>
          <motion.p
            className="text-xl text-light-gray font-inter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Real reviews from satisfied customers
          </motion.p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              className="bg-dark-gray rounded-2xl p-6 border border-border-gray relative overflow-hidden"
              initial={{ 
                opacity: 0, 
                y: 50, 
                rotateY: 45,
                scale: 0.8 
              }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0, 
                rotateY: 0,
                scale: 1 
              } : { 
                opacity: 0, 
                y: 50, 
                rotateY: 45,
                scale: 0.8 
              }}
              transition={{ 
                duration: 1.0, 
                delay: review.delay,
                type: "spring",
                bounce: 0.3
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 30px rgba(255, 255, 255, 0.2)",
                y: -5,
                rotateY: 2
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Quote Icon */}
              <motion.div
                className="absolute top-4 right-4 text-light-gray opacity-20"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  delay: review.delay 
                }}
              >
                <Quote size={24} />
              </motion.div>

              {/* Star Rating */}
              <motion.div 
                className="flex mb-4"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: review.delay + 0.3 }}
              >
                {renderStars(review.rating)}
              </motion.div>

              {/* Review Text */}
              <motion.p
                className="text-white font-inter mb-4 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: review.delay + 0.4 }}
              >
                "{review.text}"
              </motion.p>

              {/* Reviewer Name */}
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.8, delay: review.delay + 0.5 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-pure-black font-montserrat font-bold text-sm">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </motion.div>
                <div>
                  <p className="font-montserrat font-semibold text-sm">{review.name}</p>
                  <p className="text-light-gray text-xs">Google Review</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Google Reviews Link */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.a
            href="https://www.google.com/maps/place/kings+barber+shop/@33.8289074,-117.9764284,3a,75y,90t"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-pure-black px-8 py-4 rounded-full font-montserrat font-bold text-lg transition-all duration-300"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 0 25px rgba(255,255,255,0.4)",
              y: -3
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className="mr-2 fill-yellow-400 text-yellow-400" size={20} />
            READ MORE REVIEWS
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}