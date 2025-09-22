"use client";

import { CheckIcon, SparklesIcon } from "@heroicons/react/24/solid";

const reasons = [
  {
    title: "منهج تعليمي مُحدث",
    description:
      "مناهج مطورة حسب أحدث معايير الصناعة ومتطلبات سوق العمل العالمي",
    icon: "📚",
    highlight: "منهج 2024",
  },
  {
    title: "تعلم عملي وتطبيقي",
    description: "70% من الوقت مخصص للتطبيق العملي وبناء مشاريع حقيقية",
    icon: "⚡",
    highlight: "مشاريع حقيقية",
  },
  {
    title: "دعم فني مستمر",
    description: "فريق دعم متاح 24/7 لمساعدتك في حل أي مشكلة تقنية أو أكاديمية",
    icon: "🛟",
    highlight: "دعم 24/7",
  },
  {
    title: "شبكة خريجين قوية",
    description: "انضم لشبكة من الخريجين الناجحين والحصول على فرص عمل حصرية",
    icon: "🌐",
    highlight: "شبكة مهنية",
  },
  {
    title: "ضمان الجودة",
    description:
      "ضمان استرداد كامل إذا لم تكن راضياً عن جودة التعليم خلال 30 يوم",
    icon: "🛡️",
    highlight: "ضمان 30 يوم",
  },
  {
    title: "التعلم المخصص",
    description: "مسار تعليمي مخصص حسب مستواك وأهدافك المهنية",
    icon: "🎯",
    highlight: "مخصص لك",
  },
];

const benefits = [
  "حصص مباشرة مع المدربين",
  "وصول مدى الحياة للمواد",
  "شهادات معتمدة دولياً",
  "مجتمع طلاب نشط",
  "ورش عمل إضافية مجانية",
  "متابعة شخصية لكل طالب",
  "مكتبة موارد شاملة",
  "دعم البحث عن وظيفة",
];

export default function WhyUs() {
  return (
    <section
      className='py-20 bg-gradient-to-b from-white to-[#b7b7b8] overflow-hidden'
      dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
            نحن مختلفون وهذا ما يميزنا
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            في أكاديمية أندرينو، نؤمن أن التعليم يجب أن يكون ملهماً وعملياً
            ومؤثراً. إليك ما يجعلنا الخيار الأول للمتعلمين
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-16 items-start'>
          {/* Left Side - Main Reasons */}
          <div className='space-y-8'>
            <h3 className='text-2xl font-bold text-gray-900 mb-8'>
              ما يميز تجربة التعلم معنا:
            </h3>

            {reasons.map((reason, index) => (
              <div
                key={index}
                className='group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200'>
                <div className='flex items-start gap-4'>
                  {/* Icon */}
                  <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-lg'>
                    {reason.icon}
                  </div>

                  {/* Content */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h4 className='text-xl font-bold text-gray-900'>
                        {reason.title}
                      </h4>
                      <span className='px-2 py-1 bg-[#c19170]/20 text-[#7e5b3f] text-xs font-medium rounded-full'>
                        {reason.highlight}
                      </span>
                    </div>
                    <p className='text-gray-600 leading-relaxed'>
                      {reason.description}
                    </p>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className='absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-100 transition-colors duration-300'></div>
              </div>
            ))}
          </div>

          {/* Right Side - Benefits List & CTA */}
          <div className='lg:sticky lg:top-8'>
            <div className='bg-gradient-to-br from-blue-600 to-amber-600 rounded-3xl p-8 text-white'>
              <h3 className='text-2xl font-bold mb-6 text-center'>
                ماذا ستحصل عليه:
              </h3>

              {/* Benefits Grid */}
              <div className='grid grid-cols-1 gap-3 mb-8'>
                {benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    <CheckIcon className='w-5 h-5 text-[#c19170] flex-shrink-0' />
                    <span className='text-white/90'>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats Preview */}
              <div className='grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/20'>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>98%</div>
                  <div className='text-sm text-white/80'>نسبة الرضا</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>1200+</div>
                  <div className='text-sm text-white/80'>خريج ناجح</div>
                </div>
              </div>

              {/* CTA Button */}
              <div className='text-center'>
                <a
                  href='/signup'
                  className='inline-block bg-white text-[#343b50] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'>
                  ابدأ رحلتك الآن
                </a>
                <p className='text-sm text-white/80 mt-3'>
                  🎁 حصة تجريبية مجانية لفترة محدودة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
