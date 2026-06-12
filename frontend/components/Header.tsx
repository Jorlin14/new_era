/**
 * Header Component - New Era Supermercado
 * 
 * Barra de navegación principal con diseño Flexbox responsivo:
 * - **Extremo izquierdo:** Logo del supermercado
 * - **Centro absoluto:** Barra de búsqueda con debounce
 * - **Extremo derecho:** Botones de autenticación/perfil y carrito
 * 
 * **Lógica de Roles:**
 * - ADMIN: Al hacer clic en el botón de perfil, redirige directamente a /dashboard (sin menú desplegable)
 * - CLIENTE: Al hacer clic, muestra menú contextual con "Mi Perfil", "Mis Pedidos" y "Mis Órdenes"
 * 
 * Incluye efecto de sombra al hacer scroll y contador de items en el carrito.
 * 
 * @module components/Header
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import CartDrawer from '@/components/CartDrawer';
import ThemeToggle from '@/components/ThemeToggle';
import './SearchBar.css';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import { getCurrentUser, logout, getMyAddresses } from '@/lib/api-admin';
import { getProducts, formatPrice } from '@/lib/api';
import type { Product } from '@/lib/types';

/**
 * Props del componente Header.
 */
interface HeaderProps {
  /** Callback que se ejecuta cuando el usuario busca productos */
  onSearch?: (query: string) => void;
}

/**
 * Componente de encabezado principal de la aplicación.
 * 
 * Incluye navegación, búsqueda, y acceso al carrito.
 * 
 * @param {HeaderProps} props
 * @returns {JSX.Element}
 */
export default function Header({ onSearch }: HeaderProps) {
  const router = useRouter();
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const [searchInput, setSearchInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Estado para direcciones
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressMenuOpen, setIsAddressMenuOpen] = useState(false);
  
  // Estados para sugerencias de búsqueda
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [skipNextSuggestion, setSkipNextSuggestion] = useState(false);
  
  const debouncedSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    if (skipNextSuggestion) {
      setSkipNextSuggestion(false);
      return;
    }

    if (debouncedSearch.trim().length >= 2) {
      setIsLoadingSuggestions(true);
      getProducts(debouncedSearch)
        .then((data) => {
          setSuggestions(data.slice(0, 6));
          setShowSuggestions(true);
        })
        .catch((err) => {
          console.error('Error al cargar sugerencias:', err);
          setSuggestions([]);
        })
        .finally(() => {
          setIsLoadingSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  const handleSelectSuggestion = (name: string) => {
    setSearchInput(name);
    setSkipNextSuggestion(true);
    setShowSuggestions(false);
  };
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser && !['ADMIN', 'DELIVERER', 'CASHIER'].includes(currentUser.role)) {
      getMyAddresses().then((data) => {
        setAddresses(data);
        if (data && data.length > 0) {
          const def = data.find((a: any) => a.isDefault) || data[0];
          setSelectedAddress(def);
        }
      }).catch(console.error);
    }
  }, []); // Solo ejecutar una vez al montar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    onSearch?.(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (isAddressMenuOpen && !target.closest('.address-menu-container')) {
        setIsAddressMenuOpen(false);
      }
      if (showSuggestions && !target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen, isAddressMenuOpen, showSuggestions]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('auth-change'));
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };
  const handleUserClick = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-white/95 border-slate-200/50 shadow-sm dark:bg-slate-900/95 dark:border-slate-800/50 dark:shadow-lg backdrop-blur-md'
            : 'bg-white border-transparent dark:bg-slate-900 dark:border-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* DISEÑO FLEXBOX: Extremo izquierdo | Centro fluido | Extremo derecho */}
          <div className="relative flex items-center justify-between h-20 gap-4">
            
            {/* EXTREMO IZQUIERDO: Logo Animado y Ubicación */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                href="/"
                className="group relative flex h-20 w-[240px] items-center justify-center"
                aria-label="Ir a la página principal de New Era Domicilios"
              >
                <span className="absolute inset-0 flex items-center justify-center font-extrabold text-lg text-[#1c6554] dark:text-white transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0 whitespace-nowrap">
                  New Era Domicilios
                </span>
                <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100">
                  <Logo size="huge" useLogo2 linkless disableHoverEffect className="-translate-y-0.5" />
                </span>
              </Link>
              
              {/* Location Selector (Hidden on mobile) */}
              <div 
                className={`hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 relative address-menu-container ${user && !['ADMIN', 'DELIVERER', 'CASHIER'].includes(user.role) && addresses.length > 0 ? 'cursor-pointer group' : ''}`}
                onClick={() => {
                  if (user && !['ADMIN', 'DELIVERER', 'CASHIER'].includes(user.role) && addresses.length > 0) {
                    setIsAddressMenuOpen(!isAddressMenuOpen);
                  }
                }}
              >
                <div className="group-hover:text-[#1c6554] dark:group-hover:text-white transition-colors">
                  <LocationIcon />
                </div>
                <div className="flex flex-col group-hover:text-[#1c6554] dark:group-hover:text-white transition-colors">
                  <span className="text-[10px] text-slate-500 uppercase font-bold leading-tight">Entregar en:</span>
                  
                  {!user ? (
                    <Link href="/auth" className="text-xs font-bold hover:text-[#1c6554] dark:hover:text-white transition-colors leading-tight">
                      Inicia sesión
                    </Link>
                  ) : ['ADMIN', 'DELIVERER', 'CASHIER'].includes(user.role) ? (
                    <span className="text-xs font-bold leading-tight">Sede Central</span>
                  ) : addresses.length === 0 ? (
                    <Link href="/my-addresses" className="text-xs font-bold flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors leading-tight">
                      ¡Añadir dirección!
                      <ChevronIcon className="w-3 h-3 -rotate-90" />
                    </Link>
                  ) : (
                    <>
                      <div className="text-xs font-bold flex items-center gap-1 leading-tight text-left max-w-[150px]">
                        <span className="truncate">
                          {selectedAddress ? (selectedAddress.label || selectedAddress.address) : 'Cargando...'}
                        </span>
                        <ChevronIcon className={`w-3 h-3 flex-shrink-0 transition-transform ${isAddressMenuOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Dropdown de direcciones (Sesión) */}
                      {isAddressMenuOpen && (
                        <div className="absolute top-full left-4 mt-3 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-scale-in z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
                          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Cambiar para esta sesión</p>
                          </div>
                          
                          <div className="max-h-60 overflow-y-auto">
                            {addresses.slice(0, 3).map((addr) => (
                              <button
                                key={addr.id}
                                onClick={() => {
                                  setSelectedAddress(addr);
                                  setIsAddressMenuOpen(false);
                                }}
                                className={`w-full flex flex-col text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedAddress?.id === addr.id ? 'bg-slate-50 dark:bg-slate-700/30' : ''}`}
                              >
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  {addr.label || 'Dirección'}
                                  {addr.isDefault && <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 rounded uppercase">Predeterminada</span>}
                                  {selectedAddress?.id === addr.id && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 rounded uppercase">Actual</span>}
                                </span>
                                <span className="text-xs text-slate-500 truncate w-full">{addr.address}</span>
                              </button>
                            ))}
                          </div>
                          
                          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 mt-1 flex flex-col gap-1">
                            {addresses.length > 3 ? (
                              <Link 
                                href="/my-addresses" 
                                className="text-xs font-semibold text-[#1c6554] dark:text-green-400 hover:underline flex items-center justify-center w-full py-1.5"
                                onClick={() => setIsAddressMenuOpen(false)}
                              >
                                Ver más direcciones
                              </Link>
                            ) : (
                              <Link 
                                href="/my-addresses" 
                                className="text-xs font-semibold text-[#1c6554] dark:text-green-400 hover:underline flex items-center justify-center w-full py-1.5"
                                onClick={() => setIsAddressMenuOpen(false)}
                              >
                                Gestionar mis direcciones
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CENTRO: Barra de búsqueda con sugerencias */}
            <div className="flex-1 w-full max-w-3xl px-4 sm:px-6 md:px-8 relative search-container">
              <form className="search-form animate-fade-in" onSubmit={(e) => e.preventDefault()}>
                <button type="button" aria-label="Buscar">
                  <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                    <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
                <input 
                  className="search-input" 
                  placeholder="Buscar productos, marcas..." 
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchInput.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  aria-label="Buscar productos"
                />
                <button 
                  className="search-reset" 
                  type="button" 
                  onClick={() => {
                    setSearchInput('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  aria-label="Limpiar búsqueda"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </form>

              {/* Panel de sugerencias en tiempo real */}
              {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div className="search-suggestions-dropdown">
                  {isLoadingSuggestions ? (
                    <div className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-[#1c6554] dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Buscando coincidencias...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col py-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion.name)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-none outline-none cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-600">
                              {suggestion.imageUrl ? (
                                <img
                                  src={suggestion.imageUrl}
                                  alt={suggestion.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {suggestion.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#1c6554] dark:text-green-400 ml-2 whitespace-nowrap bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                            {formatPrice(suggestion.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* EXTREMO DERECHO: Botones de sesión/perfil y carrito */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* LÓGICA DE ROLES: ADMIN vs CLIENTE */}
              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={handleUserClick}
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <UserIcon />
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                    {/* Solo mostrar chevron si NO es admin (porque admin no tiene menú) */}
                    {user.role !== 'ADMIN' && (
                      <ChevronIcon className={`transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Dropdown Menu - SOLO PARA CLIENTES (no ADMIN) */}
                  {isUserMenuOpen && user.role !== 'ADMIN' && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-scale-in">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/my-profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ProfileIcon />
                        Mi Perfil
                      </Link>
                      
                      {['DELIVERER', 'CASHIER'].includes(user.role) ? (
                        <Link
                          href={user.role === 'DELIVERER' ? '/deliverer/dashboard' : '/cashier/dashboard'}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <OrdersIcon />
                          Mi Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/my-orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <OrdersIcon />
                            Mis Pedidos
                          </Link>
                          
                          <Link
                            href="/my-addresses"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <AddressIcon />
                            Mis Direcciones
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogoutIcon />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Botón compacto de login para móvil */}
                  <Link
                    href="/auth"
                    className="sm:hidden flex items-center justify-center w-11 h-11 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Iniciar sesión"
                  >
                    <UserIcon />
                  </Link>
                  {/* Botones completos para pantallas sm+ */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/auth"
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/auth?mode=register"
                      className="px-4 py-2 text-sm font-medium bg-[#1c6554] hover:bg-[#1c6554]/90 text-white rounded-lg transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                </>
              )}

              {/* Carrito */}
              <button
                id="cart-button"
                type="button"
                onClick={() => setIsOpen(true)}
                className="cursor-pointer relative flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1c6554] bg-[#1c6554]/10 hover:bg-[#1c6554]/20 dark:text-white dark:bg-[#1c6554] dark:hover:bg-[#1c6554]/90 rounded-full transition-colors"
                aria-label="Abrir carrito de compras"
              >
                <CartIcon />
                <span className="hidden sm:inline">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalPrice)}
                </span>
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-[#1c6554] dark:bg-white dark:text-[#1c6554] text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}

/**
 * Icono de ubicación/localización.
 * @returns {JSX.Element}
 */
function LocationIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

/**
 * Icono de búsqueda/lupa.
 * @returns {JSX.Element}
 */
function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

/**
 * Icono de cerrar/X.
 * @returns {JSX.Element}
 */
function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * Icono de carrito de compras.
 * @returns {JSX.Element}
 */
function CartIcon() {
  return (
    <>
      <div className="dark:hidden flex items-center">
        {/* @ts-ignore */}
        <lord-icon
          src="/wired-outline-146-trolley-hover-jump.json"
          trigger="hover"
          target="#cart-button"
          colors="primary:#1c6554,secondary:#1c6554"
          style={{ width: "24px", height: "24px" }}
        ></lord-icon>
      </div>
      <div className="hidden dark:flex items-center">
        {/* @ts-ignore */}
        <lord-icon
          src="/wired-outline-146-trolley-hover-jump.json"
          trigger="hover"
          target="#cart-button"
          colors="primary:#ffffff,secondary:#1c6554"
          style={{ width: "24px", height: "24px" }}
        ></lord-icon>
      </div>
    </>
  );
}

/**
 * Icono de usuario.
 * @returns {JSX.Element}
 */
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

/**
 * Icono de chevron/flecha.
 * @returns {JSX.Element}
 */
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Icono de órdenes/pedidos.
 * @returns {JSX.Element}
 */
function OrdersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

/**
 * Icono de dirección/ubicación.
 * @returns {JSX.Element}
 */
function AddressIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/**
 * Icono de perfil.
 * @returns {JSX.Element}
 */
function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Icono de cerrar sesión/logout.
 * @returns {JSX.Element}
 */
function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
