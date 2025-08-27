import { ReactNode } from "react";

interface WhyUsItem {
  icon: ReactNode;
  title: string;
  text: string;
}

interface WhyUsProps {
  items?: WhyUsItem[];
}

const defaultItems: WhyUsItem[] = [
  {
    icon: (
      <svg
        className='w-8 h-8'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    ),
    title: "جودة مضمونة",
    text: "مناهج محدثة ومعتمدة تواكب أحدث التطورات التقنية",
  },
  {
    icon: (
      <svg
        className='w-8 h-8'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    ),
    title: "مرونة كاملة",
    text: "تعلم في وقتك المناسب مع حصص مباشرة ومسجلة",
  },
  {
    icon: (
      <svg
        className='w-8 h-8'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        />
      </svg>
    ),
    title: "خبراء محترفون",
    text: "مدربون ذوو خبرة عملية في أكبر الشركات التقنية",
  },
  {
    icon: (
      <svg
        className='w-8 h-8'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
        />
      </svg>
    ),
    title: "شهادات معتمدة",
    text: "احصل على شهادات معترف بها دولياً تعزز مسيرتك المهنية",
  },
  {
    icon: (
      <svg
        className='w-8 h-8'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z'
        />
      </svg>
    ),
    title: "دعم مستمر",
    text: "متابعة شخصية ودعم فني على مدار الساعة طوال فترة التعلم",
  },
  {
    icon: (
      <svg
        className='w-8 h-8'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M13 10V3L4 14h7v7l9-11h-7z'
        />
      </svg>
    ),
    title: "نتائج سريعة",
    text: "ابدأ بناء مشاريع حقيقية من الأسبوع الأول للتعلم",
  },
];

export default function WhyUs({ items = defaultItems }: WhyUsProps) {
  return (
    <section className='py-16 lg:py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-brand-blue mb-4'>
            لماذا تختارنا؟
          </h2>
          <p className='text-lg text-brand-blue/70 max-w-2xl mx-auto'>
            نجمع بين الخبرة والابتكار لنقدم لك أفضل تجربة تعليمية ممكنة
          </p>
        </div>

        {/* Why Us Container */}
        <div className='bg-white border border-gray-200 rounded-2xl p-6 lg:p-8'>
          <div
            className='grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-x-8 lg:gap-y-8'
            role='list'
            aria-label='أسباب اختيار أكاديمية أندرينو'>
            {items.map((item, index) => (
              <div
                key={index}
                className='flex items-start space-x-4 rtl:space-x-reverse'
                role='listitem'>
                {/* Icon */}
                <div className='flex-shrink-0 text-brand-copper'>
                  {item.icon}
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1 text-right'>
                  <h3 className='text-lg font-semibold text-brand-blue mb-2'>
                    {item.title}
                  </h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional CTA */}
        <div className='text-center mt-12'>
          <p className='text-brand-blue/70 mb-6'>مستعد لتجربة الفرق؟</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/book-session'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='احجز حصة مجانية لتجربة مميزاتنا'>
              جرب مجاناً
            </a>
            <a
              href='/about'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-brand-blue bg-white border-2 border-brand-blue/10 hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='تعرف على المزيد عن أكاديمية أندرينو'>
              اعرف المزيد
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
