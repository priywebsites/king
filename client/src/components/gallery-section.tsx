import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const galleryImages = [
    {
      src: "/attached_assets/Screen Shot 2025-07-23 at 3.23.04 PM_1753302753790.png",
      delay: 0.1
    },
    {
      src: "/attached_assets/Screen Shot 2025-07-23 at 3.21.44 PM_1753302755174.png",
      delay: 0.2
    },
    {
      src: "/attached_assets/Screen Shot 2025-07-23 at 3.21.26 PM_1753302756707.png",
      delay: 0.3
    },
    {
      src: "/attached_assets/Screen Shot 2025-07-23 at 3.21.10 PM_1753302758093.png",
      delay: 0.4
    }
  ];

  return (
    <section id="gallery" className="py-20 bg-pure-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-montserrat font-black mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            OUR WORK
          </motion.h2>
          <motion.p
            className="text-xl text-light-gray font-inter"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            See the artistry and craftsmanship in action
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              className="aspect-square overflow-hidden rounded-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.5, rotateZ: 45 }}
              animate={isInView ? { opacity: 1, scale: 1, rotateZ: 0 } : { opacity: 0, scale: 0.5, rotateZ: 45 }}
              transition={{ 
                duration: 1.0, 
                delay: image.delay,
                type: "spring",
                bounce: 0.4
              }}
              whileHover={{ 
                scale: 1.1,
                rotateZ: 3,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)",
                y: -8
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src={image.src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
