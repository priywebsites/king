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
  const externalBookingUrl = "https://booksy.com/en-us/instant-experiences/widget/253804?instant_experiences_enabled=true&ig_ix=true&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXz8nMy9ZLys%2FPLq7US87P1ffP9Asrs0iqTIxIsq8rSk1LLSrKzEuPTyrKLy9OLbL1zU%2FKzElVNTIITkxLLMoEAMin16JGAAAA&_branch_match_id=1503545893108763488";

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