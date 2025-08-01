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

export default function Home() {
  // External booking URL
  const externalBookingUrl = "https://kings-barber-shop-anaheim.cloveronline.com/services/all#all";

  const handleBookService = () => {
    window.open(externalBookingUrl, '_blank');
  };

  return (
    <div className="bg-deep-black text-white font-inter overflow-x-hidden">
      <Navigation />
      <OpenStatus />
      <HeroSection 
        onBookNow={handleBookService} 
      />
      <AboutSection />
      <GallerySection />
      <ServicesSection onBookService={handleBookService} />
      <ReviewsSection />
      <LocationSection />
      <ContactSection />
      <Footer />
    </div>
  );
}