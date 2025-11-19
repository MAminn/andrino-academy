"use client";

import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CpuChipIcon,
  SparklesIcon,
  RocketLaunchIcon,
  TrophyIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

export default function WhoIsAndrino() {
  const features = [
    {
      id: 1,
      icon: AcademicCapIcon,
      text: "مناهج دولية معتمدة",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      icon: UserGroupIcon,
      text: "مدربين متخصصين للأطفال",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      icon: CpuChipIcon,
      text: "تعليم تكنولوجي حديث",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const stats = [
    {
      icon: RocketLaunchIcon,
      value: "500+",
      label: "طالب متخرج",
      color: "text-[#7e5b3f]",
    },
    {
      icon: TrophyIcon,
      value: "95%",
      label: "نسبة النجاح",
      color: "text-[#c19170]",
    },
    {
      icon: LightBulbIcon,
      value: "1000+",
      label: "مشروع منجز",
      color: "text-[#343b50]",
    },
  ];

  return (
    <section
      id='about'
      dir='rtl'
      className='bg-gradient-to-b from-[#b7b7b8] to-white py-24 relative overflow-hidden'>
      {/* Enhanced Decorative Elements */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-[#7e5b3f]/5 rounded-full blur-3xl animate-pulse'></div>
      <div className='absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#c19170]/5 rounded-full blur-3xl animate-pulse delay-75'></div>
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#343b50]/3 rounded-full blur-2xl'></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className='max-w-7xl mx-auto px-4 md:px-8 relative z-10'>
        {/* Section Header with Badge */}
        <div className='text-center mb-16'>
        

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-5xl md:text-6xl font-bold text-[#343b50] mb-6 leading-tight'>
            مين هي أندرينو أكاديمي؟
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto mb-12'>
            إحنا أكاديمية أونلاين متخصصة فى تعليم الأطفال كل مجالات التكنولوجيا
            الحديثة و الذكاء الإصطناعى و تجهيزهم ليكونوا روادا للمستقبل فى كل
            جوانب التكنولوجيا من خلال مناهج معتمدة دوليا تم تصميمها و تطويرها من
            قبل مهندسين متخصصين فى علوم التكنولوجيا الحديثة و البرمجيات و الذكاء
            الإصطناعى.
          </motion.p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16'>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#c19170]/30'>
                {/* Gradient Overlay on Hover */}
                <div className='absolute inset-0 bg-gradient-to-br from-[#7e5b3f]/5 to-[#c19170]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                <div className='relative z-10 text-center'>
                  <div className='inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-[#7e5b3f]/10 to-[#c19170]/10 rounded-2xl group-hover:scale-110 transition-transform duration-300'>
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className='text-4xl font-bold text-[#343b50] mb-2 group-hover:scale-110 transition-transform duration-300'>
                    {stat.value}
                  </div>
                  <div className='text-gray-600 font-semibold'>
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Features Grid */}
   

        {/* Bottom CTA Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className='mt-16 text-center bg-gradient-to-r from-[#7e5b3f] to-[#c19170] rounded-3xl p-10 shadow-2xl relative overflow-hidden'>
     
          <div className='absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2'></div>
          <div className='absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2'></div>

          <div className='relative z-10'>
            <h3 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              ابدأ رحلة طفلك التعليمية اليوم!
            </h3>
            <p className='text-white/90 text-lg mb-6 max-w-2xl mx-auto'>
              انضم لمئات العائلات التي اختارت أندرينو لتعليم أطفالهم مهارات
              المستقبل
            </p>
            <button className='bg-white text-[#343b50] px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'>
              احجز حصة مجانية الآن
            </button>
          </div>
        </motion.div> */}
      </motion.div>
    </section>
  );
}
