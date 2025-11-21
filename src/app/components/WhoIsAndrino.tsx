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
      className='relative overflow-hidden py-28 bg-gradient-to-b from-[#b7b7b8] to-white'>
      {/* Enhanced Floating Shapes */}
      <div className='absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-[#f9d66a]/20 to-[#f6ad6f]/10 rounded-full blur-3xl'></div>
      <div className='absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-[#a8cfff]/15 to-[#c8b5ff]/10 rounded-full blur-3xl'></div>
      <div className='absolute top-1/2 right-1/3 w-64 h-64 bg-[#7e5b3f]/5 rounded-full blur-2xl animate-pulse'></div>

      {/* Floating Code Icons */}
      <div className='absolute top-32 left-16 text-6xl opacity-5'>💻</div>
      <div className='absolute bottom-32 right-16 text-5xl opacity-5'>🚀</div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className='max-w-7xl mx-auto px-4 md:px-8 relative z-10'>
        {/* Section Header */}
        <div className='text-center mb-20'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7e5b3f]/10 to-[#c19170]/10 text-[#7e5b3f] rounded-full text-sm font-bold mb-6 border border-[#7e5b3f]/20 backdrop-blur-sm'>
            <SparklesIcon className='w-5 h-5' />
            <span>من نحن</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[#343b50] to-[#7e5b3f] bg-clip-text text-transparent mb-6 leading-tight'>
            مين هي أندرينو أكاديمي؟
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto'>
            إحنا أكاديمية أونلاين متخصصة فى تعليم الأطفال كل مجالات التكنولوجيا
            الحديثة و الذكاء الإصطناعى و تجهيزهم ليكونوا روادا للمستقبل فى كل
            جوانب التكنولوجيا من خلال مناهج معتمدة دوليا تم تصميمها و تطويرها من
            قبل مهندسين متخصصين فى علوم التكنولوجيا الحديثة و البرمجيات و الذكاء
            الإصطناعى.
          </motion.p>
        </div>

        {/* Modernized Glass Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-20'>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className='group relative'>
                {/* Glass Card with Gradient Border */}
                <div className='absolute inset-0 bg-gradient-to-br from-[#7e5b3f] via-[#c19170] to-[#f6ad6f] rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500'></div>

                <div className='relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-500'>
                  {/* Animated Background Gradient */}
                  <div className='absolute inset-0 bg-gradient-to-br from-[#7e5b3f]/5 to-[#c19170]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                  <div className='relative z-10 text-center'>
                    {/* Enhanced Icon Container */}
                    <div className='inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                      <IconComponent className='w-10 h-10 text-white' />
                    </div>

                    {/* Large Number with Gradient */}
                    <div className='text-5xl font-black bg-gradient-to-r from-[#7e5b3f] to-[#c19170] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300'>
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div className='text-gray-700 font-bold text-lg'>
                      {stat.label}
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className='absolute top-4 right-4 w-2 h-2 bg-[#7e5b3f] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <div className='absolute bottom-4 left-4 w-2 h-2 bg-[#c19170] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300'></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Features with Vertical Timeline */}
        <div className='relative mb-20'>
          {/* Vertical Timeline Line */}
          <div className='hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7e5b3f] via-[#c19170] to-[#7e5b3f] rounded-full shadow-lg'></div>

          <div className='space-y-12'>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col gap-8`}>
                  {/* Feature Card */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className='group w-full md:w-5/12 relative'>
                    {/* Glow Effect */}
                    <div className='absolute inset-0 bg-gradient-to-br from-[#7e5b3f]/20 to-[#c19170]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                    <div className='relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border-2 border-white shadow-2xl hover:shadow-3xl transition-all duration-500'>
                      {/* Corner Gradient Border Effect */}
                      <div className='absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-[#7e5b3f] to-transparent rounded-tr-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300'></div>
                      <div className='absolute -bottom-1 -left-1 w-20 h-20 bg-gradient-to-tl from-[#c19170] to-transparent rounded-bl-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300'></div>

                      <div className='relative z-10 flex items-start gap-6'>
                        {/* Enhanced Icon */}
                        <div className='flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'>
                          <IconComponent className='w-8 h-8 text-white' />
                        </div>

                        <div className='flex-1'>
                          <h3 className='text-2xl font-bold text-[#343b50] group-hover:text-[#7e5b3f] transition-colors duration-300'>
                            {feature.text}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className='hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-full shadow-lg border-4 border-white z-10 hover:scale-150 transition-transform duration-300'>
                    {/* Pulse Ring */}
                    <span className='absolute inset-0 rounded-full bg-[#7e5b3f] animate-ping opacity-30'></span>
                  </motion.div>

                  {/* Empty Space for Layout */}
                  <div className='hidden md:block w-5/12'></div>
                </motion.div>
              );
            })}
          </div>
        </div>

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
