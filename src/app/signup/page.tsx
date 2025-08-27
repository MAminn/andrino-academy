"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
      } else {
        // Redirect to login page with success message
        router.push("/login?message=Account created successfully");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='max-w-md mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>Sign Up</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          name='name'
          placeholder='Full Name'
          value={formData.name}
          onChange={handleChange}
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <input
          type='password'
          name='password'
          placeholder='Password'
          value={formData.password}
          onChange={handleChange}
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
          minLength={6}
        />
        <select
          name='role'
          value={formData.role}
          onChange={handleChange}
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required>
          <option value=''>Select Role</option>
          <option value='student'>Student</option>
          <option value='instructor'>Instructor</option>
          <option value='coordinator'>Coordinator</option>
          <option value='manager'>Manager</option>
        </select>
        <button
          type='submit'
          disabled={loading}
          className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50'>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className='text-center text-gray-600'>
        Already have an account?{" "}
        <Link href='/login' className='text-blue-600 underline'>
          Login
        </Link>
      </p>
    </section>
  );
}
