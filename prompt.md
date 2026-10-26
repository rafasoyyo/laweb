en el navegador está abierto mi perfil de linkedin, con toda la información que hay en ese perfil necesito que crees una pagina web estática que sea impresionante.
Esta págagina web debe incluir una animación interactiva utilizando Three.js que represente visualmente tu perfil de LinkedIn. Puedes utilizar elementos como gráficos 3D, partículas, y efectos de iluminación para hacer que la experiencia sea única y atractiva.
Además debes de incluir fotos de las que parecen en el album llamado "web" de google photos que tambien está abierto en el navegador y que tiene el enlace https://photos.app.goo.gl/Kq2SDWorwS9TFgW69, asegurándote de que las imágenes se integren de manera armoniosa con la animación y el diseño general de la página, para lo que puedes usar crop, filtros, blur , distorsiones o lo que necesites. La página debe ser responsiva y funcionar correctamente en diferentes dispositivos y tamaños de pantalla. Estas imágegnes deben estar optimizadas para la web para garantizar tiempos de carga rápidos y una experiencia de usuario fluida. lá pagina no debe de ser oler a IA ni debe parecer generada automáticamente, sino que debe tener un diseño profesional y personalizado que refleje tu estilo y personalidad. Asegúrate de que la tipografía, los colores y los elementos visuales estén cuidadosamente seleccionados para crear una identidad visual coherente y atractiva. Además, incluye secciones que resalten tus habilidades, experiencia laboral, educación y logros de manera clara y concisa, utilizando gráficos interactivos o animaciones para hacer que la información sea más dinámica y fácil de entender.

## Objetivo
Crea mi web personal estática a partir de mi perfil de LinkedIn. Tiene que verse como el trabajo de un diseñador con criterio propio, no como una plantilla generada. Tiene que ser impresionante y rápida.

## Fuentes de datos (léelas tú, no inventes nada)
1. LinkedIn: https://www.linkedin.com/in/rafael-hernandez-navarro/ (ya está abierto y con sesión iniciada en Chrome). Extrae el texto de estas páginas:
   - perfil principal (titular, ubicación, "Acerca de")
   - /details/experience/
   - /details/education/
   - /details/skills/
   - certificaciones, proyectos, idiomas y logros, si existen
   Estas páginas cargan de forma diferida: espera a que desaparezca el spinner antes de leer. Ignora las publicaciones de otras personas del feed, no son contenido mío.
2. Fotos: álbum "web" de Google Fotos, https://photos.app.goo.gl/Kq2SDWorwS9TFgW69. Ábrelo desde ese enlace, no desde "Álbumes", donde hay álbumes familiares que no deben usarse. Descarga solo las fotos de ese álbum.

## Dónde y con qué stack
- El proyecto es una app Express que sirve /public. Genera el sitio en `public/perfil/` (ya existen las carpetas css, js, img, fonts y vendor). No toques `public/index.html`.
- Sitio 100 % estático: HTML + CSS + JS modular. Sin framework ni paso de build.
- Three.js en local (`vendor/`), con versión fija, sin CDN. Fuentes autoalojadas en `fonts/` (woff2, con subset).
- Respeta la CSP de helmet (`defaultSrc 'self'`): nada de scripts, estilos ni fuentes externos.

## Animación Three.js (el elemento central)
Una escena interactiva que represente visualmente mi trayectoria, no un fondo de partículas genérico. Propuesta de concepto, que puedes mejorar:
- Una línea de tiempo 3D (2012 → hoy) en la que cada empleo es un nodo. Su tamaño depende de la duración. Los nodos se conectan con trazos luminosos.
- Las skills (Clean code, Microservicios, Docker, PostgreSQL, Scrum, JIRA, liderazgo de equipos, AWS, Angular, Express…) orbitan como partículas agrupadas por categoría.
- Interacción: parallax con el ratón o el giroscopio, scroll que mueve la cámara por la escena y hover o tap en un nodo que muestra la información de esa etapa.
- Iluminación y postprocesado sobrios (bloom suave, niebla). Nada de neón sobresaturado.
- Las fotos entran en la escena como planos con shader: crop, desenfoque, distorsión por ruido y duotono que se corrige al acercarse o al hacer hover. Deben integrarse con la paleta, no parecer pegadas.
- Rendimiento: pixelRatio limitado a 2, pausa el render cuando la escena no está visible (IntersectionObserver), número de partículas adaptado al dispositivo. Respeta `prefers-reduced-motion` con una versión estática o muy atenuada.
- Si WebGL no está disponible, muestra un fallback con imagen estática.

## Secciones
Hero, sobre mí, experiencia (línea de tiempo interactiva), skills (visualización interactiva, no barras de porcentaje inventadas), educación y formación, logros y cifras (solo datos reales del perfil, por ejemplo años de experiencia, empresas y roles de liderazgo), galería, contacto y enlaces.
El contenido va en español, con el titular en inglés tal y como aparece en LinkedIn. No incluyas datos que no estén en mi perfil, y avísame si falta alguno, como los logros.

## Diseño
- Evita el aspecto "hecho por IA": nada de degradados morado-azul, glassmorphism por defecto, tarjetas idénticas con iconos, emojis como decoración ni textos genéricos como "apasionado por la tecnología".
- Elige una identidad coherente y explícala en 3-4 líneas antes de implementarla: dos tipografías con carácter (una de titulares y una de texto), una paleta corta con tokens CSS y una retícula clara con composición editorial. La paleta puede inspirarse en las fotos del álbum.
- Microinteracciones y animaciones de entrada con intención: scroll-driven con CSS o IntersectionObserver, sin librerías pesadas.
- El tono del texto debe ser sobrio y en primera persona, sin tópicos. Mi frase de LinkedIn "Impossible tasks are new opportunities, let's code them!!!" se puede usar como detalle de personalidad.

## Imágenes y rendimiento
- Convierte las fotos a AVIF o WebP con 2-3 tamaños (`srcset`, `sizes`), con `loading="lazy"` y `decoding="async"`. Para la escena 3D usa texturas pequeñas, potencia de 2.
- Objetivos: LCP < 2,5 s en móvil, JS propio < 150 KB sin contar Three.js, sin layout shift, y Lighthouse ≥ 90 en rendimiento, accesibilidad y SEO.
- Incluye metadatos SEO y Open Graph con una imagen real, `lang="es"`, contraste AA, navegación por teclado y textos alternativos.

## Responsive
Mobile-first. Comprueba 360, 768, 1280 y 1920 px de ancho. En móvil, usa una versión ligera de la escena y evita el scroll horizontal.

## Forma de trabajar
1. Extrae los datos y guárdalos en `public/perfil/js/data.js` (o JSON). Es la única fuente de contenido.
2. Descarga y optimiza las fotos (muéstrame cuáles has elegido).
3. Antes de escribir código, dame la propuesta visual: concepto de la escena, tipografías y paleta.
4. Implementa por partes: estructura y estilos, escena 3D, secciones interactivas y pulido.
5. Arranca el servidor (`npm start`), revisa el resultado en Chrome con capturas en varios tamaños y corrige lo que falle.
6. No hagas commit ni push sin que yo lo pida.
