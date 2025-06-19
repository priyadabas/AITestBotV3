import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentProjectId: number;
}

export default function Sidebar({ currentProjectId }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/upload", icon: "fas fa-upload", label: "Upload & Setup" },
    { href: "/analysis", icon: "fas fa-brain", label: "AI Analysis" },
    { href: "/test-cases", icon: "fas fa-list-check", label: "Test Cases" },
    { href: "/bot-execution", icon: "fas fa-play", label: "Bot Execution" },
    { href: "/dashboard", icon: "fas fa-chart-line", label: "Results Dashboard" },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">UAT Bot</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    location === item.href || (location === "/" && item.href === "/upload")
                      ? "text-white bg-primary"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-slate-600 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">John Smith</p>
            <p className="text-xs text-slate-500">Product Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
