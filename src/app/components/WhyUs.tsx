"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function WhyUs() {
  const [selected, setSelected] = useState(0);

  const features = [
    {
      title: "مناهج مستمرة طوال العام",
      desc: "نوفر للطفل رحلة تعليمية لا تتوقف على مدار السنة لبناء مهارات قوية.",
      icon: AcademicCapIcon,
    },
    {
      title: "واجبات منزلية بعد انتهاء المحاضرة",
      desc: "مهام أسبوعية يتم العمل عليها وتسليمها للمدرب قبل المحاضرة القادمة.",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: "شهادات معتمدة دولياً",
      desc: "يحصل الطفل على شهادة معتمدة بعد كل مستوى من الأكاديمية.",
      icon: ShieldCheckIcon,
    },
    {
      title: "مهندسون متخصصون للأطفال",
      desc: "مدربون محترفون ومؤهلون للتعامل مع كل مرحلة عمرية.",
      icon: UserGroupIcon,
    },
    {
      title: "دعم مستمر لولي الأمر",
      desc: "فريق دعم متواجد للإجابة على جميع الاستفسارات باستمرار.",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      title: "3 طلاب فقط في كل محاضرة",
      desc: "نضمن أعلى استفادة من خلال مجموعات تعليم صغيرة.",
      icon: UsersIcon,
    },
    {
      title: "خطة تعليمية واضحة لكل محاضرة",
      desc: "نسلم ولي الأمر خطة تعليمية توضح أهداف كل محاضرة.",
      icon: DocumentTextIcon,
    },
  ];

  return (
    <section
      id='why-us'
      dir='rtl'
      className='bg-gradient-to-b from-white to-[#b7b7b8] py-20'>
      <div className='max-w-7xl mx-auto px-4 md:px-8'>
        {/* Section Title */}
        <h2 className='text-4xl font-bold text-[#343b50] text-center mb-16'>
          لماذا تختار أندرينو أكاديمي؟
        </h2>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
          {/* Right Side - Interactive Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='space-y-4'>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelected(index)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                    selected === index
                      ? "bg-[#7e5b3f] text-white border-transparent shadow-md"
                      : "bg-white border-gray-200 hover:border-[#7e5b3f]/40"
                  }`}>
                  <div className='flex items-center gap-4'>
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
                        selected === index
                          ? "bg-white text-[#7e5b3f]"
                          : "bg-[#7e5b3f]/10 text-[#7e5b3f]"
                      }`}>
                      <IconComponent className='w-6 h-6' />
                    </div>

                    {/* Text Content */}
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold mb-1'>
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm transition-all duration-300 ${
                          selected === index
                            ? "opacity-90"
                            : "opacity-70 text-gray-600"
                        }`}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/assests/andrinio-about.png'
              alt='أندرينو أكاديمي'
              className='w-full h-auto rounded-3xl object-cover'
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
