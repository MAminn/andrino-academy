"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface Package {
  id: string;
  name: string;
  price: number;
  discountedPrice: number | null;
  minAge: number;
  maxAge: number;
  description: string;
  perks: string; // JSON string
  durationMonths: number;
  sessionsPerLevel: number;
  pricePerSession: number;
  badge: string | null;
  order: number;
  isActive: boolean;
}

export default function PackagesDisplay() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages");
      const data = await response.json();
      // Only show active packages for public
      const activePackages = (data.packages || []).filter(
        (pkg: Package) => pkg.isActive
      );
      setPackages(activePackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        لا توجد باقات متاحة حالياً
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {packages.map((pkg) => {
        const perks = JSON.parse(pkg.perks) as string[];
        const hasDiscount = pkg.discountedPrice && pkg.discountedPrice > 0;
        const displayPrice = hasDiscount ? pkg.discountedPrice : pkg.price;

        return (
          <div
            key={pkg.id}
            className="relative border-2 border-blue-400 rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Badge */}
            {pkg.badge && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {pkg.badge}
              </div>
            )}

            {/* Package Name */}
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-4 mt-8">
              {pkg.name}
            </h3>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900">
                  {displayPrice}
                </span>
                <span className="text-lg text-gray-600">ج.م</span>
              </div>
              {hasDiscount && (
                <div className="text-lg text-gray-400 line-through mt-1">
                  {pkg.price} ج.م
                </div>
              )}
            </div>

            {/* Price Per Session */}
            <div className="text-center text-sm text-gray-600 mb-4">
              معدل {pkg.pricePerSession.toFixed(2)} ج.م لكل حصة
            </div>

            {/* Duration & Age */}
            <div className="bg-blue-50 rounded-lg p-3 text-center mb-4">
              <p className="text-sm text-gray-700">
                {pkg.durationMonths} شهور - {pkg.sessionsPerLevel} حصة ليفل
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {pkg.minAge}-{pkg.maxAge} سنوات 
              </p>
            </div>

            {/* Description */}
            {pkg.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 text-center font-semibold">
                  المنهج يشمل:
                </p>
                <p className="text-sm text-gray-600 text-center mt-1">
                  {pkg.description}
                </p>
              </div>
            )}

            {/* Perks */}
            <div className="space-y-2 mb-6">
              {perks.map((perk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle
                    size={18}
                    className="text-green-500 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">{perk}</span>
                </div>
              ))}
            </div>

            {/* Rewards Section - Placeholder for future use */}
            <div className="mb-6">
              {/* You can add rewards/bonuses section here if needed */}
            </div>

            {/* CTA Button */}
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">
              اشترك الآن
            </button>
          </div>
        );
      })}
    </div>
  );
}
