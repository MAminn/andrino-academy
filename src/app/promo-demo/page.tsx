export default function PromoBannerDemo() {
  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-heading font-bold text-brand-blue mb-4'>
          عرض توضيحي لشريط العروض الترويجية
        </h1>
        <p className='text-lg font-body text-gray-600'>
          هذه الصفحة تعرض مختلف إعدادات شريط العروض الترويجية
        </p>
      </div>

      <div className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          ميزات الشريط الترويجي
        </h2>

        <div className='space-y-4 text-gray-700'>
          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <span className='text-green-500 text-xl'>✓</span>
            <div>
              <strong>موضع ثابت:</strong> يظهر في أعلى الصفحة مع z-index عالي
            </div>
          </div>

          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <span className='text-green-500 text-xl'>✓</span>
            <div>
              <strong>مؤقت العد التنازلي:</strong> يبدأ من 15 دقيقة افتراضياً
            </div>
          </div>

          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <span className='text-green-500 text-xl'>✓</span>
            <div>
              <strong>نسخ الكوبون:</strong> زر لنسخ كود الخصم إلى الحافظة
            </div>
          </div>

          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <span className='text-green-500 text-xl'>✓</span>
            <div>
              <strong>إغلاق دائم:</strong> يحفظ حالة الإغلاق في localStorage
            </div>
          </div>

          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <span className='text-green-500 text-xl'>✓</span>
            <div>
              <strong>إمكانية الوصول:</strong> دعم قارئات الشاشة وتنقل لوحة
              المفاتيح
            </div>
          </div>

          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <span className='text-green-500 text-xl'>✓</span>
            <div>
              <strong>تصميم RTL:</strong> محسّن للكتابة من اليمين إلى اليسار
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          كيفية الاستخدام
        </h2>

        <div className='bg-gray-50 rounded-brand p-4 font-mono text-sm text-gray-800 overflow-x-auto'>
          <div className='space-y-2'>
            <div>{"// الاستخدام الأساسي"}</div>
            <div>{"<PromoBanner />"}</div>
            <br />
            <div>{"// مع خصائص مخصصة"}</div>
            <div>{"<PromoBanner"}</div>
            <div>{"  initialSeconds={1800} // 30 دقيقة"}</div>
            <div>{'  coupon="SAVE30"'}</div>
            <div>{'  message="عرض خاص — استخدم الكوبون:"'}</div>
            <div>{"/>"}</div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-brand-lg shadow-brand p-6'>
        <h2 className='text-2xl font-heading font-bold text-brand-blue mb-4'>
          التحكم في الشريط الترويجي
        </h2>

        <div className='space-y-4'>
          <button
            onClick={() => {
              localStorage.removeItem("andrino:promo:dismissed");
              window.location.reload();
            }}
            className='bg-brand-brown hover:bg-brand-brown-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
            إعادة إظهار الشريط الترويجي
          </button>

          <p className='text-sm text-gray-600'>
            إذا قمت بإغلاق الشريط الترويجي، يمكنك استخدام هذا الزر لإعادة إظهاره
            مرة أخرى.
          </p>
        </div>
      </div>

      <div className='bg-brand-blue-50 border border-brand-blue-200 rounded-brand-lg p-6'>
        <h2 className='text-xl font-heading font-bold text-brand-blue mb-3'>
          ملاحظة مهمة
        </h2>
        <p className='text-brand-blue'>
          الشريط الترويجي يظهر في أعلى جميع الصفحات. إذا لم تشاهده الآن، فقد
          يكون تم إغلاقه مسبقاً. استخدم الزر أعلاه لإعادة إظهاره.
        </p>
      </div>
    </div>
  );
}
