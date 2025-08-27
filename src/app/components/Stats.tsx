"use client";

import { useState, useEffect, useRef } from "react";

interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  ariaLabel: string;
}

interface StatsProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  {
    id: "graduates",
    value: 130,
    suffix: "K+",
    label: "الخريجون",
    ariaLabel: "عدد الخريجين: 130 ألف",
  },
  {
    id: "satisfaction",
    value: 98,
    suffix: "%",
    label: "الرضا",
    ariaLabel: "معدل الرضا: 98 بالمائة",
  },
  {
    id: "instructors",
    value: 50,
    suffix: "+",
    label: "المدربون",
    ariaLabel: "عدد المدربين: أكثر من 50",
  },
  {
    id: "courses",
    value: 200,
    suffix: "+",
    label: "الدورات",
    ariaLabel: "عدد الدورات: أكثر من 200",
  },
];

// Custom hook for count-up animation
function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Jump directly to final value for users who prefer reduced motion
      setCount(target);
      return;
    }

    // Animate count-up for users who don't prefer reduced motion
    const startTime = Date.now();
    const startValue = 0;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (target - startValue) * easeOutQuart
      );

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, target, duration]);

  return { count, elementRef };
}

function StatItem({ stat }: { stat: Stat }) {
  const { count, elementRef } = useCountUp(stat.value);

  return (
    <div ref={elementRef} className='text-center' aria-label={stat.ariaLabel}>
      <div className='mb-2'>
        <span className='text-4xl md:text-5xl font-bold text-brand-blue'>
          {count}
          <span className='text-brand-blue'>{stat.suffix}</span>
        </span>
      </div>
      <p className='text-lg font-medium text-brand-brown'>{stat.label}</p>
    </div>
  );
}

export default function Stats({ stats = defaultStats }: StatsProps) {
  return (
    <section className='py-16 lg:py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-brand-blue mb-4'>
            إنجازاتنا بالأرقام
          </h2>
          <p className='text-lg text-brand-blue/70 max-w-2xl mx-auto'>
            نفتخر بالثقة التي وضعها طلابنا فينا وبالنجاحات التي حققناها معاً
          </p>
        </div>

        {/* Stats Container */}
        <div className='bg-brand-blue/3 rounded-3xl p-8 lg:p-12'>
          <div
            className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'
            role='list'
            aria-label='إحصائيات أكاديمية أندرينو'>
            {stats.map((stat) => (
              <div key={stat.id} role='listitem'>
                <StatItem stat={stat} />
              </div>
            ))}
          </div>
        </div>

        {/* Optional Call-to-Action */}
        <div className='text-center mt-12'>
          <p className='text-brand-blue/70 mb-6'>كن جزءاً من قصة نجاحنا</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/book-session'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-white bg-brand-copper hover:bg-brand-copper-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='احجز حصة مجانية وانضم لخريجينا'>
              احجز حصتك المجانية
            </a>
            <a
              href='/testimonials'
              className='inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl text-brand-blue bg-white border-2 border-brand-blue/10 hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:transform-none shadow-sm hover:shadow-md'
              aria-label='اقرأ آراء الطلاب والخريجين'>
              آراء الطلاب
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
