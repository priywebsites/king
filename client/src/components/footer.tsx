import { Crown, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-gray border-t border-border-gray py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-montserrat font-black mb-2 flex items-center justify-center">
              <Crown className="mr-2 text-light-gray" size={24} />
              KINGS BARBER SHOP
            </h3>
            <p className="text-light-gray font-inter">Where Precision Meets Style</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-montserrat font-bold mb-2">CONTACT</h4>
              <p className="text-light-gray font-inter text-sm">(714) 499-1906</p>
              <p className="text-light-gray font-inter text-sm">221 S Magnolia Ave, Anaheim, CA</p>
            </div>
            <div>
              <h4 className="font-montserrat font-bold mb-2">HOURS</h4>
              <p className="text-light-gray font-inter text-sm">Mon, Wed-Sat: 11AM-8PM</p>
              <p className="text-light-gray font-inter text-sm">Sun: 11AM-4PM • Tues: Closed</p>
            </div>
            <div>
              <h4 className="font-montserrat font-bold mb-2">FOLLOW</h4>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="text-light-gray hover:text-white transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="text-light-gray hover:text-white transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://www.google.com/maps/place/kings+barber+shop/@33.8289074,-117.9764284,3a,75y,90t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light-gray hover:text-white transition-colors duration-300"
                  aria-label="Google Maps"
                >
                  🌐
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border-gray pt-8">
            <p className="text-light-gray font-inter text-sm">
              © 2024 Kings Barber Shop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
