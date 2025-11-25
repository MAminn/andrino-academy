"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Link from "next/link";

const testimonials = [
  {
    id: 1,
    name: "أحمد محمد علي",
    role: "مطور ويب في شركة تقنية",
    image: "/api/placeholder/150/150",
    content:
      "أكاديمية أندرينو غيرت مجرى حياتي المهنية. من صفر خبرة إلى مطور محترف في 6 أشهر فقط. المدربون رائعون والمنهج عملي جداً.",
    rating: 5,
    course: "تطوير المواقع الشاملة",
    achievement: "حصل على وظيفة براتب 8000 ريال",
  },
  {
    id: 2,
    name: "فاطمة أحمد السالم",
    role: "مطورة تطبيقات موبايل",
    image: "/api/placeholder/150/150",
    content:
      "بدات مع اندرينو من الصفر النهاردة انا قادر ابرمج موقع الكترونى متكامل من الصفر",
    rating: 5,
    course: "تطوير تطبيقات الموبايل",
    achievement: "بدأت عملها الحر وتحقق 12000 ريال شهرياً",
  },
  {
    id: 3,
    name: "عبدالله خالد النعيمي",
    role: "مطور العاب",
    image: "/api/placeholder/150/150",
    content:
      "حلمي كان تطوير الألعاب وأندرينو ساعدني أحقق هذا الحلم. المدربين يتابعونك خطوة بخطوة حتى تحترف.",
    rating: 5,
    course: "تطوير الألعاب",
    achievement: "أطلق 3 ألعاب ناجحة على متاجر التطبيقات",
  },
  {
    id: 4,
    name: "نورا سعد المطيري",
    role: "أخصائية أمن سيبراني",
    image: "/api/placeholder/150/150",
    content: "كنت فاكر تحليل البيانت صعب لكن لما بدات مع اندرينو كان سهل جدا",
    rating: 5,
    course: "الأمن السيبراني",
    achievement: "انضمت لشركة عالمية براتب 15000 ريال",
  },
  {
    id: 5,
    name: "يوسف عمر البقمي",
    role: "مطور ذكاء اصطناعي",
    image: "/api/placeholder/150/150",
    content:
      "انا قدرت اعمل شات بوت بالبايثون و زى ما كنت بستخدمه انا مبسوط اوى مع اندرينو",
    rating: 5,
    course: "الذكاء الاصطناعي وتعلم الآلة",
    achievement: "يعمل على مشاريع ذكاء اصطناعي براتب 20000 ريال",
  },
  {
    id: 6,
    name: "مريم حسن العتيبي",
    role: "محللة بيانات",
    image: "/api/placeholder/150/150",
    content:
      "كنت بابحث عن مكان لتعليم التطبيقات الموبايل و ده افضل مكان اتعلمت فيه ",
    rating: 5,
    course: "علم البيانات والتحليل",
    achievement: "انتقلت من التدريس إلى تحليل البيانات",
  },
];

export default function StudentShowcase() {
  return (
    <section
      className='py-16 md:py-24 bg-gradient-to-b from-[#FAFAFA] to-white'
      dir='rtl'>
      <div className='max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-14 md:mb-16'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4'>
            طلابنا يحققون أحلامهم
          </h2>
          <p className='text-base md:text-lg text-[#6D6D6D] max-w-[620px] mx-auto leading-relaxed'>
            اكتشف كيف غيّرت أكاديمية أندرينو حياة آلاف الطلاب وساعدتهم في تحقيق
            النجاح المهني
          </p>
        </div>

        {/* Testimonials Grid - 3 columns desktop, 2 tablet, 1 mobile */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              viewport={{ once: true, margin: "-50px" }}
              className='testimonial-card-wrapper'>
              <div className='testimonial-card group'>
                {/* Corner Highlight Effect */}
                <div className='testimonial-card-border' />

                {/* Quote Icon - Top Left */}
                <div className='absolute top-6 right-6'>
                  <ChatBubbleLeftIcon
                    className='w-8 h-8 text-gray-300'
                    strokeWidth={1.5}
                  />
                </div>

                {/* Card Content - Centered */}
                <div className='relative z-10 flex flex-col items-center text-center'>
                  {/* Avatar */}
                  <div className='w-16 h-16 rounded-full bg-gradient-to-br from-[#6B4E3D] to-[#8B6E5D] flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4'>
                    {testimonial.name.charAt(0)}
                  </div>

                  {/* Name & Role */}
                  <h4 className='font-bold text-[#1A1A1A] text-base mb-1'>
                    {testimonial.name}
                  </h4>
                  <p className='text-sm text-[#6D6D6D] mb-4'>
                    {testimonial.role}
                  </p>

                  {/* Rating Stars */}
                  <div className='flex gap-1 mb-4'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className='w-4 h-4 text-[#FDB241]' />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className='text-[#1A1A1A] leading-[1.75] text-[15px] font-normal'>
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className='text-center bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-[24px] p-8 md:p-10 text-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]'>
          <h3 className='text-2xl md:text-3xl font-bold mb-4'>
            هل أنت مستعد لتكون قصة النجاح القادمة؟
          </h3>
          <p className='text-gray-300 mb-8 max-w-[600px] mx-auto text-sm md:text-base leading-relaxed'>
            انضم لآلاف الطلاب الذين حققوا أحلامهم المهنية مع أكاديمية أندرينو
          </p>
          <Link
            href='https://wa.me/2001066520225'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-semibold rounded-[14px] bg-gradient-to-r from-[#6B4E3D] to-[#8B6E5D] text-white hover:from-[#5A3F2F] hover:to-[#7A5E4D] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1'>
            <span>تواصل واتساب</span>
            <svg
              className='mr-3 w-5 h-5'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Custom Styles for 3D Hover Effect */}
      <style jsx>{`
        .testimonial-card-wrapper {
          perspective: 900px;
        }

        .testimonial-card {
          position: relative;
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-style: preserve-3d;
          height: 100%;
        }

        .testimonial-card:hover {
          transform: translateY(-10px) scale(1.03) rotateX(2deg) rotateY(-2deg);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
        }

        .testimonial-card-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 2px solid transparent;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
        }

        .testimonial-card:hover .testimonial-card-border {
          transform: scale(1.05);
          border-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </section>
  );
}
