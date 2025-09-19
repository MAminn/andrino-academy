"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const stats = [
  {
    id: 1,
    label: "طالب متخرج",
    value: 1250,
    suffix: "+",
    icon: "👨‍🎓",
  },
  {
    id: 2,
    label: "دورة تدريبية",
    value: 85,
    suffix: "+",
    icon: "📚",
  },
  {
    id: 3,
    label: "مدرب خبير",
    value: 28,
    suffix: "+",
    icon: "👨‍🏫",
  },
  {
    id: 4,
    label: "نسبة النجاح",
    value: 98,
    suffix: "%",
    icon: "🎯",
  },
];

function CountUpNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className='font-bold'>
      {count.toLocaleString("ar-SA")}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section
      className='py-16 md:py-20 bg-gradient-to-b from-white to-[#b7b7b8] overflow-hidden'
      dir='rtl'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-12 md:mb-16'>
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-[#7e5b3f]/10 text-[#7e5b3f] text-sm font-medium mb-4'>
            📊 إحصائياتنا
          </div>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
            أرقام تتحدث عن النجاح
          </h2>
          <p className='text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'>
            إنجازات حقيقية تعكس التزامنا بتقديم أفضل تعليم تقني
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='group text-center'>
              {/* Card */}
              <div className='bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#7e5b3f]/20 transition-all duration-300 group-hover:-translate-y-1'>
                {/* Icon */}
                <div className='text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                  {stat.icon}
                </div>

                {/* Number */}
                <div className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#7e5b3f] mb-2'>
                  <CountUpNumber target={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className='text-gray-600 text-sm md:text-base font-medium'>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className='text-center mt-12 md:mt-16'>
          <div className='inline-flex items-center gap-2 text-[#7e5b3f] font-medium bg-[#7e5b3f]/5 px-6 py-3 rounded-full border border-[#7e5b3f]/10'>
            <span>وأرقام في تزايد مستمر</span>
            <span className='text-lg'>📈</span>
          </div>
        </div>
      </div>
    </section>
  );
}
