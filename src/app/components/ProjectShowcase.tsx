"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  summary: string;
  coverUrl: string;
}

interface ProjectShowcaseProps {
  projects?: Project[];
}

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "متجر إلكتروني متكامل",
    summary:
      "تطبيق ويب للتجارة الإلكترونية باستخدام React و Node.js مع نظام دفع آمن وإدارة المخزون",
    coverUrl: "https://picsum.photos/seed/ecommerce/600/400",
  },
  {
    id: "2",
    title: "تطبيق إدارة المهام",
    summary:
      "تطبيق جوال لإدارة المشاريع والمهام مع إشعارات ذكية ومزامنة سحابية",
    coverUrl: "https://picsum.photos/seed/taskmanager/600/400",
  },
  {
    id: "3",
    title: "منصة تعليمية تفاعلية",
    summary:
      "نظام إدارة التعلم مع فيديوهات تفاعلية واختبارات ذكية وتتبع التقدم",
    coverUrl: "https://picsum.photos/seed/lms/600/400",
  },
  {
    id: "4",
    title: "شبكة اجتماعية",
    summary:
      "منصة تواصل اجتماعي مع دردشة فورية ومشاركة الملفات ومجموعات المناقشة",
    coverUrl: "https://picsum.photos/seed/social/600/400",
  },
  {
    id: "5",
    title: "تطبيق ذكي للصحة",
    summary:
      "تطبيق لتتبع اللياقة البدنية والتغذية مع تحليل البيانات والتوصيات الشخصية",
    coverUrl: "https://picsum.photos/seed/health/600/400",
  },
  {
    id: "6",
    title: "نظام إدارة المطاعم",
    summary: "حل شامل لإدارة المطاعم مع نظام الطلبات والمخزون وإدارة الموظفين",
    coverUrl: "https://picsum.photos/seed/restaurant/600/400",
  },
];

export default function ProjectShowcase({
  projects = defaultProjects,
}: ProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Handle modal open/close
  const openModal = (project: Project) => {
    setSelectedProject(project);
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    setSelectedProject(null);
    dialogRef.current?.close();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    if (selectedProject) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [selectedProject]);

  // Focus trap for modal
  useEffect(() => {
    if (selectedProject && dialogRef.current) {
      const dialog = dialogRef.current;
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      dialog.addEventListener("keydown", handleTabKey);
      firstElement?.focus();

      return () => dialog.removeEventListener("keydown", handleTabKey);
    }
  }, [selectedProject]);

  return (
    <section className='py-16 lg:py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-brand-blue mb-4'>
            نماذج من مشاريع الطلاب
          </h2>
          <p className='text-lg text-brand-blue/70 max-w-2xl mx-auto'>
            اكتشف المشاريع المبتكرة التي أنجزها طلابنا خلال رحلتهم التعليمية
          </p>
        </div>

        {/* Projects Grid */}
        <div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          role='list'
          aria-label='قائمة مشاريع الطلاب'>
          {projects.map((project) => (
            <div
              key={project.id}
              className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg focus-within:-translate-y-1'
              role='listitem'
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}>
              {/* Cover Image */}
              <div className='relative aspect-video overflow-hidden'>
                <Image
                  src={project.coverUrl}
                  alt={`صورة مشروع ${project.title}`}
                  width={600}
                  height={400}
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />

                {/* Dark Gradient Overlay - Simplified */}
                <div
                  className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                    hoveredProject === project.id ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Hover Overlay Content - Minimalist */}
                <div
                  className={`absolute inset-0 flex flex-col justify-end p-6 text-white transition-opacity duration-300 ${
                    hoveredProject === project.id ? "opacity-100" : "opacity-0"
                  }`}>
                  <div className='text-right'>
                    {/* Project Type Badge */}
                    <span className='inline-block px-3 py-1 bg-brand-copper text-white text-xs font-medium rounded-full mb-3'>
                      مشروع طالب
                    </span>
                    <h3 className='text-xl font-bold mb-2 text-white'>
                      {project.title}
                    </h3>
                    <p className='text-white/90 text-sm leading-relaxed line-clamp-2'>
                      {project.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Click Handler Button (invisible but accessible) */}
              <button
                onClick={() => openModal(project)}
                className='absolute inset-0 w-full h-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-2xl'
                aria-label={`عرض تفاصيل مشروع ${project.title} - اضغط Enter للفتح`}
                onFocus={() => setHoveredProject(project.id)}
                onBlur={() => setHoveredProject(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(project);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Call-to-Action */}
        <div className='text-center mt-12'>
          <p className='text-brand-blue/70 mb-6'>
            هل أنت مستعد لبناء مشروعك التالي؟
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/book-session'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='ابدأ مشروعك مع خبرائنا'>
              ابدأ مشروعك معنا
            </a>
            <a
              href='/projects'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-brand-blue bg-white border-2 border-brand-blue/10 hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='استكشاف المزيد من مشاريع الطلاب'>
              مشاريع أخرى
            </a>
          </div>
        </div>
      </div>

      {/* Modal Dialog - Minimalist */}
      <dialog
        ref={dialogRef}
        className='backdrop:bg-black/40 bg-transparent p-4 max-w-4xl w-full max-h-[90vh] rounded-2xl'
        aria-modal='true'
        aria-labelledby='modal-title'
        onClick={(e) => {
          // Close modal when clicking backdrop
          if (e.target === dialogRef.current) {
            closeModal();
          }
        }}>
        {selectedProject && (
          <div className='bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200'>
            {/* Modal Header - Simplified */}
            <div className='relative'>
              <Image
                src={selectedProject.coverUrl}
                alt={`صورة مشروع ${selectedProject.title}`}
                width={800}
                height={300}
                className='w-full h-48 lg:h-64 object-cover'
              />
              {/* Simple overlay instead of gradient */}
              <div className='absolute inset-0 bg-black/20' />

              {/* Brand accent badge */}
              <div className='absolute top-4 right-4'>
                <span className='px-3 py-1 bg-brand-copper text-white text-sm font-medium rounded-full'>
                  مشروع طالب
                </span>
              </div>

              <button
                onClick={closeModal}
                className='absolute top-4 left-4 w-10 h-10 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper shadow-sm'
                aria-label='إغلاق النافذة - اضغط Escape أو Enter'
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    closeModal();
                  }
                }}>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content - Clean and minimal */}
            <div className='p-6 lg:p-8 text-right'>
              <h2
                id='modal-title'
                className='text-2xl lg:text-3xl font-bold text-brand-blue mb-4'>
                {selectedProject.title}
              </h2>
              <p className='text-gray-700 leading-relaxed text-base lg:text-lg mb-8'>
                {selectedProject.summary}
              </p>

              {/* Minimal action buttons */}
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <button
                  onClick={closeModal}
                  className='px-6 py-3 text-base font-medium rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors'
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      closeModal();
                    }
                  }}>
                  إغلاق
                </button>
                <a
                  href={`/projects/${selectedProject.id}`}
                  className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-colors'
                  aria-label={`عرض تفاصيل مشروع ${selectedProject.title}`}>
                  عرض التفاصيل
                </a>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
