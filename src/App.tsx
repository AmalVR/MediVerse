import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider, useAuth } from "@/contexts/UserContext";
import { AuthPanel } from "@/components/AuthPanel";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { PaymentWall } from "@/components/PaymentWall";
import { Sidebar } from "@/components/Sidebar";
import Index from "./pages/Index";
import UnifiedLearning from "./pages/UnifiedLearning";
import LearnMode from "./pages/LearnMode";
import TeachMode from "./pages/TeachMode";
import GroupStudyMode from "./pages/GroupStudyMode";
import CreateSession from "./pages/CreateSession";
import NotFound from "./pages/NotFound";

function AppContent() {
  const { isAuthenticated, status, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem("mediverse_sidebar_open");
    return saved ? JSON.parse(saved) : false;
  });
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Auto-expand sidebar when user logs in
  useEffect(() => {
    if (isAuthenticated && !sidebarOpen) {
      setSidebarOpen(true);
    }
  }, [isAuthenticated, sidebarOpen]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mediverse_sidebar_open", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Show auth panel if not authenticated
  const showAuthPanel = !isAuthenticated && authPanelOpen;
  // Show onboarding if user is in onboarding status
  const showOnboarding = status === "onboarding";
  // Show payment wall if mentor hasn't paid platform fee
  const showPaymentWall =
    isAuthenticated && user?.role === "mentor" && !user?.platformFeePaid;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - only show if authenticated */}
      {isAuthenticated && (
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isAuthenticated ? (sidebarOpen ? "ml-64" : "ml-16") : "ml-0"
        }`}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learn/:system" element={<UnifiedLearning />} />
          <Route path="/learn" element={<LearnMode />} />
          <Route path="/teach" element={<TeachMode />} />
          <Route path="/teach/create-session" element={<CreateSession />} />
          <Route path="/group-study" element={<GroupStudyMode />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/teacher" element={<TeachMode />} />
          <Route path="/student" element={<LearnMode />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Auth Panel - slides in from right when not authenticated */}
      {showAuthPanel && <AuthPanel onClose={() => setAuthPanelOpen(false)} />}

      {/* Onboarding Panel - modal overlay */}
      {showOnboarding && (
        <OnboardingPanel onComplete={() => setAuthPanelOpen(false)} />
      )}

      {/* Payment Wall - modal overlay for mentors */}
      {showPaymentWall && (
        <PaymentWall onPaymentComplete={() => setAuthPanelOpen(false)} />
      )}

      {/* Auth Button - only show if not authenticated */}
      {!isAuthenticated && !showAuthPanel && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => setAuthPanelOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition-colors"
          >
            Sign In / Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <UserProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  );
}

export default App;
