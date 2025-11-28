"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { AdvancedGradeForm } from "@/components/ui/AdvancedGradeForm";
import {
  Users,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Calendar,
} from "lucide-react";

interface Grade {
  id: string;
  name: string;
  description?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
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
  createdAt: string;
}

interface Track {
  id: string;
  name: string;
  description?: string;
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

export default function GradesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [gradeStudents, setGradeStudents] = useState<Student[]>([]);
  const [gradeTracks, setGradeTracks] = useState<Track[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [gradeToEdit, setGradeToEdit] = useState<Grade | null>(null);

  // Debug state
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch("/api/grades");
      if (response.ok) {
        const data = await response.json();
        const grades = data.grades || data.data || [];
        setGrades(grades);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeDetails = async (gradeId: string) => {
    try {
      // Fetch students in this grade
      const studentsResponse = await fetch(`/api/students?gradeId=${gradeId}`);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setGradeStudents(studentsData.students || studentsData.data || []);
      }

      // Fetch tracks in this grade
      const tracksResponse = await fetch(`/api/tracks?gradeId=${gradeId}`);
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setGradeTracks(tracksData.tracks || tracksData.data || []);
      }
    } catch (error) {
      console.error("Error fetching grade details:", error);
    }
  };

  const handleViewGrade = async (grade: Grade) => {
    setSelectedGrade(grade);
    setShowDetails(true);
    await fetchGradeDetails(grade.id);
  };

  const handleCreateGrade = () => {
    router.push("/manager/dashboard");
    // Note: We'll trigger the create modal from the dashboard
  };

  const handleEditGrade = (grade: Grade) => {
    console.log("handleEditGrade called with:", grade);
    console.log("Current editModalOpen state:", editModalOpen);
    console.log("Current gradeToEdit state:", gradeToEdit);

    setClickCount((prev) => prev + 1); // Increment click counter for visual feedback
    try {
      setGradeToEdit(grade);
      setEditModalOpen(true);
      console.log("Modal state should be updated");
      console.log("About to set editModalOpen to true");

      // Let's check the state after a small delay
      setTimeout(() => {
        console.log("After timeout - editModalOpen should be:", true);
      }, 100);
    } catch (error) {
      console.error("Error in handleEditGrade:", error);
    }
  };

  const handleGradeSubmit = async (data: {
    grade: {
      id?: string;
      name: string;
      description?: string;
      order?: number;
    };
    studentAssignments?: { studentId: string; action: "assign" | "unassign" }[];
    trackUpdates?: {
      trackId: string;
      instructorId?: string;
      coordinatorId?: string;
    }[];
  }) => {
    try {
      console.log("handleGradeSubmit called with:", data);
      const { grade, studentAssignments, trackUpdates } = data;
      const url = grade.id ? `/api/grades/${grade.id}` : "/api/grades";
      const method = grade.id ? "PUT" : "POST";

      console.log("Updating grade with URL:", url, "Method:", method);
      // Update grade basic information
      const gradeResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: grade.name,
          description: grade.description,
          order: grade.order,
        }),
      });

      console.log("Grade update response status:", gradeResponse.status);
      if (!gradeResponse.ok) {
        const errorText = await gradeResponse.text();
        console.error("Grade update failed:", errorText);
        throw new Error("Failed to save grade");
      }

      // Handle student assignments
      if (studentAssignments && studentAssignments.length > 0) {
        console.log("Processing student assignments:", studentAssignments);
        for (const assignment of studentAssignments) {
          const studentUrl =
            assignment.action === "assign"
              ? `/api/students/${assignment.studentId}/assign-grade`
              : `/api/students/${assignment.studentId}/unassign-grade`;

          console.log("Student assignment URL:", studentUrl);
          const studentResponse = await fetch(studentUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ gradeId: grade.id }),
          });

          console.log(
            "Student assignment response status:",
            studentResponse.status
          );
          if (!studentResponse.ok) {
            console.error(
              "Student assignment failed for:",
              assignment.studentId
            );
          }
        }
      }

      // Handle track updates
      if (trackUpdates && trackUpdates.length > 0) {
        console.log("Processing track updates:", trackUpdates);
        for (const update of trackUpdates) {
          const trackResponse = await fetch(`/api/tracks/${update.trackId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instructorId: update.instructorId,
              coordinatorId: update.coordinatorId,
            }),
          });

          console.log("Track update response status:", trackResponse.status);
          if (!trackResponse.ok) {
            console.error("Track update failed for:", update.trackId);
          }
        }
      }

      console.log("All updates completed, refreshing data...");
      // Refresh data
      await fetchGrades();
      if (selectedGrade && grade.id === selectedGrade.id) {
        // Update the selected grade if we're viewing its details
        const updatedGrade = { ...selectedGrade, ...grade };
        setSelectedGrade(updatedGrade);
      }
      console.log("Data refresh completed");
    } catch (error) {
      console.error("Error saving grade:", error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout title='إدارة المستويات' role='manager'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>جاري تحميل المستويات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (showDetails && selectedGrade) {
    return (
      <DashboardLayout title={`المستوى: ${selectedGrade.name}`} role='manager'>
        <div className='space-y-6' dir='rtl'>
          {/* Back Button */}
          <button
            onClick={() => setShowDetails(false)}
            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            العودة إلى المستويات
          </button>

          {/* Grade Info */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {selectedGrade.name}
                </h2>
                <p className='text-gray-600 mt-1'>
                  {selectedGrade.description}
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEditGrade(selectedGrade)}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  <Edit className='w-4 h-4' />
                  تعديل المستوى
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Users className='w-8 h-8 text-blue-600' />
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>
                      {selectedGrade._count.students}
                    </p>
                    <p className='text-sm text-gray-600'>طالب مسجل</p>
                  </div>
                </div>
              </div>

              <div className='bg-green-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <BookOpen className='w-8 h-8 text-green-600' />
                  <div>
                    <p className='text-2xl font-bold text-green-600'>
                      {selectedGrade._count.tracks}
                    </p>
                    <p className='text-sm text-gray-600'>مسار تعليمي</p>
                  </div>
                </div>
              </div>

              <div className='bg-purple-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-8 h-8 text-purple-600' />
                  <div>
                    <p className='text-sm font-medium text-purple-600'>
                      تاريخ الإنشاء
                    </p>
                    <p className='text-sm text-gray-600'>
                      {formatDate(selectedGrade.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students in Grade */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Users className='w-5 h-5 text-blue-600' />
              الطلاب المسجلين ({gradeStudents.length})
            </h3>

            {gradeStudents.length === 0 ? (
              <div className='text-center py-8'>
                <Users className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                <p className='text-gray-500'>
                  لا يوجد طلاب مسجلين في هذا المستوى
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        اسم الطالب
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        البريد الإلكتروني
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        العمر
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        تاريخ التسجيل
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {gradeStudents.map((student) => (
                      <tr key={student.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {student.name}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-500'>
                            {student.email}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-500'>
                            {student.age ? `${student.age} سنة` : "-"}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-500'>
                            {formatDate(student.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tracks in Grade */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <BookOpen className='w-5 h-5 text-green-600' />
              المسارات التعليمية ({gradeTracks.length})
            </h3>

            {gradeTracks.length === 0 ? (
              <div className='text-center py-8'>
                <BookOpen className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                <p className='text-gray-500'>
                  لا يوجد مسارات تعليمية في هذا المستوى
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {gradeTracks.map((track) => (
                  <div
                    key={track.id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      {track.name}
                    </h4>
                    <p className='text-sm text-gray-600 mb-3'>
                      {track.description}
                    </p>
                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center gap-2'>
                        <GraduationCap className='w-4 h-4 text-blue-600' />
                        <span className='text-gray-600'>المدرب:</span>
                        <span className='font-medium'>
                          {track.instructor.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <MapPin className='w-4 h-4 text-green-600' />
                        <span className='text-gray-600'>المنسق:</span>
                        <span className='font-medium'>
                          {track.coordinator.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-purple-600' />
                        <span className='text-gray-600'>الجلسات:</span>
                        <span className='font-medium'>
                          {track._count.liveSessions} جلسة
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Grade Modal for Detail View */}
        {/* Debug editModalOpen and gradeToEdit state */}
        {(() => {
          console.log("Rendering AdvancedGradeForm with:", {
            editModalOpen,
            gradeToEdit,
            hasGradeToEdit: !!gradeToEdit,
            gradeToEditName: gradeToEdit?.name,
          });
          return null;
        })()}

        <AdvancedGradeForm
          isOpen={editModalOpen}
          onClose={() => {
            console.log("Detail view modal close clicked");
            setEditModalOpen(false);
            setGradeToEdit(null);
          }}
          onSubmit={handleGradeSubmit}
          grade={gradeToEdit || undefined}
          mode='edit'
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`إدارة المستويات الأكاديمية ${
        clickCount > 0 ? `(اضغط: ${clickCount})` : ""
      }`}
      role='manager'>
      <div className='space-y-6' dir='rtl'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              المستويات الأكاديمية
            </h1>
            <p className='text-gray-600 mt-1'>
              إدارة المستويات الدراسية والطلاب المسجلين
            </p>
          </div>
          <button
            onClick={handleCreateGrade}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            <Plus className='w-4 h-4' />
            إضافة مستوى جديد
          </button>
        </div>

        {/* Grades Grid */}
        {grades.length === 0 ? (
          <div className='text-center py-12'>
            <GraduationCap className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              لا يوجد مستويات أكاديمية
            </h3>
            <p className='text-gray-500 mb-4'>
              ابدأ بإنشاء المستويات الأكاديمية لتنظيم الطلاب والمسارات
            </p>
            <button
              onClick={handleCreateGrade}
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
              <Plus className='w-4 h-4' />
              إنشاء المستوى الأول
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {grades.map((grade) => (
              <div
                key={grade.id}
                className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {grade.name}
                  </h3>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleViewGrade(grade)}
                      className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      title='عرض التفاصيل'>
                      <Eye className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => {
                        console.log("Button clicked!");
                        handleEditGrade(grade);
                      }}
                      className={`p-2 hover:bg-gray-50 rounded-lg transition-colors ${
                        clickCount > 0 ? "bg-yellow-200" : "text-gray-600"
                      }`}
                      title='تعديل المستوى'>
                      <Edit className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                <p className='text-gray-600 mb-4'>
                  {grade.description || "لا يوجد وصف"}
                </p>

                <div className='grid grid-cols-2 gap-4 mb-4'>
                  <div className='text-center p-3 bg-blue-50 rounded-lg'>
                    <p className='text-2xl font-bold text-blue-600'>
                      {grade._count.students}
                    </p>
                    <p className='text-sm text-gray-600'>طالب</p>
                  </div>
                  <div className='text-center p-3 bg-green-50 rounded-lg'>
                    <p className='text-2xl font-bold text-green-600'>
                      {grade._count.tracks}
                    </p>
                    <p className='text-sm text-gray-600'>مسار</p>
                  </div>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      grade.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {grade.isActive ? "نشط" : "غير نشط"}
                  </span>
                  <span className='text-gray-500'>
                    الترتيب: {grade.order || "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Grade Modal */}
      <AdvancedGradeForm
        isOpen={editModalOpen}
        onClose={() => {
          console.log("Modal close clicked");
          setEditModalOpen(false);
          setGradeToEdit(null);
        }}
        onSubmit={handleGradeSubmit}
        grade={gradeToEdit || undefined}
        mode='edit'
      />
    </DashboardLayout>
  );
}
