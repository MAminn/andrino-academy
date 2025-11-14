import { ReactNode } from "react";

interface WelcomeCardProps {
  name?: string;
  description: string;
  icon: ReactNode;
}

export function WelcomeCard({ name, description, icon }: WelcomeCardProps) {
  return (
    <div className='relative overflow-hidden bg-gradient-to-br from-[#7e5b3f] via-[#c19170] to-[#7e5b3f] rounded-2xl shadow-xl p-8 text-white mb-8 border border-[#c19170]/20'>
      {/* Decorative background pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full'></div>
        <div className='absolute -left-10 -bottom-10 w-32 h-32 bg-white rounded-full'></div>
      </div>

      <div className='relative flex items-center justify-between'>
        <div className='flex-1'>
          <h2 className='text-3xl font-bold mb-3 flex items-center gap-2'>
            مرحباً {name || "بك"}!
            <span className='inline-block animate-bounce'>👋</span>
          </h2>
          <p className='text-white/90 text-lg leading-relaxed max-w-2xl'>
            {description}
          </p>
        </div>
        <div className='hidden md:block ml-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20'>
          <div className='w-20 h-20 text-white/90'>{icon}</div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent'></div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

export function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50",
    yellow:
      "from-yellow-500/10 to-yellow-600/5 text-yellow-600 border-yellow-200/50",
    green:
      "from-green-500/10 to-green-600/5 text-green-600 border-green-200/50",
    purple:
      "from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/50",
    red: "from-red-500/10 to-red-600/5 text-red-600 border-red-200/50",
    indigo:
      "from-indigo-500/10 to-indigo-600/5 text-indigo-600 border-indigo-200/50",
  };

  // Fallback to blue if color is invalid
  const selectedColor =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  const [bgGradient, textColor, borderColor] = selectedColor.split(" ");

  return (
    <div className='group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 hover:-translate-y-1'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600 mb-2'>{title}</p>
          <p className='text-3xl font-bold text-[#343b50] group-hover:scale-105 transition-transform duration-300'>
            {value}
          </p>
        </div>
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center border ${borderColor} group-hover:scale-110 transition-transform duration-300`}>
          <div className={`w-7 h-7 ${textColor}`}>{icon}</div>
        </div>
      </div>

      {/* Decorative bottom accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${bgGradient} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  children: ReactNode;
}

export function QuickActionCard({ title, children }: QuickActionCardProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden'>
      <div className='p-6 bg-gradient-to-r from-[#7e5b3f]/5 to-[#c19170]/5 border-b border-[#c19170]/10'>
        <h3 className='text-lg font-bold text-[#343b50] flex items-center gap-2'>
          <div className='w-1 h-6 bg-gradient-to-b from-[#7e5b3f] to-[#c19170] rounded-full'></div>
          {title}
        </h3>
      </div>
      <div className='p-6'>{children}</div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className='text-center py-16'>
      <div className='relative mb-6'>
        <div className='w-20 h-20 mx-auto bg-gradient-to-br from-[#7e5b3f]/10 to-[#c19170]/10 rounded-2xl flex items-center justify-center border border-[#c19170]/20'>
          <div className='w-12 h-12 text-gray-400'>{icon}</div>
        </div>
        {/* Decorative circles */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-24 h-24 bg-[#c19170]/5 rounded-full -z-10'></div>
      </div>
      <h3 className='text-xl font-bold text-[#343b50] mb-3'>{title}</h3>
      <p className='text-gray-600 mb-6 max-w-md mx-auto leading-relaxed'>
        {description}
      </p>
      {action && <div className='flex justify-center'>{action}</div>}
    </div>
  );
}
