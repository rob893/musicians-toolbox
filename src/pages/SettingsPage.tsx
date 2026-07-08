import { ThemeControl } from '@/components/ThemeControl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** Settings page: appearance/theme controls (mode + palette colours). */
export function SettingsPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">Personalize how the toolbox looks. Preferences are saved locally.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose a mode and accent colours.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeControl />
        </CardContent>
      </Card>
    </div>
  );
}
