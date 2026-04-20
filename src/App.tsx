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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/apple-repair" element={<AppleRepair />} />
          <Route path="/wifi-network" element={<WifiNetwork />} />
          <Route path="/smart-home" element={<SmartHome />} />
          <Route path="/tv-audio" element={<TVAudio />} />
          <Route path="/business-it" element={<BusinessIT />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Martha's Vineyard Business Directory */}
          <Route path="/marthas-vineyard" element={<DirectoryIndex />} />
          <Route path="/marthas-vineyard/submit" element={<SubmitBusiness />} />
          {/* Island-wide business type pages */}
          <Route path="/marthas-vineyard/restaurants" element={<BusinessTypePage />} />
          <Route path="/marthas-vineyard/lodging" element={<BusinessTypePage />} />
          <Route path="/marthas-vineyard/shopping" element={<BusinessTypePage />} />
          <Route path="/marthas-vineyard/health-wellness" element={<BusinessTypePage />} />
          <Route path="/marthas-vineyard/contractors" element={<BusinessTypePage />} />
          <Route path="/marthas-vineyard/professional-services" element={<BusinessTypePage />} />
          <Route path="/marthas-vineyard/community" element={<BusinessTypePage />} />
          {/* Town pages */}
          <Route path="/marthas-vineyard/:townSlug" element={<TownPage />} />
          <Route path="/marthas-vineyard/:townSlug/:typeSlug" element={<TownBusinessTypePage />} />
          <Route path="/marthas-vineyard/:townSlug/:typeSlug/:businessSlug" element={<BusinessPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
