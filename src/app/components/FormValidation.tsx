"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface FormState {
  values: Record<string, string>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Arabic validation messages
const getValidationMessage = (
  rule: string,
  value?: string | number
): string => {
  switch (rule) {
    case "required":
      return "هذا الحقل مطلوب";
    case "email":
      return "يرجى إدخال بريد إلكتروني صحيح";
    case "phone":
      return "يرجى إدخال رقم هاتف صحيح";
    case "minLength":
      return `يجب أن يحتوي على ${value} أحرف على الأقل`;
    case "maxLength":
      return `يجب ألا يتجاوز ${value} حرف`;
    case "pattern":
      return "التنسيق غير صحيح";
    default:
      return "قيمة غير صحيحة";
  }
};

// Validation functions
const validators = {
  required: (value: string): string | null => {
    return !value.trim() ? getValidationMessage("required") : null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value)
      ? getValidationMessage("email")
      : null;
  },

  phone: (value: string): string | null => {
    // Support multiple phone formats (Saudi, international)
    const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
    return value && !phoneRegex.test(value.replace(/\s/g, ""))
      ? getValidationMessage("phone")
      : null;
  },

  minLength:
    (minLength: number) =>
    (value: string): string | null => {
      return value && value.length < minLength
        ? getValidationMessage("minLength", minLength)
        : null;
    },

  maxLength:
    (maxLength: number) =>
    (value: string): string | null => {
      return value && value.length > maxLength
        ? getValidationMessage("maxLength", maxLength)
        : null;
    },

  pattern:
    (pattern: RegExp) =>
    (value: string): string | null => {
      return value && !pattern.test(value)
        ? getValidationMessage("pattern")
        : null;
    },
};

// Validate single field
export function validateField(
  value: string,
  rules: ValidationRule
): string | null {
  if (rules.required) {
    const error = validators.required(value);
    if (error) return error;
  }

  if (!value) return null; // Skip other validations if field is empty and not required

  if (rules.email) {
    const error = validators.email(value);
    if (error) return error;
  }

  if (rules.phone) {
    const error = validators.phone(value);
    if (error) return error;
  }

  if (rules.minLength) {
    const error = validators.minLength(rules.minLength)(value);
    if (error) return error;
  }

  if (rules.maxLength) {
    const error = validators.maxLength(rules.maxLength)(value);
    if (error) return error;
  }

  if (rules.pattern) {
    const error = validators.pattern(rules.pattern)(value);
    if (error) return error;
  }

  if (rules.custom) {
    const error = rules.custom(value);
    if (error) return error;
  }

  return null;
}

// Form hook
export function useForm(initialValues: Record<string, string> = {}) {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const setValue = (name: string, value: string) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
    }));
  };

  const setError = (name: string, error: string | null) => {
    setState((prev) => ({
      ...prev,
      errors: error
        ? { ...prev.errors, [name]: error }
        : { ...prev.errors, [name]: undefined },
    }));
  };

  const setTouched = (name: string, touched: boolean = true) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  };

  const validateForm = (formRules: Record<string, ValidationRule>): boolean => {
    const newErrors: Record<string, string | undefined> = {};
    let isValid = true;

    Object.entries(formRules).forEach(([fieldName, rules]) => {
      const value = state.values[fieldName] || "";
      const error = validateField(value, rules);

      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setState((prev) => ({
      ...prev,
      errors: newErrors,
      isValid,
    }));

    return isValid;
  };

  const reset = () => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  };

  const setSubmitting = (isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  };

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setError,
    setTouched,
    validateForm,
    reset,
    setSubmitting,
  };
}

// Form Field Component
export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  rules,
  placeholder,
  disabled = false,
  error,
  required = false,
  className = "",
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const handleBlur = () => {
    if (rules) {
      const validationError = validateField(value, rules);
      setLocalError(validationError);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear error when user starts typing
    if (localError || error) {
      setLocalError(null);
    }
  };

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className='block text-sm font-medium text-gray-700'>
        {label}
        {required && <span className='text-red-500 mr-1'>*</span>}
      </label>

      <div className='relative'>
        {type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed`}
            rows={4}
          />
        ) : (
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
              isPassword ? "pl-10" : ""
            } ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed`}
          />
        )}

        {isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'>
            {showPassword ? (
              <EyeOff className='w-4 h-4' />
            ) : (
              <Eye className='w-4 h-4' />
            )}
          </button>
        )}
      </div>

      {displayError && (
        <div className='flex items-center gap-1 text-red-600 text-sm'>
          <AlertCircle className='w-4 h-4 flex-shrink-0' />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

// Form validation rules for common use cases
export const commonRules = {
  email: {
    required: true,
    email: true,
  } as ValidationRule,

  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم";
      }
      return null;
    },
  } as ValidationRule,

  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u0600-\u06FF\s\u0041-\u005A\u0061-\u007A]+$/,
  } as ValidationRule,

  phone: {
    required: true,
    phone: true,
  } as ValidationRule,

  age: {
    required: true,
    pattern: /^\d+$/,
    custom: (value: string) => {
      const age = parseInt(value);
      if (age < 6 || age > 100) {
        return "العمر يجب أن يكون بين 6 و 100 سنة";
      }
      return null;
    },
  } as ValidationRule,
};

// Error display component
export function ErrorDisplay({
  errors,
  className = "",
}: {
  errors: string[];
  className?: string;
}) {
  if (errors.length === 0) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className='flex items-center gap-2 mb-2'>
        <AlertCircle className='w-5 h-5 text-red-600' />
        <h3 className='text-sm font-medium text-red-800'>
          {errors.length === 1 ? "خطأ في النموذج" : "أخطاء في النموذج"}
        </h3>
      </div>
      <ul className='text-sm text-red-700 space-y-1'>
        {errors.map((error, index) => (
          <li key={index} className='flex items-start gap-1'>
            <span>•</span>
            <span>{error}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Success display component
export function SuccessDisplay({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className='flex items-center gap-2'>
        <CheckCircle className='w-5 h-5 text-green-600' />
        <span className='text-sm font-medium text-green-800'>{message}</span>
      </div>
    </div>
  );
}
