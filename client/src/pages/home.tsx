import { useState } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ServicesSection from "@/components/services-section";
import GallerySection from "@/components/gallery-section";
import ReviewsSection from "@/components/reviews-section";
import LocationSection from "@/components/location-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import OpenStatus from "@/components/open-status";
import BookingForm from "@/components/booking-form";
import BarberDashboard from "@/components/barber-dashboard";
import AppointmentManager from "@/components/appointment-manager";

export default function Home() {
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [barberDashboardOpen, setBarberDashboardOpen] = useState(false);
  const [appointmentManagerOpen, setAppointmentManagerOpen] = useState(false);

  const handleBookService = (service: string) => {
    setSelectedService(service);
    setBookingFormOpen(true);
  };

  const handleToggleBarberDashboard = () => {
    setBarberDashboardOpen(!barberDashboardOpen);
  };

  const handleToggleAppointmentManager = () => {
    setAppointmentManagerOpen(!appointmentManagerOpen);
  };

  return (
    <div className="bg-deep-black text-white font-inter overflow-x-hidden">
      <Navigation 
        onToggleBarberDashboard={handleToggleBarberDashboard}
        onToggleAppointmentManager={handleToggleAppointmentManager}
      />
      <OpenStatus />
      <HeroSection onBookNow={() => handleBookService("")} />
      <AboutSection />
      <ServicesSection onBookService={handleBookService} />
      <GallerySection />
      <ReviewsSection />
      <LocationSection />
      <ContactSection />
      <Footer />
      
      {/* Booking System Modals */}
      {bookingFormOpen && (
        <BookingForm
          selectedService={selectedService}
          onClose={() => {
            setBookingFormOpen(false);
            setSelectedService("");
          }}
        />
      )}
      
      <BarberDashboard
        isOpen={barberDashboardOpen}
        onClose={() => setBarberDashboardOpen(false)}
      />
      
      {appointmentManagerOpen && (
        <AppointmentManager
          isOpen={appointmentManagerOpen}
          onClose={() => setAppointmentManagerOpen(false)}
        />
      )}
    </div>
  );
}
