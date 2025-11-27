"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Video, X, ExternalLink } from "lucide-react";

interface ActiveSession {
  id: string;
  student?: {
    id: string;
    name: string;
  };
  track: {
    id: string;
    name: string;
    instructor?: {
      name: string;
    };
  };
  availability: {
    weekStartDate: string;
    dayOfWeek: number;
    startHour: number;
    endHour: number;
    instructor?: {
      name: string;
    };
  };
  session?: {
    id: string;
    title: string;
    externalLink?: string;
    status: string;
  };
}

interface ActiveSessionAlertProps {
  role: "instructor" | "student";
}

export default function ActiveSessionAlert({ role }: ActiveSessionAlertProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveSessions = async () => {
      try {
        const response = await fetch("/api/sessions/active");
        if (response.ok) {
          const data = await response.json();
          setActiveSessions(data.activeSessions || []);
        }
      } catch (error) {
        console.error("Error checking active sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    checkActiveSessions();

    // Check every 2 minutes
    const interval = setInterval(checkActiveSessions, 120000);

    return () => clearInterval(interval);
  }, []);

  if (loading || dismissed || activeSessions.length === 0) {
    return null;
  }

  const hasMultipleSessions = activeSessions.length > 1;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-2xl p-6 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                {hasMultipleSessions
                  ? `🔴 لديك ${activeSessions.length} جلسات نشطة الآن!`
                  : "🔴 جلسة نشطة الآن!"}
              </h3>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold">{session.track.name}</p>
                        <p className="text-sm opacity-90">
                          {role === "instructor"
                            ? `الطالب: ${session.student?.name}`
                            : `المدرس: ${session.availability.instructor?.name || session.track.instructor?.name}`}
                        </p>
                        <p className="text-xs opacity-75">
                          {session.availability.startHour}:00 -{" "}
                          {session.availability.endHour}:00
                        </p>
                      </div>
                    </div>

                    {session.session?.externalLink ? (
                      <a
                        href={session.session.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition-colors w-full justify-center"
                      >
                        <Video className="w-5 h-5" />
                        انضم إلى الجلسة
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : role === "instructor" ? (
                      <div className="bg-yellow-400/20 text-yellow-100 px-4 py-2 rounded-lg text-sm text-center">
                        يرجى إضافة رابط الاجتماع من صفحة الحجوزات
                      </div>
                    ) : (
                      <div className="bg-yellow-400/20 text-yellow-100 px-4 py-2 rounded-lg text-sm text-center">
                        في انتظار رابط الاجتماع من المدرس...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
