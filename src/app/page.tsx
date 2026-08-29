import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import WhyFamiliesChooseUs from "@/components/sections/WhyFamiliesChooseUs";
import VacationPlanner from "@/components/booking/VacationPlanner";
import Apartments from "@/components/sections/Apartments";
import Gallery from "@/components/sections/Gallery";
import Reviews from "@/components/sections/Reviews";
import Location from "@/components/sections/Location";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FAFAF7]">
      <Hero />
      <Features />
      <WhyFamiliesChooseUs />
      <VacationPlanner />
      <Apartments />
      <Gallery />
      <Reviews />
      <Location />
      <CTA />
    </main>
  );
}
