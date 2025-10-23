import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import UnifiedLearning from "./pages/UnifiedLearning";
import LearnMode from "./pages/LearnMode";
import TeachMode from "./pages/TeachMode";
import GroupStudyMode from "./pages/GroupStudyMode";
import CreateSession from "./pages/CreateSession";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
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
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </UserProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
