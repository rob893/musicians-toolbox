import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

/** Fallback page for unknown routes. */
export function NotFoundPage(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-primary text-5xl font-bold">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">That tool or page doesn&apos;t exist.</p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
