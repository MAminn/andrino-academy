import { ReactNode } from "react";

interface WelcomeCardProps {
  name?: string;
  description: string;
  icon: ReactNode;
}

export function WelcomeCard({ name, description, icon }: WelcomeCardProps) {
  return (
    <div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white mb-8'>
      <div className='flex items-center'>
        <div className='flex-1'>
          <h2 className='text-2xl font-bold mb-2'>مرحباً {name || "بك"}! 👋</h2>
          <p className='text-blue-100'>{description}</p>
        </div>
        <div className='hidden md:block'>{icon}</div>
      </div>
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
    blue: "text-blue-600",
    yellow: "text-yellow-500",
    green: "text-green-600",
    purple: "text-purple-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
  };

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex items-center'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
        </div>
        <div
          className={`w-8 h-8 ${
            colorClasses[color as keyof typeof colorClasses]
          }`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  children: ReactNode;
}

export function QuickActionCard({ title, children }: QuickActionCardProps) {
  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='p-6 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
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
    <div className='text-center py-12'>
      <div className='w-16 h-16 mx-auto text-gray-400 mb-4'>{icon}</div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600 mb-4'>{description}</p>
      {action && action}
    </div>
  );
}
