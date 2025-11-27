"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import ContentViewer from "@/components/ContentViewer";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Loader2,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  weekNumber: number | null;
  startDate: string | null;
  category: string;
  isPublished: boolean;
  contentItems: any[];
  tasks: any[];
  assignments: any[];
}

interface Track {
  id: string;
  name: string;
  description?: string;
  instructor?: {
    name: string;
  };
}

export default function TrackContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const trackId = params?.trackId as string;

  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [trackInfo, setTrackInfo] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "student") {
        router.push("/unauthorized");
      } else if (trackId) {
        loadTrackContent();
      }
    }
  }, [status, session, trackId]);

  const loadTrackContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch track info
      const trackResponse = await fetch(`/api/tracks/${trackId}`);
      if (trackResponse.ok) {
        const trackData = await trackResponse.json();
        setTrackInfo(trackData.track);
      }

      // Fetch published modules for this track
      const modulesResponse = await fetch(`/api/modules?trackId=${trackId}&isPublished=true`);
      if (!modulesResponse.ok) {
        throw new Error("Failed to fetch modules");
      }

      const modulesData = await modulesResponse.json();
      const modulesArray = modulesData.modules || modulesData.data || [];
      
      // Fetch full details for each module (with content items, tasks, assignments)
      const detailedModules = await Promise.all(
        modulesArray.map(async (mod: any) => {
          try {
            const detailResponse = await fetch(`/api/modules/${mod.id}`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return detailData.module;
            }
            return mod;
          } catch (err) {
            console.error(`Error fetching module ${mod.id}:`, err);
            return mod;
          }
        })
      );

      setModules(detailedModules);
      
      // Auto-select first module
      if (detailedModules.length > 0) {
        setSelectedModuleId(detailedModules[0].id);
      }
    } catch (err) {
      console.error("Error loading track content:", err);
      setError("فشل تحميل محتوى المسار");
    } finally {
      setLoading(false);
    }
  };

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  // Group content by instructor/student audience
  const instructorContent = selectedModule?.contentItems?.filter(
    (item: any) => item.targetAudience === "instructor"
  ) || [];
  const studentContent = selectedModule?.contentItems?.filter(
    (item: any) => item.targetAudience === "student"  || !item.targetAudience // Include items without targetAudience for backward compatibility
  ) || [];

  if (status === "loading" || loading) {
    return (
      <DashboardLayout role="student" title="محتوى المسار">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="محتوى المسار">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {trackInfo?.name || "محتوى المسار"}
              </h1>
              <p className="text-gray-600 mt-1">
                {trackInfo?.description || "المواد التعليمية للمسار"}
              </p>
              {trackInfo?.instructor && (
                <p className="text-sm text-gray-500 mt-1">
                  المعلم: {trackInfo.instructor.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {modules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">لا يوجد محتوى متاح حالياً</p>
              <p className="text-sm mt-2">
                سيتم إضافة المواد التعليمية قريباً من قبل المعلم
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Modules List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    الأسابيع ({modules.length})
                  </h3>
                </div>

                <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-200">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModuleId(module.id)}
                      className={`w-full p-4 text-right hover:bg-gray-50 transition ${
                        selectedModuleId === module.id ? "bg-blue-50 border-r-4 border-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            selectedModuleId === module.id
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Calendar className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0 text-right">
                          {module.weekNumber && (
                            <div className="text-xs text-gray-500 mb-1">
                              الأسبوع {module.weekNumber}
                            </div>
                          )}
                          <h4
                            className={`font-medium text-sm ${
                              selectedModuleId === module.id
                                ? "text-blue-600"
                                : "text-gray-900"
                            }`}
                          >
                            {module.title}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {module.contentItems?.length || 0} عنصر محتوى •{" "}
                            {module.tasks?.length || 0} مهمة •{" "}
                            {module.assignments?.length || 0} تكليف
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - ContentViewer */}
            <div className="lg:col-span-3">
              {selectedModule ? (
                <ContentViewer
                  moduleId={selectedModule.id}
                  moduleName={selectedModule.title}
                  instructorContent={instructorContent}
                  studentContent={studentContent}
                  tasks={selectedModule.tasks || []}
                  assignments={selectedModule.assignments || []}
                  userRole="STUDENT"
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">اختر أسبوعاً من القائمة للبدء</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
