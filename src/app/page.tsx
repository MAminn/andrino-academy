import Hero from "./components/Hero";
import HeroMobile from "./components/HeroMobile";
import StudentShowcase from "./components/StudentShowcase";
import WhyUs from "./components/WhyUs";
import WhyUsMobile from "./components/WhyUsMobile";
import WhoIsAndrino from "./components/WhoIsAndrino";
import WhoIsAndrinoMobile from "./components/WhoIsAndrinoMobile";
import TracksRoadmap from "./components/TracksRoadmap";
import EducationPlan from "./components/EducationPlan";
import PricingSection from "./components/PricingSection";

export default function Home() {
  return (
    <div>
      <section id='hero'>
        {/* Mobile Hero - Hidden on Desktop */}
        <HeroMobile />
        {/* Desktop Hero - Hidden on Mobile */}
        <Hero />
      </section>
      <section id='WhoIsAndrino'>
        {/* Mobile Version - Hidden on Desktop */}
        <WhoIsAndrinoMobile />
        {/* Desktop Version - Hidden on Mobile */}
        <WhoIsAndrino />
      </section>

      <section id='why-us'>
        {/* Mobile Version - Hidden on Desktop */}
        <WhyUsMobile />
        {/* Desktop Version - Hidden on Mobile */}
        <WhyUs />
      </section>

      <section id='EduPlan'>
        <EducationPlan />
      </section>

      <section id='pricing'>
        <PricingSection />
      </section>

      <section id='TracksRoadmap'>
        <TracksRoadmap />
      </section>

      <section id='students'>
        <StudentShowcase />
      </section>
    </div>
  );
}
