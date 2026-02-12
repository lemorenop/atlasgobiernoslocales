# Mitigación de Vulnerabilidad: Predictable Resource Location

**Fecha:** 28 de enero de 2026  
**Endpoint afectado:** `/api/cache`  
**Severidad original reportada:** Media  
**Estado:** Mitigado

---

## 1. Vulnerabilidad reportada

### Descripción del reporte
| Campo | Detalle |
|-------|---------|
| **Nombre** | Predictable Resource Location Via Forced Browsing |
| **URL afectada** | `https://azapp-atlas20251215-cr.azurewebsites.net/api/cache` |
| **Método de detección** | Fuzzing / navegación forzada |
| **Respuesta del servidor** | HTTP 200 OK |
| **Impacto indicado** | Posible divulgación de información sensible, exposición de lógica interna |

### Sugerencia del cliente
- Revisar el contenido de la ruta `/api/cache`
- Si no es pública, restringir o eliminar el endpoint
- Validar si es un remanente de depuración

---

## 2. Análisis realizado

### Contexto del endpoint

El endpoint `/api/cache` fue creado **intencionalmente** para:

- **GET:** Exponer el estado del caché en memoria del servidor (datos editoriales y de visualización)
- **DELETE:** Permitir limpiar el caché manualmente cuando se actualizan los Google Sheets de origen sin necesidad de hacer redeploy

### Naturaleza de los datos expuestos

| Tipo de dato | Descripción | ¿Sensible? |
|--------------|-------------|------------|
| Contenido editorial | Títulos, textos, labels de la UI en 3 idiomas | No |
| Datos de visualización | Indicadores, países, jurisdicciones, promedios | No |
| Fuente de origen | Google Sheets públicos | No |

**Conclusión:** Los datos expuestos por GET son públicos y no contienen información sensible.

### Riesgo identificado

El método **DELETE** estaba expuesto sin autenticación, lo que permitía que cualquier persona pudiera vaciar el caché del servidor. Esto representa un riesgo de:

- Degradación de performance del sitio
- Carga adicional en servidores al forzar re-fetch de datos
- Posible abuso para causar denegación de servicio

---

## 3. Acciones implementadas

### 3.1 Protección del método DELETE con API Key

Se implementó validación mediante clave secreta para el método DELETE.

**Archivo modificado:** `app/api/cache/route.js`


**Comportamiento:**
- Sin key válida → HTTP 401 Unauthorized
- Con key válida → HTTP 200 OK y caché limpiado

### 3.2 Actualización de la interfaz de administración

Se agregó un campo de entrada para la key en la página `/[lang]/cache`.

**Archivo modificado:** `app/[lang]/cache/content.js`

- Se agregó un input tipo `password` para ingresar la key
- La key puede venir por URL (`?key=...`) o ingresarse manualmente
- El input oculta los caracteres por seguridad

### 3.3 Configuración requerida

Se debe agregar la variable de entorno `CACHE_KEY` en:

1. **Desarrollo local:** archivo `.env.local`
2. **Producción:** Azure App Service → Configuration → Application Settings

---

## 4. Cómo usar la funcionalidad protegida

### Opción A: Interfaz web

1. Acceder a `/es/cache` (o `/en/cache`, `/pt/cache`)
2. Ingresar la key en el campo de texto
3. Hacer clic en "Limpiar caché"

### Opción B: URL directa

```
/es/cache?clean=true&key=TU_CLAVE_SECRETA
```

---

# Hallazgo sin acción requerida: Suspected Path Manipulation

**Fecha de análisis:** 28 de enero de 2026  
**URLs reportadas:** `/es`, `/es/indicadores/adultos-con-secundaria-completa`  
**Severidad original reportada:** Media  
**Estado:** Falso positivo - Sin modificaciones requeridas

---

## 1. Vulnerabilidad reportada

### Descripción del reporte

| Campo | Detalle |
|-------|---------|
| **Nombre** | Suspected Path Manipulation Vulnerability |
| **URLs afectadas** | `/es`, `/es/indicadores/[slug]` |
| **Método de detección** | Análisis heurístico de respuestas durante pruebas de manipulación de rutas |
| **Confirmación de exploit** | No confirmado por el escáner |
| **Impacto indicado** | Riesgo potencial de acceso a archivos o directorios sensibles |

### Sugerencia del cliente
- Revisar controles de acceso en las rutas listadas
- Hardening para evitar listado de directorios o exposición de archivos del sistema

---

## 2. Análisis realizado


### Evaluación del código

Se analizaron los siguientes aspectos:

| Aspecto | Resultado | Detalle |
|---------|-----------|---------|
| Uso del parámetro `slug` |  Seguro | Solo se usa para filtrar datos en memoria |
| Acceso al filesystem |  Seguro | El slug NO construye rutas de archivos |
| Generación de páginas |  Seguro | SSG con `dynamicParams = false` |
| Único endpoint con `fs` |  Seguro | `/api/governments` valida contra whitelist |

### Evidencia técnica

**1. Protección por diseño:** La página de indicadores usa `dynamicParams = false`:

```javascript
// app/[lang]/indicadores/[slug]/page.js (línea 133)
export const dynamicParams = false;
```

Esto significa que **solo se aceptan slugs pre-generados en build time**. Cualquier otro valor retorna 404 automáticamente.

**2. El slug filtra datos en memoria, no accede a archivos:**

```javascript
// app/[lang]/indicadores/[slug]/page.js (líneas 87-89)
const currentIndicator = indicators.find(
  (indicator) => indicator.slug === slug
);
```

**3. Origen de datos externo:** Los indicadores provienen de Google Sheets (CSV), no del filesystem local.

**4. El único uso de `fs` está protegido:** El endpoint `/api/governments` valida el parámetro `lang` contra una whitelist antes de construir el path:

```javascript
// app/api/governments/route.js (líneas 12-13)
const validLangs = ["es", "en", "pt"];
const language = validLangs.includes(lang) ? lang : "es";
```

---

## 3. ¿Por qué el escáner lo marcó?

| Factor | Explicación |
|--------|-------------|
| **Rutas dinámicas** | El patrón `/es/indicadores/[slug]` acepta valores variables, interpretado como punto de inyección potencial |
| **Respuestas diferenciadas** | Slugs válidos → 200; Slugs inválidos → 404. Esta diferencia activa heurísticas del escáner |
| **Clasificación "Suspected"** | El escáner no logró confirmar explotación, solo detectó comportamiento que podría ser vulnerable en otras implementaciones |

El escáner analiza respuestas HTTP, no código fuente. Al detectar que la aplicación responde diferente según el input, lo marca preventivamente como sospechoso.

---

## 4. Conclusión

**No se requieren modificaciones en el código.**

La aplicación está protegida por diseño gracias a:
- Static Site Generation con rutas cerradas (`dynamicParams = false`)
- Ausencia de acceso al filesystem basado en input de usuario
- Datos provenientes de fuentes externas (Google Sheets)
- Validación con whitelist en el único endpoint que usa `fs`

El hallazgo corresponde a un **falso positivo** generado por las heurísticas del escáner ante patrones de routing dinámico normales en aplicaciones Next.js modernas.

---