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
      price: "$35+",
      delay: 0.1
    },
    {
      icon: UserCheck,
      title: "BEARD TRIM",
      description: "Expert beard shaping and maintenance",
      price: "$25+",
      delay: 0.2
    },
    {
      icon: Sparkles,
      title: "HOT TOWEL",
      description: "Relaxing hot towel treatment and shave",
      price: "$45+",
      delay: 0.3
    },
    {
      icon: Baby,
      title: "KIDS CUTS",
      description: "Gentle and fun haircuts for children",
      price: "$25+",
      delay: 0.4
    },
    {
      icon: Palette,
      title: "STYLING",
      description: "Professional styling and hair treatment",
      price: "$40+",
      delay: 0.5
    },
    {
      icon: Crown,
      title: "ROYAL PACKAGE",
      description: "Complete grooming experience",
      price: "$75+",
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
                className="bg-medium-gray rounded-2xl p-8 hover-scale hover-glow transition-all duration-300 border border-border-gray"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: service.delay }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="text-5xl mb-6 text-white mx-auto" size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-montserrat font-bold mb-4">{service.title}</h3>
                  <p className="text-light-gray font-inter mb-6">{service.description}</p>
                  <div className="text-3xl font-montserrat font-black mb-4">{service.price}</div>
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
