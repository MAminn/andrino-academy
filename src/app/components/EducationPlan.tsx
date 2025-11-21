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
    <section
      dir='rtl'
      className='relative bg-gradient-to-b from-[#b7b7b8] to-white py-28 overflow-hidden'>
      {/* Abstract Floating Shapes */}

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
