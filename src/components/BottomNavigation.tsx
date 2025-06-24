import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, Star, Wand2, Compass } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only show on mobile and tablet, hide on desktop
  if (!isMobile) {
    return null;
  }
  const navItems = [{
    icon: Home,
    label: 'Início',
    path: '/',
    activeColor: 'from-magical-gold to-magical-bronze'
  }, {
    icon: Book,
    label: 'Categorias',
    path: '/categorias',
    activeColor: 'from-magical-mysticalPurple to-magical-deepPurple'
  }, {
    icon: Star,
    label: 'Favoritos',
    path: '/favoritos',
    activeColor: 'from-magical-crimson to-magical-gold'
  }, {
    icon: Wand2,
    label: 'Novidades',
    path: '/novos',
    activeColor: 'from-magical-emerald to-magical-gold'
  }, {
    icon: Compass,
    label: 'Explorar',
    path: '/explorar',
    activeColor: 'from-magical-silver to-magical-gold'
  }];
  const isActive = (path: string) => location.pathname === path;
  return <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-magical-deepPurple/90 via-magical-mysticalPurple/90 to-magical-deepPurple/90 border-t border-magical-gold/30 backdrop-blur-xl shadow-2xl">
      
      
      {/* Subtle magical sparkle effects */}
      <div className="absolute top-0 left-1/4 w-0.5 h-0.5 bg-magical-gold rounded-full animate-sparkle opacity-30"></div>
      <div className="absolute top-1 right-1/3 w-0.5 h-0.5 bg-magical-silver rounded-full animate-sparkle opacity-25" style={{
      animationDelay: '1s'
    }}></div>
      <div className="absolute top-0 right-1/4 w-0.5 h-0.5 bg-magical-bronze rounded-full animate-sparkle opacity-20" style={{
      animationDelay: '2s'
    }}></div>
    </div>;
};