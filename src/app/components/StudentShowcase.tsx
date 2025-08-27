"use client";

import Image from "next/image";

interface Student {
  id: string;
  name: string;
  grade: string;
  country: string;
  photoUrl: string;
}

interface StudentShowcaseProps {
  students?: Student[];
}

const defaultStudents: Student[] = [
  {
    id: "1",
    name: "أحمد محمد",
    grade: "A+",
    country: "السعودية",
    photoUrl: "https://picsum.photos/seed/ahmad/300/300",
  },
  {
    id: "2",
    name: "فاطمة علي",
    grade: "A",
    country: "الإمارات",
    photoUrl: "https://picsum.photos/seed/fatima/300/300",
  },
  {
    id: "3",
    name: "محمد عبدالله",
    grade: "A+",
    country: "مصر",
    photoUrl: "https://picsum.photos/seed/mohammed/300/300",
  },
  {
    id: "4",
    name: "نور الهدى",
    grade: "A",
    country: "الأردن",
    photoUrl: "https://picsum.photos/seed/nour/300/300",
  },
  {
    id: "5",
    name: "عبدالرحمن سالم",
    grade: "A+",
    country: "الكويت",
    photoUrl: "https://picsum.photos/seed/abdulrahman/300/300",
  },
  {
    id: "6",
    name: "زينب أحمد",
    grade: "A",
    country: "لبنان",
    photoUrl: "https://picsum.photos/seed/zeinab/300/300",
  },
];

export default function StudentShowcase({
  students = defaultStudents,
}: StudentShowcaseProps) {
  return (
    <section className='py-16 lg:py-24 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-brand-blue mb-4'>طلابنا</h2>
          <p className='text-lg text-brand-blue/70 max-w-2xl mx-auto'>
            تعرف على بعض طلابنا المتفوقين من مختلف أنحاء العالم العربي
          </p>
        </div>

        {/* Students Grid */}
        <div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          role='list'
          aria-label='قائمة الطلاب المتفوقين'>
          {students.map((student) => (
            <div
              key={student.id}
              className='bg-white border border-brand-blue/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 focus:shadow-md focus:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 group cursor-pointer'
              role='listitem'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  // Optional: Add navigation or action here
                }
              }}>
              {/* Student Photo */}
              <div className='relative aspect-video overflow-hidden'>
                <Image
                  src={student.photoUrl}
                  alt={`صورة الطالب ${student.name}`}
                  width={300}
                  height={200}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />

                {/* Overlay gradient for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </div>

              {/* Student Info */}
              <div className='p-6 text-right'>
                <h3 className='text-xl font-semibold text-brand-blue mb-2 group-hover:text-brand-blue-700 transition-colors'>
                  {student.name}
                </h3>

                <div className='space-y-1'>
                  <div className='flex items-center justify-end space-x-2 rtl:space-x-reverse'>
                    <span className='text-brand-blue/70 text-sm'>التقدير:</span>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                      {student.grade}
                    </span>
                  </div>

                  <div className='flex items-center justify-end space-x-2 rtl:space-x-reverse'>
                    <span className='text-brand-blue/70 text-sm'>البلد:</span>
                    <span className='text-gray-700 text-sm font-medium'>
                      {student.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-Action */}
        <div className='text-center mt-12'>
          <p className='text-brand-blue/70 mb-6'>
            انضم إلى مجتمعنا من الطلاب المتفوقين
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/signup'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='إنشاء حساب جديد للانضمام إلى طلابنا'>
              ابدأ رحلتك التعليمية
            </a>
            <a
              href='/students'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-brand-blue bg-white border-2 border-brand-blue/10 hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='مشاهدة المزيد من قصص نجاح الطلاب'>
              قصص نجاح أخرى
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
