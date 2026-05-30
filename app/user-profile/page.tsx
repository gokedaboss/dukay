import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ backgroundColor: "#111111" }}>
      <UserProfile path="/user-profile" routing="path" />
    </div>
  );
}