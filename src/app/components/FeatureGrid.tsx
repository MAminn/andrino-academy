import { ReactNode } from "react";

interface FeatureItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

interface FeatureGridProps {
  items?: FeatureItem[];
}

const defaultItems: FeatureItem[] = [
  {
    icon: (
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.781 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
        />
      </svg>
    ),
    title: "مناهج عملية",
    desc: "مشاريع حقيقية تبني سيرتك الذاتية",
  },
  {
    icon: (
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
        />
      </svg>
    ),
    title: "مدربون خبراء",
    desc: "متابعة فردية وتقييم مستمر",
  },
  {
    icon: (
      <svg
        className='w-6 h-6'
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
    title: "تعلم مرن",
    desc: "حصص مباشرة ومسجلة",
  },
];

export default function FeatureGrid({
  items = defaultItems,
}: FeatureGridProps) {
  return (
    <section className='py-16 lg:py-24' aria-label='مميزات أكاديمية أندرينو'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-brand-blue mb-4'>
            لماذا تختار أكاديمية أندرينو؟
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            نقدم تجربة تعليمية متكاملة تجمع بين الجودة والمرونة والخبرة العملية
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6' role='list'>
          {items.map((item, index) => (
            <div
              key={index}
              className='bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group'
              role='listitem'>
              {/* Icon Container */}
              <div className='flex justify-center lg:justify-start mb-4'>
                <div className='flex items-center justify-center w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-full group-hover:bg-brand-blue/20 transition-colors'>
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div className='text-center lg:text-right'>
                <h3 className='text-xl font-bold text-brand-blue mb-3'>
                  {item.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Optional CTA Section */}
        <div className='text-center mt-12'>
          <p className='text-gray-600 mb-6'>جاهز لبدء رحلتك التعليمية؟</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/book-session'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='احجز حصة مجانية للتجربة'>
              احجز حصة مجانية
            </a>
            <a
              href='/plans'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-brand-blue bg-white border-2 border-brand-blue hover:bg-brand-blue hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='استكشف خطط التعلم المتاحة'>
              استكشف الخطط
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
