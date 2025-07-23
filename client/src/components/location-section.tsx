import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";

export default function LocationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const hours = [
    { day: "Monday", time: "11:00 AM – 8:00 PM", closed: false },
    { day: "Tuesday", time: "Closed", closed: true },
    { day: "Wednesday", time: "11:00 AM – 8:00 PM", closed: false },
    { day: "Thursday", time: "11:00 AM – 8:00 PM", closed: false },
    { day: "Friday", time: "11:00 AM – 8:00 PM", closed: false },
    { day: "Saturday", time: "11:00 AM – 8:00 PM", closed: false },
    { day: "Sunday", time: "11:00 AM – 4:00 PM", closed: false }
  ];

  return (
    <section id="location" className="py-20 bg-dark-gray" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-black mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            VISIT US
          </motion.h2>
          <motion.p
            className="text-xl text-light-gray font-inter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Conveniently located in the heart of Anaheim
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Location Info */}
          <div className="space-y-8">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h3 className="text-2xl font-montserrat font-bold mb-4 flex items-center">
                <MapPin className="mr-4 text-light-gray" size={24} />
                ADDRESS
              </h3>
              <p className="text-lg text-light-gray font-inter mb-4">
                221 S Magnolia Ave, Suite B/2<br />
                Anaheim, CA 92804, United States
              </p>
              <a
                href="https://www.google.com/maps/place/kings+barber+shop/@33.8289074,-117.9764284,3a,75y,90t"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-white hover:text-light-gray transition-colors duration-300 font-montserrat font-semibold"
              >
                <ExternalLink className="mr-2" size={16} />
                VIEW ON GOOGLE MAPS
              </a>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-montserrat font-bold mb-4 flex items-center">
                <Clock className="mr-4 text-light-gray" size={24} />
                HOURS
              </h3>
              <div className="space-y-2 text-lg font-inter">
                {hours.map((hour, index) => (
                  <div key={hour.day} className="flex justify-between">
                    <span>{hour.day}</span>
                    <span className={hour.closed ? "text-red-400" : "text-light-gray"}>
                      {hour.time}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3 className="text-2xl font-montserrat font-bold mb-4 flex items-center">
                <Phone className="mr-4 text-light-gray" size={24} />
                PHONE
              </h3>
              <a
                href="tel:+17144991906"
                className="text-lg text-white hover:text-light-gray transition-colors duration-300 font-inter"
              >
                +1 (714) 499-1906
              </a>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-medium-gray rounded-2xl p-4 hover-scale transition-all duration-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.8529834!2d-117.976428!3d33.8289074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcd7e40b1b5c25%3A0x9c8b2b9c8b2b9c8b!2s221%20S%20Magnolia%20Ave%2C%20Anaheim%2C%20CA%2092804!5e0!3m2!1sen!2sus!4v1645000000000!5m2!1sen!2sus"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
                title="Kings Barber Shop Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
