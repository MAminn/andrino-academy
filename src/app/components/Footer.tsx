"use client";

import Link from "next/link";
import {
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    academy: {
      title: "الأكاديمية",
      links: [
        { name: "عن أندرينو", href: "/about" },
        { name: "فريق العمل", href: "/team" },
        { name: "الرؤية والرسالة", href: "/vision" },
        { name: "شركاؤنا", href: "/partners" },
      ],
    },
    courses: {
      title: "الدورات",
      links: [
        { name: "تصفح الدورات", href: "/browse" },
        { name: "البرمجة الأساسية", href: "/browse?category=programming" },
        { name: "تطوير الويب", href: "/browse?category=web" },
        { name: "تطبيقات الجوال", href: "/browse?category=mobile" },
      ],
    },
    support: {
      title: "الدعم",
      links: [
        { name: "مركز المساعدة", href: "/help" },
        { name: "اتصل بنا", href: "/contact" },
        { name: "الأسئلة الشائعة", href: "/faq" },
        { name: "بلغ عن مشكلة", href: "/report" },
      ],
    },
    legal: {
      title: "القانوني",
      links: [
        { name: "الشروط والأحكام", href: "/terms" },
        { name: "سياسة الخصوصية", href: "/privacy" },
        { name: "سياسة الاسترداد", href: "/refund" },
        { name: "سياسة الاستخدام", href: "/usage" },
      ],
    },
  };

  return (
    <footer className='bg-[#343b50] text-white'>
      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
          {/* Academy Info */}
          <div className='lg:col-span-2'>
            <div className='flex items-center space-x-3 space-x-reverse mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-[#7e5b3f] to-[#c19170] rounded-lg flex items-center justify-center'>
                <AcademicCapIcon className='w-6 h-6 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold'>أكاديمية أندرينو</h3>
                <p className='text-sm text-[#c19170]'>Andrino Academy</p>
              </div>
            </div>
            <p className='text-gray-300 mb-6 leading-relaxed'>
              نحن أكاديمية متخصصة في تعليم البرمجة والتقنية للأطفال والشباب.
              هدفنا إعداد جيل قادر على مواكبة التطور التقني والمساهمة في بناء
              المستقبل الرقمي.
            </p>

            {/* Contact Info */}
            <div className='space-y-3'>
              <div className='flex items-center space-x-3 space-x-reverse text-sm'>
                <EnvelopeIcon className='w-5 h-5 text-[#c19170]' />
                <span>info@andrino-academy.com</span>
              </div>
              <div className='flex items-center space-x-3 space-x-reverse text-sm'>
                <PhoneIcon className='w-5 h-5 text-[#c19170]' />
                <span>+966 11 234 5678</span>
              </div>
              <div className='flex items-center space-x-3 space-x-reverse text-sm'>
                <MapPinIcon className='w-5 h-5 text-[#c19170]' />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className='text-lg font-semibold mb-4 text-[#c19170]'>
                {section.title}
              </h4>
              <ul className='space-y-2'>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='text-gray-300 hover:text-white transition-colors text-sm'>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className='border-t border-gray-600'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='text-sm text-gray-300 mb-4 md:mb-0'>
              © {currentYear} أكاديمية أندرينو. جميع الحقوق محفوظة.
            </div>
            <div className='flex items-center space-x-6 space-x-reverse text-sm text-gray-300'>
              <span>صُنع بـ ❤️ في المملكة العربية السعودية</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
