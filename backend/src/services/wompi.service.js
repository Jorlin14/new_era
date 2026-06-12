/**
 * Wompi Service — New Era Supermercado
 * 
 * Gestión de seguridad para la pasarela de pagos Wompi.
 * Incluye generación de firmas de integridad y validación de webhooks.
 * 
 * @module services/wompi
 */

import crypto from 'crypto';

/**
 * Genera la firma de integridad requerida por el widget de Wompi.
 * 
 * La firma se construye concatenando:
 * referencia + monto_en_centavos + moneda + secreto_integridad
 * 
 * @param {string} reference - Referencia única de la transacción (ID de la orden)
 * @param {number} amountInCents - Monto total en centavos (ej: $1000 = 100000)
 * @param {string} currency - Moneda (normalmente 'COP')
 * @returns {string} Firma SHA256 en formato hexadecimal
 */
export const generateIntegritySignature = (reference, amountInCents, currency = 'COP') => {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  
  if (!secret) {
    console.error('WOMPI_INTEGRITY_SECRET no está configurado en el entorno.');
    return null;
  }

  const data = `${reference}${amountInCents}${currency}${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Verifica la autenticidad de una notificación webhook de Wompi.
 * 
 * Compara el header 'wompi_hash' con un HMAC SHA256 del cuerpo raw del mensaje
 * usando el secreto de eventos del comercio.
 * 
 * @param {Object} body - Cuerpo de la petición (JSON)
 * @param {string} receivedHash - Valor del header 'wompi_hash'
 * @returns {boolean} True si el hash es válido
 */
export const verifyWebhookHash = (body, receivedHash) => {
  const secret = process.env.WOMPI_EVENT_SECRET;
  
  if (!secret) {
    console.error('WOMPI_EVENT_SECRET no está configurado en el entorno.');
    return false;
  }

  // IMPORTANTE: Se debe usar el body exacto enviado por Wompi.
  // Express con json() parser puede cambiar el formato, pero para propósitos de 
  // validación, Wompi permite reconstruir el hash usando las propiedades específicas
  // en el orden correcto o el string raw si está disponible.
  // Según docs: concatenar propiedades + timestamp + secreto.
  
  // Enfoque recomendado por Wompi para webhooks con timestamp:
  // v1_checksum = sha256(event_data_transaction_id + event_data_transaction_status + event_data_transaction_amount_in_cents + timestamp + event_secret)
  
  const { data: { transaction }, timestamp, sent_at } = body;
  
  // Wompi usa una estructura específica para el checksum de v1
  // Propiedades: id, status, amount_in_cents, timestamp
  const dataToHash = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${timestamp}${secret}`;
  const calculatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

  return calculatedHash === receivedHash;
};
