"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { UserNav } from "./common/UserNav";


const Header = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#E1E1E1] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#172F50] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-[#172F50]">Dumbphone</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#download"
              className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
            >
              Download
            </Link>
            <Link
              href="/privacy"
              className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
            >
              Privacy
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <UserNav
                image={user?.imageUrl || ""}
                name={user?.fullName || ""}
                email={user?.primaryEmailAddress?.emailAddress || ""}
              />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-[#172F50] hover:text-[#0F1E35] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-[#172F50] text-white px-6 py-2 rounded-lg hover:bg-[#0F1E35] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-[#172F50]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E1E1E1]">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/#features"
                className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#download"
                className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Download
              </Link>
              <Link
                href="/privacy"
                className="text-[#7A7A7A] hover:text-[#172F50] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy
              </Link>
              {isSignedIn ? (
                <div className="pt-4 border-t border-[#E1E1E1]">
                  <UserNav
                    image={user?.imageUrl || ""}
                    name={user?.fullName || ""}
                    email={user?.primaryEmailAddress?.emailAddress || ""}
                  />
                </div>
              ) : (
                <div className="pt-4 border-t border-[#E1E1E1] space-y-2">
                  <Link
                    href="/sign-in"
                    className="block text-[#172F50] hover:text-[#0F1E35] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block bg-[#172F50] text-white px-6 py-2 rounded-lg hover:bg-[#0F1E35] transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
