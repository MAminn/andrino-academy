import Hero from "./components/Hero";
import FeatureGrid from "./components/FeatureGrid";
import StudentShowcase from "./components/StudentShowcase";
import ProjectShowcase from "./components/ProjectShowcase";
import Stats from "./components/Stats";
import WhyUs from "./components/WhyUs";

export const metadata = {
  title: "أكاديمية أندرينو | Andrino Academy",
  description: "مرحباً بكم في أكاديمية أندرينو، بوابتكم للتعليم الإلكتروني",
};

export default function HomePage() {
  return (
    <div className='space-y-0'>
      {/* Hero Section */}
      <Hero />

      {/* Feature Grid Section */}
      <FeatureGrid />

      {/* Student Showcase Section */}
      <StudentShowcase />

      {/* Project Showcase Section */}
      <ProjectShowcase />

      {/* Stats Section */}
      <Stats />

      {/* Why Us Section */}
      <WhyUs />


      {/* CTA Section */}
      <section className='bg-gradient-to-r from-brand-blue to-brand-brown rounded-brand-lg p-8 text-center text-white mx-4'>
        <h2 className='text-3xl font-heading font-bold mb-4'>
          Ready to Start Your Learning Journey?
        </h2>
        <p className='text-lg font-body mb-6 text-brand-copper'>
          Join thousands of students already learning with Andrino Academy
        </p>
        <a
          href='/signup'
          className='bg-brand-copper hover:bg-brand-copper-700 text-white px-8 py-4 rounded-brand-lg font-medium transition-colors shadow-copper'>
          Get Started Today
        </a>
      </section>
    </div>
  );
}
