"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";

interface SessionControlPanelProps {
  sessionId: string;
  onSessionUpdate?: () => void;
}

interface SessionAction {
  action: string;
  label: string;
  color: string;
}

interface SessionControlData {
  session: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    track: {
      name: string;
      grade: {
        name: string;
      };
    };
  };
  canControl: boolean;
  availableActions: SessionAction[];
  currentStatus: string;
  duration: number | null;
  attendanceStats: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
}

export default function SessionControlPanel({
  sessionId,
  onSessionUpdate
}: SessionControlPanelProps) {
  const [controlData, setControlData] = useState<SessionControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (sessionId) {
      fetchControlData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchControlData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/control/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setControlData(data);
      }
    } catch (error) {
      console.error("Error fetching session control data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      setActionLoading(true);
      setSelectedAction(action);

      const response = await fetch(`/api/sessions/control/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        await fetchControlData(); // Refresh data
        setNotes(""); // Clear notes
        onSessionUpdate?.();
      }
    } catch (error) {
      console.error("Error performing session action:", error);
    } finally {
      setActionLoading(false);
      setSelectedAction("");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "scheduled":
        return { text: "مجدولة", color: "bg-blue-100 text-blue-800", icon: Clock };
      case "in_progress":
        return { text: "جارية", color: "bg-green-100 text-green-800", icon: Play };
      case "paused":
        return { text: "متوقفة مؤقتاً", color: "bg-yellow-100 text-yellow-800", icon: Pause };
      case "completed":
        return { text: "مكتملة", color: "bg-gray-100 text-gray-800", icon: CheckCircle };
      case "cancelled":
        return { text: "ملغية", color: "bg-red-100 text-red-800", icon: X };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    }
  };

  const getActionButtonColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "yellow":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "red":
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "start":
      case "resume":
        return <Play className="w-4 h-4" />;
      case "pause":
        return <Pause className="w-4 h-4" />;
      case "complete":
        return <CheckCircle className="w-4 h-4" />;
      case "cancel":
        return <X className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!controlData) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>خطأ في تحميل بيانات الجلسة</p>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(controlData.currentStatus);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {controlData.session.title}
            </h3>
            <p className="text-sm text-gray-600">
              {controlData.session.track.name} - {controlData.session.track.grade.name}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusDisplay.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{statusDisplay.text}</span>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {new Date(controlData.session.date).toLocaleDateString("ar-SA")}
            </div>
            <div className="text-sm text-gray-600">التاريخ</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {controlData.session.startTime} - {controlData.session.endTime}
            </div>
            <div className="text-sm text-gray-600">الوقت</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {controlData.attendanceStats.total}
            </div>
            <div className="text-sm text-gray-600">إجمالي الطلاب</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {controlData.attendanceStats.present}
            </div>
            <div className="text-sm text-gray-600">حاضرون</div>
          </div>
        </div>

        {/* Duration */}
        {controlData.duration !== null && (
          <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              مدة الجلسة: {formatDuration(controlData.duration)}
            </span>
          </div>
        )}

        {/* Control Actions */}
        {controlData.canControl && controlData.availableActions.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {controlData.availableActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleAction(action.action)}
                  disabled={actionLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${getActionButtonColor(action.color)}`}
                >
                  {actionLoading && selectedAction === action.action ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    getActionIcon(action.action)
                  )}
                  {action.label}
                </button>
              ))}
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات حول الجلسة..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* No Control Message */}
        {!controlData.canControl && (
          <div className="text-center py-4 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>لا يمكنك التحكم في هذه الجلسة</p>
          </div>
        )}

        {/* No Actions Available */}
        {controlData.canControl && controlData.availableActions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p>لا توجد إجراءات متاحة للجلسة في هذه الحالة</p>
          </div>
        )}
      </div>
    </div>
  );
}