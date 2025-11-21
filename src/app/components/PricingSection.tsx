"use client";

import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

type Plan = {
  id: string;
  arabicName: string;
  englishName: string;
  price: number;
  months: number;
  sessions: number;
  extraSessions: number;
  pricePerSession: number;
  recommended?: boolean;
};

export default function PricingSection() {
  const plans: Plan[] = [
    {
      id: "beginner",
      arabicName: "المبتدئ",
      englishName: "Beginner",
      price: 1350,
      months: 1,
      sessions: 4,
      extraSessions: 0,
      pricePerSession: 270,
    },
    {
      id: "average",
      arabicName: "المتوسط",
      englishName: "Average",
      price: 3650,
      months: 3,
      sessions: 12,
      extraSessions: 2,
      pricePerSession: 243,
    },
    {
      id: "advanced",
      arabicName: "المتقدم",
      englishName: "Advanced",
      price: 6900,
      months: 6,
      sessions: 24,
      extraSessions: 4,
      pricePerSession: 230,
    },
    {
      id: "professional",
      arabicName: "الاحترافي",
      englishName: "Professional",
      price: 13200,
      months: 12,
      sessions: 48,
      extraSessions: 6,
      pricePerSession: 220,
      recommended: true,
    },
  ];

  const getFeatures = (plan: Plan) => [
    {
      label: "خدمة العملاء",
      available: true,
    },
    {
      label: "تقييم الطالب كل حصة",
      available: plan.id !== "beginner",
    },
    {
      label: "تسليم مشروع كامل",
      available: plan.id !== "beginner",
    },
    {
      label: "إمكانية إضافة حصص",
      available: true,
      extraInfo: plan.extraSessions,
    },
  ];

  return (
    <section
      dir='rtl'
      className='bg-gradient-to-b from-white to-[#b7b7b8] py-20'>
      <div className='max-w-6xl mx-auto px-4 md:px-8'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#343b50]'>
            خطط الأسعار
          </h2>
          <p className='text-gray-600 text-center max-w-2xl mx-auto mt-3'>
            اختر الخطة المناسبة لطفلك وابدأ رحلة التعلم مع أفضل المدربين
            المتخصصين
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className='mt-12 grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {plans.map((plan, index) => {
            const features = getFeatures(plan);
            const baseCard =
              "flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-7";
            const cardClasses = plan.recommended
              ? `${baseCard} lg:-mt-4 scale-[1.02] border-[#7e5b3f] shadow-xl bg-gradient-to-b from-[#fffaf4] to-white`
              : `${baseCard} hover:-translate-y-1 hover:shadow-lg transition-all duration-200`;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cardClasses}>
                {/* Header Area */}
                <div>
                  {plan.recommended && (
                    <span className='inline-flex items-center px-3 py-1 mb-2 text-xs font-semibold rounded-full bg-[#7e5b3f] text-white'>
                      الأفضل اختيارًا
                    </span>
                  )}
                  <h3 className='text-lg font-bold text-[#343b50]'>
                    {plan.arabicName}
                  </h3>
                  <p className='text-xs uppercase tracking-wide text-gray-500'>
                    {plan.englishName}
                  </p>
                  <div className='mt-3 flex items-baseline gap-1'>
                    <span className='text-4xl font-extrabold text-[#7e5b3f] tracking-tight'>
                      {plan.price.toLocaleString("ar-EG")}
                    </span>
                    <span className='text-sm text-gray-500'>جنيه</span>
                  </div>
                  <p className='mt-1 text-sm text-gray-500'>
                    {plan.months} شهر
                    <span className='mx-1 text-gray-400'>•</span>(
                    {plan.sessions} حصة مباشرة)
                  </p>
                </div>

                {/* Features List */}
                <ul className='mt-6 space-y-3 text-sm text-gray-700 flex-1'>
                  {features.map((feature, idx) => (
                    <li key={idx} className='flex items-start gap-2'>
                      {feature.available ? (
                        feature.extraInfo !== undefined ? (
                          <CheckCircleIcon className='w-5 h-5 text-[#7e5b3f] flex-shrink-0 mt-0.5' />
                        ) : (
                          <CheckCircleIcon className='w-5 h-5 text-[#7e5b3f] flex-shrink-0 mt-0.5' />
                        )
                      ) : (
                        <XCircleIcon className='w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5' />
                      )}
                      <span
                        className={
                          feature.available ? "text-gray-700" : "text-gray-400"
                        }>
                        {feature.label}
                        {feature.extraInfo !== undefined && (
                          <span
                            className={
                              feature.extraInfo === 0
                                ? "mr-1 font-semibold text-gray-400"
                                : "mr-1 font-semibold text-[#7e5b3f]"
                            }>
                            ({feature.extraInfo} حصص)
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className='mt-6 pt-4 border-t border-gray-100 text-center'>
                  <p className='text-xs text-gray-500'>
                    سعر الحصة:
                    <span className='font-semibold text-[#343b50]'>
                      {" "}
                      {plan.pricePerSession} جنيه
                    </span>
                  </p>
                  <button
                    type='button'
                    className={
                      "mt-4 w-full rounded-2xl py-2.5 text-sm font-semibold transition-colors duration-200 " +
                      (plan.recommended
                        ? "bg-[#7e5b3f] text-white hover:bg-[#5f422e] border border-transparent"
                        : "border border-[#7e5b3f] text-[#7e5b3f] hover:bg-[#7e5b3f] hover:text-white")
                    }>
                    اختر الخطة
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
