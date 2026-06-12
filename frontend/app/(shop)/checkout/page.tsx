/**
 * Checkout Page — New Era Supermercado
 *
 * Formulario de finalización de compra con resumen del carrito.
 * Usa los datos del usuario registrado y sus direcciones guardadas.
 *
 * @module app/(shop)/checkout/page
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategoryIcon from '@/components/CategoryIcon';
import { useCart } from '@/context/CartContext';
import { formatPrice, getOrderTotal, getShippingCost } from '@/lib/format';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { getCurrentUser } from '@/lib/api-admin';
import { getMyAddresses, createOrder, getWompiSignature } from '@/lib/api-customer';
import WompiWidget from '@/components/WompiWidget';
import Toast from '@/components/Toast';


interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentApproved, setPaymentApproved] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showWompi, setShowWompi] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const shippingCost = getShippingCost(totalPrice);
  const orderTotal = getOrderTotal(totalPrice);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      // Verificar token antes de hacer las llamadas
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // No hay token, redirigir al login
        router.push('/auth/login');
        return;
      }

      const [userData, addressData] = await Promise.all([
        getCurrentUser(),
        getMyAddresses()
      ]);
      
      setUser(userData);
      setAddresses(addressData);
      
      // Seleccionar dirección por defecto automáticamente
      const defaultAddress = addressData.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressData.length > 0) {
        setSelectedAddressId(addressData[0].id);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Si hay error de autenticación, redirigir al login
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceOrder(event: React.FormEvent) {
    event.preventDefault();
    
    if (!selectedAddressId) {
      setErrorMessage('Por favor selecciona una dirección de entrega');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price
        })),
        addressId: selectedAddressId,
        distance: 3 // Distancia por defecto (3 km), puede ser calculada dinámicamente después
      };

      const newOrder = await createOrder(orderData);
      
      // En lugar de ir directo a éxito, pedimos la firma de Wompi
      try {
        const sigData = await getWompiSignature(newOrder.id);
        setPaymentData(sigData);
        setOrderId(newOrder.id);
        setShowWompi(true);
      } catch (sigError: any) {
        console.error('Error obteniendo firma:', sigError);
        // Si falla la firma, al menos la orden se creó, pero avisamos al usuario
        setErrorMessage('La orden se creó pero hubo un error al iniciar la pasarela de pago. Por favor intenta pagar desde Mis Pedidos.');
        setOrderCreated(true); 
      }

    } catch (error: any) {
      setErrorMessage(error.message || 'Error al crear el pedido');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePaymentSuccess = (transaction: any) => {
    setShowWompi(false);
    clearCart();
    setPaymentApproved(true);
    setOrderCreated(true);
  };


  const handlePaymentError = (error: any) => {
    setShowWompi(false);
    setErrorMessage(`El pago fue rechazado o hubo un error: ${error.status_message || 'Error desconocido'}`);
  };

  const handlePaymentClose = () => {
    setShowWompi(false);
    // Si cerró el widget, la orden sigue creada en PENDING
    // No marcamos como aprobado, pero mostramos que la orden existe
    setOrderCreated(true);
    clearCart();
    setErrorMessage('El pago no se completó. Puedes pagar tu pedido más tarde desde la sección "Mis Pedidos".');
  };



  if (orderCreated) {
    return (
      <>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className={`w-16 h-16 ${paymentApproved ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'} flex items-center justify-center mx-auto mb-6`}>
            {paymentApproved ? (
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {paymentApproved ? '¡Pago confirmado!' : 'Pedido recibido'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {paymentApproved 
              ? 'Tu pago ha sido procesado exitosamente. Recibirás un correo con los detalles.' 
              : 'Tu pedido ha sido creado, pero el pago está pendiente. Puedes completarlo desde "Mis Pedidos".'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/my-orders"
              className="inline-block px-8 py-3 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white font-semibold transition-colors"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/"
              className="inline-block px-8 py-3 border-2 border-[#1c6554] text-[#1c6554] hover:bg-green-50 font-semibold transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </>
    );
  }


  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Tu carrito está vacío
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Agrega productos antes de proceder al pago.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white font-semibold transition-colors"
          >
            Explorar productos
          </button>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554]"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      {errorMessage && (
        <Toast 
          message={errorMessage} 
          type="error" 
          onClose={() => setErrorMessage(null)} 
        />
      )}

      {showWompi && paymentData && (
        <WompiWidget
          orderId={paymentData.reference}
          amountInCents={paymentData.amountInCents}
          signature={paymentData.signature}
          publicKey={paymentData.publicKey}
          customerEmail={user?.email || ''}
          customerName={user?.name || ''}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={handlePaymentClose}
        />
      )}

      <div className="bg-slate-50 dark:bg-slate-900 py-10">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Finalizar compra
            </h1>

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Información del usuario (solo lectura) */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Información de contacto
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-900 dark:text-white">
                    <span className="font-medium">Nombre:</span> {user?.name}
                  </p>
                  <p className="text-slate-900 dark:text-white">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  {user?.phone && (
                    <p className="text-slate-900 dark:text-white">
                      <span className="font-medium">Teléfono:</span> {user?.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Selección de dirección */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Dirección de entrega *
                  </label>
                  <Link
                    href="/my-addresses"
                    className="text-sm text-[#1c6554] dark:text-green-400 hover:underline"
                  >
                    Gestionar direcciones
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      No tienes direcciones guardadas
                    </p>
                    <Link
                      href="/my-addresses"
                      className="inline-block px-4 py-2 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Agregar dirección
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#1c6554] dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-1 w-4 h-4 text-[#1c6554] focus:ring-[#1c6554]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                Por defecto
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {addr.address}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {addr.city}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || addresses.length === 0}
                className="w-full py-3.5 mt-4 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Procesando pedido...
                  </span>
                ) : (
                  `Confirmar pedido · ${formatPrice(orderTotal)}`
                )}
              </button>
            </form>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 h-fit">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Resumen del pedido
            </h2>

            <ul className="space-y-3 mb-6">
              {items.map((item) => (
                <li key={item.product.id} className="flex items-center gap-3 text-sm">
                  <CategoryIcon
                    name={item.product.category?.name || 'Todos los productos'}
                    className="w-10 h-10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-slate-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-[#1c6554]">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Envío</span>
                <span className="font-medium text-green-600">
                  {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total</span>
                <span className="text-[#1c6554]">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
