
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const DashboardHeader = () => (
  <div className="text-center py-8">
    <h1 className="text-4xl font-bold text-orange-800 mb-2">Welcome to Product Portal</h1>
    <p className="text-lg text-muted-foreground mb-6">Discover amazing products from verified brands</p>
    
    <div className="max-w-2xl mx-auto relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search for products, brands, or categories..." 
        className="pl-10 h-12 text-lg"
      />
    </div>
  </div>
);
