import Hero from "./components/Hero";
import FeatureGrid from "./components/FeatureGrid";
import StudentShowcase from "./components/StudentShowcase";
import ProjectShowcase from "./components/ProjectShowcase";
import Stats from "./components/Stats";
import WhyUs from "./components/WhyUs";
import WhoIsAndrino from "./components/WhoIsAndrino";
import TracksRoadmap from "./components/TracksRoadmap";
import EducationPlan from "./components/EducationPlan";

export default function Home() {
  return (
    <div>
      <section id='hero'>
        <Hero />
      </section>
      <section id='WhoIsAndrino'>
        <WhoIsAndrino />
      </section>
      {/* <section id='features'>
        <FeatureGrid />
      </section> */}
      <section id='students'>
        <StudentShowcase />
      </section>
      {/* 
      <section id='projects'>
        <ProjectShowcase />
      </section> */}
      <section id='why-us'>
        <WhyUs />
      </section>

      <section id="TracksRoadmap">
        <TracksRoadmap />
      </section>

      <section id="EduPlan">
        <EducationPlan />
      </section>
    </div>
  );
}
