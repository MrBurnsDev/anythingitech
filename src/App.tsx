import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Services from "./pages/Services.tsx";
import AppleRepair from "./pages/AppleRepair.tsx";
import WifiNetwork from "./pages/WifiNetwork.tsx";
import SmartHome from "./pages/SmartHome.tsx";
import TVAudio from "./pages/TVAudio.tsx";
import BusinessIT from "./pages/BusinessIT.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";

// Directory pages
import DirectoryIndex from "./pages/directory/DirectoryIndex.tsx";
import TownPage from "./pages/directory/TownPage.tsx";
import BusinessTypePage from "./pages/directory/BusinessTypePage.tsx";
import TownBusinessTypePage from "./pages/directory/TownBusinessTypePage.tsx";
import BusinessPage from "./pages/directory/BusinessPage.tsx";
import SubmitBusiness from "./pages/directory/SubmitBusiness.tsx";
import DirectorySlugResolver from "./pages/directory/DirectorySlugResolver.tsx";

// Tech Tips pages
import TechTipsIndex from "./pages/tech-tips/TechTipsIndex.tsx";
import TechTipPost from "./pages/tech-tips/TechTipPost.tsx";

// Admin pages
import { AdminAuthProvider } from "./contexts/AdminAuthContext.tsx";
import { ProtectedRoute } from "./components/admin/ProtectedRoute.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBusinessList from "./pages/admin/AdminBusinessList.tsx";
import AdminBusinessEdit from "./pages/admin/AdminBusinessEdit.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          {/* Service pages under /services/ for SEO */}
          <Route path="/services/apple-repair" element={<AppleRepair />} />
          <Route path="/services/wifi-network" element={<WifiNetwork />} />
          <Route path="/services/smart-home" element={<SmartHome />} />
          <Route path="/services/tv-audio" element={<TVAudio />} />
          <Route path="/services/business-it" element={<BusinessIT />} />
          {/* Legacy routes - redirect via vercel.json */}
          <Route path="/apple-repair" element={<AppleRepair />} />
          <Route path="/wifi-network" element={<WifiNetwork />} />
          <Route path="/smart-home" element={<SmartHome />} />
          <Route path="/tv-audio" element={<TVAudio />} />
          <Route path="/business-it" element={<BusinessIT />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Tech Tips Blog */}
          <Route path="/tech-tips" element={<TechTipsIndex />} />
          <Route path="/tech-tips/:slug" element={<TechTipPost />} />

          {/* Martha's Vineyard Business Directory */}
          <Route path="/marthas-vineyard" element={<DirectoryIndex />} />
          <Route path="/marthas-vineyard/submit" element={<SubmitBusiness />} />
          {/* Dynamic slug resolver - determines if slug is a town or business type */}
          <Route path="/marthas-vineyard/:slug" element={<DirectorySlugResolver />} />
          <Route path="/marthas-vineyard/:townSlug/:typeSlug" element={<TownBusinessTypePage />} />
          <Route path="/marthas-vineyard/:townSlug/:typeSlug/:businessSlug" element={<BusinessPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/businesses"
            element={
              <ProtectedRoute>
                <AdminBusinessList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/businesses/new"
            element={
              <ProtectedRoute>
                <AdminBusinessEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/businesses/:id/edit"
            element={
              <ProtectedRoute>
                <AdminBusinessEdit />
              </ProtectedRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
