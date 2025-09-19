"use client";

import Link from "next/link";

import Image from "next/image";
import HImage from "@/../assests/w f.png";

export default function Hero() {
  return (
    <section className='bg-gradient-to-b from-white to-[#b7b7b8] relative overflow-hidden text-center lg:text-right'>
      <div className='max-w-7xl mx-auto px-6 py-8 lg:py-24 relative z-10'>
        <div className='flex justify-between items-center gap-8 lg:flex-row flex-col'>
          {/* Text Content - Right side */}
          <div className='text-center lg:text-right' dir='rtl'>
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
              تنمية مهارات التفكير المنطقي، وحل المشكلات، والإبداع. جميع الدروس
              مصممة خصيصًا لتناسب أعمارهم وتضمن لهم تجربة تعليمية مليئة بالمرح
              والفائدة.
            </p>

            {/* Call-to-Action Button */}
            <div className='mb-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
              <button
                onClick={() => {
                  const element = document.getElementById("features");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
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
              </button>

              <Link
                href='https://wa.me/966123456789'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-[#343b50] bg-white border-2 border-[#343b50] hover:bg-[#343b50] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl'>
                <span>تواصل واتساب</span>
                <svg
                  className='mr-3 w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                </svg>
              </Link>
            </div>

            {/* Simple Statistics */}
            <div className='flex items-center gap-8 text-sm text-gray-500 justify-center lg:justify-start'>
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

          {/* Image - Left side */}
          <div className=' flex items-center justify-center '>
            <div className='relative w-full max-w-md'>
              <Image
                src={HImage}
                alt='تعلم البرمجة للأطفال'
                className='w-full h-auto rounded-4xl bg-cover'
                placeholder='blur'
                sizes='(max-width: 768px) 100vw, 50vw'
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
