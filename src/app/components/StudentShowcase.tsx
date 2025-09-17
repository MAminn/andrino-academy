"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

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
      "التعلم في أندرينو مختلف تماماً. كل شيء عملي ومفيد للسوق. الآن أعمل كمطورة مستقلة وأحقق دخل ممتاز من البيت.",
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
    content:
      "مجال الأمن السيبراني كان صعب جداً لكن أسلوب التدريس في أندرينو خلاني أفهم كل شيء بسهولة. الآن أعمل في شركة عالمية.",
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
      "أندرينو فتحت لي باب الذكاء الاصطناعي. من أصعب المجالات لكن مع التدريب العملي والمشاريع الحقيقية صار سهل.",
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
      "كنت أشتغل في مجال مختلف تماماً. أندرينو ساعدتني أتحول لمحللة بيانات وأحب شغلي الجديد جداً.",
    rating: 5,
    course: "علم البيانات والتحليل",
    achievement: "انتقلت من التدريس إلى تحليل البيانات",
  },
];

const achievements = [
  { number: "95%", label: "معدل الحصول على وظائف خلال 6 أشهر" },
  { number: "150%", label: "متوسط زيادة الراتب بعد التخرج" },
  { number: "4.9/5", label: "تقييم الطلاب للأكاديمية" },
  { number: "1200+", label: "قصة نجاح حقيقية" },
];

export default function StudentShowcase() {
  return (
    <section
      className='py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden'
      dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-4 py-2 rounded-full bg-[#c19170]/20 text-[#7e5b3f] text-sm font-medium mb-4'>
            🌟 قصص نجاح
          </div>
          <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
            طلابنا يحققون أحلامهم
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            اكتشف كيف غيّرت أكاديمية أندرينو حياة آلاف الطلاب وساعدتهم في تحقيق
            النجاح المهني
          </p>
        </div>

        {/* Achievement Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className='text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='text-3xl font-bold text-[#7e5b3f] mb-2'>
                {achievement.number}
              </div>
              <div className='text-sm text-gray-600'>{achievement.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className='group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2'>
              {/* Quote Icon */}
              <div className='flex justify-between items-start mb-4'>
                <ChatBubbleLeftIcon className='w-8 h-8 text-[#c19170]/30' />
                <div className='flex'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className='w-4 h-4 text-yellow-400' />
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className='text-gray-700 mb-6 leading-relaxed'>
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Student Info */}
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>
                    {testimonial.name}
                  </h4>
                  <p className='text-sm text-gray-600'>{testimonial.role}</p>
                </div>
              </div>

              {/* Course & Achievement */}
              <div className='space-y-2'>
                <div className='text-sm'>
                  <span className='text-gray-500'>الدورة: </span>
                  <span className='text-[#7e5b3f] font-medium'>
                    {testimonial.course}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='text-gray-500'>الإنجاز: </span>
                  <span className='text-[#c19170] font-medium'>
                    {testimonial.achievement}
                  </span>
                </div>
              </div>

              {/* Hover Effect */}
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white'>
          <h3 className='text-2xl font-bold mb-4'>
            هل أنت مستعد لتكون قصة النجاح القادمة؟
          </h3>
          <p className='text-[#c19170] mb-6 max-w-2xl mx-auto'>
            انضم لآلاف الطلاب الذين حققوا أحلامهم المهنية مع أكاديمية أندرينو
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/signup'
              className='bg-white text-[#343b50] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors duration-300'>
              ابدأ رحلتك الآن
            </a>
            <a
              href='/browse'
              className='border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-[#343b50] transition-colors duration-300'>
              تصفح الدورات
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
