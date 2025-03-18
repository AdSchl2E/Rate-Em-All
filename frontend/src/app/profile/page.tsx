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

  if (!session || !session.user) {
    return <p>Error: Unable to load session data.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Id : </strong>{session.user.id}</p>
      <p><strong>Name : </strong>{session.user.name}</p>
      <p><strong>Email : </strong>{session.user.email}</p>
      <p><strong>Pseudo : </strong>{session.user.pseudo}</p>
      <p><strong>Created at : </strong>{session.user.createdAt}</p>
      <p><strong>Updated at : </strong>{session.user.updatedAt}</p>
      <p><strong>Rated Pokemons : </strong>{session.user.ratedPokemons.join(", ")}</p>
      <p><strong>Favorite Pokemons : </strong>{session.user.favoritePokemons.join(", ")}</p>
      <p><strong>Access Token : </strong>{session.accessToken}</p>
      
      <button onClick={() => router.push("/edit-profile")} className="btn mt-4">Edit Profile</button>
    </div>
  );
}
