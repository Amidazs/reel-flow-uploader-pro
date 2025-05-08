
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Uploads", href: "/uploads" },
    { label: "Analytics", href: "/analytics" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-r from-autoreel-primary to-autoreel-tertiary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold ml-2">
              <span className="gradient-text">AutoReel</span> Uploader
            </h1>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:text-autoreel-primary font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && isMobile && (
        <div className="fixed inset-0 top-16 bg-background/95 backdrop-blur-sm animate-fade-in z-40">
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xl font-medium hover:text-autoreel-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
