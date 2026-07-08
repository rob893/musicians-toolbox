import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarNav } from '@/components/SidebarNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

/** Brand mark linking back to the home dashboard. */
function Brand(): React.JSX.Element {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
        <Wrench className="size-5" />
      </span>
      <span className="text-base leading-tight font-bold">
        Musician&apos;s
        <br />
        Toolbox
      </span>
    </Link>
  );
}

/** Props for {@link AppLayout}. */
export interface AppLayoutProps {
  /** Routed page content. */
  children: React.ReactNode;
}

/**
 * App shell for the multi-tool toolbox: a persistent sidebar on desktop and a
 * slide-over drawer on mobile, plus a sticky top bar with the brand and theme
 * toggle. The mobile drawer closes automatically on navigation.
 */
export function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="bg-card fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r p-4 lg:flex">
        <div className="mb-6 px-1">
          <Brand />
        </div>
        <SidebarNav />
        <p className="text-muted-foreground/70 mt-auto px-3 pt-4 text-xs">Runs entirely in your browser.</p>
      </aside>

      {/* Mobile drawer + backdrop */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-black/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={cn(
            'bg-card absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r p-4 shadow-xl transition-transform',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          role="dialog"
          aria-label="Navigation"
        >
          <div className="mb-6 flex items-center justify-between">
            <Brand />
            <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X />
            </Button>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="bg-background/80 sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="text-muted-foreground border-t px-4 py-4 text-center text-xs">
          Musician&apos;s Toolbox — no account, no upload, everything runs locally.
        </footer>
      </div>
    </div>
  );
}
