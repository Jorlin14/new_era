/**
 * Email Utility — New Era Supermercado
 *
 * Configuración de Nodemailer para envío de correos electrónicos.
 * En desarrollo usa una cuenta de prueba. En producción configura un proveedor real.
 *
 * @module utils/email
 */

import nodemailer from 'nodemailer';

/**
 * Crea el transportador de email
 * En desarrollo usa Ethereal (emails de prueba)
 * En producción configura tu proveedor (Gmail, SendGrid, AWS SES, etc.)
 */
const createTransporter = async () => {
  // Si estamos en producción, usa las variables de entorno configuradas
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // En desarrollo, crea una cuenta de prueba de Ethereal
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Envía un email de recuperación de contraseña
 * @param {Object} options - Opciones del email
 * @param {string} options.to - Email del destinatario
 * @param {string} options.name - Nombre del usuario
 * @param {string} options.resetUrl - URL para restablecer contraseña
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"New Era Supermercado" <${process.env.EMAIL_FROM || 'noreply@newera.com'}>`,
    to,
    subject: 'Recuperación de Contraseña - New Era',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en New Era Supermercado.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p><strong>⚠️ Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 14px; color: #666;">Por tu seguridad, nunca compartas este enlace con nadie.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} New Era Supermercado. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hola ${name},
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en New Era Supermercado.
      
      Visita este enlace para crear una nueva contraseña:
      ${resetUrl}
      
      Este enlace expirará en 1 hora.
      
      Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
      
      © ${new Date().getFullYear()} New Era Supermercado
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // En desarrollo, muestra la URL de previsualización
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n==============================================');
    console.log('📧 EMAIL DE RECUPERACIÓN DE CONTRASEÑA ENVIADO');
    console.log('==============================================');
    console.log('Para:', to);
    console.log('Token válido por:', '1 hora');
    console.log('\n🔗 URL de reset:', resetUrl);
    console.log('\n👁️  Preview del email:', nodemailer.getTestMessageUrl(info));
    console.log('==============================================\n');
  } else {
    console.log(`📧 Email de recuperación enviado a: ${to}`);
  }

  return info;
};
