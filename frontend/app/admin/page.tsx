/**
 * Admin Root Page - Redirect to Dashboard
 * 
 * Redirige automáticamente a /admin/dashboard
 */

import { redirect } from 'next/navigation';

export default async function AdminPage() {
  redirect('/admin/dashboard');
}
