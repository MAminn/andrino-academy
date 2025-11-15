"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import useModuleStore, { Module, ModuleType, ModuleCategory } from "@/stores/useModuleStore";
import {
  Video,
  FileText,
  File,
  Image,
  Download,
  Play,
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle,
  Layers,
} from "lucide-react";

export default function TrackContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const trackId = params?.trackId as string;

  const { modules, loading, fetchModules } = useModuleStore();

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [trackInfo, setTrackInfo] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | "ALL">("ALL");

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
    // Fetch track info
    try {
      const trackResponse = await fetch(`/api/tracks/${trackId}`);
      if (trackResponse.ok) {
        const trackData = await trackResponse.json();
        setTrackInfo(trackData.track);
      }
    } catch (error) {
      console.error("Error fetching track info:", error);
    }

    // Fetch modules for this track (published only for students)
    await fetchModules({ trackId, isPublished: true });
  };

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      // Auto-select first video module
      const firstVideo = modules.find((m) => m.type === "VIDEO");
      if (firstVideo) {
        setSelectedModule(firstVideo);
      }
    }
  }, [modules]);

  const filteredModules =
    selectedCategory === "ALL"
      ? modules
      : modules.filter((m) => m.category === selectedCategory);

  // Group modules by category
  const modulesByCategory = modules.reduce((acc, module) => {
    const category = module.category || "UNCATEGORIZED";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  const categories = Object.keys(modulesByCategory);

  const getCategoryLabel = (category: ModuleCategory) => {
    const labels: Record<ModuleCategory, string> = {
      LECTURE: "محاضرات",
      TUTORIAL: "دروس تعليمية",
      EXERCISE: "تمارين",
      REFERENCE: "مراجع",
      SLIDES: "شرائح",
      HANDOUT: "ملخصات",
      ASSIGNMENT: "واجبات",
      SOLUTION: "حلول",
      SUPPLEMENTARY: "مواد إضافية",
      UNCATEGORIZED: "غير مصنف",
    };
    return labels[category] || category;
  };

  const getModuleIcon = (type: ModuleType) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-5 h-5" />;
      case "PDF":
        return <FileText className="w-5 h-5" />;
      case "DOCUMENT":
        return <File className="w-5 h-5" />;
      case "IMAGE":
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout role="student" title="محتوى المسار">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Content Player */}
              {selectedModule ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Video/Content Display */}
                  {selectedModule.type === "VIDEO" ? (
                    <div className="aspect-video bg-black">
                      <video
                        controls
                        className="w-full h-full"
                        poster={selectedModule.fileUrl.replace(
                          /\.(mp4|webm|ogg)$/,
                          "-thumbnail.jpg"
                        )}
                      >
                        <source src={selectedModule.fileUrl} type={selectedModule.mimeType} />
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                    </div>
                  ) : selectedModule.type === "PDF" ? (
                    <div className="h-[600px]">
                      <iframe
                        src={selectedModule.fileUrl}
                        className="w-full h-full"
                        title={selectedModule.title}
                      />
                    </div>
                  ) : selectedModule.type === "IMAGE" ? (
                    <div className="p-6 bg-gray-50">
                      <img
                        src={selectedModule.fileUrl}
                        alt={selectedModule.title}
                        className="max-w-full mx-auto rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600">
                        اضغط على زر التحميل لعرض المستند
                      </p>
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedModule.title}
                        </h2>
                        {selectedModule.description && (
                          <p className="text-gray-600">{selectedModule.description}</p>
                        )}
                      </div>
                      <a
                        href={selectedModule.fileUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                        {getModuleIcon(selectedModule.type)}
                        {selectedModule.type === "VIDEO"
                          ? "فيديو"
                          : selectedModule.type === "PDF"
                          ? "PDF"
                          : selectedModule.type === "DOCUMENT"
                          ? "مستند"
                          : "صورة"}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {getCategoryLabel(selectedModule.category)}
                      </span>
                      <span className="flex items-center gap-1">
                        <File className="w-4 h-4" />
                        {formatFileSize(selectedModule.fileSize)}
                      </span>
                      {selectedModule.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(selectedModule.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attached Materials */}
                  {selectedModule.attachments && selectedModule.attachments.length > 0 && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        المواد المرفقة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedModule.attachments.map((attachment) => {
                          if (!attachment.attachedModule) return null;
                          return (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    attachment.attachedModule.type === "PDF"
                                      ? "bg-red-100 text-red-600"
                                      : attachment.attachedModule.type === "DOCUMENT"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  {getModuleIcon(attachment.attachedModule.type)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {attachment.attachedModule.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.attachedModule.fileSize)}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={attachment.attachedModule.fileUrl}
                                download
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">اختر محتوى من القائمة للبدء</p>
                </div>
              )}
            </div>

            {/* Sidebar - Content List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    المحتوى ({modules.length})
                  </h3>
                </div>

                {/* Category Filter */}
                <div className="p-4 border-b border-gray-200">
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as ModuleCategory | "ALL")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">جميع التصنيفات</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category as ModuleCategory)} (
                        {modulesByCategory[category].length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modules List */}
                <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-200">
                  {filteredModules.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`w-full p-4 text-right hover:bg-gray-50 transition ${
                        selectedModule?.id === module.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            module.type === "VIDEO"
                              ? "bg-purple-100 text-purple-600"
                              : module.type === "PDF"
                              ? "bg-red-100 text-red-600"
                              : module.type === "DOCUMENT"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {getModuleIcon(module.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">
                              {index + 1}.
                            </span>
                            <h4
                              className={`font-medium text-sm line-clamp-2 ${
                                selectedModule?.id === module.id
                                  ? "text-blue-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {module.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>
                              {module.type === "VIDEO"
                                ? "فيديو"
                                : module.type === "PDF"
                                ? "PDF"
                                : module.type === "DOCUMENT"
                                ? "مستند"
                                : "صورة"}
                            </span>
                            {module.duration && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(module.duration)}
                                </span>
                              </>
                            )}
                            {module.attachments && module.attachments.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  {module.attachments.length}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
