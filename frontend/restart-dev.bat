@echo off
echo ========================================
echo LIMPIEZA COMPLETA DE NEXT.JS
echo ========================================
echo.

echo [1/4] Deteniendo procesos de Node...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [2/4] Eliminando cache de Next.js...
rmdir /s /q .next 2>nul
echo OK - Cache de Next.js eliminado
echo.

echo [3/4] Eliminando cache de Node...
rmdir /s /q node_modules\.cache 2>nul
echo OK - Cache de Node eliminado
echo.

echo [4/4] Limpiando archivos temporales...
del /q /f .next\*.json 2>nul
echo OK - Archivos temporales eliminados
echo.

echo ========================================
echo LIMPIEZA COMPLETADA!
echo ========================================
echo.
echo Pasos siguientes:
echo   1. Presiona cualquier tecla para cerrar
echo   2. Ejecuta: npm run dev
echo   3. Espera a que compile completamente
echo   4. Recarga el navegador con Ctrl+Shift+R
echo.
pause

