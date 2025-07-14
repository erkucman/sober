import { useUserStats } from '@/hooks/useUserStats';
import { StatCard } from './StatCard';
import { Heart, Star, Wine } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardStats = () => {
  const { data: stats } = useUserStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Link to="/wishlist" className="block">
        <StatCard
          title="My Wishlists"
          value={stats?.listsCount ?? 0}
          description={`${stats?.wishlistedItemsCount ?? 0} items saved`}
          icon={Heart}
        />
      </Link>
      <StatCard
        title="My Reviews"
        value={stats?.reviewsCount ?? 0}
        description="Reviews written"
        icon={Star}
      />
      <StatCard
        title="Discovered"
        value={stats?.discoveredCount ?? 0}
        description="Products explored"
        icon={Wine}
      />
    </div>
  );
};
