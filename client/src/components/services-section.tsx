import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Scissors, 
  UserCheck, 
  Sparkles, 
  Baby, 
  Palette, 
  Crown, 
  Calendar,
  Phone,
  Monitor,
  ArrowRight,
  Droplets,
  Zap,
  Star,
  Clock
} from "lucide-react";

interface ServicesSectionProps {
  onBookService: () => void;
}

export default function ServicesSection({ onBookService }: ServicesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // The King Package - Featured Service
  const kingPackage = {
    icon: Crown,
    title: "👑 THE KING PACKAGE",
    price: "$100",
    duration: "1 Hour",
    description: "A royal treatment from head to face. Perfect for special occasions or when you deserve the best.",
    features: [
      "Custom full-service haircut",
      "Precision beard trim with razor lineup", 
      "Basic facial with hot towel, steam, and skin cleansing"
    ],
    delay: 0.1
  };

  // Hair Services
  const hairServices = [
    {
      icon: Scissors,
      title: "Haircut",
      price: "$40",
      duration: "30 Minutes",
      description: "Tailored to your unique style and head shape. Includes expert finishing and styling.",
      delay: 0.2
    },
    {
      icon: Baby,
      title: "Kids Haircut",
      price: "$35", 
      duration: "30 Minutes",
      description: "Fun, fast, and friendly cuts for kids 12 and under. We make sure every child leaves smiling.",
      delay: 0.3
    },
    {
      icon: Zap,
      title: "Head Shave",
      price: "$35",
      duration: "25 Minutes", 
      description: "Straight razor head shave with hot towel prep, warm lather, and soothing aftercare for a polished, irritation-free finish.",
      delay: 0.4
    },
    {
      icon: Scissors,
      title: "Haircut + Beard Combo",
      price: "$60",
      duration: "45 Minutes",
      description: "The complete grooming experience: a custom haircut paired with a clean, detailed beard trim and sharp lineup.",
      delay: 0.5
    },
    {
      icon: Palette,
      title: "Hair Dye",
      price: "$35",
      duration: "30 Minutes", 
      description: "Color refresh or full transformation using professional-grade dye. Includes consultation and application.",
      delay: 0.6
    }
  ];

  // Beard & Shave Services
  const beardServices = [
    {
      icon: UserCheck,
      title: "Beard Trim + Lineup",
      price: "$25",
      duration: "15 Minutes",
      description: "Sharp, detailed shaping and grooming for a clean, defined look. Razor finish included.",
      delay: 0.7
    },
    {
      icon: Sparkles,
      title: "Hot Towel Shave with Steam",
      price: "$35",
      duration: "25 Minutes",
      description: "A classic straight razor shave paired with hot towels and steam therapy to open pores and refresh the skin.",
      delay: 0.8
    },
    {
      icon: Palette,
      title: "Beard Dye",
      price: "$25",
      duration: "30 Minutes",
      description: "Cover grays or enhance tone with natural-looking, long-lasting beard color.",
      delay: 0.9
    }
  ];

  // Additional Services
  const additionalServices = [
    {
      icon: Star,
      title: "Basic Facial",
      price: "$45",
      duration: "30 Minutes",
      description: "Cleanse, exfoliate, and hydrate with our soothing facial that leaves your skin glowing and refreshed.",
      delay: 1.0
    },
    {
      icon: Sparkles,
      title: "Face Threading",
      price: "$25",
      duration: "15 Minutes", 
      description: "Precise hair removal using traditional cotton thread. Gentle on sensitive skin.",
      delay: 1.1
    },
    {
      icon: UserCheck,
      title: "Eyebrow Threading",
      price: "$15",
      duration: "10 Minutes",
      description: "Perfectly shaped and symmetrical brows with a clean, defined finish.",
      delay: 1.2
    },
    {
      icon: Sparkles,
      title: "Full Face Wax",
      price: "$30", 
      duration: "15 Minutes",
      description: "Smooth, hair-free skin across your entire face. A clean look that lasts.",
      delay: 1.3
    },
    {
      icon: UserCheck,
      title: "Ear Waxing",
      price: "$10",
      duration: "5 Minutes",
      description: "Quick and effective ear hair removal for a neat appearance.",
      delay: 1.4
    },
    {
      icon: UserCheck,
      title: "Nose Waxing", 
      price: "$10",
      duration: "5 Minutes",
      description: "Comfortable and hygienic nose hair removal for a polished finish.",
      delay: 1.5
    },
    {
      icon: Droplets,
      title: "Shampoo",
      price: "$5",
      duration: "5 Minutes",
      description: "Quick and refreshing wash to cleanse your scalp before or after a haircut.",
      delay: 1.6
    }
  ];

  const ServiceCard = ({ service, isKing = false, onBookNow }: { service: any; isKing?: boolean; onBookNow: () => void }) => {
    const Icon = service.icon;
    return (
      <motion.div
        key={service.title}
        className={`${isKing ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-600/10 border-yellow-500/30' : 'bg-medium-gray border-border-gray'} rounded-2xl p-8 transition-all duration-300 border`}
        initial={{ opacity: 0, y: 50, rotateY: 45, scale: 0.8 }}
        animate={isInView ? { opacity: 1, y: 0, rotateY: 0, scale: 1 } : { opacity: 0, y: 50, rotateY: 45, scale: 0.8 }}
        transition={{ 
          duration: 1.0, 
          delay: service.delay,
          type: "spring",
          bounce: 0.3
        }}
        whileHover={{ 
          scale: isKing ? 1.05 : 1.1, 
          boxShadow: isKing ? "0 0 80px rgba(255, 215, 0, 0.4)" : "0 0 60px rgba(255, 255, 255, 0.3)",
          y: -15
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-center">
          <motion.div
            whileHover={{ 
              scale: 1.2, 
              rotate: [0, -10, 10, 0],
              y: -10
            }}
            transition={{ duration: 0.6 }}
          >
            <Icon className={`text-5xl mb-6 mx-auto ${isKing ? 'text-yellow-400' : 'text-white'}`} size={48} />
          </motion.div>
          <h3 className={`text-2xl font-montserrat font-bold mb-2 ${isKing ? 'text-yellow-400' : 'text-white'}`}>
            {service.title}
          </h3>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-3xl font-bold ${isKing ? 'text-yellow-400' : 'text-white'}`}>{service.price}</span>
            <span className="text-light-gray flex items-center">
              <Clock size={16} className="mr-1" />
              {service.duration}
            </span>
          </div>
          <p className="text-light-gray font-inter mb-4">{service.description}</p>
          {service.features && (
            <ul className="text-left text-sm text-light-gray space-y-2 mb-4">
              {service.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center">
                  <ArrowRight size={14} className="mr-2 text-yellow-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
          
          <motion.button
            onClick={() => onBookNow()}
            className={`w-full mt-4 px-6 py-3 rounded-full font-montserrat font-bold transition-all duration-300 ${
              isKing 
                ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📅 Book Now
          </motion.button>
        </div>
      </motion.div>
    );
  };

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
            SERVICES
          </motion.h2>
          <motion.p
            className="text-xl text-light-gray font-inter max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to the ultimate grooming destination. Whether you're looking for a fresh fade, a clean beard lineup, or a full royal treatment—our experienced barbers are here to deliver top-tier results with a luxury touch.
            <br /><br />
            <span className="text-white font-semibold">Come for the cut, stay for the confidence.</span>
          </motion.p>
        </div>

        {/* The King Package - Featured */}
        <div className="mb-16">
          <motion.h3
            className="text-3xl font-montserrat font-bold text-center mb-8 text-yellow-400"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            PREMIUM PACKAGE
          </motion.h3>
          <div className="max-w-2xl mx-auto">
            <ServiceCard service={kingPackage} isKing={true} onBookNow={onBookService} />
          </div>
        </div>

        {/* Hair Services */}
        <div className="mb-16">
          <motion.h3
            className="text-3xl font-montserrat font-bold text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            ✂️ HAIR SERVICES
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hairServices.map((service) => (
              <ServiceCard key={service.title} service={service} onBookNow={onBookService} />
            ))}
          </div>
        </div>

        {/* Beard & Shave Services */}
        <div className="mb-16">
          <motion.h3
            className="text-3xl font-montserrat font-bold text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            🧔 BEARD & SHAVE SERVICES
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beardServices.map((service) => (
              <ServiceCard key={service.title} service={service} onBookNow={onBookService} />
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <motion.h3
            className="text-3xl font-montserrat font-bold text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            💆‍♂️ FACIALS & GROOMING
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service) => (
              <ServiceCard key={service.title} service={service} onBookNow={onBookService} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center bg-medium-gray rounded-2xl p-8 border border-border-gray"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h3 className="text-3xl font-montserrat font-bold mb-4">📅 BOOK YOUR APPOINTMENT</h3>
          <p className="text-light-gray font-inter mb-6">
            Walk-ins are welcome. Appointments recommended.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="tel:+17144991906"
              className="bg-white text-pure-black px-8 py-4 rounded-full font-montserrat font-bold text-lg hover-scale hover-glow transition-all duration-300 inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="mr-3" size={20} />
              📞 CALL US
            </motion.a>
            <motion.button
              onClick={onBookService}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-montserrat font-bold text-lg hover-scale hover:bg-white hover:text-pure-black transition-all duration-300 inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Monitor className="mr-3" size={20} />
              💻 BOOK ONLINE
            </motion.button>
            <motion.button
              className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-montserrat font-bold text-lg hover-scale hover:bg-yellow-400 hover:text-pure-black transition-all duration-300 inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="mr-3" size={20} />
              🚶‍♂️ STOP BY TODAY
            </motion.button>
          </div>
          <p className="text-yellow-400 font-inter mt-6 text-lg font-semibold">
            Level up your grooming game—because you deserve to look and feel your best.
            <br />
            <span className="text-white">Your next-level grooming experience awaits.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
