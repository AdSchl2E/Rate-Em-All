'use client';

import React from 'react';
import { useState } from 'react';
import Button from "../../buttons/Button";

const SearchBar = () => {
    const [query, setQuery] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        // Perform search logic here, e.g., fetch data from server
        console.log('Searching for:', query);
    };

    return (
        <form onSubmit={handleSearch} className='flex items-center space-x-1'>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className='px-4 py-2 border border-gray-700 rounded-md'
            />
            <Button label="Search" />
        </form>
    );
};

export default SearchBar;