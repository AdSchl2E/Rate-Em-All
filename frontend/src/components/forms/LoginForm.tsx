"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/profile");
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-800 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" required />
        <button type="submit" className="btn w-full">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
