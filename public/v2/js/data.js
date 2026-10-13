/**
 * Única fuente de contenido de la web. Todo proviene del perfil de LinkedIn
 * (https://www.linkedin.com/in/rafael-hernandez-navarro/, leído el 2026-10-13)
 * salvo lo marcado como "editorial": agrupaciones y textos de enlace que son
 * decisiones de presentación, no datos nuevos.
 */

export const person = {
    name: 'Rafael Hernández Navarro',
    headline: 'Engineering Team Lead | Microservices & Modern Apps Specialist at Hiberus',
    location: 'Valencia, España',
    motto: 'Impossible tasks are new opportunities, let\'s code them!!!',
    // Fecha de inicio de la vida profesional (primer empleo del perfil)
    careerStart: '2012-07'
};

/** Editorial: redactado en primera persona a partir de los datos del perfil, sin añadir hechos nuevos. */
export const about = [
    'Llevo desde 2012 construyendo software. Hoy coordino equipos de ingeniería en Hiberus, especializados en diseñar, desarrollar y modernizar aplicaciones basadas en microservicios y en soluciones Cloud Native.',
    'Empecé como desarrollador independiente de apps multiplataforma, pasé por Joinity e Influencity y fui CTO y Development Lead en QUIBIM. Después trabajé en Oramon, nexum, Giesecke+Devrient y Fourvenues, entre el full stack, Salesforce Commerce Cloud y el backend.',
    'Mi formación de base es Ingeniería Técnica Industrial (Química Industrial) y un máster en Diseño de Productos e Instalaciones, los dos en la Universidad de Sevilla.'
];

export const links = {
    linkedin: 'https://www.linkedin.com/in/rafael-hernandez-navarro/',
    // El correo se monta en el cliente para no dejarlo en claro en el HTML
    email: ['rafaelhn.iti', 'gmail.com']
};

/**
 * Experiencia. `start` y `end` en formato AAAA-MM (end: null = actualidad).
 * `kind`: 'lead' | 'dev' | 'cto' | 'own' | 'intern' (para el color/forma del nodo).
 * `stack`: aptitudes que LinkedIn muestra para ese puesto.
 */
export const experience = [
    {
        id: 'independiente',
        company: 'Programador independiente',
        role: 'Software Developer',
        start: '2012-07', end: '2014-07',
        place: 'Sevilla',
        kind: 'own',
        summary: 'Desarrollo de aplicaciones multiplataforma con HTML5, JavaScript y CSS sobre PhoneGap, jQuery Mobile, iScroll y las APIs de Google Maps y Facebook. Diseño, desarrollo y publicación de una app multiplataforma de turismo y servicios de Cortegana.',
        stack: ['CSS3', 'PhoneGap', 'jQuery Mobile']
    },
    {
        id: 'geographica',
        company: 'Geographica',
        role: 'Auxiliar de programación (prácticas del máster)',
        start: '2014-04', end: '2014-05',
        place: '',
        kind: 'intern',
        summary: 'Prototipo de app para un nuevo servicio dirigido a administraciones públicas locales, con HTML5, JavaScript, CSS y PhoneGap.',
        stack: ['PhoneGap', 'Desarrollo del front-end']
    },
    {
        id: 'joinity',
        company: 'Joinity',
        role: 'Frontend Developer',
        start: '2014-07', end: '2015-02',
        place: 'Comunidad Valenciana',
        kind: 'dev',
        summary: '',
        stack: ['CSS3', 'Git', 'jQuery']
    },
    {
        id: 'influencity',
        company: 'Influencity',
        role: 'Frontend Developer',
        start: '2015-02', end: '2015-07',
        place: 'Comunidad Valenciana',
        kind: 'dev',
        summary: '',
        stack: ['CSS3', 'Git', 'jQuery']
    },
    {
        id: 'quibim-front',
        company: 'QUIBIM',
        role: 'FrontEnd Developer',
        start: '2015-08', end: '2016-06',
        place: 'Comunidad Valenciana',
        kind: 'dev',
        summary: '',
        stack: ['Windows Azure', 'Angular']
    },
    {
        id: 'quibim-cto',
        company: 'QUIBIM',
        role: 'CTO & Development Lead',
        start: '2016-06', end: '2019-02',
        place: 'Valencia',
        kind: 'cto',
        summary: '',
        stack: ['Windows Azure', 'Express.js', 'MongoDB', 'AngularJS']
    },
    {
        id: 'oramon',
        company: 'Oramon',
        role: 'Full Stack Developer',
        start: '2019-03', end: '2020-06',
        place: 'Valencia',
        kind: 'dev',
        summary: '',
        stack: ['PostgreSQL', 'Express.js']
    },
    {
        id: 'nexum',
        company: 'nexum AG',
        role: 'Salesforce Commerce Cloud Developer',
        start: '2020-06', end: '2023-01',
        place: '',
        kind: 'dev',
        summary: '',
        stack: ['Express.js', 'CSS3', 'Salesforce Commerce Cloud (SFCC)']
    },
    {
        id: 'gd',
        company: 'Giesecke+Devrient',
        role: 'Full Stack Developer',
        start: '2023-01', end: '2025-10',
        place: 'Valencia · En remoto',
        kind: 'dev',
        summary: '',
        stack: ['PostgreSQL', 'Amazon Web Services (AWS)', 'Apache Kafka', 'NestJS']
    },
    {
        id: 'fourvenues',
        company: 'Fourvenues',
        role: 'Backend Developer',
        start: '2025-10', end: '2026-06',
        place: 'Comunidad Valenciana',
        kind: 'dev',
        summary: '',
        stack: ['Node.js', 'Express.js', 'Inteligencia artificial', 'RabbitMQ', 'Redis', 'fastify']
    },
    {
        id: 'hiberus',
        company: 'hiberus',
        role: 'Engineering Team Lead | Microservices & Modern Apps Specialist at Hiberus',
        roleShort: 'Engineering Team Lead',
        start: '2026-06', end: null,
        place: 'Valencia · Híbrido',
        kind: 'lead',
        summary: 'Coordinación de equipos de ingeniería especializados en el diseño, desarrollo y modernización de aplicaciones basadas en arquitecturas de microservicios y soluciones Cloud Native.',
        stack: ['NestJS', 'MongoDB', 'Amazon Web Services (AWS)', 'Desarrollo Dirigido por Especificaciones (SDD)', 'Espíritu de equipo']
    }
];

/**
 * Skills. `uses` = nº de experiencias del perfil en las que aparece la
 * aptitud (LinkedIn: "N experiencias en …"); es el único valor numérico y
 * es real. null = LinkedIn no lo indica. `where` = puestos concretos citados.
 * `group` es una agrupación editorial propia.
 */
export const skillGroups = [
    { id: 'backend', label: 'Backend y datos' },
    { id: 'frontend', label: 'Frontend y web' },
    { id: 'cloud', label: 'Cloud y herramientas' },
    { id: 'lead', label: 'Equipos y método' },
    { id: 'ia', label: 'IA y especificaciones' },
    { id: 'negocio', label: 'Producto y negocio' }
];

// Actualizado el 2026-10-14 tras añadir aptitudes en LinkedIn. "Node js" y "Node.js" figuran
// por separado en LinkedIn (2 y 3 etapas); aquí van unidas con el mayor de los dos valores.
export const skills = [
    // backend
    { name: 'Node.js', group: 'backend', uses: 3, where: ['fourvenues', 'nexum'] },
    { name: 'Express.js', group: 'backend', uses: 4 },
    { name: 'fastify', group: 'backend', uses: null, where: ['fourvenues'] },
    { name: 'NestJS', group: 'backend', uses: 2, where: ['hiberus', 'gd'] },
    { name: 'PostgreSQL', group: 'backend', uses: 2 },
    { name: 'MongoDB', group: 'backend', uses: 3, where: ['hiberus', 'quibim-cto'] },
    { name: 'Redis', group: 'backend', uses: null, where: ['fourvenues'] },
    { name: 'RabbitMQ', group: 'backend', uses: null, where: ['fourvenues'] },
    { name: 'Apache Kafka', group: 'backend', uses: null, where: ['gd'] },
    { name: 'Microservicios', group: 'backend', uses: 2 },
    { name: 'Desarrollo de API', group: 'backend', uses: 3 },
    { name: 'JSON', group: 'backend', uses: 7 },
    // frontend
    { name: 'JavaScript', group: 'frontend', uses: 6 },
    { name: 'TypeScript', group: 'frontend', uses: 3 },
    { name: 'Angular', group: 'frontend', uses: 2, where: ['quibim-front', 'quibim-cto'] },
    { name: 'AngularJS', group: 'frontend', uses: 2 },
    { name: 'React.js', group: 'frontend', uses: null, where: ['nexum'] },
    { name: 'Redux.js', group: 'frontend', uses: 2 },
    { name: 'HTML5', group: 'frontend', uses: 3 },
    { name: 'CSS3', group: 'frontend', uses: 7 },
    { name: 'jQuery', group: 'frontend', uses: 4 },
    { name: 'jQuery Mobile', group: 'frontend', uses: null, where: ['independiente'] },
    { name: 'PhoneGap', group: 'frontend', uses: null, where: ['independiente', 'geographica'] },
    { name: 'Desarrollo del front-end', group: 'frontend', uses: 7, where: ['geographica'] },
    { name: 'Aplicaciones web progresivas (PWA)', group: 'frontend', uses: null },
    // cloud
    { name: 'Amazon Web Services (AWS)', group: 'cloud', uses: 2, where: ['hiberus', 'gd'] },
    { name: 'Docker', group: 'cloud', uses: 2 },
    { name: 'Windows Azure', group: 'cloud', uses: 2 },
    { name: 'Firebase', group: 'cloud', uses: null },
    { name: 'Git', group: 'cloud', uses: 7 },
    { name: 'JIRA', group: 'cloud', uses: 3 },
    // equipos y método
    { name: 'Clean code', group: 'lead', uses: 5 },
    { name: 'Scrum', group: 'lead', uses: 3 },
    { name: 'Espíritu de equipo', group: 'lead', uses: null, where: ['hiberus'] },
    { name: 'Liderazgo de equipos', group: 'lead', uses: 2 },
    { name: 'Dirección de equipos', group: 'lead', uses: 2 },
    { name: 'Liderazgo', group: 'lead', uses: null, where: ['quibim-cto'] },
    { name: 'Gestión de proyectos', group: 'lead', uses: null, where: ['quibim-cto'] },
    { name: 'Desarrollo de productos', group: 'lead', uses: 2 },
    { name: 'Desarrollo de software', group: 'lead', uses: 9 },
    // IA y especificaciones
    { name: 'Inteligencia artificial', group: 'ia', uses: null, where: ['fourvenues'] },
    { name: 'Desarrollo Dirigido por Especificaciones (SDD)', group: 'ia', uses: null, where: ['hiberus'] },
    // negocio
    { name: 'Salesforce Commerce Cloud (SFCC)', group: 'negocio', uses: null, where: ['nexum'] },
    { name: 'Comercio electrónico', group: 'negocio', uses: 2 },
    { name: 'Estrategia empresarial', group: 'negocio', uses: null, where: ['quibim-cto'] },
    { name: 'Transformación digital', group: 'negocio', uses: null },
    { name: 'Marketing digital', group: 'negocio', uses: null }
];

export const education = [
    {
        id: 'master',
        title: 'Máster en Diseño de Productos e Instalaciones',
        school: 'Universidad de Sevilla',
        period: '2013 – 2014',
        note: 'Intensificación en instalaciones industriales y de edificación.'
    },
    {
        id: 'ingenieria',
        title: 'Ingeniero Técnico Industrial, Química Industrial',
        school: 'Universidad de Sevilla',
        period: '2005 – 2010',
        note: 'Ingeniería Química con intensificación en operaciones básicas, análisis químico industrial e instalaciones eléctricas de baja tensión.'
    },
    {
        id: 'philips',
        title: 'Philips HealthWorks Startup Program',
        school: 'Philips R&D',
        period: 'sept. 2018 – dic. 2018',
        note: 'Emprendimiento: pequeña empresa y estrategia empresarial.'
    }
];

export const training = [
    { title: 'Apps móviles con jQuery Mobile y PhoneGap', school: 'Estación de Diseño', period: '2014' },
    { title: 'Mobile HTML5', school: 'Estación de Diseño', period: '2014' },
    { title: 'Técnico competente para Planes de Autoprotección (RD 393/2007)', school: 'Consejo General de la Ingeniería Técnica Industrial', period: '2013' },
    { title: 'Curso para jóvenes emprendedores universitarios', school: 'EOI Escuela de Organización Industrial', period: '2011 – 2012' },
    { title: 'Técnico Básico en Prevención de Riesgos Laborales', school: 'Universidad de Sevilla', period: '2010 – 2011' }
];

export const certifications = [
    {
        title: 'AWS Certified Developer – Associate',
        issuer: 'Amazon Web Services (AWS)',
        issued: 'feb. 2024',
        expires: 'feb. 2027'
    },
    {
        title: 'Salesforce B2C Commerce Developer',
        issuer: 'Salesforce',
        issued: 'dic. 2020',
        expires: 'dic. 2023'
    }
];

export const projects = [
    {
        name: 'MiFalla',
        period: 'mar. 2024 – actualidad',
        text: 'PWA para la gestión de Fallas en la Comunidad Valenciana: compartir documentos, crear un timeline de fotos, gestionar eventos y comunicarse con otros falleros.',
        stack: ['Firebase', 'Angular']
    },
    {
        name: 'Mi Finca',
        period: 'ago. 2022 – dic. 2022',
        text: 'Software para la gestión de pequeñas ganaderías. PWA basada en Firebase y React.',
        stack: ['PWA', 'React.js']
    },
    {
        name: 'Gemedy Safety',
        period: 'nov. 2013 – nov. 2014',
        text: 'Software multidispositivo para gestionar y optimizar la respuesta en situaciones de emergencia y evacuación en recintos de alto aforo. Asociado con Seguridad Industrial.',
        stack: []
    }
];

export const languages = [{ name: 'Inglés' }];

/**
 * Todas las fotos del álbum "WEB" (24 a 2026-10-14). La galería sortea 12 en cada carga.
 * `alt` y `caption` son editoriales (descripción de la imagen).
 */
export const photos = [
    { id: 'campanario', w: 2048, h: 2730, sizes: [480, 960, 1600], alt: 'Selfie frente a un campanario medieval y su plaza', caption: 'Campanario' },
    { id: 'figuras-cera', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'Sentado entre dos figuras de cera con sombrero y gafas de sol', caption: 'Figuras de cera' },
    { id: 'aeropuerto', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'Selfie con auriculares en una pista de aeropuerto', caption: 'Aeropuerto' },
    { id: 'selfie-abrigo', w: 746, h: 746, sizes: [480, 746], alt: 'Selfie en compañía con abrigos de invierno', caption: 'Selfie' },
    { id: 'boda', w: 2048, h: 1365, sizes: [480, 960, 1600], alt: 'Con el pulgar en alto entre invitados de una boda', caption: 'Boda' },
    { id: 'fiesta', w: 2048, h: 1365, sizes: [480, 960, 1600], alt: 'Bailando en una fiesta, con la imagen movida por el flash', caption: 'Fiesta' },
    { id: 'mirador', w: 2048, h: 2727, sizes: [480, 960, 1600], alt: 'Abrazados en un mirador sobre un valle verde', caption: 'Mirador' },
    { id: 'retrato-bn', w: 2047, h: 2294, sizes: [480, 960, 1600], alt: 'Retrato en blanco y negro con gafas de sol', caption: 'Retrato' },
    { id: 'llanura', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'Selfie con gafas de sol bajo un cielo azul', caption: 'Llanura' },
    { id: 'toldo-rojo', w: 2048, h: 1538, sizes: [480, 960, 1600], alt: 'Sentado en un vehículo con toldo rojo', caption: 'Toldo rojo' },
    { id: 'plantacion', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'De pie con un grupo entre campos de cultivo', caption: 'Plantación' },
    { id: 'roca', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'Selfie sobre una formación rocosa con montañas al fondo', caption: 'Roca' },
    { id: 'cascada', w: 2048, h: 1538, sizes: [480, 960, 1600], alt: 'Con los brazos en cruz bajo una cascada', caption: 'Cascada' },
    { id: 'interior', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'Sentado en el suelo de una casa con otras dos personas', caption: 'Interior' },
    { id: 'baobab', w: 2048, h: 2730, sizes: [480, 960, 1600], alt: 'Autorretrato al pie de dos baobabs', caption: 'Baobabs' },
    { id: 'velero', w: 2048, h: 2731, sizes: [480, 960, 1600], alt: 'A bordo de un velero con la vela desplegada', caption: 'Velero' },
    { id: 'jardin', w: 2048, h: 2731, sizes: [480, 960, 1600], alt: 'Agachado en un jardín con una palmera', caption: 'Jardín' },
    { id: 'niebla', w: 2048, h: 1536, sizes: [480, 960, 1600], alt: 'Silueta a contraluz frente a montañas con niebla', caption: 'Niebla' },
    { id: 'brindis', w: 768, h: 1024, sizes: [480, 768], alt: 'Brindando con una copa de cerveza', caption: 'Brindis' },
    { id: 'atardecer', w: 1600, h: 1068, sizes: [480, 960, 1600], alt: 'Dos siluetas brindando frente a un atardecer', caption: 'Atardecer' },
    { id: 'cubierta', w: 1200, h: 1600, sizes: [480, 960, 1200], alt: 'De pie en la cubierta de un velero con más gente', caption: 'Cubierta' },
    { id: 'turbante', w: 768, h: 1024, sizes: [480, 768], alt: 'Sentado en un sofá con un turbante naranja', caption: 'Turbante' },
    { id: 'taj-mahal', w: 1200, h: 1600, sizes: [480, 960, 1200], alt: 'Frente al Taj Mahal', caption: 'Taj Mahal' },
    { id: 'chaleco', w: 1200, h: 1600, sizes: [480, 960, 1200], alt: 'De pie con un chaleco bordado junto a una estantería de ropa', caption: 'Chaleco' }
];

/** Cuántas fotos muestra la galería en cada carga (elegidas al azar entre todas). */
export const galleryCount = 12;

/** Fotos que entran en la escena 3D (orden = posición a lo largo del camino); tienen textura 512² en img/tex/. */
export const scenePhotos = ['niebla', 'roca', 'baobab', 'atardecer', 'cascada', 'retrato-bn', 'jardin', 'turbante'];
