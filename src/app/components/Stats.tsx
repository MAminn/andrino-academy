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
    color: "from-[#7e5b3f] to-[#c19170]",
  },
  {
    id: 2,
    label: "دورة تدريبية",
    value: 85,
    suffix: "+",
    icon: "📚",
    color: "from-[#343b50] to-[#7e5b3f]",
  },
  {
    id: 3,
    label: "مدرب خبير",
    value: 28,
    suffix: "+",
    icon: "👨‍🏫",
    color: "from-[#c19170] to-[#7e5b3f]",
  },
  {
    id: 4,
    label: "نسبة النجاح",
    value: 98,
    suffix: "%",
    icon: "🎯",
    color: "from-[#7e5b3f] to-[#343b50]",
  },
  {
    id: 5,
    label: "ساعة تدريب",
    value: 15000,
    suffix: "+",
    icon: "⏰",
    color: "from-[#343b50] to-[#c19170]",
  },
  {
    id: 6,
    label: "مشروع منجز",
    value: 420,
    suffix: "+",
    icon: "🚀",
    color: "from-[#c19170] to-[#343b50]",
  },
];

function CountUpNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
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
      className='py-20 bg-gradient-to-br from-[#343b50] via-[#343b50]/90 to-[#343b50] relative overflow-hidden'
      dir='rtl'>
      {/* Background Effects */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-[#7e5b3f]/10 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-20 w-96 h-96 bg-[#c19170]/10 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7e5b3f]/5 rounded-full blur-3xl'></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-4'>
            📊 إحصائياتنا
          </div>
          <h2 className='text-4xl lg:text-5xl font-bold text-white mb-6'>
            أرقام تتحدث عن نجاحنا
          </h2>
          <p className='text-xl text-[#c19170] max-w-3xl mx-auto'>
            نفتخر بما حققناه من إنجازات ونسعى دائماً لتقديم الأفضل لطلابنا
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className='group relative'>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105'>
                {/* Icon */}
                <div className='text-4xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                  {stat.icon}
                </div>

                {/* Number */}
                <div
                  className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  <CountUpNumber target={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className='text-[#c19170] text-lg font-medium'>
                  {stat.label}
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className='text-center mt-16'>
          <div className='inline-flex items-center gap-2 text-[#c19170] font-medium bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10'>
            <span>وأرقام في تزايد مستمر...</span>
            <span className='text-lg'>📈</span>
          </div>
        </div>
      </div>
    </section>
  );
}
