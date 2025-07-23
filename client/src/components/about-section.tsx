import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Crown } from "lucide-react";

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 bg-dark-gray" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
          transition={{ 
            duration: 1.0,
            type: "spring",
            bounce: 0.4
          }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full"
            whileHover={{ 
              scale: 1.3, 
              rotate: 360,
              boxShadow: "0 0 50px rgba(255,255,255,0.8)",
              y: -10
            }}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
              y: [0, -5, 0, 5, 0],
              boxShadow: [
                "0 0 20px rgba(255,255,255,0.3)",
                "0 0 40px rgba(255,255,255,0.6)",
                "0 0 20px rgba(255,255,255,0.3)"
              ]
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity },
              scale: { duration: 3, repeat: Infinity },
              y: { duration: 5, repeat: Infinity },
              boxShadow: { duration: 3, repeat: Infinity }
            }}
          >
            <Crown className="text-pure-black" size={32} />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-black mb-6"
            whileHover={{ scale: 1.02 }}
          >
            ABOUT KINGS
          </motion.h2>
          
          <motion.p
            className="text-xl text-light-gray font-inter leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Located in the heart of Anaheim, Kings Barber Shop delivers precision cuts and expert grooming. 
            Our skilled barbers blend traditional techniques with modern style, ensuring every client leaves 
            looking and feeling like royalty.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}