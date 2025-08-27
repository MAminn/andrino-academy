"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className='bg-white'>
      <div className='max-w-7xl mx-auto px-4 py-16 lg:py-24'>
        <div className='lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center'>
          {/* Text Content - Right side in RTL */}
          <div className='text-center lg:text-right lg:order-2'>
            {/* Main Headline */}
            <h1 className='text-4xl font-bold tracking-tight text-brand-blue sm:text-5xl lg:text-6xl'>
              تعلم البرمجة بذكاء — مستقبلك يبدأ من هنا
            </h1>

            {/* Subheading */}
            <p className='mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto lg:mx-0'>
              احجز حصة مجانية واكتشف مسارات تعليمية مرنة تناسب جدولك الزمني.
              تعلم مع خبراء في مجال البرمجة واحصل على شهادات معتمدة.
            </p>

            {/* Call-to-Action Buttons */}
            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
              {/* Primary CTA - Book Free Session */}
              <Link
                href='/book-session'
                className='group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-lg hover:shadow-xl'
                aria-label='احجز حصة مجانية مع خبرائنا'>
                <span>احجز حصة مجانية</span>
                <svg
                  className='mr-2 -ml-1 w-5 h-5 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:transform-none'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </Link>

              {/* Secondary CTA - WhatsApp Contact */}
              <Link
                href='https://wa.me/'
                target='_blank'
                rel='noopener noreferrer'
                className='group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-brand-blue bg-white border-2 border-brand-blue hover:bg-brand-blue hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-lg'
                aria-label='تواصل معنا عبر واتساب'>
                <svg
                  className='mr-2 w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                </svg>
                <span>تواصل واتساب</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className='mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-500'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-green-500 ml-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>حصة مجانية 100%</span>
              </div>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-green-500 ml-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>شهادات معتمدة</span>
              </div>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-green-500 ml-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>مرونة في الوقت</span>
              </div>
            </div>
          </div>

          {/* Illustration Placeholder - Left side in RTL */}
          <div className='mt-12 lg:mt-0 lg:order-1'>
            <div className='relative'>
              {/* Placeholder for future illustration */}
              <div
                className='w-full h-96 lg:h-[500px] bg-gradient-to-br from-brand-blue/5 to-brand-copper/5 rounded-3xl border-2 border-dashed border-brand-blue/20 flex items-center justify-center'
                role='img'
                aria-label='رسم توضيحي للتعلم والبرمجة'>
                <div className='text-center'>
                  <svg
                    className='w-24 h-24 text-brand-blue/30 mx-auto mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    aria-hidden='true'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                  <p className='text-brand-blue/50 font-medium'>تعلم البرمجة</p>
                  <p className='text-brand-blue/30 text-sm mt-1'>
                    رسم توضيحي قادم
                  </p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className='absolute -top-4 -right-4 w-24 h-24 bg-brand-copper/10 rounded-full blur-xl'></div>
              <div className='absolute -bottom-6 -left-6 w-32 h-32 bg-brand-blue/10 rounded-full blur-xl'></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
