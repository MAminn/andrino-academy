"use client";

import Image from "next/image";
import Link from "next/link";
import LogoImage from "@/../assests/copyAll Logo's Colors-03.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full bg-gradient-to-b from-[#0d0f13] to-[#0b0d11]' dir='rtl'>
      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20'>
          {/* Left Column: Course List (Right-aligned in RTL) */}
          <div className='flex flex-col items-center md:items-end'>
            <h3
              className='text-2xl md:text-[1.5rem] font-bold text-[#e7e9ee] mb-8 text-center md:text-right'
              style={{ letterSpacing: '-0.5px' }}>
              التدريس عبر الإنترنت
            </h3>
            <ul className='space-y-4 w-full max-w-sm'>
              <li>
                <button className='course-item flex items-center justify-end gap-3 w-full text-[#e7e9ee] text-base font-medium transition-all duration-200 hover:text-white group'>
                  <span>الذكاء الاصطناعي</span>
                  <div
                    className='course-bullet flex-shrink-0 rounded-full border border-[#c9a265] transition-all duration-200'
                    style={{
                      width: '18px',
                      height: '18px',
                    }}></div>
                </button>
              </li>
              <li>
                <button className='course-item flex items-center justify-end gap-3 w-full text-[#e7e9ee] text-base font-medium transition-all duration-200 hover:text-white group'>
                  <span>الواقع الافتراضي</span>
                  <div
                    className='course-bullet flex-shrink-0 rounded-full border border-[#c9a265] transition-all duration-200'
                    style={{
                      width: '18px',
                      height: '18px',
                    }}></div>
                </button>
              </li>
              <li>
                <button className='course-item flex items-center justify-end gap-3 w-full text-[#e7e9ee] text-base font-medium transition-all duration-200 hover:text-white group'>
                  <span>تطوير الشبكة</span>
                  <div
                    className='course-bullet flex-shrink-0 rounded-full border border-[#c9a265] transition-all duration-200'
                    style={{
                      width: '18px',
                      height: '18px',
                    }}></div>
                </button>
              </li>
              <li>
                <button className='course-item flex items-center justify-end gap-3 w-full text-[#e7e9ee] text-base font-medium transition-all duration-200 hover:text-white group'>
                  <span>تطوير تطبيقات أندرويد</span>
                  <div
                    className='course-bullet flex-shrink-0 rounded-full border border-[#c9a265] transition-all duration-200'
                    style={{
                      width: '18px',
                      height: '18px',
                    }}></div>
                </button>
              </li>
              <li>
                <button className='course-item flex items-center justify-end gap-3 w-full text-[#e7e9ee] text-base font-medium transition-all duration-200 hover:text-white group'>
                  <span>البرمجة للأطفال</span>
                  <div
                    className='course-bullet flex-shrink-0 rounded-full border border-[#c9a265] transition-all duration-200'
                    style={{
                      width: '18px',
                      height: '18px',
                    }}></div>
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: Logo + Tagline + Social Icons (Center-aligned) */}
          <div className='flex flex-col items-center gap-6 md:gap-8'>
            {/* Logo */}
            <Image
              src={LogoImage}
              alt='Andrino Academy Logo'
              width={180}
              height={54}
              className='w-[180px] h-auto'
              priority
            />

            {/* Tagline */}
            <h2
              className='text-xl md:text-[1.5rem] font-bold text-[#e7e9ee] text-center mt-2 md:mt-4'
              style={{ letterSpacing: '-0.5px' }}>
              صُنّاع قادة التكنولوجيا القادمين
            </h2>

            {/* Social Icons Row */}
            <div className='flex items-center gap-3 mt-2 md:mt-4'>
              <Link
                href='#'
                className='social-icon inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#13161b] text-white transition-all duration-200 hover:scale-110'>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
                </svg>
              </Link>
              <Link
                href='#'
                className='social-icon inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#13161b] text-white transition-all duration-200 hover:scale-110'>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z' />
                </svg>
              </Link>
              <Link
                href='#'
                className='social-icon inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#13161b] text-white transition-all duration-200 hover:scale-110'>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
              </Link>
              <Link
                href='https://wa.me/2001066520225'
                target='_blank'
                rel='noopener noreferrer'
                className='social-icon inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#13161b] text-white transition-all duration-200 hover:scale-110'>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className='w-full bg-[#0a0c0f] py-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-[#e7e9ee]/70'>
            <p className='text-center md:text-right'>
              © {currentYear} أكاديمية أندرينو، جميع الحقوق محفوظة.
            </p>
            <div className='flex items-center gap-4 text-center md:text-left'>
              <Link
                href='#'
                className='hover:text-[#c9a265] transition-colors duration-200'>
                سياسة الخصوصية
              </Link>
              <Link
                href='#'
                className='hover:text-[#c9a265] transition-colors duration-200'>
                البنود والشروط
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .social-icon:hover {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }
        .course-item:hover .course-bullet {
          transform: scale(1.15);
          border-color: #e5c688;
        }
      `}</style>
    </footer>
  );
}
