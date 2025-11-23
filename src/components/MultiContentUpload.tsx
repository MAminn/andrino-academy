/**
 * MultiContentUpload Component - Weekly Sessions
 * Andrino Academy - Upload Multiple Weeks of Content
 *
 * Features:
 * - Unlimited weekly sessions with custom start dates
 * - Accordion UI for managing multiple weeks
 * - Each week: separate instructor/student content
 * - Dynamic content items, tasks, assignments per week
 * - Live editing - changes reflect immediately
 */

"use client";

import { useState } from "react";
import { 
  Upload, Video, FileText, File as FileIcon, Image as ImageIcon, 
  Plus, X, GripVertical, BookOpen, FileUp, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Calendar, Trash2
} from "lucide-react";

// Types
type ContentType = "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE";
type TargetAudience = "instructor" | "student";

interface ContentItem {
  id: string;
  type: ContentType;
  file: File | null;
  fileName: string;
  order: number;
  existingFileUrl?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  file: File | null;
  fileName: string;
  order: number;
  existingFileUrl?: string;
}

export interface WeekData {
  id: string;
  weekNumber: number;
  startDate: string; // ISO date string
  instructorTitle: string;
  instructorDescription: string;
  instructorContent: ContentItem[];
  studentTitle: string;
  studentDescription: string;
  studentContent: ContentItem[];
  tasks: Task[];
  assignments: Assignment[];
}

interface Track {
  id: string;
  name: string;
  gradeId: string;
}

interface MultiContentUploadProps {
  tracks: Track[];
  selectedTrackId?: string;
  onSave: (data: { trackId: string; weeks: WeekData[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    trackId?: string;
    weeks?: WeekData[];
  };
}

const CONTENT_TYPES: { value: ContentType; label: string; icon: typeof Video; maxSize: number }[] = [
  { value: "VIDEO", label: "فيديو", icon: Video, maxSize: 500 * 1024 * 1024 },
  { value: "PDF", label: "PDF", icon: FileText, maxSize: 50 * 1024 * 1024 },
  { value: "DOCUMENT", label: "مستند", icon: FileIcon, maxSize: 50 * 1024 * 1024 },
  { value: "IMAGE", label: "صورة", icon: ImageIcon, maxSize: 10 * 1024 * 1024 },
];

const MIME_TYPES: Record<ContentType, string[]> = {
  VIDEO: ["video/mp4", "video/webm", "video/ogg"],
  PDF: ["application/pdf"],
  DOCUMENT: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

export default function MultiContentUpload({
  tracks,
  selectedTrackId,
  onSave,
  onCancel,
  initialData,
}: MultiContentUploadProps) {
  const [trackId, setTrackId] = useState(selectedTrackId || initialData?.trackId || "");
  const [weeks, setWeeks] = useState<WeekData[]>(initialData?.weeks || []);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, TargetAudience>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add new week
  const addWeek = () => {
    const newWeek: WeekData = {
      id: generateId(),
      weekNumber: weeks.length + 1,
      startDate: "",
      instructorTitle: "",
      instructorDescription: "",
      instructorContent: [],
      studentTitle: "",
      studentDescription: "",
      studentContent: [],
      tasks: [],
      assignments: [],
    };
    setWeeks([...weeks, newWeek]);
    setExpandedWeek(newWeek.id);
    setActiveTab({ ...activeTab, [newWeek.id]: "instructor" });
  };

  // Remove week
  const removeWeek = (weekId: string) => {
    setWeeks(weeks.filter(w => w.id !== weekId).map((w, idx) => ({ ...w, weekNumber: idx + 1 })));
  };

  // Update week field
  const updateWeek = (weekId: string, field: keyof WeekData, value: any) => {
    setWeeks(weeks.map(w => w.id === weekId ? { ...w, [field]: value } : w));
  };

  // Add content item to week
  const addContentItem = (weekId: string, targetAudience: TargetAudience) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    const contentArray = targetAudience === "instructor" ? week.instructorContent : week.studentContent;
    const newItem: ContentItem = {
      id: generateId(),
      type: "PDF",
      file: null,
      fileName: "",
      order: contentArray.length,
    };

    if (targetAudience === "instructor") {
      updateWeek(weekId, "instructorContent", [...week.instructorContent, newItem]);
    } else {
      updateWeek(weekId, "studentContent", [...week.studentContent, newItem]);
    }
  };

  // Remove content item
  const removeContentItem = (weekId: string, targetAudience: TargetAudience, itemId: string) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    if (targetAudience === "instructor") {
      updateWeek(weekId, "instructorContent", week.instructorContent.filter(i => i.id !== itemId));
    } else {
      updateWeek(weekId, "studentContent", week.studentContent.filter(i => i.id !== itemId));
    }
  };

  // Update content item
  const updateContentItem = (weekId: string, targetAudience: TargetAudience, itemId: string, updates: Partial<ContentItem>) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    if (targetAudience === "instructor") {
      updateWeek(weekId, "instructorContent", week.instructorContent.map(i => i.id === itemId ? { ...i, ...updates } : i));
    } else {
      updateWeek(weekId, "studentContent", week.studentContent.map(i => i.id === itemId ? { ...i, ...updates } : i));
    }
  };

  // Handle file selection
  const handleFileSelect = (weekId: string, targetAudience: TargetAudience, itemId: string, file: File | null, type: ContentType) => {
    if (!file) return;

    if (!MIME_TYPES[type].includes(file.type)) {
      setError(`نوع الملف غير صحيح`);
      return;
    }

    const maxSize = CONTENT_TYPES.find((t) => t.value === type)?.maxSize || 0;
    if (file.size > maxSize) {
      setError(`حجم الملف كبير جداً. الحد الأقصى: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    updateContentItem(weekId, targetAudience, itemId, { file, fileName: file.name });
    setError(null);
  };

  // Add task
  const addTask = (weekId: string) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    const newTask: Task = {
      id: generateId(),
      title: "",
      description: "",
      order: week.tasks.length,
    };
    updateWeek(weekId, "tasks", [...week.tasks, newTask]);
  };

  // Remove task
  const removeTask = (weekId: string, taskId: string) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    updateWeek(weekId, "tasks", week.tasks.filter(t => t.id !== taskId));
  };

  // Update task
  const updateTask = (weekId: string, taskId: string, updates: Partial<Task>) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    updateWeek(weekId, "tasks", week.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  // Add assignment
  const addAssignment = (weekId: string) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    const newAssignment: Assignment = {
      id: generateId(),
      title: "",
      description: "",
      dueDate: "",
      file: null,
      fileName: "",
      order: week.assignments.length,
    };
    updateWeek(weekId, "assignments", [...week.assignments, newAssignment]);
  };

  // Remove assignment
  const removeAssignment = (weekId: string, assignmentId: string) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    updateWeek(weekId, "assignments", week.assignments.filter(a => a.id !== assignmentId));
  };

  // Update assignment
  const updateAssignment = (weekId: string, assignmentId: string, updates: Partial<Assignment>) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    updateWeek(weekId, "assignments", week.assignments.map(a => a.id === assignmentId ? { ...a, ...updates } : a));
  };

  // Handle assignment file
  const handleAssignmentFile = (weekId: string, assignmentId: string, file: File | null) => {
    if (!file) return;
    updateAssignment(weekId, assignmentId, { file, fileName: file.name });
  };

  // Validation
  const validate = (): boolean => {
    if (!trackId) {
      setError("الرجاء اختيار المسار");
      return false;
    }

    if (weeks.length === 0) {
      setError("الرجاء إضافة أسبوع واحد على الأقل");
      return false;
    }

    for (const week of weeks) {
      if (!week.startDate) {
        setError(`الأسبوع ${week.weekNumber}: الرجاء تحديد تاريخ البدء`);
        return false;
      }

      // Check if at least one content exists
      if (week.instructorContent.length === 0 && week.studentContent.length === 0) {
        setError(`الأسبوع ${week.weekNumber}: الرجاء إضافة محتوى للمدرسين أو الطلاب`);
        return false;
      }

      // Validate instructor content if exists
      if (week.instructorContent.length > 0) {
        if (!week.instructorTitle.trim()) {
          setError(`الأسبوع ${week.weekNumber}: الرجاء إدخال عنوان محتوى المدرسين`);
          return false;
        }
        for (const item of week.instructorContent) {
          if (!item.file && !item.existingFileUrl) {
            setError(`الأسبوع ${week.weekNumber}: الرجاء رفع جميع ملفات المدرسين`);
            return false;
          }
        }
      }

      // Validate student content if exists
      if (week.studentContent.length > 0) {
        if (!week.studentTitle.trim()) {
          setError(`الأسبوع ${week.weekNumber}: الرجاء إدخال عنوان محتوى الطلاب`);
          return false;
        }
        for (const item of week.studentContent) {
          if (!item.file && !item.existingFileUrl) {
            setError(`الأسبوع ${week.weekNumber}: الرجاء رفع جميع ملفات الطلاب`);
            return false;
          }
        }
      }
    }

    return true;
  };

  // Save handler
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({ trackId, weeks });
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: ContentType) => {
    return CONTENT_TYPES.find(t => t.value === type)?.icon || FileIcon;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            رفع محتوى أسبوعي متعدد
          </h2>
          <p className="text-gray-600 mt-1">
            قم بإضافة محتوى لعدة أسابيع مع تحديد تواريخ البدء
          </p>
        </div>

        {/* Track Selection */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المسار *
          </label>
          <select
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
          >
            <option value="">اختر المسار</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Weeks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {weeks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">لا توجد أسابيع</p>
              <p className="text-gray-500 text-sm">اضغط "إضافة أسبوع" للبدء</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeks.map((week) => (
                <WeekSection
                  key={week.id}
                  week={week}
                  isExpanded={expandedWeek === week.id}
                  activeTab={activeTab[week.id] || "instructor"}
                  onToggleExpand={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                  onSetActiveTab={(tab) => setActiveTab({ ...activeTab, [week.id]: tab })}
                  onUpdateWeek={(field, value) => updateWeek(week.id, field, value)}
                  onAddContent={(audience) => addContentItem(week.id, audience)}
                  onRemoveContent={(audience, itemId) => removeContentItem(week.id, audience, itemId)}
                  onUpdateContent={(audience, itemId, updates) => updateContentItem(week.id, audience, itemId, updates)}
                  onHandleFileSelect={(audience, itemId, file, type) => handleFileSelect(week.id, audience, itemId, file, type)}
                  onAddTask={() => addTask(week.id)}
                  onRemoveTask={(taskId) => removeTask(week.id, taskId)}
                  onUpdateTask={(taskId, updates) => updateTask(week.id, taskId, updates)}
                  onAddAssignment={() => addAssignment(week.id)}
                  onRemoveAssignment={(assignmentId) => removeAssignment(week.id, assignmentId)}
                  onUpdateAssignment={(assignmentId, updates) => updateAssignment(week.id, assignmentId, updates)}
                  onHandleAssignmentFile={(assignmentId, file) => handleAssignmentFile(week.id, assignmentId, file)}
                  onRemoveWeek={() => removeWeek(week.id)}
                  getIcon={getIcon}
                  mimeTypes={MIME_TYPES}
                />
              ))}
            </div>
          )}

          {/* Add Week Button */}
          <button
            onClick={addWeek}
            className="mt-4 w-full px-4 py-3 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            إضافة أسبوع {weeks.length > 0 && `(${weeks.length + 1})`}
          </button>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#7e5b3f] text-white rounded-lg hover:bg-[#6a4d35] transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                حفظ جميع الأسابيع
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Week Section Component
function WeekSection({
  week,
  isExpanded,
  activeTab,
  onToggleExpand,
  onSetActiveTab,
  onUpdateWeek,
  onAddContent,
  onRemoveContent,
  onUpdateContent,
  onHandleFileSelect,
  onAddTask,
  onRemoveTask,
  onUpdateTask,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateAssignment,
  onHandleAssignmentFile,
  onRemoveWeek,
  getIcon,
  mimeTypes,
}: {
  week: WeekData;
  isExpanded: boolean;
  activeTab: TargetAudience;
  onToggleExpand: () => void;
  onSetActiveTab: (tab: TargetAudience) => void;
  onUpdateWeek: (field: keyof WeekData, value: any) => void;
  onAddContent: (audience: TargetAudience) => void;
  onRemoveContent: (audience: TargetAudience, itemId: string) => void;
  onUpdateContent: (audience: TargetAudience, itemId: string, updates: Partial<ContentItem>) => void;
  onHandleFileSelect: (audience: TargetAudience, itemId: string, file: File | null, type: ContentType) => void;
  onAddTask: () => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddAssignment: () => void;
  onRemoveAssignment: (assignmentId: string) => void;
  onUpdateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  onHandleAssignmentFile: (assignmentId: string, file: File | null) => void;
  onRemoveWeek: () => void;
  getIcon: (type: ContentType) => typeof Video;
  mimeTypes: Record<ContentType, string[]>;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Week Header */}
      <div 
        className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#7e5b3f]" />
          <div>
            <h3 className="font-semibold text-gray-900">
              الأسبوع {week.weekNumber}
            </h3>
            {week.startDate && (
              <p className="text-sm text-gray-600">
                يبدأ: {new Date(week.startDate).toLocaleDateString('ar-EG')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveWeek();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Week Content - Only shown when expanded */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ بدء الأسبوع *
            </label>
            <input
              type="date"
              value={week.startDate}
              onChange={(e) => onUpdateWeek("startDate", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => onSetActiveTab("instructor")}
              className={`flex-1 px-6 py-3 text-center font-semibold transition-colors ${
                activeTab === "instructor"
                  ? "text-[#7e5b3f] border-b-2 border-[#7e5b3f]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              محتوى المدرسين
            </button>
            <button
              onClick={() => onSetActiveTab("student")}
              className={`flex-1 px-6 py-3 text-center font-semibold transition-colors ${
                activeTab === "student"
                  ? "text-[#7e5b3f] border-b-2 border-[#7e5b3f]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              محتوى الطلاب
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "instructor" && (
            <InstructorTab
              week={week}
              onUpdateWeek={onUpdateWeek}
              onAddContent={() => onAddContent("instructor")}
              onRemoveContent={(itemId) => onRemoveContent("instructor", itemId)}
              onUpdateContent={(itemId, updates) => onUpdateContent("instructor", itemId, updates)}
              onHandleFileSelect={(itemId, file, type) => onHandleFileSelect("instructor", itemId, file, type)}
              getIcon={getIcon}
              mimeTypes={mimeTypes}
            />
          )}

          {activeTab === "student" && (
            <StudentTab
              week={week}
              onUpdateWeek={onUpdateWeek}
              onAddContent={() => onAddContent("student")}
              onRemoveContent={(itemId) => onRemoveContent("student", itemId)}
              onUpdateContent={(itemId, updates) => onUpdateContent("student", itemId, updates)}
              onHandleFileSelect={(itemId, file, type) => onHandleFileSelect("student", itemId, file, type)}
              onAddTask={onAddTask}
              onRemoveTask={onRemoveTask}
              onUpdateTask={onUpdateTask}
              onAddAssignment={onAddAssignment}
              onRemoveAssignment={onRemoveAssignment}
              onUpdateAssignment={onUpdateAssignment}
              onHandleAssignmentFile={onHandleAssignmentFile}
              getIcon={getIcon}
              mimeTypes={mimeTypes}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Instructor Tab Component
function InstructorTab({
  week,
  onUpdateWeek,
  onAddContent,
  onRemoveContent,
  onUpdateContent,
  onHandleFileSelect,
  getIcon,
  mimeTypes,
}: {
  week: WeekData;
  onUpdateWeek: (field: keyof WeekData, value: any) => void;
  onAddContent: () => void;
  onRemoveContent: (itemId: string) => void;
  onUpdateContent: (itemId: string, updates: Partial<ContentItem>) => void;
  onHandleFileSelect: (itemId: string, file: File | null, type: ContentType) => void;
  getIcon: (type: ContentType) => typeof Video;
  mimeTypes: Record<ContentType, string[]>;
}) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان محتوى المدرسين *
        </label>
        <input
          type="text"
          value={week.instructorTitle}
          onChange={(e) => onUpdateWeek("instructorTitle", e.target.value)}
          placeholder="مثال: مقدمة في البرمجة"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الوصف
        </label>
        <textarea
          value={week.instructorDescription}
          onChange={(e) => onUpdateWeek("instructorDescription", e.target.value)}
          placeholder="وصف مختصر للمحتوى..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
        />
      </div>

      {/* Content Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">عناصر المحتوى</h4>
          <button
            onClick={onAddContent}
            className="px-3 py-1 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة عنصر
          </button>
        </div>

        {week.instructorContent.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">لا توجد عناصر</p>
          </div>
        ) : (
          <div className="space-y-3">
            {week.instructorContent.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.type}
                      onChange={(e) => onUpdateContent(item.id, { type: e.target.value as ContentType })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                    >
                      {CONTENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex-1 space-y-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {item.file ? item.file.name : (item.fileName || "اختر ملف...")}
                        </span>
                        <input
                          type="file"
                          onChange={(e) => onHandleFileSelect(item.id, e.target.files?.[0] || null, item.type)}
                          accept={mimeTypes[item.type].join(",")}
                          className="hidden"
                        />
                      </label>
                      {item.existingFileUrl && !item.file && (
                        <a
                          href={item.existingFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FileIcon className="h-3 w-3" />
                          <span>معاينة الملف الحالي: {item.fileName}</span>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveContent(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Student Tab Component (similar structure, includes tasks and assignments)
function StudentTab({
  week,
  onUpdateWeek,
  onAddContent,
  onRemoveContent,
  onUpdateContent,
  onHandleFileSelect,
  onAddTask,
  onRemoveTask,
  onUpdateTask,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateAssignment,
  onHandleAssignmentFile,
  getIcon,
  mimeTypes,
}: {
  week: WeekData;
  onUpdateWeek: (field: keyof WeekData, value: any) => void;
  onAddContent: () => void;
  onRemoveContent: (itemId: string) => void;
  onUpdateContent: (itemId: string, updates: Partial<ContentItem>) => void;
  onHandleFileSelect: (itemId: string, file: File | null, type: ContentType) => void;
  onAddTask: () => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddAssignment: () => void;
  onRemoveAssignment: (assignmentId: string) => void;
  onUpdateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  onHandleAssignmentFile: (assignmentId: string, file: File | null) => void;
  getIcon: (type: ContentType) => typeof Video;
  mimeTypes: Record<ContentType, string[]>;
}) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان محتوى الطلاب *
        </label>
        <input
          type="text"
          value={week.studentTitle}
          onChange={(e) => onUpdateWeek("studentTitle", e.target.value)}
          placeholder="مثال: الدرس 1 - المتغيرات"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الوصف
        </label>
        <textarea
          value={week.studentDescription}
          onChange={(e) => onUpdateWeek("studentDescription", e.target.value)}
          placeholder="وصف مختصر للمحتوى..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
        />
      </div>

      {/* Content Items - Same as InstructorTab */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">عناصر المحتوى</h4>
          <button
            onClick={onAddContent}
            className="px-3 py-1 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة عنصر
          </button>
        </div>

        {week.studentContent.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">لا توجد عناصر</p>
          </div>
        ) : (
          <div className="space-y-3">
            {week.studentContent.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.type}
                      onChange={(e) => onUpdateContent(item.id, { type: e.target.value as ContentType })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                    >
                      {CONTENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex-1 space-y-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {item.file ? item.file.name : (item.fileName || "اختر ملف...")}
                        </span>
                        <input
                          type="file"
                          onChange={(e) => onHandleFileSelect(item.id, e.target.files?.[0] || null, item.type)}
                          accept={mimeTypes[item.type].join(",")}
                          className="hidden"
                        />
                      </label>
                      {item.existingFileUrl && !item.file && (
                        <a
                          href={item.existingFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FileIcon className="h-3 w-3" />
                          <span>معاينة الملف الحالي: {item.fileName}</span>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveContent(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            المهام (نصية)
          </h4>
          <button
            onClick={onAddTask}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة مهمة
          </button>
        </div>

        {week.tasks.map((task) => (
          <div key={task.id} className="border border-gray-200 rounded-lg p-3 space-y-2 mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                  placeholder="عنوان المهمة"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                />
                <textarea
                  value={task.description}
                  onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
                  placeholder="وصف المهمة"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                />
              </div>
              <button
                onClick={() => onRemoveTask(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignments Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            التكليفات (رفع ملفات)
          </h4>
          <button
            onClick={onAddAssignment}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة تكليف
          </button>
        </div>

        {week.assignments.map((assignment) => (
          <div key={assignment.id} className="border border-gray-200 rounded-lg p-3 space-y-2 mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={assignment.title}
                  onChange={(e) => onUpdateAssignment(assignment.id, { title: e.target.value })}
                  placeholder="عنوان التكليف"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                />
                <textarea
                  value={assignment.description}
                  onChange={(e) => onUpdateAssignment(assignment.id, { description: e.target.value })}
                  placeholder="وصف التكليف"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                />
                <input
                  type="date"
                  value={assignment.dueDate}
                  onChange={(e) => onUpdateAssignment(assignment.id, { dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <FileUp className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {assignment.file ? assignment.file.name : (assignment.fileName || "ملف مرجعي (PDF, Word, ZIP)")}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip"
                      onChange={(e) => onHandleAssignmentFile(assignment.id, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {assignment.existingFileUrl && !assignment.file && (
                    <a
                      href={assignment.existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      <FileIcon className="h-3 w-3" />
                      <span>معاينة الملف الحالي: {assignment.fileName}</span>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveAssignment(assignment.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
