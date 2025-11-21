import Hero from "./components/Hero";
import FeatureGrid from "./components/FeatureGrid";
import StudentShowcase from "./components/StudentShowcase";
import ProjectShowcase from "./components/ProjectShowcase";
import Stats from "./components/Stats";
import WhyUs from "./components/WhyUs";
import WhoIsAndrino from "./components/WhoIsAndrino";
import TracksRoadmap from "./components/TracksRoadmap";
import EducationPlan from "./components/EducationPlan";
import PricingSection from "./components/PricingSection";

export default function Home() {
  return (
    <div>
      <section id='hero'>
        <Hero />
      </section>
      <section id='WhoIsAndrino'>
        <WhoIsAndrino />
      </section>

      <section id='why-us'>
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
