"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import {
  Crown,
  TrendingUp,
  Target,
  BarChart3,
  Globe,
  Settings,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function CEODashboard() {
  const { data: session } = useSession();

  const kpiData = [
    {
      title: "إجمالي الإيرادات",
      value: "2.4M ر.س",
      change: "+22%",
      trend: "up",
      period: "هذا العام",
    },
    {
      title: "عدد الطلاب",
      value: "3,847",
      change: "+18%",
      trend: "up",
      period: "هذا الشهر",
    },
    {
      title: "معدل الاحتفاظ",
      value: "89%",
      change: "+5%",
      trend: "up",
      period: "هذا الربع",
    },
    {
      title: "الدورات النشطة",
      value: "127",
      change: "+12%",
      trend: "up",
      period: "هذا الشهر",
    },
  ];

  const departmentPerformance = [
    {
      name: "البرمجة الأساسية",
      revenue: 850000,
      students: 1245,
      growth: 15,
      satisfaction: 92,
    },
    {
      name: "تطوير الويب",
      revenue: 720000,
      students: 987,
      growth: 22,
      satisfaction: 94,
    },
    {
      name: "قواعد البيانات",
      revenue: 480000,
      students: 654,
      growth: 8,
      satisfaction: 88,
    },
    {
      name: "الذكاء الاصطناعي",
      revenue: 390000,
      students: 432,
      growth: 45,
      satisfaction: 96,
    },
  ];

  const strategicGoals = [
    {
      title: "زيادة عدد الطلاب بنسبة 30%",
      progress: 78,
      target: "ديسمبر 2025",
      status: "في المسار الصحيح",
    },
    {
      title: "إطلاق 10 دورات جديدة",
      progress: 60,
      target: "نهاية العام",
      status: "في المسار الصحيح",
    },
    {
      title: "تحقيق معدل رضا 95%",
      progress: 92,
      target: "مستمر",
      status: "قريب من الهدف",
    },
    {
      title: "توسيع الفريق إلى 50 موظف",
      progress: 45,
      target: "2026",
      status: "بحاجة متابعة",
    },
  ];

  const marketInsights = [
    {
      metric: "حصة السوق",
      value: "12.5%",
      change: "+2.3%",
      period: "هذا العام",
    },
    {
      metric: "المنافسين الجدد",
      value: "3",
      change: "+1",
      period: "هذا الربع",
    },
    {
      metric: "معدل النمو السوقي",
      value: "18%",
      change: "+3%",
      period: "سنوياً",
    },
  ];

  return (
    <DashboardLayout title='لوحة تحكم الرئيس التنفيذي' role='ceo'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name || undefined}
        description='نظرة شاملة على الأداء الاستراتيجي والمالي والتشغيلي للأكاديمية'
        icon={<Crown className='w-16 h-16 text-blue-200' />}
      />

      {/* Executive KPIs */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {kpiData.map((kpi, index) => (
          <div key={index} className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-gray-600'>{kpi.title}</p>
              <div
                className={`flex items-center text-sm ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                {kpi.trend === "up" ? (
                  <ArrowUp className='w-4 h-4' />
                ) : (
                  <ArrowDown className='w-4 h-4' />
                )}
                {kpi.change}
              </div>
            </div>
            <p className='text-2xl font-bold text-gray-900 mb-1'>{kpi.value}</p>
            <p className='text-xs text-gray-500'>{kpi.period}</p>
          </div>
        ))}
      </div>

      {/* Strategic Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Department Performance */}
        <QuickActionCard title='أداء الأقسام'>
          <div className='space-y-4'>
            {departmentPerformance.map((dept, index) => (
              <div
                key={index}
                className='p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-medium text-gray-900'>{dept.name}</h4>
                  <span
                    className={`flex items-center text-sm ${
                      dept.growth > 20
                        ? "text-green-600"
                        : dept.growth > 10
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}>
                    <TrendingUp className='w-4 h-4 ml-1' />+{dept.growth}%
                  </span>
                </div>
                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <p className='text-gray-600'>الإيراد</p>
                    <p className='font-medium'>
                      {(dept.revenue / 1000).toFixed(0)}K ر.س
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>الطلاب</p>
                    <p className='font-medium'>{dept.students}</p>
                  </div>
                  <div>
                    <p className='text-gray-600'>الرضا</p>
                    <p className='font-medium'>{dept.satisfaction}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </QuickActionCard>

        {/* Strategic Goals */}
        <QuickActionCard title='الأهداف الاستراتيجية'>
          <div className='space-y-4'>
            {strategicGoals.map((goal, index) => (
              <div
                key={index}
                className='p-4 border border-gray-200 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium text-gray-900 text-sm'>
                    {goal.title}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      goal.status === "في المسار الصحيح"
                        ? "bg-green-100 text-green-800"
                        : goal.status === "قريب من الهدف"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {goal.status}
                  </span>
                </div>
                <div className='mb-2'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>التقدم</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.progress >= 80
                          ? "bg-green-600"
                          : goal.progress >= 60
                          ? "bg-blue-600"
                          : "bg-yellow-600"
                      }`}
                      style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
                <p className='text-xs text-gray-500'>الهدف: {goal.target}</p>
              </div>
            ))}
          </div>
        </QuickActionCard>
      </div>

      {/* Market Insights */}
      <QuickActionCard title='رؤى السوق'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          {marketInsights.map((insight, index) => (
            <div
              key={index}
              className='text-center p-4 border border-gray-200 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>{insight.metric}</p>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {insight.value}
              </p>
              <p className='text-sm text-green-600 font-medium mb-1'>
                {insight.change}
              </p>
              <p className='text-xs text-gray-500'>{insight.period}</p>
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6'>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>
            الملخص التنفيذي
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h5 className='font-medium text-gray-800 mb-2'>
                النقاط الإيجابية
              </h5>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• نمو قوي في عدد الطلاب المسجلين</li>
                <li>• ارتفاع معدل رضا العملاء</li>
                <li>• تحسن في الأداء المالي</li>
                <li>• زيادة حصة السوق</li>
              </ul>
            </div>
            <div>
              <h5 className='font-medium text-gray-800 mb-2'>التحديات</h5>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• الحاجة لتوسيع الفريق</li>
                <li>• زيادة المنافسة في السوق</li>
                <li>• تطوير دورات متقدمة جديدة</li>
                <li>• تحسين البنية التقنية</li>
              </ul>
            </div>
          </div>
        </div>
      </QuickActionCard>

      {/* Executive Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <button className='flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'>
          <BarChart3 className='w-6 h-6 ml-2' />
          التقارير التنفيذية
        </button>
        <button className='flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'>
          <Target className='w-6 h-6 ml-2' />
          الخطة الاستراتيجية
        </button>
        <button className='flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl'>
          <Globe className='w-6 h-6 ml-2' />
          تحليل السوق
        </button>
        <button className='flex items-center justify-center p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl'>
          <Settings className='w-6 h-6 ml-2' />
          اجتماع المجلس
        </button>
      </div>
    </DashboardLayout>
  );
}
