"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/user/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        setError("Failed to load user data");
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Pseudo:</strong> {user.pseudo}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {/* Ajoute d'autres informations selon tes besoins */}
      <button onClick={() => router.push("/edit-profile")} className="btn mt-4">Edit Profile</button>
    </div>
  );
}
