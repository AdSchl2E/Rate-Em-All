"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log(session);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Pseudo:</strong> {session?.user?.pseudo}</p>
      <p><strong>Email:</strong> {session?.user?.email}</p>
      <button onClick={() => router.push("/edit-profile")} className="btn mt-4">Edit Profile</button>
    </div>
  );
}
