"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { TrackForm } from "@/components/ui/Forms";
import {
  BookOpen,
  MapPin,
  Plus,
  Eye,
  Edit,
  ArrowLeft,
  GraduationCap,
  Calendar,
  Clock,
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  grade: {
    id: string;
    name: string;
  };
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  coordinator: {
    id: string;
    name: string;
    email: string;
  };
  liveSessions: Array<{
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  _count: {
    liveSessions: number;
  };
}

interface Grade {
  id: string;
  name: string;
}

export default function TracksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);
  const [instructors, setInstructors] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [coordinators, setCoordinators] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    fetchTracks();
    fetchGrades();
    fetchUsersData();
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [selectedGrade]);

  const fetchTracks = async () => {
    try {
      const gradeFilter =
        selectedGrade !== "all" ? `?gradeId=${selectedGrade}` : "";
      const response = await fetch(`/api/tracks${gradeFilter}`);
      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks || data.data || [];
        setTracks(tracks);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchUsersData = async () => {
    try {
      // Fetch instructors
      const instructorsResponse = await fetch("/api/users?role=instructor");
      if (instructorsResponse.ok) {
        const { users: instructorsData } = await instructorsResponse.json();
        setInstructors(instructorsData || []);
      }

      // Fetch coordinators
      const coordinatorsResponse = await fetch("/api/users?role=coordinator");
      if (coordinatorsResponse.ok) {
        const { users: coordinatorsData } = await coordinatorsResponse.json();
        setCoordinators(coordinatorsData || []);
      }
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  };

  const handleEditTrack = (track: Track) => {
    console.log("handleEditTrack called with:", track);
    try {
      setTrackToEdit(track);
      setEditModalOpen(true);
      console.log("Modal state should be updated");
    } catch (error) {
      console.error("Error in handleEditTrack:", error);
    }
  };

  const handleTrackSubmit = async (trackData: {
    id?: string;
    name: string;
    description?: string;
    gradeId: string;
    instructorId: string;
    coordinatorId: string;
  }) => {
    try {
      const response = await fetch(`/api/tracks/${trackToEdit?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackData),
      });

      if (!response.ok) throw new Error("Failed to update track");

      // Refresh tracks data
      await fetchTracks();
      setEditModalOpen(false);
      setTrackToEdit(null);
    } catch (error) {
      console.error("Error updating track:", error);
    }
  };

  const handleViewTrack = (track: Track) => {
    setSelectedTrack(track);
    setShowDetails(true);
  };

  const handleCreateTrack = () => {
    router.push("/manager/dashboard");
    // Note: We'll trigger the create modal from the dashboard
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "م" : "ص";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "ACTIVE":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "مسودة";
      case "SCHEDULED":
        return "مجدولة";
      case "READY":
        return "جاهزة";
      case "ACTIVE":
        return "نشطة";
      case "COMPLETED":
        return "مكتملة";
      case "CANCELLED":
        return "ملغية";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title='إدارة المسارات' role='manager'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>جاري تحميل المسارات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (showDetails && selectedTrack) {
    return (
      <DashboardLayout title={`المسار: ${selectedTrack.name}`} role='manager'>
        <div className='space-y-6' dir='rtl'>
          {/* Back Button */}
          <button
            onClick={() => setShowDetails(false)}
            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            العودة إلى المسارات
          </button>

          {/* Track Info */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {selectedTrack.name}
                </h2>
                <p className='text-gray-600 mt-1'>
                  {selectedTrack.description}
                </p>
                <p className='text-sm text-blue-600 mt-2'>
                  {selectedTrack.grade.name}
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEditTrack(selectedTrack)}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  <Edit className='w-4 h-4' />
                  تعديل المسار
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-8 h-8 text-blue-600' />
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>
                      {selectedTrack._count.liveSessions}
                    </p>
                    <p className='text-sm text-gray-600'>جلسة مجدولة</p>
                  </div>
                </div>
              </div>

              <div className='bg-green-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <GraduationCap className='w-8 h-8 text-green-600' />
                  <div>
                    <p className='text-sm font-medium text-green-600'>المدرب</p>
                    <p className='text-sm text-gray-600'>
                      {selectedTrack.instructor.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-purple-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <MapPin className='w-8 h-8 text-purple-600' />
                  <div>
                    <p className='text-sm font-medium text-purple-600'>
                      المنسق
                    </p>
                    <p className='text-sm text-gray-600'>
                      {selectedTrack.coordinator.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-orange-50 p-4 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-8 h-8 text-orange-600' />
                  <div>
                    <p className='text-sm font-medium text-orange-600'>
                      تاريخ الإنشاء
                    </p>
                    <p className='text-sm text-gray-600'>
                      {formatDate(selectedTrack.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Track Sessions */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Calendar className='w-5 h-5 text-blue-600' />
              الجلسات المجدولة ({selectedTrack.liveSessions.length})
            </h3>

            {selectedTrack.liveSessions.length === 0 ? (
              <div className='text-center py-8'>
                <Calendar className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                <p className='text-gray-500'>
                  لا يوجد جلسات مجدولة في هذا المسار
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {selectedTrack.liveSessions.map((session) => (
                  <div
                    key={session.id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-semibold text-gray-900'>
                        {session.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          session.status
                        )}`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    <div className='flex items-center gap-4 text-sm text-gray-600'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {formatDate(session.date)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        {formatTime(session.startTime)} -{" "}
                        {formatTime(session.endTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='إدارة المسارات التعليمية' role='manager'>
      <div className='space-y-6' dir='rtl'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              المسارات التعليمية
            </h1>
            <p className='text-gray-600 mt-1'>
              إدارة المسارات والجلسات التعليمية
            </p>
          </div>
          <button
            onClick={handleCreateTrack}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            <Plus className='w-4 h-4' />
            إضافة مسار جديد
          </button>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-lg shadow-md p-4'>
          <div className='flex items-center gap-4'>
            <label className='text-sm font-medium text-gray-700'>
              تصفية حسب المستوى:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              <option value='all'>جميع المستويات</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tracks Grid */}
        {tracks.length === 0 ? (
          <div className='text-center py-12'>
            <BookOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              لا يوجد مسارات تعليمية
            </h3>
            <p className='text-gray-500 mb-4'>
              ابدأ بإنشاء المسارات التعليمية لتنظيم الجلسات والمحتوى
            </p>
            <button
              onClick={handleCreateTrack}
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
              <Plus className='w-4 h-4' />
              إنشاء المسار الأول
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {tracks.map((track) => (
              <div
                key={track.id}
                className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {track.name}
                  </h3>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleViewTrack(track)}
                      className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      title='عرض التفاصيل'>
                      <Eye className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleEditTrack(track)}
                      className='p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors'
                      title='تعديل المسار'>
                      <Edit className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                <p className='text-gray-600 mb-3'>
                  {track.description || "لا يوجد وصف"}
                </p>

                <div className='bg-blue-50 p-3 rounded-lg mb-4'>
                  <p className='text-sm font-medium text-blue-800'>
                    {track.grade.name}
                  </p>
                </div>

                <div className='space-y-2 text-sm mb-4'>
                  <div className='flex items-center gap-2'>
                    <GraduationCap className='w-4 h-4 text-green-600' />
                    <span className='text-gray-600'>المدرب:</span>
                    <span className='font-medium'>{track.instructor.name}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='w-4 h-4 text-purple-600' />
                    <span className='text-gray-600'>المنسق:</span>
                    <span className='font-medium'>
                      {track.coordinator.name}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-blue-600' />
                    <span className='text-sm text-gray-600'>
                      {track._count.liveSessions} جلسة
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      track.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {track.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Track Modal */}
      {editModalOpen && trackToEdit && (
        <TrackForm
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setTrackToEdit(null);
          }}
          onSubmit={handleTrackSubmit}
          track={{
            id: trackToEdit.id,
            name: trackToEdit.name,
            description: trackToEdit.description,
            gradeId: trackToEdit.grade.id,
            instructorId: trackToEdit.instructor.id,
            coordinatorId: trackToEdit.coordinator.id,
          }}
          mode='edit'
          grades={grades}
          instructors={instructors}
          coordinators={coordinators}
        />
      )}
    </DashboardLayout>
  );
}
