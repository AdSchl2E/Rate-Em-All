import React from 'react';
import Button from './components/buttons/Button';

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white text-center py-20">
        <h1 className="text-4xl font-bold">Rate and Discover the Community's Favorite Pokémon!</h1>
        <p className="text-xl mt-4">Create an account and join the adventure!</p>
        <div className="mt-8">
          {/* Dynamic Illustration */}
          <div className="carousel">
            {/* Add your carousel component or images here */}
            {/* A voir avec du random via l'api */}
          </div>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <Button label="Sign Up" />
          <Button label="Login" />
        </div>
      </section>

      {/* Trending Pokémon Section */}
      <section className="bg-gray-800 py-20">
        <h2 className="text-3xl font-bold text-center">Trending Pokémon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8 px-4">
          {/* Example Pokémon Card */}
          <div className="bg-gray-900 p-4 rounded shadow">
            <img alt="Pokémon" className="w-full h-32 object-contain" />
            <div className="mt-4">
              <p className="text-lg font-bold">Pokémon Name</p>
              <p className="text-sm">Average Rating: 4.5</p>
              <div className="flex justify-right mt-4 space-x-1">
                <Button label="Rate" />
                <Button label="Details" />
              </div>
            </div>
          </div>
          {/* Repeat Pokémon cards as needed */}
          <div className="bg-gray-900 p-4 rounded shadow">
            <img alt="Pokémon" className="w-full h-32 object-contain" />
            <div className="mt-4">
              <p className="text-lg font-bold">Pokémon Name</p>
              <p className="text-sm">Average Rating: 4.5</p>
              <div className="flex justify-right mt-4 space-x-1">
                <Button label="Rate" />
                <Button label="Details" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded shadow">
            <img alt="Pokémon" className="w-full h-32 object-contain" />
            <div className="mt-4">
              <p className="text-lg font-bold">Pokémon Name</p>
              <p className="text-sm">Average Rating: 4.5</p>
              <div className="flex justify-right mt-4 space-x-1">
                <Button label="Rate" />
                <Button label="Details" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded shadow">
            <img alt="Pokémon" className="w-full h-32 object-contain" />
            <div className="mt-4">
              <p className="text-lg font-bold">Pokémon Name</p>
              <p className="text-sm">Average Rating: 4.5</p>
              <div className="flex justify-right mt-4 space-x-1">
                <Button label="Rate" />
                <Button label="Details" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Top Favorites Section */}
      <section className="bg-gray-900 py-20">
        <h2 className="text-3xl font-bold text-center">Your Top Favorites</h2>
        <div className="flex justify-center mt-8">
          {/* If no favorites */}
          <p className="text-lg">You have no favorites yet. Add some!</p>
          {/* If favorites exist, display them in a row */}
          {/* Example Favorite Pokémon */}
          <div className="flex space-x-4">
            <div className="bg-gray-100 p-4 rounded shadow">
              <img src="favorite-pokemon-sprite-url" alt="Favorite Pokémon" className="w-24 h-24 object-contain" />
              <p className="text-center mt-2">Pokémon Name</p>
            </div>
            {/* Repeat favorite Pokémon as needed */}
          </div>
        </div>
      </section>

      {/* Why Join the Community Section */}
      <section className="bg-gray-800 py-20">
        <h2 className="text-3xl font-bold text-center">Why Join the Community?</h2>
        <div className="flex flex-wrap justify-center mt-8 space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center space-x-2">
            <p>Rate and review every Pokémon</p>
          </div>
          <div className="flex items-center space-x-2">
            <p>See what’s trending</p>
          </div>
          <div className="flex items-center space-x-2">
            <p>Compare your favorites with other players</p>
          </div>
          <div className="flex items-center space-x-2">
            <p>Check out the top-ranked Pokémon</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            {/* Social media links */}
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">Instagram</a>
          </div>
          <div className="space-y-2">
            <a href="#" className="hover:underline">Legal Notices</a>
            <a href="#" className="hover:underline">Contact Information</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;