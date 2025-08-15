import React from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import { Settings, User } from "lucide-react";

interface HeaderProps {
  title?: string;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Munchi",
  onProfileClick,
}) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onProfileClick}>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </div>
  </header>
);

export default Header;
