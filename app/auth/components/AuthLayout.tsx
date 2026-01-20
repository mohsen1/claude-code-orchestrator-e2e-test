import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  linkHref: string;
  linkText: string;
  linkLabel: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  linkHref,
  linkText,
  linkLabel,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold text-primary-600">SplitEase</h1>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}{' '}
            <Link href={linkHref} className="font-medium text-primary-600 hover:text-primary-500">
              {linkText}
            </Link>
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
