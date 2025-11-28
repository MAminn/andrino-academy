"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  X,
} from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
}

export default function PackagesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showBadgeInput, setShowBadgeInput] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountedPrice: "",
    minAge: "",
    maxAge: "",
    description: "",
    perks: [""],
    durationMonths: "",
    sessionsPerLevel: "",
    badge: "",
    order: "0",
    isActive: true,
  });

  // Auth check
  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (!["manager", "ceo"].includes(session?.user?.role || "")) {
      router.push("/unauthorized");
    }
  }, [status, session, router]);

  // Fetch packages
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/packages");
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("خطأ في تحميل الباقات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price || !formData.minAge || !formData.maxAge || !formData.description || !formData.durationMonths || !formData.sessionsPerLevel) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    // Validate perks
    const validPerks = formData.perks.filter(p => p.trim() !== "");
    if (validPerks.length === 0) {
      alert("الرجاء إضافة ميزة واحدة على الأقل");
      return;
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
      minAge: parseInt(formData.minAge),
      maxAge: parseInt(formData.maxAge),
      description: formData.description,
      perks: validPerks,
      durationMonths: parseInt(formData.durationMonths),
      sessionsPerLevel: parseInt(formData.sessionsPerLevel),
      badge: showBadgeInput && formData.badge ? formData.badge : null,
      order: parseInt(formData.order),
      isActive: formData.isActive,
    };

    try {
      const url = editingPackage ? `/api/packages/${editingPackage.id}` : "/api/packages";
      const method = editingPackage ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingPackage ? "تم تحديث الباقة بنجاح" : "تم إضافة الباقة بنجاح");
        setShowModal(false);
        resetForm();
        fetchPackages();
      } else {
        const error = await response.json();
        alert("خطأ: " + (error.error || "حدث خطأ"));
      }
    } catch (error) {
      console.error("Error saving package:", error);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      discountedPrice: pkg.discountedPrice?.toString() || "",
      minAge: pkg.minAge.toString(),
      maxAge: pkg.maxAge.toString(),
      description: pkg.description,
      perks: JSON.parse(pkg.perks),
      durationMonths: pkg.durationMonths.toString(),
      sessionsPerLevel: pkg.sessionsPerLevel.toString(),
      badge: pkg.badge || "",
      order: pkg.order.toString(),
      isActive: pkg.isActive,
    });
    setShowBadgeInput(!!pkg.badge);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("تم حذف الباقة بنجاح");
        fetchPackages();
      } else {
        alert("حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const toggleActive = async (pkg: Package) => {
    try {
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });

      if (response.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      discountedPrice: "",
      minAge: "",
      maxAge: "",
      description: "",
      perks: [""],
      durationMonths: "",
      sessionsPerLevel: "",
      badge: "",
      order: "0",
      isActive: true,
    });
    setEditingPackage(null);
    setShowBadgeInput(false);
  };

  const addPerk = () => {
    setFormData({ ...formData, perks: [...formData.perks, ""] });
  };

  const removePerk = (index: number) => {
    const newPerks = formData.perks.filter((_, i) => i !== index);
    setFormData({ ...formData, perks: newPerks });
  };

  const updatePerk = (index: number, value: string) => {
    const newPerks = [...formData.perks];
    newPerks[index] = value;
    setFormData({ ...formData, perks: newPerks });
  };

  if (isPending || loading) {
    return (
      <DashboardLayout title="إدارة الباقات" role="manager">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="إدارة الباقات" role="manager">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">إدارة الباقات</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            باقة جديدة
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border rounded-lg p-6 ${
                pkg.isActive ? "bg-white" : "bg-gray-100"
              } shadow-sm hover:shadow-md transition`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full w-fit mb-3">
                  {pkg.badge}
                </div>
              )}

              {/* Name */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>

              {/* Price */}
              <div className="mb-3">
                {pkg.discountedPrice && pkg.discountedPrice > 0 ? (
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      {pkg.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-600 mr-2">ج.م</span>
                    <div className="text-lg text-gray-400 line-through">
                      {pkg.price.toFixed(2)} ج.م
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      {pkg.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-600 mr-2">ج.م</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>الأعمار: {pkg.minAge}-{pkg.maxAge} سنوات</p>
                <p>{pkg.durationMonths} شهور - {pkg.sessionsPerLevel} حصة</p>
                <p>معدل {pkg.pricePerSession.toFixed(2)} ج.م لكل حصة</p>
              </div>

              {/* Perks */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">المميزات:</p>
                <ul className="space-y-1">
                  {JSON.parse(pkg.perks).slice(0, 3).map((perk: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => toggleActive(pkg)}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
                    pkg.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  } transition`}
                  title={pkg.isActive ? "إخفاء" : "إظهار"}
                >
                  {pkg.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                >
                  <Edit size={16} />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد باقات حالياً. اضغط "باقة جديدة" لإضافة أول باقة.
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingPackage ? "تعديل الباقة" : "باقة جديدة"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الباقة *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="مثال: مستوى احترافي"
                    required
                  />
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر الأصلي (ج.م) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="23600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر بعد الخصم (ج.م)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountedPrice}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="18800 (اختياري)"
                    />
                  </div>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحد الأدنى للعمر *
                    </label>
                    <input
                      type="number"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="6"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحد الأقصى للعمر *
                    </label>
                    <input
                      type="number"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="7"
                      required
                    />
                  </div>
                </div>

                {/* Duration & Sessions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المدة (بالشهور) *
                    </label>
                    <input
                      type="number"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد الحصص *
                    </label>
                    <input
                      type="number"
                      value={formData.sessionsPerLevel}
                      onChange={(e) => setFormData({ ...formData, sessionsPerLevel: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="48"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                    placeholder="المنهج يشمل: المستوى المتقدم + المستوى الثالث..."
                    required
                  />
                </div>

                {/* Perks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المميزات *
                  </label>
                  {formData.perks.map((perk, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={perk}
                        onChange={(e) => updatePerk(index, e.target.value)}
                        className="flex-1 p-2 border rounded-lg"
                        placeholder="مثال: تعليم أساسيات البرمجة والكمبيوتر"
                      />
                      {formData.perks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePerk(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPerk}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + إضافة ميزة
                  </button>
                </div>

                {/* Badge */}
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={showBadgeInput}
                      onChange={(e) => {
                        setShowBadgeInput(e.target.checked);
                        if (!e.target.checked) {
                          setFormData({ ...formData, badge: "" });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">إضافة شارة (Badge)</span>
                  </label>
                  {showBadgeInput && (
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="مثال: Best Value أو الأكثر شعبية"
                    />
                  )}
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">نشط (ظاهر للطلاب)</span>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingPackage ? "تحديث الباقة" : "إضافة الباقة"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    إلغاء
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

