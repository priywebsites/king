import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Phone, Menu, X } from "lucide-react";

interface NavigationProps {
  onToggleBarberDashboard: () => void;
  onToggleAppointmentManager: () => void;
}

export default function Navigation({ onToggleBarberDashboard, onToggleAppointmentManager }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);

      // Update active section
      const sections = ["home", "about", "services", "gallery", "reviews", "location", "contact"];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom > 100;
        }
        return false;
      });
      setActiveSection(currentSection || "");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "gallery", label: "Gallery" },
    { id: "reviews", label: "Reviews" },
    { id: "location", label: "Location" },
    { id: "contact", label: "Contact" },
    { id: "cancel-reschedule", label: "🔁 Cancel/Reschedule", action: onToggleAppointmentManager }
  ];

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass-effect" : "bg-transparent"
      } border-b border-border-gray`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0"
          >
            <button
              onClick={() => scrollToSection("home")}
              className="text-2xl font-montserrat font-bold text-white flex items-center"
            >
              <Crown className="mr-2 text-light-gray" size={24} />
              KINGS
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.action ? item.action() : scrollToSection(item.id)}
                  className={`font-montserrat font-semibold transition-colors duration-300 ${
                    activeSection === item.id && !item.action ? "text-white" : "text-light-gray hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            {/* Barber Dashboard Button */}
            <motion.button
              onClick={onToggleBarberDashboard}
              className="hidden md:flex bg-medium-gray text-white px-4 py-2 rounded-full font-montserrat font-bold transition-all duration-300 text-sm items-center hover:bg-border-gray"
              whileHover={{ 
                scale: 1.05, 
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
            >
              🧑‍🔧 Barber Dashboard
            </motion.button>
            
            {/* Book Now Button */}
            <motion.a
              href="tel:+17144991906"
              className="bg-white text-pure-black px-6 py-2 rounded-full font-montserrat font-bold transition-all duration-300 text-sm flex items-center"
              whileHover={{ 
                scale: 1.1, 
                boxShadow: "0 0 25px rgba(255,255,255,0.4)",
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2 }}
              >
                <Phone className="mr-2" size={16} />
              </motion.div>
              BOOK NOW
            </motion.a>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-light-gray focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden glass-effect border-t border-border-gray"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action ? item.action() : scrollToSection(item.id);
                  setIsMenuOpen(false);
                }}
                className="block px-3 py-2 text-white hover:text-light-gray font-montserrat font-semibold w-full text-left"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onToggleBarberDashboard();
                setIsMenuOpen(false);
              }}
              className="block px-3 py-2 text-white hover:text-light-gray font-montserrat font-semibold w-full text-left"
            >
              🧑‍🔧 Barber Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
