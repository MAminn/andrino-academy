"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import { GradeForm, TrackForm } from "@/components/ui/Forms";
import { StudentAssignment, BulkStudentAssignment } from "@/components/ui/StudentAssignment";
import { ConfirmModal } from "@/components/ui/Modal";
import {
  Users,
  BarChart3,
  UserPlus,
  Shield,
  Database,
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  UserCheck,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCog,
} from "lucide-react";

interface Grade {
  id: string;
  name: string;
  description?: string;
  _count: {
    students: number;
    tracks: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  age?: number;
  gradeId?: string;
  assignedGrade?: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Track {
  id: string;
  name: string;
  description?: string;
  gradeId?: string;
  instructorId?: string;
  coordinatorId?: string;
  grade: {
    name: string;
  };
  instructor: {
    name: string;
  };
  coordinator: {
    name: string;
  };
  _count: {
    liveSessions: number;
  };
}

export default function ManagerDashboard() {
  const { data: session } = useSession();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeModalMode, setGradeModalMode] = useState<"create" | "edit">("create");
  const [selectedGrade, setSelectedGrade] = useState<Grade | undefined>();
  
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackModalMode, setTrackModalMode] = useState<"create" | "edit">("create");
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  
  const [studentAssignmentOpen, setStudentAssignmentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "grade" | "track"; id: string; name: string } | null>(null);

  // Data for forms
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
  const [coordinators, setCoordinators] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grades
        const gradesResponse = await fetch("/api/grades");
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          setGrades(gradesData.grades);
        }

        // Fetch unassigned students
        const studentsResponse = await fetch("/api/students?unassigned=true");
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setUnassignedStudents(studentsData.students);
        }

        // Fetch recent tracks
        const tracksResponse = await fetch("/api/tracks");
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setRecentTracks(tracksData.tracks.slice(0, 5)); // Latest 5 tracks
        }

        // Fetch instructors and coordinators for forms
        const usersResponse = await fetch("/api/students"); // This endpoint returns all users
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const allUsers = usersData.students as User[]; // Note: This API returns all users, not just students
          
          setInstructors(allUsers.filter((user: User) => user.role === 'instructor')
            .map((user: User) => ({ id: user.id, name: user.name })));
          
          setCoordinators(allUsers.filter((user: User) => user.role === 'coordinator')
            .map((user: User) => ({ id: user.id, name: user.name })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler functions
  const handleGradeSubmit = async (gradeData: any) => {
    const isEdit = gradeData.id;
    const url = isEdit ? `/api/grades/${gradeData.id}` : "/api/grades";
    const method = isEdit ? "PUT" : "POST";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gradeData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to ${isEdit ? 'update' : 'create'} grade`);
    }
    
    // Refresh grades
    const gradesResponse = await fetch("/api/grades");
    if (gradesResponse.ok) {
      const gradesData = await gradesResponse.json();
      setGrades(gradesData.grades);
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    const response = await fetch(`/api/grades/${gradeId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete grade");
    }
    
    // Refresh grades
    const gradesResponse = await fetch("/api/grades");
    if (gradesResponse.ok) {
      const gradesData = await gradesResponse.json();
      setGrades(gradesData.grades);
    }
  };

  const handleCreateTrack = async (trackData: {
    name: string;
    description?: string;
    gradeId: string;
    instructorId: string;
    coordinatorId: string;
  }) => {
    const response = await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create track");
    }
    
    // Refresh tracks
    const tracksResponse = await fetch("/api/tracks");
    if (tracksResponse.ok) {
      const tracksData = await tracksResponse.json();
      setRecentTracks(tracksData.tracks.slice(0, 5));
    }
  };

  const handleAssignStudent = async (studentId: string, gradeId: string) => {
    const response = await fetch("/api/students/assign-grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, gradeId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to assign student");
    }
    
    // Refresh data
    const [studentsResponse, gradesResponse] = await Promise.all([
      fetch("/api/students?unassigned=true"),
      fetch("/api/grades")
    ]);
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      setUnassignedStudents(studentsData.students);
    }
    
    if (gradesResponse.ok) {
      const gradesData = await gradesResponse.json();
      setGrades(gradesData.grades);
    }
  };

  const handleBulkAssignStudents = async (studentIds: string[], gradeId: string) => {
    const promises = studentIds.map(studentId => 
      fetch("/api/students/assign-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, gradeId }),
      })
    );
    
    await Promise.all(promises);
    
    // Refresh data
    const [studentsResponse, gradesResponse] = await Promise.all([
      fetch("/api/students?unassigned=true"),
      fetch("/api/grades")
    ]);
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      setUnassignedStudents(studentsData.students);
    }
    
    if (gradesResponse.ok) {
      const gradesData = await gradesResponse.json();
      setGrades(gradesData.grades);
    }
  };

  const totalStudents =
    grades.reduce((sum, grade) => sum + grade._count.students, 0) +
    unassignedStudents.length;
  const totalTracks = grades.reduce(
    (sum, grade) => sum + grade._count.tracks,
    0
  );
  const totalSessions = recentTracks.reduce(
    (sum, track) => sum + track._count.liveSessions,
    0
  );

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      message: `${unassignedStudents.length} طالب غير مسجل في مستوى`,
      time: "الآن",
    },
    {
      id: 2,
      type: "info",
      message: "تحديث النظام متاح للتنزيل",
      time: "منذ 3 ساعات",
    },
    {
      id: 3,
      type: "success",
      message: "تم إكمال النسخ الاحتياطي بنجاح",
      time: "منذ 6 ساعات",
    },
  ];

  return (
    <DashboardLayout title='لوحة تحكم المدير التعليمي' role='manager'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name || undefined}
        description='إدارة المستويات والمسارات والجلسات المباشرة وتنسيق العملية التعليمية'
        icon={<GraduationCap className='w-16 h-16 text-blue-200' />}
      />

      {/* Academic Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='المستويات الدراسية'
          value={grades.length}
          icon={<BookOpen className='w-8 h-8' />}
          color='blue'
        />
        <StatCard
          title='إجمالي الطلاب'
          value={totalStudents}
          icon={<Users className='w-8 h-8' />}
          color='green'
        />
        <StatCard
          title='المسارات النشطة'
          value={totalTracks}
          icon={<MapPin className='w-8 h-8' />}
          color='purple'
        />
        <StatCard
          title='الجلسات المجدولة'
          value={totalSessions}
          icon={<Calendar className='w-8 h-8' />}
          color='indigo'
        />
      </div>

      {/* Academic Management Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Grades Management */}
        <QuickActionCard title='إدارة المستويات الدراسية'>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-gray-600'>جاري التحميل...</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900'>{grade.name}</h4>
                    <div className='flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mt-1'>
                      <span className='flex items-center'>
                        <Users className='w-4 h-4 ml-1' />
                        {grade._count.students} طالب
                      </span>
                      <span className='flex items-center'>
                        <MapPin className='w-4 h-4 ml-1' />
                        {grade._count.tracks} مسار
                      </span>
                    </div>
                    {grade.description && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {grade.description}
                      </p>
                    )}
                  </div>
                  <div className='flex items-center space-x-2 space-x-reverse'>
                    <button 
                      onClick={() => {
                        setSelectedGrade(grade);
                        setGradeModalMode("edit");
                        setGradeModalOpen(true);
                      }}
                      className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      title="عرض تفاصيل المستوى"
                    >
                      <Eye className='w-4 h-4' />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedGrade(grade);
                        setGradeModalMode("edit");
                        setGradeModalOpen(true);
                      }}
                      className='p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors'
                      title="تعديل المستوى"
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button 
                      onClick={() => {
                        setDeleteTarget({ type: "grade", id: grade.id, name: grade.name });
                        setDeleteConfirmOpen(true);
                      }}
                      className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                      title="حذف المستوى"
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  setGradeModalMode("create");
                  setSelectedGrade(undefined);
                  setGradeModalOpen(true);
                }}
                className='w-full flex items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors'
              >
                <Plus className='w-5 h-5 ml-2' />
                إنشاء مستوى جديد
              </button>
            </div>
          )}
        </QuickActionCard>

        {/* Unassigned Students */}
        <QuickActionCard title='الطلاب غير المسجلين في مستوى'>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-gray-600'>جاري التحميل...</p>
            </div>
          ) : unassignedStudents.length > 0 ? (
            <div className='space-y-4'>
              {unassignedStudents.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className='flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900'>
                      {student.name}
                    </h4>
                    <div className='flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mt-1'>
                      <span>{student.email}</span>
                      {student.age && <span>العمر: {student.age}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentAssignmentOpen(true);
                    }}
                    className='px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    تسجيل في مستوى
                  </button>
                </div>
              ))}
              {unassignedStudents.length > 5 && (
                <div className="text-center">
                  <p className='text-sm text-gray-600 mb-2'>
                    و {unassignedStudents.length - 5} طالب آخر...
                  </p>
                  <button 
                    onClick={() => setBulkAssignmentOpen(true)}
                    className='px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors'
                  >
                    <UserCog className='w-4 h-4 ml-1 inline' />
                    تسجيل متعدد للطلاب
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8'>
              <UserCheck className='w-12 h-12 text-green-600 mx-auto mb-3' />
              <p className='text-gray-600'>جميع الطلاب مسجلين في مستويات</p>
            </div>
          )}
        </QuickActionCard>
      </div>

      {/* Recent Tracks and System Alerts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Recent Tracks */}
        <QuickActionCard title='المسارات الحديثة'>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-gray-600'>جاري التحميل...</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentTracks.map((track) => (
                <div
                  key={track.id}
                  className='p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='font-medium text-gray-900'>{track.name}</h4>
                    <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                      {track.grade.name}
                    </span>
                  </div>
                  <div className='text-sm text-gray-600 space-y-1'>
                    <div className='flex items-center justify-between'>
                      <span>المعلم:</span>
                      <span className='font-medium'>
                        {track.instructor.name}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>المنسق:</span>
                      <span className='font-medium'>
                        {track.coordinator.name}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>الجلسات:</span>
                      <span className='font-medium'>
                        {track._count.liveSessions}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </QuickActionCard>

        {/* System Alerts */}
        <QuickActionCard title='تنبيهات النظام'>
          <div className='space-y-4'>
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className='flex items-start space-x-3 space-x-reverse p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'>
                <div className='flex-shrink-0 mt-1'>
                  {alert.type === "warning" && (
                    <Bell className='w-5 h-5 text-yellow-600' />
                  )}
                  {alert.type === "info" && (
                    <Database className='w-5 h-5 text-blue-600' />
                  )}
                  {alert.type === "success" && (
                    <Shield className='w-5 h-5 text-green-600' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-gray-900'>{alert.message}</p>
                  <p className='text-xs text-gray-500 mt-1'>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </QuickActionCard>
      </div>

      {/* Academic Management Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <button 
          onClick={() => {
            setGradeModalMode("create");
            setSelectedGrade(undefined);
            setGradeModalOpen(true);
          }}
          className='flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'
        >
          <BookOpen className='w-6 h-6 ml-2' />
          إدارة المستويات
        </button>
        <button 
          onClick={() => {
            setTrackModalMode("create");
            setSelectedTrack(undefined);
            setTrackModalOpen(true);
          }}
          className='flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'
        >
          <MapPin className='w-6 h-6 ml-2' />
          إدارة المسارات
        </button>
        <button 
          onClick={() => setBulkAssignmentOpen(true)}
          className='flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl'
        >
          <UserPlus className='w-6 h-6 ml-2' />
          تسجيل الطلاب
        </button>
        <button className='flex items-center justify-center p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl'>
          <BarChart3 className='w-6 h-6 ml-2' />
          التقارير الأكاديمية
        </button>
      </div>

      {/* Modals */}
      <GradeForm
        isOpen={gradeModalOpen}
        onClose={() => {
          setGradeModalOpen(false);
          setSelectedGrade(undefined);
        }}
        onSubmit={handleGradeSubmit}
        grade={selectedGrade}
        mode={gradeModalMode}
      />

      <TrackForm
        isOpen={trackModalOpen}
        onClose={() => {
          setTrackModalOpen(false);
          setSelectedTrack(undefined);
        }}
        onSubmit={handleCreateTrack}
        track={selectedTrack ? {
          id: selectedTrack.id,
          name: selectedTrack.name,
          description: selectedTrack.description,
          gradeId: selectedTrack.gradeId || "",
          instructorId: selectedTrack.instructorId || "",
          coordinatorId: selectedTrack.coordinatorId || ""
        } : undefined}
        mode={trackModalMode}
        grades={grades.map(g => ({ id: g.id, name: g.name }))}
        instructors={instructors}
        coordinators={coordinators}
      />

      <StudentAssignment
        isOpen={studentAssignmentOpen}
        onClose={() => {
          setStudentAssignmentOpen(false);
          setSelectedStudent(null);
        }}
        onAssign={handleAssignStudent}
        student={selectedStudent}
        grades={grades.map(g => ({ id: g.id, name: g.name }))}
      />

      <BulkStudentAssignment
        isOpen={bulkAssignmentOpen}
        onClose={() => setBulkAssignmentOpen(false)}
        onAssign={handleBulkAssignStudents}
        unassignedStudents={unassignedStudents}
        grades={grades.map(g => ({ id: g.id, name: g.name }))}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === "grade") {
              handleDeleteGrade(deleteTarget.id);
            }
          }
        }}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف ${deleteTarget?.name}؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </DashboardLayout>
  );
}
