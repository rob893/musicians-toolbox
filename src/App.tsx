import { Route, Routes } from 'react-router';
import { AppLayout } from '@/components/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { getToolElement, TOOLS } from '@/tools/registry';

/** Root component: wires the tool registry into routes inside the app shell. */
export default function App(): React.JSX.Element {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {TOOLS.map(tool => (
          <Route key={tool.id} path={tool.path} element={getToolElement(tool)} />
        ))}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
