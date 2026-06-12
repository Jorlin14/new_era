import { redirect } from 'next/navigation';

/** Redirige a la pantalla unificada de auth con animación */
export default async function LoginPage() {
  redirect('/auth');
}
