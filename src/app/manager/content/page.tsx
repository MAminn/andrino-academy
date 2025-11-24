"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import useModuleStore, { Module, ModuleType, ModuleCategory } from "@/stores/useModuleStore";
import useGradeStore from "@/stores/useGradeStore";
import useTrackStore from "@/stores/useTrackStore";
import {
  Upload,
  Video,
  FileText,
  File,
  Image,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
} from "lucide-react";
import MultiContentUpload from "@/components/MultiContentUpload";

export default function ContentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    modules,
    loading,
    uploading,
    uploadProgress,
    error,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    togglePublish,
    clearError,
  } = useModuleStore();

  const { grades, fetchGrades } = useGradeStore();
  const { tracks, fetchTracks } = useTrackStore();

  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [filterType, setFilterType] = useState<ModuleType | "">("");
  const [filterCategory, setFilterCategory] = useState<ModuleCategory | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleData, setEditingModuleData] = useState<any>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "VIDEO" as ModuleType,
    category: "LECTURE" as ModuleCategory,
    trackId: "",
    isPublished: false,
    file: null as File | null,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      if (!["manager", "ceo"].includes(session?.user?.role || "")) {
        router.push("/unauthorized");
      } else {
        fetchGrades();
        fetchTracks();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (selectedTrack) {
      fetchModules({ trackId: selectedTrack, skipDateFilter: true });
    } else if (selectedGrade) {
      const gradeTrackIds = tracks
        .filter((t) => t.gradeId === selectedGrade)
        .map((t) => t.id);
      if (gradeTrackIds.length > 0) {
        // Fetch modules for all tracks in selected grade
        fetchModules({ skipDateFilter: true });
      }
    } else {
      fetchModules({ skipDateFilter: true });
    }
  }, [selectedTrack, selectedGrade]);

  // Helper to get current filters for consistent module fetching
  const getCurrentFilters = () => {
    if (selectedTrack) {
      return { trackId: selectedTrack, skipDateFilter: true };
    }
    return { skipDateFilter: true };
  };

  // Filter modules
  const filteredModules = modules.filter((module) => {
    if (selectedTrack && module.trackId !== selectedTrack) return false;
    if (selectedGrade && module.track?.gradeId !== selectedGrade) return false;
    if (filterType && module.type !== filterType) return false;
    if (filterCategory && module.category !== filterCategory) return false;
    if (
      searchQuery &&
      !module.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };



  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingModuleId) {
      // Edit mode - file is optional, but if provided, use FormData
      if (uploadForm.file) {
        // File replacement - use FormData
        const formData = new FormData();
        formData.append("title", uploadForm.title);
        formData.append("description", uploadForm.description);
        formData.append("category", uploadForm.category);
        formData.append("trackId", uploadForm.trackId);
        formData.append("isPublished", String(uploadForm.isPublished));
        formData.append("file", uploadForm.file);

        const response = await fetch(`/api/modules/${editingModuleId}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          setShowUploadModal(false);
          setEditingModuleId(null);
          setUploadForm({
            title: "",
            description: "",
            type: "VIDEO",
            category: "LECTURE",
            trackId: "",
            isPublished: false,
            file: null,
          });
          fetchModules(getCurrentFilters());
          alert("تم تحديث المحتوى واستبدال الملف بنجاح!");
        }
      } else {
        // Metadata only update
        const result = await updateModule(editingModuleId, {
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          trackId: uploadForm.trackId,
          isPublished: uploadForm.isPublished,
        });

        if (result) {
          setShowUploadModal(false);
          setEditingModuleId(null);
          setUploadForm({
            title: "",
            description: "",
            type: "VIDEO",
            category: "LECTURE",
            trackId: "",
            isPublished: false,
            file: null,
          });
          alert("تم تحديث المحتوى بنجاح!");
        }
      }
    } else {
      // Create mode - file is required
      if (!uploadForm.file || !uploadForm.trackId) {
        alert("الرجاء اختيار ملف ومسار");
        return;
      }

      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("type", uploadForm.type);
      formData.append("category", uploadForm.category);
      formData.append("trackId", uploadForm.trackId);
      formData.append("isPublished", String(uploadForm.isPublished));
      formData.append("file", uploadForm.file);

      const result = await createModule(formData);

      if (result) {
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          type: "VIDEO",
          category: "LECTURE",
          trackId: "",
          isPublished: false,
          file: null,
        });
        alert("تم رفع الملف بنجاح!");
      }
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      const success = await deleteModule(moduleId);
      if (success) {
        alert("تم الحذف بنجاح");
      }
    }
  };

  const handleTogglePublish = async (moduleId: string) => {
    const result = await togglePublish(moduleId);
    if (result) {
      alert(
        result.isPublished
          ? "تم نشر المحتوى للطلاب"
          : "تم إخفاء المحتوى عن الطلاب"
      );
    }
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
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout title="Manager Dashboard" role="manager">
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
    <DashboardLayout title="Manager Dashboard" role="manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              إدارة المحتوى التعليمي
            </h1>
            <p className="text-gray-600 mt-2">
              رفع وإدارة الفيديوهات والمواد التعليمية
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Upload className="w-5 h-5" />
            رفع محتوى جديد
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedTrack("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع المستويات</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Track Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المسار
              </label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع المسارات</option>
                {tracks
                  .filter((t) => !selectedGrade || t.gradeId === selectedGrade)
                  .map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المحتوى
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ModuleType | "")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع الأنواع</option>
                <option value="VIDEO">فيديو</option>
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">مستند</option>
                <option value="IMAGE">صورة</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالعنوان..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المحتوى</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {filteredModules.length}
                </p>
              </div>
              <File className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">المنشور</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {filteredModules.filter((m) => m.isPublished).length}
                </p>
              </div>
              <Eye className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">الفيديوهات</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {filteredModules.filter((m) => m.type === "VIDEO").length}
                </p>
              </div>
              <Video className="w-12 h-12 text-purple-600 opacity-50" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">المستندات</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {
                    filteredModules.filter(
                      (m) => m.type === "PDF" || m.type === "DOCUMENT"
                    ).length
                  }
                </p>
              </div>
              <FileText className="w-12 h-12 text-orange-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              المحتوى التعليمي ({filteredModules.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredModules.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا يوجد محتوى تعليمي</p>
                <p className="text-sm mt-2">ابدأ برفع أول محتوى تعليمي</p>
              </div>
            ) : (
              // Group modules by week number
              (() => {
                const weekMap = new Map<string, typeof filteredModules>();
                filteredModules.forEach(module => {
                  const key = module.weekNumber ? `week-${module.weekNumber}` : 'no-week';
                  if (!weekMap.has(key)) {
                    weekMap.set(key, []);
                  }
                  weekMap.get(key)!.push(module);
                });
                
                // Sort weeks by number
                const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => {
                  if (a[0] === 'no-week') return 1;
                  if (b[0] === 'no-week') return -1;
                  const aNum = parseInt(a[0].split('-')[1]);
                  const bNum = parseInt(b[0].split('-')[1]);
                  return aNum - bNum;
                });
                
                return sortedWeeks.map(([weekKey, weekModules]) => (
                  <div key={weekKey}>
                    {/* Week Header */}
                    {weekKey !== 'no-week' && (
                      <div className="bg-[#7e5b3f] text-white px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">
                            الأسبوع {weekModules[0]?.weekNumber}
                          </span>
                          {weekModules[0]?.startDate && (
                            <span className="text-sm text-[#c19170]">
                              يبدأ: {new Date(weekModules[0].startDate).toLocaleDateString('ar-EG')}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-[#c19170]">
                          {weekModules.length} محتوى
                        </span>
                      </div>
                    )}
                    
                    {/* Week Modules */}
                    {weekModules.map((module) => (
                <div
                  key={module.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div
                        className={`p-3 rounded-lg ${
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {module.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              module.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {module.isPublished ? "منشور" : "مسودة"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {module.type === "VIDEO"
                              ? "فيديو"
                              : module.type === "PDF"
                              ? "PDF"
                              : module.type === "DOCUMENT"
                              ? "مستند"
                              : "صورة"}
                          </span>
                        </div>

                        {module.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {module.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <File className="w-4 h-4" />
                            {formatFileSize(module.fileSize)}
                          </span>
                          {module.duration && (
                            <span className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              {formatDuration(module.duration)}
                            </span>
                          )}
                          <span>المسار: {module.track?.name}</span>
                          {module.session && (
                            <span>الجلسة: {module.session.title}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <a
                        href={module.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="عرض الملف"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            // Fetch ALL modules for this track (including future weeks) for editing
                            const trackId = module.trackId;
                            const response = await fetch(`/api/modules?trackId=${trackId}`);
                            if (!response.ok) throw new Error("Failed to fetch modules");
                            
                            const data = await response.json();
                            const allModules = data.modules || data; // Handle both {modules: []} and [] formats
                            
                            if (!Array.isArray(allModules)) {
                              console.error("Invalid response format:", data);
                              throw new Error("Invalid modules data format");
                            }
                            
                            // Group modules by weekNumber
                            const weekMap = new Map<number, any>();
                            
                            for (const mod of allModules) {
                              const weekNum = mod.weekNumber || 0;
                              
                              if (!weekMap.has(weekNum)) {
                                weekMap.set(weekNum, {
                                  id: crypto.randomUUID(),
                                  weekNumber: weekNum,
                                  startDate: mod.startDate ? mod.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
                                  instructorTitle: mod.title || "",
                                  instructorDescription: mod.description || "",
                                  instructorContent: [],
                                  studentTitle: mod.title || "",
                                  studentDescription: mod.description || "",
                                  studentContent: [],
                                  tasks: [],
                                  assignments: [],
                                });
                              }
                              
                              const week = weekMap.get(weekNum);
                              
                              // Fetch full module data for content items
                              const modResponse = await fetch(`/api/modules/${mod.id}`);
                              if (modResponse.ok) {
                                const { module: fullModule } = await modResponse.json();
                                
                                console.log("Full module data:", fullModule);
                                console.log("Content items:", fullModule.contentItems);
                                
                                // Log each content item's targetAudience
                                fullModule.contentItems?.forEach((item: any, index: number) => {
                                  console.log(`Content item ${index}:`, {
                                    fileName: item.fileName,
                                    targetAudience: item.targetAudience,
                                    hasTargetAudience: 'targetAudience' in item
                                  });
                                });
                                
                                // Update titles and descriptions from the module
                                if (!week.instructorTitle) week.instructorTitle = fullModule.title;
                                if (!week.instructorDescription) week.instructorDescription = fullModule.description || "";
                                if (!week.studentTitle) week.studentTitle = fullModule.title;
                                if (!week.studentDescription) week.studentDescription = fullModule.description || "";
                                
                                // Process content items - check EACH item's targetAudience from the API
                                if (fullModule.contentItems && fullModule.contentItems.length > 0) {
                                  for (const item of fullModule.contentItems) {
                                    const contentItem = {
                                      id: item.id,
                                      type: item.type,
                                      file: null,
                                      fileName: item.fileName,
                                      order: item.order,
                                      existingFileUrl: item.fileUrl,
                                    };
                                    
                                    // Add to the correct tab based on the item's targetAudience
                                    if (item.targetAudience === "instructor") {
                                      week.instructorContent.push(contentItem);
                                      console.log("Added to instructor:", item.fileName);
                                    } else if (item.targetAudience === "student") {
                                      week.studentContent.push(contentItem);
                                      console.log("Added to student:", item.fileName);
                                    } else {
                                      // If no targetAudience, add to both (backward compatibility)
                                      week.instructorContent.push({...contentItem});
                                      week.studentContent.push({...contentItem});
                                      console.log("Added to both (no targetAudience):", item.fileName);
                                    }
                                  }
                                }
                                
                                console.log("Week after adding content:", week);
                                
                                // Add tasks (ensure they have all required fields)
                                if (fullModule.tasks?.length > 0) {
                                  const validTasks = fullModule.tasks.map((task: any) => ({
                                    id: task.id,
                                    title: task.title || "",
                                    description: task.description || "",
                                    order: task.order || 0,
                                  }));
                                  week.tasks.push(...validTasks);
                                }
                                
                                // Add assignments
                                if (fullModule.assignments?.length > 0) {
                                  const transformedAssignments = fullModule.assignments.map((assignment: any) => ({
                                    id: assignment.id,
                                    title: assignment.title,
                                    description: assignment.description || "",
                                    dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : "",
                                    file: null,
                                    fileName: assignment.fileUrl ? assignment.fileUrl.split('/').pop() : "",
                                    order: assignment.order,
                                    existingFileUrl: assignment.fileUrl || undefined,
                                  }));
                                  week.assignments.push(...transformedAssignments);
                                }
                              }
                            }
                            
                            // Convert map to array and sort by week number
                            const weeks = Array.from(weekMap.values()).sort((a, b) => a.weekNumber - b.weekNumber);
                            
                            setEditingModuleData({
                              trackId,
                              weeks,
                            });
                            
                            setEditingModuleId(module.id);
                            setShowUploadModal(true);
                          } catch (error) {
                            console.error("Error fetching modules:", error);
                            alert("فشل تحميل بيانات المحتوى");
                          }
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="تعديل جميع الأسابيع"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(module.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title={module.isPublished ? "إخفاء" : "نشر"}
                      >
                        {module.isPublished ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                  </div>
                ));
              })()
            )}
          </div>
        </div>

        {/* Multi-Content Upload Modal */}
        {showUploadModal && (
          <MultiContentUpload
            tracks={tracks}
            selectedTrackId={selectedTrack}
            initialData={editingModuleData}
            onSave={async (data) => {
              try {
                // Create modules for each week
                for (const week of data.weeks) {
                  // Validate week has content
                  if (!week.instructorTitle || !week.instructorDescription) {
                    alert(`الأسبوع ${week.weekNumber}: العنوان والوصف مطلوبان`);
                    return;
                  }

                  const moduleFormData = new FormData();
                  moduleFormData.append("title", week.instructorTitle);
                  moduleFormData.append("description", week.instructorDescription);
                  moduleFormData.append("trackId", data.trackId);
                  moduleFormData.append("weekNumber", week.weekNumber.toString());
                  moduleFormData.append("startDate", week.startDate);
                  moduleFormData.append("category", "LECTURE");
                  moduleFormData.append("isPublished", "true");

                  const moduleResponse = await fetch("/api/modules", {
                    method: "POST",
                    body: moduleFormData,
                  });

                  if (!moduleResponse.ok) {
                    const errorText = await moduleResponse.text();
                    console.error(`Module creation failed for week ${week.weekNumber}:`, errorText);
                    throw new Error(`فشل إنشاء الأسبوع ${week.weekNumber}`);
                  }

                  const moduleResult = await moduleResponse.json();
                  const moduleId = moduleResult.module?.id;

                  if (!moduleId) {
                    throw new Error("Module ID not returned");
                  }

                  // Upload instructor content items
                  for (const item of week.instructorContent) {
                    if (!item.file) continue;
                    
                    const formData = new FormData();
                    formData.append("file", item.file);
                    formData.append("type", item.type);
                    formData.append("order", item.order.toString());
                    formData.append("targetAudience", "instructor");
                    
                    const contentResponse = await fetch(`/api/modules/${moduleId}/content`, {
                      method: "POST",
                      body: formData,
                    });

                    if (!contentResponse.ok) {
                      console.error("Content upload failed:", await contentResponse.text());
                    }
                  }

                  // Upload student content items
                  for (const item of week.studentContent) {
                    if (!item.file) continue;
                    
                    const formData = new FormData();
                    formData.append("file", item.file);
                    formData.append("type", item.type);
                    formData.append("order", item.order.toString());
                    formData.append("targetAudience", "student");
                    
                    const contentResponse = await fetch(`/api/modules/${moduleId}/content`, {
                      method: "POST",
                      body: formData,
                    });

                    if (!contentResponse.ok) {
                      console.error("Content upload failed:", await contentResponse.text());
                    }
                  }
                  
                  // Add tasks
                  for (const task of week.tasks) {
                    // Skip tasks without title or description
                    if (!task.title || !task.description) {
                      console.warn("Skipping task without title/description");
                      continue;
                    }

                    const taskResponse = await fetch(`/api/modules/${moduleId}/tasks`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: task.title,
                        description: task.description,
                        order: task.order,
                      }),
                    });

                    if (!taskResponse.ok) {
                      console.error("Task creation failed:", await taskResponse.text());
                    }
                  }
                  
                  // Add assignments
                  console.log("Processing assignments for week", week.weekNumber, ":", week.assignments);
                  for (const assignment of week.assignments) {
                    console.log("Processing assignment:", assignment);
                    
                    // Skip assignments without required fields
                    if (!assignment.title || !assignment.description || !assignment.dueDate) {
                      console.warn("Skipping assignment without required fields:", {
                        title: assignment.title,
                        description: assignment.description,
                        dueDate: assignment.dueDate,
                        hasFile: !!assignment.file
                      });
                      continue;
                    }

                    // Validate file type if file is present
                    if (assignment.file) {
                      const allowedTypes = [
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/msword',
                        'application/zip',
                        'application/x-zip-compressed'
                      ];
                      
                      if (!allowedTypes.includes(assignment.file.type)) {
                        alert(`الأسبوع ${week.weekNumber} - التكليف "${assignment.title}": نوع الملف غير مدعوم. الرجاء استخدام PDF أو Word أو ZIP فقط.`);
                        continue;
                      }
                    }

                    const assignFormData = new FormData();
                    assignFormData.append("title", assignment.title);
                    assignFormData.append("description", assignment.description);
                    assignFormData.append("dueDate", assignment.dueDate);
                    assignFormData.append("maxGrade", "100");
                    assignFormData.append("order", assignment.order.toString());
                    if (assignment.file) {
                      assignFormData.append("file", assignment.file);
                    }
                    
                    const assignResponse = await fetch(`/api/modules/${moduleId}/assignments`, {
                      method: "POST",
                      body: assignFormData,
                    });

                    if (!assignResponse.ok) {
                      const errorText = await assignResponse.text();
                      console.error("Assignment creation failed:", errorText);
                      try {
                        const errorJson = JSON.parse(errorText);
                        alert(`فشل إنشاء التكليف "${assignment.title}": ${errorJson.error}`);
                      } catch {
                        alert(`فشل إنشاء التكليف "${assignment.title}": خطأ غير معروف`);
                      }
                    }
                  }
                }

                setShowUploadModal(false);
                setEditingModuleId(null);
                setEditingModuleData(null);
                fetchModules(getCurrentFilters());
                alert(`تم رفع ${data.weeks.length} أسبوع بنجاح!`);
              } catch (error) {
                console.error("Error uploading content:", error);
                alert(`حدث خطأ أثناء رفع المحتوى: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
              }
            }}
            onCancel={() => {
              setShowUploadModal(false);
              setEditingModuleId(null);
              setEditingModuleData(null);
            }}
          />
        )}

        {/* OLD SINGLE-FILE UPLOAD MODAL - KEEPING FOR REFERENCE, REMOVE AFTER TESTING */}
        {false && showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingModuleId ? "تعديل المحتوى" : "رفع محتوى تعليمي جديد"}
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setEditingModuleId(null);
                    setUploadForm({
                      title: "",
                      description: "",
                      type: "VIDEO",
                      category: "LECTURE",
                      trackId: "",
                      isPublished: false,
                      file: null,
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان المحتوى *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: مقدمة في البرمجة"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="وصف مختصر للمحتوى..."
                  />
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع المحتوى *
                    </label>
                    <select
                      required
                      value={uploadForm.type}
                      disabled={editingModuleId !== null}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          type: e.target.value as ModuleType,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="VIDEO">فيديو</option>
                      <option value="PDF">PDF</option>
                      <option value="DOCUMENT">مستند</option>
                      <option value="IMAGE">صورة</option>
                    </select>
                    {editingModuleId && (
                      <p className="text-sm text-gray-500 mt-1">
                        لا يمكن تغيير نوع المحتوى
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التصنيف
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          category: e.target.value as ModuleCategory,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="LECTURE">محاضرة</option>
                      <option value="TUTORIAL">تعليمي</option>
                      <option value="EXERCISE">تمرين</option>
                      <option value="REFERENCE">مرجع</option>
                      <option value="SLIDES">شرائح</option>
                      <option value="HANDOUT">ملخص</option>
                      <option value="ASSIGNMENT">واجب</option>
                      <option value="SOLUTION">حل</option>
                      <option value="SUPPLEMENTARY">إضافي</option>
                    </select>
                  </div>
                </div>

                {/* Track Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المسار *
                  </label>
                  <select
                    required
                    value={uploadForm.trackId}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, trackId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر المسار</option>
                    {grades.map((grade) => (
                      <optgroup key={grade.id} label={grade.name}>
                        {tracks
                          .filter((t) => t.gradeId === grade.id)
                          .map((track) => (
                            <option key={track.id} value={track.id}>
                              {track.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingModuleId ? "استبدال الملف (اختياري)" : "الملف *"}
                  </label>
                  <input
                    type="file"
                    required={!editingModuleId}
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editingModuleId && (
                    <p className="text-sm text-blue-600 mt-2">
                      💡 اختر ملفاً جديداً لاستبدال الملف الحالي، أو اتركه فارغاً للاحتفاظ بالملف الموجود
                    </p>
                  )}
                  {uploadForm.file && (
                    <p className="text-sm text-gray-600 mt-2">
                      الملف الجديد: {uploadForm.file?.name} (
                      {formatFileSize(uploadForm.file?.size ?? 0)})
                    </p>
                  )}
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={uploadForm.isPublished}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, isPublished: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                    نشر للطلاب مباشرة
                  </label>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      جاري الرفع... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setEditingModuleId(null);
                      setUploadForm({
                        title: "",
                        description: "",
                        type: "VIDEO",
                        category: "LECTURE",
                        trackId: "",
                        isPublished: false,
                        file: null,
                      });
                    }}
                    disabled={uploading}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {editingModuleId ? "جاري التحديث..." : "جاري الرفع..."}
                      </>
                    ) : (
                      <>
                        {editingModuleId ? (
                          <>
                            <Edit className="w-5 h-5" />
                            حفظ التعديلات
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            رفع المحتوى
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
