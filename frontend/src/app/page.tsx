import { AuthProvider } from '@/src/lib/providers/AuthProvider';
import App from './app';

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
