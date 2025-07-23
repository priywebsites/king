import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Navigation, MapPin } from "lucide-react";

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-20 bg-pure-black" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-black mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            BOOK YOUR APPOINTMENT
          </motion.h2>
          <motion.p
            className="text-xl text-light-gray font-inter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ready for the royal treatment? Contact us today
          </motion.p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Phone Contact */}
          <motion.div
            className="bg-medium-gray rounded-2xl p-8 hover-scale hover-glow transition-all duration-300 border border-border-gray"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
          >
            <Phone className="text-4xl mb-4 text-white mx-auto" size={48} />
            <h3 className="text-xl font-montserrat font-bold mb-2">CALL US</h3>
            <a
              href="tel:+17144991906"
              className="text-light-gray hover:text-white transition-colors duration-300 font-inter"
            >
              (714) 499-1906
            </a>
          </motion.div>

          {/* Walk-in */}
          <motion.div
            className="bg-medium-gray rounded-2xl p-8 hover-scale hover-glow transition-all duration-300 border border-border-gray"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
          >
            <div className="text-4xl mb-4 text-white mx-auto flex justify-center">
              👑
            </div>
            <h3 className="text-xl font-montserrat font-bold mb-2">WALK-INS</h3>
            <p className="text-light-gray font-inter">Welcome daily during business hours</p>
          </motion.div>

          {/* Location */}
          <motion.div
            className="bg-medium-gray rounded-2xl p-8 hover-scale hover-glow transition-all duration-300 border border-border-gray"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
          >
            <MapPin className="text-4xl mb-4 text-white mx-auto" size={48} />
            <h3 className="text-xl font-montserrat font-bold mb-2">VISIT</h3>
            <p className="text-light-gray font-inter">
              221 S Magnolia Ave<br />
              Anaheim, CA
            </p>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <motion.a
            href="tel:+17144991906"
            className="bg-white text-pure-black px-10 py-5 rounded-full font-montserrat font-bold text-xl hover-scale hover-glow transition-all duration-300 flex items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="mr-3" size={20} />
            CALL TO BOOK
          </motion.a>
          <motion.a
            href="https://www.google.com/maps/place/kings+barber+shop/@33.8289074,-117.9764284,3a,75y,90t"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white px-10 py-5 rounded-full font-montserrat font-bold text-xl hover-scale hover:bg-white hover:text-pure-black transition-all duration-300 flex items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Navigation className="mr-3" size={20} />
            GET DIRECTIONS
          </motion.a>
        </div>
      </div>
    </section>
  );
}
