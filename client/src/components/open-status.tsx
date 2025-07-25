import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function OpenStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkIfOpen = () => {
      // Use California time for shop open/closed status
      const now = new Date();
      const californiaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
      const day = californiaTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = californiaTime.getHours();
      const minutes = californiaTime.getMinutes();
      const currentTimeInMinutes = hour * 60 + minutes;

      // Business hours: Mon, Wed-Sat: 11AM-8PM, Sun: 11AM-4PM, Tues: Closed
      let openTime, closeTime;

      if (day === 2) { // Tuesday - Closed
        setIsOpen(false);
        return;
      } else if (day === 0) { // Sunday - 11AM-4PM
        openTime = 11 * 60; // 11:00 AM
        closeTime = 16 * 60; // 4:00 PM
      } else { // Monday, Wed-Sat - 11AM-8PM
        openTime = 11 * 60; // 11:00 AM
        closeTime = 20 * 60; // 8:00 PM
      }

      setIsOpen(currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime);
    };

    checkIfOpen();
  }, [currentTime]);

  const getNextOpenTime = () => {
    // Use California time for next opening time calculation
    const now = new Date();
    const californiaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
    const day = californiaTime.getDay();
    
    if (day === 2) { // Tuesday
      return "Tomorrow at 11:00 AM";
    } else if (day === 0) { // Sunday
      if (californiaTime.getHours() >= 16) {
        return "Monday at 11:00 AM";
      }
    } else if (californiaTime.getHours() >= 20) {
      if (day === 1) { // Monday
        return "Wednesday at 11:00 AM";
      } else if (day === 6) { // Saturday
        return "Sunday at 11:00 AM";
      } else {
        return "Tomorrow at 11:00 AM";
      }
    }
    return "Today";
  };

  return (
    <motion.div
      className="fixed top-20 right-4 z-40 bg-dark-gray border border-border-gray rounded-lg p-3 shadow-lg"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      whileHover={{ 
        scale: 1.15,
        rotate: 5,
        boxShadow: "0 0 25px rgba(255,255,255,0.3)"
      }}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          animate={isOpen ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ 
            duration: 2, 
            repeat: isOpen ? Infinity : 0 
          }}
        >
          {isOpen ? (
            <CheckCircle className="text-green-400" size={16} />
          ) : (
            <XCircle className="text-red-400" size={16} />
          )}
        </motion.div>
        
        <div className="text-xs">
          <motion.p 
            className={`font-montserrat font-bold ${isOpen ? 'text-green-400' : 'text-red-400'}`}
            animate={isOpen ? { 
              color: ["#4ade80", "#22c55e", "#4ade80"]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </motion.p>
          {!isOpen && (
            <motion.p 
              className="text-light-gray font-inter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Opens {getNextOpenTime()}
            </motion.p>
          )}
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="text-light-gray" size={14} />
        </motion.div>
      </div>
    </motion.div>
  );
}