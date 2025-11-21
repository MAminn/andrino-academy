"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FlagIcon } from "@heroicons/react/24/solid";

const TracksRoadmap: React.FC = () => {
  const tracks = [
    {
      id: "scratch-junior",
      name: "Scratch Junior",
      image: "/assests/tracks/scratch-junior.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "scratch-3",
      name: "Scratch 3",
      image: "/assests/tracks/scratch-3.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "python-1",
      name: "Python (Level 1)",
      image: "/assests/tracks/python-1.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "python-2",
      name: "Python (Level 2)",
      image: "/assests/tracks/python-2.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "web-1",
      name: "Web Developer (Level 1)",
      image: "/assests/tracks/web-1.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "web-2",
      name: "Web Developer (Level 2)",
      image: "/assests/tracks/web-2.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "web-3",
      name: "Web Developer (Level 3)",
      image: "/assests/tracks/web-3.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "mobile-1",
      name: "Mobile App (Level 1)",
      image: "/assests/tracks/mobile-1.png",
      months: 3,
      sessions: 12,
    },
    {
      id: "mobile-2",
      name: "Mobile App (Level 2)",
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
      className='relative py-20 overflow-hidden bg-[linear-gradient(to_bottom,#b7b7b8,#ffffff)]'>
      {/* Soft Background Gradients */}
      <div className='absolute top-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#d9d7d3]/6 to-[#f2efe9]/6 rounded-full blur-3xl'></div>
      <div className='absolute top-60 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#f2efe9]/6 to-[#d9d7d3]/6 rounded-full blur-3xl'></div>
      <div className='absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#e8e6e1]/4 rounded-full blur-3xl'></div>

      <div className='max-w-7xl mx-auto px-4 md:px-8 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}>
          {/* Header */}
          <div className='flex flex-col items-center mb-8'>
            <h2 className='text-5xl font-extrabold text-[#343b50] text-center mb-4'>
              مسار أندرينو التعليمي
            </h2>

            <p className='text-gray-600 text-center text-lg max-w-xl mx-auto leading-relaxed mb-6'>
              اكتشف كيف ينتقل طفلك خطوة بخطوة من الأساسيات إلى البرمجة
              الاحترافية من خلال مسار تعليمي واضح وممتع.
            </p>
          </div>

          {/* Track Selector Pills */}
          <div className='mb-12'>
            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            {/* Desktop: Centered Pills */}
            <div className='hidden md:flex justify-center gap-3 mb-4'>
              {tracks.map((track, index) => (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveTrackId(track.id)}
                  className={
                    track.id === activeTrackId
                      ? "bg-[#7e5b3f] text-white shadow-md rounded-2xl px-5 py-2 h-11 flex items-center whitespace-nowrap font-medium scale-[1.02] transition-all duration-200"
                      : "bg-white border border-[#e5e7eb] shadow-sm rounded-2xl px-5 py-2 h-11 flex items-center text-[#343b50] font-medium whitespace-nowrap hover:bg-neutral-50 hover:shadow-md transition-all duration-200"
                  }>
                  {track.name}
                </motion.button>
              ))}
            </div>

            {/* Mobile: Scrollable Pills */}
            <div className='md:hidden relative w-full'>
              <div className='flex gap-3 min-w-max px-6 py-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x'>
                {tracks.map((track, index) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    onClick={() => setActiveTrackId(track.id)}
                    className={
                      track.id === activeTrackId
                        ? "bg-[#7e5b3f] text-white shadow-md rounded-2xl px-5 py-2 h-11 flex items-center whitespace-nowrap font-medium scale-[1.02] transition-all duration-200"
                        : "bg-white border border-[#e5e7eb] shadow-sm rounded-2xl px-5 py-2 h-11 flex items-center text-[#343b50] font-medium whitespace-nowrap hover:bg-neutral-50 hover:shadow-md transition-all duration-200"
                    }>
                    {track.name}
                  </motion.button>
                ))}
              </div>

              {/* Left Fade Shadow */}
              <div className='absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#fafbfc] to-transparent pointer-events-none'></div>

              {/* Right Fade Shadow */}
              <div className='absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#f1f3f7] to-transparent pointer-events-none'></div>
            </div>
          </div>

          {/* Active Course Card */}
          <motion.div
            key={activeTrack.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='max-w-lg mx-auto mb-16'>
            <div className='bg-white rounded-3xl shadow-xl overflow-hidden border border-[#0000000a] transition-all duration-300 ease-out hover:shadow-2xl'>
              {/* Card Image */}
              <div className='relative overflow-hidden h-64 bg-gray-50'>
                <Image
                  src={activeTrack.image}
                  alt={activeTrack.name}
                  width={600}
                  height={400}
                  className='w-full h-full object-cover rounded-t-3xl transition-transform duration-500 hover:scale-105'
                />

                {/* Track Badge on Image */}
                <div className='absolute top-5 right-5 bg-gradient-to-r from-[#7e5b3f] to-[#c19170] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm'>
                  {activeTrack.months} شهور • {activeTrack.sessions} حصة
                </div>
              </div>

              {/* Card Details */}
              <div className='p-8 text-center'>
                <h3 className='text-2xl font-bold text-neutral-800 mb-2'>
                  {activeTrack.name}
                </h3>

                {/* Decorative Underline */}
                <span className='block w-10 h-1 bg-[#7e5b3f] mx-auto mt-2 rounded-full mb-4'></span>

                <p className='text-base text-gray-600 leading-relaxed max-w-sm mx-auto'>
                  كل مستوى يتكون من محتوى تفاعلي وأنشطة عملية مناسبة لعمر الطفل
                  مع متابعة مستمرة من المدربين المتخصصين.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className='mt-10 max-w-4xl mx-auto'>
            <div className='relative bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-[#0000000a]'>
              {/* Start Flag */}
              <div className='absolute right-6 top-1/2 -translate-y-1/2 z-20'>
                <motion.div
                  className='relative w-12 h-12 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-full flex items-center justify-center shadow-xl'
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}>
                  <FlagIcon className='w-6 h-6 text-white' />
                </motion.div>
              </div>

              {/* Dashed Line */}
              {/* <div className='absolute right-14 left-14 top-1/2 border-t-[3px] border-dashed border-[#7e5b3f]/50 -translate-y-1/2' /> */}

              {/* Dots Container */}
              <div className='relative flex justify-between items-center px-16'>
                {tracks.map((track, index) => {
                  const isActive = track.id === activeTrackId;
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      viewport={{ once: true }}
                      className='flex flex-col items-center gap-3'>
                      {/* Dot */}
                      <motion.div
                        className='relative'
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}>
                        {isActive && (
                          <div className='absolute inset-0 bg-[#7e5b3f]/40 rounded-full blur-lg animate-pulse'></div>
                        )}
                        <div
                          className={
                            "relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer " +
                            (isActive
                              ? "w-6 h-6 bg-[#7e5b3f] shadow-xl ring-4 ring-[#7e5b3f]/20"
                              : "w-3 h-3 bg-white border-[3px] border-[#7e5b3f]/80 hover:border-[#7e5b3f] shadow-md")
                          }
                          onClick={() => setActiveTrackId(track.id)}>
                          {isActive && (
                            <div className='w-2 h-2 bg-white rounded-full'></div>
                          )}
                        </div>
                      </motion.div>

                      {/* Label */}
                      <div
                        className={
                          "text-xs whitespace-nowrap text-center transition-all duration-300 " +
                          (isActive
                            ? "text-[#7e5b3f] font-bold scale-105"
                            : "text-[#6c6359] font-bold")
                        }>
                        {track.months} شهور
                        <span
                          className={
                            "block text-[11px] mt-0.5 " +
                            (isActive
                              ? "text-[#7e5b3f]/80 font-semibold"
                              : "text-gray-500")
                          }>
                          ({track.sessions} حصة)
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* End Flag (Orange) */}
              <div className='absolute left-6 top-1/2 -translate-y-1/2 z-20'>
                <motion.div
                  className='w-11 h-11 bg-[#d2803d] rounded-full flex items-center justify-center shadow-lg cursor-pointer'
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}>
                  <FlagIcon className='w-5 h-5 text-white' />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TracksRoadmap;
