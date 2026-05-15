import { AuthProvider } from '../providers/AuthProvider';

export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
