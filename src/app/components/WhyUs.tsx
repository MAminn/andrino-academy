"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

type Reason = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const reasons: Reason[] = [
  {
    id: "curriculum",
    title: "مناهج مستمرة طوال العام",
    description:
      "نقدم للأطفال رحلة تعليمية لا تتوقف على مدار العام لبناء مهارات قوية ومتجددة.",
    icon: AcademicCapIcon,
  },
  {
    id: "homework",
    title: "واجبات منزلية بعد انتهاء المحاضرة",
    description:
      "مهام أسبوعية يتم العمل عليها وتسليمها للمدرب لضمان استيعاب ما تم شرحه في المحاضرة.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    id: "certificates",
    title: "شهادات معتمدة دوليًا",
    description:
      "يحصل الطفل على شهادة معتمدة مع كل مستوى من الأكاديمية تعكس إنجازاته.",
    icon: ShieldCheckIcon,
  },
  {
    id: "engineers",
    title: "مهندسون متخصصون للأطفال",
    description:
      "مدربون محترفون ومتخصصون في تعليم الأطفال في كل مرحلة عمرية بأساليب مبسطة.",
    icon: UserGroupIcon,
  },
  {
    id: "parent-support",
    title: "دعم مستمر لولي الأمر",
    description:
      "تواصل مباشر مع فريق الأكاديمية للإجابة عن جميع استفسارات ولي الأمر التعليمية.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    id: "small-groups",
    title: "٣ طلاب فقط في كل محاضرة",
    description:
      "نضمن أعلى استفادة من خلال عدد صغير في كل محاضرة وتركيز أكبر مع كل طفل.",
    icon: UsersIcon,
  },
  {
    id: "lesson-plan",
    title: "خطة تعليمية واضحة لكل محاضرة",
    description:
      "تسليم ولي الأمر خطة تعليمية واضحة لأهداف كل محاضرة في بداية المستوى.",
    icon: DocumentCheckIcon,
  },
];

export default function WhyUs() {
  const [activeId, setActiveId] = useState<string>("curriculum");
  const activeReason = reasons.find((r) => r.id === activeId)!;

  return (
    <section
      id='why-us'
      dir='rtl'
      className='relative bg-gradient-to-b from-white to-[#b7b7b8] py-16 md:py-24 lg:py-32'>
      <div className='max-w-7xl mx-auto px-4 md:px-8'>
        {/* Header */}
        <div className='text-center mb-20'>
          <h2 className='text-4xl md:text-5xl font-extrabold text-[#343b50]'>
            لماذا تختار أندرينو أكاديمي؟
          </h2>
          <p className='mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            نحرص في أندرينو على تقديم تجربة تعليمية متكاملة تبني مهارات طفلك
            وتؤهله لمستقبل مليء بالفرص من خلال مدربين متخصصين ومناهج حديثة.
          </p>
        </div>

        {/* 2-column layout */}
        <div className='grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start'>
          {/* LEFT: reasons list */}
          <div className='space-y-4'>
            {reasons.map((reason) => {
              const Icon = reason.icon;
              const isActive = reason.id === activeId;
              return (
                <button
                  key={reason.id}
                  type='button'
                  onClick={() => setActiveId(reason.id)}
                  className={
                    "w-full flex items-center justify-between gap-4 md:gap-6 rounded-3xl px-5 py-5 md:py-6 text-right transition-all duration-200 hover:scale-[1.02] " +
                    (isActive
                      ? "bg-white border-2 border-[#7e5b3f] shadow-lg"
                      : "bg-white/80 border border-[#e5e7eb] hover:bg-white hover:shadow-md")
                  }>
                  <div className='flex items-center gap-4'>
                    <div
                      className={
                        "flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl border-2 text-sm transition-all duration-200 " +
                        (isActive
                          ? "bg-[#7e5b3f] border-[#7e5b3f] text-white"
                          : "bg-white border-[#e5e7eb] text-[#7e5b3f]")
                      }>
                      <Icon className='w-7 h-7 md:w-8 md:h-8' />
                    </div>
                    <div className='flex flex-col text-right'>
                      <span
                        className={
                          "text-lg md:text-xl font-semibold " +
                          (isActive ? "text-[#343b50]" : "text-gray-700")
                        }>
                        {reason.title}
                      </span>
                      <span className='hidden md:inline text-sm md:text-base text-gray-500 line-clamp-1'>
                        {reason.description}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: active reason panel */}
          <motion.div
            key={activeReason.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className='relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-[#f3ebe3] border border-[#e5e7eb] border-t-[3px] border-t-[#7e5b3f] shadow-sm md:shadow-md p-10 md:p-14 lg:p-16 min-h-[420px] md:min-h-[460px] lg:min-h-[520px]'>
            <div className='absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[#7e5b3f]/10' />
            <div className='absolute -bottom-28 -right-14 w-52 h-52 rounded-full bg-[#343b50]/5' />

            <div className='relative flex flex-col gap-6'>
              <span className='inline-flex self-start rounded-full bg-white/90 border border-[#e5e7eb] px-4 py-1.5 text-sm font-medium text-gray-600'>
                ما يميزنا
              </span>

              <div className='flex items-start gap-5'>
                <div className='flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-white/90 border border-[#e5e7eb] shadow-sm'>
                  <activeReason.icon className='w-7 h-7 md:w-8 md:h-8 text-[#7e5b3f]' />
                </div>
                <div>
                  <h3 className='text-3xl md:text-4xl font-bold text-[#343b50] mb-2'>
                    {activeReason.title}
                  </h3>
                  <p className='text-lg text-gray-700 leading-relaxed'>
                    {activeReason.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
