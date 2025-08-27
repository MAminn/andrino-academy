export default function RTLDemo() {
  return (
    <div className='p-8 space-y-8 max-w-4xl mx-auto'>
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-heading font-bold text-brand-blue mb-4'>
          عرض توضيحي لدعم RTL
        </h1>
        <p className='text-lg font-body text-gray-600'>
          هذه الصفحة تعرض جميع ميزات الدعم الكامل للغة العربية في أكاديمية
          أندرينو
        </p>
      </div>

      {/* Typography Demo */}
      <section className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          عرض الخطوط والطباعة
        </h2>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold mb-2'>العناوين الرئيسية:</h3>
            <h1 className='text-3xl font-heading font-bold text-brand-blue'>
              عنوان من المستوى الأول
            </h1>
            <h2 className='text-2xl font-heading font-bold text-brand-brown'>
              عنوان من المستوى الثاني
            </h2>
            <h3 className='text-xl font-heading font-semibold text-brand-copper'>
              عنوان من المستوى الثالث
            </h3>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-2'>النص الأساسي:</h3>
            <p className='font-body text-gray-700 leading-relaxed'>
              هذا نص تجريبي باللغة العربية يوضح كيفية ظهور النصوص في أكاديمية
              أندرينو. النص مُحسّن للقراءة باللغة العربية مع دعم كامل لاتجاه
              الكتابة من اليمين إلى اليسار. يتم استخدام خطوط عربية احترافية
              لضمان أفضل تجربة قراءة ممكنة.
            </p>
          </div>
        </div>
      </section>

      {/* Layout Demo */}
      <section className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          عرض التخطيط والمحاذاة
        </h2>

        {/* Flex Layout RTL */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-3'>
            تخطيط Flexbox بالاتجاه العربي:
          </h3>
          <div className='flex space-x-4 rtl:space-x-reverse'>
            <div className='bg-brand-blue text-white p-4 rounded-brand flex-1 text-center'>
              العنصر الأول
            </div>
            <div className='bg-brand-brown text-white p-4 rounded-brand flex-1 text-center'>
              العنصر الثاني
            </div>
            <div className='bg-brand-copper text-white p-4 rounded-brand flex-1 text-center'>
              العنصر الثالث
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div>
          <h3 className='text-lg font-semibold mb-3'>تخطيط Grid:</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='bg-brand-blue-100 p-4 rounded-brand text-center'>
              <h4 className='font-semibold text-brand-blue'>بطاقة 1</h4>
              <p className='text-sm text-gray-600 mt-2'>محتوى البطاقة الأولى</p>
            </div>
            <div className='bg-brand-brown-100 p-4 rounded-brand text-center'>
              <h4 className='font-semibold text-brand-brown'>بطاقة 2</h4>
              <p className='text-sm text-gray-600 mt-2'>
                محتوى البطاقة الثانية
              </p>
            </div>
            <div className='bg-brand-copper-100 p-4 rounded-brand text-center'>
              <h4 className='font-semibold text-brand-copper'>بطاقة 3</h4>
              <p className='text-sm text-gray-600 mt-2'>
                محتوى البطاقة الثالثة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          العناصر التفاعلية
        </h2>

        <div className='space-y-4'>
          {/* Buttons */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>الأزرار:</h3>
            <div className='flex space-x-4 rtl:space-x-reverse'>
              <button className='bg-brand-blue hover:bg-brand-blue-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
                زر أساسي
              </button>
              <button className='bg-brand-brown hover:bg-brand-brown-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
                زر ثانوي
              </button>
              <button className='bg-brand-copper hover:bg-brand-copper-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
                زر مميز
              </button>
            </div>
          </div>

          {/* Form Elements */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>عناصر النموذج:</h3>
            <div className='space-y-3 max-w-md'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  الاسم الكامل
                </label>
                <input
                  type='text'
                  placeholder='أدخل اسمك الكامل'
                  className='w-full px-3 py-2 border border-gray-300 rounded-brand focus:outline-none focus:ring-2 focus:ring-brand-blue text-right'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  البريد الإلكتروني
                </label>
                <input
                  type='email'
                  placeholder='example@domain.com'
                  className='w-full px-3 py-2 border border-gray-300 rounded-brand focus:outline-none focus:ring-2 focus:ring-brand-blue text-right'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Demo */}
      <section className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          ميزات إمكانية الوصول
        </h2>

        <div className='space-y-4'>
          <div className='p-4 bg-green-50 border border-green-200 rounded-brand'>
            <h3 className='text-lg font-semibold text-green-800 mb-2'>
              ✓ دعم قارئات الشاشة
            </h3>
            <p className='text-green-700'>
              جميع العناصر مُحسّنة لقارئات الشاشة مع دعم lang=&quot;ar&quot;
            </p>
          </div>

          <div className='p-4 bg-blue-50 border border-blue-200 rounded-brand'>
            <h3 className='text-lg font-semibold text-blue-800 mb-2'>
              ✓ تباين عالي
            </h3>
            <p className='text-blue-700'>
              ألوان بتباين عالي تلبي معايير WCAG 2.1 AA
            </p>
          </div>

          <div className='p-4 bg-purple-50 border border-purple-200 rounded-brand'>
            <h3 className='text-lg font-semibold text-purple-800 mb-2'>
              ✓ تركيز واضح
            </h3>
            <p className='text-purple-700'>
              إطارات تركيز واضحة لجميع العناصر التفاعلية
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
