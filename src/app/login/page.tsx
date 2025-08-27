"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Get the user session to determine role-based redirect
        const session = await getSession();
        const userRole = session?.user?.role;

        // Redirect based on user role
        switch (userRole) {
          case "student":
            router.push("/student");
            break;
          case "instructor":
            router.push("/instructor");
            break;
          case "coordinator":
            router.push("/coordinator");
            break;
          case "manager":
            router.push("/manager");
            break;
          default:
            router.push("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='max-w-md mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>Login</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <button
          type='submit'
          disabled={loading}
          className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50'>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className='text-center text-gray-600'>
        Don&apos;t have an account?{" "}
        <Link href='/signup' className='text-blue-600 underline'>
          Sign up
        </Link>
      </p>
    </section>
  );
}
