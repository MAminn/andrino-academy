/**
 * Zustand Store Integration Example
 * Andrino Academy - Manager Dashboard with Full State Management
 * Demonstrates complete migration from useState to Zustand stores
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import {
  useGradeStore,
  useTrackStore,
  useUserStore,
  useUIStore,
} from "@/stores";
import {
  Users,
  BarChart3,
  BookOpen,
  GraduationCap,
  UserCheck,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

export default function OptimizedManagerDashboard() {
  const { data: session } = useSession();

  // Zustand stores - clean, no useState needed!
  const {
    grades,
    loading: gradesLoading,
    error: gradesError,
    fetchGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    getActiveGrades,
  } = useGradeStore();

  const {
    tracks: recentTracks,
    loading: tracksLoading,
    fetchTracks,
    createTrack,
  } = useTrackStore();

  const {
    students,
    unassignedStudents,
    loading: usersLoading,
    fetchStudents,
    fetchUnassignedStudents,
    assignStudentToGrade,
  } = useUserStore();

  const {
    modals,
    modalData,
    openModal,
    closeModal,
    setModalData,
    addNotification,
    globalLoading,
    setGlobalLoading,
  } = useUIStore();

  // Combined loading state
  const loading =
    gradesLoading || tracksLoading || usersLoading || globalLoading;

  // Load all data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session?.user?.id) return;

      setGlobalLoading(true);
      try {
        await Promise.all([
          fetchGrades(),
          fetchTracks(),
          fetchStudents(),
          fetchUnassignedStudents(),
        ]);

        addNotification({
          type: "success",
          message: "تم تحميل بيانات لوحة التحكم بنجاح",
        });
      } catch (error) {
        addNotification({
          type: "error",
          message: "حدث خطأ في تحميل البيانات",
        });
      } finally {
        setGlobalLoading(false);
      }
    };

    loadDashboardData();
  }, [
    session?.user?.id,
    fetchGrades,
    fetchTracks,
    fetchStudents,
    fetchUnassignedStudents,
    setGlobalLoading,
    addNotification,
  ]);

  // Event handlers using store actions
  const handleCreateGrade = () => {
    setModalData({
      selectedGradeId: null,
    });
    openModal("gradeModal");
  };

  const handleEditGrade = (gradeId: string) => {
    setModalData({
      selectedGradeId: gradeId,
    });
    openModal("gradeModal");
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستوى؟")) {
      const success = await deleteGrade(gradeId);
      if (success) {
        addNotification({
          type: "success",
          message: "تم حذف المستوى بنجاح",
        });
      }
    }
  };

  const handleCreateTrack = () => {
    setModalData({
      selectedTrackId: null,
    });
    openModal("trackModal");
  };

  const handleAssignStudent = (studentId: string) => {
    setModalData({
      selectedUserId: studentId,
    });
    openModal("gradeAssignmentModal");
  };

  const handleBulkAssignment = () => {
    openModal("bulkAssignmentModal");
  };

  // Quick assignment function
  const quickAssignToGrade = async (studentId: string, gradeId: string) => {
    const success = await assignStudentToGrade(studentId, gradeId);
    if (success) {
      addNotification({
        type: "success",
        message: "تم تسجيل الطالب بنجاح",
      });
    }
  };

  // Computed values using store selectors
  const activeGrades = getActiveGrades();
  const totalStudents = students.length;
  const totalUnassigned = unassignedStudents.length;
  const totalTracks = recentTracks.length;

  // Loading state
  if (loading && grades.length === 0) {
    return (
      <DashboardLayout title='لوحة تحكم المدير الأكاديمي' role='manager'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>جاري تحميل بيانات لوحة التحكم...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='لوحة تحكم المدير الأكاديمي' role='manager'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name ?? undefined}
        description='مرحباً بك في لوحة تحكم المدير الأكاديمي. يمكنك إدارة المستويات والمسارات والطلاب من هنا.'
        icon={<GraduationCap className='w-8 h-8' />}
      />

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='إجمالي الطلاب'
          value={totalStudents}
          icon={<Users className='w-6 h-6' />}
          color='bg-blue-500'
        />
        <StatCard
          title='طلاب غير مسجلين'
          value={totalUnassigned}
          icon={<UserCheck className='w-6 h-6' />}
          color='bg-orange-500'
        />
        <StatCard
          title='المستويات الأكاديمية'
          value={activeGrades.length}
          icon={<BookOpen className='w-6 h-6' />}
          color='bg-green-500'
        />
        <StatCard
          title='المسارات النشطة'
          value={totalTracks}
          icon={<MapPin className='w-6 h-6' />}
          color='bg-purple-500'
        />
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <QuickActionCard title='إدارة المستويات'>
          <button
            onClick={handleCreateGrade}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'>
            <BookOpen className='w-5 h-5' />
            إنشاء وتعديل المستويات الأكاديمية
          </button>
        </QuickActionCard>

        <QuickActionCard title='إدارة المسارات'>
          <button
            onClick={handleCreateTrack}
            className='w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'>
            <MapPin className='w-5 h-5' />
            إنشاء مسارات تعليمية جديدة
          </button>
        </QuickActionCard>

        <QuickActionCard title='تسجيل الطلاب'>
          <button
            onClick={handleBulkAssignment}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'>
            <UserCheck className='w-5 h-5' />
            تسجيل الطلاب في المستويات المناسبة
          </button>
        </QuickActionCard>
      </div>

      {/* Grades Management Section */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-gray-900'>
            إدارة المستويات الأكاديمية
          </h2>
          <button
            onClick={handleCreateGrade}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'>
            <Plus className='w-4 h-4' />
            مستوى جديد
          </button>
        </div>

        {gradesError && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
            {gradesError}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {grades.map((grade) => (
            <div
              key={grade.id}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <h3 className='font-semibold text-gray-900'>{grade.name}</h3>
                  <p className='text-sm text-gray-600'>{grade.description}</p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleEditGrade(grade.id)}
                    className='text-blue-600 hover:text-blue-800'>
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDeleteGrade(grade.id)}
                    className='text-red-600 hover:text-red-800'>
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
              <div className='text-sm text-gray-500'>
                المرتبة: {grade.order || "غير محدد"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned Students Section */}
      {unassignedStudents.length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-gray-900'>
              طلاب بحاجة إلى تسجيل ({unassignedStudents.length})
            </h2>
            <button
              onClick={handleBulkAssignment}
              className='bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors'>
              تسجيل جماعي
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {unassignedStudents.slice(0, 6).map((student) => (
              <div
                key={student.id}
                className='border border-orange-200 rounded-lg p-4 bg-orange-50'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      {student.name}
                    </h3>
                    <p className='text-sm text-gray-600'>{student.email}</p>
                    <p className='text-xs text-gray-500'>
                      العمر: {student.age} • الخبرة:{" "}
                      {student.priorExperience || "غير محدد"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssignStudent(student.id)}
                    className='bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors'>
                    تسجيل
                  </button>
                </div>

                {/* Quick assignment buttons */}
                <div className='flex gap-2 mt-3'>
                  {activeGrades.slice(0, 2).map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => quickAssignToGrade(student.id, grade.id)}
                      className='bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors'>
                      {grade.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
          <BarChart3 className='w-5 h-5' />
          إحصائيات سريعة
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              {(
                ((totalStudents - totalUnassigned) / totalStudents) * 100 || 0
              ).toFixed(1)}
              %
            </div>
            <div className='text-sm text-gray-600'>معدل التسجيل</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-green-600 mb-2'>
              {(totalTracks / activeGrades.length || 0).toFixed(1)}
            </div>
            <div className='text-sm text-gray-600'>
              متوسط المسارات لكل مستوى
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-purple-600 mb-2'>
              {Math.round(totalStudents / activeGrades.length || 0)}
            </div>
            <div className='text-sm text-gray-600'>متوسط الطلاب لكل مستوى</div>
          </div>
        </div>
      </div>

      {/* Modals would be rendered here using the UI store state */}
      {/* This demonstrates how clean modal management becomes with Zustand */}
      {modals.gradeModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-bold mb-4'>
              {modalData.selectedGradeId ? "تعديل المستوى" : "إنشاء مستوى جديد"}
            </h3>
            <p className='text-gray-600 mb-4'>
              نموذج إنشاء/تعديل المستوى سيكون هنا
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => closeModal("gradeModal")}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors'>
                إلغاء
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  closeModal("gradeModal");
                  addNotification({
                    type: "success",
                    message: "تم حفظ المستوى بنجاح",
                  });
                }}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'>
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
