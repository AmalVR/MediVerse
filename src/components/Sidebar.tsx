import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRole, useUser } from "@/contexts/UserContext";
import {
  Menu,
  X,
  Play,
  Video,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  CreditCard,
  User,
  Building2,
  BarChart3,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  selectedCategory,
  onCategoryChange,
}: SidebarProps) {
  const { user, isStudent, isMentor, isPlatformAdmin } = useAuth();
  const { logout } = useUser();
  const {
    canViewLiveSessions,
    canAccessGeneralContent,
    canAccessMoodleFeatures,
    canViewCommission,
    canAccessAdminPanel,
  } = useRole();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigationItems = [
    // Common items for all authenticated users
    ...(canViewLiveSessions
      ? [
          {
            id: "live-sessions",
            label: "Live Sessions",
            icon: Play,
            description: "Join live learning sessions",
          },
        ]
      : []),

    ...(canAccessGeneralContent
      ? [
          {
            id: "videos",
            label: "Videos",
            icon: Video,
            description: "Educational videos",
          },
        ]
      : []),

    ...(canAccessGeneralContent
      ? [
          {
            id: "mentors",
            label: "Mentors",
            icon: Users,
            description: "Find learning mentors",
          },
        ]
      : []),

    // Student-specific items
    ...(isStudent
      ? [
          {
            id: "courses",
            label: "My Courses",
            icon: BookOpen,
            description: "Enrolled courses",
          },
        ]
      : []),

    // Mentor-specific items
    ...(isMentor
      ? [
          {
            id: "teach",
            label: "Teach Mode",
            icon: GraduationCap,
            description: "Create and manage courses",
          },
        ]
      : []),

    ...(canAccessMoodleFeatures
      ? [
          {
            id: "moodle",
            label: "Moodle LMS",
            icon: Building2,
            description: "Learning management system",
          },
        ]
      : []),

    ...(canViewCommission
      ? [
          {
            id: "earnings",
            label: "Earnings",
            icon: BarChart3,
            description: "Commission and analytics",
          },
        ]
      : []),

    // Platform admin items
    ...(canAccessAdminPanel
      ? [
          {
            id: "admin",
            label: "Admin Panel",
            icon: Settings,
            description: "Platform administration",
          },
        ]
      : []),
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange?.(categoryId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300
        ${isOpen ? "w-64" : "w-16"}
        lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">MediVerse</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hidden lg:flex"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* User Info */}
        {isOpen && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge
                    variant={
                      isStudent
                        ? "secondary"
                        : isMentor
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {isStudent ? "Student" : isMentor ? "Mentor" : "Admin"}
                  </Badge>
                  {isMentor && user.organizationName && (
                    <span className="text-xs text-gray-500 truncate">
                      {user.organizationName}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
