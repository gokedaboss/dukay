import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#111111] flex items-center justify-center">
      <SignUp />
    </main>
  );
}