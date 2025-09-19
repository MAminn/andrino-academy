import Hero from "./components/Hero";
import FeatureGrid from "./components/FeatureGrid";
import StudentShowcase from "./components/StudentShowcase";
import ProjectShowcase from "./components/ProjectShowcase";
import Stats from "./components/Stats";
import WhyUs from "./components/WhyUs";

export default function Home() {
  return (
    <div>
      <section id='hero'>
        <Hero />
      </section>

      <section id='features'>
        <FeatureGrid />
      </section>

      <section id='students'>
        <StudentShowcase />
      </section>

      <section id='projects'>
        <ProjectShowcase />
      </section>

      <section id='why-us'>
        <WhyUs />
      </section>
    </div>
  );
}
