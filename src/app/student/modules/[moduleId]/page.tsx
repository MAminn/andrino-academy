/**
 * Student Module Content Page
 * Andrino Academy - View Module Content and Submit Assignments
 *
 * Features:
 * - Display module content (videos, PDFs, documents, images)
 * - View tasks
 * - Submit assignments
 * - View grades and feedback
 * - Role-based access (students only)
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import ContentViewer from "@/components/ContentViewer";
import AssignmentSubmission from "@/components/AssignmentSubmission";
import { BookOpen, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

// Types
interface ContentItem {
  id: string;
  type: "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE";
  fileUrl: string;
  fileName: string;
  order: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

interface Assignment {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  dueDate: Date | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  trackId: string;
  targetAudience: "instructor" | "student" | null;
  contentItems: ContentItem[];
  tasks: Task[];
  assignments: Assignment[];
  track: {
    id: string;
    name: string;
    gradeName: string;
  };
}

export default function StudentModuleContentPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const moduleId = params?.moduleId as string;

  const [mounted, setMounted] = useState(false);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication and authorization
  if (status === "loading" || !mounted) {
    return (
      <DashboardLayout title="محتوى الوحدة" role="STUDENT">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c19170]/20 border-t-[#7e5b3f] mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-[#7e5b3f]/20"></div>
          </div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only students can access this page
  if (session.user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  // Fetch module data
  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch module");
        }

        const data: Module = await response.json();
        setModule(data);
      } catch (err) {
        console.error("Error fetching module:", err);
        setError("فشل تحميل محتوى الوحدة");
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  // Separate content by target audience
  const instructorContent = module?.contentItems.filter(
    (item) => module.targetAudience === "instructor" || module.targetAudience === null
  ) || [];
  
  const studentContent = module?.contentItems.filter(
    (item) => module.targetAudience === "student" || module.targetAudience === null
  ) || [];

  // For students, we only show student-targeted content
  const visibleContent = studentContent.length > 0 ? studentContent : module?.contentItems || [];

  const handleAssignmentSubmit = () => {
    // Refresh module data after submission
    if (moduleId) {
      const fetchModule = async () => {
        const response = await fetch(`/api/modules/${moduleId}`);
        if (response.ok) {
          const data: Module = await response.json();
          setModule(data);
        }
      };
      fetchModule();
    }
  };

  return (
    <DashboardLayout title="محتوى الوحدة" role="STUDENT">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#7e5b3f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#c19170]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <a
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-[#7e5b3f] hover:text-[#6a4d35] mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          العودة إلى لوحة التحكم
        </a>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">حدث خطأ</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Module Content */}
        {module && !loading && (
          <div className="space-y-6">
            {/* Module Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#7e5b3f] rounded-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {module.title}
                  </h1>
                  <p className="text-gray-600 mb-3">{module.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <span>{module.track.name}</span>
                    {module.track.gradeName && (
                      <>
                        <span>•</span>
                        <span>{module.track.gradeName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Viewer */}
            {(visibleContent.length > 0 || module.tasks.length > 0) && (
              <ContentViewer
                moduleId={module.id}
                moduleName={module.title}
                instructorContent={[]} // Students don't see instructor content
                studentContent={visibleContent}
                tasks={module.tasks}
                assignments={[]} // Assignments shown separately below
                userRole="STUDENT"
              />
            )}

            {/* Assignments Section */}
            {module.assignments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">التكليفات</h2>
                {module.assignments
                  .sort((a, b) => a.order - b.order)
                  .map((assignment) => (
                    <AssignmentSubmission
                      key={assignment.id}
                      assignment={assignment}
                      studentId={session.user.id}
                      trackId={module.trackId}
                      onSubmissionComplete={handleAssignmentSubmit}
                    />
                  ))}
              </div>
            )}

            {/* Empty State */}
            {visibleContent.length === 0 && 
             module.tasks.length === 0 && 
             module.assignments.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا يوجد محتوى متاح في هذه الوحدة حالياً</p>
                <p className="text-gray-500 text-sm mt-2">
                  سيتم إضافة المحتوى قريباً من قبل المدرس
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
