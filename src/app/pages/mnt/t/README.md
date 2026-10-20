# Patch Ionic: thumbnails y reemplazo de imágenes editadas

Archivos de destino: `src/app/pages/mnt/t/stend/`.

## Cambios
- La cuadrícula muestra exclusivamente `<nombre>_thumbnail.jpg`, derivado de la URL original.
- El editor continúa utilizando la imagen completa para no reducir la calidad de las anotaciones.
- Guardar edición sube un nuevo objeto JPEG mediante PhotoService y **sustituye** la URL original en `images` y `imagenes` (no la añade).
- El thumbnail del nuevo objeto se genera automáticamente mediante el webhook de MinIO ya configurado. Puede tardar unos instantes en estar disponible.
- El botón de edición llama al método existente `saveEditedImage()` mediante `patchModified()`.
- La emisión inicial vacía de `url$` ya no produce URLs vacías ni entradas duplicadas.
- Se incorpora `removeImage()` que aparecía comentado en el código proporcionado.
- `loadTaskById()` interpreta `data.ini` como historial de registros con `img` y toma el último registro que contiene imágenes, o un arreglo de URLs si es su estructura.

## Persistencia
La imagen editada se sube a MinIO inmediatamente. La lista de URLs se actualiza localmente; para guardar la lista en PostgREST se utiliza el botón **Enviar** ya existente (`patch()`), que crea un nuevo registro en `data.ini` con `img: this.imagenes`. No se altera el esquema ni la API.

## Advertencias
- No se borra físicamente el archivo original de MinIO: se reemplaza su referencia en el arreglo. Esto evita pérdida de datos y permite limpieza posterior.
- Si la URL contiene parámetros de firma con expiración, transformar el nombre conservando la firma **no** garantiza que el thumbnail sea accesible; use URLs públicas o firmadas individualmente.
- La lectura del original en el editor requiere permisos de lectura y CORS correctos para `canvas.toDataURL`.
- Se conservaron intactos los trazos, gestos, SVG y dibujo Canvas.
- Comprueba con `npx tsc --noEmit -p tsconfig.app.json` en tu proyecto; no se adjuntó el proyecto Angular completo ni PhotoService para ejecutar compilación integral aquí.
