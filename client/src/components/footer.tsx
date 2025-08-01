import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Crown, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="bg-dark-gray border-t border-border-gray py-12" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h3 
              className="text-3xl font-montserrat font-black mb-2 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Crown className="mr-2 text-light-gray" size={24} />
              </motion.div>
              KINGS BARBER SHOP
            </motion.h3>
            <motion.p 
              className="text-light-gray font-inter"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Where Precision Meets Style
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-montserrat font-bold mb-2">CONTACT</h4>
              <p className="text-light-gray font-inter text-sm">(714) 499-1906</p>
              <p className="text-light-gray font-inter text-sm">221 S Magnolia Ave, Anaheim, CA</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-montserrat font-bold mb-2">HOURS</h4>
              <p className="text-light-gray font-inter text-sm">Mon, Wed-Sat: 11AM-8PM</p>
              <p className="text-light-gray font-inter text-sm">Sun: 11AM-4PM • Tues: Closed</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-montserrat font-bold mb-2">FOLLOW</h4>
              <div className="flex justify-center space-x-4">
                <motion.a
                  href="#"
                  className="text-light-gray hover:text-white transition-colors duration-300"
                  aria-label="Instagram"
                  whileHover={{ 
                    scale: 1.8, 
                    y: -10,
                    rotate: 360,
                    filter: "brightness(1.5) hue-rotate(45deg)"
                  }}
                  whileTap={{ scale: 0.8 }}
                  animate={{
                    y: [0, -3, 0, 3, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    y: { duration: 4, repeat: Infinity, delay: 0.2 },
                    rotate: { duration: 6, repeat: Infinity, delay: 0.3 }
                  }}
                >
                  <Instagram size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-light-gray hover:text-white transition-colors duration-300"
                  aria-label="Facebook"
                  whileHover={{ 
                    scale: 1.8, 
                    y: -10,
                    rotate: -360,
                    filter: "brightness(1.5) hue-rotate(90deg)"
                  }}
                  whileTap={{ scale: 0.8 }}
                  animate={{
                    y: [0, -2, 0, 2, 0],
                    rotate: [0, -5, 0, 5, 0]
                  }}
                  transition={{
                    y: { duration: 5, repeat: Infinity, delay: 0.4 },
                    rotate: { duration: 7, repeat: Infinity, delay: 0.6 }
                  }}
                >
                  <Facebook size={20} />
                </motion.a>
                <motion.a
                  href="https://www.google.com/maps/place/kings+barber+shop/@33.8289074,-117.9764284,3a,75y,90t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light-gray hover:text-white transition-colors duration-300"
                  aria-label="Google Maps"
                  whileHover={{ 
                    scale: 2.0, 
                    y: -12,
                    rotate: 720,
                    filter: "brightness(2) saturate(2)"
                  }}
                  whileTap={{ scale: 0.7 }}
                  animate={{
                    y: [0, -4, 0, 4, 0],
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    y: { duration: 3, repeat: Infinity, delay: 0.8 },
                    rotate: { duration: 8, repeat: Infinity, delay: 0.9 },
                    scale: { duration: 4, repeat: Infinity, delay: 1.0 }
                  }}
                >
                  🌐
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="border-t border-border-gray pt-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <motion.p 
                className="text-light-gray font-inter text-sm"
                whileHover={{ scale: 1.02 }}
              >
                © 2024 Kings Barber Shop. All rights reserved.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
