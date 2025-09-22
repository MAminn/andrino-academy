"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "متجر إلكتروني متكامل",
    student: "أحمد محمد",
    description:
      "متجر إلكتروني بميزات متقدمة يتضمن نظام دفع، إدارة المخزون، وتتبع الطلبات",
    image: "/api/placeholder/400/250",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "تطوير ويب",
    icon: GlobeAltIcon,
    color: "from-blue-500 to-cyan-500",
    stats: {
      lines: "15,000+",
      features: "25+",
      performance: "98%",
    },
  },
  {
    id: 2,
    title: "تطبيق توصيل طعام",
    student: "فاطمة أحمد",
    description: "تطبيق موبايل لتوصيل الطعام مع نظام GPS وتتبع مباشر للطلبات",
    image: "/api/placeholder/400/250",
    technologies: ["React Native", "Firebase", "Maps API", "Payment Gateway"],
    category: "تطبيقات موبايل",
    icon: DevicePhoneMobileIcon,
    color: "from-green-500 to-emerald-500",
    stats: {
      downloads: "5,000+",
      rating: "4.8★",
      users: "2,500+",
    },
  },
  {
    id: 3,
    title: "نظام إدارة المدارس",
    student: "عبدالله خالد",
    description:
      "نظام شامل لإدارة المدارس يشمل الطلاب، المعلمين، الدرجات، والحضور",
    image: "/api/placeholder/400/250",
    technologies: ["Vue.js", "Laravel", "MySQL", "Chart.js"],
    category: "أنظمة إدارة",
    icon: CodeBracketIcon,
    color: "from-purple-500 to-pink-500",
    stats: {
      schools: "15+",
      students: "10,000+",
      efficiency: "85%",
    },
  },
  {
    id: 4,
    title: "منصة تعلم أونلاين",
    student: "نورا سعد",
    description: "منصة تعليمية تفاعلية مع فيديوهات، اختبارات، وتتبع التقدم",
    image: "/api/placeholder/400/250",
    technologies: ["Angular", "Express.js", "PostgreSQL", "Socket.io"],
    category: "تطبيقات تعليمية",
    icon: GlobeAltIcon,
    color: "from-amber-500 to-orange-500",
    stats: {
      courses: "50+",
      students: "3,000+",
      completion: "92%",
    },
  },
  {
    id: 5,
    title: "لعبة ألغاز ثلاثية الأبعاد",
    student: "يوسف عمر",
    description:
      "لعبة ألغاز مبتكرة بجرافيك ثلاثي الأبعاد ومستويات متدرجة الصعوبة",
    image: "/api/placeholder/400/250",
    technologies: ["Unity", "C#", "Blender", "Photon"],
    category: "تطوير ألعاب",
    icon: CodeBracketIcon,
    color: "from-indigo-500 to-purple-500",
    stats: {
      levels: "100+",
      downloads: "15,000+",
      rating: "4.7★",
    },
  },
  {
    id: 6,
    title: "تطبيق ذكي لتحليل البيانات",
    student: "مريم حسن",
    description:
      "تطبيق يستخدم الذكاء الاصطناعي لتحليل البيانات وإنتاج تقارير ذكية",
    image: "/api/placeholder/400/250",
    technologies: ["Python", "TensorFlow", "Flask", "D3.js"],
    category: "ذكاء اصطناعي",
    icon: CodeBracketIcon,
    color: "from-teal-500 to-blue-500",
    stats: {
      accuracy: "96%",
      datasets: "500+",
      reports: "1,000+",
    },
  },
];

export default function ProjectShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  useEffect(() => {
    // Reset slide when screen size changes
    const handleResize = () => {
      setCurrentSlide(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categories = [
    "الكل",
    "تطوير ويب",
    "تطبيقات موبايل",
    "أنظمة إدارة",
    "تطبيقات تعليمية",
    "تطوير ألعاب",
    "ذكاء اصطناعي",
  ];

  const filteredProjects =
    selectedCategory === "الكل"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  const getItemsPerView = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const getMaxSlides = () => {
    const itemsPerView = getItemsPerView();
    return Math.max(1, filteredProjects.length - itemsPerView + 1);
  };

  const getTranslatePercentage = () => {
    const itemsPerView = getItemsPerView();
    return 100 / itemsPerView;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % getMaxSlides());
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + getMaxSlides()) % getMaxSlides());
  };

  return (
    <section
      className='py-20 bg-gradient-to-b from-[#b7b7b8] to-white overflow-hidden'
      dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-12 md:mb-16'>
          <h2 className='text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4'>
            مشاريع حقيقية بناها طلابنا
          </h2>
          <p className='text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4'>
            اطلع على المشاريع المذهلة التي طورها طلابنا خلال رحلة التعلم، من
            تطبيقات الويب إلى الألعاب والذكاء الاصطناعي
          </p>
        </div>

        {/* Category Filter */}
        <div className='flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-4'>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentSlide(0);
              }}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-full font-medium transition-all duration-300 text-sm md:text-base ${
                selectedCategory === category
                  ? "bg-[#7e5b3f] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-[#c19170]/10 hover:text-[#7e5b3f] border border-gray-200"
              }`}>
              {category}
            </button>
          ))}
        </div>

        {/* Projects Carousel */}
        <div className='relative overflow-hidden px-4 md:px-0'>
          <div
            className='flex transition-transform duration-500 ease-in-out gap-4 md:gap-6'
            style={{
              transform: `translateX(${
                currentSlide * -getTranslatePercentage()
              }%)`,
            }}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className='min-w-[calc(100%-16px)] md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2'>
                {/* Project Image */}
                <div className='relative h-40 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden'>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20`}></div>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <project.icon className='w-12 h-12 md:w-16 md:h-16 text-white/80' />
                  </div>
                  {/* Category Badge */}
                  <div className='absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium text-gray-700'>
                    {project.category}
                  </div>
                </div>

                {/* Project Content */}
                <div className='p-4 md:p-6'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${project.color}`}></div>
                    <span className='text-xs md:text-sm text-gray-500'>
                      بواسطة {project.student}
                    </span>
                  </div>

                  <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-[#7e5b3f] transition-colors'>
                    {project.title}
                  </h3>

                  <p className='text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3'>
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className='flex flex-wrap gap-1 md:gap-2 mb-4'>
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium'>
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className='px-2 py-1 bg-[#c19170]/20 text-[#7e5b3f] text-xs rounded-md font-medium'>
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Project Stats */}
                  <div className='grid grid-cols-3 gap-1 md:gap-2 pt-4 border-t border-gray-100'>
                    {Object.entries(project.stats).map(
                      ([key, value], index) => (
                        <div key={index} className='text-center'>
                          <div className='text-xs md:text-sm font-bold text-gray-900'>
                            {value}
                          </div>
                          <div className='text-xs text-gray-500 capitalize'>
                            {key}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {filteredProjects.length > getItemsPerView() && (
            <>
              <button
                onClick={prevSlide}
                className='absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#c19170]/10 transition-colors duration-300 z-10'>
                <ChevronLeftIcon className='w-5 h-5 md:w-6 md:h-6 text-[#7e5b3f]' />
              </button>
              <button
                onClick={nextSlide}
                className='absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#c19170]/10 transition-colors duration-300 z-10'>
                <ChevronRightIcon className='w-5 h-5 md:w-6 md:h-6 text-[#7e5b3f]' />
              </button>
            </>
          )}
        </div>

        {/* Slide Indicators */}
        {filteredProjects.length > getItemsPerView() && (
          <div className='flex justify-center gap-2 mt-6 md:mt-8'>
            {Array.from({ length: getMaxSlides() }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? "bg-[#7e5b3f]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className='text-center bg-[#343b50] rounded-2xl p-8 mt-8 text-white'>
          <h3 className='text-2xl font-bold mb-4'>
            هل أنت مستعد لتكون قصة النجاح القادمة؟
          </h3>
          <p className='text-[#a6a6a6] mb-6 max-w-2xl mx-auto'>
            انضم لآلاف الطلاب الذين حققوا أحلامهم المهنية مع أكاديمية أندرينو
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/form'
              className='inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-[#343b50] bg-white hover:bg-[#7e5b3f] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl'>
              <span>احجز حصة مجانية</span>
              <svg
                className='mr-3 w-5 h-5'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </Link>
            <Link
              href='https://wa.me/966123456789'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-[#343b50] bg-white border-2 border-[#343b50] hover:bg-[#7e5b3f] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl'>
              <span>تواصل واتساب</span>
              <svg
                className='mr-3 w-5 h-5'
                fill='currentColor'
                viewBox='0 0 24 24'>
                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
