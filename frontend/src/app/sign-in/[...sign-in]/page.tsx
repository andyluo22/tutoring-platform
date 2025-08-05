// frontend/src/app/sign-in/[[...sign-in]]/page.tsx
'use client';
import { SignIn } from '@clerk/nextjs';

export default function SignInCatchallPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <SignIn path="/sign-in" signUpUrl="/sign-up" routing="path" />
      </div>
    </div>
  );
}