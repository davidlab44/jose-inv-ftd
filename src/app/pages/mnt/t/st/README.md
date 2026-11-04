# MultiImagePickerComponent — Angular + Ionic (NgModule)

## Instalación

1. Copia la carpeta `multi-image-picker` a `src/app/components/multi-image-picker/`.
2. En `multi-image-picker.component.ts`, corrige el import de `PhotoService` según la ubicación final. Si usas `src/app/components/multi-image-picker/`, cambia la ruta a:

```ts
import { PhotoService } from '../../services/asset/photo.service';
```

3. En el módulo que declara `PatchPage` (`patch.module.ts`), agrega:

```ts
import { MultiImagePickerModule } from '../../../../components/multi-image-picker/multi-image-picker.module';
```

Y agrega `MultiImagePickerModule` a `imports`.

4. En `patch.ts`:

```ts
images: string[] = [];
```

En el constructor, al recibir `task`:

```ts
const oldImages = this.task?.data?.imgin;
this.images = Array.isArray(oldImages) ? [...oldImages] : (oldImages ? [oldImages] : []);
```

5. En `patch.html`:

```html
<app-multi-image-picker [(images)]="images" [maxImages]="10" bucket="fotos"></app-multi-image-picker>
```

6. Para PATCH, persiste `images` en tu campo JSONB, por ejemplo `data.imgin` como arreglo de URLs. Este componente no modifica la base de datos ni elimina objetos del almacenamiento: solo modifica el arreglo local y emite cambios.

## Requisitos

- Angular + Ionic con NgModules.
- `PhotoService` con `takePicture()`, `pickImage()` y `uploadBase64Image(base64, bucket)` que devuelve `{progress$, url$}`.
- Se selecciona una imagen por interacción. La galería no habilita selección múltiple simultánea.

## Nota

La ruta inicial del servicio incluida en el archivo TS sigue la estructura de la página original; ajústala según el paso 2.
