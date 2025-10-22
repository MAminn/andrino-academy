"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Award,
  Trophy,
  Star,
  Target,
  CheckCircle,
  Calendar,
  AlertCircle,
  Medal,
  Crown,
  Zap,
} from "lucide-react";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  points: number;
  rarity: string;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
  isUnlocked: boolean;
  requirements: string[];
}

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  currentLevel: number;
  nextLevelPoints: number;
  currentLevelProgress: number;
  rank: string;
}

export default function AchievementsModal({
  isOpen,
  onClose,
  studentId,
}: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "unlocked" | "locked" | "recent"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${studentId}/achievements`);

      if (!response.ok) {
        throw new Error("فشل في تحميل الإنجازات");
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل الإنجازات"
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchAchievements();
    }
  }, [isOpen, studentId, fetchAchievements]);

  const getAchievementIcon = (type: string, rarity: string) => {
    const iconClass = getRarityColor(rarity);

    switch (type) {
      case "attendance":
        return <CheckCircle className={`w-8 h-8 ${iconClass}`} />;
      case "completion":
        return <Target className={`w-8 h-8 ${iconClass}`} />;
      case "grade":
        return <Star className={`w-8 h-8 ${iconClass}`} />;
      case "streak":
        return <Zap className={`w-8 h-8 ${iconClass}`} />;
      case "milestone":
        return <Trophy className={`w-8 h-8 ${iconClass}`} />;
      case "special":
        return <Crown className={`w-8 h-8 ${iconClass}`} />;
      default:
        return <Award className={`w-8 h-8 ${iconClass}`} />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600";
      case "uncommon":
        return "text-green-600";
      case "rare":
        return "text-blue-600";
      case "epic":
        return "text-purple-600";
      case "legendary":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300";
      case "uncommon":
        return "border-green-300";
      case "rare":
        return "border-blue-300";
      case "epic":
        return "border-purple-300";
      case "legendary":
        return "border-yellow-300";
      default:
        return "border-gray-300";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-50";
      case "uncommon":
        return "bg-green-50";
      case "rare":
        return "bg-blue-50";
      case "epic":
        return "bg-purple-50";
      case "legendary":
        return "bg-yellow-50";
      default:
        return "bg-gray-50";
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "عادي";
      case "uncommon":
        return "غير مألوف";
      case "rare":
        return "نادر";
      case "epic":
        return "ملحمي";
      case "legendary":
        return "أسطوري";
      default:
        return rarity;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "attendance":
        return "الحضور";
      case "performance":
        return "الأداء";
      case "engagement":
        return "المشاركة";
      case "milestone":
        return "الإنجازات الكبرى";
      case "social":
        return "الأنشطة الاجتماعية";
      default:
        return category;
    }
  };

  const getFilteredAchievements = () => {
    let filtered = achievements;

    // Filter by unlock status
    switch (filter) {
      case "unlocked":
        filtered = filtered.filter((a) => a.isUnlocked);
        break;
      case "locked":
        filtered = filtered.filter((a) => !a.isUnlocked);
        break;
      case "recent":
        filtered = filtered.filter((a) => {
          if (!a.earnedAt) return false;
          const earnedDate = new Date(a.earnedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return earnedDate >= weekAgo;
        });
        break;
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    return filtered;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(achievements.map((a) => a.category))];
    return categories;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  const filteredAchievements = getFilteredAchievements();
  const categories = getUniqueCategories();

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      style={{ overflow: "hidden" }}>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b flex-shrink-0'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              الإنجازات والشارات
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              تتبع تقدمك واكسب الشارات
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Stats Header */}
        {stats && (
          <div className='p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Trophy className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>
                  {stats.unlockedAchievements}
                </p>
                <p className='text-sm text-blue-100'>
                  من {stats.totalAchievements} إنجاز
                </p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Star className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>{stats.totalPoints}</p>
                <p className='text-sm text-blue-100'>نقطة إنجاز</p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Medal className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>
                  المستوى {stats.currentLevel}
                </p>
                <p className='text-sm text-blue-100'>{stats.rank}</p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Target className='w-8 h-8' />
                </div>
                <p className='text-lg font-bold'>
                  {stats.currentLevelProgress}%
                </p>
                <p className='text-sm text-blue-100'>للمستوى التالي</p>
                <div className='w-full bg-blue-500 rounded-full h-2 mt-2'>
                  <div
                    className='bg-white h-2 rounded-full transition-all duration-300'
                    style={{ width: `${stats.currentLevelProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className='p-6 border-b bg-gray-50'>
          <div className='space-y-4'>
            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                حالة الإنجاز
              </label>
              <div className='flex gap-2 overflow-x-auto'>
                {[
                  { key: "all", label: "جميع الإنجازات" },
                  { key: "unlocked", label: "المفتوحة" },
                  { key: "locked", label: "المقفلة" },
                  { key: "recent", label: "الأخيرة" },
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() =>
                      setFilter(
                        filterOption.key as
                          | "all"
                          | "unlocked"
                          | "locked"
                          | "recent"
                      )
                    }
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      filter === filterOption.key
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}>
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                الفئة
              </label>
              <div className='flex gap-2 overflow-x-auto'>
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    categoryFilter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}>
                  جميع الفئات
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      categoryFilter === category
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}>
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className='flex-1 overflow-y-auto p-6'
          style={{ minHeight: "200px" }}>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل الإنجازات...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={fetchAchievements}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className='text-center py-12'>
              <Award className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                لا توجد إنجازات
              </h3>
              <p className='text-gray-600'>
                {filter === "all"
                  ? "لم يتم العثور على أي إنجازات"
                  : `لا توجد إنجازات ${
                      filter === "unlocked"
                        ? "مفتوحة"
                        : filter === "locked"
                        ? "مقفلة"
                        : "أخيرة"
                    }`}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`border-2 rounded-lg p-6 transition-all duration-300 ${
                    achievement.isUnlocked
                      ? `${getRarityBorder(achievement.rarity)} ${getRarityBg(
                          achievement.rarity
                        )} shadow-md hover:shadow-lg`
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}>
                  <div className='text-center mb-4'>
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                        achievement.isUnlocked
                          ? getRarityBg(achievement.rarity)
                          : "bg-gray-200"
                      } mb-3`}>
                      {getAchievementIcon(
                        achievement.type,
                        achievement.isUnlocked ? achievement.rarity : "common"
                      )}
                    </div>
                    <div className='flex items-center justify-center gap-2 mb-2'>
                      <h3
                        className={`font-semibold ${
                          achievement.isUnlocked
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}>
                        {achievement.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRarityColor(
                          achievement.rarity
                        )} ${getRarityBg(achievement.rarity)}`}>
                        {getRarityLabel(achievement.rarity)}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        achievement.isUnlocked
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}>
                      {achievement.description}
                    </p>
                  </div>

                  {/* Progress Bar for locked achievements */}
                  {!achievement.isUnlocked &&
                    achievement.progress !== undefined &&
                    achievement.maxProgress && (
                      <div className='mb-4'>
                        <div className='flex justify-between text-sm mb-2'>
                          <span className='text-gray-600'>التقدم</span>
                          <span className='text-gray-600'>
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                            style={{
                              width: `${
                                (achievement.progress /
                                  achievement.maxProgress) *
                                100
                              }%`,
                            }}></div>
                        </div>
                      </div>
                    )}

                  {/* Requirements for locked achievements */}
                  {!achievement.isUnlocked &&
                    achievement.requirements.length > 0 && (
                      <div className='mb-4'>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          المتطلبات:
                        </h4>
                        <ul className='text-xs text-gray-600 space-y-1'>
                          {achievement.requirements.map((req, index) => (
                            <li key={index} className='flex items-start gap-2'>
                              <span className='text-gray-400 mt-1'>•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Star
                        className={`w-4 h-4 ${
                          achievement.isUnlocked
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          achievement.isUnlocked
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}>
                        {achievement.points} نقطة
                      </span>
                    </div>

                    {achievement.earnedAt && (
                      <div className='flex items-center gap-1 text-xs text-gray-500'>
                        <Calendar className='w-3 h-3' />
                        {formatDate(achievement.earnedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              عرض {filteredAchievements.length} من {achievements.length} إنجاز
            </div>
            <button
              onClick={onClose}
              className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'>
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
