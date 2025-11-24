"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  RocketLaunchIcon,
  CpuChipIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

const EducationPlan: React.FC = () => {
  const fields = [
    {
      id: 1,
      title: "مجال برمجة الألعاب وتطويرها",
      description:
        "تعليم الطفل كيفية تصميم وبرمجة الألعاب التفاعلية باستخدام أحدث الأدوات والتقنيات.",
      icon: RocketLaunchIcon,
    },
    {
      id: 2,
      title: "مجال الذكاء الاصطناعي",
      description:
        "اكتشاف عالم الذكاء الاصطناعي وربط مفاهيمه ببناء تطبيقات ذكية تُنمّي التفكير التحليلي.",
      icon: CpuChipIcon,
    },
    {
      id: 3,
      title: "مجال برمجة المواقع الإلكترونية بمختلف أنواعها",
      description:
        "تطوير المواقع الإلكترونية من البداية باستخدام أحدث التقنيات والأطر البرمجية.",
      icon: CodeBracketIcon,
    },
  ];

  return (
    <section
      dir='rtl'
      className='relative bg-gradient-to-b from-white via-[#fafafa] to-white py-16 md:py-24 lg:py-32 overflow-hidden'>
      {/* Subtle Background Elements */}
      <div className='absolute top-20 right-10 w-72 h-72 bg-[#7e5b3f]/5 rounded-full blur-3xl' />
      <div className='absolute bottom-20 left-10 w-96 h-96 bg-[#343b50]/5 rounded-full blur-3xl' />

      <div className='max-w-4xl mx-auto px-4 md:px-8 relative z-10'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#343b50] mb-4'>
            الخطة التعليمية
          </h2>
          <p className='text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            نقدم مسارات تعليمية متكاملة تغطي أحدث مجالات البرمجة والتكنولوجيا
            بأسلوب تفاعلي ممتع
          </p>
        </motion.div>

        {/* Timeline Layout */}
        <div className='relative'>
          {/* Timeline Vertical Line */}
          <div className='absolute right-[19px] md:right-[23px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-[#7e5b3f]/20 via-[#7e5b3f]/10 to-transparent' />

          {/* Timeline Items */}
          <div className='space-y-12'>
            {fields.map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className='relative flex items-start gap-6 md:gap-8'>
                  {/* Timeline Node with Icon */}
                  <div className='relative flex-shrink-0 z-10'>
                    {/* Outer Glow Ring */}
                    <div className='absolute inset-0 bg-gradient-to-br from-[#c19170] to-[#7e5b3f] rounded-full blur-md opacity-40' />

                    {/* Icon Badge */}
                    <div className='relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#c19170] to-[#7e5b3f] flex items-center justify-center shadow-lg'>
                      <Icon className='w-5 h-5 md:w-6 md:h-6 text-white stroke-[2]' />
                    </div>
                  </div>

                  {/* Card Content */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className='flex-1 rounded-2xl bg-gradient-to-br from-white to-[#f6f6f6] shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-6 md:p-8 border border-gray-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300'>
                    {/* Number Badge */}
                    <div className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#343b50]/5 text-[#343b50] text-sm font-bold mb-4'>
                      {index + 1}
                    </div>

                    {/* Title */}
                    <h3 className='text-xl md:text-2xl font-bold text-[#343b50] mb-3 leading-tight'>
                      {field.title}
                    </h3>

                    {/* Description */}
                    <p className='text-sm md:text-base text-gray-600 leading-relaxed'>
                      {field.description}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className='mt-16 text-center'>
          <p className='text-sm text-gray-500'>
            وغيرها الكثير من المجالات التقنية الحديثة
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationPlan;