import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Scissors, UserCheck, Sparkles, Baby, Palette, Crown, Calendar } from "lucide-react";

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Scissors,
      title: "HAIRCUTS",
      description: "Precision cuts tailored to your style and personality",
      price: "",
      delay: 0.1
    },
    {
      icon: UserCheck,
      title: "BEARD TRIM",
      description: "Expert beard shaping and maintenance",
      price: "",
      delay: 0.2
    },
    {
      icon: Sparkles,
      title: "HOT TOWEL",
      description: "Relaxing hot towel treatment and shave",
      price: "",
      delay: 0.3
    },
    {
      icon: Baby,
      title: "KIDS CUTS",
      description: "Gentle and fun haircuts for children",
      price: "",
      delay: 0.4
    },
    {
      icon: Palette,
      title: "STYLING",
      description: "Professional styling and hair treatment",
      price: "",
      delay: 0.5
    },
    {
      icon: Sparkles,
      title: "FADE CUTS",
      description: "Smooth transitions and perfect fades",
      price: "",
      delay: 0.6
    }
  ];

  return (
    <section id="services" className="py-20 bg-dark-gray" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-black mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            PREMIUM SERVICES
          </motion.h2>
          <motion.p
            className="text-xl text-light-gray font-inter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Crafted with precision, styled to perfection
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                className="bg-medium-gray rounded-2xl p-8 transition-all duration-300 border border-border-gray"
                initial={{ opacity: 0, y: 50, rotateY: 45, scale: 0.8 }}
                animate={isInView ? { opacity: 1, y: 0, rotateY: 0, scale: 1 } : { opacity: 0, y: 50, rotateY: 45, scale: 0.8 }}
                transition={{ 
                  duration: 1.0, 
                  delay: service.delay,
                  type: "spring",
                  bounce: 0.3
                }}
                whileHover={{ 
                  scale: 1.2, 
                  boxShadow: "0 0 60px rgba(255, 255, 255, 0.6)",
                  y: -25,
                  rotateY: 15,
                  rotateX: -10,
                  rotateZ: 3
                }}
                whileTap={{ scale: 0.9, rotateZ: -5 }}
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ 
                      scale: 1.5, 
                      rotate: [0, -20, 20, 0, 360],
                      y: -15,
                      filter: "brightness(1.5)"
                    }}
                    animate={{ 
                      y: [0, -8, 0, 8, 0],
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1, 1.05, 1],
                      filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                    }}
                    transition={{
                      hover: { duration: 0.6 },
                      y: { duration: 3, repeat: Infinity, delay: service.delay },
                      rotate: { duration: 6, repeat: Infinity, delay: service.delay },
                      scale: { duration: 4, repeat: Infinity, delay: service.delay },
                      filter: { duration: 5, repeat: Infinity, delay: service.delay }
                    }}
                  >
                    <Icon className="text-5xl mb-6 text-white mx-auto" size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-montserrat font-bold mb-4">{service.title}</h3>
                  <p className="text-light-gray font-inter mb-6">{service.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.a
            href="tel:+17144991906"
            className="bg-white text-pure-black px-8 py-4 rounded-full font-montserrat font-bold text-lg hover-scale hover-glow transition-all duration-300 inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="mr-3" size={20} />
            SCHEDULE APPOINTMENT
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
