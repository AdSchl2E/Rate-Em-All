import React from 'react';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}

const Button = ({ label, onClick, disabled }: ButtonProps) => {
    return (
        <button
            className={`px-6 py-2 text-white bg-gray-800 rounded-md transition-colors duration-200 border border-gray-700
                ${disabled ? "cursor-not-allowed" : "hover:bg-white hover:text-gray-800 cursor-pointer"
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
}

export default Button;