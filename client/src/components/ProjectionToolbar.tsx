import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, TrendingUp, Navigation } from "lucide-react";

interface ProjectionToolbarProps {
  onAddInvestment: () => void;
  onAddCost: () => void;
  onNavigateToSection: (section: 'settings' | 'investments' | 'costs') => void;
}

export function ProjectionToolbar({ onAddInvestment, onAddCost, onNavigateToSection }: ProjectionToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        onClick={onAddInvestment}
        data-testid="button-add-investment"
        size="sm"
        variant="outline"
        className="gap-1.5 h-8"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        Add Investment
      </Button>
      
      <Button
        onClick={onAddCost}
        data-testid="button-add-cost"
        size="sm"
        variant="outline"
        className="gap-1.5 h-8"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Cost
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-navigate-sections"
            className="gap-1.5 h-8"
          >
            <Navigation className="h-3.5 w-3.5" />
            Jump To
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onNavigateToSection('settings')} data-testid="menu-nav-settings">
            Initial Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onNavigateToSection('investments')} data-testid="menu-nav-investments">
            Investment Income
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigateToSection('costs')} data-testid="menu-nav-costs">
            Projected Costs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
