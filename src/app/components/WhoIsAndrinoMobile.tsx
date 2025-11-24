"use client";

import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  UsersIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function WhoIsAndrinoMobile() {
  const features = [
    {
      icon: AcademicCapIcon,
      title: "مناهج دولية معتمدة",
    },
    {
      icon: UserGroupIcon,
      title: "مدرسين متخصصين للأطفال",
    },
    {
      icon: ComputerDesktopIcon,
      title: "تعليم تكنولوجيا حديث",
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: "واجبات منزلية بعد المحاضرة",
    },
    {
      icon: ShieldCheckIcon,
      title: "شهادات معتمدة دولياً",
    },
    {
      icon: UsersIcon,
      title: "3 طلاب فقط في كل محاضرة",
    },
  ];

  return (
    <section dir='rtl' className='relative bg-white pt-16 pb-20 px-4 lg:hidden'>
      {/* Subtle Top Fade Divider */}
      <div className='absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-gray-50 to-transparent' />

      {/* Content Container */}
      <div className='max-w-md mx-auto relative z-10'>
      
        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className='text-[22px] font-bold text-center text-gray-800 leading-[1.3] mt-3'>
          من هي أندرينو أكاديمي؟
        </motion.h2>

        {/* Description Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className='text-[15px] text-gray-600 text-center max-w-[85%] mx-auto leading-[1.8] mt-2'>
          أندرينو أكاديمي هي منصة تعليمية متخصصة في تعليم البرمجة والتكنولوجيا
          للأطفال بأسلوب مبسط وممتع، مع مدربين خبراء ومناهج دولية معتمدة تُنمي
          مهارات طفلك وتؤهله لمستقبل مشرق.
        </motion.p>

        {/* Features Grid - 2 Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className='grid grid-cols-2 gap-4 mt-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                viewport={{ once: true }}
                className='bg-white rounded-2xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col items-center text-center gap-3 active:scale-95 transition-transform duration-150'>
                {/* Icon */}
                <div className='flex items-center justify-center'>
                  <Icon className='w-[22px] h-[22px] text-[#7E5A3F] stroke-[1.6]' />
                </div>

                {/* Title */}
                <h3 className='text-[14px] font-semibold text-gray-800 leading-tight'>
                  {feature.title}
                </h3>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
