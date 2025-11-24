/**
 * ContentViewer Component
 * Andrino Academy - Display Module Content Items
 *
 * Features:
 * - Display content items by type (VIDEO/PDF/DOCUMENT/IMAGE)
 * - Separate tabs for instructor/student content
 * - Display tasks and assignments
 * - Download/view actions
 * - Responsive layout
 */

"use client";

import { useState } from "react";
import { 
  Video, FileText, File as FileIcon, Image as ImageIcon, 
  Download, Eye, BookOpen, FileUp, Calendar, CheckCircle 
} from "lucide-react";

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
  title: string;
  description: string | null;
  dueDate: Date | null;
  fileUrl: string | null;
  fileName: string | null;
  order: number;
}

interface ContentViewerProps {
  moduleId: string;
  moduleName: string;
  instructorContent: ContentItem[];
  studentContent: ContentItem[];
  tasks: Task[];
  assignments: Assignment[];
  userRole: "STUDENT" | "INSTRUCTOR" | "MANAGER" | "CEO" | "COORDINATOR";
}

export default function ContentViewer({
  moduleId,
  moduleName,
  instructorContent,
  studentContent,
  tasks,
  assignments,
  userRole,
}: ContentViewerProps) {
  const [activeTab, setActiveTab] = useState<"instructor" | "student">(
    userRole === "STUDENT" ? "student" : "instructor"
  );

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

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const activeContent = activeTab === "instructor" ? instructorContent : studentContent;
  const showInstructorTab = userRole !== "STUDENT";

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">{moduleName}</h2>
        <p className="text-gray-600 mt-1">محتوى الوحدة التعليمية</p>
      </div>

      {/* Tab Navigation (if user is not student or if both tabs have content) */}
      {(showInstructorTab || (studentContent.length > 0 && instructorContent.length > 0)) && (
        <div className="flex border-b border-gray-200">
          {showInstructorTab && (
            <button
              onClick={() => setActiveTab("instructor")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === "instructor"
                  ? "text-[#7e5b3f] border-b-2 border-[#7e5b3f]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              محتوى المدرسين
            </button>
          )}
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === "student"
                ? "text-[#7e5b3f] border-b-2 border-[#7e5b3f]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            محتوى الطلاب
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Content Items */}
        {activeContent.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">الملفات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContent.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#7e5b3f]/10 rounded-lg">
                        <Icon className="h-6 w-6 text-[#7e5b3f]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.fileName}
                        </p>
                        <p className="text-sm text-gray-600">{getTypeLabel(item.type)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {item.type === "VIDEO" || item.type === "PDF" || item.type === "IMAGE" ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          عرض
                        </a>
                      ) : null}
                      <a
                        href={item.fileUrl}
                        download
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        تحميل
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks (Student Tab Only) */}
        {activeTab === "student" && tasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              المهام
            </h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 bg-blue-50/30"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-gray-700 text-sm">{task.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments (Student Tab Only) */}
        {activeTab === "student" && assignments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              التكليفات
            </h3>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-4 bg-green-50/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                    {assignment.dueDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(assignment.dueDate)}
                      </div>
                    )}
                  </div>
                  {assignment.description && (
                    <p className="text-gray-700 text-sm mb-3">{assignment.description}</p>
                  )}
                  {assignment.fileUrl && assignment.fileName && (
                    <a
                      href={assignment.fileUrl}
                      download
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      تحميل المرجع: {assignment.fileName}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeContent.length === 0 && 
         (activeTab === "instructor" || (tasks.length === 0 && assignments.length === 0)) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">لا يوجد محتوى متاح</p>
          </div>
        )}
      </div>
    </div>
  );
}
