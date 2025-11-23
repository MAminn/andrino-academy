/**
 * Teaching Materials Component
 * Andrino Academy - Instructor Content Access
 *
 * Features:
 * - Display instructor-targeted modules
 * - Filter by track
 * - View all content items
 * - Access teaching resources
 * - Download materials
 */

"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Video, FileText, File as FileIcon, Image as ImageIcon,
  Download, Eye, Filter, Loader2, AlertCircle 
} from "lucide-react";

// Types
interface ContentItem {
  id: string;
  type: "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE";
  fileUrl: string;
  fileName: string;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  trackId: string;
  weekNumber?: number | null;  // Week number for scheduled content
  startDate?: string | null;   // Start date for week visibility
  contentItems: ContentItem[];
  track: {
    id: string;
    name: string;
    gradeName?: string;
  };
}

interface Track {
  id: string;
  name: string;
  gradeName?: string;
}

interface TeachingMaterialsProps {
  instructorId: string;
}

export default function TeachingMaterials({ instructorId }: TeachingMaterialsProps) {
  // State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch instructor's tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/tracks");
        if (!response.ok) throw new Error("Failed to fetch tracks");
        
        const responseData = await response.json();
        const data = responseData.data || responseData;
        const instructorTracks = data.filter(
          (t: Track & { instructorId: string }) => t.instructorId === instructorId
        );
        
        setTracks(instructorTracks);
        
        // Auto-select first track
        if (instructorTracks.length > 0 && !selectedTrackId) {
          setSelectedTrackId(instructorTracks[0].id);
        }
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError("فشل تحميل المسارات");
      }
    };

    if (instructorId) {
      fetchTracks();
    }
  }, [instructorId, selectedTrackId]);

  // Fetch modules for selected track
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedTrackId) {
        setModules([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/modules?trackId=${selectedTrackId}`);
        if (!response.ok) throw new Error("Failed to fetch modules");

        const { modules: data } = await response.json();
        
        // Filter modules that have instructor-targeted content AND only show weeks that have started
        const now = new Date();
        const instructorModules = (data as Module[]).filter(
          (m: Module) => {
            // Check if week has started
            const weekStarted = !m.startDate || new Date(m.startDate) <= now;
            if (!weekStarted) return false;
            
            // Check if module has any content items for instructors
            const hasInstructorContent = m.contentItems.some(
              (item: ContentItem) => item.targetAudience === "instructor"
            );
            
            return hasInstructorContent;
          }
        );
        
        setModules(instructorModules);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setError("فشل تحميل المواد التعليمية");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [selectedTrackId]);

  // Get icon for content type
  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return Video;
      case "PDF":
        return FileText;
      case "DOCUMENT":
        return FileIcon;
      case "IMAGE":
        return ImageIcon;
      default:
        return FileIcon;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "فيديو";
      case "PDF":
        return "PDF";
      case "DOCUMENT":
        return "مستند";
      case "IMAGE":
        return "صورة";
      default:
        return "ملف";
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      LECTURE: "محاضرة",
      EXERCISE: "تمرين",
      REFERENCE: "مرجع",
      ASSIGNMENT: "تكليف",
      PROJECT: "مشروع",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-[#7e5b3f]" />
          <h2 className="text-2xl font-bold text-gray-900">المواد التعليمية</h2>
        </div>

        {/* Track Filter */}
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="flex-1 md:flex-initial md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- اختر مسارًا --</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name} {track.gradeName ? `- ${track.gradeName}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
        </div>
      )}

      {/* Modules Display */}
      {!loading && !error && (
        <>
          {!selectedTrackId ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              الرجاء اختيار مسار لعرض المواد التعليمية
            </div>
          ) : modules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد مواد تعليمية متاحة</p>
              <p className="text-gray-500 text-sm mt-2">
                لم يتم إضافة أي محتوى تعليمي لهذا المسار بعد
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {modules.map((module) => (
                <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-[#7e5b3f] text-white p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                        <p className="text-[#c19170] text-sm">{module.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {getCategoryLabel(module.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content Items */}
                  {module.contentItems.length > 0 ? (
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        محتوى الوحدة ({module.contentItems.filter((item: ContentItem) => item.targetAudience === "instructor").length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {module.contentItems
                          .filter((item: ContentItem) => item.targetAudience === "instructor")
                          .sort((a, b) => a.order - b.order)
                          .map((item) => {
                            const Icon = getIcon(item.type);
                            return (
                              <div
                                key={item.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="p-2 bg-[#7e5b3f]/10 rounded-lg">
                                    <Icon className="h-5 w-5 text-[#7e5b3f]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate text-sm">
                                      {item.fileName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {getTypeLabel(item.type)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {(item.type === "VIDEO" ||
                                    item.type === "PDF" ||
                                    item.type === "IMAGE") && (
                                    <a
                                      href={item.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      عرض
                                    </a>
                                  )}
                                  <a
                                    href={item.fileUrl}
                                    download
                                    className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Download className="h-3 w-3" />
                                    تحميل
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p className="text-sm">لا توجد ملفات في هذه الوحدة</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats Summary */}
      {!loading && modules.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-900">
                {modules.length}
              </div>
              <div className="text-sm text-blue-700">وحدة تعليمية</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900">
                {modules.reduce((sum, m) => sum + m.contentItems.length, 0)}
              </div>
              <div className="text-sm text-blue-700">ملف</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900">
                {modules.filter((m) => m.contentItems.some((c) => c.type === "VIDEO")).length}
              </div>
              <div className="text-sm text-blue-700">فيديو</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900">
                {modules.filter((m) => m.contentItems.some((c) => c.type === "PDF")).length}
              </div>
              <div className="text-sm text-blue-700">PDF</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
