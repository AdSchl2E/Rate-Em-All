'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Session } from 'next-auth';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserIcon, CogIcon } from '@heroicons/react/24/outline';
import { useGlobal } from '@/providers/GlobalProvider';

interface ProfileHeaderProps {
  session: Session | null;
  favoritesCount: number;
  ratedCount: number;
  averageRating: number;
}

export default function ProfileHeader({ 
  session, 
  favoritesCount, 
  ratedCount, 
  averageRating 
}: ProfileHeaderProps) {
  const { username } = useGlobal();
  
  const userName = username || session?.user?.name || "Utilisateur";
  const userImage = session?.user?.image;
  
  return (
    <motion.div
      className="bg-gray-800/80 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <motion.div 
          className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex-shrink-0"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {userImage ? (
            <Image
              src={userImage}
              width={96}
              height={96}
              alt={`${userName}'s avatar`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
          )}
        </motion.div>

        {/* User info and stats */}
        <div className="flex-grow flex flex-col sm:flex-row items-center sm:items-start sm:justify-between w-full">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold">{userName}</h1>
            <p className="text-gray-400">{session?.user?.email}</p>
          </div>

          {/* User stats */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Stats blocks */}
            <div className="flex gap-6 sm:gap-8">
              <StatBlock 
                value={favoritesCount} 
                label="Favoris" 
                color="text-red-400" 
                delay={0.3}
              />
              <StatBlock 
                value={ratedCount} 
                label="Notés" 
                color="text-amber-400" 
                delay={0.4}
              />
              <StatBlock 
                value={averageRating.toFixed(1)} 
                label="Note moyenne" 
                icon={<StarIcon className="h-4 w-4 text-amber-400 ml-1" />} 
                delay={0.5}
              />
            </div>
            
            {/* Settings button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href="/settings"
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                <span>Paramètres</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatBlockProps {
  value: number | string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
  delay?: number;
}

function StatBlock({ value, label, color = "", icon = null, delay = 0 }: StatBlockProps) {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className={`text-2xl font-bold flex items-center ${color}`}>
        {value}
        {icon}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}