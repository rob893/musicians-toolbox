import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button-variants';

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the child element (via Radix `Slot`) instead of a `<button>`. */
    asChild?: boolean;
  };

/**
 * Themeable button built on shadcn/ui conventions.
 * @param variant Visual style (default, destructive, outline, secondary, ghost, link).
 * @param size Sizing token (default, sm, lg, icon).
 * @param asChild When true, renders the single child element with button styling applied.
 */
function Button({ className, variant, size, asChild = false, ...props }: ButtonProps): React.JSX.Element {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
