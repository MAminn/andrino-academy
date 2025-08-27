"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className='w-full bg-brand-blue shadow-brand-lg px-6 py-4 flex justify-between items-center'>
      <div className='text-2xl font-heading font-bold text-brand-white'>
        Andrino Academy
      </div>

      <div className='flex items-center space-x-6'>
        <Link
          href='/'
          className='text-brand-white hover:text-brand-copper transition-colors font-medium'>
          Home
        </Link>
        <Link
          href='/about'
          className='text-brand-white hover:text-brand-copper transition-colors font-medium'>
          About
        </Link>
        <Link
          href='/plans'
          className='text-brand-white hover:text-brand-copper transition-colors font-medium'>
          Plans
        </Link>
        <Link
          href='/contact'
          className='text-brand-white hover:text-brand-copper transition-colors font-medium'>
          Contact
        </Link>

        {status === "loading" ? (
          <div className='text-brand-copper animate-pulse'>Loading...</div>
        ) : session ? (
          <div className='flex items-center space-x-4'>
            <Link
              href={`/${session.user.role}`}
              className='bg-brand-copper hover:bg-brand-copper-700 text-white px-4 py-2 rounded-brand font-medium transition-colors shadow-copper'>
              Dashboard
            </Link>
            <span className='text-brand-copper font-medium'>
              Hi, {session.user.name || session.user.email}
            </span>
            <button
              onClick={() => signOut()}
              className='text-red-300 hover:text-red-100 font-medium transition-colors'>
              Logout
            </button>
          </div>
        ) : (
          <div className='space-x-2'>
            <Link
              href='/login'
              className='text-brand-white hover:text-brand-copper font-medium transition-colors'>
              Login
            </Link>
            <Link
              href='/signup'
              className='bg-brand-brown hover:bg-brand-brown-700 text-white px-4 py-2 rounded-brand font-medium transition-colors'>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
