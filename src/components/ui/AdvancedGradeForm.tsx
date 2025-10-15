"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "./Modal";
import {
  Users,
  BookOpen,
  GraduationCap,
  Save,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface Grade {
  id?: string;
  name: string;
  description?: string;
  order?: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  age?: number;
}

interface Track {
  id: string;
  name: string;
  description?: string;
  instructor: {
    id: string;
    name: string;
  };
  coordinator: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AdvancedGradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    grade: Grade;
    studentAssignments?: { studentId: string; action: "assign" | "unassign" }[];
    trackUpdates?: {
      trackId: string;
      instructorId?: string;
      coordinatorId?: string;
    }[];
  }) => Promise<void>;
  grade?: Grade;
  mode: "create" | "edit";
}

export function AdvancedGradeForm({
  isOpen,
  onClose,
  onSubmit,
  grade,
  mode,
}: AdvancedGradeFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "students" | "tracks">(
    "basic"
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Basic grade data
  console.log("AdvancedGradeForm props:", {
    isOpen,
    mode,
    grade,
    gradeExists: !!grade,
    gradeName: grade?.name,
  });

  const [formData, setFormData] = useState<Grade>(() => {
    const initialData = {
      name: grade?.name || "",
      description: grade?.description || "",
      order: grade?.order || 1,
    };
    console.log("useState initializer running with:", { grade, initialData });
    return initialData;
  });

  // Students management
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [studentChanges, setStudentChanges] = useState<
    { studentId: string; action: "assign" | "unassign" }[]
  >([]);

  // Tracks management
  const [gradeTracks, setGradeTracks] = useState<Track[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [coordinators, setCoordinators] = useState<User[]>([]);
  const [trackUpdates, setTrackUpdates] = useState<
    { trackId: string; instructorId?: string; coordinatorId?: string }[]
  >([]);

  const fetchStudents = useCallback(async () => {
    try {
      // Fetch all students
      const allResponse = await fetch("/api/students");
      let allStudentsData: Student[] = [];
      if (allResponse.ok) {
        const response = await allResponse.json();
        // Handle both old format (students) and new format (data)
        allStudentsData = response.students || response.data || [];
        setAllStudents(allStudentsData);
      }

      // Fetch students assigned to this grade
      const assignedResponse = await fetch(
        `/api/students?gradeId=${grade?.id}`
      );
      if (assignedResponse.ok) {
        const response = await assignedResponse.json();
        // Handle both old format (students) and new format (data)
        const assignedStudentsData = response.students || response.data || [];
        setAssignedStudents(assignedStudentsData || []);

        // Calculate unassigned students
        const assignedIds = new Set(
          assignedStudentsData.map((s: Student) => s.id)
        );
        const unassigned = allStudentsData.filter(
          (s: Student) => !assignedIds.has(s.id)
        );
        setUnassignedStudents(unassigned);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [grade?.id]);

  const fetchTracks = useCallback(async () => {
    try {
      console.log("Fetching tracks for grade:", grade?.id);
      const response = await fetch(`/api/tracks?gradeId=${grade?.id}`);
      console.log("Tracks response status:", response.status);
      if (response.ok) {
        const responseData = await response.json();
        console.log("Tracks data received:", responseData);
        // Handle both old format (tracks) and new format (data)
        const tracks = responseData.tracks || responseData.data || [];
        setGradeTracks(tracks);
      } else {
        console.error("Tracks fetch failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  }, [grade?.id]);

  const fetchUsers = useCallback(async () => {
    try {
      const [instructorsResponse, coordinatorsResponse] = await Promise.all([
        fetch("/api/users?role=instructor"),
        fetch("/api/users?role=coordinator"),
      ]);

      if (instructorsResponse.ok) {
        const response = await instructorsResponse.json();
        // Handle both old format (users) and new format (data)
        const instructorsData = response.users || response.data || [];
        setInstructors(instructorsData);
      }

      if (coordinatorsResponse.ok) {
        const response = await coordinatorsResponse.json();
        // Handle both old format (users) and new format (data)
        const coordinatorsData = response.users || response.data || [];
        setCoordinators(coordinatorsData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && mode === "edit" && grade?.id) {
      fetchStudents();
      fetchTracks();
      fetchUsers();
    }
  }, [isOpen, mode, grade?.id, fetchStudents, fetchTracks, fetchUsers]);

  // Update form data when grade prop changes
  useEffect(() => {
    console.log("useEffect triggered with grade:", grade);
    console.log("Mode:", mode);
    if (grade && mode === "edit") {
      console.log("Updating form data with grade:", grade);
      console.log("Grade name:", grade.name);
      console.log("Grade description:", grade.description);
      console.log("Grade order:", grade.order);
      setFormData({
        name: grade.name || "",
        description: grade.description || "",
        order: grade.order || 1,
      });
      console.log("Form data updated successfully");
    } else {
      console.log("Not updating form data - grade:", !!grade, "mode:", mode);
    }
  }, [grade, mode]);

  // Debug formData changes
  useEffect(() => {
    console.log("FormData changed to:", formData);
  }, [formData]);

  const handleStudentAssign = (student: Student) => {
    setAssignedStudents((prev) => [...prev, student]);
    setUnassignedStudents((prev) => prev.filter((s) => s.id !== student.id));

    // Track the change
    setStudentChanges((prev) => {
      const filtered = prev.filter((change) => change.studentId !== student.id);
      return [...filtered, { studentId: student.id, action: "assign" }];
    });
  };

  const handleStudentUnassign = (student: Student) => {
    setUnassignedStudents((prev) => [...prev, student]);
    setAssignedStudents((prev) => prev.filter((s) => s.id !== student.id));

    // Track the change
    setStudentChanges((prev) => {
      const filtered = prev.filter((change) => change.studentId !== student.id);
      return [...filtered, { studentId: student.id, action: "unassign" }];
    });
  };

  const handleTrackUpdate = (
    trackId: string,
    field: "instructorId" | "coordinatorId",
    value: string
  ) => {
    setTrackUpdates((prev) => {
      const existing = prev.find((update) => update.trackId === trackId);
      if (existing) {
        return prev.map((update) =>
          update.trackId === trackId ? { ...update, [field]: value } : update
        );
      } else {
        return [...prev, { trackId, [field]: value }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Starting form submission...");
    console.log("Form data:", formData);
    console.log("Student changes:", studentChanges);
    console.log("Track updates:", trackUpdates);

    // Validation
    const newErrors: Record<string, string> = {};
    console.log("Validating form data:", formData);
    if (!formData.name.trim()) {
      console.log("Validation failed: name is empty");
      newErrors.name = "اسم المستوى مطلوب";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors found:", newErrors);
      setErrors(newErrors);
      return;
    }

    console.log("Validation passed");

    setLoading(true);
    try {
      console.log("Calling onSubmit with data...");
      await onSubmit({
        grade: {
          ...formData,
          id: grade?.id,
        },
        studentAssignments:
          studentChanges.length > 0 ? studentChanges : undefined,
        trackUpdates: trackUpdates.length > 0 ? trackUpdates : undefined,
      });

      console.log("Form submission successful");
      onClose();
      // Reset form data
      setFormData({ name: "", description: "", order: 1 });
      setStudentChanges([]);
      setTrackUpdates([]);
      setErrors({});
    } catch (error) {
      console.error("Error submitting grade:", error);
      setErrors({ submit: "حدث خطأ أثناء حفظ البيانات" });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "المعلومات الأساسية", icon: BookOpen },
    { id: "students", label: "إدارة الطلاب", icon: Users },
    { id: "tracks", label: "إدارة المسارات", icon: GraduationCap },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "إنشاء مستوى جديد" : "إدارة المستوى المتقدمة"}
      size='xl'>
      <div className='space-y-6' dir='rtl'>
        {/* Tabs */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "basic" | "students" | "tracks")
                  }
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                  <Icon className='w-4 h-4' />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  اسم المستوى *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder='مثل: المستوى الأول'
                />
                {errors.name && (
                  <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows={3}
                  placeholder='وصف المستوى والفئة العمرية المستهدفة'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  ترتيب المستوى
                </label>
                <input
                  type='number'
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='1'
                />
              </div>
            </div>
          )}

          {/* Students Management Tab */}
          {activeTab === "students" && mode === "edit" && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Assigned Students */}
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                    <Users className='w-5 h-5 text-green-600' />
                    الطلاب المسجلين ({assignedStudents.length})
                  </h3>
                  <div className='space-y-2 max-h-64 overflow-y-auto'>
                    {assignedStudents.length === 0 ? (
                      <p className='text-gray-500 text-sm'>
                        لا يوجد طلاب مسجلين
                      </p>
                    ) : (
                      assignedStudents.map((student) => (
                        <div
                          key={student.id}
                          className='flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg'>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {student.name}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {student.email}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleStudentUnassign(student)}
                            className='p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                            title='إلغاء التسجيل'>
                            <UserMinus className='w-4 h-4' />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Unassigned Students */}
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                    <UserPlus className='w-5 h-5 text-blue-600' />
                    الطلاب المتاحين ({unassignedStudents.length})
                  </h3>
                  <div className='space-y-2 max-h-64 overflow-y-auto'>
                    {unassignedStudents.length === 0 ? (
                      <p className='text-gray-500 text-sm'>
                        جميع الطلاب مسجلين
                      </p>
                    ) : (
                      unassignedStudents.map((student) => (
                        <div
                          key={student.id}
                          className='flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg'>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {student.name}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {student.email}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleStudentAssign(student)}
                            className='p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors'
                            title='تسجيل في المستوى'>
                            <UserPlus className='w-4 h-4' />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              {studentChanges.length > 0 && (
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <h4 className='text-sm font-medium text-blue-900 mb-2'>
                    التغييرات المخططة ({studentChanges.length})
                  </h4>
                  <div className='space-y-1 text-sm'>
                    {studentChanges.map((change, index) => {
                      const student = allStudents.find(
                        (s) => s.id === change.studentId
                      );
                      return (
                        <div key={index} className='flex items-center gap-2'>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              change.action === "assign"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span>
                            {change.action === "assign"
                              ? "تسجيل"
                              : "إلغاء تسجيل"}
                            : {student?.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracks Management Tab */}
          {activeTab === "tracks" && mode === "edit" && (
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-purple-600' />
                إدارة المسارات التعليمية ({gradeTracks.length})
              </h3>

              {gradeTracks.length === 0 ? (
                <p className='text-gray-500'>
                  لا يوجد مسارات تعليمية في هذا المستوى
                </p>
              ) : (
                <div className='space-y-4'>
                  {gradeTracks.map((track) => (
                    <div
                      key={track.id}
                      className='p-4 border border-gray-200 rounded-lg'>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        {track.name}
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Instructor Assignment */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            المدرب
                          </label>
                          <select
                            defaultValue={track.instructor.id}
                            onChange={(e) =>
                              handleTrackUpdate(
                                track.id,
                                "instructorId",
                                e.target.value
                              )
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value=''>اختر المدرب</option>
                            {instructors.map((instructor) => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Coordinator Assignment */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            المنسق
                          </label>
                          <select
                            defaultValue={track.coordinator.id}
                            onChange={(e) =>
                              handleTrackUpdate(
                                track.id,
                                "coordinatorId",
                                e.target.value
                              )
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value=''>اختر المنسق</option>
                            {coordinators.map((coordinator) => (
                              <option
                                key={coordinator.id}
                                value={coordinator.id}>
                                {coordinator.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {errors.submit && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-700 text-sm'>{errors.submit}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'>
              إلغاء
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'>
              {loading ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <Save className='w-4 h-4' />
              )}
              {mode === "create" ? "إنشاء المستوى" : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
