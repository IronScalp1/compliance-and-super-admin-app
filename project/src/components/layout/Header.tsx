import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Building } from 'lucide-react';

export function Header() {
  const { user, currentAgency, signOut, impersonation, stopImpersonation } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleStopImpersonation = async () => {
    await stopImpersonation();
  };

  const displayName = impersonation.is_impersonating 
    ? impersonation.target_agency?.name 
    : currentAgency?.name || user?.full_name;

  const initials = displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'FC';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {impersonation.is_impersonating && (
            <div className="flex items-center space-x-2 text-sm">
              <Building className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600">Viewing as:</span>
              <span className="font-medium text-[#0A0A0A]">{impersonation.target_agency?.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {impersonation.is_impersonating && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStopImpersonation}
            >
              Exit Impersonation
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {currentAgency && !impersonation.is_impersonating && (
                    <p className="text-xs leading-none text-blue-600 font-medium">
                      {currentAgency.name}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}