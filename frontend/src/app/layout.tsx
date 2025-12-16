import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'BongkarDev',
  description: 'DevTools berbasis web via proxy CDP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
