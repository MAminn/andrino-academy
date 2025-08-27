export default function Footer() {
  return (
    <footer className='w-full bg-brand-blue text-white py-10'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-right'>
          {/* روابط (Links) */}
          <div>
            <h3 className='text-lg font-semibold mb-4 font-arabic text-white'>
              روابط
            </h3>
            <ul className='space-y-2 font-arabic'>
              <li>
                <a
                  href='#courses'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  الدورات
                </a>
              </li>
              <li>
                <a
                  href='#about'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  من نحن
                </a>
              </li>
              <li>
                <a
                  href='#contact'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  اتصل بنا
                </a>
              </li>
              <li>
                <a
                  href='#blog'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  المدونة
                </a>
              </li>
            </ul>
          </div>

          {/* تواصل (Contact) */}
          <div>
            <h3 className='text-lg font-semibold mb-4 font-arabic text-white'>
              تواصل
            </h3>
            <ul className='space-y-2 font-arabic'>
              <li>
                <a
                  href='mailto:info@andrinoacademy.com'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  info@andrinoacademy.com
                </a>
              </li>
              <li>
                <a
                  href='tel:+966123456789'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  +966 12 345 6789
                </a>
              </li>
              <li>
                <a
                  href='https://wa.me/966123456789'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  واتساب
                </a>
              </li>
            </ul>
          </div>

          {/* حقوق (Rights/Legal) */}
          <div>
            <h3 className='text-lg font-semibold mb-4 font-arabic text-white'>
              حقوق
            </h3>
            <ul className='space-y-2 font-arabic'>
              <li>
                <a
                  href='#privacy'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a
                  href='#terms'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  الشروط والأحكام
                </a>
              </li>
              <li>
                <a
                  href='#support'
                  className='text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-brand-blue rounded transition-opacity'>
                  الدعم الفني
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Line */}
        <div className='border-t border-white/20 mt-8 pt-6 text-center'>
          <p className='text-sm font-arabic text-white'>
            © {new Date().getFullYear()} Andrino Academy — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
