import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import GallerySection from "@/components/gallery-section";
import ReviewsSection from "@/components/reviews-section";
import LocationSection from "@/components/location-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import OpenStatus from "@/components/open-status";

export default function Home() {
  return (
    <div className="bg-deep-black text-white font-inter overflow-x-hidden">
      <Navigation />
      <OpenStatus />
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <ReviewsSection />
      <LocationSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
