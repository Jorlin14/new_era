/**
 * ImageUpload Component - New Era Supermercado
 * 
 * Componente para subir imágenes de productos con preview y progreso.
 * 
 * Características:
 * - Drag & Drop
 * - Preview de imagen
 * - Barra de progreso
 * - Validación de tamaño (máx 5MB)
 * - Validación de formato (JPG, PNG, GIF, WEBP)
 * 
 * @module components/admin/ImageUpload
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadProductImage } from '@/lib/api-admin';
import { getImageUrl } from '@/lib/constants';

interface ImageUploadProps {
  /** URL de imagen actual (para edición) */
  currentImage?: string | null;
  /** Callback cuando se sube exitosamente */
  onImageUploaded: (imageUrl: string) => void;
  /** Callback de error */
  onError?: (error: string) => void;
}

export default function ImageUpload({
  currentImage,
  onImageUploaded,
  onError,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview cuando cambia currentImage (útil al editar)
  useEffect(() => {
    setPreview(currentImage || null);
    setImageError(false);
  }, [currentImage]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  /**
   * Valida el archivo seleccionado
   */
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten imágenes JPG, PNG, GIF o WEBP';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen no debe superar 5MB';
    }
    return null;
  };

  /**
   * Maneja la subida del archivo
   */
  const handleFileUpload = async (file: File) => {
    // Validar archivo
    const error = validateFile(file);
    if (error) {
      onError?.(error);
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Crear preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Subir imagen
      const { imageUrl } = await uploadProductImage(file, (uploadProgress) => {
        setProgress(uploadProgress);
      });

      setImageError(false);
      onImageUploaded(imageUrl);
    } catch (err: any) {
      onError?.(err.message || 'Error al subir imagen');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  /**
   * Maneja el cambio de input file
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Maneja el drag & drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Imagen
      </label>

      {/* Área de upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 
          transition-all cursor-pointer
          ${isDragging 
            ? 'border-[#1c6554] dark:border-green-400 bg-[#1c6554]/5 dark:bg-green-400/10' 
            : 'border-slate-300 dark:border-slate-600 hover:border-[#1c6554]/50 dark:hover:border-green-400/50'
          }
          ${isUploading ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        {preview ? (
          // Preview de imagen
          <div className="relative">
            {imageError ? (
              <div className="w-full h-48 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm">Error al cargar imagen</p>
              </div>
            ) : (
              <img
                src={getImageUrl(preview) || preview}
                alt="Preview"
                className="w-full h-48 object-contain rounded"
                onError={() => setImageError(true)}
              />
            )}
            {!isUploading && !imageError && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <p className="text-white text-sm font-medium">
                  Click para cambiar imagen
                </p>
              </div>
            )}
          </div>
        ) : (
          // Placeholder cuando no hay imagen
          <div className="text-center">
            <div className="mx-auto w-12 h-12 text-slate-400 dark:text-slate-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Click para seleccionar o arrastra una imagen aquí
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              JPG, PNG, GIF o WEBP (máx. 5MB)
            </p>
          </div>
        )}

        {/* Barra de progreso */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 flex items-center justify-center rounded-lg">
            <div className="w-full max-w-xs space-y-2">
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1c6554] dark:bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                Subiendo... {progress}%
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {currentImage && !isUploading && (
          <span className="text-[#1c6554] dark:text-green-400">✓ Imagen actual guardada</span>
        )}
      </p>
    </div>
  );
}
