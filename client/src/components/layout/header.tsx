import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: "plus";
    disabled?: boolean;
  };
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        {action && (
          <div className="flex items-center space-x-4">
            <Button 
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex items-center space-x-2"
            >
              {action.icon === "plus" && <Plus className="h-4 w-4" />}
              <span>{action.label}</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
