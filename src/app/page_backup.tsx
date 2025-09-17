"use client";

import Link from "next/link";
import Image from "next/image";
import heroImg from "../../../assests/Hero.jpg";

export default function Hero() {
  return (
    <section className='bg-white relative overflow-hidden min-h-screen'>

      <div className='max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10'>
        <div className='lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center min-h-[80vh]'>
          {/* Image - Left side */}
          <div className='lg:col-span-1 flex items-center justify-center order-2 lg:order-1'>
            <div className='relative w-full max-w-md'>
              <Image
                src={heroImg}
                alt='تعلم البرمجة للأطفال'
                className='w-full h-auto rounded-2xl shadow-lg'
                placeholder='blur'
                sizes='(max-width: 768px) 100vw, 50vw'
                priority
              />
            </div>
          </div>

          {/* Text Content - Right side */}
          <div
            className='lg:col-span-1 text-right order-1 lg:order-2'
            dir='rtl'>
            {/* Badge */}
            <div className='inline-flex items-center px-4 py-2 rounded-full bg-[#343b50]/5 mb-6'>
              <span className='text-sm font-medium text-[#343b50]'>
                أكاديمية أندرينو للبرمجة
              </span>
            </div>

            {/* Main Headline */}
            <h1 className='text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6'>
              <span className='text-[#343b50] block mb-2'>
                استثمر في مهارات طفلك
              </span>
              <span className='font-black bg-gradient-to-r from-[#7e5b3f] to-[#c19170] bg-clip-text text-transparent block'>
                وخلّي مستقبله أذكى
              </span>
            </h1>

            {/* Subheading */}
            <p className='text-lg leading-relaxed text-gray-600 mb-8 max-w-lg'>
              في أندرينو، يتعلم الأطفال البرمجة بطريقة ممتعة وبسيطة، تساعدهم على
              تنمية مهارات التفكير المنطقي وحل المشكلات.
            </p>

            {/* Call-to-Action Button */}
            <div className='mb-8'>
              <Link
                href='/book-session'
                className='inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-[#7e5b3f] hover:bg-[#343b50] transition-colors duration-300 shadow-lg hover:shadow-xl'>
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
              </Link>
            </div>

            {/* Simple Statistics */}
            <div className='flex items-center gap-8 text-sm text-gray-500'>
              <div>
                <span className='text-2xl font-bold text-[#7e5b3f] block'>
                  500+
                </span>
                <span>طالب متخرج</span>
              </div>
              <div>
                <span className='text-2xl font-bold text-[#7e5b3f] block'>
                  15+
                </span>
                <span>مدرب خبير</span>
              </div>
              <div>
                <span className='text-2xl font-bold text-[#7e5b3f] block'>
                  95%
                </span>
                <span>نسبة الرضا</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
