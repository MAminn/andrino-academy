"use client";

import { Check, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingSection() {
  const plans = [
    {
      nameAr: "المبتدئ",
      nameEn: "BEGINNER",
      price: "1,350",
      duration: "1 شهر",
      sessions: "4 حصص مباشرة",
      features: ["خدمة العملاء", "تقييم الطالب كل حصة", "تسليم مشروع كامل"],
      sessionPrice: "270",
      highlight: false,
    },
    {
      nameAr: "المتوسط",
      nameEn: "AVERAGE",
      price: "3,650",
      duration: "3 أشهر",
      sessions: "12 حصة مباشرة",
      features: [
        "خدمة العملاء",
        "تقييم الطالب كل حصة",
        "تسليم مشروع كامل",
        "إمكانية إضافة حصص (2 حصص)",
      ],
      sessionPrice: "243",
      highlight: false,
    },
    {
      nameAr: "المتقدم",
      nameEn: "ADVANCED",
      price: "6,900",
      duration: "6 أشهر",
      sessions: "24 حصة مباشرة",
      features: [
        "خدمة العملاء",
        "تقييم الطالب كل حصة",
        "تسليم مشروع كامل",
        "إمكانية إضافة حصص (4 حصص)",
      ],
      sessionPrice: "230",
      highlight: false,
    },
    {
      nameAr: "الاحترافي",
      nameEn: "PROFESSIONAL",
      price: "13,200",
      duration: "12 شهر",
      sessions: "48 حصة مباشرة",
      features: [
        "خدمة العملاء",
        "تقييم الطالب كل حصة",
        "تسليم مشروع كامل",
        "إمكانية إضافة حصص (6 حصص)",
      ],
      sessionPrice: "220",
      highlight: true,
      badge: "الأفضل قيمة",
    },
  ];

  return (
    <section dir='rtl' className='w-full py-20 md:py-28 px-5 bg-[#F9F9F9]'>
      {/* Section Header */}
      <div className='max-w-[1300px] mx-auto text-center mb-12 md:mb-16'>
        <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4'>
          خطط الأسعار
        </h2>
        <p className='text-base md:text-lg text-[#6D6D6D] max-w-2xl mx-auto leading-relaxed'>
          اختر الخطة المناسبة لطفلك وابدأ رحلته التعليمية مع أفضل المدربين
          المتخصصين
        </p>
      </div>

      {/* Pricing Cards */}
      <div className='max-w-[1300px] mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-[18px] p-6 md:p-7 flex flex-col
                ${
                  plan.highlight
                    ? "shadow-[0_4px_24px_rgba(107,78,61,0.12)] lg:scale-[1.03] border-2 border-[#6B4E3D]"
                    : "shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100"
                }
                transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]`}>
              {/* Best Value Badge */}
              {plan.highlight && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6B4E3D] to-[#8B6E5D] text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md'>
                  <Crown size={14} strokeWidth={2} />
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <div className='text-center mb-6'>
                <h3 className='text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1'>
                  {plan.nameAr}
                </h3>
                <p className='text-[10px] md:text-xs text-[#6D6D6D] uppercase tracking-wider font-medium'>
                  {plan.nameEn}
                </p>
              </div>

              {/* Price */}
              <div className='text-center mb-6'>
                <div className='flex items-baseline justify-center gap-1.5 mb-2'>
                  <span className='text-4xl md:text-5xl font-bold text-[#6B4E3D] tracking-tight'>
                    {plan.price}
                  </span>
                  <span className='text-base md:text-lg text-[#6D6D6D] font-medium'>
                    جنيه
                  </span>
                </div>
                <p className='text-sm text-[#6D6D6D]'>
                  {plan.duration} — {plan.sessions}
                </p>
              </div>

              {/* Divider */}
              <div className='w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6' />

              {/* Features List */}
              <div className='flex-1 space-y-3.5 mb-6'>
                {plan.features.map((feature, i) => (
                  <div key={i} className='flex items-start gap-3'>
                    <Check
                      size={18}
                      strokeWidth={2.5}
                      className='text-[#6B4E3D] flex-shrink-0 mt-0.5'
                    />
                    <span className='text-sm text-[#1A1A1A] leading-relaxed'>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Divider */}
              <div className='w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5' />

              {/* Session Price */}
              <p className='text-center text-sm text-[#6D6D6D] mb-5'>
                سعر الحصة:{" "}
                <span className='font-semibold text-[#1A1A1A]'>
                  {plan.sessionPrice}
                </span>{" "}
                جنيه
              </p>

              {/* CTA Button */}
              <Link href='/auth/signup' className='w-full'>
                <button className='w-full py-3.5 rounded-[14px] font-semibold text-[15px] bg-[#6B4E3D] text-white hover:bg-[#5A3F2F] transition-colors duration-200 shadow-sm hover:shadow-md'>
                  اختر الخطة
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
