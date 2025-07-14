import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/Provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ProductPage } from "./components/products/ProductPage";
import { BrandPage } from "./components/brands/BrandPage";
import { BrandProfilePage } from "./components/brands/BrandProfilePage";
import { AppLayout } from "./components/layout/AppLayout";
import { AllBrandsPage } from "./pages/AllBrandsPage";
import { CategoryPage } from "./pages/CategoryPage";
import { BrandSignUpForm } from "./components/auth/BrandSignUpForm";
import { NewBrandsPage } from "./pages/NewBrandsPage";
import { FeaturedBrandsPage } from "./pages/FeaturedBrandsPage";
import { FoodsPage } from "./pages/FoodsPage";
import { BrandBlogPostPage } from "./components/brands/BrandBlogPostPage";
import WishlistPage from './pages/WishlistPage';
import { CompareProvider } from './contexts/CompareContext';
import { CompareBar } from './components/CompareBar';
import ComparePage from './pages/ComparePage';
import { AdminBlogListPage } from "./pages/AdminBlogListPage";
import { AdminBlogPostPage } from "./pages/AdminBlogPostPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.log('🔄 Query retry attempt:', failureCount, error);
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => {
  console.log('🚀 App component rendering');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CompareProvider>
                <CompareBar />
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/brand/:id" element={<BrandPage />} />
                    <Route path="/brands/new" element={<NewBrandsPage />} />
                    <Route path="/brands/featured" element={<FeaturedBrandsPage />} />
                    <Route path="/brands/:id" element={<BrandProfilePage />} />
                    <Route path="/brands/:brandId/blog/:postId" element={<BrandBlogPostPage />} />
                    <Route path="/brands" element={<AllBrandsPage />} />
                    <Route path="/category/:categoryName" element={<CategoryPage />} />
                    <Route path="/foods" element={<FoodsPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/admin-blog" element={<AdminBlogListPage />} />
                    <Route path="/admin-blog/:postId" element={<AdminBlogPostPage />} />
                  </Route>
                  <Route path="/brand-signup" element={<BrandSignUpForm />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CompareProvider>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
