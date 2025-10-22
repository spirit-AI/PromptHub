'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { Menu, X, User, LogOut, Shield } from 'lucide-react';

// 创建一个独立的UserAvatar组件来减少重新渲染
const UserAvatar = ({ user }: { user: any }) => {
  const userInitial = useMemo(() => {
    return user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
  }, [user.username, user.email]);
  
  return (
    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
      <span className="font-medium text-primary-600">
        {userInitial}
      </span>
    </div>
  );
};

// 创建一个独立的NavLink组件来减少重新渲染
const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => {
  const className = useMemo(() => 
    `text-sm font-medium transition-colors hover:text-primary-500 ${
      isActive ? 'text-primary-500' : 'text-gray-600'
    }`, [isActive]);
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 处理退出登录
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-500">PromptHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/" isActive={pathname === '/'}>
              Home
            </NavLink>
            <NavLink href="/prompts" isActive={pathname === '/prompts'}>
              Prompts
            </NavLink>
            <NavLink href="/search" isActive={pathname === '/search'}>
              Search
            </NavLink>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <>
                <Link href="/upload">
                  <Button variant="outline" size="sm">
                    Upload Prompt
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <UserAvatar user={user} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username || user.email}</p>
                        <p className="text-xs leading-none text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  pathname === '/' ? 'text-primary-500' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/prompts"
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  pathname === '/prompts' ? 'text-primary-500' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Prompts
              </Link>
              <Link 
                href="/search"
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  pathname === '/search' ? 'text-primary-500' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              {user && (
                <>
                  <Link href="/upload" className="text-sm font-medium text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                    Upload Prompt
                  </Link>
                  <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-primary-500 text-left"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="text-sm font-medium text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}