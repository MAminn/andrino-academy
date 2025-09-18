"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
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
                <div className='w-12 h-12 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-full flex items-center justify-center text-white font-bold'>
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
              <div className='absolute inset-0 bg-gradient-to-br from-[#7e5b3f]/5 to-[#c19170]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center bg-[#343b50] rounded-2xl p-8 text-white'>
          <h3 className='text-2xl font-bold mb-4'>
            هل أنت مستعد لتكون قصة النجاح القادمة؟
          </h3>
          <p className='text-[#a6a6a6] mb-6 max-w-2xl mx-auto'>
            انضم لآلاف الطلاب الذين حققوا أحلامهم المهنية مع أكاديمية أندرينو
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => {
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className='inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-[#343b50] bg-white hover:bg-[#7e5b3f] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl'>
              <span>احجز حصة مجانية</span>
              <svg
                className='mr-3 w-5 h-5'
                fill='currentColor'
                viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            <Link
              href='https://wa.me/966123456789'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-[#343b50] bg-white border-2 border-[#343b50] hover:bg-[#7e5b3f] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl'>
              <span>تواصل واتساب</span>
              <svg
                className='mr-3 w-5 h-5'
                fill='currentColor'
                viewBox='0 0 24 24'>
                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
