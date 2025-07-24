# CAF Visualizador Red

Visualizador interactivo de datos de gobiernos y jurisdicciones de América Latina y el Caribe.

Esta es una aplicación desarrollada en **Next.js** que no cuenta con CMS: todos los datos que se muestran en el sitio se consumen directamente desde hojas de cálculo de Google Spreadsheet, tanto para textos como para datos de gobiernos y países.

## 🧑‍💻 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm, yarn, pnpm o bun
- Token de acceso de Mapbox

### Configura el entorno
1. Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_de_mapbox_aqui
NEXT_PUBLIC_MAPBOX_STYLE_TOKEN=tu_token_de_estilos_de_mapbox_aqui
NEXT_PUBLIC_URL=tu_url_del_sitio
```

2. Reemplaza `tu_token_de_mapbox_aqui` por tu token de Mapbox. Si tienes estilos personalizados, reemplaza también `tu_token_de_estilos_de_mapbox_aqui`.
   - Obtén un token gratuito en [Mapbox](https://account.mapbox.com/access-tokens/).
   - Crea estilos personalizados en [Mapbox Studio](https://www.mapbox.com/mapbox-studio).
3. Reemplaza `tu_url_del_sitio` por la URL donde estará alojado el sitio.

### Levanta el proyecto
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts disponibles
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run start`: Inicia el servidor en modo producción.
- `npm run lint`: Ejecuta el linter para verificar el código.
- `npm run build:data`: Ejecuta `scripts/createIndex.js` para crear el índice de gobiernos para FlexSearch en los tres idiomas (ejecuta este script solo si actualizaste los datos de gobierno).

## 🛠️ Tecnologías Utilizadas

- **Next.js**: Framework principal para React y SSR.
- **React**: Librería de interfaces de usuario.
- **TailwindCSS**: Utilidades para estilos CSS.
- **D3.js**: Visualización de datos y gráficos.
- **Mapbox GL** y **react-map-gl**: Mapas interactivos.
- **i18next**, **next-i18next**, **next-intl**: Internacionalización.
- **FlexSearch**: Búsqueda rápida en el frontend.
- **Axios**: Peticiones HTTP.
- **PapaParse** y **csv-parser**: Procesamiento de archivos CSV.

## 📊 Fuentes de Datos y actualizaciones
### Datos
- **Google Spreadsheet**: El sitio consume como CSV tanto textos como datos de los gobiernos. Los enlaces a cada uno se encuentran en la variable `csv` en `/app/utils/dataFetchers`.
    - **Títulos y textos**: Provienen del spreadsheet [2025.04.07 - Atlas_textos_extraidos](https://docs.google.com/spreadsheets/d/1crKtbS4Vl3pD-97iOFmNI1P767m8KXDd/edit?gid=425601317#gid=425601317), organizado por pestañas que corresponden a cada página o sección del sitio.
    - **Datos de gobiernos y países**: Provienen del spreadsheet [Data - CAF](https://docs.google.com/spreadsheets/d/1T9ExlPxWHdtmsQmlUH6fOwG2hWSGPViX/edit?gid=682419313#gid=682419313).
- **Datos geoespaciales**: Archivos en `public/maps/` (GeoJSON, GPKG) para la visualización de mapas y límites jurisdiccionales.
- **Datos para la descarga:** El csv se genera a partir del spreadsheet [base_consolidada_2025.05.15](https://docs.google.com/spreadsheets/d/13S5QFXT8S8elyqhFNfC5wLKtB4XG9FiqJe2cpAFc7PY/edit?gid=150251432#gid=150251432)
- **API interna**: Endpoints en `app/api/` para exponer datos procesados y búsquedas.
### Actualizaciones
Creamos una ruta para poder ver y limpiar el caché del sevidor. Cuando se actualizan los spreadsheets, si no se realizó ningún deploy, es necesario limpiar el caché a mano visitando la url `/cache?clean=true`



## 🚀 Despliegue

El proyecto cuenta con dos entornos principales:

- **Producción**: Accesible públicamente, refleja la versión estable del proyecto.
- **Testing**: Entorno de pruebas, para validar cambios antes de pasar a producción.

> ‼️El entorno de **producción** actualmente se encuentra alojado en el **servidor de Sociopúblico**. Queda pendiente transferirlo a una Aplicación en Azure. El entorno de testing ya está funcionando en Azure a través de Github Actions. 

Github Actions ya está configurado para que se pueda deployar tanto un entorno como otro, aunque de momento el despliegue a producción en Azure no funciona porque tal aplicación no existe. Quedan abajo las instrucciones para cuando ambos casos estén funcionando. 

El despliegue se realiza automáticamente en Azure Web App usando GitHub Actions, dependiendo de la rama en la que trabajes:

- Para desplegar en **producción**, ubícate en la rama `main`.
- Para desplegar en **testing**, ubícate en la rama `segunda-etapa` (o la rama de testing definida en el repositorio).

### Despliega el proyecto
1. Realiza tus cambios y haz commit en la rama correspondiente (`main` para producción, `segunda-etapa` para testing).
2. Incluye la palabra `#deploy` en el mensaje de commit.
3. Haz push a la rama correspondiente.

Ejemplo para producción:
```bash
git checkout main
git commit -m "Actualiza interfaz #deploy"
git push origin main
```

Ejemplo para testing:
```bash
git checkout segunda-etapa
git commit -m "Prueba nueva funcionalidad #deploy"
git push origin segunda-etapa
```

El despliegue solo se activa cuando el mensaje de commit contiene `#deploy` y se realiza en la rama adecuada para cada entorno.

## 📄 Estructura del Proyecto
```
caf-visualizador-red/
├── app/                          # Código principal de la aplicación (Next.js)
│   ├── [lang]/                   # Rutas dinámicas por idioma (es, en, pt)
│   │   ├── components/           # Componentes reutilizables (map, navbar, searchBox, etc.)
│   │   ├── indicadores/          # Páginas y componentes de indicadores
│   │   │   └── [slug]/           # Indicador dinámico (gráficos, mapas, etc.)
│   │   ├── jurisdicciones/       # Páginas y componentes de jurisdicciones
│   │   │   └── [slug]/           # Jurisdicción dinámica (gráficos, mapas, etc.)
│   │   ├── acerca-de/            # Página de información del proyecto
│   │   ├── politica-de-privacidad/ # Páginas de política de privacidad (es, en, pt)
│   │   ├── hero.js               # Componente de cabecera
│   │   ├── sitemap.js            # Mapa del sitio
│   │   └── page.js               # Página principal por idioma
│   ├── api/                      # Endpoints de la API interna
│   │   ├── indicators/           # Endpoints de indicadores
│   │   │   └── [slug]/           # Indicador dinámico
│   │   ├── countries/            # Endpoints de países
│   │   │   └── [slug]/           # País dinámico
│   │   └── ...                   # Otros endpoints (gobiernos, búsquedas, etc.)
│   ├── utils/                    # Utilidades de datos, mapas, búsqueda, etc.
│   │   ├── governments/          # Archivos de datos de gobiernos y límites
│   │   └── ...                   # Otros utilitarios
│   ├── translations/             # Archivos de traducción (es, en, pt)
│   ├── globals.css               # Estilos globales
│   └── i18n.config.js            # Configuración de internacionalización
├── public/                       # Archivos estáticos
│   ├── maps/                     # Archivos geoespaciales (GeoJSON, GPKG)
│   └── ...                       # Imágenes, logos, etc.
├── scripts/                      # Scripts para generación y procesamiento de datos
├── package.json                  # Dependencias y scripts de npm
```