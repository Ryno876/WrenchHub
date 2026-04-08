import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Join WrenchHub
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Create your free account
        </p>
        <AuthForm mode="register" />
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-orange font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
