import { redirect } from 'next/navigation';

/** Redirige a la pantalla unificada de auth en modo registro */
export default async function RegisterPage() {
  redirect('/auth?mode=register');
}
