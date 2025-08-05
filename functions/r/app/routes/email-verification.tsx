import type { Route } from "./+types/email-verification";

export default function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Email Verification</h1>
      <p className="mt-4">Please check your email to verify your account.</p>
    </div>
  );
}
