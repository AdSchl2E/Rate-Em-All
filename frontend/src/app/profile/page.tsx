"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUser, FaStar, FaHeart, FaCalendarAlt, FaBars, FaChartPie, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getUserFavoritePokemons } from '../../lib/api';
import Link from 'next/link';

interface PokemonBasic {
  id: number;
  name: string;
  sprites: { front_default: string };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favoritePokemons, setFavoritePokemons] = useState<PokemonBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'settings'>('overview');
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user?.id || !session?.accessToken) return;
      
      try {
        // Fetch user favorites
        const data = await getUserFavoritePokemons(session.user.id as number, session.accessToken);
        if (data.favorites && data.favorites.length) {
          // Fetch basic details for each Pokemon
          const details = await Promise.all(
            data.favorites.map(async (id: number) => {
              const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
              const pokemon = await res.json();
              return {
                id: pokemon.id,
                name: pokemon.name,
                sprites: { front_default: pokemon.sprites.front_default }
              };
            })
          );
          setFavoritePokemons(details);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [session]);

  const handleTabChange = (tab: 'overview' | 'stats' | 'settings') => {
    setActiveTab(tab);
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (!session || !session.user) {
    return <p>Error: Unable to load session data.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
              <img src={session.user.image} alt="Profile Picture" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{session.user.name}</h2>
              <p className="text-gray-600">{session.user.email}</p>
            </div>
          </div>
          <button onClick={() => router.push("/edit-profile")} className="btn">
            Edit Profile
          </button>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2
            ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <FaUser />
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleTabChange('stats')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2
            ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <FaChartPie />
            <span>Stats</span>
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2
            ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">User Details</h3>
            <p><strong>Id : </strong>{session.user.id}</p>
            <p><strong>Name : </strong>{session.user.name}</p>
            <p><strong>Email : </strong>{session.user.email}</p>
            <p><strong>Pseudo : </strong>{session.user.pseudo}</p>
            <p><strong>Created at : </strong>{new Date(session.user.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated at : </strong>{new Date(session.user.updatedAt).toLocaleDateString()}</p>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">User Stats</h3>
            <p><strong>Rated Pokemons : </strong>{session.user.ratedPokemons.length}</p>
            <p><strong>Favorite Pokemons : </strong>{session.user.favoritePokemons.length}</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <p><strong>Access Token : </strong>{session.accessToken}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Favorite Pokemons</h2>
        {loading ? (
          <p>Loading favorite pokemons...</p>
        ) : favoritePokemons.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoritePokemons.map(pokemon => (
              <div key={pokemon.id} className="border rounded-lg overflow-hidden shadow-md">
                <Link href={`/pokemon/${pokemon.id}`} className="block p-4">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 mb-2">
                      <img src={pokemon.sprites.front_default} alt={pokemon.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold">{pokemon.name}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No favorite pokemons found.</p>
        )}
      </div>
    </div>
  );
}
