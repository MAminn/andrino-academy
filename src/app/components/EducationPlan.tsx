"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  PuzzlePieceIcon,
  CpuChipIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

const EducationPlan: React.FC = () => {
  const fields = [
    {
      id: 1,
      title: "مجال برمجة الألعاب وتطويرها",
      description:
        "تعليم الطفل كيفية تصميم وبرمجة الألعاب التفاعلية باستخدام أحدث الأدوات والتقنيات.",
      icon: PuzzlePieceIcon,
    },
    {
      id: 2,
      title: "مجال الذكاء الاصطناعي",
      description:
        "اكتشاف عالم الذكاء الاصطناعي وتعلم كيفية بناء تطبيقات ذكية تحاكي التفكير البشري.",
      icon: CpuChipIcon,
    },
    {
      id: 3,
      title: "مجال برمجة المواقع الإلكترونية بمختلف أنواعها",
      description:
        "تطوير المواقع الإلكترونية من البداية باستخدام أحدث التقنيات والأطر البرمجية.",
      icon: GlobeAltIcon,
    },
    {
      id: 4,
      title: "مجال برمجة تطبيقات الهواتف",
      description:
        "تصميم وتطوير تطبيقات الهواتف الذكية للأندرويد وiOS بطرق احترافية.",
      icon: DevicePhoneMobileIcon,
    },
  ];

  return (
    <section dir='rtl' className='relative bg-[#f8f9fc] py-28 overflow-hidden'>
      {/* Abstract Floating Shapes */}
      <div className='absolute top-10 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-20 blur-3xl'></div>
      <div className='absolute top-20 right-16 w-80 h-80 opacity-15'>
        <svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
          <path
            fill='#60a5fa'
            d='M45.3,-78.1C58.9,-71.2,70.5,-59.4,77.8,-45.2C85.1,-31,88.1,-14.4,87.3,2.1C86.5,18.6,81.9,34.9,73.4,48.6C64.9,62.3,52.5,73.4,38.2,79.8C23.9,86.2,7.7,88,-8.3,87C-24.3,86,-40.1,82.2,-53.8,74.8C-67.5,67.4,-79.1,56.4,-85.4,42.8C-91.7,29.2,-92.7,13.1,-90.1,-2.3C-87.5,-17.7,-81.3,-32.4,-71.8,-44.8C-62.3,-57.2,-49.5,-67.3,-35.6,-73.9C-21.7,-80.5,-6.7,-83.6,7.5,-82.3C21.7,-81,31.7,-85,45.3,-78.1Z'
            transform='translate(100 100)'
          />
        </svg>
      </div>
      <div className='absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-[#d9d7d3]/5 to-[#f2efe9]/5 rounded-full blur-3xl'></div>

      <div className='max-w-7xl mx-auto px-6 md:px-10 relative z-10'>
        {/* Title + Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}>
          <h2 className='text-4xl md:text-5xl font-extrabold text-[#343b50] text-center mb-6'>
            الخطة التعليمية لأكاديمية أندرينو
          </h2>

          <p className='text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto text-center mb-16'>
            نحرص فى أندرينو على تغطية كافة المجالات المتعلقة بالتكنولوجيا
            الحديثة والتى تجعل من الطفل مؤهلاً لكافة التحديات فى المستقبل
            وقادراً على توظيفها والتكيف معها بل وتطويرها باستمرار أيضاً. وتتمثل
            هذه المجالات التعليمية فى:
          </p>
        </motion.div>

        {/* Four Technology Fields Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          {fields.map((field, index) => {
            const IconComponent = field.icon;
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='group bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-8 flex gap-6 items-start border border-[#00000008]'>
                {/* Icon Container */}
                <div className='w-14 h-14 rounded-2xl bg-[#7e5b3f]/10 group-hover:bg-[#7e5b3f] flex items-center justify-center text-[#7e5b3f] group-hover:text-white transition-all duration-300 flex-shrink-0'>
                  <IconComponent className='w-7 h-7' />
                </div>

                {/* Text Content */}
                <div>
                  <h3 className='text-2xl font-bold text-[#343b50] mb-2 leading-snug'>
                    {field.title}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {field.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EducationPlan;
