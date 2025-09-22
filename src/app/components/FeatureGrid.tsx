"use client";

import {
  CodeBracketIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  StarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: CodeBracketIcon,
    title: "تعلم البرمجة من الصفر",
    description:
      "ابدأ رحلتك في عالم البرمجة بأساليب تعليمية مبسطة ومناسبة لجميع الأعمار",
  },
  {
    icon: AcademicCapIcon,
    title: "شهادات معتمدة",
    description:
      "احصل على شهادات معتمدة تضيف قيمة حقيقية لمسيرتك المهنية والأكاديمية",
  },
  {
    icon: ClockIcon,
    title: "مرونة في التوقيت",
    description: "تعلم في الوقت الذي يناسبك مع جدولة مرنة وإمكانية الوصول 24/7",
  },
  {
    icon: UserGroupIcon,
    title: "مدربين خبراء",
    description:
      "فريق من المدربين المحترفين مع سنوات من الخبرة في التدريس والبرمجة",
  },
  {
    icon: PuzzlePieceIcon,
    title: "تعلم تفاعلي",
    description: "مشاريع عملية وأنشطة تفاعلية تجعل التعلم ممتعاً وفعالاً",
  },
  {
    icon: StarIcon,
    title: "جودة عالية",
    description: "محتوى تعليمي عالي الجودة مطور بأحدث المعايير التعليمية",
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "تعلم من أي مكان",
    description: "منصة متجاوبة تعمل على جميع الأجهزة - حاسوب، تابلت، أو هاتف",
  },
  {
    icon: GlobeAltIcon,
    title: "مجتمع عالمي",
    description: "انضم لمجتمع عالمي من المتعلمين وتبادل الخبرات والمعرفة",
  },
];

export default function FeatureGrid() {
  return (
    <section
      className='py-20 bg-gradient-to-b from-[#b7b7b8] to-white overflow-hidden'
      dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl lg:text-5xl font-bold text-[#343b50] mb-6'>
            لماذا تختار أكاديمية أندرينو؟
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            نقدم تجربة تعليمية شاملة ومتميزة تضمن لك إتقان البرمجة بأسرع وقت
            وأفضل جودة
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='group flex flex-col justify-center items-center relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100'>
              {/* Icon Container */}
              <div className='w-16 h-16 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                <feature.icon className='w-8 h-8 text-white' />
              </div>

              {/* Content */}
              <h3 className='text-xl font-bold text-[#343b50] mb-4 group-hover:text-[#7e5b3f] transition-colors'>
                {feature.title}
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                {feature.description}
              </p>

              {/* Hover Border Effect */}
              <div className='absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#c19170] transition-colors duration-300'></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
