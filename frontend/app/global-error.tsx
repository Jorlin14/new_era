'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Algo salió mal!</h2>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            {error.message || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1c6554',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
