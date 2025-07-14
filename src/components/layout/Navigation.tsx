import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/context';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Heart, List, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompare } from '@/contexts/CompareContext';

export function Navigation() {
  const { user, userRole, signOut } = useAuth();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const compare = useCompare();
  
  return (
    <nav className="bg-gray-600 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-orange-300">Product Portal</Link>
            
            {/* Main Navigation */}
            <div className="hidden md:flex ml-10 space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-orange-300">
                    Product Collection ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isLoadingCategories ? (
                    <>
                      <DropdownMenuItem><Skeleton className="h-4 w-24" /></DropdownMenuItem>
                      <DropdownMenuItem><Skeleton className="h-4 w-24" /></DropdownMenuItem>
                    </>
                  ) : (
                    categories?.map((category) => (
                      <DropdownMenuItem key={category.id} asChild>
                        <Link to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>{category.name}</Link>
                      </DropdownMenuItem>
                    ))
                  )}
                  {categories?.length === 0 && !isLoadingCategories && (
                    <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-orange-300">
                    Brands ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link to="/brands/featured">Featured Brands</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/brands/new">New Brands</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/brands">All Brands</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button asChild variant="ghost" className="text-white hover:text-orange-300">
                <Link to="/foods">Foods</Link>
              </Button>

              <Button asChild variant="ghost" className="text-white hover:text-orange-300">
                <Link to="/admin-blog">Blog</Link>
              </Button>

              <Button variant="ghost" className="text-white hover:text-orange-300">
                About Us
              </Button>
              <Button variant="ghost" className="text-white hover:text-orange-300">
                Contact
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-orange-300 relative">
                <Link to="/compare">
                  <GitCompare className="h-4 w-4 mr-1" />
                  Compare
                  {compare?.compareList?.length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-xs rounded-full px-1.5 py-0.5">{compare.compareList.length}</span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userRole && (
                  <span className="hidden md:inline px-2 py-1 text-xs font-medium bg-orange-600 text-white rounded-full">
                    {userRole.replace('_', ' ').toUpperCase()}
                  </span>
                )}
                
                {/* User Actions */}
                <Button asChild variant="ghost" size="icon" className="text-white hover:text-orange-300">
                  <Link to="/wishlist" aria-label="Wishlist">
                    <Heart className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:text-orange-300">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:text-orange-300">
                  <Settings className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-orange-300">
                      {user.email} ▼
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-600">
                  Login
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
