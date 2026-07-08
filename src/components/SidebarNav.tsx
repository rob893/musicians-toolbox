import { NavLink } from 'react-router';
import { Home, Settings } from 'lucide-react';
import { TOOLS } from '@/tools/registry';
import { cn } from '@/lib/utils';

/** Props for {@link SidebarNav}. */
export interface SidebarNavProps {
  /** Called after a navigation item is chosen (used to close the mobile drawer). */
  onNavigate?: () => void;
}

/** Shared navigation list: Home plus every registered tool. */
export function SidebarNav({ onNavigate }: SidebarNavProps): React.JSX.Element {
  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    );

  return (
    <nav className="flex flex-col gap-1">
      <NavLink to="/" end className={linkClass} onClick={onNavigate}>
        <Home className="size-4 shrink-0" />
        Home
      </NavLink>

      <p className="text-muted-foreground/70 mt-4 mb-1 px-3 text-xs font-semibold tracking-wide uppercase">Tools</p>

      {TOOLS.map(tool => {
        const Icon = tool.icon;
        const isSoon = tool.status === 'coming-soon';
        return (
          <NavLink
            key={tool.id}
            to={tool.path}
            className={({ isActive }) =>
              cn(linkClass({ isActive: isActive && !isSoon }), isSoon && 'cursor-default opacity-60')
            }
            onClick={event => {
              if (isSoon) {
                event.preventDefault();
                return;
              }
              onNavigate?.();
            }}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{tool.name}</span>
            {isSoon && <span className="text-[10px] tracking-wide uppercase opacity-70">Soon</span>}
          </NavLink>
        );
      })}

      <p className="text-muted-foreground/70 mt-4 mb-1 px-3 text-xs font-semibold tracking-wide uppercase">General</p>

      <NavLink to="/settings" className={linkClass} onClick={onNavigate}>
        <Settings className="size-4 shrink-0" />
        Settings
      </NavLink>
    </nav>
  );
}
