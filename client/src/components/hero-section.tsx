import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, Scissors, Clock, MapPin, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

interface HeroSectionProps {
  onBookNow: () => void;
}

export default function HeroSection({ onBookNow }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const speed = scrolled * 0.5;
        heroRef.current.style.transform = `translateY(${speed}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToServices = () => {
    const element = document.getElementById("services");
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        ref={heroRef}
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/attached_assets/Screen Shot 2025-07-23 at 3.25.47 PM_1753302441217.png')`
        }}
      />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-montserrat font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.6,
                type: "spring",
                bounce: 0.4
              }}
              whileHover={{ 
                scale: 1.15,
                textShadow: "0 0 30px rgba(255,255,255,0.8)",
                rotateY: 10,
                z: 50
              }}
            >
              KINGS
            </motion.span>
            <motion.span
              className="block text-light-gray"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.8,
                type: "spring",
                bounce: 0.4
              }}
              whileHover={{ 
                scale: 1.15,
                color: "#ffffff",
                rotateY: -10,
                textShadow: "0 0 25px rgba(255,255,255,0.7)"
              }}
            >
              BARBER SHOP
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl font-inter font-light mb-8 text-light-gray"
          initial={{ opacity: 0, y: 30, rotateX: 45 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            duration: 1.0, 
            delay: 1.0,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            scale: 1.08,
            color: "#ffffff",
            textShadow: "0 0 25px rgba(255,255,255,0.6)",
            rotateZ: 2
          }}
        >
          Where Precision Meets Style
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            onClick={onBookNow}
            className="bg-white text-pure-black px-8 py-4 rounded-full font-montserrat font-bold text-lg hover-scale hover-glow transition-all duration-300 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="mr-3" size={20} />
            📅 BOOK APPOINTMENT
          </motion.button>
          <motion.button
            onClick={scrollToServices}
            className="border-2 border-white text-white px-8 py-4 rounded-full font-montserrat font-bold text-lg hover-scale hover:bg-white hover:text-pure-black transition-all duration-300 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Scissors className="mr-3" size={20} />
            VIEW SERVICES
          </motion.button>
        </motion.div>

        {/* Staff Login Button */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.button
            onClick={() => setLocation("/barber-login")}
            className="hover:text-white underline font-inter text-sm transition-all duration-300 text-[#40a100] font-bold bg-[#00000000]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          > Staff Login</motion.button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm font-inter"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <Clock className="text-2xl mb-2 mx-auto text-light-gray" size={24} />
            <p>Mon, Wed-Sat: 11AM-8PM</p>
            <p>Sun: 11AM-4PM</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <MapPin className="text-2xl mb-2 mx-auto text-light-gray" size={24} />
            <p>221 S Magnolia Ave</p>
            <p>Anaheim, CA</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
          >
            <Phone className="text-2xl mb-2 mx-auto text-light-gray" size={24} />
            <p>(714) 499-1906</p>
          </motion.div>
        </motion.div>
      </div>
      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ 
          y: [0, 15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.button
          onClick={scrollToServices}
          className="text-white hover:text-light-gray transition-colors duration-300 floating"
          whileHover={{ 
            scale: 1.2,
            boxShadow: "0 0 20px rgba(255,255,255,0.4)"
          }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown size={32} />
        </motion.button>
      </motion.div>
    </section>
  );
}
