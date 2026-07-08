import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TOOLS } from '@/tools/registry';

/** Home dashboard: a responsive grid of tool cards generated from the registry. */
export function HomePage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Musician&apos;s Toolbox</h1>
        <p className="text-muted-foreground mt-1">A growing set of browser-based tools for musicians.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          const isAvailable = tool.status === 'available';

          const card = (
            <Card
              className={cn(
                'h-full transition-colors',
                isAvailable ? 'hover:border-primary/60 cursor-pointer' : 'opacity-70'
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {tool.name}
                      {!isAvailable && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                          Soon
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  {isAvailable && <ArrowRight className="text-muted-foreground size-4" />}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          );

          return isAvailable ? (
            <Link key={tool.id} to={tool.path} className="block">
              {card}
            </Link>
          ) : (
            <div key={tool.id} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
