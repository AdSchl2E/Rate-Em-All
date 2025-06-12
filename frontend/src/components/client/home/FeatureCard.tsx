import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color?: string;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon, 
  color = "blue"
}: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    red: "from-red-500/20 to-red-600/20 border-red-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30"
  };
  
  const iconColorClasses: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400"
  };
  
  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br border ${colorClasses[color] || colorClasses.blue}`}>
      <div className={`mb-4 ${iconColorClasses[color] || iconColorClasses.blue}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}