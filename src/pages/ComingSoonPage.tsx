import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Props for {@link ComingSoonPage}. */
export interface ComingSoonPageProps {
  /** Tool name shown in the heading. */
  name: string;
  /** Short description of what the tool will do. */
  description: string;
  /** Tool icon. */
  icon: LucideIcon;
}

/** Placeholder page for tools that are registered but not yet implemented. */
export function ComingSoonPage({ name, description, icon: Icon }: ComingSoonPageProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </span>
          <CardTitle className="flex items-center gap-2">
            {name}
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              Coming soon
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
