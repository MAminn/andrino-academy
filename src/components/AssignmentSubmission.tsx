/**
 * AssignmentSubmission Component
 * Andrino Academy - Student Assignment Submission
 *
 * Features:
 * - View assignment details
 * - Upload submission file
 * - View submission status
 * - View grade and feedback (if graded)
 * - Prevent duplicate submissions
 * - File validation
 */

"use client";

import { useState, useEffect } from "react";
import { 
  FileUp, Upload, Download, CheckCircle, Clock, 
  AlertCircle, Calendar, Loader2, Star 
} from "lucide-react";
import { normalizeFileUrl } from "@/lib/fileUtils";

// Types
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

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  grade: number | null;
  feedback: string | null;
  gradedAt: Date | null;
  gradedBy: string | null;
  submittedAt: Date;
  grader?: {
    id: string;
    name: string;
  };
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  studentId: string;
  trackId: string;
  onSubmissionComplete?: () => void;
}

export default function AssignmentSubmission({
  assignment,
  studentId,
  trackId,
  onSubmissionComplete,
}: AssignmentSubmissionProps) {
  // State
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing submission
  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/assignments/${assignment.id}/submissions`);
        if (!response.ok) {
          if (response.status === 404) {
            // No submission yet
            setSubmission(null);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch submission");
        }

        const submissions: AssignmentSubmission[] = await response.json();
        // Find this student's submission
        const studentSubmission = submissions.find(s => s.studentId === studentId);
        setSubmission(studentSubmission || null);
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError("فشل تحميل بيانات التسليم");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [assignment.id, studentId]);

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError("حجم الملف كبير جداً. الحد الأقصى: 20MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("الرجاء اختيار ملف للتسليم");
      return;
    }

    if (submission) {
      setError("لقد قمت بالفعل بتسليم هذا التكليف");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("assignmentId", assignment.id);
      formData.append("file", selectedFile);

      const response = await fetch(`/api/assignments/${assignment.id}/submissions`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignment");
      }

      const newSubmission: AssignmentSubmission = await response.json();
      setSubmission(newSubmission);
      setSelectedFile(null);
      setSuccessMessage("تم تسليم التكليف بنجاح! سيتم تقييمه قريباً");

      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
      setError(err instanceof Error ? err.message : "فشل تسليم التكليف");
    } finally {
      setUploading(false);
    }
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if overdue
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !submission;

  // Get status badge
  const getStatusBadge = () => {
    if (!submission) {
      if (isOverdue) {
        return { text: "متأخر", color: "bg-red-100 text-red-800 border-red-300" };
      }
      return { text: "لم يتم التسليم", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    }

    if (submission.grade !== null) {
      return { text: "تم التقييم", color: "bg-green-100 text-green-800 border-green-300" };
    }

    return { text: "تم التسليم", color: "bg-blue-100 text-blue-800 border-blue-300" };
  };

  const status = getStatusBadge();

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7e5b3f]" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileUp className="h-5 w-5 text-[#7e5b3f]" />
            <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
          </div>
          {assignment.description && (
            <p className="text-gray-700 text-sm mb-3">{assignment.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
        {assignment.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">موعد التسليم</p>
              <p className={`font-semibold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                {formatDate(assignment.dueDate)}
                {isOverdue && " (متأخر)"}
              </p>
            </div>
          </div>
        )}
        {assignment.fileUrl && assignment.fileName && (
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-gray-600" />
            <a
              href={normalizeFileUrl(assignment.fileUrl)}
              download
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              تحميل المرجع: {assignment.fileName}
            </a>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Submission Section */}
      {!submission ? (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">تسليم التكليف</h4>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-gray-300">
              <Upload className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                {selectedFile ? selectedFile.name : "اختر ملف للتسليم..."}
              </span>
              <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || uploading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التسليم...
                </>
              ) : (
                <>
                  <FileUp className="h-5 w-5" />
                  تسليم
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600">الحد الأقصى لحجم الملف: 20MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Submitted File */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              تم التسليم
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>الملف:</strong> {submission.fileName}
              </p>
              <p>
                <strong>تاريخ التسليم:</strong> {formatDate(submission.submittedAt)}
              </p>
              <a
                href={normalizeFileUrl(submission.fileUrl)}
                download
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mt-2"
              >
                <Download className="h-4 w-4" />
                تحميل تسليمي
              </a>
            </div>
          </div>

          {/* Grade Section */}
          {submission.grade !== null ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5" />
                التقييم
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-700">
                      {submission.grade}
                    </div>
                    <div className="text-sm text-green-600">من 100</div>
                  </div>
                  <div className="flex-1">
                    {submission.feedback && (
                      <div>
                        <p className="text-sm font-medium text-green-900 mb-1">ملاحظات المدرس:</p>
                        <p className="text-sm text-green-800">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-green-700">
                  تم التقييم في: {formatDate(submission.gradedAt)}
                  {submission.grader && ` بواسطة ${submission.grader.name}`}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-5 w-5" />
                <p className="text-sm">في انتظار التقييم من المدرس</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
