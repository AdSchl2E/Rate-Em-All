"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import Button from "../../buttons/Button";
import SearchBar from "./SearchBar";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const Navbar = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    return (
        <div className="w-full h-20 sticky top-0 bg-gray-950 z-50">
            <div className="container mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full">
                    <Logo />
                    <ul className="hidden md:flex gap-x-6 text-white">
                        <li>
                            <Link href="/">
                                <p>Home</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/top-rated">
                                <p>Top Rated</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/explorer">
                                <p>Explorer</p>
                            </Link>
                        </li>
                        {session && (
                            <li>
                                <Link href="/favorites">
                                    <p>Favorites</p>
                                </Link>
                            </li>
                        )}
                    </ul>
                    <SearchBar />
                    <div className="hidden md:flex gap-x-2">
                        {status === "loading" ? (
                            <p className="text-white">Chargement...</p>
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile">
                                    <UserCircleIcon className="h-8 w-8 text-white cursor-pointer" />
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="text-white underline text-sm"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <>
                                <Button label="Login" onClick={() => router.push("/login")} />
                                <Button label="Sign Up" onClick={() => router.push("/signup")} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
