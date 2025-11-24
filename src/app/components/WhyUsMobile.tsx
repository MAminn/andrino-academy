"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DocumentCheckIcon,
  SparklesIcon,
  ChevronLeftIcon,
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

export default function WhyUsMobile() {
  const [activeId, setActiveId] = useState<string>("curriculum");
  const activeReason = reasons.find((r) => r.id === activeId)!;

  return (
    <section dir='rtl' className='relative bg-white pt-16 pb-20 px-4 lg:hidden'>
      {/* Content Container */}
      <div className='max-w-md mx-auto'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='text-center mb-6'>
          <h2 className='text-[22px] font-bold text-gray-800 leading-tight'>
            لماذا تختار أندرينو أكاديمي؟
          </h2>
          <p className='text-[14.5px] text-gray-600 max-w-[85%] mx-auto leading-[1.8] mt-2 mb-6'>
            نحرص في أندرينو على تقديم تجربة تعليمية متكاملة تبني مهارات طفلك
            وتؤهله لمستقبل مليء بالفرص من خلال مدربين متخصصين ومناهج حديثة.
          </p>
        </motion.div>

        {/* Interactive Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className='space-y-3'>
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            const isActive = reason.id === activeId;
            return (
              <motion.button
                key={reason.id}
                onClick={() => setActiveId(reason.id)}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                viewport={{ once: true }}
                className={`w-full rounded-xl border p-4 flex items-center gap-3 text-right transition-all duration-200 min-h-[58px] cursor-pointer active:scale-95 ${
                  isActive
                    ? "border-[#7E5A3F] shadow-md bg-[#FDF9F4] border-r-4 border-r-[#7E5A3F]"
                    : "border-gray-200 shadow-sm bg-white hover:border-gray-300"
                }`}>
                {/* Chevron Icon - Far Left */}
                <ChevronLeftIcon
                  className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[#7E5A3F]" : "text-gray-300"
                  }`}
                />

                {/* Title */}
                <span
                  className={`text-[15px] font-medium flex-1 transition-colors duration-200 ${
                    isActive ? "text-[#7E5A3F]" : "text-gray-800"
                  }`}>
                  {reason.title}
                </span>

                {/* Icon - RIGHT side for RTL */}
                <div
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[#7E5A3F]" : "text-gray-400"
                  }`}>
                  <Icon className='w-[22px] h-[22px] stroke-[1.5]' />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Detail Card - Below List */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeReason.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='mt-4'>
            {/* Label Above Card */}
            <p className='text-[12px] text-gray-500 mb-2 mr-1'>
              تفاصيل الميزة:
            </p>

            {/* Card */}
            <div className='relative rounded-2xl bg-white border border-gray-200 shadow-md p-6 overflow-hidden'>
              {/* Subtle Abstract Background */}
              <div className='absolute top-0 right-0 w-32 h-32 bg-[#7E5A3F]/5 rounded-full blur-2xl' />
              <div className='absolute bottom-0 left-0 w-24 h-24 bg-[#343b50]/5 rounded-full blur-xl' />

              {/* Badge */}
              <div className='absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[#F5F3EF] text-[#917357] px-3 py-1 text-[11px] font-medium'>
                <SparklesIcon className='w-3 h-3' />
                <span>ما يميزنا</span>
              </div>

              {/* Content */}
              <div className='relative pt-2'>
                <h3 className='text-[17px] font-semibold text-gray-800 mb-1'>
                  {activeReason.title}
                </h3>
                <p className='text-[14.5px] text-gray-600 leading-[1.8]'>
                  {activeReason.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
