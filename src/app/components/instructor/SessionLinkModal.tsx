"use client";

import { useState } from "react";
import { X, Link, Save, CheckCircle } from "lucide-react";
import {
  validateExternalMeetingLink,
  PLATFORM_EXAMPLES,
} from "@/lib/sessionValidation";
import { useToast, apiCallWithToast } from "@/components/ui/Toast";

interface SessionLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  currentLink?: string;
  onLinkUpdated: (newLink: string) => void;
}

export default function SessionLinkModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  currentLink = "",
  onLinkUpdated,
}: SessionLinkModalProps) {
  const [link, setLink] = useState(currentLink);
  const [loading, setLoading] = useState(false);
  const [validationInfo, setValidationInfo] = useState<{
    isValid: boolean;
    platform?: string;
    message?: string;
  }>({ isValid: false });

  const toast = useToast();

  if (!isOpen) return null;

  const handleLinkChange = (newLink: string) => {
    setLink(newLink);

    // Real-time validation
    const validation = validateExternalMeetingLink(newLink);
    setValidationInfo({
      isValid: validation.isValid,
      platform: validation.platform,
      message: validation.error,
    });
  };

  const handleSave = async () => {
    const validation = validateExternalMeetingLink(link);

    if (!link.trim()) {
      toast.error("يرجى إدخال رابط الجلسة الخارجية");
      return;
    }

    if (!validation.isValid) {
      toast.error(validation.error || "رابط غير صحيح");
      return;
    }

    setLoading(true);

    try {
      const result = await apiCallWithToast(
        `/api/sessions/${sessionId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            externalLink: link.trim(),
          }),
        },
        toast,
        "تم حفظ رابط الجلسة بنجاح"
      );

      if (result) {
        onLinkUpdated(link);
        onClose();
      }
    } catch {
      // Error is already handled by apiCallWithToast
    } finally {
      setLoading(false);
    }
  };

  const commonPlatforms = [
    {
      name: PLATFORM_EXAMPLES.zoom.name,
      placeholder: PLATFORM_EXAMPLES.zoom.example,
      description: PLATFORM_EXAMPLES.zoom.description,
      icon: "🎥",
    },
    {
      name: PLATFORM_EXAMPLES["google-meet"].name,
      placeholder: PLATFORM_EXAMPLES["google-meet"].example,
      description: PLATFORM_EXAMPLES["google-meet"].description,
      icon: "📹",
    },
    {
      name: PLATFORM_EXAMPLES.teams.name,
      placeholder: PLATFORM_EXAMPLES.teams.example,
      description: PLATFORM_EXAMPLES.teams.description,
      icon: "💼",
    },
    {
      name: PLATFORM_EXAMPLES.other.name,
      placeholder: PLATFORM_EXAMPLES.other.example,
      description: PLATFORM_EXAMPLES.other.description,
      icon: "🌐",
    },
  ];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Link className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                إضافة رابط الجلسة
              </h2>
              <p className='text-sm text-gray-600 mt-1'>{sessionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Link Input */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              رابط الجلسة المباشرة *
            </label>
            <input
              type='url'
              value={link}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder='https://zoom.us/j/123456789'
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                validationInfo.isValid && link
                  ? "border-green-300 focus:ring-green-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              dir='ltr'
            />

            {/* Validation feedback */}
            {link && validationInfo.isValid && (
              <div className='flex items-center gap-2 mt-2 text-green-600 text-sm'>
                <CheckCircle className='w-4 h-4' />
                <span>
                  رابط صحيح -{" "}
                  {validationInfo.platform === "zoom"
                    ? "Zoom"
                    : validationInfo.platform === "google-meet"
                    ? "Google Meet"
                    : validationInfo.platform === "teams"
                    ? "Teams"
                    : "منصة أخرى"}
                </span>
              </div>
            )}
          </div>

          {/* Platform Examples */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              أمثلة للمنصات الشائعة:
            </h3>
            <div className='space-y-2'>
              {commonPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => {
                    setLink(platform.placeholder);
                  }}
                  className='w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>
                      {platform.placeholder}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-900'>
                        {platform.name}
                      </span>
                      <span className='text-lg'>{platform.icon}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className='bg-blue-50 p-4 rounded-lg'>
            <h4 className='text-sm font-medium text-blue-900 mb-2'>
              ملاحظات مهمة:
            </h4>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• يجب إضافة رابط الجلسة قبل بدء الحصة</li>
              <li>• تأكد من صحة الرابط قبل الحفظ</li>
              <li>• سيتمكن الطلاب من الوصول للجلسة عبر هذا الرابط</li>
              <li>• يمكنك تعديل الرابط في أي وقت قبل انتهاء الجلسة</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
            disabled={loading}>
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !link.trim()}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className='w-4 h-4' />
                <span>حفظ الرابط</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
