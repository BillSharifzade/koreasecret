import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/admin/admin.css';
import { AdminApp } from '@/admin/shell/AdminApp';

export const metadata: Metadata = { title: 'Панель управления', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminApp>{children}</AdminApp>;
}
