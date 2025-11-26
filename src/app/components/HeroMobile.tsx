"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  SparklesIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import HImage from "@/../assests/w-f.png";

export default function HeroMobile() {
  const stats = [
    { label: "+500 طالب", value: "500+" },
    { label: "+95% نسبة نجاح", value: "95%" },
    { label: "+1000 مشروع", value: "1000+" },
  ];

  const features = [
    {
      icon: SparklesIcon,
      text: "تطوير مهارات التفكير المنطقي والتحليل من خلال أنشطة شيّقة",
    },
    {
      icon: AcademicCapIcon,
      text: "دروس تفاعلية مليئة بالمرح تساعد على حل المشكلات بطرق مبتكرة",
    },
    {
      icon: RocketLaunchIcon,
      text: "تنمية روح الإبداع والابتكار عند الأطفال منذ الصغر",
    },
  ];

  return (
    <section
      dir='rtl'
      className='relative overflow-hidden bg-gradient-to-b from-[#f8f9fc] via-white to-[#f8f9fc] pt-6 pb-10 px-4 lg:hidden'>
      {/* Abstract Background Elements */}
      <div className='absolute top-0 right-0 w-64 h-64 bg-[#7e5b3f]/5 rounded-full blur-3xl' />
      <div className='absolute bottom-0 left-0 w-48 h-48 bg-[#343b50]/5 rounded-full blur-2xl' />

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='relative z-10 flex flex-col items-center'>
        {/* Logo/Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-6'>
          <Image
            src={HImage}
            alt='أندرينو أكاديمي'
            width={120}
            height={40}
            className='object-contain'
            priority
          />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='text-[35px] font-bold leading-snug text-center text-[#343b50] max-w-[90%] mx-auto mb-3'>
          أطفال اليوم{" "}
          <span className='bg-gradient-to-r from-[#7e5b3f] to-[#c19170] bg-clip-text text-transparent'>
            صُنّاع المستقبل
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='text-[14px] text-gray-600 text-center max-w-[90%] mx-auto leading-relaxed mb-4'>
          تعليم برمجة ممتع وبسيط مصمم خصيصًا للأطفال مع مدربين متخصصين ومناهج
          حديثة.
        </motion.p>

        {/* Feature Bullets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='w-full max-w-[90%] mx-auto space-y-2 mb-4'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className='flex items-start gap-2'>
                <Icon className='w-4 h-4 text-[#7e5b3f] flex-shrink-0 mt-0.5' />
                <p className='text-[13px] text-gray-700 leading-relaxed text-right'>
                  {feature.text}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className='w-[90%] mx-auto mb-3'>
          <Link
            href='https://wa.me/2001066520225'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center w-full h-[50px] rounded-full bg-[#7e5b3f] text-white font-semibold text-[15px] shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200'>
            <span>تواصل معنا عبر واتساب</span>
            <svg
              className='mr-2 w-5 h-5'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
            </svg>
          </Link>
        </motion.div>

        {/* Secondary CTA (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='w-[90%] mx-auto mb-6'>
          <Link
            href='#pricing'
            className='flex items-center justify-center w-full h-[44px] rounded-full border border-gray-300 text-[13px] text-gray-700 font-medium hover:bg-gray-50 active:scale-95 transition-all duration-200'>
            استكشف الخطط والأسعار
          </Link>
        </motion.div>

        {/* Stats Row - Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className='w-full overflow-x-auto scrollbar-hide'>
          <div className='flex gap-3 px-4 snap-x snap-mandatory pb-2'>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className='flex-shrink-0 snap-center bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3 min-w-[140px]'>
                <p className='text-2xl font-bold text-[#7e5b3f] text-center mb-1'>
                  {stat.value}
                </p>
                <p className='text-[11px] text-gray-600 text-center whitespace-nowrap'>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Hide scrollbar for stats */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
