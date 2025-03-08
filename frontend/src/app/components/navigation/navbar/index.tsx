import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "../../buttons/Button";
import SearchBar from "./SearchBar";

const Navbar = () => {
    return (
        <>
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
                            <li>
                                <Link href="/favorites">
                                    <p>Favorites</p>
                                </Link>
                            </li>
                        </ul>
                        <SearchBar />
                        <div className="hidden md:flex gap-x-2">
                            <Button label="Login" />
                            <Button label="Sign Up" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;