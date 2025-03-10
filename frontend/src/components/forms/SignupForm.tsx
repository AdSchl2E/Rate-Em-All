"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../../lib/api";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", pseudo: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signup(form);

    if (!res.ok) {
      setError("Signup failed");
      return;
    }

    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="name" placeholder="Name" onChange={handleChange} className="input" required />
      <input name="pseudo" placeholder="Pseudo" onChange={handleChange} className="input" required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input" required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" required />
      <button type="submit" className="btn">Sign Up</button>
    </form>
  );
}
