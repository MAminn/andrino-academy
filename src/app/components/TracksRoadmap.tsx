"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Flag, Calendar, GraduationCap } from "lucide-react";

const TracksRoadmap: React.FC = () => {
  const tracks = [
    {
      id: "scratch-junior",
      name: "Scratch Junior",
      nameAr: "سكراتش جونيور",
      description: "مقدمة إلى البرمجة للأطفال من خلال قصص تفاعلية وألعاب بسيطة",
      image: "/assests/tracks/scratch-junior.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "scratch-3",
      name: "Scratch 3",
      nameAr: "سكراتش 3",
      description: "تعلم أساسيات البرمجة عن طريق إنشاء ألعاب وقصص متحركة",
      image: "/assests/tracks/scratch-3.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "python-1",
      name: "Python (Level 1)",
      nameAr: "بايثون المستوى الأول",
      description: "مقدمة إلى لغة بايثون وأساسيات البرمجة النصية",
      image: "/assests/tracks/python-1.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "python-2",
      name: "Python (Level 2)",
      nameAr: "بايثون المستوى الثاني",
      description: "تطوير مهارات بايثون المتقدمة وبناء مشاريع تفاعلية",
      image: "/assests/tracks/python-2.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "web-1",
      name: "Web Developer (Level 1)",
      nameAr: "تطوير الويب المستوى الأول",
      description: "تعلم HTML و CSS وإنشاء صفحات ويب جذابة",
      image: "/assests/tracks/web-1.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "web-2",
      name: "Web Developer (Level 2)",
      nameAr: "تطوير الويب المستوى الثاني",
      description: "إضافة التفاعل مع JavaScript وبناء مشاريع ديناميكية",
      image: "/assests/tracks/web-2.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "web-3",
      name: "Web Developer (Level 3)",
      nameAr: "تطوير الويب المستوى الثالث",
      description: "تطوير تطبيقات ويب متقدمة باستخدام أحدث التقنيات",
      image: "/assests/tracks/web-3.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "mobile-1",
      name: "Mobile App (Level 1)",
      nameAr: "تطبيقات الجوال المستوى الأول",
      description: "مقدمة إلى تطوير تطبيقات الجوال وتصميم الواجهات",
      image: "/assests/tracks/mobile-1.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "mobile-2",
      name: "Mobile App (Level 2)",
      nameAr: "تطبيقات الجوال المستوى الثاني",
      description: "بناء تطبيقات جوال متكاملة ونشرها على المتاجر",
      image: "/assests/tracks/mobile-2.png",
      months: 3,
      sessions: 12,
    },
  ];

  const [activeTrackId, setActiveTrackId] = useState(tracks[0].id);
  const activeTrack = tracks.find((t) => t.id === activeTrackId)!;

  return (
    <section
      id='tracks'
      dir='rtl'
      className='relative py-20 md:py-[140px] px-4 overflow-hidden bg-gradient-to-b from-[#F9F9F9] via-white to-[#F9F9F9]'>
      {/* Floating Decorative Shapes */}
      <div className='absolute top-20 right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-[#6B4E3D]/5 to-[#8B6E5D]/5 rounded-full blur-3xl' />
      <div className='absolute bottom-40 left-[8%] w-[500px] h-[500px] bg-gradient-to-tr from-[#c19170]/5 to-[#6B4E3D]/5 rounded-full blur-3xl' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5F3EF]/30 rounded-full blur-3xl' />

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className='text-center mb-16 md:mb-20'>
          <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-5 relative inline-block'>
            مسار أندرينو التعليمي
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className='absolute -bottom-2 right-0 h-1 bg-gradient-to-l from-[#6B4E3D] to-[#8B6E5D] rounded-full'
            />
          </h2>
          <p className='text-base md:text-lg text-[#6D6D6D] max-w-[620px] mx-auto leading-relaxed mt-6'>
            اكتشف كيف ينتقل طفلك خطوة بخطوة من الأساسيات إلى البرمجة الاحترافية
            من خلال مسار تعليمي واضح وممتع
          </p>
        </motion.div>

        {/* Track Selector Pills */}
        <div className='mb-16 md:mb-20'>
          {/* Desktop: Centered Wrapped Pills */}
          <div className='hidden md:flex flex-wrap justify-center gap-3 max-w-5xl mx-auto'>
            {tracks.map((track, index) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTrackId(track.id)}
                className={`
                  ${
                    track.id === activeTrackId
                      ? "bg-gradient-to-r from-[#6B4E3D] to-[#8B6E5D] text-white shadow-[0_8px_20px_rgba(107,78,61,0.25)]"
                      : "bg-white text-[#1A1A1A] border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  }
                  px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap
                `}>
                {track.name}
              </motion.button>
            ))}
          </div>

          {/* Mobile: Horizontal Scroll with Snap */}
          <div className='md:hidden relative'>
            <div className='overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar'>
              <div className='flex gap-3 px-4 pb-2'>
                {tracks.map((track, index) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    onClick={() => setActiveTrackId(track.id)}
                    className={`
                      ${
                        track.id === activeTrackId
                          ? "bg-gradient-to-r from-[#6B4E3D] to-[#8B6E5D] text-white shadow-[0_6px_16px_rgba(107,78,61,0.2)]"
                          : "bg-white text-[#1A1A1A] border border-gray-200 shadow-sm"
                      }
                      px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap snap-start flex-shrink-0
                    `}>
                    {track.name}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Fade edges */}
            <div className='absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#F9F9F9] to-transparent pointer-events-none' />
            <div className='absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#F9F9F9] to-transparent pointer-events-none' />
          </div>
        </div>

        {/* Active Course Card */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTrack.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='max-w-2xl mx-auto mb-20 md:mb-24'>
            <div className='relative bg-gradient-to-br from-white to-[#FAFAFA] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)] transition-shadow duration-500'>
              {/* Card Image */}
              <div className='relative h-64 md:h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden'>
                <Image
                  src={activeTrack.image}
                  alt={activeTrack.name}
                  width={800}
                  height={500}
                  className='w-full h-full object-cover transition-transform duration-700 hover:scale-110'
                />

                {/* Top Badge */}
                <div className='absolute top-5 right-5 bg-gradient-to-r from-[#6B4E3D] to-[#8B6E5D] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_8px_20px_rgba(107,78,61,0.3)] backdrop-blur-sm flex items-center gap-2'>
                  <Calendar size={16} strokeWidth={2.5} />
                  <span>
                    {activeTrack.sessions} حصة • {activeTrack.months} شهور
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className='p-8 md:p-10 text-center'>
                <h3 className='text-2xl md:text-3xl font-bold text-[#6B4E3D] mb-2'>
                  {activeTrack.nameAr}
                </h3>
                <p className='text-sm text-[#6D6D6D] mb-4 uppercase tracking-wide font-medium'>
                  {activeTrack.name}
                </p>

                {/* Decorative Divider */}
                <div className='flex items-center justify-center gap-2 my-6'>
                  <div className='h-[2px] w-16 bg-gradient-to-r from-transparent to-[#6B4E3D] rounded-full' />
                  <GraduationCap
                    size={20}
                    className='text-[#6B4E3D]'
                    strokeWidth={2}
                  />
                  <div className='h-[2px] w-16 bg-gradient-to-l from-transparent to-[#6B4E3D] rounded-full' />
                </div>

                <p className='text-base text-[#6D6D6D] leading-relaxed max-w-lg mx-auto'>
                  {activeTrack.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Timeline */}
        <div className='max-w-6xl mx-auto'>
          <div className='relative bg-white/80 backdrop-blur-sm rounded-[24px] p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-100'>
            {/* Start Flag */}
            <motion.div
              className='absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20'
              whileHover={{ scale: 1.15, rotate: 10 }}
              transition={{ duration: 0.3 }}>
              <div className='w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#6B4E3D] to-[#8B6E5D] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(107,78,61,0.3)]'>
                <Flag
                  size={24}
                  className='text-white'
                  strokeWidth={2.5}
                  fill='white'
                />
              </div>
            </motion.div>

            {/* Dotted Line */}
            <div className='absolute right-[60px] md:right-[80px] left-[60px] md:left-[80px] top-1/2 -translate-y-1/2'>
              <div className='w-full border-t-[3px] border-dashed border-[#6B4E3D]/30' />
            </div>

            {/* Desktop Timeline */}
            <div className='hidden md:flex justify-between items-center px-20 lg:px-24'>
              {tracks.map((track, index) => {
                const isActive = track.id === activeTrackId;
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    viewport={{ once: true }}
                    onClick={() => setActiveTrackId(track.id)}
                    className='flex flex-col items-center gap-3 cursor-pointer group'>
                    {/* Dot with Glow */}
                    <div className='relative'>
                      {isActive && (
                        <motion.div
                          className='absolute inset-0 bg-[#6B4E3D]/30 rounded-full blur-xl'
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <motion.div
                        whileHover={{ scale: 1.25 }}
                        transition={{ duration: 0.3 }}
                        className={`
                          relative rounded-full transition-all duration-300
                          ${
                            isActive
                              ? "w-7 h-7 bg-gradient-to-br from-[#6B4E3D] to-[#8B6E5D] shadow-[0_4px_16px_rgba(107,78,61,0.4)] ring-4 ring-[#6B4E3D]/20"
                              : "w-4 h-4 bg-white border-[3px] border-[#6B4E3D]/60 group-hover:border-[#6B4E3D] shadow-md group-hover:shadow-lg"
                          }
                        `}>
                        {isActive && (
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <div className='w-2.5 h-2.5 bg-white rounded-full' />
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Label */}
                    <div
                      className={`text-center transition-all duration-300 ${
                        isActive ? "scale-105" : ""
                      }`}>
                      <p
                        className={`text-sm font-bold whitespace-nowrap ${
                          isActive
                            ? "text-[#6B4E3D]"
                            : "text-[#6D6D6D] group-hover:text-[#6B4E3D]"
                        }`}>
                        {track.months} شهور
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive
                            ? "text-[#6B4E3D]/80 font-semibold"
                            : "text-[#6D6D6D]"
                        }`}>
                        {track.sessions} Sessions
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile Timeline - Horizontal Scroll */}
            <div className='md:hidden relative'>
              <div className='overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar px-16'>
                <div className='flex gap-8 pb-4'>
                  {tracks.map((track, index) => {
                    const isActive = track.id === activeTrackId;
                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        onClick={() => setActiveTrackId(track.id)}
                        className='flex flex-col items-center gap-3 snap-start flex-shrink-0'>
                        {/* Dot */}
                        <div className='relative'>
                          {isActive && (
                            <div className='absolute inset-0 bg-[#6B4E3D]/30 rounded-full blur-lg animate-pulse' />
                          )}
                          <div
                            className={`
                              relative rounded-full transition-all duration-300
                              ${
                                isActive
                                  ? "w-6 h-6 bg-gradient-to-br from-[#6B4E3D] to-[#8B6E5D] shadow-lg ring-4 ring-[#6B4E3D]/20"
                                  : "w-3.5 h-3.5 bg-white border-[2.5px] border-[#6B4E3D]/60 shadow-md"
                              }
                            `}>
                            {isActive && (
                              <div className='absolute inset-0 flex items-center justify-center'>
                                <div className='w-2 h-2 bg-white rounded-full' />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Label */}
                        <div className='text-center'>
                          <p
                            className={`text-sm font-bold whitespace-nowrap ${
                              isActive ? "text-[#6B4E3D]" : "text-[#6D6D6D]"
                            }`}>
                            {track.months} شهور
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              isActive
                                ? "text-[#6B4E3D]/80 font-semibold"
                                : "text-[#6D6D6D]"
                            }`}>
                            {track.sessions} Sessions
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* End Flag */}
            <motion.div
              className='absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20'
              whileHover={{ scale: 1.15, rotate: -10 }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              }}>
              <div className='w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#d2803d] to-[#e69b5a] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(210,128,61,0.3)]'>
                <Flag
                  size={22}
                  className='text-white'
                  strokeWidth={2.5}
                  fill='white'
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar utility */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TracksRoadmap;
