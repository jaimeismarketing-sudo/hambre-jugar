(function (root) {
  'use strict';

  // All prices, returns, markets, people and outcomes in this engine are fiction.
  // No historical career data is assumed by the provisional starting scenario.
  const catalog = {
    commerceRules: { merchUnitPrice: 30, merchUnitCost: 18, merchHistoryWeeks: 52, note: 'Marca de ropa: fabricación bajo demanda, un artículo vendido equivale a una unidad. Precio ficticio $30 y coste de fabricación/entrega $18; margen antes de socio y mantenimiento $12. Las ventas y costes se registran el domingo, sin inventario ni conversión de ingresos históricos a artículos.' },
    salesRules: { digitalPrices: { single: 1.29, ep: 4.49, album: 7.99, deluxe: 5.99 }, digitalDistributionRate: .15, streamRoyalty: .0032, historyDays: 730, releaseHistoryBudget: 1600, note: 'Modelo original y provisional: ventas digitales de copias completas, separadas de streams. El coste variable de distribución se descuenta del devengado, no de la caja. Sin inventario físico: unidades físicas = 0. Las regalías liquidan el lunes de S+4. Curvas globales hasta 730 días; las curvas por obra comparten 1.600 registros y muestran solo días retenidos. Los acumulados se conservan completos.' },
    countries: [
      { id: 'CO', name: 'Colombia', marketId: 'Colombia', cities: [
        { id: 'co-medellin', name: 'Medellín', scene: 'Colectivos y salas de ensayo', livingMultiplier: .98 },
        { id: 'co-cali', name: 'Cali', scene: 'Encuentros de barrio y sesiones en vivo', livingMultiplier: .95 },
        { id: 'co-bogota', name: 'Bogotá', scene: 'Circuito universitario y escenarios independientes', livingMultiplier: 1 },
        { id: 'co-barranquilla', name: 'Barranquilla', scene: 'Patios creativos y encuentros de costa', livingMultiplier: .96 }
      ] },
      { id: 'MX', name: 'México', marketId: 'México', cities: [
        { id: 'mx-cdmx', name: 'Ciudad de México', scene: 'Foros pequeños y colectivos de artistas', livingMultiplier: 1.06 },
        { id: 'mx-guadalajara', name: 'Guadalajara', scene: 'Garajes y salas de bandas emergentes', livingMultiplier: 1.01 },
        { id: 'mx-monterrey', name: 'Monterrey', scene: 'Eventos independientes y estudios compartidos', livingMultiplier: 1.04 },
        { id: 'mx-puebla', name: 'Puebla', scene: 'Circuito estudiantil y conciertos íntimos', livingMultiplier: .97 }
      ] },
      { id: 'AR', name: 'Argentina', marketId: 'Argentina', cities: [
        { id: 'ar-buenos-aires', name: 'Buenos Aires', scene: 'Centros culturales y noches de escenario abierto', livingMultiplier: 1.02 },
        { id: 'ar-cordoba', name: 'Córdoba', scene: 'Bares de ensayo y comunidad estudiantil', livingMultiplier: .97 },
        { id: 'ar-rosario', name: 'Rosario', scene: 'Salas autogestionadas y encuentros de composición', livingMultiplier: .96 },
        { id: 'ar-mendoza', name: 'Mendoza', scene: 'Festivales pequeños y bandas locales', livingMultiplier: .98 }
      ] },
      { id: 'CL', name: 'Chile', marketId: 'Chile', cities: [
        { id: 'cl-santiago', name: 'Santiago', scene: 'Salas de ensayo y circuitos independientes', livingMultiplier: 1.05 },
        { id: 'cl-valparaiso', name: 'Valparaíso', scene: 'Talleres creativos y escenarios de puerto', livingMultiplier: .99 },
        { id: 'cl-concepcion', name: 'Concepción', scene: 'Colectivos de bandas y escenarios universitarios', livingMultiplier: .98 }
      ] },
      { id: 'PE', name: 'Perú', marketId: 'Perú', cities: [
        { id: 'pe-lima', name: 'Lima', scene: 'Colectivos independientes y estudios de barrio', livingMultiplier: 1 },
        { id: 'pe-arequipa', name: 'Arequipa', scene: 'Salas compartidas y público universitario', livingMultiplier: .95 },
        { id: 'pe-trujillo', name: 'Trujillo', scene: 'Centros culturales y encuentros locales', livingMultiplier: .94 }
      ] },
      { id: 'BR', name: 'Brasil', marketId: 'Brasil', cities: [
        { id: 'br-sao-paulo', name: 'São Paulo', scene: 'Estudios compartidos y circuitos de colectivos', livingMultiplier: 1.07 },
        { id: 'br-rio', name: 'Rio de Janeiro', scene: 'Sesiones en vivo y escenarios de barrio', livingMultiplier: 1.05 },
        { id: 'br-belo-horizonte', name: 'Belo Horizonte', scene: 'Salas de bandas y colectivos creativos', livingMultiplier: .99 },
        { id: 'br-recife', name: 'Recife', scene: 'Encuentros de composición y salas de costa', livingMultiplier: .96 }
      ] },
      { id: 'PR', name: 'Puerto Rico', marketId: 'Puerto Rico', cities: [
        { id: 'pr-san-juan', name: 'San Juan', scene: 'Productores emergentes y escenarios pequeños', livingMultiplier: 1.08 },
        { id: 'pr-ponce', name: 'Ponce', scene: 'Centros culturales y sesiones colectivas', livingMultiplier: 1.02 },
        { id: 'pr-mayaguez', name: 'Mayagüez', scene: 'Comunidad estudiantil y bandas locales', livingMultiplier: 1.01 }
      ] },
      { id: 'DO', name: 'República Dominicana', marketId: 'República Dominicana', cities: [
        { id: 'do-santo-domingo', name: 'Santo Domingo', scene: 'Estudios de barrio y escenarios emergentes', livingMultiplier: 1 },
        { id: 'do-santiago', name: 'Santiago de los Caballeros', scene: 'Colectivos de composición y eventos locales', livingMultiplier: .97 },
        { id: 'do-la-romana', name: 'La Romana', scene: 'Encuentros comunitarios y sesiones de costa', livingMultiplier: .96 }
      ] }
    ],
    backgrounds: [
      { id: 'self-taught', name: 'Autodidacta de habitación', desc: 'Has aprendido a componer y producir a solas. Tienes menos práctica ante el público y en los negocios.', skills: { writing: 3, flow: -2, production: 5, stage: -4, business: -2 }, contactId: 'luna', contactBonus: 8 },
      { id: 'live-scene', name: 'Artista de la escena local', desc: 'Vienes de jams y escenarios abiertos. Interpretas con soltura, pero te falta experiencia de estudio y negociación.', skills: { writing: 2, flow: 4, production: -5, stage: 4, business: -5 }, contactId: 'kairo', contactBonus: 8 },
      { id: 'organizer', name: 'Organizador de eventos', desc: 'Has ayudado a montar fechas y negociar espacios. Conoces el negocio, aunque tu oficio musical está menos trabajado.', skills: { writing: -3, flow: -3, production: -2, stage: 2, business: 6 }, contactId: 'bruno', contactBonus: 8 }
    ],
    appearance: {
      defaults: { body: 'regular', face: 'oval', eyes: 'almond', brows: 'straight', hair: 'short', hairColor: '#29262e', outfitType: 'jacket', pantsType: 'classic', shoesType: 'classic', hatType: 'none', neckType: 'none', accessory: 'none', skin: '#a86742', outfit: '#272333', accent: '#e57851' },
      enums: { body: ['slim', 'regular', 'broad'], face: ['oval', 'angular', 'round'], eyes: ['almond', 'round', 'relaxed'], brows: ['straight', 'arched', 'thick'], hair: ['short', 'braids', 'afro', 'curls', 'long', 'bun', 'hood', 'cap', 'bald'], outfitType: ['tshirt', 'jacket', 'hoodie', 'denim', 'bomber', 'leather', 'overshirt', 'polo', 'knit', 'vest', 'coat'], pantsType: ['classic', 'wide', 'cargo', 'ripped', 'tailored', 'track'], shoesType: ['classic', 'high_top', 'boots', 'loafers'], hatType: ['none', 'beanie', 'bucket', 'beret', 'bandana'], neckType: ['none', 'chain', 'scarf', 'pendant'], accessory: ['none', 'glasses', 'earring', 'headphones'] },
      wardrobe: {
        outfitType: {tshirt:{price:0},jacket:{price:0},hoodie:{price:0},denim:{price:450},bomber:{price:650},leather:{price:1200},overshirt:{milestones:2},polo:{price:0},knit:{price:280},vest:{price:420},coat:{price:900}},
        pantsType: {classic:{price:0},wide:{price:0},cargo:{price:350},ripped:{milestones:1},tailored:{price:320},track:{price:240}},
        shoesType: {classic:{price:0},high_top:{price:300},boots:{price:550},loafers:{price:380}},
        hatType: {none:{price:0},beanie:{price:0},bucket:{price:180},beret:{milestones:2},bandana:{price:0}},
        neckType: {none:{price:0},chain:{price:250},scarf:{milestones:1},pendant:{price:180}}
      },
      colorFields: ['skin', 'hairColor', 'outfit', 'accent'],
      note: 'La apariencia no modifica habilidades ni demanda. Las prendas de tienda consumen dinero sólo al comprar; hay opciones gratuitas y desbloqueos por hitos.'
    },
    jobs: [
      { id:'cafe', name:'Turno en cafetería', wage:180, energy:16, desc:'Atiende una cafetería de barrio; eliges cada turno que aceptas.' },
      { id:'delivery', name:'Reparto local', wage:220, energy:24, desc:'Entrega pedidos por la ciudad; exige más energía y paga por turno completado.' },
      { id:'stagehand', name:'Asistente de escenario', wage:270, energy:30, desc:'Ayuda a montar eventos; un turno intenso con mejor remuneración.' }
    ],
    actions: [
      { id: 'dayjob', name: 'Trabajo temporal', label: 'Trabajo temporal', cost: 0, energy: 24, desc: 'Cobra $200 por un trabajo temporal. Ocupa una de tus tres acciones y ayuda a financiar tu carrera.', category: 'sustento' },
      { id: 'employment_shift', name: 'Turno de empleo', label: 'Turno de empleo', cost: 0, energy: 0, desc: 'Programa un turno del empleo que aceptaste.', category: 'sustento' },
      { id:'album_video_shoot',name:'Rodaje de videoclip de álbum',label:'Rodaje de videoclip',cost:0,energy:22,desc:'Programa el rodaje desde un videoclip contratado; cada sesión ocupa un turno real.',category:'promoción' },
      { id: 'video', name: 'Crear video para YouTube', label: 'Video para YouTube', cost: 140, energy: 20, desc: 'Publica contenido, crece en suscriptores y puede generar ingresos cuando tu canal alcance escala.', category: 'promoción' },
      { id: 'home_record', name: 'Grabar una maqueta', label: 'Grabar una maqueta', cost: 55, energy: 20, desc: 'Graba con equipo básico: progreso lento y calidad limitada.', category: 'música' },
      { id: 'write', name: 'Escribir barras', label: 'Escribir barras', cost: 120, energy: 15, desc: 'Mejora escritura y avanza una canción en preparación.', category: 'música' },
      { id: 'record', name: 'Grabar en estudio', label: 'Grabar en estudio', cost: 1400, energy: 24, desc: 'Avanza el proyecto activo. Un estudio propio reduce el coste.', category: 'música' },
      { id: 'produce', name: 'Producir y mezclar', label: 'Producir y mezclar', cost: 900, energy: 20, desc: 'Mejora producción, calidad y progreso de tu proyecto.', category: 'música' },
      { id: 'release', name: 'Publicar proyecto', label: 'Publicar proyecto', cost: 700, energy: 12, desc: 'Publica un proyecto terminado y abre ingresos de streaming.', category: 'música' },
      { id: 'rehearse', name: 'Ensayar directo', label: 'Ensayar directo', cost: 250, energy: 18, desc: 'Mejora escenario y prepara la siguiente presentación.', category: 'carrera' },
      { id: 'social', name: 'Contenido y redes', label: 'Contenido y redes', cost: 400, energy: 14, desc: 'Atrae seguidores y cumple compromisos publicitarios.', category: 'promoción' },
      { id: 'network', name: 'Networking', label: 'Networking', cost: 650, energy: 16, desc: 'Fortalece contactos y aumenta la probabilidad de ofertas.', category: 'carrera' },
      { id: 'collab', name: 'Sesión colaborativa', label: 'Sesión colaborativa', cost: 2800, energy: 23, desc: 'Trabaja con otro artista y comparte público.', category: 'música' },
      { id: 'street', name: 'Cypher y comunidad', label: 'Cypher y comunidad', cost: 30, energy: 18, desc: 'Construye reputación, flow y vínculos locales.', category: 'carrera' },
      { id: 'interview', name: 'Entrevista y prensa', label: 'Entrevista y prensa', cost: 800, energy: 14, desc: 'Aumenta visibilidad; una buena reputación ayuda.', category: 'promoción' },
      { id: 'business', name: 'Negociar y estudiar negocio', label: 'Negociar y estudiar negocio', cost: 250, energy: 12, desc: 'Mejora negocios y tu capacidad para evaluar acuerdos.', category: 'finanzas' },
      { id: 'fanclub', name: 'Encuentro con fans', label: 'Encuentro con fans', cost: 350, energy: 16, desc: 'Refuerza la comunidad y produce ventas directas modestas.', category: 'promoción' },
      { id: 'band_audition', name: 'Audición de grupo', label: 'Audición de grupo', cost: 30, energy: 18, desc: 'Una prueba real para una formación. Programa la audición desde Bandas.', category: 'carrera' },
      { id: 'band_rehearsal', name: 'Ensayo con la banda', label: 'Ensayo con la banda', cost: 60, energy: 16, desc: 'Ensaya con la formación activa y cumple su compromiso semanal.', category: 'carrera' },
      { id: 'management_record', name: 'Dirigir grabación', label: 'Dirigir grabación', cost: 30, energy: 18, desc: 'Gestiona la actividad de un cliente desde Sello y roster; el artista financia su producción.', category: 'representación' },
      { id: 'management_promote', name: 'Promocionar cliente', label: 'Promocionar cliente', cost: 30, energy: 14, desc: 'Gestiona la actividad de un cliente desde Sello y roster; el artista financia su producción.', category: 'representación' },
      { id: 'management_release', name: 'Lanzar obra de cliente', label: 'Lanzar obra de cliente', cost: 30, energy: 12, desc: 'Gestiona la actividad de un cliente desde Sello y roster; el artista financia su producción.', category: 'representación' },
      { id: 'management_show', name: 'Coordinar show de cliente', label: 'Coordinar show de cliente', cost: 30, energy: 24, desc: 'Gestiona la actividad de un cliente desde Sello y roster; el artista financia su producción.', category: 'representación' },
      { id: 'rest', name: 'Descansar', label: 'Descansar', cost: 80, energy: -32, desc: 'Recupera energía, salud y ánimo.', category: 'bienestar' }
    ],
    venues: [
      { id: 'openmic', name: 'El Sótano · Bogotá', label: 'Open mic · Bogotá', capacity: 100, cost: 90, ticket: 8, country: 'Colombia', city: 'Bogotá', requirements: { fame: 0, reputation: 0 }, desc: 'Sala pequeña para probar canciones y ganar experiencia.' },
      { id: 'club', name: 'Club Neón · CDMX', label: 'Club Neón · México', capacity: 450, cost: 1600, ticket: 18, country: 'México', city: 'Ciudad de México', requirements: { fame: 5, reputation: 5 }, desc: 'Club cercano al público local.' },
      { id: 'theater', name: 'Teatro Sur · Buenos Aires', label: 'Teatro Sur · Argentina', capacity: 1800, cost: 9500, ticket: 30, country: 'Argentina', city: 'Buenos Aires', requirements: { fame: 15, reputation: 15 }, desc: 'Producción mediana con mayor coste fijo.' },
      { id: 'warehouse', name: 'Nave 808 · Santiago', label: 'Nave 808 · Chile', capacity: 3500, cost: 23000, ticket: 35, country: 'Chile', city: 'Santiago', requirements: { fame: 25, reputation: 20 }, desc: 'Una nave industrial con un aforo que exige demanda real.' },
      { id: 'festival', name: 'Festival Horizonte · Lima', label: 'Horizonte · Perú', capacity: 10000, cost: 65000, ticket: 45, country: 'Perú', city: 'Lima', requirements: { fame: 40, reputation: 35 }, desc: 'Acceso a público nuevo, con logística costosa.' },
      { id: 'arena', name: 'Arena Prisma · San Juan', label: 'Arena Prisma · Caribe', capacity: 18000, cost: 145000, ticket: 60, country: 'Caribe', city: 'San Juan', requirements: { fame: 55, reputation: 45 }, desc: 'Gran escenario: el aforo no garantiza vender entradas.' },
      { id: 'stadium', name: 'Estadio Eclipse · São Paulo', label: 'Eclipse · Brasil', capacity: 65000, cost: 520000, ticket: 75, country: 'Brasil', city: 'São Paulo', requirements: { fame: 75, reputation: 60 }, desc: 'Producción de estadio con riesgo de pérdidas elevado.' },
      { id: 'usa_club', name: 'Puerta USA · Miami', label: 'Miami · bloqueo hard', capacity: 2000, cost: 18000, ticket: 45, country: 'USA', city: 'Miami', lockedRegion: 'usa', requirements: { fame: 65, reputation: 75 }, desc: 'Solo se habilita al completar los objetivos de victoria hard en LATAM.' },
      ...[['madrid','Madrid','España'],['paris','París','Francia'],['london','Londres','Reino Unido'],['berlin','Berlín','Alemania'],['tokyo','Tokio','Japón'],['seoul','Seúl','Corea del Sur'],['johannesburg','Johannesburgo','Sudáfrica'],['sydney','Sídney','Australia']].map(([id,city,country])=>({id:'world_'+id,name:'Circuito internacional · '+city,label:city+' · club internacional',capacity:2000,cost:18000,ticket:45,country,city,lockedRegion:'usa',requirements:{fame:65,reputation:75},desc:'Sala ficticia de entrada internacional. Requiere superar hard en LATAM; público y ocupación son locales.'}))
    ],
    investments: [
      { id: 'home_studio', name: 'Estudio casero', label: 'Estudio casero', category: 'música', cost: 32000, maintenance: 85, rent: 0, liquidity: .68, risk: .02, depreciation: .001, bonus: 'studio', desc: 'Reduce el coste de grabar un 55% y mejora el progreso.' },
      { id: 'commercial_studio', name: 'Estudio comercial', label: 'Estudio comercial', category: 'negocio', cost: 125000, maintenance: 650, rent: 1900, liquidity: .7, risk: .12, depreciation: .0007, bonus: 'studio', desc: 'Renta sesiones a terceros; sus ingresos fluctúan.' },
      { id: 'publishing', name: 'Catálogo editorial independiente', label: 'Catálogo editorial', category: 'música', cost: 60000, maintenance: 95, rent: 650, liquidity: .65, risk: .15, depreciation: 0, desc: 'Regalías simuladas; pueden bajar o crecer según la demanda.' },
      { id: 'merch', name: 'Marca de ropa', label: 'Marca de ropa', category: 'negocio', cost: 28000, maintenance: 180, rent: 420, liquidity: .5, risk: .2, depreciation: .0005, desc: 'Vende artículos bajo demanda a $30, con coste de fabricación y entrega de $18. Cada artículo vendido cuenta como una unidad. El público modifica la demanda; el mantenimiento se paga aparte.' },
      { id: 'foodtruck', name: 'Food truck', label: 'Food truck', category: 'negocio', cost: 42000, maintenance: 240, rent: 650, liquidity: .62, risk: .12, depreciation: .0012, desc: 'Negocio físico con mantenimiento e ingresos variables.' },
      { id: 'barbershop', name: 'Barbería de barrio', label: 'Barbería', category: 'negocio', cost: 65000, maintenance: 380, rent: 900, liquidity: .64, risk: .1, depreciation: .0005, desc: 'Clientela recurrente con riesgo de semanas flojas.' },
      { id: 'condo', name: 'Apartamento para alquilar', label: 'Apartamento', category: 'inmueble', cost: 145000, maintenance: 185, rent: 740, liquidity: .87, risk: .06, depreciation: 0, desc: 'Renta semanal, vacancia y venta con descuento por liquidez.' },
      { id: 'building', name: 'Edificio de cuatro unidades', label: 'Edificio', category: 'inmueble', cost: 480000, maintenance: 650, rent: 2600, liquidity: .84, risk: .08, depreciation: 0, desc: 'Mayor renta y exposición a reparaciones.' },
      { id: 'tour_van', name: 'Van de gira', label: 'Van de gira', category: 'vehículo', cost: 34000, maintenance: 130, rent: 0, liquidity: .7, risk: .04, depreciation: .002, bonus: 'tour', desc: 'Reduce un 20% el coste fijo de los conciertos.' },
      { id: 'luxury_car', name: 'Coupé de lujo', label: 'Coupé de lujo', category: 'lujo', cost: 115000, maintenance: 480, rent: 0, liquidity: .65, risk: .04, depreciation: .004, desc: 'Mejora el ánimo al comprarlo; consume caja y pierde valor.' },
      { id: 'home', name: 'Casa propia', label: 'Casa propia', category: 'vivienda', cost: 225000, maintenance: 240, rent: 0, liquidity: .85, risk: .025, depreciation: 0, bonus: 'home', desc: 'Reduce gastos de vivienda; no produce renta.' },
      { id: 'watch', name: 'Reloj de colección', label: 'Reloj de colección', category: 'lujo', cost: 18000, maintenance: 12, rent: 0, liquidity: .7, risk: .08, depreciation: .0005, desc: 'Objeto físico con precio de reventa incierto.' },
      { id: 'used_motorcycle', name: 'Moto usada de mensajería', label: 'Moto usada', category: 'vehículo', cost: 4500, maintenance: 48, rent: 0, liquidity: .7, risk: .1, depreciation: .003, repeatable: true, desc: 'Transporte económico con desgaste y reparaciones; su venta no recupera todo el precio.' },
      { id: 'used_van', name: 'Furgoneta usada', label: 'Furgoneta usada', category: 'vehículo', cost: 16500, maintenance: 95, rent: 0, liquidity: .72, risk: .09, depreciation: .0025, repeatable: true, bonus: 'tour', desc: 'Vehículo para giras; reduce el coste fijo de concierto mientras lo conservas.' },
      { id: 'tour_bus', name: 'Autobús de gira', label: 'Autobús de gira', category: 'vehículo', cost: 180000, maintenance: 740, rent: 0, liquidity: .64, risk: .07, depreciation: .0018, repeatable: true, bonus: 'tour', desc: 'Transporte de gran capacidad con mantenimiento, depreciación y liquidez limitadas.' },
      { id: 'record_store', name: 'Tienda de discos independiente', label: 'Tienda de discos', category: 'negocio', cost: 52000, maintenance: 340, rent: 780, liquidity: .58, risk: .14, depreciation: .0007, repeatable: true, desc: 'Venta física sujeta a clientela, costes operativos y semanas flojas.' },
      { id: 'rehearsal_rooms', name: 'Salas de ensayo', label: 'Salas de ensayo', category: 'negocio', cost: 82000, maintenance: 480, rent: 1250, liquidity: .66, risk: .11, depreciation: .0008, repeatable: true, desc: 'Alquila salas a músicos; los ingresos y reparaciones son inciertos.' },
      { id: 'equipment_rental', name: 'Alquiler de equipo de sonido', label: 'Equipo de alquiler', category: 'negocio', cost: 36000, maintenance: 230, rent: 560, liquidity: .55, risk: .18, depreciation: .0014, repeatable: true, desc: 'Alquila equipo; el uso aumenta la exposición a desgaste y reparaciones.' },
      { id: 'neighborhood_cafe', name: 'Café de barrio', label: 'Café', category: 'negocio', cost: 95000, maintenance: 690, rent: 1600, liquidity: .59, risk: .17, depreciation: .0008, repeatable: true, desc: 'Negocio físico con clientela variable, gastos semanales y riesgo operativo.' },
      { id: 'rental_studio', name: 'Local para alquilar', label: 'Local comercial', category: 'inmueble', cost: 105000, maintenance: 155, rent: 560, liquidity: .81, risk: .08, depreciation: 0, repeatable: true, desc: 'Un local adicional con renta, vacancia y posibles reparaciones.' },
      { id: 'compact_flat', name: 'Apartamento pequeño de inversión', label: 'Apartamento pequeño', category: 'inmueble', cost: 85000, maintenance: 130, rent: 430, liquidity: .86, risk: .06, depreciation: 0, repeatable: true, desc: 'Una propiedad adicional: el alquiler puede interrumpirse y la venta lleva descuento.' },
      { id: 'mobile_recording_booth', name: 'Cabina de grabación móvil', label: 'Cabina móvil', category: 'negocio', cost: 24000, maintenance: 170, rent: 350, liquidity: .55, risk: .2, depreciation: .0014, repeatable: true, desc: 'Sesiones para voces y podcasts. Menor inversión inicial, demanda irregular y equipos que pierden valor.' },
      { id: 'screen_printing_shop', name: 'Taller de serigrafía', label: 'Serigrafía', category: 'negocio', cost: 47000, maintenance: 360, rent: 700, liquidity: .57, risk: .16, depreciation: .001, repeatable: true, desc: 'Encargos de impresión para terceros. Ingresos independientes de tu fama; materiales y local incluidos en el coste semanal.' },
      { id: 'parking_lot', name: 'Parqueadero de barrio', label: 'Parqueadero', category: 'inmueble', cost: 160000, maintenance: 260, rent: 740, liquidity: .79, risk: .1, depreciation: 0, repeatable: true, desc: 'Renta de plazas con ocupación variable, seguridad y posibles reparaciones. No garantiza rentabilidad.' },
      { id: 'index', name: 'Fondo bursátil ficticio', label: 'Fondo bursátil', category: 'bolsa', cost: 1000, maintenance: 0, rent: .8, liquidity: .995, risk: .025, depreciation: 0, repeatable: true, desc: 'Participaciones de $1.000; precio semanal variable, dividendos pequeños.' },
      { id: 'music_stock', name: 'Acciones de AudioNova', label: 'AudioNova', category: 'bolsa', cost: 1000, maintenance: 0, rent: 1.2, liquidity: .99, risk: .075, depreciation: 0, repeatable: true, desc: 'Empresa musical ficticia de mayor volatilidad.' },
      { id: 'bond', name: 'Bono ficticio de renta', label: 'Bono de renta', category: 'bolsa', cost: 1000, maintenance: 0, rent: 1.45, liquidity: .97, risk: .008, depreciation: 0, repeatable: true, desc: 'Interés semanal y menor volatilidad; vender tiene descuento.' }
    ],
    team: [
      { id: 'manager', name: 'Mánager', label: 'Mánager', cost: 2000, weeklyCost: 750, desc: 'Mejora ofertas y demanda de conciertos; cobra cada semana.' },
      { id: 'producer', name: 'Productora residente', label: 'Productora', cost: 1200, weeklyCost: 650, desc: 'Aumenta el progreso y la calidad de las grabaciones.' },
      { id: 'publicist', name: 'Agente de prensa', label: 'Prensa', cost: 1800, weeklyCost: 850, desc: 'Amplifica las acciones de promoción.' },
      { id: 'accountant', name: 'Contable', label: 'Contable', cost: 900, weeklyCost: 320, desc: 'Reduce un 8% los gastos de administración y activos.' },
      { id: 'trainer', name: 'Preparador físico', label: 'Preparador', cost: 600, weeklyCost: 280, desc: 'Mejora la recuperación semanal de salud y energía.' },
      { id: 'security', name: 'Seguridad de gira', label: 'Seguridad', cost: 1000, weeklyCost: 500, desc: 'Reduce incidentes en directo y aumenta confianza.' }
    ],
    projects: [
      { id: 'single', name: 'Sencillo', cost: 300, required: 50, multiplier: 1, tracks: 1 },
      { id: 'ep', name: 'EP', cost: 1300, required: 110, multiplier: 2.4, tracks: 5 },
      { id: 'album', name: 'Álbum', cost: 3500, required: 190, multiplier: 4.2, tracks: 12 },
      { id: 'deluxe', name: 'Edición deluxe', cost: 2200, required: 125, multiplier: 2.8, tracks: 6 }
    ],
    loans: [
      { id: 'micro', name: 'Crédito de equipo', amount: 10000, apr: .16, termWeeks: 52 },
      { id: 'business', name: 'Crédito de negocio', amount: 50000, apr: .2, termWeeks: 78 },
      { id: 'tour', name: 'Financiación de gira', amount: 120000, apr: .24, termWeeks: 104 }
    ],
    deals: [
      { id: 'distribution', name: 'Distribución independiente', type: 'distribution', advance: 18000, share: .15, duration: 52, recoupable: true, desc: 'Adelanto recuperable. Distribuidora retiene 15% del ingreso musical.' },
      { id: 'label', name: 'Sello Norte · licencia', type: 'label', advance: 110000, share: .35, duration: 78, recoupable: true, desc: 'Adelanto recuperable de regalías; licencia temporal y participación del sello.' },
      { id: 'sponsor', name: 'Patrocinio de RimaWear', type: 'sponsor', advance: 14000, share: 0, duration: 8, recoupable: false, promoEvery: 2, penalty: 1700, desc: 'Exige contenido promocional al menos cada dos semanas o aplica una penalización.' },
      { id: 'booking', name: 'Agencia de booking', type: 'booking', advance: 0, share: .12, duration: 26, recoupable: false, desc: 'Retiene 12% de entradas a cambio de más demanda.' }
    ],
    features: [
      { id: 'nina-sur', name: 'Nina Sur', tier: 'barrio', minFame: 0, fee: 180, masterShare: 0, durationPromoWeeks: 4, audience: 700, desc: 'Una artista emergente. Caché pequeño y promoción compartida, sin participación en masters.' },
      { id: 'mika-luz', name: 'Mika Luz', tier: 'local', minFame: 5, fee: 1200, masterShare: .05, durationPromoWeeks: 4, audience: 12000, desc: 'Artista ficticia con comunidad local. Mantiene una participación del 5% en esa grabación.' },
      { id: 'rayo', name: 'Rayo Índigo', tier: 'regional', minFame: 15, fee: 4500, masterShare: .08, durationPromoWeeks: 6, audience: 60000, desc: 'Colaboración regional con obligaciones de promoción.' },
      { id: 'sora', name: 'Sora Méndez', tier: 'nacional', minFame: 30, fee: 18000, masterShare: .1, durationPromoWeeks: 8, audience: 250000, desc: 'Alcance nacional; su audiencia no se convierte automáticamente en tus fans.' },
      { id: 'ara', name: 'Ara Niebla', tier: 'latam', minFame: 50, fee: 90000, masterShare: .15, durationPromoWeeks: 12, audience: 1000000, desc: 'Campaña de colaboración LATAM por tiempo limitado.' },
      { id: 'zaira', name: 'Zaira del Mar', tier: 'estrella', minFame: 70, fee: 380000, masterShare: .18, durationPromoWeeks: 12, audience: 4000000, desc: 'Caché alto y participación en la grabación; no garantiza recuperar la inversión.' },
      { id: 'elian', name: 'Elián Cobalto', tier: 'global-latam', minFame: 85, fee: 900000, masterShare: .2, durationPromoWeeks: 16, audience: 15000000, desc: 'Figura ficticia internacional de LATAM. Exige una carrera consolidada.' },
      { id:'lola-ceniza',name:'Lola Ceniza',style:'Rock',country:'México',tier:'local',minFame:5,fee:1600,masterShare:.06,durationPromoWeeks:4,audience:18000,desc:'Guitarras y estribillos del circuito de salas; comunidad pequeña y activa.' },
      { id:'ruido-norte',name:'Ruido Norte',style:'Rock',country:'Argentina',tier:'nacional',minFame:35,fee:36000,masterShare:.12,durationPromoWeeks:8,audience:600000,desc:'Banda ficticia de rock con público nacional; duetos y remixes de guitarras.' },
      { id:'ambar-vector',name:'Ámbar Vector',style:'Rock alternativo',country:'Chile',tier:'estrella',minFame:75,fee:520000,masterShare:.18,durationPromoWeeks:12,audience:6000000,desc:'Voz de rock LATAM con un caché de gran escala y expectativas altas.' },
      { id:'koru-verde',name:'Koru Verde',style:'Reggae',country:'Colombia',tier:'regional',minFame:15,fee:5200,masterShare:.07,durationPromoWeeks:6,audience:85000,desc:'Sesiones de roots y dub con un público regional propio.' },
      { id:'rio-lento',name:'Río Lento',style:'Reggae',country:'Perú',tier:'nacional',minFame:40,fee:65000,masterShare:.12,durationPromoWeeks:8,audience:800000,desc:'Estribillos melódicos y comunidad de reggae; su alcance no equivale a ventas.' },
      { id:'sol-abierto',name:'Sol Abierto',style:'Reggae',country:'Puerto Rico',tier:'estrella',minFame:68,fee:290000,masterShare:.16,durationPromoWeeks:12,audience:4800000,desc:'Una figura ficticia del reggae caribeño, con promoción limitada por contrato.' },
      { id:'rafael-cobre',name:'Rafael Cobre',style:'Metal',country:'Argentina',tier:'nacional',minFame:25,fee:15000,masterShare:.1,durationPromoWeeks:6,audience:300000,desc:'Guitarrista y vocalista del circuito pesado; producción e interpretación.' },
      { id:'humo-lunar',name:'Humo Lunar',style:'Metal',country:'México',tier:'latam',minFame:50,fee:95000,masterShare:.14,durationPromoWeeks:10,audience:1400000,desc:'Banda de metal de alcance LATAM, con una comunidad especializada.' },
      { id:'tierra-doble',name:'Tierra Doble',style:'Hip hop',country:'Colombia',tier:'local',minFame:8,fee:2100,masterShare:.05,durationPromoWeeks:4,audience:28000,desc:'Dúo de rap experimental disponible para versos y producciones.' },
      { id:'lua-nacar',name:'Lua Nácar',style:'Pop electrónico',country:'Brasil',tier:'latam',minFame:60,fee:180000,masterShare:.14,durationPromoWeeks:10,audience:2500000,desc:'Productora y cantante ficticia de pop electrónico.' },
      { id:'dario-marea',name:'Darío Marea',style:'Hip hop',country:'Puerto Rico',tier:'latam',minFame:65,fee:230000,masterShare:.16,durationPromoWeeks:12,audience:3000000,desc:'Cruce de rap y ritmos caribeños con condiciones de artista consolidado.' },
      { id:'mala-brasa',name:'Mala Brasa',style:'Ska',country:'Chile',tier:'nacional',minFame:30,fee:22000,masterShare:.08,durationPromoWeeks:6,audience:420000,desc:'Metales y ritmos de ska; una colaboración de banda, no solo un verso.' },
      { id:'yara-vento',name:'Yara Vento',style:'Pop',country:'Brasil',tier:'estrella',minFame:78,fee:650000,masterShare:.18,durationPromoWeeks:14,audience:7000000,desc:'Figura ficticia de pop brasileño; una campaña no transfiere toda su audiencia.' },
      // Fictional tuning, not real-world fee estimates. Monthly unique listeners
      // describe scale; the much smaller campaign pool drives optional promotion.
      {id:'atlas-neon',name:'Atlas Neón',style:'Rock',country:'México',tier:'global · 30M',minFame:65,minQuality:60,fee:2400000,masterShare:.2,durationPromoWeeks:12,monthlyListeners:30000000,promoAudience:4000000,audience:4000000,audienceModel:'global-v1',boostBudgetCap:50000000,desc:'Banda ficticia de rock internacional. Caché de diseño simulado; incluye promoción musical, el video se contrata aparte.'},
      {id:'valeria-prisma',name:'Valeria Prisma',style:'Pop',country:'Colombia',tier:'global · 60M',minFame:72,minQuality:67,fee:5500000,masterShare:.23,durationPromoWeeks:14,monthlyListeners:60000000,promoAudience:8000000,audience:8000000,audienceModel:'global-v1',boostBudgetCap:50000000,desc:'Figura ficticia de pop latino. Su audiencia mensual no es una promesa de alcance, fans ni ventas de tu colaboración.'},
      {id:'icaro-solar',name:'Ícaro Solar',style:'Hip hop',country:'Puerto Rico',tier:'global · 100M',minFame:80,minQuality:75,fee:10000000,masterShare:.25,durationPromoWeeks:16,monthlyListeners:100000000,promoAudience:12000000,audience:12000000,audienceModel:'global-v1',boostBudgetCap:50000000,desc:'Superestrella ficticia del urbano latino. Participación musical de diez millones, reparto del master y promoción acotada; no habilita el mercado de USA.'}
    ],
    collaborationFormats:[
      {id:'guest',name:'Invitado / formato original',feeFactor:1,shareFactor:1,reachFactor:1,promoChange:0,desc:'Conserva las condiciones del formato original.'},
      {id:'verse',name:'Verso o intervención',feeFactor:.85,shareFactor:.85,reachFactor:.85,promoChange:-1,desc:'Intervención breve: menor caché, reparto y recorrido promocional.'},
      {id:'hook',name:'Estribillo compartido',feeFactor:1.15,shareFactor:.95,reachFactor:1.05,promoChange:1,desc:'Voz o instrumento protagonista del estribillo.'},
      {id:'duet',name:'Dueto',feeFactor:1.45,shareFactor:1.35,reachFactor:1.2,promoChange:2,desc:'Participación sostenida en la obra y mayor reparto.'},
      {id:'production',name:'Producción invitada',feeFactor:.8,shareFactor:.8,reachFactor:.65,promoChange:-1,desc:'Aporte de producción con una campaña pública más pequeña.'},
      {id:'remix',name:'Remix en proyecto nuevo',feeFactor:1.1,shareFactor:1.1,reachFactor:1.1,promoChange:0,desc:'Nueva grabación en un sencillo o deluxe; no sustituye ni vende un master anterior.'}
    ],
    boostChannels:[{id:'feed',name:'Post de feed',feeFactor:1,reach:.3},{id:'story',name:'Historias',feeFactor:.65,reach:.18},{id:'video',name:'Video promocional',feeFactor:1.8,reach:.6}],
    campaigns: [{ id: 'ppv', name: 'PPV + deluxe · 24 semanas', budget: 200000, duration: 12, totalWeeks: 24, desc: 'Plan inspirado en la petición del chat: $200.000 en publicidad durante 12 semanas, deluxe al cerrar esa fase y 12 semanas más de recorrido. La activación es una decisión nueva.' }],
    markets: ['Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'Caribe', 'Brasil', 'Puerto Rico', 'República Dominicana','España','Francia','Reino Unido','Alemania','Japón','Corea del Sur','Sudáfrica','Australia'],
    balance: { status: 'provisional', note: 'Valores de diseño [PLACEHOLDER], sometidos a pruebas de integridad; pendientes de playtesting humano. Moneda de simulación: USD ficticios. La agenda horaria avanza sólo con el reloj en marcha.' }
  };

  const ACTION_ALIASES = { writing: 'write', recording: 'record', production: 'produce', rehearsal: 'rehearse', promo: 'social', networking: 'network', training: 'rehearse', youtube: 'video', work: 'dayjob' };
  const finite = (n, fallback = 0) => Number.isFinite(Number(n)) ? Number(n) : fallback;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, finite(n, min)));
  const money = n => Math.round(finite(n) * 100) / 100;
  const copy = value => JSON.parse(JSON.stringify(value));
  let cachedTaxes;
  function taxSystem(){return root.RapTaxes||(typeof require==='function'?(cachedTaxes||(cachedTaxes=require('./taxes.js'))):null);}
  function marketingSystem(){return root.RapMarketingCampaign||(typeof require==='function'?require('./marketing-campaign.js'):null);}
  function marketingSpendable(s,account='personal',artistId=null,excludeCampaignId=null){
    const base=account==='client'?Math.max(0,finite(s.management?.artists.find(a=>a.id===artistId)?.cash)):(taxSystem()?.spendable(s,account)??Math.max(0,finite(account==='label'?s.label?.cash:s.cash)));
    return money(Math.max(0,base-(marketingSystem()?.reserved(s,account,artistId,excludeCampaignId)||0)-(dailySystem()?.reserved(s,account,artistId,agendaExecuting.get(s))||0)));
  }
  function taxSpendable(s,account='personal'){return marketingSpendable(s,account);}
  function clientSpendable(s,a){return marketingSpendable(s,'client',typeof a==='string'?a:a?.id);}
  function taxSummary(s){const q=taxSystem()?.summary(s)||{blocked:true,accounts:[],bills:[],totalDebt:0};if(s.mediaCampaigns?.length)for(const a of q.accounts){a.marketingReserved=marketingSystem().reserved(s,a.id||a.account);a.spendable=marketingSpendable(s,a.id||a.account);}return q;}
  function taxWrite(s,account,label,amount,category){return account==='label'?labelLedger(s,label,amount,category):ledger(s,label,amount,category);}
  const find = (list, id) => list.find(x => x.id === id);
  const text = (value, fallback, max = 90) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
  function hashSeed(value) { let h = 2166136261; for (const char of String(value)) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
  function normalizedSeed(seed) { return Number.isFinite(seed) ? seed >>> 0 : typeof seed === 'string' && seed.length ? hashSeed(seed.slice(0, 200)) : 88421; }
  function countryById(id) { return typeof id === 'string' ? find(catalog.countries, id.trim().toUpperCase()) : null; }
  function rollOrigin(countryId = 'CO', seed = 88421) {
    const country = countryById(countryId);
    if (!country) return null;
    const fixedSeed = normalizedSeed(seed);
    // A separate hash stream makes preview read-only and independent of career RNG.
    const city = country.cities[hashSeed('origin:' + country.id + ':' + fixedSeed) % country.cities.length];
    return { countryId: country.id, countryName: country.name, marketId: country.marketId, cityId: city.id, cityName: city.name, origin: city.name + ', ' + country.name, scene: city.scene, livingMultiplier: city.livingMultiplier, seed: fixedSeed };
  }
  function knownOrigin(label) {
    if (typeof label !== 'string') return null;
    const normalized = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    for (const country of catalog.countries) for (const city of country.cities) {
      if (normalized(label) === normalized(city.name + ', ' + country.name)) return { countryId: country.id, countryName: country.name, marketId: country.marketId, cityId: city.id, cityName: city.name, origin: label, scene: city.scene, livingMultiplier: 1 };
    }
    return null;
  }
  const legacyHair = { fade: 'short', quiff: 'short', side: 'short', ponytail: 'bun', buzz: 'short' };
  const legacyHairValue = value => typeof value === 'string' && Object.prototype.hasOwnProperty.call(legacyHair, value) ? legacyHair[value] : null;
  const legacyOutfit = ['bomber', 'hoodie', 'jacket', 'tshirt', 'coat'];
  const hexColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
  function appearanceError(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return 'apariencia';
    for (const key of Object.keys(catalog.appearance.defaults)) {
      if (input[key] === undefined) continue;
      if (catalog.appearance.colorFields.includes(key) ? !hexColor(input[key]) : !catalog.appearance.enums[key].includes(input[key])) return key;
    }
    return null;
  }
  function cleanAppearance(input = {}, previous = {}) {
    const result = {};
    for (const [key, fallback] of Object.entries(catalog.appearance.defaults)) {
      const color = catalog.appearance.colorFields.includes(key);
      const candidate = input && input[key] !== undefined ? input[key] : previous[key];
      if (color) result[key] = hexColor(candidate) ? candidate.toLowerCase() : fallback;
      else result[key] = catalog.appearance.enums[key].includes(candidate) ? candidate : key === 'hair' && legacyHairValue(candidate) ? legacyHairValue(candidate) : fallback;
    }
    return result;
  }
  const wardrobeId = (field,value) => field + ':' + value;
  function wardrobeItem(field,value) { if(!Object.hasOwn(catalog.appearance.wardrobe,field))return null;const group=catalog.appearance.wardrobe[field];return Object.hasOwn(group,value)?group[value]:null; }
  function wardrobeOwned(s,field,value) { const item=wardrobeItem(field,value); return !item || item.price===0 || (Array.isArray(s.wardrobe?.owned) && s.wardrobe.owned.includes(wardrobeId(field,value))); }
  function random(s) { s.rng = ((s.rng >>> 0) * 1664525 + 1013904223) >>> 0; return s.rng / 4294967296; }
  function uid(s, prefix) { s.nextId = Math.max(1, Math.floor(finite(s.nextId, 1))); return prefix + '-' + s.nextId++; }
  function history(s, title, body, kind = 'info', details) {
    const row = { week: s.week, title, text: body, kind };
    if (details) row.details = copy(details);
    s.history.unshift(row);
    if (s.history.length > 520) s.history.length = 520;
  }
  function ledger(s, label, amount, category, taxDetails) {
    amount = money(amount);
    s.cash = money(s.cash + amount);
    s.ledger.push({ week: s.week, ...(s.calendar ? { day: s.calendar.day, date: s.calendar.date } : {}), label, amount, category });
    if (s.ledger.length > 5000) s.ledger.splice(0, s.ledger.length - 5000);
    if (s.activeWeek && s.activeWeek.report && category !== 'internal-transfer') {
      if (amount > 0) s.activeWeek.report.income = money(s.activeWeek.report.income + amount);
      if (amount < 0) s.activeWeek.report.expenses = money(s.activeWeek.report.expenses - amount);
    }
    if (s.stats) {
      if (amount > 0 && !['loan', 'sale', 'advance', 'internal-transfer'].includes(category)) s.stats.totalIncome = money(s.stats.totalIncome + amount);
      if (amount < 0 && !['investment', 'principal', 'internal-transfer'].includes(category)) s.stats.totalExpenses = money(s.stats.totalExpenses - amount);
    }
    taxSystem()?.record(s,'personal',amount,category,taxDetails);
    return amount;
  }
  function pay(s, label, amount, category = 'expense', taxDetails) {
    amount = money(Math.max(0, finite(amount)));
    if (amount === 0) return true;
    if (taxSpendable(s) + .001 < amount) return false;
    ledger(s, label, -amount, category,taxDetails); return true;
  }
  const usableTourAsset = s => s.assets.find(a => find(catalog.investments, a.catalogId)?.bonus === 'tour' && a.vehicleMode !== 'garaged'&&!enterpriseSystem()?.ownsAsset(s,a.id));
  const isVehicle = template => !!template&&(template.category==='vehículo'||template.id==='luxury_car');
  const hasAsset = (s, bonus) => bonus === 'tour' ? !!usableTourAsset(s) : s.assets.some(a => find(catalog.investments, a.catalogId)?.bonus === bonus&&!enterpriseSystem()?.ownsAsset(s,a.id));
  const hasTeam = (s, id) => s.team.some(t => t.id === id);
  const activeContracts = (s, type) => s.contracts.filter(c => c.status === 'active' && (!type || c.type === type));
  const totalDebt = s => money(s.loans.filter(l => l.status !== 'paid').reduce((n, l) => n + l.balance, 0));
  function assetValue(a) { return money(Math.max(0, finite(a.value, a.cost)) * finite(a.quantity, 1)); }
  function assetOperatingTerms(s,a) {
    const t=find(catalog.investments,a.catalogId),business=t?.category==='negocio',vehicle=isVehicle(t);
    const mode=business&&['cautious','growth','paused'].includes(a.operationMode)?a.operationMode:'standard';
    // A vehicle used for a show still pays the operating week's costs if put in the garage afterwards.
    const garaged=vehicle&&a.vehicleMode==='garaged'&&a.lastUsedWeek!==s.week;
    const saving=Number.isInteger(a.businessMaintenanceUntil)&&s.week<=a.businessMaintenanceUntil?clamp(finite(a.businessMaintenanceSaving),0,.25):0;
    return {mode,garaged,rentFactor:business?({cautious:.75,standard:1,growth:1.25,paused:0}[mode]):1,costFactor:(business?({cautious:.8,standard:1,growth:1.4,paused:.35}[mode]):garaged?.3:1)*(1-saving),riskFactor:business?({cautious:.75,standard:1,growth:1.4,paused:.4}[mode]):garaged?.35:1,depreciationFactor:garaged?.6:1};
  }
  function assetOperations(s,a) {
    const t=find(catalog.investments,a.catalogId); if(!t)return null;
    const terms=assetOperatingTerms(s,a),boost=Number.isInteger(a.businessBoostUntil)&&s.week<=a.businessBoostUntil?clamp(finite(a.businessBoostRate,1.2),1,1.5):1;
    let income=t.rent*a.quantity*terms.rentFactor*boost;
    if(s.activeWeek?.businessPromotionId===a.id)income*=1.15;
    if(t.id==='merch')income*=(.7+Math.min(2,s.player.fans/180000)*.3)*(1-(activeContracts(s).find(c=>Number.isFinite(c.merchShare)&&c.merchShare>0)?.merchShare||0));
    const maintenance=money(t.maintenance*a.quantity*terms.costFactor*(hasTeam(s,'accountant')?.92:1));
    return {mode:terms.mode,vehicleMode:a.vehicleMode||'active',garaged:terms.garaged,estimatedIncome:money(income),maintenance,estimatedNet:money(income-maintenance),weeklyDepreciationRate:finite(t.depreciation)*terms.depreciationFactor,lastOperation:a.lastOperation?copy(a.lastOperation):null,history:Array.isArray(a.operationHistory)?copy(a.operationHistory):[]};
  }
  function netWorth(s) {
    if (s.cash === null || s.financialHold) return null;
    const assets = s.assets.reduce((n, a) => n + assetValue(a) * a.liquidity, 0);
    // Nonrecourse recoup only restricts future royalties; it is not bank debt.
    const receivables = s.receivables.reduce((n, r) => n + (r.settled ? 0 : r.amount), 0);
    const labelEquity = soleLabelOwner(s) ? finite(s.label.cash) + finite(s.label.stats?.revenuePending) : 0;
    const taxDebt=(taxSystem()?.liability(s,'personal')||0)+(soleLabelOwner(s)?taxSystem()?.liability(s,'label')||0:0);
    return money(s.cash + assets + receivables + labelEquity + (enterpriseSystem()?.inventoryValue(s)||0) - totalDebt(s)-taxDebt);
  }
  function netWorthBreakdown(s) {
    if (!s || s.cash === null || s.financialHold) return null;
    const assets=s.assets.map(a=>{const book=assetValue(a),liquidation=money(book*a.liquidity),basis=money(finite(a.costBasis)),template=find(catalog.investments,a.catalogId),operation=assetOperations(s,a);return{id:a.id,name:a.name,category:a.category,quantity:a.quantity,costBasis:basis,bookValue:book,valueChange:money(book-basis),liquidation,liquidityDiscount:money(book-liquidation),weeklyDepreciationRate:operation?.weeklyDepreciationRate??finite(template?.depreciation),baseWeeklyDepreciationRate:finite(template?.depreciation),weeklyMaintenance:operation?.maintenance??money(a.maintenance*a.quantity),baseWeeklyMaintenance:money(a.maintenance*a.quantity),acquiredWeek:a.acquiredWeek};});
    const book=money(s.assets.reduce((n,a)=>n+assetValue(a),0)),rawLiquidation=s.assets.reduce((n,a)=>n+assetValue(a)*a.liquidity,0);
    const receivables=money(s.receivables.reduce((n,r)=>n+(r.settled?0:r.amount),0));
    const labelEquity=soleLabelOwner(s)?money(finite(s.label.cash)+finite(s.label.stats?.revenuePending)):0;
    const debt=totalDebt(s),recoup=money(s.contracts.reduce((n,c)=>n+(c.status==='active'?finite(c.recoupBalance):0),0));
    const labelRecoup=money((s.label?.contracts||[]).reduce((n,c)=>n+(c.status==='active'?finite(c.recoupBalance):0),0));
    const taxDebt=money((taxSystem()?.liability(s,'personal')||0)+(soleLabelOwner(s)?taxSystem()?.liability(s,'label')||0:0));
    return {cash:s.cash,enterpriseInventory:enterpriseSystem()?.inventoryValue(s)||0,enterpriseInventoryBook:enterpriseSystem()?.inventoryBookValue(s)||0,bookAssets:book,liquidAssets:money(rawLiquidation),liquidityDiscount:money(book-rawLiquidation),receivables,labelEquity,debt,taxDebt,taxReserve:taxSummary(s).totalReserved||0,recoup,labelRecoup,netWorth:netWorth(s),assets};
  }
  function xp(s, amount) {
    s.player.xp += amount * actionFactor(s);
    while (s.player.xp >= 45) { s.player.xp -= 45; s.player.skillPoints++; }
  }
  function skillGain(s, name, n) { s.player.skills[name] = money(clamp(s.player.skills[name] + n * actionFactor(s) * Math.max(.12, 1 - s.player.skills[name] / 110), 0, 100)); }
  function fanGain(s, n) {
    const cap = s.progression && s.progression.usaUnlocked ? 100000000 : 45000000;
    n = finite(n) * actionFactor(s);
    if (n > 0) n *= Math.max(0, 1 - s.player.fans / cap);
    s.player.fans = Math.round(clamp(s.player.fans + n, 0, cap));
  }
  function offer(s, templateId, initial = false) {
    const template = find(catalog.deals, templateId);
    if (!template || activeContracts(s, template.type).length || s.offers.some(o => o.type === template.type && o.status === 'open')) return null;
    const o = { ...copy(template), id: uid(s, 'offer'), templateId: template.id, status: 'open', offeredWeek: s.week, expiresWeek: s.week + 4, negotiated: false, provisional: initial };
    s.offers.push(o); return o;
  }
  // Representation is a separate business: client funds never become the player's cash.
  const careerRoles = ['artist','manager','both'];
  const managedReleaseLimit = 2000;
  const managementActivities = {record:{energy:18,cost:200},promote:{energy:14,cost:120},release:{energy:12,cost:150},show:{energy:24,cost:0}};
  const ownMusicActions = ['write','home_record','record','produce','release','rehearse','collab','fanclub','band_audition','band_rehearsal'];
  const managedTemplates = [
    {id:'mar-sur',name:'Mar Sur',style:'Rap alternativo',fans:480,quality:43,cash:2400,hair:'braids',accent:'#e57851'},
    {id:'leo-ruido',name:'Leo Ruido',style:'Rock independiente',fans:620,quality:45,cash:2700,hair:'long',accent:'#b497d6'},
    {id:'alma-dub',name:'Alma Dub',style:'Reggae',fans:350,quality:46,cash:2200,hair:'afro',accent:'#fce762'},
    {id:'iris-pop',name:'Iris Prisma',style:'Pop',fans:800,quality:42,cash:3000,hair:'bun',accent:'#aaffe5'},
    {id:'bruno-metal',name:'Bruno Hierro',style:'Metal',fans:550,quality:47,cash:2500,hair:'long',accent:'#fb8b24'},
    {id:'nube-rima',name:'Nube Rima',style:'Hip hop',fans:400,quality:44,cash:2300,hair:'curls',accent:'#ce6a85'},
    {id:'sol-azul',name:'Sol Azul',style:'Pop alternativo',tier:'local',fans:12000,fame:12,reputation:28,quality:58,cash:18000,hair:'curls',accent:'#f3b56b',developmentScale:3,managementFee:2500,minAdvance:4000,minBudget:6000,desc:'Circuito local consolidado. Busca un plan financiado, sin vender sus grabaciones anteriores.'},
    {id:'cobre-norte',name:'Cobre Norte',style:'Rock independiente',tier:'regional',fans:90000,fame:28,reputation:42,quality:68,cash:80000,hair:'long',accent:'#b56f43',developmentScale:12,managementFee:18000,minAdvance:25000,minBudget:40000,desc:'Gira regional y público propio. Producción y promoción requieren un presupuesto acorde.'},
    {id:'jade-riddim',name:'Jade Riddim',style:'Reggae',tier:'regional',fans:180000,fame:36,reputation:48,quality:70,cash:135000,hair:'dreads',accent:'#95b874',developmentScale:20,managementFee:40000,minAdvance:65000,minBudget:85000,desc:'Escena de reggae regional. Su comunidad pertenece al artista, no al propietario del sello.'},
    {id:'vera-nova',name:'Vera Nova',style:'Pop',tier:'nacional',fans:450000,fame:52,reputation:62,quality:76,cash:320000,hair:'bun',accent:'#d890b6',developmentScale:40,managementFee:90000,minAdvance:180000,minBudget:220000,desc:'Artista nacional que exige anticipo, recursos de producción y una licencia temporal proporcionada.'},
    {id:'delta-negro',name:'Delta Negro',style:'Hip hop',tier:'nacional',fans:900000,fame:61,reputation:66,quality:80,cash:600000,hair:'braids',accent:'#c8af71',developmentScale:70,managementFee:180000,minAdvance:350000,minBudget:400000,desc:'Público nacional amplio. Capital suficiente abre la negociación, no garantiza beneficio.'},
    {id:'acero-artico',name:'Acero Ártico',style:'Metal',tier:'nacional',fans:1200000,fame:66,reputation:72,quality:82,cash:850000,hair:'long',accent:'#99b8bd',developmentScale:90,managementFee:240000,minAdvance:500000,minBudget:650000,desc:'Proyecto de metal con demanda nacional y un equipo de producción costoso.'},
    {id:'luna-cobalto',name:'Luna Cobalto',style:'Pop',tier:'estrella',fans:2400000,fame:76,reputation:78,quality:85,cash:1400000,hair:'long',accent:'#8c91ce',developmentScale:140,managementFee:500000,minAdvance:900000,minBudget:1100000,desc:'Figura LATAM: negocia porcentaje, plazo, anticipo y desarrollo por separado.'},
    {id:'fuego-sur',name:'Fuego Sur',style:'Rock',tier:'estrella',fans:5000000,fame:84,reputation:85,quality:88,cash:2800000,hair:'long',accent:'#e18154',developmentScale:240,managementFee:950000,minAdvance:2000000,minBudget:2500000,desc:'Banda de gran convocatoria regional. Firmar su próxima etapa no compra sus masters previos.'},
    {id:'reina-ambar',name:'Reina Ámbar',style:'Hip hop',tier:'estrella',fans:8000000,fame:91,reputation:89,quality:91,cash:4200000,hair:'braids',accent:'#d6ae57',developmentScale:360,managementFee:1500000,minAdvance:3500000,minBudget:4000000,desc:'Una de las figuras del universo LATAM. Una licencia exige capital y términos aceptables, no fama del fundador.'}
  ];
  const managedRosterLimit=6;
  function managedTemplate(a){return find(managedTemplates,a?.templateId||a?.id);}
  function managedSpendable(s,account='personal'){return typeof taxSpendable==='function'?taxSpendable(s,account):Math.max(0,account==='label'?finite(s.label?.cash):finite(s.cash));}
  function managedCommissionCeiling(s,t){return Math.min(t?.tier==='estrella'?.15:t?.tier==='nacional'?.18:.25,.15+Math.max(0,finite(s.player.reputation)-25)/500);}
  function managedScale(a){return finite(a?.developmentScale,1);}
  function makeManagedArtist(s,t){return{id:uid(s,'managed-artist'),templateId:t.id,name:t.name,style:t.style,appearance:cleanAppearance({hair:t.hair,accent:t.accent}),marketId:s.career.marketId,fans:t.fans,fame:finite(t.fame,1),reputation:finite(t.reputation,12),quality:t.quality,cash:t.cash,...(t.developmentScale?{developmentScale:t.developmentScale}:{}),projects:[],releases:[],receivables:[],stats:{gross:0,distribution:0,artistNet:0,managementEarned:0,labelEarned:0,costs:0,streams:0,units:0,shows:0,tickets:0,settled:0},history:[]};}
  function genreId(style) {const g=String(style||'').toLowerCase();return /metal/.test(g)?'metal':/reggae|dancehall|ska/.test(g)?'reggae':/rock|punk/.test(g)?'rock':/pop|r&b|soul/.test(g)?'pop':'hiphop';}
  function validVisualStyle(genre,id) {return typeof id==='string' && (root.RapThemes ? root.RapThemes.list(genre).some(t=>t.id===id) : ({hiphop:['hiphop-asfalto','hiphop-bloque','hiphop-casete'],rock:['rock-carretera','rock-nocturno','rock-garaje'],reggae:['reggae-dub','reggae-patio','reggae-selva'],pop:['pop-prisma','pop-terciopelo','pop-dorado'],metal:['metal-oxido','metal-acero','metal-ritual']}[genre]||[]).includes(id));}
  function defaultVisualStyle(genre) {return ({hiphop:'hiphop-asfalto',rock:'rock-carretera',reggae:'reggae-dub',pop:'pop-prisma',metal:'metal-oxido'})[genre]||'hiphop-asfalto';}
  function ensureManagement(s, role='artist') {
    if(s.management===undefined)s.management={version:1,role:careerRoles.includes(role)?role:'artist',rng:((s.rng^0x6d2b79f5)>>>0)||1,trackedFromDay:s.calendar.day,artists:[],countriesPlayed:[],history:[]};
    if(s.label&&s.label.cash===undefined){s.label.cash=0;s.label.trackedFromDay=s.calendar.day;s.label.legacy=s.calendar.day>0;s.label.contracts=[];s.label.receivables=[];s.label.ledger=[];s.label.stats={revenueAccrued:0,revenueSettled:0,revenuePending:0,expenses:0,transfersIn:0,transfersOut:0,advancesPaid:0,recouped:0};}
    ensureManagementTracking(s);
    return s.management;
  }
  function managementRandom(s){const m=s.management;m.rng=(Math.imul(m.rng,1664525)+1013904223)>>>0;return m.rng/4294967296;}
  function compactManagedProjects(s){
    for(const a of s.management?.artists||[])if(Array.isArray(a?.projects)&&a.projects.length>5){
      const active=a.projects.filter(p=>!p||p.status!=='released'),slots=Math.max(0,5-active.length);
      a.projects=active.concat(slots?a.projects.filter(p=>p?.status==='released').slice(-slots):[]);
    }
  }
  function representationActive(s,a){return a?.contract?.status==='active'&&s.week<a.contract.endsWeek;}
  function managedActive(s,a){return representationActive(s,a)||!!labelContract(s,a?.id);}
  function canManage(s){return ['manager','both'].includes(s.management?.role);}
  function soleLabelOwner(s){return !!s.label&&s.label.owners.length===1&&Math.abs(s.label.owners[0].share-1)<.00001;}
  function labelContract(s,artistId){return s.label?.contracts?.find(c=>c.artistId===artistId&&c.status==='active'&&s.week<c.endsWeek)||null;}
  function labelTerms(s,artistId){const c=labelContract(s,artistId);return c?{contractId:c.id,labelId:s.label.id,labelName:s.label.name,artistId,share:c.share,startedWeek:c.startedWeek,endsWeek:c.endsWeek,mastersRetained:true}:null;}
  const managementSeriesKeys=['units','streams','salesRevenue','streamRevenue','grossRevenue','distribution','artistAccrued','commissionAccrued','labelAccrued','clientExpenses','advertising','promotion','coordinationExpenses','artistSettled','commissionSettled','labelSettled','showGross','showCommission','advanceReceived','featureRevenue','featureFees','boostFees','developmentReceived'];
  const managementMusicKeys=new Set(['units','streams','salesRevenue','streamRevenue','grossRevenue','distribution','artistAccrued','commissionAccrued','labelAccrued','featureRevenue']);
  const managementTrackingBytes=192*1024;
  function ensureManagementTracking(s,a,newClient=false){
    if(!s.management)return;
    if(s.management.dashboard===undefined)s.management.dashboard={version:1,startedDay:s.calendar.day,charts:null};
    const clients=a?[a]:(s.management.artists||[]);
    for(const client of clients)if(client){
      if(client.dashboard===undefined)client.dashboard={version:1,startedDay:s.calendar.day,financeFromDay:s.calendar.day+(newClient?0:1),legacy:!newClient,totals:managementSeriesKeys.map(()=>0),days:[]};
      // The first 19 column positions stay fixed. Older reports contain no new
      // guest/post flows, so only the exact original width gains trailing zeros.
      const d=client.dashboard;if(d&&Array.isArray(d.totals)&&d.totals.length===19)d.totals.push(0,0,0,0);
      if(d&&Array.isArray(d.totals)&&d.totals.length===22)d.totals.push(0);
      if(Array.isArray(d?.days))for(const row of d.days)if(Array.isArray(row)&&row.length===21)row.push(0,0,0,0);else if(Array.isArray(row)&&row.length===24)row.push(0);
    }
  }
  function managementRecord(s,a,values={},closed=false){
    ensureManagementTracking(s,a);
    const tracking=a.dashboard;let row=tracking.days.at(-1);
    if(!row||row[0]!==s.calendar.day){row=[s.calendar.day,0,...managementSeriesKeys.map(()=>0)];tracking.days.push(row);}
    for(const [key,value] of Object.entries(values)){const i=managementSeriesKeys.indexOf(key);if(i<0)continue;const amount=money(value);row[i+2]=money(row[i+2]+amount);tracking.totals[i]=money(tracking.totals[i]+amount);}
    if(closed)row[1]=1;
    if(tracking.days.length>90)tracking.days.splice(0,tracking.days.length-90);
  }
  function managedReceiptArtist(s,receipt){
    const artists=s.management?.artists||[];
    if(receipt.managedArtistId)return artists.find(a=>a.id===receipt.managedArtistId)||null;
    // Older receipts have an explicit source label. Use it only when its payee is
    // unambiguous; never allocate an unknown receipt across artists by guesswork.
    const candidates=artists.filter(a=>receipt.source==='Comisión musical · '+a.name);
    return candidates.length===1?candidates[0]:null;
  }
  function recordManagedWork(s,r,streams){
    if(r.dashboardWeeks===undefined)r.dashboardWeeks=[];
    let row=r.dashboardWeeks.at(-1);
    if(!row||row[0]!==s.week){row=[s.week,0,0];r.dashboardWeeks.push(row);}
    row[1]+=streams;row[2]++;
    if(r.dashboardWeeks.length>2)r.dashboardWeeks.shift();
  }
  function managementTrackingSize(s){
    const m=s.management;if(!m)return 0;
    return JSON.stringify({dashboard:m.dashboard,artists:m.artists.map(a=>({id:a.id,dashboard:a.dashboard,works:a.releases.filter(r=>r.dashboardWeeks).map(r=>[r.id,r.dashboardWeeks])}))}).length*2;
  }
  function pruneManagementChartBook(book){
    if(!book)return;
    const referenced=new Set(book.snapshots.flatMap(snap=>['artists','singles','albums'].flatMap(type=>snap[type].map(row=>row[0]))));
    for(const id of Object.keys(book.dictionary))if(!referenced.has(id))delete book.dictionary[id];
    const workRecords=Object.keys(book.records).filter(id=>!id.startsWith('m:a:')).sort((a,b)=>book.records[b][2]-book.records[a][2]);
    for(const id of workRecords.slice(96))delete book.records[id];
  }
  function compactManagementTracking(s){
    if(!s.management?.dashboard)return;
    const artists=s.management.artists,book=s.management.dashboard.charts;
    for(const a of artists)for(const r of a.releases)if(Array.isArray(r.dashboardWeeks)&&!r.dashboardWeeks.length)delete r.dashboardWeeks;
    if(book){while(book.snapshots.length>4)book.snapshots.shift();pruneManagementChartBook(book);}
    let bytes=managementTrackingSize(s);
    if(bytes<=managementTrackingBytes)return;
    const works=artists.flatMap(a=>a.releases);
    // Valid saved works have at most two ordered samples. Keep the old path
    // for unusual imported shapes so validation/recovery behaviour is unchanged.
    const fast=artists.every(a=>Array.isArray(a.dashboard?.days)&&a.dashboard.days.every(Array.isArray))&&new Set(works).size===works.length&&works.every(r=>r.dashboardWeeks===undefined||Array.isArray(r.dashboardWeeks)&&r.dashboardWeeks.length<=2&&Number.isFinite(r.releasedWeek)&&r.dashboardWeeks.every(row=>Array.isArray(row)&&Number.isFinite(row[0])));
    const older=fast?works.filter(r=>r.dashboardWeeks?.length>1).sort((a,b)=>a.dashboardWeeks[0][0]-b.dashboardWeeks[0][0]):[];
    const last=fast?works.filter(r=>r.dashboardWeeks?.length).sort((a,b)=>a.releasedWeek-b.releasedWeek):[];
    const owners=new Map(),counts=new Map();
    if(fast)for(const a of artists){counts.set(a,a.releases.filter(r=>r.dashboardWeeks).length);for(const r of a.releases)owners.set(r,a);}
    let olderIndex=0,lastIndex=0;
    while(bytes>managementTrackingBytes){
      const oldest=artists.filter(a=>a.dashboard?.days.length>7).sort((a,b)=>a.dashboard.days[0][0]-b.dashboard.days[0][0])[0];
      if(oldest){
        if(fast)bytes-=(JSON.stringify(oldest.dashboard.days[0]).length+1)*2;
        oldest.dashboard.days.shift();
      }else if(book?.snapshots.length>1){
        book.snapshots.shift();pruneManagementChartBook(book);bytes=managementTrackingSize(s);
      }else{
        const work=fast?older[olderIndex++]:works.filter(r=>r.dashboardWeeks?.length>1).sort((a,b)=>a.dashboardWeeks[0][0]-b.dashboardWeeks[0][0])[0];
        if(work){
          if(fast)bytes-=(JSON.stringify(work.dashboardWeeks[0]).length+1)*2;
          work.dashboardWeeks.shift();
        }else{
          const oldestWork=fast?last[lastIndex++]:works.filter(r=>r.dashboardWeeks?.length).sort((a,b)=>a.releasedWeek-b.releasedWeek)[0];
          if(!oldestWork)break;
          if(fast){
            const owner=owners.get(oldestWork),count=counts.get(owner);
            // Size uses UTF-16 JSON length. Removing the final entry has no comma.
            bytes-=(JSON.stringify([oldestWork.id,oldestWork.dashboardWeeks]).length+(count>1?1:0))*2;
            counts.set(owner,count-1);
          }
          delete oldestWork.dashboardWeeks;
        }
      }
      if(!fast)bytes=managementTrackingSize(s);
    }
  }
  function managementCompletedStreams(a,start,end){
    const rows=(a.dashboard?.days||[]).filter(row=>row[0]>=start&&row[0]<end&&row[1]===1);
    return rows.length===end-start&&new Set(rows.map(row=>row[0])).size===end-start?rows.reduce((n,row)=>n+row[managementSeriesKeys.indexOf('streams')+2],0):null;
  }
  function captureManagementCharts(s,week){
    if(!s.management?.artists.length)return{captured:false,reason:'no_roster'};
    if(!Number.isInteger(week)||week<1||s.week!==week+1||s.calendar.day!==week*7||s.world?.lastCompletedWeek!==week)return{captured:false,reason:'incomplete_close'};
    ensureManagementTracking(s);
    const previous=s.management.dashboard.charts;
    if(previous?.snapshots.some(row=>row.week>=week))return{captured:false,reason:'already_observed'};
    const start=(week-1)*7,end=week*7,types=['artists','singles','albums'],rankings={artists:[],singles:[],albums:[]},missing={artists:0,works:0};
    for(const a of s.world.artists||[]){
      const observation=a.history?.find(h=>h.week===week);if(!observation){missing.artists++;continue;}
      const budget=Math.max(0,Math.round(observation.dailyStreams*7));
      rankings.artists.push({id:'n:a:'+a.id,artistId:a.id,title:a.name,byline:a.market,format:a.genre,streams:budget,managed:false});
      const works=(a.releases||[]).filter(r=>r.week<=week),raw=works.map(r=>Math.max(0,Math.round(r.dailyStreams*7))),sum=raw.reduce((n,x)=>n+x,0),exact=sum>budget?raw.map(n=>n*budget/sum):raw,parts=exact.map(Math.floor);
      if(sum>budget){const remainder=budget-parts.reduce((n,x)=>n+x,0),order=exact.map((n,i)=>({i,f:n-parts[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);for(let i=0;i<remainder;i++)parts[order[i].i]++;}
      works.forEach((r,i)=>rankings[r.type==='single'?'singles':'albums'].push({id:'n:r:'+r.id,artistId:a.id,releaseId:r.id,title:r.title,byline:a.name,format:r.type,streams:parts[i],managed:false}));
    }
    for(const a of s.management.artists){
      const streams=managementCompletedStreams(a,start,end);
      if(streams===null)missing.artists++;else rankings.artists.push({id:'m:a:'+a.id,artistId:a.id,title:a.name,byline:a.marketId,format:a.style,streams,managed:true});
      for(const r of a.releases){
        if(r.releasedDay>=end)continue;
        const sample=r.dashboardWeeks?.find(row=>row[0]===week),expected=end-Math.max(start,r.releasedDay);
        if(!sample||sample[2]!==expected){missing.works++;continue;}
        rankings[r.type==='single'?'singles':'albums'].push({id:'m:r:'+r.id,artistId:a.id,releaseId:r.id,title:r.name,byline:a.name,format:r.type,streams:sample[1],managed:true});
      }
    }
    const book=previous||{version:1,startedWeek:week,snapshots:[],dictionary:{},records:{}},snap={week,missing};
    for(const type of types){
      const ranked=rankings[type].sort((a,b)=>b.streams-a.streams||a.id.localeCompare(b.id));ranked.forEach((row,index)=>row.rank=index+1);
      const retained=type==='artists'?ranked:ranked.filter(row=>row.rank<=20||row.managed&&!ranked.some(other=>other.managed&&other.artistId===row.artistId&&other.rank<row.rank));
      snap[type]=retained.map(row=>{const prev=book.records[row.id],change=prev&&prev[2]===week-1?prev[3]-row.rank:null,record=[prev?Math.min(prev[0],row.rank):row.rank,(prev?.[1]||0)+1,week,row.rank,prev?.[4]||week];book.records[row.id]=record;book.dictionary[row.id]=[row.title,row.byline,row.format,row.artistId,row.releaseId||null,row.managed?1:0];return[row.id,row.rank,row.streams,change,record[0],record[1],record[4]];});
    }
    book.snapshots.push(snap);s.management.dashboard.charts=book;compactManagementTracking(s);
    return{captured:true,week,missing,bytes:managementTrackingSize(s)};
  }
  function managementDashboard(s,options={}){
    const m=s.management||{artists:[]},artistId=options.artistId||'all',range=[7,28,90].includes(Number(options.range))?Number(options.range):28;
    const selected=m.artists.filter(a=>artistId==='all'?managedActive(s,a):a.id===artistId),ids=new Set(selected.map(a=>a.id)),from=Math.max(0,s.calendar.day-range),through=s.calendar.day-1;
    const clientPending=a=>money(a.receivables.reduce((n,r)=>n+r.amount,0));
    const artistView=a=>({id:a.id,name:a.name,style:a.style,appearance:copy(a.appearance),active:managedActive(s,a),cash:a.cash,pending:clientPending(a),contract:copy(a.contract),project:copy(a.projects.find(p=>['working','ready'].includes(p.status))||null),stats:copy(a.stats)});
    const availableArtists=m.artists.map(artistView),selectedArtists=availableArtists.filter(a=>ids.has(a.id)),indexes=new Map(selected.map(a=>[a.id,new Map((a.dashboard?.days||[]).map(row=>[row[0],row]))]));
    const makeRow=(day,current=false)=>{
      const observed=selected.length>0&&selected.every(a=>a.dashboard&&day>=a.dashboard.startedDay),musicKnown=!current&&observed&&selected.every(a=>indexes.get(a.id).get(day)?.[1]===1),financeKnown=musicKnown&&selected.every(a=>day>=a.dashboard.financeFromDay);
      const row={day,date:calendarDate(s.calendar.epoch,day),week:Math.floor(day/7)+1,closed:!current,partial:current,known:current?observed:musicKnown&&financeKnown,musicKnown,financeKnown};
      for(let i=0;i<managementSeriesKeys.length;i++){const key=managementSeriesKeys[i],known=current?observed:managementMusicKeys.has(key)?musicKnown:financeKnown;row[key]=known?money(selected.reduce((n,a)=>n+(indexes.get(a.id).get(day)?.[i+2]||0),0)):null;}
      row.clientCashChange=row.financeKnown||current&&observed?money(row.artistSettled+row.showGross+row.advanceReceived+row.featureFees+row.boostFees+row.developmentReceived-row.clientExpenses):null;
      return row;
    };
    const rows=[];for(let day=from;day<=through;day++)rows.push(makeRow(day));
    const totals=Object.fromEntries([...managementSeriesKeys,'clientCashChange'].map(key=>{const known=rows.filter(row=>row[key]!==null);return[key,known.length?money(known.reduce((n,row)=>n+row[key],0)):null];}));
    const pendingPersonal=s.receivables.filter(r=>!r.settled),pendingLabel=(s.label?.receivables||[]).filter(r=>!r.settled),selectedCommissions=pendingPersonal.filter(r=>ids.has(managedReceiptArtist(s,r)?.id)),selectedLabel=pendingLabel.filter(r=>ids.has(s.label?.contracts.find(c=>c.id===r.contractId)?.artistId));
    const accounts={personalCash:s.cash,labelCash:finite(s.label?.cash),personalPending:money(pendingPersonal.reduce((n,r)=>n+r.amount,0)),labelPending:money(pendingLabel.reduce((n,r)=>n+r.amount,0)),clientCash:money(selected.reduce((n,a)=>n+a.cash,0)),clientPending:money(selected.reduce((n,a)=>n+clientPending(a),0)),commissionPending:money(selectedCommissions.reduce((n,r)=>n+r.amount,0)),selectedLabelPending:money(selectedLabel.reduce((n,r)=>n+r.amount,0))};
    const works=selected.flatMap(a=>a.releases),sumWorks=key=>money(works.reduce((n,r)=>n+finite(r[key]),0));
    const guestWorks=(s.features||[]).filter(f=>ids.has(f.managedArtistId)),guestTotal=key=>guestWorks.reduce((n,f)=>n+finite(f[key]),0);
    const lifetime={units:sumWorks('totalUnits'),streams:sumWorks('totalStreams'),grossRevenue:money(sumWorks('gross')+guestTotal('artistEarned')),distribution:sumWorks('distribution'),artistAccrued:money(sumWorks('artistNet')+guestTotal('guestNet')),commissionAccrued:sumWorks('managementEarned'),labelAccrued:money(sumWorks('labelEarned')+guestTotal('guestLabelEarned')),featureFees:money(selected.reduce((n,a)=>n+finite(a.stats.featureFees),0)),boostFees:money(selected.reduce((n,a)=>n+finite(a.stats.boostFees),0)),developmentReceived:money(selected.reduce((n,a)=>n+finite(a.stats.developmentReceived),0)),clientExpenses:money(selected.reduce((n,a)=>n+a.stats.costs+a.stats.managementEarned,0)-sumWorks('managementEarned')),trackedTotals:Object.fromEntries(managementSeriesKeys.map((key,i)=>[key,money(selected.reduce((n,a)=>n+(a.dashboard?.totals[i]||0),0))]))};
    const book=m.dashboard?.charts,snap=book?.snapshots.at(-1),chartRows=type=>(snap?.[type]||[]).map(row=>{const d=book.dictionary[row[0]];return{id:row[0],artistId:d[3],releaseId:d[4],title:d[0],byline:d[1],format:d[2],managed:!!d[5],selected:ids.has(d[3]),rank:row[1],streams:row[2],change:row[3],peak:row[4],observedWeeks:row[5],firstObservedWeek:row[6]};});
    const charts={week:snap?.week??null,available:!!snap,artists:chartRows('artists'),singles:chartRows('singles'),albums:chartRows('albums'),missing:copy(snap?.missing||{artists:0,works:0}),method:'Clientes: suma exacta de días observados del mismo cierre. Rivales: demanda diaria al cierre × 7; obras ajustadas al presupuesto de su artista. Universo ficticio, no listas reales. Artistas completos; obras Top20 y mejor posición real por cliente. Pico y cambios solo desde observaciones registradas.'};
    const musicDays=rows.filter(row=>row.musicKnown).length,financeDays=rows.filter(row=>row.financeKnown).length;
    return{artistId,range,selectedArtists,availableArtists,accounts,rows,current:makeRow(s.calendar.day,true),totals,lifetime,coverage:{requestedDays:range,availableDays:rows.length,musicDays,financeDays,musicComplete:rows.length>0&&musicDays===rows.length,financeComplete:rows.length>0&&financeDays===rows.length,fromDay:rows[0]?.day??null,throughDay:rows.at(-1)?.day??null,trackedFromDay:selected.length?Math.max(...selected.map(a=>a.dashboard?.startedDay??s.calendar.day)):null,legacy:selected.some(a=>a.dashboard?.legacy!==false),retentionDays:90,byteBudget:managementTrackingBytes},charts,note:'Ventas y regalías corresponden a los clientes seleccionados; su caja no es tuya. Caja personal y sello siempre muestran las cuentas completas. Gastos del cliente incluyen producción, promoción, operación y comisión de show; esta última se muestra también como desglose, sin sumarla otra vez. Promoción y publicidad desglosan las sesiones y los anuncios pagados con la caja del cliente; ya están incluidos en sus gastos y no se suman otra vez. Las campañas pagadas por el sello o por la caja personal se muestran en esas cuentas. Devengos no son cobros. Hoy muestra solo movimientos registrados hasta ahora. Las curvas no reconstruyen el pasado; un hueco indica cobertura incompleta.'};
  }

  function validateManagementTracking(s){
    const m=s.management,errors=[],bad=message=>errors.push(message),amounts=values=>Array.isArray(values)&&values.length===managementSeriesKeys.length&&values.every(n=>Number.isFinite(n)&&n>=0),get=(values,key)=>values[managementSeriesKeys.indexOf(key)];
    if(!m)return errors;
    const checkValues=values=>{if(!amounts(values))return false;return Number.isSafeInteger(get(values,'units'))&&Number.isSafeInteger(get(values,'streams'))&&Math.abs(get(values,'grossRevenue')-get(values,'salesRevenue')-get(values,'streamRevenue')-get(values,'featureRevenue'))<.051&&Math.abs(get(values,'grossRevenue')-get(values,'distribution')-get(values,'artistAccrued')-get(values,'commissionAccrued')-get(values,'labelAccrued'))<.051&&get(values,'promotion')<=get(values,'clientExpenses')+.01&&get(values,'showCommission')<=get(values,'clientExpenses')+.01;};
    if(m.dashboard!==undefined&&(!m.dashboard||m.dashboard.version!==1||!Number.isInteger(m.dashboard.startedDay)||m.dashboard.startedDay<0||m.dashboard.startedDay>s.calendar.day))bad('Seguimiento diario del roster inválido.');
    for(const a of m.artists){
      if(a.dashboard!==undefined){const d=a.dashboard;
        if(!d||d.version!==1||!Number.isInteger(d.startedDay)||d.startedDay<0||d.startedDay>s.calendar.day||!Number.isInteger(d.financeFromDay)||d.financeFromDay<d.startedDay||d.financeFromDay>d.startedDay+1||typeof d.legacy!=='boolean'||!checkValues(d.totals)||!Array.isArray(d.days)||d.days.length>90){bad('Historial diario del cliente inválido.');continue;}
        for(let i=0;i<d.days.length;i++){const row=d.days[i];if(!Array.isArray(row)||row.length!==managementSeriesKeys.length+2||!Number.isInteger(row[0])||row[0]<d.startedDay||row[0]>s.calendar.day||![0,1].includes(row[1])||row[0]<s.calendar.day&&row[1]!==1||row[0]===s.calendar.day&&row[1]!==0||i>0&&row[0]<=d.days[i-1][0]||!checkValues(row.slice(2)))bad('Fila diaria del roster inválida.');}
        for(let i=0;i<managementSeriesKeys.length;i++)if(d.days.reduce((n,row)=>n+finite(row?.[i+2]),0)>d.totals[i]+.051)bad('Acumulados del roster menores que su historial retenido.');
      }
      for(const r of a.releases)if(r.dashboardWeeks!==undefined){if(!Array.isArray(r.dashboardWeeks)||r.dashboardWeeks.length>2)bad('Cierres de obra del cliente inválidos.');else for(let i=0;i<r.dashboardWeeks.length;i++){const row=r.dashboardWeeks[i];if(!Array.isArray(row)||row.length!==3||!Number.isInteger(row[0])||row[0]<r.releasedWeek||row[0]>s.week||!Number.isSafeInteger(row[1])||row[1]<0||!Number.isInteger(row[2])||row[2]<1||row[2]>7||i>0&&row[0]<=r.dashboardWeeks[i-1][0])bad('Observación semanal de obra inválida.');}}
    }
    const book=m.dashboard?.charts;
    if(book!==undefined&&book!==null){
      if(!book||book.version!==1||!Number.isInteger(book.startedWeek)||book.startedWeek<1||!Array.isArray(book.snapshots)||book.snapshots.length>4||!book.dictionary||typeof book.dictionary!=='object'||Array.isArray(book.dictionary)||!book.records||typeof book.records!=='object'||Array.isArray(book.records))bad('Archivo de charts del roster inválido.');
      else{
        for(let i=0;i<book.snapshots.length;i++){const snap=book.snapshots[i];if(!snap||!Number.isInteger(snap.week)||snap.week<book.startedWeek||snap.week>=s.week||i>0&&snap.week<=book.snapshots[i-1].week||!snap.missing||!Number.isInteger(snap.missing.artists)||snap.missing.artists<0||!Number.isInteger(snap.missing.works)||snap.missing.works<0){bad('Cierre de chart del roster inválido.');continue;}
          for(const type of ['artists','singles','albums']){const rows=snap[type];if(!Array.isArray(rows)){bad('Lista de chart del roster inválida.');continue;}const seen=new Set();for(const row of rows){const d=book.dictionary[row?.[0]];if(!Array.isArray(row)||row.length!==7||typeof row[0]!=='string'||seen.has(row[0])||!Array.isArray(d)||d.length!==6||d.slice(0,4).some(x=>typeof x!=='string')||!Number.isInteger(row[1])||row[1]<1||!Number.isSafeInteger(row[2])||row[2]<0||row[3]!==null&&!Number.isInteger(row[3])||!Number.isInteger(row[4])||row[4]<1||row[4]>row[1]||!Number.isInteger(row[5])||row[5]<1||!Number.isInteger(row[6])||row[6]<1||row[6]>snap.week)bad('Puesto de chart del roster inválido.');seen.add(row?.[0]);}}
        }
        for(const record of Object.values(book.records))if(!Array.isArray(record)||record.length!==5||record.some(n=>!Number.isInteger(n)||n<1)||record[2]>=s.week||record[4]>record[2]||record[0]>record[3])bad('Récord de chart del roster inválido.');
      }
    }
    for(const receipt of s.receivables)if(receipt.managedArtistId!==undefined&&!m.artists.some(a=>a.id===receipt.managedArtistId))bad('Comisión sin cliente identificable.');
    if(!errors.length&&managementTrackingSize(s)>managementTrackingBytes)bad('El historial del roster supera su presupuesto de guardado.');
    return errors;
  }
  function managementSummary(s){
    const m=s.management||{role:'artist',artists:[]},personalPending=money((s.receivables||[]).filter(r=>!r.settled).reduce((n,r)=>n+r.amount,0));
    const labelCash=finite(s.label?.cash),labelPending=finite(s.label?.stats?.revenuePending),managedArtistCash=money(m.artists.reduce((n,a)=>n+a.cash,0));
    const artists=m.artists.map(a=>({...copy(a),active:managedActive(s,a),represented:representationActive(s,a),maxCommission:managedCommissionCeiling(s,managedTemplate(a)),tier:managedTemplate(a)?.tier||'emergente',project:copy(a.projects.find(p=>['working','ready'].includes(p.status))||null),labelContract:copy(labelContract(s,a.id)),marketTerms:managedOfferTerms(managedTemplate(a))}));
    const candidates=managedTemplates.filter(t=>!m.artists.some(a=>a.templateId===t.id)).map(t=>({...copy(t),tier:t.tier||'emergente',appearance:cleanAppearance({hair:t.hair,accent:t.accent}),maxCommission:managedCommissionCeiling(s,t),marketTerms:managedOfferTerms(t),canAffordLabel:managedSpendable(s,'label')>=finite(t.minAdvance)+finite(t.minBudget),canAffordManagement:managedSpendable(s)>=finite(t.managementFee)}));
    return{role:m.role,canArtist:m.role!=='manager',canManager:['manager','both'].includes(m.role),candidates,artists,label:copy(s.label),accounts:{personalCash:s.cash,labelCash,labelPending,managedArtistCash,personalPending,consolidatedCash:s.cash===null?null:money(s.cash+labelCash),consolidatedPending:money(personalPending+labelPending)},rules:{maxActiveArtists:managedRosterLimit,coordinationCost:30,commissionMin:.05,commissionMax:.25,labelShareMin:.1,labelShareMax:.7,durationMin:4,durationMax:156,soleLabelOwner:soleLabelOwner(s),projectCostFactor:.5,recordCost:200,promoteCost:120,releaseCost:150,note:'La representaci\u00f3n cobra comisi\u00f3n sobre el neto del artista; una firma solo al sello no crea esa comisi\u00f3n. El sello puede financiar proyectos nuevos y conserva su caja separada. El anticipo se recupera; el presupuesto de desarrollo es una aportaci\u00f3n no recuperable. Ni el cat\u00e1logo anterior ni la caja del artista pasan a tu patrimonio.'}};
  }
  function managedOfferTerms(t={}){return{tier:t.tier||'emergente',managementFee:finite(t.managementFee),minAdvance:finite(t.minAdvance),minBudget:finite(t.minBudget),minDuration:t.tier?26:4,maxDuration:t.tier==='estrella'?104:156,developmentScale:finite(t.developmentScale,1),recordCost:money(managementActivities.record.cost*finite(t.developmentScale,1)),promoteCost:money(managementActivities.promote.cost*finite(t.developmentScale,1)),releaseCost:money(managementActivities.release.cost*finite(t.developmentScale,1))};}
  function labelLedger(s,label,amount,category,taxDetails){
    const l=s.label;amount=money(amount);l.cash=money(l.cash+amount);l.ledger.push({day:s.calendar.day,date:s.calendar.date,week:s.week,label,amount,category});if(l.ledger.length>200)l.ledger.splice(0,l.ledger.length-200);
    taxSystem()?.record(s,'label',amount,category,taxDetails);
    if(category==='internal-transfer'){l.stats[amount>0?'transfersIn':'transfersOut']=money(l.stats[amount>0?'transfersIn':'transfersOut']+Math.abs(amount));return;}
    if(amount<0)l.stats.expenses=money(l.stats.expenses-amount);
    // A consolidated ledger entry carries its account but never alters personal cash.
    s.ledger.push({day:s.calendar.day,date:s.calendar.date,week:s.week,label,amount,category,account:'label'});if(s.ledger.length>5000)s.ledger.splice(0,s.ledger.length-5000);
    if(s.activeWeek){const key=amount>=0?'income':'expenses';s.activeWeek.report[key]=money(s.activeWeek.report[key]+Math.abs(amount));}
    if(amount>0)s.stats.totalIncome=money(s.stats.totalIncome+amount);
    if(amount<0&&category!=='label-advance')s.stats.totalExpenses=money(s.stats.totalExpenses-amount);
  }
  function labelAccrue(s,amount,source,contractId,capitalReturn=0){
    amount=money(amount);if(amount<=0)return;
    const l=s.label,existing=l.receivables.find(r=>!r.settled&&r.week===s.week&&r.contractId===contractId);
    if(existing){existing.amount=money(existing.amount+amount);if(existing.taxCapitalReturn!==undefined)existing.taxCapitalReturn=money(existing.taxCapitalReturn+capitalReturn);}
    else l.receivables.push({id:uid(s,'label-receivable'),week:s.week,dueWeek:s.week+4,source,contractId,amount,settled:false,taxCapitalReturn:money(capitalReturn)});
    l.stats.revenueAccrued=money(l.stats.revenueAccrued+amount);l.stats.revenuePending=money(l.stats.revenuePending+amount);
  }
  function ownLabelSplit(s,terms,amount,commit=true,balances){
    const c=terms&&s.label?.contracts?.find(c=>c.id===terms.contractId);
    if(!c||s.week>=terms.endsWeek||s.week<terms.startedWeek)return{label:0,recoup:0,net:money(amount)};
    const share=money(amount*terms.share),balance=balances?(balances.get(c.id)??c.recoupBalance):c.recoupBalance,recoup=money(Math.min(balance,amount-share));
    if(balances)balances.set(c.id,money(balance-recoup));
    if(commit){c.recoupBalance=money(c.recoupBalance-recoup);c.recouped=money(c.recouped+recoup);c.earned=money(c.earned+share);s.label.stats.recouped=money(s.label.stats.recouped+recoup);if(c.artistId==='player')taxSystem()?.noncash(s,'personal',recoup);labelAccrue(s,share+recoup,'Derechos y recuperación · '+c.artistName,c.id,recoup);}
    return{label:money(share+recoup),recoup,net:money(amount-share-recoup)};
  }
  function labelAction(s,p){
    if(!s.label)return{ok:false,message:'Primero constituye tu sello.'};
    if(!soleLabelOwner(s))return{ok:false,message:'La cuenta hist\u00f3rica tiene varios propietarios. No puedes mover el dinero de otros socios ni imponer contratos nuevos.'};
    const l=s.label;
    if(['deposit','withdraw'].includes(p.decision)){
      const amount=Number(p.amount);if(!Number.isFinite(amount)||amount<=0||amount>1e12||money(amount)!==amount)return{ok:false,message:'Introduce un importe positivo con hasta dos decimales.'};
      const deposit=p.decision==='deposit';if(managedSpendable(s,deposit?'personal':'label')+.001<amount)return{ok:false,message:'La cuenta pagadora no tiene caja libre suficiente; las reservas se mantienen aparte.'};
      ledger(s,deposit?'Aportaci\u00f3n a '+l.name:'Retiro de '+l.name,deposit?-amount:amount,'internal-transfer');labelLedger(s,deposit?'Aportaci\u00f3n del fundador':'Retiro del fundador',deposit?amount:-amount,'internal-transfer');return{ok:true,message:'Transferencia completada entre tus cuentas; no genera beneficio.'};
    }
    if(!['signSelf','signArtist','signCandidate'].includes(p.decision))return{ok:false,message:'Operaci\u00f3n de sello desconocida.'};
    const self=p.decision==='signSelf',candidate=p.decision==='signCandidate'?find(managedTemplates,p.candidateId||p.artistId):null;
    let a=self?null:s.management.artists.find(a=>a.id===p.artistId||candidate&&a.templateId===candidate.id);
    const t=candidate||managedTemplate(a),terms=managedOfferTerms(t);
    if(p.decision==='signCandidate'&&!candidate)return{ok:false,message:'Elige un candidato del mercado del sello.'};
    if(!self&&(!canManage(s)||!candidate&&(!a||!managedActive(s,a))))return{ok:false,message:'Activa Manager o Artista + manager y elige un candidato o un cliente vigente.'};
    if(self&&s.management.role==='manager')return{ok:false,message:'Activa artista o ambos para firmar tu propia carrera musical.'};
    if(labelContract(s,self?'player':a?.id))return{ok:false,message:'Ese artista ya tiene un contrato vigente con tu sello.'};
    if(!self&&!managedActive(s,a)&&s.management.artists.filter(x=>managedActive(s,x)).length>=managedRosterLimit)return{ok:false,message:'Tu roster admite hasta '+managedRosterLimit+' artistas activos entre sello y representaci\u00f3n.'};
    if(self&&activeContracts(s,'label').length)return{ok:false,message:'Tu licencia con otro sello es incompatible con una autofirma vigente.'};
    const share=Number(p.share??.3),duration=Number(p.duration??52),advance=Number(p.advance??0),budget=Number(p.budget??0);
    if(!Number.isFinite(share)||share<.1||share>.7||!Number.isInteger(duration)||duration<4||duration>156||!Number.isFinite(advance)||advance<0||advance>100000000||money(advance)!==advance||!Number.isFinite(budget)||budget<0||budget>100000000||money(budget)!==budget||self&&budget>0)return{ok:false,message:'Condiciones: sello 10\u201370%, 4\u2013156 semanas e importes de hasta $100 millones con dos decimales.'};
    if(!self&&(advance<terms.minAdvance||budget<terms.minBudget||duration<terms.minDuration||duration>terms.maxDuration))return{ok:false,message:t.name+' exige al menos $'+terms.minAdvance.toLocaleString('en-US')+' de anticipo y $'+terms.minBudget.toLocaleString('en-US')+' de desarrollo; plazo '+terms.minDuration+'\u2013'+terms.maxDuration+' semanas.'};
    const maxShare=t?.tier?Math.min(.65,.35+Math.min(2,Math.max(0,advance/Math.max(1,terms.minAdvance)-1))*.075+Math.min(2,Math.max(0,budget/Math.max(1,terms.minBudget)-1))*.025+Math.max(0,s.player.reputation-50)/1000):Math.min(.7,.4+advance/100000+Math.max(0,s.player.reputation-40)/300);
    if(!self&&share>maxShare+.000001)return{ok:false,message:'El artista rechaza esa participaci\u00f3n para el anticipo y presupuesto propuestos. Mejora los importes o reduce la cuota del sello.'};
    if(managedSpendable(s,'label')+.001<advance+budget)return{ok:false,message:'El anticipo y el presupuesto deben salir de la caja libre del sello: $'+money(advance+budget).toLocaleString('en-US')+'.'};
    if(!a&&!self){a=makeManagedArtist(s,t);a.contract={id:uid(s,'label-only-authority'),kind:'label-only',commission:0,startedWeek:s.week,endsWeek:s.week+duration,duration,status:'released'};s.management.artists.push(a);ensureManagementTracking(s,a,true);}
    const artistId=self?'player':a.id,c={id:uid(s,'own-label-contract'),artistId,artistName:self?s.player.name:a.name,share,duration,advance,recoupBalance:advance,recouped:0,earned:0,startedWeek:s.week,endsWeek:s.week+duration,status:'active',mastersRetained:true,scope:'Solo proyectos iniciados durante este contrato; licencia temporal, sin venta de masters.',...(budget?{developmentBudget:budget}:{}),...(t?.tier?{marketTier:t.tier}:{})};
    if(advance>0){labelLedger(s,'Anticipo \u00b7 '+c.artistName,-advance,self?'internal-transfer':'label-advance');if(self)ledger(s,'Anticipo interno \u00b7 '+l.name,advance,'internal-transfer');else {a.cash=money(a.cash+advance);managementRecord(s,a,{advanceReceived:advance});}l.stats.advancesPaid=money(l.stats.advancesPaid+advance);}
    if(budget>0){labelLedger(s,'Desarrollo no recuperable \u00b7 '+a.name,-budget,'label-development');a.cash=money(a.cash+budget);a.stats.developmentReceived=money(finite(a.stats.developmentReceived)+budget);managementRecord(s,a,{developmentReceived:budget});l.stats.developmentPaid=money(finite(l.stats.developmentPaid)+budget);}
    l.contracts.push(c);history(s,'Contrato de tu sello',c.artistName+' firma '+Math.round(share*100)+'% para '+l.name+' hasta S'+c.endsWeek+'. Anticipo $'+advance+'; desarrollo no recuperable $'+budget+'. Solo proyectos nuevos.','deal');return{ok:true,message:'Contrato firmado. El cat\u00e1logo anterior conserva sus derechos; la firma solo al sello no cobra comisi\u00f3n de representaci\u00f3n.'};
  }
  function managementAction(s,p){
    if(!canManage(s))return{ok:false,message:'Activa el rol mánager o ambos para representar artistas.'};
    const m=s.management,a=m.artists.find(a=>a.id===p.artistId);
    if(p.decision==='sign'){
      const t=find(managedTemplates,p.artistId||p.candidateId),existing=a||m.artists.find(a=>a.templateId===t?.id);
      if(!t&&!existing)return{ok:false,message:'Selecciona un artista del circuito.'};
      if(existing&&representationActive(s,existing))return{ok:false,message:'Ya representas a ese artista.'};
      const template=t||managedTemplate(existing),signingFee=finite(template?.managementFee);
      if(!managedActive(s,existing)&&m.artists.filter(a=>managedActive(s,a)).length>=managedRosterLimit)return{ok:false,message:'Tu roster admite '+managedRosterLimit+' artistas activos entre sello y representaci\u00f3n.'};
      const commission=Number(p.commission??.15),duration=Number(p.duration??52),maxCommission=managedCommissionCeiling(s,template);
      if(!Number.isFinite(commission)||commission<.05||commission>.25||!Number.isInteger(duration)||duration<4||duration>156)return{ok:false,message:'Representación: comisión de 5–25% y duración de 4–156 semanas.'};
      if(commission>maxCommission+.000001)return{ok:false,message:'El artista rechaza esa comisión. Tu trayectoria permite negociar hasta '+(maxCommission*100).toLocaleString('es-CO',{maximumFractionDigits:2})+'%.'};
      if(managedSpendable(s)+.001<signingFee)return{ok:false,message:'La incorporaci\u00f3n de representaci\u00f3n requiere $'+signingFee.toLocaleString('en-US')+' libres en tu cuenta personal. Puedes negociar por separado una firma directa con tu sello.'};
      const client=existing||makeManagedArtist(s,template);
      if(signingFee>0)ledger(s,'Incorporaci\u00f3n de representaci\u00f3n \u00b7 '+client.name,-signingFee,'management-signing');
      client.contract={id:uid(s,'management-contract'),commission,startedWeek:s.week,endsWeek:s.week+duration,duration,status:'active',...(signingFee?{signingFee}:{})};
      if(!existing){m.artists.push(client);ensureManagementTracking(s,client,true);}history(s,'Representación firmada',client.name+' acepta '+Math.round(commission*100)+'% de su neto hasta S'+client.contract.endsWeek+'. Sus fondos no son tuyos.','business');return{ok:true,message:'Representación firmada; programa trabajo para '+client.name+'.'};
    }
    if(!a||!managedActive(s,a))return{ok:false,message:'Selecciona un cliente con representación vigente.'};
    if(p.decision==='release'){
      if(!representationActive(s,a))return{ok:false,message:'Este artista no tiene una representaci\u00f3n vigente; su licencia de sello es un acuerdo separado.'};
      if(s.plan.some(item=>item.artistId===a.id))return{ok:false,message:'Retira primero las actividades de ese artista de la agenda.'};
      a.contract.status='released';return{ok:true,message:'Representación terminada. Conservas las comisiones ya devengadas; no cobrarás nuevas. Los contratos de sello siguen su propio plazo.'};
    }
    if(p.decision==='project'){
      const t=find(catalog.projects,p.type||'single');if(!t)return{ok:false,message:'Tipo de proyecto desconocido.'};
      if (p.creativeBriefId !== undefined && !creativeSystem()?.getBrief(p.creativeBriefId)) return { ok: false, message: 'Dirección creativa desconocida.' };
      if(a.projects.some(p=>['working','ready'].includes(p.status)))return{ok:false,message:'Ese cliente ya tiene un proyecto activo.'};
      if(a.releases.length>=managedReleaseLimit)return{ok:false,message:'Este artista alcanzó el límite de '+managedReleaseLimit+' obras retenidas. Su catálogo sigue generando ingresos.'};
      const cost=money(t.cost*.5*managedScale(a));if(clientSpendable(s,a)<cost)return{ok:false,message:'El artista necesita $'+cost+' propios libres de reservas para preproducción.'};
      const terms=labelTerms(s,a.id);a.cash=money(a.cash-cost);a.stats.costs=money(a.stats.costs+cost);managementRecord(s,a,{clientExpenses:cost});
      a.projects.push({id:uid(s,'managed-project'),name:text(p.name,'Nuevo '+t.name),type:t.id,status:'working',progress:0,needed:({single:2,ep:4,album:7,deluxe:5})[t.id],quality:a.quality,startedWeek:s.week,...(terms?{labelTerms:terms}:{}),...(p.creativeBriefId?{creativeBriefId:p.creativeBriefId}:{})});
      compactManagedProjects(s);
      return{ok:true,message:'Proyecto creado con fondos del artista. Las sesiones ocupan tu agenda.'};
    }
    if(p.decision==='plan'){
      const activity=p.activity;if(!Object.prototype.hasOwnProperty.call(managementActivities,activity))return{ok:false,message:'Selecciona grabar, promocionar, publicar o concierto.'};
      if(s.plan.length>=3)return{ok:false,message:'La agenda compartida ya tiene tres acciones.'};
      const project=p.projectId?a.projects.find(x=>x.id===p.projectId):a.projects.find(x=>['working','ready'].includes(x.status)),action=find(catalog.actions,'management_'+activity);
      const item={id:action.id,artistId:a.id,label:action.label+' · '+a.name,cost:p.supervised===false?0:30,energy:action.energy,...(p.supervised!==undefined?{supervised:p.supervised===true}:{}),...(project?{projectId:project.id}:{})};
      if(activity==='show'){
        const v=find(catalog.venues,p.venueId||'openmic');if(!v)return{ok:false,message:'Venue desconocido.'};
        const ticketPrice=Number(p.ticketPrice??v.ticket),marketId=p.marketId||(v.id==='openmic'?a.marketId:v.country);
        if(!Number.isFinite(ticketPrice)||ticketPrice<5||ticketPrice>250||!catalog.markets.includes(marketId)&&marketId!=='USA')return{ok:false,message:'Precio o mercado inválido.'};
        if((marketId==='USA'||v.lockedRegion==='usa')&&!s.progression.usaUnlocked)return{ok:false,message:'USA exige completar el modo hard.'};
        if(a.fame<v.requirements.fame||a.reputation<v.requirements.reputation)return{ok:false,message:'El artista aún no cumple la trayectoria requerida por este venue.'};
        if(s.plan.some(x=>x.id==='management_show'&&x.artistId===a.id))return{ok:false,message:'Ese artista ya tiene un show esta semana.'};
        Object.assign(item,{venueId:v.id,ticketPrice,marketId});
      }
      if(activity==='release'&&s.plan.some(x=>x.id===item.id&&x.artistId===a.id))return{ok:false,message:'Ese estreno ya está programado.'};
      const status=managementActionStatus(s,item);if(!status.ok)return status;s.plan.push(item);return{ok:true,message:item.label+' ocupa un día de la agenda compartida.'};
    }
    return{ok:false,message:'Operación de representación desconocida.'};
  }
  function managementActionStatus(s,item){
    const a=s.management?.artists.find(a=>a.id===item.artistId),activity=item.id?.replace('management_',''),rule=managementActivities[activity],p=a?.projects.find(p=>p.id===item.projectId),v=find(catalog.venues,item.venueId);
    const artistCost=activity==='show'?money((v?.cost||0)+(item.marketId!==a?.marketId?250:0)):money((rule?.cost||0)*managedScale(a));
    const fundedCost=activity==='release'&&prepaidDistribution(s,item.projectId,item.artistId)?0:artistCost;
    const monday=s.calendar.dayOfWeek===0&&!s.activeWeek?.mondaySettled,personalAvailable=managedSpendable(s)+(monday?s.receivables.filter(r=>!r.settled&&r.dueWeek<=s.week).reduce((n,r)=>n+r.amount,0):0),artistAvailable=clientSpendable(s,a)+(monday?(a?.receivables||[]).filter(r=>r.dueWeek<=s.week).reduce((n,r)=>n+r.amount,0):0);
    const managerCost=item.supervised===false?0:30;
    let message=!canManage(s)?'El rol actual no permite dirigir clientes.':!a||!managedActive(s,a)?'La representación ya no está vigente.':!rule?'Actividad de representación desconocida.':activity==='record'&&p?.status!=='working'?'No hay un proyecto grabable.':activity==='release'&&p?.status!=='ready'?'El proyecto no está listo para publicar.':activity==='show'&&!v?'Venue no disponible.':item.supervised!==false&&(s.player.energy<rule.energy||s.player.health<12)?'El mánager está agotado.':personalAvailable<managerCost?'Faltan $30 personales para coordinar.':artistAvailable<fundedCost?'La caja del artista no cubre esta actividad.':null;
    return{ok:!message,message:message||'Actividad disponible.',artistCost:fundedCost,managerCost,artistId:item.artistId||null,projectId:item.projectId||null};
  }
  function processManagementAction(s,item,report){
    const status=managementActionStatus(s,item);if(!status.ok){report.highlights.push(item.label+' omitido: '+status.message);return;}
    const a=s.management.artists.find(a=>a.id===item.artistId),activity=item.id.replace('management_',''),p=a.projects.find(p=>p.id===item.projectId);
    if(!pay(s,item.label,status.managerCost,'management')){report.highlights.push(item.label+' omitido: faltan fondos personales fuera de reservas.');return;}a.cash=money(a.cash-status.artistCost);a.stats.costs=money(a.stats.costs+status.artistCost);if(item.supervised!==false){s.player.energy=clamp(s.player.energy-managementActivities[activity].energy,0,100);s.player.health=clamp(s.player.health-1,0,100);}
    managementRecord(s,a,{clientExpenses:status.artistCost,coordinationExpenses:status.managerCost,promotion:activity==='promote'?status.artistCost:0});
    if(activity==='record'){const progressMultiplier=item.dailyPreparationProgressMultiplier??enterpriseSystem()?.preparationEffects(s,item)?.progressMultiplier??1;if(progressMultiplier!==1)p.assistedProgress=true;p.progress=Math.min(p.needed,money(p.progress+progressMultiplier));a.quality=money(clamp(a.quality+.4,0,92));p.quality=money(clamp(a.quality+s.player.skills.business*.12,0,100));if(p.progress>=p.needed)p.status='ready';}
    if(activity==='promote'){const gain=Math.round((90+a.fans*.025)*( .7+managementRandom(s)*.6));a.fans=Math.min(45000000,a.fans+gain);a.fame=money(clamp(a.fame+.4,0,100));a.lastPromoDay=s.calendar.day;}
    if(activity==='release'){
      releaseManagedProject(s,a,p,report);

    }
    if(activity==='show'){
      const v=find(catalog.venues,item.venueId),price=item.ticketPrice,localFans=s.version===4||s.territories?(territoriesSystem()?.showDemand(s,{actorId:a.id,marketId:item.marketId,city:v.city})?.effectiveFans??a.fans):a.fans,demand=(25+localFans*.045)*(1+a.fame/120)*Math.pow(v.ticket/price,1.25)*(.75+managementRandom(s)*.5),tickets=Math.min(v.capacity,Math.max(0,Math.floor(demand))),gross=money(tickets*price),operation=money(gross*.08),net=money(gross-operation-status.artistCost),commission=representationActive(s,a)?money(Math.max(0,net)*a.contract.commission):0;
      a.cash=money(a.cash+gross-operation-commission);a.stats.gross=money(a.stats.gross+gross);a.stats.costs=money(a.stats.costs+operation);a.stats.managementEarned=money(a.stats.managementEarned+commission);a.stats.artistNet=money(a.stats.artistNet+Math.max(0,net)-commission);a.stats.shows++;a.stats.tickets+=tickets;
      managementRecord(s,a,{clientExpenses:money(operation+commission),showGross:gross,showCommission:commission});
      if(commission)ledger(s,'Comisión show · '+a.name,commission,'management-income');a.fans=Math.min(45000000,a.fans+Math.round(tickets*.08));a.fame=money(clamp(a.fame+(net>0?.5:-.3),0,100));a.reputation=money(clamp(a.reputation+(net>0?1:-1),0,100));
      if(net>0&&tickets>=v.capacity*.5&&!s.management.countriesPlayed.includes(item.marketId)&&item.marketId!=='USA')s.management.countriesPlayed.push(item.marketId);
      report.highlights.push(a.name+': '+tickets+'/'+v.capacity+' entradas; resultado del show $'+net+', comisión $'+commission+'.');
    }
    if(item.supervised!==false){s.player.reputation=money(clamp(s.player.reputation+.45,0,100));skillGain(s,'business',.6);xp(s,10);}report.actions.push(item.label);a.history.push({week:s.week,day:s.calendar.day,action:activity,projectId:p?.id||null,artistCost:status.artistCost,managerCost:status.managerCost});if(a.history.length>24)a.history.shift();
  }
  function releaseManagedProject(s,a,p,report){
    if(!p||p.status!=='ready'||a.releases.length>=managedReleaseLimit)return null;
    const t=find(catalog.projects,p.type),r={id:uid(s,'managed-release'),projectId:p.id,name:p.name,type:p.type,quality:p.quality,multiplier:t.multiplier,releasedWeek:s.week,releasedDay:s.calendar.day,ageDays:0,totalStreams:0,totalUnits:0,gross:0,distribution:0,artistNet:0,managementEarned:0,labelEarned:0,masterOwner:a.name,...(p.labelTerms?{labelTerms:copy(p.labelTerms)}:{})};
    deliverCreativeBrief(a, p, r, report);
    a.releases.push(r);p.status='released';p.releasedWeek=s.week;a.fame=money(clamp(a.fame+2,0,100));a.reputation=money(clamp(a.reputation+2,0,100));
    arcSystem()?.onRelease(s, a.id);
    albumSystem().onRelease(s,a.id,p,r,albumHooks(),report);
    if(a.projects.length>5)a.projects=a.projects.filter(x=>['working','ready'].includes(x.status)).concat(a.projects.filter(x=>x.status==='released').slice(-4));
    return r;
  }
  function processManagedReleases(s){
    if(!s.management?.artists.length)return;
    for(const a of s.management.artists){
      let artistNet=0,managerNet=0;
      const availableFans=a.fans,promo=Number.isInteger(a.lastPromoDay)&&s.calendar.day-a.lastPromoDay<14?1.3:1;
      const entries=a.releases.map(r=>{
        const discovery=Math.pow(Math.max(0,r.quality-35)/65,3)*42000*r.multiplier*Math.exp(-r.ageDays/35)/7;
        const demand=r.creativeDirection?creativeSystem()?.demand(r.creativeDirection):null;
        const organic=availableFans*(.1+r.quality/300)*r.multiplier*Math.pow(1+r.ageDays/105,-1.25)/7+discovery;
        const streams=Math.floor((organic*(demand?.organicStreams??1)+paidBoostExposure(s,r,a.id)+albumSystem().exposure(s,r,a.id)+marketingSystem().exposure(s,r,a.id))*promo*(.8+managementRandom(s)*.4));
        const raw=(availableFans*(.00022+r.quality/100*.00065)*Math.sqrt(r.multiplier)*Math.pow(1+r.ageDays/42,-1.65)/7+discovery*.00045)*promo*(demand?.paidCopies??1);
        return{r,streams,units:Math.floor(raw)+(managementRandom(s)<raw%1?1:0)};
      });
      const streamScale=Math.min(1,((availableFans*(4+a.fame/12)+350000)/7)/Math.max(1,entries.reduce((n,x)=>n+x.streams,0))),unitScale=Math.min(1,Math.max(1,Math.ceil((availableFans*.003+120)/7))/Math.max(1,entries.reduce((n,x)=>n+x.units,0)));
      for(const {r,streams:rawStreams,units:rawUnits} of entries){
        const streams=Math.floor(rawStreams*streamScale),units=Math.max(Math.floor(rawUnits*unitScale),albumSystem().deliveryUnits(s,r,a.id)),sales=money(units*catalog.salesRules.digitalPrices[r.type]),gross=money(streams*.0032+sales),distribution=money(sales*.15),split=ownLabelSplit(s,r.labelTerms,money(gross-distribution)),commission=representationActive(s,a)?money(split.net*a.contract.commission):0,net=money(split.net-commission);
        for(const [key,value] of Object.entries({gross,distribution,artistNet:net,managementEarned:commission,labelEarned:split.label})){r[key]=money(r[key]+value);a.stats[key]=money(a.stats[key]+value);}
        managementRecord(s,a,{units,streams,salesRevenue:sales,streamRevenue:money(streams*.0032),grossRevenue:gross,distribution,artistAccrued:net,commissionAccrued:commission,labelAccrued:split.label});recordManagedWork(s,r,streams);
        r.totalStreams+=streams;r.totalUnits+=units;r.ageDays++;a.stats.streams+=streams;a.stats.units+=units;artistNet=money(artistNet+net);managerNet=money(managerNet+commission);a.fans=Math.min(45000000,a.fans+Math.round(streams*(.001+r.quality/50000)));
      }
      if(artistNet>0){const receipt=a.receivables.find(r=>r.week===s.week);if(receipt)receipt.amount=money(receipt.amount+artistNet);else a.receivables.push({week:s.week,dueWeek:s.week+4,amount:artistNet});}
      if(managerNet>0){const receipt=accrue(s,managerNet,'Comisión musical · '+a.name,4,s.activeWeek?.report);receipt.managedArtistId=a.id;}
      managementRecord(s,a,{},true);
    }
    compactManagementTracking(s);
  }
  function settleManagement(s){
    for(const a of s.management?.artists||[]){for(const r of a.receivables)if(r.dueWeek<=s.week){a.cash=money(a.cash+r.amount);a.stats.settled=money(a.stats.settled+r.amount);managementRecord(s,a,{artistSettled:r.amount});}a.receivables=a.receivables.filter(r=>r.dueWeek>s.week);}
    if(s.label?.receivables){for(const r of s.label.receivables)if(!r.settled&&r.dueWeek<=s.week){labelLedger(s,'Liquidación sello · '+r.source,r.amount,'label-settlement',{known:Number.isFinite(r.taxCapitalReturn),capitalReturn:r.taxCapitalReturn});const artistId=s.label.contracts.find(c=>c.id===r.contractId)?.artistId,artist=s.management?.artists.find(a=>a.id===artistId);if(artist)managementRecord(s,artist,{labelSettled:r.amount});r.settled=true;r.settledWeek=s.week;s.label.stats.revenueSettled=money(s.label.stats.revenueSettled+r.amount);s.label.stats.revenuePending=money(s.label.stats.revenuePending-r.amount);}const settled=s.label.receivables.filter(r=>r.settled);if(settled.length>40){const remove=new Set(settled.slice(0,settled.length-40).map(r=>r.id));s.label.receivables=s.label.receivables.filter(r=>!remove.has(r.id));}}
  }
  function closeManagement(s){
    for(const a of s.management?.artists||[]){if(a.contract.status==='active'&&s.week>=a.contract.endsWeek)a.contract.status='expired';a.fans=Math.round(a.fans*.9985);a.fame=money(Math.max(0,a.fame-.08));}
    for(const c of s.label?.contracts||[])if(c.status==='active'&&s.week>=c.endsWeek)c.status='completed';
  }
  function validateManagement(s){
    const errors=[],m=s.management,bad=message=>errors.push(message),nonnegative=(o,keys)=>keys.every(k=>Number.isFinite(o?.[k])&&o[k]>=0),unique=list=>new Set(list.map(x=>x?.id)).size===list.length;
    if(m!==undefined){
      if(!m||m.version!==1||!careerRoles.includes(m.role)||!Number.isInteger(m.rng)||m.rng<0||m.rng>4294967295||!Number.isInteger(m.trackedFromDay)||m.trackedFromDay<0||m.trackedFromDay>s.calendar.day||!Array.isArray(m.artists)||m.artists.length>managedTemplates.length||!Array.isArray(m.countriesPlayed)||m.countriesPlayed.some(c=>!catalog.markets.includes(c))||new Set(m.countriesPlayed).size!==m.countriesPlayed.length)return['Estado de representación inválido.'];
      if(!unique(m.artists)||new Set(m.artists.map(a=>a?.templateId)).size!==m.artists.length)bad('Artistas representados duplicados.');
      let active=0;
      for(const a of m.artists){
        if(!a||typeof a.id!=='string'||!find(managedTemplates,a.templateId)||typeof a.name!=='string'||typeof a.style!=='string'||appearanceError(a.appearance)||!catalog.markets.includes(a.marketId)&&a.marketId!=='USA'||!nonnegative(a,['cash','fans','fame','reputation','quality'])||!Number.isInteger(a.fans)||a.fans>45000000||a.fame>100||a.reputation>100||a.quality>100||!Array.isArray(a.projects)||a.projects.length>5||!Array.isArray(a.releases)||a.releases.length>managedReleaseLimit||!Array.isArray(a.receivables)||a.receivables.length>5||!Array.isArray(a.history)||a.history.length>24||!nonnegative(a.stats,['gross','distribution','artistNet','managementEarned','labelEarned','costs','streams','units','shows','tickets','settled'])){bad('Cuenta de artista representado inválida.');continue;}
        if(a.developmentScale!==undefined&&(!Number.isFinite(a.developmentScale)||a.developmentScale<1||a.developmentScale>1000))bad('Escala de producci\u00f3n del artista inv\u00e1lida.');
        for(const key of ['featureEarned','featureFees','developmentReceived'])if(a.stats[key]!==undefined&&(!Number.isFinite(a.stats[key])||a.stats[key]<0))bad('Acumulado adicional del artista inv\u00e1lido.');
        const c=a.contract;
        if(!c||typeof c.id!=='string'||!['active','expired','released'].includes(c.status)||!Number.isFinite(c.commission)||(c.kind==='label-only'?c.commission!==0||c.status!=='released':c.commission<.05||c.commission>.25)||!Number.isInteger(c.startedWeek)||!Number.isInteger(c.endsWeek)||!Number.isInteger(c.duration)||c.duration<4||c.duration>156||c.endsWeek!==c.startedWeek+c.duration)bad('Contrato de representación inválido.');
        if(c?.signingFee!==undefined&&(!Number.isFinite(c.signingFee)||c.signingFee<0||c.signingFee>100000000))bad('Coste de incorporaci\u00f3n inv\u00e1lido.');
        if(managedActive(s,a))active++;
        if(!unique(a.projects)||!unique(a.releases))bad('Obras del cliente duplicadas.');
        for(const p of a.projects)if(!p||typeof p.id!=='string'||typeof p.name!=='string'||!find(catalog.projects,p.type)||!['working','ready','released'].includes(p.status)||!nonnegative(p,['progress','needed','quality'])||p.progress>p.needed||(p.assistedProgress===true?!Number.isFinite(p.progress):!Number.isInteger(p.progress))||!Number.isInteger(p.needed)||p.needed<1||p.needed>7||p.quality>100)bad('Proyecto de cliente inválido.');
        for(const r of a.releases)if(!r||typeof r.id!=='string'||typeof r.name!=='string'||!find(catalog.projects,r.type)||typeof r.masterOwner!=='string'||!Number.isInteger(r.ageDays)||r.ageDays<0||!nonnegative(r,['quality','multiplier','totalStreams','totalUnits','gross','distribution','artistNet','managementEarned','labelEarned'])||Math.abs(r.gross-r.distribution-r.artistNet-r.managementEarned-r.labelEarned)>.03)bad('Regalías de cliente inválidas.');
        for(const r of a.receivables)if(!r||!Number.isInteger(r.week)||r.week<1||r.dueWeek!==r.week+4||!Number.isFinite(r.amount)||r.amount<=0)bad('Liquidación de cliente inválida.');
      }
      if(active>managedRosterLimit)bad('Hay m\u00e1s de '+managedRosterLimit+' artistas activos en el roster.');
    }
    if(s.label?.cash!==undefined){
      const l=s.label;
      if(!Number.isFinite(l.cash)||l.cash<0||!Array.isArray(l.contracts)||l.contracts.length>2000||!Array.isArray(l.receivables)||l.receivables.length>100||!Array.isArray(l.ledger)||l.ledger.length>200||!nonnegative(l.stats,['revenueAccrued','revenuePending','revenueSettled','expenses','transfersIn','transfersOut','advancesPaid','recouped']))bad('Contabilidad de sello inválida.');
      else{
        if(!unique(l.contracts)||!unique(l.receivables))bad('Contratos o cobros del sello duplicados.');
        const activeArtists=[];
        for(const c of l.contracts){
          if(!c||typeof c.id!=='string'||!['active','completed'].includes(c.status)||c.artistId!=='player'&&!m?.artists.some(a=>a.id===c.artistId)||!nonnegative(c,['share','advance','recoupBalance','recouped','earned'])||c.share<.1||c.share>.7||Math.abs(c.advance-c.recoupBalance-c.recouped)>.03||!Number.isInteger(c.startedWeek)||!Number.isInteger(c.duration)||c.duration<4||c.duration>156||c.endsWeek!==c.startedWeek+c.duration||c.mastersRetained!==true)bad('Contrato propio de sello inválido.');
          if(c?.developmentBudget!==undefined&&(!Number.isFinite(c.developmentBudget)||c.developmentBudget<0||c.developmentBudget>100000000))bad('Presupuesto de desarrollo inv\u00e1lido.');
          if(c?.status==='active'&&s.week<c.endsWeek)activeArtists.push(c.artistId);
        }
        if(new Set(activeArtists).size!==activeArtists.length)bad('Contratos propios vigentes incompatibles.');
        for(const r of l.receivables)if(!r||typeof r.id!=='string'||!l.contracts.some(c=>c?.id===r.contractId)||!Number.isInteger(r.week)||r.dueWeek!==r.week+4||!Number.isFinite(r.amount)||r.amount<=0||typeof r.settled!=='boolean'||r.taxCapitalReturn!==undefined&&(!Number.isFinite(r.taxCapitalReturn)||r.taxCapitalReturn<0||r.taxCapitalReturn>r.amount))bad('Liquidación del sello inválida.');
        if(Math.abs(l.stats.revenueAccrued-l.stats.revenueSettled-l.stats.revenuePending)>.05||Math.abs(l.stats.revenuePending-l.receivables.filter(r=>r&&!r.settled).reduce((n,r)=>n+r.amount,0))>.05)bad('La caja pendiente del sello no concilia.');
      }
    }
    if(errors.length)return errors;
    errors.push(...validateManagementTracking(s));
    const works=[...(s.projects||[]),...(s.releases||[]),...(m?.artists||[]).flatMap(a=>[...(a?.projects||[]),...(a?.releases||[])])];
    for(const w of works)if(w?.labelTerms){const t=w.labelTerms,c=s.label?.contracts?.find(c=>c.id===t.contractId);if(!c||t.labelId!==s.label.id||t.artistId!==c.artistId||t.share!==c.share||t.startedWeek!==c.startedWeek||t.endsWeek!==c.endsWeek||t.mastersRetained!==true)bad('Derechos congelados del sello inválidos.');}
    for(const item of s.plan||[])if(item?.id?.startsWith('management_')){const a=m?.artists.find(a=>a.id===item.artistId),rule=managementActivities[item.id.replace('management_','')];if(!a||!rule||item.cost!==(item.supervised===false?0:30)||item.energy!==rule.energy||['management_record','management_release'].includes(item.id)&&!a.projects.some(p=>p.id===item.projectId)||item.id==='management_show'&&(!find(catalog.venues,item.venueId)||!Number.isFinite(item.ticketPrice)||item.ticketPrice<5||item.ticketPrice>250||!catalog.markets.includes(item.marketId)&&item.marketId!=='USA'))bad('Agenda de representación inválida.');}
    return errors;
  }

  function createGame(overrides = {}) {
    if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) overrides = {};
    const gameMode = overrides.gameMode === undefined ? 'normal' : overrides.gameMode;
    if (!['normal','god'].includes(gameMode)) throw new RangeError('Elige modo Normal o God Mode para comenzar.');
    const godModeCash = overrides.godModeCash === undefined ? 1200 : overrides.godModeCash;
    if (gameMode === 'god' && (!Number.isFinite(godModeCash) || godModeCash < 0 || godModeCash > 30000000 || money(godModeCash) !== godModeCash)) throw new RangeError('El capital inicial de God Mode debe estar entre $0 y $30.000.000, con hasta dos decimales.');
    const s = {
      version: 3, week: 1, phase: 'Planificación', nextId: 1, rng: 88421,
      calendar: { epoch: '2026-01-05', day: 0, dayOfWeek: 0, date: '2026-01-05', status: 'planning' }, activeWeek: null, salesStartedDay: 0, salesHistory: [],
      provenance: { mode: 'new-career', historicalVerified: false, note: 'Tu carrera empieza desde cero en LATAM: sin catálogo, fans, acuerdos ni patrimonio heredado. El calendario ficticio avanza un día por paso del reloj; el domingo cierra la semana y se detiene.' },
      player: { name: 'Tu artista', origin: 'Bogotá, Colombia', style: 'Rap alternativo', appearance: copy(catalog.appearance.defaults), age: 18, energy: 90, health: 90, morale: 75, fame: 0, fans: 0, reputation: 10, skillPoints: 3, xp: 0, skills: { writing: 32, flow: 30, production: 25, stage: 28, business: 25 } },
      financialHold: false, continuationReady: true, cash: 1200, history: [], ledger: [], releases: [], projects: [], assets: [], loans: [], contracts: [], offers: [], team: [], plan: [], events: [],
      marketPrices: { index: 1000, music_stock: 1000, bond: 1000 },
      label: null, featureOffers: [], features: [], licenses: [], receivables: [],
      youtube: { subscribers: 0, views: 0, lastWeekViews: 0, totalRevenue: 0, videos: [], rpmRange: [ .45, 2.2 ], note: 'RPM ficticio provisional para LATAM; no deriva ni estima ingresos reales de SocialBlade. Monetización a partir de 1.000 suscriptores.' },
      progression: { difficulty: 'hard', region: 'latam', usaUnlocked: false, victoryStatus: 'in-progress', victoryGoals: [ '3 álbumes propios de calidad ≥70', '1.000.000 fans activos; oyentes mensuales no equivalen a fans', 'Conciertos exitosos en 3 mercados LATAM', '52 semanas seguidas solvente y patrimonio ≥$2M', 'Reputación ≥75 y ningún préstamo en impago' ], provisionalDesign: true },
      career: { startWeek: 1, startAge: 18, countriesPlayed: [], solventStreak: 0, competitionIndex: 1, marketCycle: 0, bankruptcyCount: 0, marketId: 'Colombia', firstProfitableShow: null },
      relationships: [
        { id: 'luna', name: 'Luna Vega', role: 'Productora', bond: 45, desc: 'Busca un sonido propio y valora sesiones bien preparadas.' },
        { id: 'bruno', name: 'Bruno Cruz', role: 'Promotor', bond: 35, desc: 'Puede acercarte a nuevos escenarios si cumples.' },
        { id: 'kairo', name: 'Kairo', role: 'Artista rival', bond: 20, desc: 'La competencia puede convertirse en colaboración.' },
        { id: 'alma', name: 'Alma Ríos', role: 'Periodista', bond: 30, desc: 'Se interesa por una historia consistente.' }
      ],
      adsCampaign: { id: 'ppv', name: 'PPV + deluxe', active: false, status: 'available', budget: 200000, duration: 12, totalWeeks: 24, elapsed: 0, spent: 0, revenue: 0, ppvSales: 0, price: 49, deluxeReleased: false, startedWeek: null, source: 'Plan de simulación opcional; requiere show y grabación propios, más un deluxe terminado.' },
      ppvShows: [], ppvFilms: [], ppvCampaigns: [],
      stats: { totalIncome: 0, totalExpenses: 0, totalStreams: 0, totalShows: 0, totalTickets: 0, totalPPV: 0, totalUnits: 0, totalSalesRevenue: 0, lastWeekIncome: 0, lastWeekExpenses: 0, lastWeekStreams: 0, lastWeekNet: 0, revenueAccrued: 0, revenuePending: 0, revenueSettled: 0 }, pendingReport: null
    };
    s.rng = normalizedSeed(overrides.seed);
    const economicOrigin = gameMode === 'god' ? 'standard' : ['limited','standard','support'].includes(overrides.economicOrigin) ? overrides.economicOrigin : 'standard';
    s.economicOrigin = { id: economicOrigin, weeklyContribution: economicOrigin === 'support' ? 40 : 0, contributionEndsWeek: economicOrigin === 'support' ? 52 : 0 };
    s.cash = { limited:500, standard:1200, support:3500 }[economicOrigin];
    if (Number.isFinite(overrides.cash)) s.cash = money(clamp(overrides.cash, 0, 1e12));
    // Initial capital is an opening balance, never income or a second ledger grant.
    if (gameMode === 'god') s.cash = godModeCash;
    s.gameMode = { id: gameMode, startingCash: s.cash };
    s.careerAwards = { version:1, startedWeek:1, completedMilestones:[], awards:[],managerRosterIncludesLabel:true };
    const p = overrides.player && typeof overrides.player === 'object' ? overrides.player : {};
    for (const key of ['name', 'style']) if (p[key]) s.player[key] = text(p[key], s.player[key]);
    if(overrides.style)s.player.style=text(overrides.style,s.player.style);
    s.player.initialGenre=genreId(s.player.style);
    s.player.visualStyle=validVisualStyle(s.player.initialGenre,overrides.visualStyle||p.visualStyle)?(overrides.visualStyle||p.visualStyle):defaultVisualStyle(s.player.initialGenre);
    const requestedCountry = countryById(overrides.countryId || p.countryId || 'CO') || catalog.countries[0];
    let origin = rollOrigin(requestedCountry.id, overrides.seed);
    const providedLabel = !overrides.countryId && typeof p.origin === 'string' && p.origin.trim() ? text(p.origin, s.player.origin) : null;
    if (providedLabel) origin = knownOrigin(providedLabel) || { countryId: null, countryName: null, cityId: null, cityName: null, marketId: s.career.marketId, origin: providedLabel, scene: 'Escena de origen por definir', livingMultiplier: 1 };
    Object.assign(s.player, { countryId: origin.countryId, country: origin.countryName, cityId: origin.cityId, city: origin.cityName, origin: origin.origin, scene: origin.scene, originLivingMultiplier: origin.livingMultiplier, originSeed: s.rng, originSource: providedLabel ? 'provided' : 'seeded', backgroundId: null, background: null });
    s.career.marketId = origin.marketId;
    const background = find(catalog.backgrounds, overrides.backgroundId || p.backgroundId);
    if (background) {
      s.player.backgroundId = background.id; s.player.background = background.name;
      for (const [key, delta] of Object.entries(background.skills)) s.player.skills[key] = clamp(s.player.skills[key] + delta, 0, 100);
      const contact = find(s.relationships, background.contactId);
      if (contact) contact.bond = clamp(contact.bond + background.contactBonus, 0, 100);
    }
    for (const key of ['energy', 'health', 'morale', 'fame', 'reputation']) if (Number.isFinite(p[key])) s.player[key] = clamp(p[key], 0, 100);
    if (Number.isFinite(p.fans)) s.player.fans = Math.round(clamp(p.fans, 0, 1e10));
    if (Number.isFinite(p.age)) { s.player.age = clamp(p.age, 18, 100); s.career.startAge = s.player.age; }
    if (Number.isFinite(p.skillPoints)) s.player.skillPoints = Math.floor(clamp(p.skillPoints, 0, 1000));
    if (p.skills && typeof p.skills === 'object') for (const key of Object.keys(s.player.skills)) if (Number.isFinite(p.skills[key])) s.player.skills[key] = clamp(p.skills[key], 0, 100);
    // God Mode grants starting fame once; save migration never reapplies it.
    if (gameMode === 'god') s.player.fame = 100;
    s.player.appearance = cleanAppearance(p.appearance);
    // A new character starts with free basics; selecting a preview never buys it.
    for (const field of Object.keys(catalog.appearance.wardrobe)) if (!wardrobeOwned(s,field,s.player.appearance[field])) s.player.appearance[field]=catalog.appearance.defaults[field];
    // A hungry newcomer earns deal access; offers are not granted merely for starting.
    history(s, 'Nueva partida · escenario provisional', s.provenance.note, 'system');
    if (gameMode === 'god') history(s, 'God Mode · capital y fama iniciales', '$' + s.cash.toLocaleString('es-CO') + ' de capital personal elegido y 100/100 de fama al crear esta carrera. El capital no es ingreso ni anticipo; los gastos, impuestos y reglas de carrera siguen vigentes. La fama podrá cambiar con la carrera.', 'origin');
    history(s, 'El punto de partida', s.player.origin + ' · ' + s.player.scene + '. Gastos de vida de inicio: $' + money(90 * s.player.originLivingMultiplier).toLocaleString('es-CO') + '/semana. ' + (background ? background.name + ': ventajas y carencias de experiencia; sin capital ni público extra.' : 'Experiencia inicial equilibrada.'), 'origin');
    ensureIndustry(s);
    ensureManagement(s,overrides.role);
    ensureCommerce(s);
    bandSystem()?.ensure(s);
    taxSystem()?.ensure(s);
    commitmentSystem()?.ensure(s);
    if(overrides.calendarMode==='hourly')enableDailyAgenda(s);
    return s;
  }

  function createSavedGame() {
    const s = createGame();
    delete s.gameMode;
    delete s.careerAwards;
    delete s.taxes;
    s.week = 914; s.cash = null; s.financialHold = true; s.continuationReady = false;
    s.calendar.day = 913 * 7; s.calendar.date = calendarDate(s.calendar.epoch, s.calendar.day); s.salesStartedDay = s.calendar.day;
    s.provenance = { mode: 'canonical-archive', historicalVerified: false, note: 'SANTO en semana 914: archivo del contexto recibido. Caja actual, recoup actualizado y atributos de juego no constan. Se conserva S891 como referencia histórica; no es caja disponible. No se aplican ingresos ni costes históricos a la caja.' };
    s.player.name = 'SANTO'; s.player.origin = 'LATAM · país por confirmar'; s.player.style = 'Rap / urbano'; s.player.age = null;
    Object.assign(s.player, { countryId: null, country: null, cityId: null, city: null, scene: 'Referencia histórica por conciliar', originLivingMultiplier: 1, originSeed: null, originSource: 'reference', backgroundId: null, background: null });
    for (const key of ['fans', 'energy', 'health', 'morale', 'fame', 'reputation', 'skillPoints']) s.player[key] = null;
    for (const key of Object.keys(s.player.skills)) s.player.skills[key] = null;
    s.career = { startWeek: 914, startAge: null, countriesPlayed: [], solventStreak: 0, competitionIndex: 1, marketCycle: 0, bankruptcyCount: 0, marketId: 'por verificar', firstProfitableShow: null };
    s.progression.victoryStatus = 'verification-pending';
    s.canonical = {
      currentWeek: 914, entity: 'Cozy', founders: [{ name: 'SANTO', share: 1 / 3 }, { name: 'DANTE', share: 1 / 3 }, { name: 'ZAYRO', share: 1 / 3 }],
      finance: { currentCash: null, cashReference: { week: 891, amount: 2471477.79, historicalOnly: true }, bankDebt: 0, equitySold: false, currency: 'USD', recoupReference: { week: 877, amount: 671650, provisional: true } },
      crownAtlantic: { kind: '360 · licencia de un álbum', totalDealValue: 3350000, musicAdvance: 1150000, currentRecoup: null, musicSplits: { Crown: .55, Cozy: .45 }, liveAndPPVSplits: { Crown: .4, Cozy: .6 }, merchSplits: { Crown: .35, Cozy: .65 }, deluxeExtension: { years: 1, investmentByCrown: 1100000, cashAdvance: false }, exclusiveLicensesCount: 7 },
      album: { title: 'Cuando se apaguen las luces', songs: 11, collaborators: ['Isabella Reyes', 'León Vargas', 'Malik Santos'] },
      deluxe: { title: 'Cuando se apaguen las luces · Deluxe', releasedWeek: 902, songs: 13, addedSongs: ['Hasta que vuelva el sol', 'Lo que nunca dijimos'], collaborators: [{ name: 'Camila Nova', monthlyListenersAtReference: 52700000 }, { name: 'Damián Ríos', monthlyListenersAtReference: 46300000 }], promotionEndedWeek: 913 },
      week914: { newStreams: 30800000, newViews: 10400000, orders: 5460, gross: 310000, settledInCash: false, noAutomaticPosting: true },
      stadium: { week: 801, attendance: 22410, jointOperatingResultBeforeSplits: 2577000, historicalOnly: true },
      ppv: { releasedWeek: 894, price: 49, accessMonths: 24, cozyAdsBudget: 200000, adsStartWeek: 891, adsEndWeek: 902, adsAlreadySpent: true, week914Sales: 11830, week914Gross: 579670, distributable: 455500, crownShare: 182200, cozyShare: 273300, cozyContributionBeforeTax: 73300, historicalOnly: true },
      missing: ['Caja actual conciliada y entidad a la que pertenece', 'Recoup musical vigente', 'Fans activos — no oyentes mensuales', 'Edad, energía, salud, ánimo, fama y reputación', 'Puntos y niveles de habilidad', 'Fin de la licencia Crown y detalle de activos/obligaciones pendientes']
    };
    s.history = [
      { week: 914, title: 'S914 · punto de continuidad', text: '30,8M streams nuevos · 10,4M views · 5.460 pedidos · gross $310.000. Datos de referencia conservados; no se vuelven a contabilizar.', kind: 'canonical' },
      { week: 913, title: 'Fin de la promoción del deluxe', text: 'La fase promocional terminó en S913.', kind: 'canonical' },
      { week: 902, title: 'Deluxe de 13 canciones', text: 'Dos canciones nuevas; se suman Camila Nova y Damián Ríos.', kind: 'canonical' },
      { week: 894, title: 'PPV histórico · $49', text: 'Acceso durante 24 meses. Los $200.000 de ads de S891–S902 ya fueron gastados; no se cobran de nuevo.', kind: 'canonical' },
      { week: 891, title: 'Referencia de caja · no saldo actual', text: '$2.471.477,79 en S891. La caja de S914 está pendiente de conciliación.', kind: 'canonical' },
      { week: 801, title: 'Estadio histórico · 22.410 asistentes', text: 'Resultado operativo conjunto $2.577.000 antes de splits. Se conserva como historia y no entra en el ledger actual.', kind: 'canonical' }
    ];
    s.releases = [
      { id: 'canon-album', name: 'Cuando se apaguen las luces', type: 'album', tracks: 11, quality: null, age: null, streams: null, totalStreams: null, revenue: null, totalRevenue: null, multiplier: 4.2, releasedWeek: null, canonical: true },
      { id: 'canon-deluxe', name: 'Cuando se apaguen las luces · Deluxe', type: 'deluxe', tracks: 13, quality: null, age: 12, streams: 30800000, totalStreams: null, revenue: null, totalRevenue: null, multiplier: 2.8, releasedWeek: 902, canonical: true }
    ];
    for (const r of s.releases) initializeDailyRelease(r, s.calendar.day, true);
    s.contracts = [{ id: 'canon-crown', templateId: 'label', name: 'Crown Atlantic · 360', type: 'label', advance: 1150000, share: .55, showShare: .4, ppvShare: .4, merchShare: .35, status: 'active', startedWeek: null, endsWeek: null, recoupBalance: null, recoupReference: 671650, recoupReferenceWeek: 877, recouped: 0, partnerEarned: 0, lastPromoWeek: 913, penalties: 0, canonical: true, scope: 'Cozy', nonCashInvestment: 1100000 }];
    s.adsCampaign = { ...s.adsCampaign, active: false, status: 'completed', budget: 200000, duration: 12, totalWeeks: 24, elapsed: 24, spent: 200000, revenue: null, ppvSales: null, deluxeReleased: true, startedWeek: 891, source: 'Campaña histórica terminada; gasto ya ejecutado. No activar ni contabilizar otra vez.', historical: true };
    for (const key of Object.keys(s.stats)) s.stats[key] = null;
    delete s.industry; ensureIndustry(s); delete s.merchandise; ensureCommerce(s); delete s.bands; bandSystem()?.ensure(s);
    return s;
  }

  function reconcile(s, payload) {
    if (s.provenance.mode !== 'canonical-archive' && s.provenance.mode !== 'canonical-continuation') return { ok: false, message: 'La conciliación está reservada al archivo histórico.' };
    if (typeof payload.source !== 'string' || !payload.source.trim()) return { ok: false, message: 'Indica la fuente o decisión explícita que respalda los valores de continuidad.' };
    if (payload.cash !== undefined) {
      if (!Number.isFinite(payload.cash) || Math.abs(payload.cash) > 1e12) return { ok: false, message: 'Caja de conciliación inválida.' };
      s.cash = money(payload.cash); s.canonical.finance.currentCash = s.cash;
    }
    if (payload.recoupment !== undefined) {
      if (!Number.isFinite(payload.recoupment) || payload.recoupment < 0 || payload.recoupment > 3350000) return { ok: false, message: 'Saldo de recoup inválido.' };
      s.contracts[0].recoupBalance = money(payload.recoupment); s.canonical.crownAtlantic.currentRecoup = money(payload.recoupment);
    }
    const p = payload.player && typeof payload.player === 'object' ? payload.player : {};
    for (const key of ['energy', 'health', 'morale', 'fame', 'reputation']) if (Number.isFinite(p[key])) s.player[key] = clamp(p[key], 0, 100);
    if (Number.isFinite(p.age) && p.age >= 16 && p.age <= 100) s.player.age = p.age;
    if (Number.isInteger(p.fans) && p.fans >= 0 && p.fans <= 1e10) s.player.fans = p.fans;
    if (Number.isInteger(p.skillPoints) && p.skillPoints >= 0 && p.skillPoints <= 1000) s.player.skillPoints = p.skillPoints;
    if (p.skills && typeof p.skills === 'object') for (const key of Object.keys(s.player.skills)) if (Number.isFinite(p.skills[key])) s.player.skills[key] = clamp(p.skills[key], 0, 100);
    if (Number.isInteger(payload.contractEndWeek) && payload.contractEndWeek > s.week) s.contracts[0].endsWeek = payload.contractEndWeek;
    s.reconciliation = { source: payload.source.trim().slice(0, 500), atWeek: s.week, entity: text(payload.entity, 'Cozy'), note: 'Los valores ingresados son decisiones explícitas de continuidad. No son reconstrucciones automáticas del pasado.' };
    const missing = [];
    if (!Number.isFinite(s.cash)) missing.push('caja');
    if (!Number.isFinite(s.contracts[0].recoupBalance)) missing.push('recoup');
    for (const key of ['fans', 'age', 'energy', 'health', 'morale', 'fame', 'reputation', 'skillPoints']) if (!Number.isFinite(s.player[key])) missing.push(key);
    for (const [key, value] of Object.entries(s.player.skills)) if (!Number.isFinite(value)) missing.push('skill.' + key);
    if (!Number.isInteger(s.contracts[0].endsWeek)) missing.push('semana final del contrato');
    s.financialHold = missing.length > 0; s.continuationReady = !s.financialHold;
    if (!s.financialHold) {
      s.provenance.mode = 'canonical-continuation';
      s.provenance.note = 'Continuidad de SANTO iniciada con valores conciliados expresamente. El archivo anterior se conserva sin volver a liquidar sus cifras.';
      s.career.startAge = s.player.age;
      for (const r of s.releases) { r.quality = (s.player.skills.writing + s.player.skills.flow + s.player.skills.production) / 3; r.age = r.releasedWeek === null ? 52 : Math.max(0, s.week - r.releasedWeek); r.ageDays = Math.round(r.age * 7); r.streams = 0; r.totalStreams = 0; r.revenue = 0; r.totalRevenue = 0; r.totalsFromReconciliation = true; }
      for (const key of Object.keys(s.stats)) s.stats[key] = 0;
      s.adsCampaign.revenue = 0; s.adsCampaign.ppvSales = 0;
      history(s, 'Continuidad conciliada', s.reconciliation.source + '. La siguiente semana solo avanza por acción explícita.', 'system');
      return { ok: true, message: 'Continuidad preparada. Ninguna semana ha avanzado ni se han contabilizado ingresos históricos.' };
    }
    return { ok: true, pending: true, missing, message: 'Valores guardados. Faltan datos para simular: ' + missing.join(', ') + '.' };
  }

  function unlockCriteria(s) {
    if (s.financialHold) return { unlocked: false, verified: false, goals: s.progression.victoryGoals.map(label => ({ label, met: false, value: null, pending: true })) };
    const managementMode=s.management?.role==='manager',clients=(s.management?.artists||[]).filter(a=>managedActive(s,a));
    const albums = (managementMode?clients.flatMap(a=>a.releases):s.releases).filter(r => r.type === 'album' && r.quality >= 70 && !r.canonical).length;
    const countries = managementMode?(s.management?.countriesPlayed||[]).length:s.career.countriesPlayed.length;
    const fans=managementMode?clients.reduce((n,a)=>n+a.fans,0):s.player.fans;
    const worth = netWorth(s);
    const goals = [
      { label: managementMode?'3 álbumes de clientes de calidad ≥70':'3 álbumes de calidad ≥70', value: albums, target: 3, met: albums >= 3 },
      { label: managementMode?'1.000.000 fans del roster activo':'1.000.000 fans activos', value: fans, target: 1000000, met: fans >= 1000000 },
      { label: 'Shows exitosos en 3 mercados LATAM', value: countries, target: 3, met: countries >= 3 },
      { label: '52 semanas solvente y patrimonio ≥$2M', value: s.career.solventStreak, target: 52, netWorth: worth, met: s.career.solventStreak >= 52 && worth >= 2000000 },
      { label: 'Reputación ≥75 y sin impago', value: s.player.reputation, target: 75, met: s.player.reputation >= 75 && !s.loans.some(l => l.status === 'default') }
    ];
    return { unlocked: s.progression.difficulty === 'hard' && goals.every(g => g.met), verified: true, goals };
  }

  function livingBase(s, fame = s.player.fame, mode = s.livingBudget?.mode || 'automatic') { return hasAsset(s, 'home') ? 160 : mode === 'basic' ? 90 : fame < 12 ? 90 : fame < 30 ? 420 : 690; }
  function livingCost(s, fame = s.player.fame, mode = s.livingBudget?.mode || 'automatic') { return money(livingBase(s, fame, mode) * clamp(s.player.originLivingMultiplier ?? 1, .9, 1.1) * (hasTeam(s, 'accountant') ? .92 : 1) + (s.economicOrigin?.id === 'support' && s.week <= s.economicOrigin.contributionEndsWeek ? 40 : 0)); }
  function livingBudgetSummary(s) {
    const held=!!s.financialHold,mode=s.livingBudget?.mode||'automatic';
    return{mode,chosenWeek:s.livingBudget?.chosenWeek??null,currentCost:held?null:livingCost(s),basicCost:held?null:livingCost(s,s.player.fame,'basic'),automaticCost:held?null:livingCost(s,s.player.fame,'automatic'),currentFame:s.player.fame,uncertainty:mode==='automatic'?'La fama al cerrar el domingo puede cambiar el tramo.':'La ciudad, vivienda, equipo contable o aportes de apoyo pueden cambiar el coste.',note:'Presupuesto personal semanal. Básico conserva el piso de vida; no cambia fama, habilidades ni demanda. El automático conserva el modelo anterior: base $90, $420 desde fama 12 y $690 desde fama 30; con vivienda propia, base $160. Ciudad, contable y apoyo ajustan ambos. Mantenimiento de activos, equipo, deudas e impuestos se pagan aparte.'};
  }
  function localVenue(s) {
    const venue = copy(find(catalog.venues, 'openmic'));
    const country = countryById(s?.player?.countryId);
    if (country && s.player.city && s.career?.marketId === country.marketId) {
      venue.name = 'El Sótano · ' + s.player.city; venue.label = 'Open mic · ' + s.player.city;
      venue.city = s.player.city; venue.country = country.marketId; venue.isLocal = true;
    } else venue.isLocal = false;
    return venue;
  }

  function actionCost(s, a) {
    let c = a.cost;
    if (a.id === 'record' && hasAsset(s, 'studio')) c *= .45;
    return money(c);
  }
  function albumSystem(){return root.RapAlbumCampaign||(typeof require==='function'?require('./album-campaign.js'):null);}
  function albumHooks(){return{
    spendable:taxSpendable,clientSpendable,uid,history,date:(s,day)=>calendarDate(s.calendar.epoch,day),
    releaseCost:a=>money(150*(a?managedScale(a):1)),track:managementRecord,
    spend:(s,a,account,amount,label,category)=>{
      if(account==='client'){if(!a||a.id==='player'||clientSpendable(s,a.id)<amount)return false;a.entity.cash=money(a.entity.cash-amount);a.entity.stats.costs=money(a.entity.stats.costs+amount);managementRecord(s,a.entity,{clientExpenses:amount,...(category==='ads'?{advertising:amount,promotion:amount}:{})});return true;}
      if(taxSpendable(s,account)<amount)return false;
      if(account==='label')labelLedger(s,label,-amount,category);else ledger(s,label,-amount,category);
      return true;
    },
    release:(s,a,p,report)=>a.id==='player'?releaseProject(s,p,report):releaseManagedProject(s,a.entity,p,report)
  };}
  function albumCampaignSummary(s){return albumSystem()?.summary(s,albumHooks());}
  function albumCampaignQuote(s,p={}){return albumSystem()?.campaignQuote(s,p,albumHooks());}
  function musicVideoQuote(s,p={}){return albumSystem()?.videoQuote(s,p,albumHooks());}
  function musicVideoActionStatus(s,item){return albumSystem()?.shootStatus(s,item,albumHooks());}
  function marketingHooks(){return{
    spendable:marketingSpendable,uid,history,date:(s,day)=>calendarDate(s.calendar.epoch,day),
    spend:(s,a,account,amount,label)=>{
      if(marketingSpendable(s,account,a.id)+.001<amount)return false;
      if(account==='client'){a.entity.cash=money(a.entity.cash-amount);a.entity.stats.costs=money(a.entity.stats.costs+amount);managementRecord(s,a.entity,{clientExpenses:amount,advertising:amount,promotion:amount});}
      else if(account==='label')labelLedger(s,label,-amount,'ads');else ledger(s,label,-amount,'ads');
      return true;
    },
    fanGain:(s,a,gain)=>{const before=a.entity.fans;if(a.id==='player')fanGain(s,gain);else a.entity.fans=Math.min(45000000,Math.max(0,Math.round(a.entity.fans+gain)));const actual=a.entity.fans-before;if(actual>0)(root.RapMarketingModel||(typeof require==='function'?require('./marketing-model.js'):null)).publicityFame(s,{actorId:a.id,gain:actual});return actual;},
    track:managementRecord
  };}
  function marketingQuote(s,p={}){return marketingSystem()?.quote(s,p,marketingHooks());}
  function marketingSummary(s){return marketingSystem()?.summary(s,marketingHooks());}
  function planItem(s, action, payload, bandAuthorized = false) {
    if(typeof action!=='string')return{ok:false,message:'Acción desconocida.'};
    if(action==='album_video_shoot')return{ok:false,message:'Programa el rodaje desde el videoclip encargado para elegir su producción.'};
    if(action.startsWith('management_'))return{ok:false,message:'Programa la actividad desde Sello y roster para elegir el cliente.'};
    if(s.management?.role==='manager'&&ownMusicActions.includes(action))return{ok:false,message:'Esta actividad requiere el rol artista o ambos.'};
    if (['band_audition','band_rehearsal'].includes(action) && !bandAuthorized) return {ok:false,message:'Gestiona esta actividad desde Bandas para elegir una formación y sus condiciones.'};
    if (s.plan.length >= 3) return { ok: false, message: 'La semana ya tiene tres acciones. Retira una antes de añadir otra.' };
    const a = find(catalog.actions, action);
    if (!a) return { ok: false, message: 'Acción desconocida.' };
    if (a.id === 'employment_shift') {
      const job=s.employment?.status==='active' ? find(catalog.jobs,s.employment.id) : null;
      if(!job) return {ok:false,message:'Acepta un empleo antes de programar un turno.'};
      s.plan.push({id:a.id,label:job.name,cost:0,energy:job.energy,jobId:job.id});
      return {ok:true,message:job.name+' añadido a la agenda: $'+job.wage+' al completarlo y '+job.energy+' de energía.'};
    }
    if (a.id === 'release') {
      const p = payload.projectId ? find(s.projects, payload.projectId) : s.projects.find(p => p.status === 'ready');
      if (!p || p.status !== 'ready') return { ok: false, message: 'Necesitas un proyecto terminado para publicarlo.' };
      if (s.plan.some(x => x.projectId === p.id && x.id === 'release')) return { ok: false, message: 'Ese lanzamiento ya está programado.' };
      payload.projectId = p.id;
    }
    s.plan.push({ id: a.id, label: a.label, cost: a.id==='release'&&prepaidDistribution(s,payload.projectId)?0:actionCost(s,a), energy: a.energy, ...(payload.projectId ? { projectId: payload.projectId } : {}), ...(bandAuthorized && payload.bandId ? {bandId:payload.bandId}:{}), ...(bandAuthorized && payload.offerId ? {offerId:payload.offerId}:{}) });
    return { ok: true, message: a.label + ' añadido al plan.' };
  }
  function paymentFor(amount, weeklyRate, weeks) { return money(weeklyRate ? amount * weeklyRate / (1 - Math.pow(1 + weeklyRate, -weeks)) : amount / weeks); }
  // Industry tracking is additive: historical income is never recreated on upgrade.
  let cachedBands;
  function bandSystem() { return root.RapBands || (typeof require==='function' ? (cachedBands || (cachedBands=require('./bands.js'))) : null); }
  function careerStorySystem() { return root.RapCareerStory || (typeof require==='function' ? require('./career-story.js') : null); }
  function arcSystem() { return root.RapCareerArcs || (typeof require === 'function' ? require('./career-arcs.js') : null); }
  function commitmentSystem() { return root.RapCareerCommitments || (typeof require === 'function' ? require('./career-commitments.js') : null); }
  function creativeSystem() { return root.RapCreativeDirection || (typeof require === 'function' ? require('./creative-direction.js') : null); }
  function setlistSystem() { return root.RapShowSetlist || (typeof require === 'function' ? require('./show-setlist.js') : null); }
  function momentumSystem() { return root.RapCareerMomentum || (typeof require === 'function' ? require('./career-momentum.js') : null); }
  const agendaExecuting=new WeakMap(),activityFactors=new WeakMap();
  function actionFactor(s){return activityFactors.get(s)||1;}
  function dailySystem(){return root.RapDailyAgenda||(typeof require==='function'?require('./daily-agenda.js'):null);}
  function hourly(s){return dailySystem()?.active(s)===true;}
  function territoriesSystem(){return root.RapTerritories||(typeof require==='function'?require('./territories.js'):null);}
  function enterpriseSystem(){return root.RapEnterprise||(typeof require==='function'?require('./enterprise.js'):null);}
  function enterpriseHooks(){return{catalog:catalog.investments,ledger,spendable:s=>taxSpendable(s)};}
  function enterpriseSummary(s){return enterpriseSystem()?.summary(s,enterpriseHooks());}
  function enableDailyAgenda(s){const check=validateSave(s);if(!check.ok)return{ok:false,message:check.errors[0]};return dailySystem().enable(s);}
  function agendaResources(s,actorId='player'){
    const own=s.assets.filter(a=>find(catalog.investments,a.catalogId)?.bonus==='studio'&&!enterpriseSystem()?.ownsAsset(s,a.id)).flatMap(a=>Array.from({length:Math.min(20,a.quantity)},(_,i)=>({id:'studio:'+a.id+':'+i,name:a.name+(a.quantity>1?' · sala '+(i+1):''),assetId:a.id,owned:true,capacity:1})));
    const operated=(enterpriseSystem()?.facilities?.(s)||[]).map(f=>({id:'studio:'+f.assetId+':0',name:f.name+' · desplaza reservas externas',assetId:f.assetId,enterpriseAssetId:f.assetId,owned:true,capacity:1}));
    return own.concat(operated,[{id:'rental:'+actorId,name:'Sala alquilada para esta sesión',owned:false,capacity:1}]);
  }
  function prepareAgendaItem(s,p){
    const shadow=copy(s);shadow.activeWeek=null;shadow.plan=[];shadow.version=3;delete shadow.agenda;
    const id=p.actionId||p.id;let r;
    const previousShow=id==='show'&&p.appointmentId!==undefined?s.agenda?.appointments.find(a=>a.id===p.appointmentId&&a.actionId==='show'&&a.status==='scheduled'):null;
    const preserveShowGroup=previousShow&&!Object.hasOwn(p,'group');
    const usesRoom=['record','produce','collab','band_rehearsal','management_record'].includes(id),options=usesRoom?agendaResources(s,p.actorId||p.artistId||'player'):[],resource=usesRoom?options.find(r=>r.id===(p.resourceId||options[0]?.id)):null;
    if(usesRoom&&!resource)return{ok:false,message:'El estudio ya no está disponible o está operado como negocio. Elige otra sala.'};
    if(resource&&!resource.owned)shadow.assets=shadow.assets.filter(a=>find(catalog.investments,a.catalogId)?.bonus!=='studio');
    if(p.actorId&&p.actorId!=='player'&&!String(id).startsWith('management_')&&!['rest','album_video_shoot'].includes(id))return{ok:false,message:'Elige una actividad de cliente para ese artista.'};
    if(id==='show')r=actCore(shadow,'book',preserveShowGroup?{...p,setlistReleaseIds:[]}:p);
    else if(String(id).startsWith('management_'))r=actCore(shadow,'management',{...p,supervised:p.supervised===true,decision:'plan',artistId:p.actorId||p.artistId,activity:id.replace('management_','')});
    else if(id==='album_video_shoot')r=actCore(shadow,'musicVideo',{...p,decision:'plan'});
    else r=planItem(shadow,id,p,['band_rehearsal','band_audition'].includes(id));
    if(!r.ok)return r;const item=shadow.plan.at(-1);if(!item)return{ok:false,message:'No se encontró la actividad que se va a programar.'};
    if(preserveShowGroup){
      // Date, venue and price edits keep the agreed snapshot, including removed
      // catalogue works and group splits. An empty selection clears only songs.
      if(item.venueId===previousShow.item.venueId&&item.marketId===previousShow.item.marketId){
        for(const key of ['cost','travelCost','venueName','venueLabel','venueCity','label'])if(Object.hasOwn(previousShow.item,key))item[key]=previousShow.item[key];
      }
      if(previousShow.item.bandTerms)item.bandTerms=copy(previousShow.item.bandTerms);
      if(Object.hasOwn(p,'setlistReleaseIds')){
        const quoted=setlistSystem()?.quote(s,{releaseIds:p.setlistReleaseIds,bandId:item.bandTerms?.bandId??null});
        if(quoted?.ok===false)return quoted;
        if(quoted?.setlist){item.setlist=quoted.setlist;item.energy=setlistSystem().effects(item.setlist).energyCost;}
      }else if(previousShow.item.setlist!==undefined){
        const saved=previousShow.item.setlist;
        if(!setlistSystem()?.validSnapshot(saved)||saved.bandId!==(item.bandTerms?.bandId??null)||saved.bookedDay>s.calendar.day||previousShow.item.energy!==setlistSystem().effects(saved).energyCost)return{ok:false,message:'El repertorio reservado necesita revisión antes de editar esta cita.'};
        item.setlist=copy(saved);item.energy=setlistSystem().effects(saved).energyCost;
      }
    }
    if(resource){item.resourceId=resource.id;item.facilityOwned=resource.owned;item.facilityName=resource.name;if(resource.enterpriseAssetId){item.enterpriseAssetId=resource.enterpriseAssetId;if(id==='record')item.cost=money(find(catalog.actions,id).cost*.45);}}
    let clientCost=0;if(item.artistId&&item.id.startsWith('management_')){item.supervised=p.supervised===true;const status=managementActionStatus(shadow,item);clientCost=status.artistCost||0;if(!item.supervised)item.cost=0;}
    if(id==='rest'&&p.actorId&&p.actorId!=='player'){item.artistId=p.actorId;item.supervised=false;clientCost=item.cost;item.cost=0;}
    return{ok:true,item,clientCost,energyMultiplier:enterpriseSystem()?.preparationEffects(s,item)?.energyMultiplier||1};
  }
  function agendaQuote(s,p={}){return dailySystem().quote(s,p,{prepare:prepareAgendaItem});}
  function agendaSummary(s,p={}){return{...dailySystem().summary(s,p,catalog.actions.concat([{id:'show',label:'Concierto'}])),resourceOptions:agendaResources(s,p.actorId||'player')};}
  function act(s,type,payload={}){
    if(!s||typeof s!=='object'||!s.player)return{ok:false,message:'Partida inválida.'};
    if(!payload||typeof payload!=='object'||Array.isArray(payload))payload={};
    if(type==='agenda')return dailySystem().act(s,payload,{prepare:prepareAgendaItem});
    if(type==='territory')return territoriesSystem()?.act(s,payload)||{ok:false,message:'Territorios no disponibles.'};
    if(type==='enterprise')return enterpriseSystem()?.act(s,payload,enterpriseHooks())||{ok:false,message:'Empresas no disponibles.'};
    if(hourly(s)){
      if(type==='plan')return dailySystem().act(s,{...payload,decision:'schedule',actionId:payload.actionId||payload.id},{prepare:prepareAgendaItem});
      if(type==='video')return dailySystem().act(s,{...payload,decision:'schedule',actionId:'video'},{prepare:prepareAgendaItem});
      if(type==='book')return dailySystem().act(s,{...payload,decision:'schedule',actionId:'show'},{prepare:prepareAgendaItem});
      if(type==='management'&&payload.decision==='plan')return dailySystem().act(s,{...payload,decision:'schedule',actionId:'management_'+payload.activity,actorId:payload.artistId},{prepare:prepareAgendaItem});
      if(type==='musicVideo'&&payload.decision==='plan')return dailySystem().act(s,{...payload,decision:'schedule',actionId:'album_video_shoot'},{prepare:prepareAgendaItem});
      if(type==='unplan'){const item=Number.isInteger(payload.index)?s.plan[payload.index]:s.plan.find(a=>a.id===payload.id);return dailySystem().act(s,{decision:'cancel',appointmentId:payload.appointmentId||item?.appointmentId},{prepare:prepareAgendaItem});}
      if(['businessOperation','businessOpportunity','assetOperation'].includes(type)&&enterpriseSystem()?.ownsAsset(s,payload.assetId||payload.id))return{ok:false,message:'Gestiona primero la empresa vinculada desde Negocios.'};
    }
    const before=s.version===4||s.territories?territoriesSystem()?.snapshot(s):null,result=actCore(s,type,payload);
    if(result.ok&&before)territoriesSystem()?.capture(s,before,{actorId:payload.artistId||'player',kind:type,marketId:s.career.marketId});
    return result;
  }
  function deliverCreativeBrief(actor, project, release, report) {
    if (!project.creativeBriefId || release.creativeDirection) return;
    const creative = creativeSystem();
    const delivered = creative?.deliver(project.creativeBriefId, actor.creativeAudience);
    if (!delivered) return;
    release.creativeDirection = delivered.direction;
    actor.creativeAudience = delivered.audience;
    report.highlights.push('Dirección creativa de «' + release.name + '»: ' + creative.getBrief(project.creativeBriefId).name + '.');
  }
  function bandSummary(s) { return bandSystem()?.snapshot(s) || null; }
  function bandCut(terms, amount) { return terms ? money(Math.max(0,amount)*(1-clamp(terms.playerShare,0,1))) : 0; }
  function recordBandIncome(s, terms, amount, context) { if(terms && amount>0) bandSystem().recordEarnings(s,terms,amount,context); }
  const royaltyKeys = ['gross','distribution','feature','band','ownLabel','partner','recoup','licensed','net','settled','pending'];
  function emptyRoyalty(day, legacy) { return { trackedFromDay: day, legacy: !!legacy, ...Object.fromEntries(royaltyKeys.map(k => [k, 0])) }; }
  function ensureIndustry(s) {
    if (s.industry === undefined) s.industry = { version: 1, rng: ((s.rng ^ 0x91e10da5) >>> 0) || 1, trackedFromDay: s.calendar.day, legacy: s.calendar.day > 0, nextPitchWeek: s.week, offers: [], settlements: [] };
    for (const r of s.releases) if (r) { if(r.royalties === undefined) r.royalties = emptyRoyalty(s.calendar.day, r.releasedDay !== s.calendar.day); else if(r.royalties && r.royalties.band===undefined) r.royalties.band=0; }
    return s.industry;
  }
  function emptyMerchandise(s) {
    return { version:1, trackedFromDay:s.calendar.day, legacy:s.calendar.day>0, totalUnits:0, totalGross:0, totalCost:0, totalPartner:0, totalNet:0, lastClosedWeek:null, lastWeekUnits:0, lastWeekGross:0, lastWeekCost:0, lastWeekPartner:0, lastWeekNet:0, history:[] };
  }
  function ensureCommerce(s) {
    if(s.merchandise===undefined)s.merchandise=emptyMerchandise(s);
    return s.merchandise;
  }
  function commerceSummary(s) {
    const lastWeek=s.week-1,days=(s.salesHistory||[]).filter(row=>row.week===lastWeek),lastWeekKnown=lastWeek>=1&&new Set(days.map(row=>row.day)).size===7;
    const known=Number.isFinite(s.stats.totalUnits),sum=(rows,key)=>money(rows.reduce((n,row)=>n+finite(row[key]),0));
    const discs={totalUnits:known?s.stats.totalUnits:null,totalDigitalUnits:known?sum(s.releases,'totalDigitalUnits'):null,totalPhysicalUnits:known?sum(s.releases,'totalPhysicalUnits'):null,totalGrossRevenue:Number.isFinite(s.stats.totalSalesRevenue)?s.stats.totalSalesRevenue:null,lastWeekKnown,lastWeekUnits:lastWeekKnown?sum(days,'units'):null,lastWeekDigitalUnits:lastWeekKnown?sum(days,'digitalUnits'):null,lastWeekPhysicalUnits:lastWeekKnown?sum(days,'physicalUnits'):null,trackedFromDay:s.salesStartedDay,legacy:s.salesStartedDay>0||s.releases.some(r=>r.salesBaseline==='tracking-started-on-upgrade')};
    const m=copy(s.merchandise||emptyMerchandise(s)),rules=catalog.commerceRules;
    const merchLastWeekKnown=m.lastClosedWeek===lastWeek&&lastWeek>=1;
    if(!merchLastWeekKnown)for(const suffix of ['Units','Gross','Cost','Partner','Net'])m['lastWeek'+suffix]=null;
    return {discs,merch:{...m,lastWeekKnown:merchLastWeekKnown,unitPrice:rules.merchUnitPrice,unitCost:rules.merchUnitCost,unitMargin:rules.merchUnitPrice-rules.merchUnitCost,model:'print-on-demand'}};
  }
  function recordMerchandise(s,a,demandMargin,report) {
    const m=ensureCommerce(s),rules=catalog.commerceRules,margin=rules.merchUnitPrice-rules.merchUnitCost;
    // The existing seeded demand draw sets a whole number of sold articles.
    // No extra random call: other businesses retain the same random sequence.
    const units=Math.max(0,Math.floor(demandMargin/margin)),gross=money(units*rules.merchUnitPrice),cost=money(units*rules.merchUnitCost);
    const contract=activeContracts(s).find(c=>Number.isFinite(c.merchShare)&&c.merchShare>0),partner=money((gross-cost)*(contract?.merchShare||0)),net=money(gross-cost-partner);
    if(units){
      ledger(s,'Mercancía · '+units+' artículos vendidos',gross,'merch-sales');
      ledger(s,'Fabricación y entrega · '+units+' artículos',-cost,'merch-cost');
      if(partner){ledger(s,'Participación de mercancía · '+contract.name,-partner,'merch-partner');contract.partnerEarned=money(contract.partnerEarned+partner);}
      a.totalIncome=money(a.totalIncome+gross);a.totalExpenses=money(a.totalExpenses+cost+partner);report.assetIncome=money(report.assetIncome+net);
    }
    for(const [suffix,value] of Object.entries({Units:units,Gross:gross,Cost:cost,Partner:partner,Net:net})){m['total'+suffix]=money(m['total'+suffix]+value);m['lastWeek'+suffix]=money(m['lastWeek'+suffix]+value);}
    const row={day:s.calendar.day,week:s.week,units,gross,cost,partner,net},previous=m.history[m.history.length-1];
    if(previous?.day===row.day)for(const key of ['units','gross','cost','partner','net'])previous[key]=money(previous[key]+row[key]);else m.history.push(row);
    if(m.history.length>rules.merchHistoryWeeks)m.history.splice(0,m.history.length-rules.merchHistoryWeeks);
    report.merch={units:m.lastWeekUnits,gross:m.lastWeekGross,cost:m.lastWeekCost,partner:m.lastWeekPartner,net:m.lastWeekNet};
  }
  function industryRandom(s) { const i = ensureIndustry(s); let x=i.rng; x^=x<<13; x^=x>>>17; x^=x<<5; i.rng=x>>>0; return i.rng/4294967296; }
  function activeLicense(s,id) { return s.licenses.find(l=>l.releaseId===id && l.status==='active' && l.endsWeek>s.week); }
  function catalogueMarket(s) {
    const nextPitchWeek=s.industry?.nextPitchWeek ?? s.week;
    const eligible=s.releases.filter(r=>!r.canonical).map(r=>({id:r.id,name:r.name,type:r.type,quality:r.quality,age:r.age,totalStreams:r.totalStreams,licensedUntil:activeLicense(s,r.id)?.endsWeek ?? null}));
    const reason=s.financialHold?'Completa la conciliación de esta partida.':s.activeWeek&&!hourly(s)?'Espera al cierre del domingo para negociar.':s.week<nextPitchWeek?'La siguiente ronda de propuestas abre en S'+nextPitchWeek+'.':!eligible.some(r=>!r.licensedUntil)?'Publica una obra propia con derechos disponibles.':null;
    return {offers:copy(s.industry?.offers || []),eligible,nextPitchWeek,canRequest:!reason,reason};
  }
  function royaltyStatement(s, options={}) {
    const wanted=options.releaseId || 'all', selected=s.releases.filter(r=>wanted==='all'||r.id===wanted);
    // Preserve first-match semantics while avoiding a catalogue scan for every
    // outstanding allocation. This index exists only for this report call.
    const releaseNames=new Map();for(const r of s.releases)if(!releaseNames.has(r.id))releaseNames.set(r.id,r.name);
    const rows=selected.map(r=>({releaseId:r.id,name:r.name,type:r.type,band:0,ownLabel:0,...copy(r.royalties || emptyRoyalty(s.calendar.day,true))}));
    const totals=Object.fromEntries(royaltyKeys.map(k=>[k,money(rows.reduce((n,r)=>n+r[k],0))]));
    const settled=(s.industry?.settlements || []).filter(r=>wanted==='all'||r.releaseId===wanted).map(copy);
    const pending=new Map();
    for(const receipt of s.receivables) if(!receipt.settled && Array.isArray(receipt.allocations)) for(const [releaseId,amount] of receipt.allocations) if(wanted==='all'||releaseId===wanted) {
      const key=releaseId+'|'+receipt.dueWeek+'|'+receipt.source,previous=pending.get(key);
      if(previous)previous.amount=money(previous.amount+amount);
      else pending.set(key,{releaseId,source:receipt.source+' · '+(releaseNames.get(releaseId)||'Obra'),week:receipt.week,dueWeek:receipt.dueWeek,amount,settled:false});
    }
    // Return every pending bucket before bounded recent receipts: large catalogues
    // must not hide their nearest payday by truncating to the newest allocations.
    return {rows,totals,settlements:[...pending.values()].sort((a,b)=>a.dueWeek-b.dueWeek).concat(settled.sort((a,b)=>b.week-a.week)),trackedFromDay:Math.min(s.calendar.day,...rows.map(r=>r.trackedFromDay)),legacy:rows.some(r=>r.legacy)||!!s.industry?.legacy};
  }
  function catalogueValue(s,r,duration) {
    // Demand is anchored to observed recent earning power, not cumulative streams.
    const days=r.dailyHistory.slice(-28), average=days.length?days.reduce((n,d)=>n+Math.max(0,d.grossRevenue-d.productionCost),0)/days.length:Math.max(0,finite(r.streams))*.0032/7;
    return money(clamp((average*7*duration*.72 + r.quality*7)*(.75+s.player.reputation/400),250,500000));
  }
  function makeCatalogOffer(s, ids, duration, source) {
    const i=ensureIndustry(s),releases=ids.map(id=>find(s.releases,id));
    const fair=releases.reduce((n,r)=>n+catalogueValue(s,r,duration),0), buyer=['Circuito Sur Licensing','Lado B Music','Ventana LATAM Sync'][Math.floor(industryRandom(s)*3)];
    const fee=money(fair*(.78+industryRandom(s)*.23));
    const o={id:uid(s,'catalog-offer'),buyer,scope:ids.length===1?'song':'catalog',releaseIds:ids.slice(),releaseNames:releases.map(r=>r.name),fee,duration,baseFee:fee,baseDuration:duration,offeredWeek:s.week,expiresWeek:s.week+4,status:'open',rounds:0,maxRounds:2,exclusive:true,mastersRetained:true,source,history:[{week:s.week,kind:'offer',fee,duration,message:'Oferta recibida; los masters permanecen contigo.'}]};
    i.offers.push(o); if(i.offers.length>80)i.offers.splice(0,i.offers.length-80);
    history(s,'Oferta por '+(ids.length===1?'una obra':'un paquete de catálogo'),buyer+' ofrece $'+fee.toLocaleString('es-CO')+' por '+ids.length+' obra(s) durante '+duration+' semanas. Vence S'+o.expiresWeek+'.','deal');
    return o;
  }
  function catalogOfferPreview(s,id) {
    const o=s.industry?.offers.find(o=>o.id===id); if(!o)return null;
    const releases=o.releaseIds.map(id=>find(s.releases,id)); if(releases.some(r=>!r))return null;
    const fees=allocateMoney(o.fee,releases.map(r=>catalogueValue(s,r,o.duration)));
    const c=activeContracts(s).find(c=>['label','distribution'].includes(c.type)); let balance=c?.recoupBalance || 0;
    const ownBalances=new Map();
    const allocations=releases.map((r,index)=>{const fee=fees[index],feature=money(fee*Math.min(.45,s.features.filter(f=>f.releaseId===r.id).reduce((n,f)=>n+f.masterShare,0))),band=bandCut(r.bandTerms,fee-feature),partner=money((fee-feature-band)*(c?.share||0)),recoup=money(Math.min(balance,fee-feature-band-partner));balance=money(balance-recoup);const split=ownLabelSplit(s,r.labelTerms,money(fee-feature-band-partner-recoup),false,ownBalances);return{releaseId:r.id,name:r.name,fee,feature,band,partner,recoup,ownLabel:split.label,net:split.net};});
    return {...Object.fromEntries(['fee','feature','band','ownLabel','partner','recoup','net'].map(k=>[k,money(allocations.reduce((n,r)=>n+r[k],0))])),dueWeek:s.week+4,allocations};
  }
  function signLicense(s,r,fee,duration,terms={}) {
    ensureIndustry(s);
    const l={id:uid(s,'license'),releaseId:r.id,name:r.name,fee:money(fee),duration,startedWeek:s.week,endsWeek:s.week+duration,status:'active',exclusive:true,mastersRetained:true,masterOwner:r.masterOwner || (s.label?s.label.name:s.player.name),licensee:terms.buyer||'Circuito LATAM Licensing',rights:'Licencia exclusiva temporal de la obra; conserva masters y participaciones previamente acordadas.',revenueAssigned:0,settlementLagWeeks:4,...(terms.offerId?{offerId:terms.offerId}:{})};
    s.licenses.push(l);
    const report={accrued:0,recoup:0,partnerShare:0,grossMusic:0},features=s.features.filter(f=>f.releaseId===r.id),share=Math.min(.45,features.reduce((n,f)=>n+f.masterShare,0));
    const feature=money(fee*share),payments=allocateMoney(feature,features.map(f=>f.masterShare));
    features.forEach((f,index)=>{creditFeatureShare(s,f,payments[index]);});l.featureShare=feature;
    const band=bandCut(r.bandTerms,fee-feature);l.bandShare=band;recordBandIncome(s,r.bandTerms,band,{source:'Licencia · '+r.name,releaseId:r.id});
    const before=s.receivables.length,base=musicRevenue(s,money(fee-feature-band),report,'Licencia · '+r.name,true),split=ownLabelSplit(s,r.labelTerms,base),net=split.net;l.artistReceivable=net;l.ownLabelShare=split.label;if(net>0)accrue(s,net,'Licencia · '+r.name,4,report);
    const a=r.royalties; for(const [k,v] of Object.entries({gross:fee,feature,band,ownLabel:split.label,partner:report.partnerShare,recoup:report.recoup,net,pending:net}))a[k]=money(finite(a[k])+v);
    if(s.receivables.length>before)s.receivables[s.receivables.length-1].allocations=[[r.id,net]];
    history(s,'Licencia exclusiva · masters retenidos',r.name+': $'+money(fee).toLocaleString('es-CO')+' brutos; cobro neto $'+net.toLocaleString('es-CO')+' en S'+(s.week+4)+'. Explotación cedida temporalmente hasta S'+l.endsWeek+'.','deal');
    return l;
  }
  function catalogAction(s,p) {
    const i=ensureIndustry(s),decision=p.decision||'request';
    if(decision==='request') {
      const status=catalogueMarket(s);if(!status.canRequest)return{ok:false,message:status.reason};
      if(!Array.isArray(p.releaseIds)||!p.releaseIds.length||p.releaseIds.length>s.releases.length||p.releaseIds.length>20000||new Set(p.releaseIds).size!==p.releaseIds.length)return{ok:false,message:'Selecciona obras distintas de tu catálogo publicado.'};
      const releases=p.releaseIds.map(id=>find(s.releases,id));if(releases.some(r=>!r||r.canonical||activeLicense(s,r.id)))return{ok:false,message:'El paquete incluye una obra inexistente o con exclusividad vigente.'};
      const duration=p.duration===undefined?52:Number(p.duration);if(![26,52,104].includes(duration))return{ok:false,message:'Elige 26, 52 o 104 semanas.'};
      if(i.offers.some(o=>o.status==='open'&&o.releaseIds.some(id=>p.releaseIds.includes(id))))return{ok:false,message:'Ya hay una negociación abierta por alguna obra de este paquete.'};
      i.nextPitchWeek=s.week+4;
      // Soliciting a bid costs no cash, but buyers can decline and consume this round.
      const chance=.78+Math.min(.17,s.player.reputation/600);
      if(industryRandom(s)>chance){history(s,'Propuesta de catálogo sin oferta','Los compradores no presentan una oferta esta ronda. Puedes volver a proponer en S'+i.nextPitchWeek+'.','deal');return{ok:true,outcome:'declined',message:'No hubo una oferta esta ronda. Puedes volver en S'+i.nextPitchWeek+'.'};}
      const o=makeCatalogOffer(s,p.releaseIds,duration,'pitch');return{ok:true,offerId:o.id,outcome:'offered',message:'Oferta recibida de '+o.buyer+'. Revísala antes de conceder derechos.'};
    }
    const o=i.offers.find(o=>o.id===(p.offerId||p.id));if(!o||o.status!=='open')return{ok:false,message:'Esta oferta ya no está abierta.'};
    if(s.week>o.expiresWeek){o.status='expired';return{ok:false,message:'La oferta venció.'};}
    if(decision==='reject'){o.status='rejected';o.history.push({week:s.week,kind:'rejected',fee:o.fee,duration:o.duration,message:'Oferta rechazada por el artista.'});return{ok:true,message:'Oferta rechazada; conservas todos los derechos.'};}
    if(decision==='counter'){
      if(o.rounds>=o.maxRounds)return{ok:false,message:'Se agotaron las dos rondas de contrapropuesta.'};
      const fee=Number(p.fee),duration=Number(p.duration);if(!Number.isFinite(fee)||fee<1||fee>1000000000000||!Number.isInteger(duration)||duration<13||duration>104)return{ok:false,message:'Introduce un precio positivo (máximo $1T) y entre 13 y 104 semanas.'};
      o.rounds++;o.history.push({week:s.week,kind:'counter',fee:money(fee),duration,message:'Tus condiciones propuestas.'});
      const ask=(fee/duration)/(o.baseFee/o.baseDuration),power=.07+s.player.skills.business/700+(hasTeam(s,'manager')?.04:0),roll=industryRandom(s);
      if(ask>2.2||roll<clamp((ask-1-power)*.55,.04,.8)){o.status='withdrawn';o.history.push({week:s.week,kind:'withdrawn',fee:o.fee,duration:o.duration,message:'El comprador se retira por las nuevas condiciones.'});return{ok:true,outcome:'withdrawn',message:o.buyer+' se retira. No se firmó ni cobró nada.'};}
      const agreed=ask<=1+power||roll>.78;
      o.fee=agreed?money(fee):money((o.fee+fee)*.5);o.duration=agreed?duration:Math.round((o.duration+duration)/2);o.expiresWeek=Math.max(o.expiresWeek,s.week+2);
      o.history.push({week:s.week,kind:agreed?'agreed':'revised',fee:o.fee,duration:o.duration,message:agreed?'Aceptan estos términos; falta tu firma.':'El comprador presenta términos intermedios; puedes firmar, rechazar o usar otra ronda.'});
      return{ok:true,outcome:agreed?'agreed':'revised',message:agreed?'La contrapropuesta fue aceptada. Revisa y firma para cerrar.':'Recibiste una propuesta intermedia. Aún no se ha firmado.'};
    }
    if(decision!=='accept')return{ok:false,message:'Decisión de mercado desconocida.'};
    const releases=o.releaseIds.map(id=>find(s.releases,id));if(releases.some(r=>!r||r.canonical||activeLicense(s,r.id)))return{ok:false,message:'Cambió la disponibilidad de los derechos; no se firmó ninguna parte del paquete.'};
    const preview=catalogOfferPreview(s,o.id);if(!preview)return{ok:false,message:'No se pudo verificar el paquete.'};
    preview.allocations.forEach(a=>signLicense(s,find(s.releases,a.releaseId),a.fee,o.duration,{buyer:o.buyer,offerId:o.id}));
    o.status='accepted';o.acceptedWeek=s.week;o.history.push({week:s.week,kind:'accepted',fee:o.fee,duration:o.duration,message:'Firmado. Cobro neto previsto en S'+(s.week+4)+'.'});
    for(const other of i.offers)if(other.id!==o.id&&other.status==='open'&&other.releaseIds.some(id=>o.releaseIds.includes(id)))other.status='withdrawn';
    return{ok:true,outcome:'accepted',message:'Licencia firmada por '+releases.length+' obra(s). $'+preview.net.toLocaleString('es-CO')+' netos pendientes hasta S'+preview.dueWeek+'. Masters conservados.'};
  }
  function advanceIndustry(s) {
    const i=ensureIndustry(s);for(const o of i.offers)if(o.status==='open'&&s.week>o.expiresWeek)o.status='expired';
    // A separate RNG keeps incoming bids from changing listening or concert outcomes.
    if(s.week%8===0 && i.offers.filter(o=>o.status==='open').length<3){
      const candidates=s.releases.filter(r=>!r.canonical&&r.age>=2&&!activeLicense(s,r.id)&&!i.offers.some(o=>o.status==='open'&&o.releaseIds.includes(r.id)));
      if(candidates.length&&industryRandom(s)<.48){const r=candidates[Math.floor(industryRandom(s)*candidates.length)];makeCatalogOffer(s,[r.id],52,'incoming');}
    }
  }
  function counterDeal(s,o,p) {
    const advance=Number(p.advance),share=Number(p.share),duration=Number(p.duration);
    if(!Number.isFinite(advance)||advance<0||advance>10000000||!Number.isFinite(share)||share<0||share>.8||!Number.isInteger(duration)||duration<4||duration>156)return{ok:false,message:'Términos inválidos: anticipo $0–10M, participación 0–80%, plazo 4–156 semanas.'};
    const shareSupported=['distribution','label','booking'].includes(o.type);
    if(!shareSupported && share!==o.share)return{ok:false,message:'Este acuerdo no negocia participación en ingresos. Puedes proponer otro pago o duración.'};
    if((o.rounds||0)>=2)return{ok:false,message:'Ya se agotaron las dos rondas de negociación.'};
    ensureIndustry(s);if(!o.negotiationBase)o.negotiationBase={advance:o.advance,share:o.share,duration:o.duration};if(!o.history)o.history=[];
    const b=o.negotiationBase,benefit=(advance-b.advance)/Math.max(1000,b.advance)+(shareSupported?(b.share-share)*3:0)+(b.duration-duration)/Math.max(8,b.duration)*.4;
    o.rounds=(o.rounds||0)+1;o.negotiated=true;o.history.push({week:s.week,kind:'counter',advance:money(advance),share,duration,message:'Tus términos propuestos.'});
    const power=.1+s.player.skills.business/500+(hasTeam(s,'manager')?.08:0),roll=industryRandom(s);
    if(benefit>2||roll<clamp((benefit-power)*.45,.03,.82)){o.status='rejected';o.history.push({week:s.week,kind:'withdrawn',advance:o.advance,share:o.share,duration:o.duration,message:'La empresa retira la oferta.'});return{ok:true,outcome:'withdrawn',message:'La empresa retira la oferta. No se firmó ningún contrato.'};}
    const agreed=benefit<=power||roll>.8;
    o.advance=money(agreed?advance:(advance+o.advance)/2);o.share=Math.round((agreed?share:(share+o.share)/2)*10000)/10000;o.duration=agreed?duration:Math.round((duration+o.duration)/2);o.expiresWeek=Math.max(o.expiresWeek,s.week+2);
    o.history.push({week:s.week,kind:agreed?'agreed':'revised',advance:o.advance,share:o.share,duration:o.duration,message:agreed?'Términos aceptados; falta tu firma.':'La empresa devuelve términos intermedios.'});
    return{ok:true,outcome:agreed?'agreed':'revised',message:agreed?'Aceptan tus términos. Falta tu firma para cerrar.':'La empresa ofrece condiciones intermedias. Revísalas antes de firmar.'};
  }

  function collaborationArtist(s,p={}) {
    const a=p.managedArtistId?s.management?.artists.find(a=>a.id===p.managedArtistId):null;
    if(p.managedArtistId){if(!a||!managedActive(s,a))return null;return{id:a.id,managedArtistId:a.id,name:a.name,style:a.style,country:a.marketId,tier:managedTemplate(a)?.tier||'roster',minFame:0,fee:money(clamp(Math.pow(Math.max(1,a.fans),.72)*3+a.quality*4,180,1200000)),masterShare:Math.round(clamp(.025+Math.log10(a.fans+10)*.017,.035,.18)*10000)/10000,durationPromoWeeks:a.fans>=1000000?10:6,audience:Math.max(500,Math.round(a.fans*3)),source:'roster'};}
    const offer=s.featureOffers?.find(o=>o.id===(p.offerId||p.id)),t=find(catalog.features,p.artistId||offer?.artistId||p.id);return t?{...copy(t),source:'external',style:t.style||'Hip hop',country:t.country||'LATAM'}:null;
  }
  function featureQuote(s,p={}) {
    if(s.financialHold)return{ok:false,message:'La carrera requiere conciliación antes de contratar.'};
    const t=collaborationArtist(s,p),format=find(catalog.collaborationFormats,p.formatId||'guest');
    if(!t)return{ok:false,message:'Elige un artista externo o de tu roster vigente.'};
    if(!format)return{ok:false,message:'Formato de colaboración desconocido.'};
    const o=p.offerId?s.featureOffers.find(o=>o.id===p.offerId):s.featureOffers.find(o=>o.artistId===t.id&&o.status==='open');
    if(o&&(o.artistId!==t.id||o.status!=='open'||s.week>o.expiresWeek))return{ok:false,message:'Esta oferta de colaboración ya no está disponible.'};
    const project=p.projectId?find(s.projects,p.projectId):null;
    if(format.id==='remix'&&project&&!['single','deluxe'].includes(project.type))return{ok:false,message:'El remix requiere un proyecto nuevo de sencillo o deluxe.'};
    const base=o||t,fit=genreId(t.style)===genreId(s.player.style)?1:.75;
    const q={ok:true,artistId:t.id,...(t.managedArtistId?{managedArtistId:t.managedArtistId}:{}),name:t.name,style:t.style,country:t.country,source:t.source,formatId:format.id,formatName:format.name,fee:money(base.fee*format.feeFactor),masterShare:Math.round(Math.min(.3,base.masterShare*format.shareFactor)*10000)/10000,durationPromoWeeks:Math.max(1,base.durationPromoWeeks+format.promoChange),audience:Math.round(base.audience*format.reachFactor*(format.id==='guest'?1:fit)),minFame:t.minFame,hostFame:s.player.fame,payer:p.payer||'personal',...(o?{offerId:o.id}:{})};
    const work=project||(!p.projectId?s.projects.find(p=>['working','ready'].includes(p.status)):null),existing=work?s.features.filter(f=>f.projectId===work.id):[],funds=q.payer==='label'&&soleLabelOwner(s)?managedSpendable(s,'label'):q.payer==='personal'?managedSpendable(s,'personal'):0;
    if(t.audienceModel==='global-v1')Object.assign(q,{audienceModel:t.audienceModel,promotionModel:'open-budget-v1',monthlyListeners:t.monthlyListeners,promoAudience:q.audience,minQuality:t.minQuality,projectQuality:work?.quality??null});
    q.affordable=funds+.001>=q.fee;q.reason=s.management?.role==='manager'?'Activa artista o ambos para colaborar en una obra propia.':s.activeWeek&&!hourly(s)?'Espera al cierre semanal para contratar.':!work||!['working','ready'].includes(work.status)?'Crea un proyecto propio sin publicar.':s.player.fame<t.minFame?'Esta colaboración musical requiere fama '+t.minFame+'. Los posts pagados no tienen este requisito.':q.minQuality&&work.quality<q.minQuality?'El invitado exige calidad '+q.minQuality+' en el proyecto. Desarrolla la obra antes de firmar.':existing.some(f=>f.artistId===t.id)?'Ese artista ya participa en esta obra.':existing.reduce((n,f)=>n+f.masterShare,0)+q.masterShare>.45000001?'Los invitados superarían el 45% de esta grabación.':!['personal','label'].includes(q.payer)||q.payer==='label'&&!soleLabelOwner(s)?'Selecciona una cuenta propia disponible.':!q.affordable?'La caja disponible no cubre el caché.':null;q.canSign=!q.reason;return q;
  }
  function collaborationPay(s,amount,label,payer='personal') {
    if(!['personal','label'].includes(payer))return false;
    if(payer==='personal')return pay(s,label,amount,'promotion');
    if(!soleLabelOwner(s)||managedSpendable(s,'label')+.001<amount)return false;
    labelLedger(s,label,-amount,'promotion');return true;
  }
  function receiveFeatureFee(s,a,amount,kind='featureFees') {
    a.cash=money(a.cash+amount);a.stats[kind]=money(finite(a.stats[kind])+amount);
    managementRecord(s,a,{[kind]:amount});
    a.history.push({week:s.week,day:s.calendar.day,action:kind==='boostFees'?'paid-post':'feature-fee',amount});if(a.history.length>24)a.history.shift();
  }
  function creditFeatureShare(s,f,amount) {
    f.artistEarned=money(f.artistEarned+amount);
    if(!f.managedArtistId||amount<=0)return;
    const a=s.management.artists.find(a=>a.id===f.managedArtistId);
    if(!a)throw new Error('La cuenta del colaborador de tu roster no está disponible.');
    const split=ownLabelSplit(s,f.guestLabelTerms,money(amount)),net=split.net;
    // A guest's licence is paid once. The host cannot collect a second personal
    // management commission on the same guest share of their own recording.
    f.guestNet=money(finite(f.guestNet)+net);f.guestLabelEarned=money(finite(f.guestLabelEarned)+split.label);
    a.stats.featureEarned=money(finite(a.stats.featureEarned)+amount);a.stats.gross=money(a.stats.gross+amount);a.stats.artistNet=money(a.stats.artistNet+net);a.stats.labelEarned=money(a.stats.labelEarned+split.label);
    if(net>0){const r=a.receivables.find(r=>r.week===s.week);if(r)r.amount=money(r.amount+net);else a.receivables.push({week:s.week,dueWeek:s.week+4,amount:net});}
    managementRecord(s,a,{grossRevenue:amount,featureRevenue:amount,artistAccrued:net,labelAccrued:split.label});
  }
  function featureAction(s,p) {
    const q=featureQuote(s,p);if(!q.ok)return q;
    if(s.player.fame<q.minFame)return{ok:false,message:'Este artista requiere fama '+q.minFame+'.'};
    let o=q.offerId?s.featureOffers.find(o=>o.id===q.offerId):null;
    if(p.decision==='reject'){if(!o){if(q.managedArtistId)return{ok:true,message:'No se ha contratado esta colaboración.'};o={...copy(find(catalog.features,q.artistId)),id:uid(s,'feature-offer'),artistId:q.artistId,offeredWeek:s.week,expiresWeek:s.week+6,status:'open'};s.featureOffers.push(o);}o.status='rejected';return{ok:true,message:'Colaboración rechazada.'};}
    if(p.decision&&p.decision!=='accept')return{ok:false,message:'Selecciona aceptar o rechazar la colaboración.'};
    if(q.audienceModel==='global-v1'&&!q.canSign)return{ok:false,message:q.reason};
    const project=p.projectId?find(s.projects,p.projectId):s.projects.find(p=>['working','ready'].includes(p.status));
    if(!project||!['working','ready'].includes(project.status))return{ok:false,message:'Crea un proyecto sin publicar para asociar esta colaboración.'};
    if(q.formatId==='remix'&&!['single','deluxe'].includes(project.type))return{ok:false,message:'El remix requiere un proyecto nuevo de sencillo o deluxe.'};
    const existing=s.features.filter(f=>f.projectId===project.id);
    if(existing.some(f=>f.artistId===q.artistId))return{ok:false,message:'Este artista ya colabora en ese proyecto.'};
    if(existing.reduce((n,f)=>n+f.masterShare,0)+q.masterShare>.45000001)return{ok:false,message:'La suma de participaciones de colaboradores no puede superar el 45% de esta grabación.'};
    const payer=p.payer||'personal';if(!['personal','label'].includes(payer))return{ok:false,message:'Elige caja personal o del sello.'};
    if(payer==='label'){if(!soleLabelOwner(s)||managedSpendable(s,'label')+.001<q.fee)return{ok:false,message:'La caja disponible de tu sello no cubre el caché.'};labelLedger(s,'Caché feature · '+q.name,-q.fee,'feature');}
    else if(!pay(s,'Caché feature · '+q.name,q.fee,'feature'))return{ok:false,message:'Caja insuficiente para el caché de esta colaboración.'};
    const a=q.managedArtistId?s.management.artists.find(a=>a.id===q.managedArtistId):null;if(a)receiveFeatureFee(s,a,q.fee);
    if(!o&&!a){o={...copy(find(catalog.features,q.artistId)),id:uid(s,'feature-offer'),artistId:q.artistId,offeredWeek:s.week,expiresWeek:s.week+6,status:'open'};s.featureOffers.push(o);}
    const terms=a?labelTerms(s,a.id):null,f={id:uid(s,'feature'),artistId:q.artistId,name:q.name,projectId:project.id,releaseId:null,fee:q.fee,masterShare:q.masterShare,audience:q.audience,durationPromoWeeks:q.durationPromoWeeks,startedWeek:null,promoEndsWeek:null,lastPromoWeek:null,promoPending:true,status:'awaiting-release',acceptedWeek:s.week,artistEarned:0,exposureStreams:0,formatId:q.formatId,formatName:q.formatName,payer,...(a?{managedArtistId:a.id,guestNet:0,guestLabelEarned:0,...(terms?{guestLabelTerms:copy(terms)}:{})}:{})};
    if(q.audienceModel==='global-v1')Object.assign(f,{audienceModel:q.audienceModel,promotionModel:q.promotionModel,monthlyListeners:q.monthlyListeners,promoAudience:q.promoAudience});
    s.features.push(f);if(o)o.status='accepted';project.featureIds=(project.featureIds||[]).concat(f.id);
    history(s,'Colaboración · '+q.name,q.formatName+' en '+project.name+': caché $'+q.fee.toLocaleString('es-CO')+', '+(q.masterShare*100).toLocaleString('es-CO')+'% de esta grabación y '+q.durationPromoWeeks+' semanas de promoción.','deal');
    return{ok:true,message:'Colaboración asociada a '+project.name+'. No se han añadido fans automáticamente.'};
  }
  function boostMarketingModel(){return root.RapMarketingModel||(typeof require==='function'?require('./marketing-model.js'):null);}
  function boostProjection(s,p){
    const m=boostMarketingModel(),days=p.duration*7,daily=p.budget/days,initial=m.purchaseReach(s,{actorId:p.targetArtistId,scope:p.scope,spend:0,commit:false}),steps=Math.min(days,365),decay=Math.pow(2,-1/m.HALF_LIFE_DAYS);let prior=initial.priorSpend,contactStock=initial.priorContacts,impressions=0,contacts=0;
    for(let i=0;i<steps;i++){const q=m.marginal({budget:daily,priorSpend:prior,priorContacts:contactStock,population:p.advertisingPopulation,days:1,cpm:p.deliveryCpm,quality:p.creativeQuality,fit:p.fit});impressions+=q.impressions;contacts+=q.unique;prior=m.stock({stock:prior,added:daily});contactStock+=q.impressions;if(i<days-1){prior=m.stock({stock:prior,elapsedDays:1});contactStock*=decay;}}
    if(days>steps){const equilibrium=daily/(Math.pow(2,1/m.HALF_LIFE_DAYS)-1),terms={budget:daily,priorSpend:equilibrium,population:p.advertisingPopulation,days:1,cpm:p.deliveryCpm,quality:p.creativeQuality,fit:p.fit},steady=m.marginal(terms),q=m.marginal({...terms,priorContacts:steady.impressions*decay/(1-decay)});impressions+=q.impressions*(days-steps);contacts+=q.unique*(days-steps);}
    const unique=p.advertisingPopulation*(-Math.expm1(-contacts/p.advertisingPopulation));return{estimatedReach:Math.floor(impressions),estimatedUniqueReach:Math.floor(unique),estimatedFrequency:unique>0?impressions/unique:0,projectionApproximate:days>steps};
  }
  function boostQuote(s,p={}) {
    if(s.financialHold)return{ok:false,message:'La carrera requiere conciliación antes de contratar.'};
    if(p.payer!==undefined&&!['personal','label'].includes(p.payer))return{ok:false,message:'Elige caja personal o del sello.'};
    const t=collaborationArtist(s,p),channel=find(catalog.boostChannels,p.channel||'feed'),duration=Number(p.duration??1),targetArtistId=p.targetArtistId||'player',a=targetArtistId==='player'?null:s.management?.artists.find(a=>a.id===targetArtistId);
    if(!t||!channel)return{ok:false,message:'Selecciona un promotor y un canal disponibles.'};
    const m=boostMarketingModel();if(!m?.validDuration(s,duration))return{ok:false,message:'Elige semanas enteras positivas con una fecha representable hasta el año 9999; es un límite técnico del calendario.'};
    if(targetArtistId!=='player'&&(!a||!managedActive(s,a)))return{ok:false,message:'Elige una carrera artística que puedas promocionar.'};
    const target=p.target||'career',release=target==='release'?(a?a.releases:s.releases).find(r=>r.id===p.releaseId):null;
    if(!['career','release'].includes(target)||target==='release'&&(!release||release.canonical))return{ok:false,message:'Selecciona una obra publicada de la carrera elegida.'};
    const scope=p.scope||'latam',pool=m.poolInfo(s,{actorId:targetArtistId,scope});if(!pool.allowed)return{ok:false,message:pool.reason};
    const artistFee=money(Math.max(50,t.fee*.22*channel.feeFactor)*duration),budget=Number(p.budget??artistFee);
    if(!Number.isFinite(budget)||money(budget)!==budget||budget<artistFee||!Number.isSafeInteger(Math.round(budget*100))||!Number.isSafeInteger(Math.round(artistFee*100)))return{ok:false,message:'Presupuesto desde $'+artistFee.toLocaleString('es-CO')+', en centavos representables. No hay un máximo monetario de diseño.',minimum:artistFee};
    const mediaBudget=money(budget-artistFee),recent=(s.boostPosts||[]).filter(b=>b.artistId===t.id&&b.targetArtistId===targetArtistId&&s.calendar.day-b.startedDay<84).length,priorContactStock=m.purchaseReach(s,{actorId:targetArtistId,scope,spend:0,commit:false}).priorContacts,fatigue=Math.exp(-priorContactStock/pool.population),quality=clamp(release?.quality??a?.quality??Math.max(30,(s.player.skills.flow+s.player.skills.writing)/2),0,100)/100,fit=genreId(t.style)===genreId(a?.style||s.player.style)?1:.75,business=clamp(s.player.skills.business,0,100)/100,mediaCpm=4+(1-business)*4+(channel.id==='video'?2:0),rawImpressions=mediaBudget/mediaCpm*1000+t.audience*channel.reach*duration,deliveryCpm=budget/Math.max(.000001,rawImpressions)*1000;
    const q={ok:true,promotionModel:'open-budget-v1',artistId:t.id,...(t.managedArtistId?{managedArtistId:t.managedArtistId}:{}),name:t.name,channel:channel.id,channelName:channel.name,duration,target,targetArtistId,targetName:a?.name||s.player.name,...(release?{releaseId:release.id,releaseName:release.name}:{}),budget:money(budget),artistFee,mediaBudget,mediaCpm,deliveryCpm,creativeQuality:(.5+quality*.5),fit,fanConversionRate:.003*quality,listeningConversionRate:.04*quality,existingFanShare:clamp((a?.fans??s.player.fans)/pool.population,0,1),scope,advertisingPopulation:pool.population,marketLabel:pool.label,fatigue,recentPosts:recent,payer:p.payer||'personal'};
    if(t.audienceModel==='global-v1')Object.assign(q,{audienceModel:t.audienceModel,monthlyListeners:t.monthlyListeners,promoAudience:t.promoAudience});Object.assign(q,boostProjection(s,q));
    q.availableBudget=q.payer==='label'&&soleLabelOwner(s)?managedSpendable(s,'label'):q.payer==='personal'?managedSpendable(s,'personal'):0;q.affordable=q.availableBudget+.001>=q.budget;q.reason=s.activeWeek&&!hourly(s)?'Espera al cierre semanal para contratar.':q.payer==='label'&&!soleLabelOwner(s)?'Selecciona una cuenta propia disponible.':!q.affordable?'La cuenta pagadora no cubre este presupuesto después de reservas.':null;q.canBuy=!q.reason;return q;
  }
  function boostPostAction(s,p) {
    const q=boostQuote(s,p);if(!q.ok)return q;
    if(!q.canBuy)return{ok:false,message:q.reason};
    if(!collaborationPay(s,q.budget,'Post pagado · '+q.name+' · '+q.channelName,q.payer))return{ok:false,message:'La cuenta pagadora no tiene caja disponible para esta campaña.'};
    if(q.managedArtistId){const a=s.management.artists.find(a=>a.id===q.managedArtistId);receiveFeatureFee(s,a,q.artistFee,'boostFees');}
    const id=uid(s,'boost-post'),b={...q,id,status:'active',startedWeek:s.week,startedDay:s.calendar.day,endsDay:s.calendar.day+q.duration*7,lastProcessedDay:null,daysProcessed:0,reach:0,listeningInterest:0,fansGained:0,fanRemainder:0,rng:hashSeed(id+':'+s.rng)};delete b.ok;delete b.reason;delete b.canBuy;delete b.affordable;
    Object.assign(b,{impressionsFloat:0,uniqueContacts:0,uniqueReach:0});if(!s.boostPosts)s.boostPosts=[];s.boostPosts.push(b);history(s,'Promoción adicional · '+q.name,q.channelName+' para '+q.targetName+': $'+q.budget.toLocaleString('es-CO')+' pagados una vez; caché $'+q.artistFee.toLocaleString('es-CO')+' y medios $'+q.mediaBudget.toLocaleString('es-CO')+'. No modifica el contrato musical.','campaign');
    return{ok:true,message:'Post pagado contratado. Es independiente de la promoción pactada y no garantiza ventas.'};
  }
  function processPaidBoosts(s,report) {
    for(const b of s.boostPosts||[]){
      if(b.status!=='active'||s.calendar.day<b.startedDay||s.calendar.day>=b.endsDay||b.lastProcessedDay===s.calendar.day)continue;
      if(b.promotionModel==='open-budget-v1'){
        const exposure=boostMarketingModel().purchaseReach(s,{actorId:b.targetArtistId,scope:b.scope,spend:b.budget/(b.duration*7),pool:b.advertisingPopulation,days:1,cpm:b.deliveryCpm,quality:b.creativeQuality,fit:b.fit,commit:true});
        b.impressionsFloat+=exposure.impressions;b.reach=Math.floor(b.impressionsFloat);b.uniqueContacts+=exposure.unique;b.uniqueReach=b.advertisingPopulation*(-Math.expm1(-b.uniqueContacts/b.advertisingPopulation));
        b.lastProcessedDay=s.calendar.day;b.daysProcessed++;b.dailyInterest=b.target==='release'?Math.floor(exposure.unique*b.listeningConversionRate):0;b.listeningInterest+=b.dailyInterest;
        if(b.target==='career'){const a=b.targetArtistId==='player'?null:s.management.artists.find(a=>a.id===b.targetArtistId),unconverted=Math.max(0,1-(a?.fans??s.player.fans)/b.advertisingPopulation),raw=exposure.unique*b.fanConversionRate*unconverted+b.fanRemainder,gain=Math.floor(raw);b.fanRemainder=raw-gain;if(a){const old=a.fans;a.fans=Math.min(45000000,a.fans+gain);const realized=a.fans-old;b.fansGained+=realized;boostMarketingModel().publicityFame(s,{actorId:a.id,gain:realized});}else{const old=s.player.fans;fanGain(s,gain);const realized=s.player.fans-old;b.fansGained+=realized;boostMarketingModel().publicityFame(s,{actorId:'player',gain:realized});}}
        if(b.daysProcessed>=b.duration*7){b.status='completed';if(report)report.highlights.push('Terminó el post pagado de '+b.name+': '+b.reach.toLocaleString('es-CO')+' impresiones simuladas.');}continue;
      }
      let x=b.rng;x^=x<<13;x^=x>>>17;x^=x<<5;b.rng=x>>>0;
      const rawReach=Math.max(0,Math.round(b.estimatedReach/(b.duration*7)*(.75+b.rng/4294967296*.5))),reach=b.audienceModel==='global-v1'?Math.min(rawReach,Math.max(0,b.reachCap-b.reach)):rawReach;b.reach+=reach;b.lastProcessedDay=s.calendar.day;b.daysProcessed++;
      b.dailyInterest=b.target==='release'?Math.round(reach*.14):0;b.listeningInterest+=b.dailyInterest;
      if(b.target==='career'){const a=b.targetArtistId==='player'?null:s.management.artists.find(a=>a.id===b.targetArtistId),raw=reach*(b.audienceModel==='global-v1'?b.fanConversionRate:.012)+b.fanRemainder,whole=Math.floor(raw),gain=b.audienceModel==='global-v1'?Math.min(whole,Math.max(0,b.fanGainCap-b.fansGained)):whole;b.fanRemainder=raw-whole;if(a){const old=a.fans;a.fans=Math.min(45000000,a.fans+gain);b.fansGained+=a.fans-old;a.fame=money(clamp(a.fame+Math.sqrt(gain)/1000,0,100));}else{const old=s.player.fans;fanGain(s,gain);b.fansGained+=s.player.fans-old;s.player.fame=money(clamp(s.player.fame+Math.sqrt(gain)/1000,0,100));}}
      if(b.daysProcessed>=b.duration*7){b.status='completed';if(report)report.highlights.push('Terminó el post pagado de '+b.name+': '+b.reach.toLocaleString('es-CO')+' impresiones simuladas.');}
    }
  }
  function paidBoostExposure(s,r,targetArtistId='player'){return(s.boostPosts||[]).filter(b=>b.target==='release'&&b.targetArtistId===targetArtistId&&b.releaseId===r.id&&b.lastProcessedDay===s.calendar.day).reduce((n,b)=>n+finite(b.dailyInterest),0);}
  function collaborationMarket(s){return{artists:catalog.features.map(a=>({...copy(a),source:'external',style:a.style||'Hip hop',country:a.country||'LATAM'})).concat((s.management?.artists||[]).filter(a=>managedActive(s,a)).map(a=>collaborationArtist(s,{managedArtistId:a.id}))),formats:copy(catalog.collaborationFormats),channels:copy(catalog.boostChannels),boostPosts:copy(s.boostPosts||[])};}
  function validateCollaborations(s){
    const errors=[],bad=message=>errors.push(message),client=id=>(s.management?.artists||[]).find(a=>a?.id===id);
    for(const f of s.features||[]){
      if(!f)continue;
      if(f.formatId!==undefined&&!find(catalog.collaborationFormats,f.formatId)||f.payer!==undefined&&!['personal','label'].includes(f.payer))bad('Formato o pagador de colaboración inválido.');
      const profile=find(catalog.features,f.artistId),global=profile?.audienceModel==='global-v1';
      if(global){
        if(f.audienceModel!=='global-v1'||f.monthlyListeners!==profile.monthlyListeners||f.promoAudience!==f.audience||f.promoAudience>f.monthlyListeners)bad('Métricas de campaña global inválidas.');
        if(f.promotionModel==='open-budget-v1'){if(f.campaignExposureCap!==undefined)bad('Una campaña continua no tiene techo fijo de exposición.');}
        else if(f.promotionModel!==undefined||!Number.isFinite(f.campaignExposureCap)||f.campaignExposureCap!==Math.floor(f.audience*.25)||f.exposureStreams>f.campaignExposureCap)bad('Modelo o techo de campaña anterior inválido.');
      }else if(f.audienceModel!==undefined||f.promotionModel!==undefined)bad('Modelo de colaboración desconocido.');
      if(f.managedArtistId){if(!client(f.managedArtistId)||['guestNet','guestLabelEarned'].some(k=>!Number.isFinite(f[k])||f[k]<0)||Math.abs(f.artistEarned-f.guestNet-f.guestLabelEarned)>.03)bad('Reparto de colaboración de roster inválido.');}
      if(f.guestLabelTerms){const t=f.guestLabelTerms,c=s.label?.contracts?.find(c=>c.id===t.contractId);if(!f.managedArtistId||!c||t.labelId!==s.label.id||t.artistId!==f.managedArtistId||c.artistId!==f.managedArtistId||t.share!==c.share||t.startedWeek!==c.startedWeek||t.endsWeek!==c.endsWeek||t.mastersRetained!==true)bad('Licencia del invitado de roster inválida.');}
    }
    if(s.boostPosts===undefined)return errors;
    if(!Array.isArray(s.boostPosts)){bad('Registro de posts pagados inválido.');return errors;}
    const ids=new Set();let active=0;
    for(const b of s.boostPosts){
      if(!b||typeof b.id!=='string'||ids.has(b.id)){bad('Post pagado duplicado o inválido.');continue;}ids.add(b.id);
      const actor=b.managedArtistId?client(b.managedArtistId):find(catalog.features,b.artistId),target=b.targetArtistId==='player'?s:client(b.targetArtistId),releases=b.targetArtistId==='player'?s.releases:target?.releases;
      const global=actor?.audienceModel==='global-v1',open=b.promotionModel==='open-budget-v1';
      if(!actor||b.managedArtistId&&b.artistId!==b.managedArtistId||!target||!find(catalog.boostChannels,b.channel)||!['career','release'].includes(b.target)||b.target==='release'&&!releases?.some(r=>r.id===b.releaseId)||!['personal','label'].includes(b.payer)||!['active','completed'].includes(b.status)||!Number.isInteger(b.duration)||b.duration<1||!open&&b.duration>4||!Number.isInteger(b.startedDay)||b.startedDay<0||b.startedDay>s.calendar.day||b.endsDay!==b.startedDay+b.duration*7||b.startedWeek!==Math.floor(b.startedDay/7)+1||!Number.isInteger(b.daysProcessed)||b.daysProcessed<0||b.daysProcessed>b.duration*7||b.lastProcessedDay!==null&&(!Number.isInteger(b.lastProcessedDay)||b.lastProcessedDay<b.startedDay||b.lastProcessedDay>=b.endsDay||b.lastProcessedDay>s.calendar.day)||['budget','artistFee','mediaBudget','estimatedReach','reach','listeningInterest','fansGained','fanRemainder','fatigue'].some(k=>!Number.isFinite(b[k])||b[k]<0)||Math.abs(b.budget-b.artistFee-b.mediaBudget)>.011||!open&&b.budget>(global?actor.boostBudgetCap:5000000)||b.artistFee<50||b.fanRemainder>=1||b.fatigue>1||!Number.isInteger(b.rng)||b.rng<0||b.rng>4294967295)bad('Condiciones o resultados de post pagado inválidos.');
      if(open){if(!boostMarketingModel().validDuration({...s,calendar:{...s.calendar,day:b.startedDay}},b.duration)||!['country','latam','usa'].includes(b.scope)||['advertisingPopulation','deliveryCpm','mediaCpm'].some(k=>!Number.isFinite(b[k])||b[k]<=0)||['impressionsFloat','uniqueContacts','uniqueReach','creativeQuality','fit','fanConversionRate','listeningConversionRate'].some(k=>!Number.isFinite(b[k])||b[k]<0)||b.creativeQuality>1||b.fit>1||b.fanConversionRate>.003||b.listeningConversionRate>.04||b.uniqueReach>b.advertisingPopulation+.01||b.uniqueReach>b.impressionsFloat+.01||b.uniqueContacts+.01<b.uniqueReach||b.reach!==Math.floor(b.impressionsFloat)||!Number.isSafeInteger(Math.round(b.budget*100))||b.maximumBudget!==undefined||b.reachCap!==undefined||b.fanGainCap!==undefined||global&&(b.audienceModel!=='global-v1'||b.monthlyListeners!==actor.monthlyListeners||b.promoAudience!==actor.promoAudience))bad('Métricas o entrega de promoción continua inválidas.');}
      else if(global&&(b.audienceModel!=='global-v1'||b.monthlyListeners!==actor.monthlyListeners||b.promoAudience!==actor.promoAudience||b.maximumBudget!==money(Math.min(actor.boostBudgetCap,b.artistFee*20))||b.budget>b.maximumBudget||b.reachCap!==Math.floor(Math.min(actor.monthlyListeners*.2,actor.promoAudience*2)*b.fatigue)||b.fanGainCap!==Math.floor(actor.monthlyListeners*.0005*b.fatigue)||b.fanConversionRate!==.003||b.estimatedReach>Math.floor(b.reachCap/1.25)||b.reach>b.reachCap||b.fansGained>b.fanGainCap)||!global&&b.audienceModel!==undefined||b.promotionModel!==undefined)bad('Límites o métricas de post anterior inválidos.');
      if(b.status==='active'&&!open)active++;
      if(b.status==='completed'&&b.daysProcessed!==b.duration*7)bad('Post completado antes de tiempo.');
    }
    if(active>4)bad('Demasiados posts pagados activos.');return errors;
  }

  // Preserve the old single campaign as a labelled legacy film, without posting
  // its historical cash flow again or inventing details of an old concert.
  function ensurePpv(s) {
    if (s.ppvShows === undefined) s.ppvShows = [];
    if (s.ppvFilms === undefined) s.ppvFilms = [];
    if (s.ppvCampaigns === undefined) s.ppvCampaigns = [];
    if (!Array.isArray(s.ppvShows) || !Array.isArray(s.ppvFilms) || !Array.isArray(s.ppvCampaigns)) return;
    const c = s.adsCampaign;
    if (!c || c.status === 'available' || c.filmId) return;
    const filmId = 'ppv-legacy-film';
    s.ppvFilms.push({ id: filmId, name: 'Película PPV anterior', showId: null, showName: 'Concierto anterior · detalle no conservado', createdWeek: c.startedWeek ?? null, price: finite(c.price,49), sales: Number.isFinite(c.ppvSales) ? c.ppvSales : null, revenue: Number.isFinite(c.revenue) ? c.revenue : null, adSpend: Number.isFinite(c.spent) ? c.spent : null, legacy: true });
    c.filmId = filmId;
    c.campaignId = 'ppv-legacy-campaign';
    if (!c.active) s.ppvCampaigns.push(copy(c));
  }
  function ppvMarketingSystem(){return root.RapPpvMarketing||(typeof require==='function'?require('./ppv-marketing.js'):null);}
  function ppvMarketingHooks(){return{
    ensureLegacy:ensurePpv,spendable:taxSpendable,pay,uid,text,history,fanGain,
    release:(s,p,report)=>releaseProject(s,p,report,true),
    settle:(s,c,film,sales)=>{
      const gross=money(sales*c.price),platformFee=money(gross*.15),partner=activeContracts(s).find(contract=>Number.isFinite(contract.ppvShare)&&contract.ppvShare>0),partnerShare=money((gross-platformFee)*clamp(partner?.ppvShare||0,0,1));
      if(gross>0)ledger(s,(c.organic?'PPV · longtail orgánico · ':'PPV · ventas de acceso · ')+film.name,gross,'ppv');
      if(platformFee>0)ledger(s,'Plataforma PPV · 15% · '+film.name,-platformFee,'ppv');
      if(partnerShare>0){ledger(s,'Participación de socio · PPV',-partnerShare,'ppv');partner.partnerEarned=money(finite(partner.partnerEarned)+partnerShare);}
      c.partnerShare=money(finite(c.partnerShare)+partnerShare);c.revenue=money(c.revenue+gross-platformFee-partnerShare);c.ppvSales+=sales;s.stats.totalPPV+=sales;
      if(Number.isFinite(film.sales))film.sales+=sales;if(Number.isFinite(film.revenue))film.revenue=money(film.revenue+gross-platformFee-partnerShare);
      return{gross,platformFee,partnerShare};
    }
  };}
  function ppvMarketingSummary(s){return ppvMarketingSystem().summary(s,ppvMarketingHooks());}
  function ppvCampaignQuote(s,p={}){return ppvMarketingSystem().quote(s,p,ppvMarketingHooks());}
  function prepaidDistribution(s,projectId,artistId='player'){return albumSystem().prepaid(s,projectId,artistId)||artistId==='player'&&ppvMarketingSystem().prepaid(s,projectId);}
  function actCore(s, type, payload = {}) {
    if (!s || typeof s !== 'object' || !s.player) return { ok: false, message: 'Partida inválida.' };
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};
    const id = payload.id || payload.actionId;
    const mediaControl=type==='marketing'&&['pause','resume','cancel'].includes(payload.decision)||type==='campaign'&&payload.decision==='cancel';
    if (s.activeWeek && !hourly(s) && type !== 'customize'&&!mediaControl) return { ok: false, message: 'La semana está en marcha: la agenda está cerrada hasta el informe del domingo. Puedes pausar el reloj, editar la apariencia y controlar publicidad ya autorizada.' };
    if (type === 'reconcile') return reconcile(s, payload);
    if (s.financialHold && !['plan', 'unplan', 'customize', 'book'].includes(type)) return { ok: false, message: 'Archivo S914: esta operación necesita caja y atributos conciliados. Planificar no mueve dinero ni avanza tiempo.' };
    if (type === 'careerArc') return arcSystem()?.act(s, payload) || { ok: false, message: 'Capítulos no disponibles.' };
    if (type === 'commitment') return commitmentSystem()?.act(s, payload) || { ok: false, message: 'Compromisos no disponibles.' };
    if(type==='albumCampaign'||type==='musicVideo')return albumSystem().act(s,type,payload,albumHooks());
    if(type==='marketing')return marketingSystem().act(s,payload,marketingHooks());
    if(type==='tax'){if(payload.account==='label'&&!soleLabelOwner(s))return{ok:false,message:'No puedes disponer de la caja de otros propietarios para cambiar reservas o pagos.'};if(payload.decision==='reserve'&&Number(payload.amount)>marketingSpendable(s,payload.account||'personal')+.001)return{ok:false,message:'Ese dinero ya está apartado para impuestos o difusión. Libera primero una reserva publicitaria para apartarlo de nuevo.'};return taxSystem().act(s,payload,(account,label,amount,category)=>taxWrite(s,account,label,amount,category));}
    if (type === 'livingBudget') {
      if (!['basic','automatic'].includes(payload.mode)) return {ok:false,message:'Elige presupuesto básico o automático.'};
      s.livingBudget={mode:payload.mode,chosenWeek:s.week};
      return {ok:true,message:payload.mode==='basic'?'Presupuesto básico elegido: la fama no elevará tus gastos personales. Ciudad, vivienda propia, contable y aportes de apoyo siguen contando.':'Presupuesto automático elegido: los gastos personales seguirán la fama y la vivienda. El cambio se aplica al próximo cierre.'};
    }
    if (type === 'employment') {
      if(payload.decision==='accept') {
        const job=find(catalog.jobs,payload.id);
        if(!job) return {ok:false,message:'Elige un empleo disponible.'};
        if(s.employment?.status==='active') return {ok:false,message:'Deja tu empleo actual antes de aceptar otro.'};
        if(s.plan.some(item=>item.id==='employment_shift')) return {ok:false,message:'Retira primero los turnos de la agenda.'};
        if(s.employment) { s.employmentHistory=Array.isArray(s.employmentHistory)?s.employmentHistory.slice(-49):[]; s.employmentHistory.push(copy(s.employment)); }
        s.employment={id:job.id,status:'active',startedWeek:s.week,shiftsCompleted:0,totalEarned:0};
        return {ok:true,message:'Empleo aceptado. Elige tus turnos cada semana; no se reserva ninguno automáticamente.'};
      }
      if(payload.decision==='leave') {
        if(s.employment?.status!=='active') return {ok:false,message:'No tienes empleo activo.'};
        if(s.plan.some(item=>item.id==='employment_shift')) return {ok:false,message:'Retira primero los turnos programados.'};
        s.employment.status='resigned';s.employment.endedWeek=s.week;
        return {ok:true,message:'Dejaste el empleo. Los turnos no realizados no se pagan.'};
      }
      return {ok:false,message:'Elige aceptar o dejar el empleo.'};
    }
    if (type === 'delegation') {
      const current = s.delegation || { enabled:false, marketing:false, production:false, business:false, weeklyBudget:0, reserve:1000, log:[] };
      const next = { ...current };
      if (payload.enabled !== undefined) { if(typeof payload.enabled !== 'boolean') return {ok:false,message:'Autorización inválida.'}; next.enabled=payload.enabled; }
      for (const key of ['marketing','production','business']) if(payload[key] !== undefined) { if(typeof payload[key] !== 'boolean') return {ok:false,message:'Encargo inválido.'}; next[key]=payload[key]; }
      for (const key of ['weeklyBudget','reserve']) if(payload[key] !== undefined) { const n=Number(payload[key]); if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*100))||money(n)!==n) return {ok:false,message:'Introduce un importe no negativo con centavos representables.'}; next[key]=money(n); }
      if(payload.businessAssetId !== undefined) { const target=payload.businessAssetId===null?null:s.assets.find(a=>a.id===payload.businessAssetId && find(catalog.investments,a.catalogId)?.category==='negocio'); if(payload.businessAssetId!==null&&!target) return {ok:false,message:'Elige un negocio propio para delegar.'}; next.businessAssetId=target?.id||null; }
      next.log=Array.isArray(current.log)?current.log.slice(-51):[]; s.delegation=next;
      return {ok:true,message:next.enabled?'Autorización actualizada; el equipo respetará tus límites.':'Automatización desactivada.'};
    }
    if (type === 'businessOperation') {
      const asset=s.assets.find(a=>a.id===payload.assetId), template=asset&&find(catalog.investments,asset.catalogId);
      if(!asset||template?.category!=='negocio') return {ok:false,message:'Elige un negocio propio.'};
      if(!['cautious','standard','growth','paused'].includes(payload.mode)) return {ok:false,message:'Estrategia de negocio inválida.'};
      asset.operationMode=payload.mode;
      return {ok:true,message:payload.mode==='paused'?'Negocio en pausa: sin ventas y con el 35% del mantenimiento base. La depreciación continúa.':'Estrategia aplicada desde el próximo cierre semanal.'};
    }
    if(type==='assetOperation') {
      const asset=s.assets.find(a=>a.id===payload.assetId),template=asset&&find(catalog.investments,asset.catalogId);
      if(!isVehicle(template))return {ok:false,message:'Elige un vehículo propio.'};
      if(!['active','garaged'].includes(payload.mode))return {ok:false,message:'Elige usar el vehículo o guardarlo.'};
      asset.vehicleMode=payload.mode;
      return {ok:true,message:payload.mode==='garaged'?'Vehículo en garaje: sin apoyo de gira; mantenimiento al 30% y depreciación al 60% de la base. Si lo usaste esta semana, sus costes completos se cierran el domingo.':'Vehículo disponible para trabajar. El mantenimiento y la depreciación vuelven a su base.'};
    }
    if (type === 'businessOpportunity') {
      const asset=s.assets.find(a=>a.id===payload.assetId), offer=asset?.businessOpportunity;
      if(!asset||find(catalog.investments,asset.catalogId)?.category!=='negocio'||!offer||offer.status!=='open'||s.week>offer.expiresWeek) return {ok:false,message:'Esta oportunidad ya no está disponible.'};
      if(!['invest','decline'].includes(payload.decision)) return {ok:false,message:'Elige invertir o rechazar.'};
      if(payload.decision==='invest') {
        if(asset.operationMode==='paused')return {ok:false,message:'Reabre el negocio antes de invertir en esta oportunidad.'};
        if(Math.max(finite(asset.businessBoostUntil),finite(asset.businessMaintenanceUntil))>=s.week)return {ok:false,message:'Ya hay una mejora activa en este negocio. Espera a su último cierre antes de comprar otra.'};
        if(!pay(s,'Mejora del negocio · '+asset.name,offer.cost,'business')) return {ok:false,message:'Caja insuficiente para esta mejora.'};
        asset.totalExpenses=money(finite(asset.totalExpenses)+offer.cost);
        asset.pendingOperatingCosts=money(finite(asset.pendingOperatingCosts)+offer.cost);
        const duration=Number.isInteger(offer.duration)?clamp(offer.duration,1,8):4,boost=Number.isFinite(offer.boost)?clamp(offer.boost,1,1.5):1.2;
        if(offer.kind==='efficiency') {
          asset.businessMaintenanceUntil=s.week+duration-1;asset.businessMaintenanceSaving=clamp(finite(offer.saving,.15),0,.25);offer.status='accepted';
          return {ok:true,message:'Convenio pagado: mantenimiento reducido '+Math.round(asset.businessMaintenanceSaving*100)+'% durante '+duration+' cierres. No aumenta el valor de reventa.'};
        }
        asset.businessBoostUntil=s.week+duration-1; asset.businessBoostRate=boost; offer.status='accepted';
        return {ok:true,message:'Mejora pagada. La demanda estimada sube '+Math.round((boost-1)*100)+'% durante '+duration+' cierres.'};
      }
      offer.status='declined'; return {ok:true,message:'Oportunidad rechazada sin coste.'};
    }
    if(type==='careerRole'){const role=payload.role;if(!careerRoles.includes(role))return{ok:false,message:'Elige artista, mánager o ambos.'};if(s.plan.length)return{ok:false,message:'Vacía la agenda antes de cambiar de rol.'};ensureManagement(s);s.management.role=role;return{ok:true,message:'Rol actualizado. Los contratos y cobros pendientes continúan.'};}
    if(type==='management'){const result=managementAction(s,payload);if(result.ok)compactManagementTracking(s);return result;}
    if(type==='label'){const result=labelAction(s,payload);if(result.ok)compactManagementTracking(s);return result;}
    if(s.management?.role==='manager'&&['project','book','feature','band'].includes(type))return{ok:false,message:'Activa el rol artista o ambos para dirigir tu carrera musical propia.'};
    if(type==='band'){const bands=bandSystem();if(!bands)return{ok:false,message:'El sistema de bandas no está disponible.'};return bands.act(s,payload,{plan:(action,data)=>hourly(s)?dailySystem().act(s,{...data,decision:'schedule',actionId:action},{prepare:prepareAgendaItem}):planItem(s,action,data,true),history:(title,message,kind)=>history(s,title,message,kind)});}
    if(type==='catalogOffer'){const result=catalogAction(s,payload);if(result.ok)compactManagementTracking(s);return result;}
    if (type === 'expand') {
      const criteria = unlockCriteria(s);
      if (!criteria.unlocked) return { ok: false, message: 'USA continúa bloqueado. Completa todos los objetivos hard de LATAM.' };
      s.progression.usaUnlocked = true; s.progression.victoryStatus = 'completed'; s.progression.region = 'latam+usa';
      history(s, 'Puerta internacional abierta', 'Completaste las condiciones hard de LATAM y habilitaste el mercado USA.', 'career');
      return { ok: true, message: 'Mercado USA habilitado por tus logros hard.' };
    }
    if (type === 'video') return planItem(s, 'video', payload);
    if (type === 'foundLabel') {
      if (s.label) return { ok: false, message: 'Ya tienes un sello propio.' };
      if (s.player.reputation < 25 || s.stats.totalIncome < 5000) return { ok: false, message: 'Fundar un sello exige reputación 25 e ingresos cobrados acumulados de $5.000.' };
      if (!pay(s, 'Constitución y registro del sello', 2500, 'business')) return { ok: false, message: 'Necesitas $2.500 de caja para constituir el sello.' };
      s.label = { id: uid(s, 'label'), name: text(payload.name, s.player.name + ' Records'), formedWeek: s.week, owners: [{ name: s.player.name, share: 1 }], mastersOwned: [], incorporationCost: 2500, note: 'Propiedad inicial del 100% del fundador. Un contrato de distribución o licencia no cede equity del sello.' };
      ensureManagement(s);
      history(s, 'Sello fundado', s.label.name + ' inicia operaciones con el 100% de propiedad de ' + s.player.name + '.', 'business');
      return { ok: true, message: s.label.name + ' constituido. Conservas el 100% del equity.' };
    }
    if(type==='feature'){const result=featureAction(s,payload);if(result.ok)compactManagementTracking(s);return result;}
    if(type==='boostPost'){const result=boostPostAction(s,payload);if(result.ok)compactManagementTracking(s);return result;}
    if (type === 'license') {
      const r = find(s.releases, payload.releaseId || id);
      if (!r || r.canonical) return { ok: false, message: 'Selecciona una grabación propia publicada en esta carrera.' };
      if (payload.exclusive !== true) return { ok: false, message: 'Este acuerdo es una licencia exclusiva temporal. Confirma exclusive:true.' };
      if (s.licenses.some(l => l.releaseId === r.id && l.status === 'active' && l.endsWeek > s.week)) return { ok: false, message: 'Esta grabación ya tiene una licencia exclusiva vigente.' };
      const duration = payload.duration === undefined ? 52 : Number(payload.duration);
      if (!Number.isInteger(duration) || duration < 13 || duration > 104) return { ok: false, message: 'La licencia debe durar entre 13 y 104 semanas.' };
      const fairFee = money(clamp(r.totalStreams * .0032 * 12 + r.quality * 45, 500, 250000) * duration / 52);
      const maxFee = money(fairFee * (1 + s.player.skills.business / 500));
      const fee = payload.fee === undefined ? fairFee : Number(payload.fee);
      if (!Number.isFinite(fee) || fee < fairFee * .6 || fee > maxFee + .01) return { ok: false, message: 'La oferta ficticia negociable está entre $' + money(fairFee * .6).toLocaleString('es-CO') + ' y $' + maxFee.toLocaleString('es-CO') + '. No se aceptan importes arbitrarios.' };
      signLicense(s, r, fee, duration);compactManagementTracking(s);
      return { ok: true, message: 'Licencia firmada. Ingreso devengado pendiente de liquidación; no entra hoy en caja.' };
    }
    if (type === 'travel') {
      const marketId = payload.marketId || id;
      if (!['Colombia','México','Argentina','Chile','Perú','Caribe','Brasil','Puerto Rico','República Dominicana'].includes(marketId) && !s.progression.usaUnlocked) return { ok: false, message: 'El circuito internacional exige superar los objetivos hard de LATAM.' };
      if (!catalog.markets.includes(marketId) && marketId !== 'USA') return { ok: false, message: 'Mercado desconocido.' };
      if (s.career.marketId === marketId) return { ok: false, message: 'Ya estás en ese mercado.' };
      if (!pay(s, 'Viaje y contactos · ' + marketId, 750, 'travel')) return { ok: false, message: 'El viaje requiere $750 de caja disponible.' };
      s.career.marketId = marketId;
      return { ok: true, message: 'Llegaste a ' + marketId + '. Las reservas de shows se registran por país.' };
    }
    if (type === 'plan') return planItem(s, ACTION_ALIASES[id] || id, { ...payload });
    if (type === 'unplan') {
      const i = Number.isInteger(payload.index) ? payload.index : s.plan.findIndex(a => a.id === id);
      if (i < 0 || i >= s.plan.length) return { ok: false, message: 'No se encontró esa acción en tu plan.' };
      const item = s.plan.splice(i, 1)[0];
      if(item.id==='band_audition') { const opportunity=s.bands?.offers.find(o=>o.id===item.offerId);if(opportunity?.status==='planned')opportunity.status=s.week>opportunity.expiresWeek?'expired':'open'; }
      return { ok: true, message: item.label + ' retirado del plan.' };
    }
    if (type === 'skill') {
      const key = payload.skill || id;
      if (!Object.prototype.hasOwnProperty.call(s.player.skills, key)) return { ok: false, message: 'Habilidad desconocida.' };
      if (s.player.skillPoints < 1) return { ok: false, message: 'No tienes puntos de habilidad disponibles.' };
      if (s.player.skills[key] >= 100) return { ok: false, message: 'Esa habilidad ya está al máximo.' };
      s.player.skillPoints--; s.player.skills[key] = money(clamp(s.player.skills[key] + 3, 0, 100)); return { ok: true, message: 'Habilidad entrenada. Has usado un punto de experiencia.' };
    }
    if (type === 'wardrobe') {
      const field=payload.field,value=payload.value,item=wardrobeItem(field,value);
      if(!item)return{ok:false,message:'Prenda desconocida.'};
      if(s.wardrobe!==undefined && (!s.wardrobe || !Array.isArray(s.wardrobe.owned)))return{ok:false,message:'No se pudo leer el guardarropa.'};
      if(wardrobeOwned(s,field,value))return{ok:false,message:'Ya tienes esta prenda disponible.'};
      if(item.milestones){const achieved=(s.careerAwards?.completedMilestones||[]).length;if(achieved<item.milestones)return{ok:false,message:'Necesitas '+item.milestones+' hitos para desbloquear esta prenda.'};if(payload.decision!=='unlock')return{ok:false,message:'Confirma el desbloqueo de la prenda.'};}
      else {if(payload.decision!=='buy')return{ok:false,message:'Confirma la compra de la prenda.'};if(!pay(s,'Vestuario · '+value,item.price,'wardrobe'))return{ok:false,message:'Caja insuficiente para esta prenda.'};}
      if(!s.wardrobe)s.wardrobe={owned:[]};s.wardrobe.owned.push(wardrobeId(field,value));
      return{ok:true,message:item.milestones?'Prenda desbloqueada. Encuéntrala en el camerino.':'Prenda comprada. Encuéntrala en el camerino.'};
    }
    if (type === 'customize') {
      for (const key of ['origin', 'countryId', 'cityId', 'country', 'city', 'backgroundId','initialGenre']) {
        if (payload[key] !== undefined && payload[key] !== s.player[key]) return { ok: false, message: 'El origen y la experiencia inicial de esta carrera ya están fijados. Para elegir otros, empieza una carrera nueva.' };
      }
      if (payload.appearance !== undefined) {
        const invalid = appearanceError(payload.appearance);
        if (invalid) return { ok: false, message: 'Rasgo de apariencia no disponible: ' + invalid + '.' };
        for(const field of Object.keys(catalog.appearance.wardrobe)){const value=payload.appearance[field];if(value!==undefined&&!wardrobeOwned(s,field,value)&&s.player.appearance?.[field]!==value)return{ok:false,message:'Compra o desbloquea esta prenda antes de usarla.'};}
      }
      if(payload.visualStyle!==undefined&&!validVisualStyle(s.player.initialGenre||genreId(s.player.style),payload.visualStyle))return{ok:false,message:'El estilo visual no pertenece al género inicial de esta carrera.'};
      if(payload.visualStyle!==undefined)s.player.visualStyle=payload.visualStyle;
      for (const key of ['name', 'style']) if (payload[key] !== undefined) s.player[key] = text(payload[key], s.player[key]);
      if (payload.appearance !== undefined) s.player.appearance = cleanAppearance(payload.appearance, s.player.appearance);
      return { ok: true, message: 'Identidad artística actualizada.' };
    }
    if (type === 'project') {
      const t = find(catalog.projects, payload.type || 'single');
      if (!t) return { ok: false, message: 'Tipo de proyecto desconocido.' };
      if (payload.creativeBriefId !== undefined && !creativeSystem()?.getBrief(payload.creativeBriefId)) return { ok: false, message: 'Dirección creativa desconocida.' };
      if (s.projects.filter(p => ['working', 'ready'].includes(p.status)).length >= 3) return { ok: false, message: 'Termina o publica uno de tus tres proyectos activos.' };
      const bandTerms=payload.group===true?bandSystem()?.projectTerms(s):null;
      if(payload.group===true&&!bandTerms)return{ok:false,message:'Necesitas una formación activa y válida para iniciar un proyecto grupal.'};
      if (!pay(s, 'Preproducción: ' + t.name, t.cost, 'production')) return { ok: false, message: 'Caja insuficiente para iniciar el proyecto.' };
      const p = { id: uid(s, 'project'), name: text(payload.name, 'Nuevo ' + t.name), type: t.id, progress: 0, required: t.required, quality: 40, status: 'working', startedWeek: s.week, tracks: t.tracks };
      if (payload.creativeBriefId) p.creativeBriefId = payload.creativeBriefId;
      if(bandTerms)p.bandTerms=copy(bandTerms);
      const ownTerms=labelTerms(s,'player');if(ownTerms)p.labelTerms=ownTerms;
      s.projects.push(p); history(s, 'Proyecto en marcha', p.name + ' entra en preproducción.', 'music');
      return { ok: true, message: p.name + ' creado. Planifica escritura, grabación y producción.' };
    }
    if (type === 'buy') {
      const item = find(catalog.investments, id);
      const member = find(catalog.team, id);
      if (member) {
        if (hasTeam(s, id)) return { ok: false, message: 'Esa persona ya forma parte del equipo.' };
        if (!pay(s, 'Incorporación: ' + member.name, member.cost, 'team')) return { ok: false, message: 'Caja insuficiente para la incorporación.' };
        s.team.push({ ...copy(member), hiredWeek: s.week });
        return { ok: true, message: member.name + ' contratado. Coste semanal: $' + member.weeklyCost.toLocaleString('es-CO') + '.' };
      }
      if (!item) return { ok: false, message: 'Activo desconocido.' };
      const qty = payload.quantity === undefined ? 1 : Number(payload.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 10000 || ((!item.repeatable || item.category !== 'bolsa') && qty !== 1)) return { ok: false, message: 'Los bienes físicos se compran de uno en uno; las inversiones bursátiles admiten varias unidades.' };
      if (!item.repeatable && s.assets.some(a => a.catalogId === id)) return { ok: false, message: 'Ya tienes ese activo.' };
      const existing = s.assets.find(a => a.catalogId === id);
      const unitPrice = item.repeatable && item.category === 'bolsa' ? s.marketPrices[item.id] : item.cost;
      const cost = money(unitPrice * qty);
      if (!pay(s, 'Compra: ' + item.name, cost, 'investment')) return { ok: false, message: 'Caja insuficiente para esta compra.' };
      if (existing && item.repeatable && item.category === 'bolsa') { existing.quantity += qty; existing.costBasis = money(existing.costBasis + cost); }
      else s.assets.push({ id: uid(s, 'asset'), catalogId: id, name: item.name, category: item.category, quantity: qty, cost: unitPrice, costBasis: cost, value: unitPrice, acquiredWeek: s.week, maintenance: item.maintenance, rent: item.rent, liquidity: item.liquidity, risk: item.risk, totalIncome: 0, totalExpenses: 0 });
      if (item.category === 'lujo') s.player.morale = clamp(s.player.morale + 10, 0, 100);
      history(s, 'Nuevo activo', item.name + ' se incorpora a tu patrimonio.', 'finance');
      return { ok: true, message: item.name + ' comprado.' };
    }
    if (type === 'sell') {
      const a = s.assets.find(a => a.id === (payload.assetId || id) || a.catalogId === (payload.assetId || id));
      if(a&&hourly(s)&&s.agenda.appointments.some(row=>row.status==='running'&&(row.item.enterpriseAssetId===a.id||row.item.resourceId?.startsWith('studio:'+a.id+':'))))return{ok:false,message:'Esta instalación está ocupada por una sesión en curso. Puedes venderla cuando termine.'};
      const member = s.team.find(t => t.id === id);
      if (!a && member) { s.team.splice(s.team.indexOf(member), 1); return { ok: true, message: member.name + ' deja el equipo. Ya no genera sueldo.' }; }
      if (!a) return { ok: false, message: 'No tienes ese activo.' };
      const qty = payload.quantity === undefined ? a.quantity : Number(payload.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > a.quantity) return { ok: false, message: 'Cantidad de venta inválida.' };
      const proceeds = money(a.value * a.liquidity * qty);
      const originalQuantity = a.quantity;
      const soldCostBasis = money(a.costBasis * qty / originalQuantity);
      ledger(s, 'Venta: ' + a.name, proceeds, 'sale');
      if(qty===originalQuantity)enterpriseSystem()?.beforeSale(s,a.id,enterpriseHooks(),s.activeWeek?.report);
      a.quantity -= qty; a.costBasis = money(a.costBasis * a.quantity / originalQuantity);
      if (a.quantity === 0) s.assets.splice(s.assets.indexOf(a), 1);
      taxSystem()?.capitalGain(s,'personal',proceeds,soldCostBasis);
      history(s, 'Activo vendido', a.name + ': ingreso de $' + proceeds.toLocaleString('es-CO') + ' tras descuento de liquidez.', 'finance');
      return { ok: true, message: 'Venta completada por $' + proceeds.toLocaleString('es-CO') + '.' };
    }
    if (type === 'loan') {
      const template = find(catalog.loans, id);
      if (!template) return { ok: false, message: 'Selecciona una financiación disponible.' };
      const creditFame=s.management?.role==='manager'?Math.max(0,...s.management.artists.filter(a=>managedActive(s,a)).map(a=>a.fame)):s.player.fame;
      if (template.id === 'business' && (s.player.reputation < 25 || creditFame < 15) || template.id === 'tour' && (s.player.reputation < 40 || creditFame < 30)) return { ok: false, message: 'Esa financiación exige una trayectoria y reputación mayores. Como mánager, se evalúa la fama del roster activo.' };
      if (s.loans.filter(l => l.status !== 'paid').length >= 2) return { ok: false, message: 'El límite es de dos préstamos vigentes.' };
      if (s.loans.some(l => l.status === 'default')) return { ok: false, message: 'Resuelve el impago antes de pedir nueva financiación.' };
      const limit = 80000 + s.player.reputation * 3000 + s.assets.reduce((n, a) => n + assetValue(a) * .25, 0);
      if (totalDebt(s) + template.amount > limit) return { ok: false, message: 'Esta financiación supera tu límite de crédito simulado.' };
      const l = { ...copy(template), id: uid(s, 'loan'), catalogId: template.id, principal: template.amount, balance: template.amount, weeklyRate: template.apr / 52, weeklyPayment: paymentFor(template.amount, template.apr / 52, template.termWeeks), remainingWeeks: template.termWeeks, missedPayments: 0, status: 'active', startedWeek: s.week, totalPrincipalPaid: 0, totalInterestPaid: 0, totalInterestAccrued: 0, totalPaid: 0, totalFees: 0 };
      s.loans.push(l); ledger(s, l.name + ' · desembolso', l.principal, 'loan'); history(s, 'Financiación recibida', l.name + ': $' + l.principal.toLocaleString('es-CO') + ' al ' + Math.round(l.apr * 100) + '% anual ficticio.', 'finance');
      return { ok: true, message: 'Préstamo recibido. Cuota semanal: $' + l.weeklyPayment.toLocaleString('es-CO') + '.' };
    }
    if (type === 'repay') {
      const l = find(s.loans, payload.loanId || id);
      if (!l || l.status === 'paid') return { ok: false, message: 'Préstamo inexistente o ya pagado.' };
      const wanted = payload.amount === undefined ? l.balance : Number(payload.amount);
      if (!Number.isFinite(wanted) || wanted <= 0) return { ok: false, message: 'Introduce un importe positivo.' };
      const amount = money(Math.min(wanted, l.balance));
      if (!pay(s, 'Amortización extraordinaria: ' + l.name, amount, 'principal')) return { ok: false, message: 'Caja insuficiente para amortizar ese importe.' };
      l.balance = money(Math.max(0, l.balance - amount)); l.totalPrincipalPaid = money(l.totalPrincipalPaid + amount); l.totalPaid = money(l.totalPaid + amount);
      if (l.balance <= .01) { l.balance = 0; l.status = 'paid'; l.remainingWeeks = 0; l.missedPayments = 0; }
      return { ok: true, message: 'Capital amortizado: $' + amount.toLocaleString('es-CO') + '.' };
    }
    if (type === 'deal') {
      const o = find(s.offers, payload.offerId || id);
      if (!o || o.status !== 'open') return { ok: false, message: 'La oferta ya no está disponible.' };
      if (s.week > o.expiresWeek) { o.status = 'expired'; return { ok: false, message: 'La oferta ha vencido.' }; }
      const decision = payload.decision || payload.action || 'accept';
      if (decision === 'reject') { o.status = 'rejected'; return { ok: true, message: 'Oferta rechazada.' }; }
      if (decision === 'counter') return counterDeal(s, o, payload);
      if (decision === 'negotiate') {
        if (o.negotiated) return { ok: false, message: 'Esta oferta ya tiene una contraoferta final.' };
        o.negotiated = true;
        const leverage = .025 + s.player.skills.business / 1500 + (hasTeam(s, 'manager') ? .02 : 0);
        o.share = Math.max(0, money(o.share - leverage)); o.advance = money(o.advance * (1 + leverage)); o.expiresWeek = Math.max(o.expiresWeek, s.week + 2);
        return { ok: true, message: 'Contraoferta lista: más adelanto y menor participación. Puedes aceptarla o rechazarla.' };
      }
      if (decision !== 'accept') return { ok: false, message: 'Decisión de acuerdo desconocida.' };
      if(o.type==='label'&&labelContract(s,'player'))return{ok:false,message:'Tu autofirma vigente impide una licencia con otro sello.'};
      if (activeContracts(s, o.type).length || (['distribution', 'label'].includes(o.type) && activeContracts(s).some(c => ['distribution', 'label'].includes(c.type)))) return { ok: false, message: 'Ya tienes un contrato incompatible vigente.' };
      const c = { ...copy(o), id: uid(s, 'contract'), offerId: o.id, status: 'active', startedWeek: s.week, endsWeek: s.week + o.duration, recoupBalance: o.recoupable ? o.advance : 0, recouped: 0, partnerEarned: 0, lastPromoWeek: s.week, penalties: 0 };
      o.status = 'accepted'; s.contracts.push(c);
      if (c.advance) ledger(s, 'Adelanto: ' + c.name, c.advance, c.recoupable ? 'advance' : 'sponsor');
      history(s, 'Acuerdo firmado', c.name + (c.recoupable ? '. El adelanto se recupera de tus regalías futuras.' : '. Revisa sus obligaciones semanales.'), 'deal');
      return { ok: true, message: 'Acuerdo firmado: ' + c.name + '.' };
    }
    if (type === 'book') {
      let v = find(catalog.venues, payload.venueId || id);
      if (!v) return { ok: false, message: 'Venue desconocido.' };
      if (v.id === 'openmic') v = localVenue(s);
      if (v.lockedRegion === 'usa' && !s.progression.usaUnlocked) return { ok: false, message: 'USA está bloqueado hasta ganar en dificultad hard en LATAM.' };
      if (s.plan.length >= 3) return { ok: false, message: 'Tu semana ya tiene tres acciones.' };
      if (s.plan.some(p => p.id === 'show')) return { ok: false, message: 'Solo puedes reservar un concierto por semana.' };
      if (!s.financialHold && (s.player.fame < v.requirements.fame || s.player.reputation < v.requirements.reputation)) return { ok: false, message: 'Este venue exige más fama o reputación.' };
      const price = payload.ticketPrice === undefined ? v.ticket : Number(payload.ticketPrice);
      if (!Number.isFinite(price) || price < 5 || price > 250) return { ok: false, message: 'El precio de entrada debe estar entre $5 y $250.' };
      const marketId = payload.marketId || v.country;
      if (!catalog.markets.includes(marketId) && marketId !== 'USA') return { ok: false, message: 'Mercado de concierto desconocido.' };
      if (marketId === 'USA' && !s.progression.usaUnlocked) return { ok: false, message: 'USA está bloqueado hasta completar hard en LATAM.' };
      if (v.id !== 'openmic' && marketId !== v.country) return { ok: false, message: 'La sala pertenece a ' + v.country + '. Elige otra sala para tocar en un mercado distinto.' };
      if (v.id === 'openmic' && marketId !== v.country) v = { ...v, name: 'Escenario abierto · ' + marketId, label: 'Open mic · ' + marketId, city: marketId, country: marketId, isLocal: false };
      const bandTerms=payload.group===true?bandSystem()?.projectTerms(s):null;
      if(payload.group===true&&!bandTerms)return{ok:false,message:'Necesitas una formación activa y válida para reservar como grupo.'};
      const repertoire = setlistSystem()?.quote(s, { releaseIds: payload.setlistReleaseIds, bandId: bandTerms?.bandId ?? null });
      if (repertoire?.ok === false) return repertoire;
      const setlist = repertoire?.setlist;
      const energy = setlist ? setlistSystem().effects(setlist).energyCost : 32;
      const travelCost = marketId !== s.career.marketId ? 750 : 0;
      s.plan.push({ id: 'show', venueId: v.id, marketId, travelCost, venueName: v.name, venueLabel: v.label, venueCity: v.city, label: 'Concierto · ' + v.label, cost: money(v.cost * (hasAsset(s, 'tour') ? .8 : 1) + travelCost), energy, ticketPrice: money(price), ...(bandTerms?{bandTerms:copy(bandTerms)}:{}), ...(setlist?{setlist}:{}) });
      return { ok: true, message: 'Concierto reservado en ' + v.name + '. El coste se paga al resolver la semana.' };
    }
    if(type==='campaign')return ppvMarketingSystem().act(s,payload,ppvMarketingHooks());
    if (type === 'choice') {
      const e = payload.eventId ? find(s.events, payload.eventId) : s.events.find(e => e.status === 'open');
      if (!e || e.status !== 'open') return { ok: false, message: 'Este evento ya está resuelto.' };
      const c = e.choices.find(c => c.id === (payload.choiceId || id));
      if (!c) return { ok: false, message: 'Opción desconocida.' };
      if (c.cost && !pay(s, e.title + ' · ' + c.label, c.cost, 'event')) return { ok: false, message: 'Caja insuficiente para esta decisión.' };
      if (c.reward) ledger(s, e.title, c.reward, 'event');
      for (const key of ['energy', 'health', 'morale', 'fame', 'reputation']) if (c[key]) s.player[key] = clamp(s.player[key] + c[key], 0, 100);
      if (c.fans) fanGain(s, c.fans);
      if (c.bond) { const r = find(s.relationships, c.relationship || 'kairo'); if (r) r.bond = clamp(r.bond + c.bond, 0, 100); }
      if (c.skill) skillGain(s, c.skill, 1);
      e.status = 'resolved'; e.selected = c.id; e.resolvedWeek = s.week;
      history(s, e.title, c.outcome || c.label, 'event');
      return { ok: true, message: c.outcome || 'Decisión aplicada.' };
    }
    return { ok: false, message: 'Operación desconocida.' };
  }

  function releaseProject(s, p, report, campaign = false) {
    const t = find(catalog.projects, p.type) || catalog.projects[0];
    const quality = clamp(p.quality, 10, 100);
    const release = { id: uid(s, 'release'), projectId: p.id, name: p.name, type: p.type, quality: money(quality), tracks: t.tracks, multiplier: t.multiplier, releasedWeek: s.week, releasedDay: s.calendar.day, age: 0, ageDays: 0, streams: 0, totalStreams: 0, revenue: 0, totalRevenue: 0, totalUnits: 0, totalPhysicalUnits: 0, totalDigitalUnits: 0, totalSalesRevenue: 0, totalProductionCost: 0, salesStartedDay: s.calendar.day, dailyHistory: [], campaign, masterOwner: s.player.name, featureIds: (p.featureIds || []).slice() };
    release.salesBaseline = 'native-daily';
    if(p.bandTerms)release.bandTerms=copy(p.bandTerms);
    if(p.labelTerms)release.labelTerms=copy(p.labelTerms);
    release.royalties = emptyRoyalty(s.calendar.day, false);
    deliverCreativeBrief(s.player, p, release, report);
    s.releases.push(release); p.status = 'released'; p.releasedWeek = s.week;
    arcSystem()?.onRelease(s, 'player');
    // A label contract grants a temporary licence; it never transfers a master automatically.
    for (const f of s.features.filter(f => f.projectId === p.id && f.status === 'awaiting-release')) { f.releaseId = release.id; f.startedWeek = s.week; f.promoEndsWeek = s.week + f.durationPromoWeeks; f.lastPromoWeek = s.week - 2; f.status = 'active'; f.promoPending = true; }
    s.player.fame = clamp(s.player.fame + 1 + quality / 45, 0, 100);
    fanGain(s, s.player.fans * (.005 + quality / 6000));
    history(s, 'Nuevo lanzamiento', p.name + ' ya está disponible. Calidad: ' + Math.round(quality) + '/100.', 'music');
    report.highlights.push('Lanzamiento: ' + p.name + '.'); xp(s, 16);
    albumSystem().onRelease(s,'player',p,release,albumHooks(),report);
    return release;
  }
  function progressProject(s, a, report, projectId) {
    const p = projectId ? s.projects.find(p => p.id === projectId && p.status === 'working') : s.projects.find(p => p.status === 'working');
    if (!p) return;
    const appointment=agendaExecuting.get(s),usingOwn=appointment?s.agenda.appointments.find(x=>x.id===appointment)?.item.facilityOwned!==false:true;
    const boost = (usingOwn&&hasAsset(s, 'studio') ? 1.2 : 1) * (hasTeam(s, 'producer') ? 1.2 : 1);
    const amount = a.id === 'home_record' ? 12 + s.player.skills.flow / 7 : a.id === 'write' ? 13 + s.player.skills.writing / 6 : a.id === 'record' ? 25 + s.player.skills.flow / 3 : 18 + s.player.skills.production / 4;
    const preparation=appointment?s.agenda.appointments.find(x=>x.id===appointment)?.item.dailyPreparationProgressMultiplier:null;
    p.progress = money(Math.min(p.required, p.progress + amount * boost * actionFactor(s) * (preparation??enterpriseSystem()?.preparationEffects(s,{id:a.id,projectId:p.id})?.progressMultiplier??1)));
    const skills = (s.player.skills.writing + s.player.skills.flow + s.player.skills.production) / 3;
    p.quality = money(clamp(skills * .75 + 15 + clamp(p.bandTerms?.productionBonus||0,0,8) + (hasTeam(s, 'producer') ? 8 : 0) + s.player.morale / 20 + random(s) * 8, 10, 100));
    if (a.id === 'home_record') p.quality = Math.min(60, p.quality);
    if (p.progress >= p.required) { p.status = 'ready'; report.highlights.push(p.name + ' está listo para publicar.'); history(s, 'Proyecto terminado', p.name + ' se puede publicar en una próxima acción.', 'music'); }
  }
  function showEstimate(s, v, price, demandMultiplier = 1) {
    const booking = activeContracts(s, 'booking').length ? 1.25 : 1;
    const local = .025 + s.player.fame / 15000 + s.player.reputation / 25000;
    const prestige = v.capacity > 5000 ? .9 : 1;
    const geographic=s.version===4||s.territories?territoriesSystem()?.showDemand(s,{actorId:'player',marketId:v.country,city:v.city}):null;
    const pressure = clamp(s.world?.marketPressure?.[geographic?v.country:s.career.marketId] ?? 1, .8, 1.1);
    const demand = (geographic?.effectiveFans??s.player.fans) * local * (0.65 + s.player.skills.stage / 100) * booking * (hasTeam(s, 'manager') ? 1.15 : 1) * (v.ticket / price) * prestige * pressure;
    return Math.max(0, Math.floor(Math.min(v.capacity, demand * demandMultiplier)));
  }
  function processAction(s,item,report){
    const before=s.version===4||s.territories?territoriesSystem()?.snapshot(s):null,actions=report.actions.length,shows=report.shows.length;
    processActionCore(s,item,report);
    if(before)territoriesSystem()?.capture(s,before,{actorId:item.artistId||'player',marketId:item.marketId||s.career.marketId,city:item.venueCity||s.player.city,kind:item.id,day:s.calendar.day});
    if(!agendaExecuting.has(s))enterpriseSystem()?.completePreparation(s,item,report.actions.length>actions||report.shows.length>shows);
  }
  function processActionCore(s, item, report) {
    if(item.id==='album_video_shoot'){albumSystem().shoot(s,item,albumHooks(),report);return;}
    if(item.id.startsWith('management_')){processManagementAction(s,item,report);return;}
    if (item.id === 'show') {
      const baseVenue = find(catalog.venues, item.venueId);
      if (!baseVenue) return;
      const v = { ...baseVenue, name: item.venueName || baseVenue.name, label: item.venueLabel || baseVenue.label, city: item.venueCity || baseVenue.city };
      const fee = Number.isFinite(item.dailyUnitCost)?item.dailyUnitCost:money(v.cost * (hasAsset(s, 'tour') ? .8 : 1) + finite(item.travelCost));
      const setlist = item.setlist ? setlistSystem()?.effects(item.setlist) : null;
      const energyCost = setlist?.energyCost ?? 32;
      const minimumEnergy = 18 + energyCost - 32;
      if (s.player.energy < minimumEnergy || s.player.health < 15 || !pay(s, 'Producción en ' + v.name, fee, 'show')) { report.highlights.push('Concierto cancelado por caja o estado físico insuficiente.'); return; }
      const transport=usableTourAsset(s);if(transport)transport.lastUsedWeek=s.week;
      const attendance = Math.floor(showEstimate(s, v, item.ticketPrice, setlist?.demandMultiplier) * (.83 + random(s) * .24));
      const tickets = Math.min(v.capacity, attendance);
      const gross = money(tickets * item.ticketPrice);
      const travel = money(gross * .08);
      const booking = activeContracts(s, 'booking')[0];
      const commission = booking ? money(gross * booking.share) : 0;
      const crown = activeContracts(s).find(c => c.canonical && c.showShare);
      const crownCommission = crown ? money(Math.max(0, gross - fee - travel - commission) * crown.showShare) : 0;
      if (gross) ledger(s, 'Entradas · ' + v.label, gross, 'show');
      if (travel) ledger(s, 'Operación y transporte · ' + v.label, -travel, 'show');
      if (commission) { ledger(s, 'Comisión de booking', -commission, 'show'); booking.partnerEarned = money(booking.partnerEarned + commission); }
      if (crownCommission) { ledger(s, 'Split Crown · resultado de directo', -crownCommission, 'show'); crown.partnerEarned = money(crown.partnerEarned + crownCommission); }
      const groupShare=bandCut(item.bandTerms,Math.max(0,gross-fee-travel-commission-crownCommission));
      if(groupShare){ledger(s,'Reparto de directo · '+item.bandTerms.name,-groupShare,'band-show');recordBandIncome(s,item.bandTerms,groupShare,{source:'Concierto · '+v.name});}
      const incident = !hasTeam(s, 'security') && random(s) < .025;
      const basePerformance = s.player.skills.stage * .6 + s.player.energy * .3 + s.player.morale * .1 + clamp(item.bandTerms?.stageBonus||0,0,6) - (incident ? 20 : 0);
      const performance = setlist ? clamp(basePerformance + setlist.performanceBonus, 0, 100) : basePerformance;
      s.player.energy = clamp(s.player.energy - energyCost, 0, 100); s.player.health = clamp(s.player.health - 3, 0, 100);
      s.player.reputation = clamp(s.player.reputation + (performance > 48 ? 1.5 : -.8), 0, 100);
      fanGain(s, tickets * (performance > 48 ? .2 : .06)); skillGain(s, 'stage', .6);
      s.stats.totalShows++; s.stats.totalTickets += tickets;
      const country = item.marketId || v.country;
      s.career.marketId = country;
      if (tickets >= v.capacity * .5 && country !== 'USA' && !s.career.countriesPlayed.includes(country)) s.career.countriesPlayed.push(country);
      const show = { venue: v.name, attendance: tickets, capacity: v.capacity, gross, expenses: money(fee + travel + commission + crownCommission + groupShare), net: money(gross - fee - travel - commission - crownCommission - groupShare), groupShare, bandName:item.bandTerms?.name||null, performance: Math.round(performance) };
      if (setlist) {
        show.repertoire = item.setlist.works.map(work => work.name);
        show.repertoireEffects = setlist;
        report.highlights.push('Repertorio en ' + v.label + ': ' + show.repertoire.join(' · ') + '. Actuación ' + show.performance + '/100.');
      }
      if (!Array.isArray(s.ppvShows)) s.ppvShows = [];
      s.ppvShows.push({ id: uid(s, 'ppv-show'), week: s.week, venue: v.name, attendance: tickets });
      if (s.ppvShows.length > 2000) s.ppvShows.splice(0, s.ppvShows.length - 2000);
      if (show.net > 0 && !s.career.firstProfitableShow) s.career.firstProfitableShow = { week: s.week, venue: v.name, net: show.net };
      report.shows.push(show); report.highlights.push(v.label + ': ' + tickets.toLocaleString('es-CO') + '/' + v.capacity.toLocaleString('es-CO') + ' entradas. Resultado: $' + show.net.toLocaleString('es-CO') + '.');
      history(s, 'Concierto · ' + v.label, report.highlights[report.highlights.length - 1], 'show', show); xp(s, 15); return;
    }
    let a = find(catalog.actions, item.id);
    if (!a) return;
    if(a.id==='employment_shift') {
      const job=find(catalog.jobs,item.jobId);
      if(!job||s.employment?.status!=='active'||s.employment.id!==job.id){report.highlights.push('Turno omitido: el empleo ya no está activo.');return;}
      a={...a,label:job.name,energy:job.energy};
    }
    a={...a,energy:a.energy*actionFactor(s)*(item.dailyPreparationEnergyMultiplier??enterpriseSystem()?.preparationEffects(s,item)?.energyMultiplier??1)};
    if (a.id === 'release') {
      const p = find(s.projects, item.projectId);
      if (!p || p.status !== 'ready') { report.highlights.push('Lanzamiento omitido: proyecto no disponible.'); return; }
    }
    if(['band_audition','band_rehearsal'].includes(a.id)) { const available=bandSystem().canResolveAction(s,item);if(!available.ok){report.highlights.push(available.message);return;} }
    if (a.energy > 0 && (s.player.energy < a.energy || s.player.health < 12)) { report.highlights.push(a.label + ' omitido por agotamiento.'); return; }
    const executionCost=Number.isFinite(item.dailyUnitCost)?item.dailyUnitCost:a.id==='release'&&prepaidDistribution(s,item.projectId)?0:money(actionCost(s,a)*actionFactor(s));
    if (!pay(s, a.label, executionCost, 'action',{deductible:a.id!=='rest'})) { report.highlights.push(a.label + ' omitido por caja insuficiente.'); return; }
    s.player.energy = clamp(s.player.energy - a.energy, 0, 100);
    if (a.energy > 0) s.player.health = clamp(s.player.health - a.energy * .035, 0, 100);
    const promo = hasTeam(s, 'publicist') ? 1.35 : 1;
    switch (a.id) {
      case 'band_audition':
      case 'band_rehearsal': { const result=bandSystem().resolveAction(s,item,report);if(result?.ok===false){report.highlights.push(result.message||'La actividad de grupo no pudo completarse.');return;}break; }
      case 'dayjob': ledger(s, 'Trabajo temporal completado', 200, 'work'); break;
      case 'employment_shift': {
        const job=find(catalog.jobs,item.jobId);ledger(s,job.name+' · turno completado',job.wage,'work');
        s.employment.shiftsCompleted++;s.employment.totalEarned=money(s.employment.totalEarned+job.wage);
        report.highlights.push(job.name+': turno completado, cobraste $'+job.wage+'.');break;
      }
      case 'video': {
        const quality = money(clamp((s.player.skills.flow + s.player.skills.production) / 2 + (hasTeam(s, 'producer') ? 10 : 0) + random(s) * 12, 1, 100));
        s.youtube.videos.push({ id: uid(s, 'video'), name: 'Sesión ' + s.week, week: s.week, quality, age: 0, views: 0, totalViews: 0 });
        if (s.youtube.videos.length > 120) s.youtube.videos.shift();
        skillGain(s, 'production', .25); break;
      }
      case 'home_record': skillGain(s, 'flow', .25); progressProject(s, a, report, item.projectId); break;
      case 'write': skillGain(s, 'writing', .6); progressProject(s, a, report, item.projectId); break;
      case 'record': skillGain(s, 'flow', .45); progressProject(s, a, report, item.projectId); break;
      case 'produce': skillGain(s, 'production', .6); progressProject(s, a, report, item.projectId); break;
      case 'release': releaseProject(s, find(s.projects, item.projectId), report); break;
      case 'rehearse': skillGain(s, 'stage', .8); s.player.morale = clamp(s.player.morale + 2*actionFactor(s), 0, 100); break;
      case 'social':
        fanGain(s, Math.max(65, s.player.fans * (.002 + random(s) * .004)) * promo); s.player.fame = clamp(s.player.fame + .5 * promo*actionFactor(s), 0, 100);
        for (const c of activeContracts(s, 'sponsor')) c.lastPromoWeek = s.week;
        for (const f of s.features.filter(f => f.status === 'active')) { f.lastPromoWeek = s.week; f.promoPending = false; }
        break;
      case 'network':
        s.relationships.forEach(r => { r.bond = clamp(r.bond + (2 + random(s) * 3)*actionFactor(s), 0, 100); }); s.player.reputation = clamp(s.player.reputation + .6*actionFactor(s), 0, 100); break;
      case 'collab':
        fanGain(s, Math.max(70, s.player.fans * (.004 + random(s) * .004))); skillGain(s, 'flow', .5); find(s.relationships, 'kairo').bond = clamp(find(s.relationships, 'kairo').bond + 5, 0, 100); progressProject(s, { id: 'record' }, report); break;
      case 'street': skillGain(s, 'flow', .7); s.player.reputation = clamp(s.player.reputation + 1.2*actionFactor(s), 0, 100); fanGain(s, 18 + s.player.fame * 2); break;
      case 'interview': s.player.fame = clamp(s.player.fame + .8 * promo, 0, 100); fanGain(s, Math.max(150, s.player.fans * .003) * promo); find(s.relationships, 'alma').bond = clamp(find(s.relationships, 'alma').bond + 4, 0, 100); for (const f of s.features.filter(f => f.status === 'active')) { f.lastPromoWeek = s.week; f.promoPending = false; } break;
      case 'business': skillGain(s, 'business', .85); break;
      case 'fanclub':
        ledger(s, 'Ventas directas a fans', money(Math.min(2500, s.player.fans * .004) * (.7 + random(s) * .6)), 'direct'); s.player.morale = clamp(s.player.morale + 4, 0, 100); s.player.reputation = clamp(s.player.reputation + .8, 0, 100); break;
      case 'rest': s.player.health = clamp(s.player.health + 12*actionFactor(s), 0, 100); s.player.morale = clamp(s.player.morale + 7*actionFactor(s), 0, 100); break;
    }
    report.actions.push(a.label); xp(s, a.id === 'rest' ? 3 : 10);
  }

  function accrue(s, amount, source, lag, report) {
    amount = money(amount);
    if (amount <= 0) return null;
    const dueDay = s.calendar.day - s.calendar.dayOfWeek + lag * 7;
    const r = { id: uid(s, 'receivable'), week: s.week, day: s.calendar.day, date: s.calendar.date, dueWeek: s.week + lag, dueDay, dueDate: calendarDate(s.calendar.epoch, dueDay), amount, source, settled: false, settledWeek: null };
    s.receivables.push(r); s.stats.revenueAccrued = money(s.stats.revenueAccrued + amount); s.stats.revenuePending = money(s.stats.revenuePending + amount);
    if (report) report.accrued = money(finite(report.accrued) + amount);
    return r;
  }
  function settleReceivables(s, report) {
    let releaseIndex;
    for (const r of s.receivables) {
      if (r.settled || r.dueWeek > s.week) continue;
      ledger(s, 'Liquidación · ' + r.source, r.amount, 'royalty-settlement');
      const managedArtist=managedReceiptArtist(s,r);if(managedArtist)managementRecord(s,managedArtist,{commissionSettled:r.amount});
      s.ledger[s.ledger.length - 1].receivableId = r.id;
      r.settled = true; r.settledWeek = s.week;
      r.settledDay = s.calendar.day; r.settledDate = s.calendar.date;
      if (Array.isArray(r.allocations)) {
        ensureIndustry(s);
        if(!releaseIndex){releaseIndex=new Map();for(const release of s.releases)if(release&&release.id===release.id&&!releaseIndex.has(release.id))releaseIndex.set(release.id,release);}
        for (const [releaseId, amount] of r.allocations) {
          const release = releaseIndex.get(releaseId);
          if (release) { release.royalties.settled = money(release.royalties.settled + amount); release.royalties.pending = money(Math.max(0, release.royalties.pending - amount)); }
          s.industry.settlements.push({ releaseId, receiptId:r.id, source:r.source, week:r.week, dueWeek:r.dueWeek, settledWeek:s.week, amount, settled:true });
        }
        if (s.industry.settlements.length > 100) s.industry.settlements.splice(0, s.industry.settlements.length - 100);
        delete r.allocations; // Lifetime attribution is in release accounts; bounded recent detail.
      }
      s.stats.revenueSettled = money(s.stats.revenueSettled + r.amount);
      s.stats.revenuePending = money(Math.max(0, s.stats.revenuePending - r.amount));
      report.settled = money(finite(report.settled) + r.amount);
    }
    compactSettledReceipts(s);
  }
  function compactSettledReceipts(s) {
    // Keep every unpaid obligation. Older settled detail is already represented
    // by cash, lifetime totals, release accounts and the separate cash ledger.
    if (!Array.isArray(s.receivables)) return;
    const settled=s.receivables.filter(r=>r?.settled),drop=new Set(settled.slice(0,Math.max(0,settled.length-300)).map(r=>r.id));
    if(drop.size)s.receivables=s.receivables.filter(r=>!drop.has(r.id));
  }
  function musicRevenue(s, gross, report, source = 'Regalías musicales', deferAccrual = false) {
    let artist = gross;
    const c = activeContracts(s).find(c => ['label', 'distribution'].includes(c.type));
    if (c) {
      const partner = money(gross * c.share); artist = money(gross - partner); c.partnerEarned = money(c.partnerEarned + partner);
      const recoup = money(Math.min(c.recoupBalance, artist));
      c.recoupBalance = money(c.recoupBalance - recoup); c.recouped = money(c.recouped + recoup); artist = money(artist - recoup);
      taxSystem()?.noncash(s,'personal',recoup);
      report.recoup = money(report.recoup + recoup); report.partnerShare = money(report.partnerShare + partner);
    }
    if (artist > 0 && !deferAccrual) accrue(s, artist, source, 4, report);
    report.grossMusic = money(report.grossMusic + gross);
    return artist;
  }
  // Pure fixed-epoch dates recur across reports, days and saves. The FIFO bound
  // covers a 260-week horizon plus retained history without storing any gameplay state.
  const calendarEpochMs = Date.parse('2026-01-05T00:00:00Z'), calendarDateCache = new Map();
  function calendarDate(epoch, day) {
    if(epoch === '2026-01-05' && Number.isInteger(day)){
      if(calendarDateCache.has(day))return calendarDateCache.get(day);
      const value=new Date(calendarEpochMs+day*86400000).toISOString().split('T')[0];
      if(calendarDateCache.size>=4096)calendarDateCache.delete(calendarDateCache.keys().next().value);
      calendarDateCache.set(day,value);return value;
    }
    return new Date(Date.parse(epoch + 'T00:00:00Z') + day * 86400000).toISOString().split('T')[0];
  }
  function salesRow(s) {
    return { day: s.calendar.day, date: s.calendar.date, week: s.week, streams: 0, units: 0, digitalUnits: 0, physicalUnits: 0, grossRevenue: 0, streamRevenue: 0, salesRevenue: 0, netAccrued: 0, productionCost: 0, featureShare: 0, groupShare: 0, ownLabelShare: 0, partnerShare: 0, recoup: 0, licensedRevenue: 0 };
  }
  function initializeDailyRelease(r, day, legacy = false) {
    const additions = { releasedDay: null, ageDays: r.age === null ? null : Math.max(0, Math.round(r.age * 7)), totalUnits: 0, totalPhysicalUnits: 0, totalDigitalUnits: 0, totalSalesRevenue: 0, totalProductionCost: 0, salesStartedDay: day, salesBaseline: legacy ? 'tracking-started-on-upgrade' : 'native-daily', dailyHistory: [] };
    for (const [key, value] of Object.entries(additions)) if (r[key] === undefined) r[key] = value;
  }
  function compactSalesHistory(s) {
    if (Array.isArray(s.salesHistory)) {
      if (s.salesHistory.length > 730) s.salesHistory.splice(0, s.salesHistory.length - 730);
      for (let i = 0; i < s.salesHistory.length - 1; i++) if (s.salesHistory[i] && Array.isArray(s.salesHistory[i].rows)) s.salesHistory[i].rows = [];
    }
    if (Array.isArray(s.releases)) {
      const limit = Math.min(730, Math.floor(catalog.salesRules.releaseHistoryBudget / Math.max(1, s.releases.length)));
      for (const r of s.releases) if (r && Array.isArray(r.dailyHistory) && r.dailyHistory.length > limit) r.dailyHistory.splice(0, r.dailyHistory.length - limit);
    }
  }
  function compactDuplicateDayReport(s) {
    const report=s.pendingDayReport,last=s.salesHistory?.at(-1);
    // Large catalogues otherwise store this identical breakdown three times.
    // Keep the authoritative latest sales rows and all day-report totals/actions.
    if(Array.isArray(report?.rows)&&report.rows.length>20&&last?.day===report.day&&JSON.stringify(report.rows)===JSON.stringify(last.rows)){
      report.rows=[];report.rowsSourceDay=last.day;
    }
  }
  const salesAmounts = ['streams', 'units', 'digitalUnits', 'physicalUnits', 'grossRevenue', 'streamRevenue', 'salesRevenue', 'netAccrued', 'productionCost', 'featureShare', 'groupShare', 'ownLabelShare', 'partnerShare', 'recoup', 'licensedRevenue'];
  function addSales(target, row) { for (const key of salesAmounts) target[key] = money(target[key] + finite(row[key])); }
  function allocateMoney(amount, weights) {
    const cents = Math.round(money(amount) * 100), sum = weights.reduce((n, x) => n + x, 0);
    if (!sum || !cents) return weights.map(() => 0);
    const exact = weights.map(weight => cents * weight / sum), parts = exact.map(Math.floor);
    let remaining = cents - parts.reduce((n, x) => n + x, 0);
    const order = weights.map((weight, i) => ({ i, fraction: exact[i] - parts[i], weight })).filter(x => x.weight > 0).sort((a, b) => b.fraction - a.fraction || a.i - b.i);
    for (let i = 0; remaining > 0; i++, remaining--) parts[order[i % order.length].i]++;
    return parts.map(part => part / 100);
  }
  function processReleases(s, report) {
    // One fixed day. Every speed and the seven-day convenience API use this path.
    // The power-law tail tends to zero; there is no immortal catalogue floor.
    ensureIndustry(s);
    const aggregate = salesRow(s), rows = [], fanBase = s.player.fans;
    const promoActions = s.activeWeek.actionResults.filter(a => a.status === 'completed' && ['social', 'interview', 'collab'].includes(a.id)).length;
    const paidAds=ppvMarketingSystem().musicPromotion(s);
    const organicPromo = 1 + promoActions * .2;
    const promo = organicPromo + paidAds;
    const pressure = clamp(s.world?.marketPressure?.[s.career.marketId] ?? 1, .8, 1.1);
    for (const r of s.releases) {
      const ageDays = r.ageDays, quality = r.quality / 100;
      const tail = Math.pow(1 + ageDays / 105, -1.25);
      const saleTail = Math.pow(1 + ageDays / 42, -1.65);
      const features = s.features.filter(f => f.releaseId === r.id);
      let featureExposure = 0;
      for (const f of features) {
        if (f.status === 'active' && s.week >= f.promoEndsWeek) { f.status = 'completed'; f.promoPending = false; }
        if (f.status === 'active') {
          f.promoPending = s.week - f.lastPromoWeek >= 1;
          if (!f.promoPending) { const rawExposure = f.audience * .04 * quality / 7, exposure = f.promotionModel==='open-budget-v1'?Math.floor(rawExposure*Math.pow(.92,Math.max(0,s.week-f.startedWeek))):f.audienceModel==='global-v1'?Math.min(Math.floor(rawExposure*Math.pow(.92,Math.max(0,s.week-f.startedWeek))),Math.max(0,f.campaignExposureCap-f.exposureStreams)):rawExposure; featureExposure += exposure; f.exposureStreams += Math.round(exposure); }
        }
      }
      const discovery = Math.pow(Math.max(0, r.quality - 35) / 65, 3) * 42000 * r.multiplier * Math.exp(-ageDays / 35) * promo / 7;
      const demand = r.creativeDirection ? creativeSystem()?.demand(r.creativeDirection) : null;
      const organic = fanBase * (.1 + r.quality / 300) * r.multiplier * tail * promo / 7 + discovery;
      const organicShare = organicPromo / promo;
      const streamFactor = 1 + ((demand?.organicStreams ?? 1) - 1) * organicShare;
      const copyFactor = 1 + ((demand?.paidCopies ?? 1) - 1) * organicShare;
      const streams = Math.max(0, Math.round((organic * streamFactor + featureExposure + paidBoostExposure(s,r) + albumSystem().exposure(s,r) + marketingSystem().exposure(s,r)) * (.8 + random(s) * .4) * pressure));
      const rawUnits = (fanBase * (.00022 + quality * .00065) * Math.sqrt(r.multiplier) * saleTail * promo / 7 + discovery * .00045) * (.9 + random(s) * .2) * pressure * copyFactor;
      const units = Math.floor(rawUnits) + (random(s) < rawUnits % 1 ? 1 : 0);
      rows.push({ r, features, streams, units });
    }
    const rawStreams = rows.reduce((n, row) => n + row.streams, 0);
    const listeningBudget = (fanBase * (4 + s.player.fame / 12) + 350000) / 7;
    const streamAllocation = rawStreams > listeningBudget ? listeningBudget / rawStreams : 1;
    const rawUnits = rows.reduce((n, row) => n + row.units, 0);
    const purchaseBudget = Math.max(1, Math.ceil((fanBase * .003 + 120) / 7));
    const unitAllocation = rawUnits > purchaseBudget ? purchaseBudget / rawUnits : 1;
    const eligible = [];
    let discoveredFans = 0;
    for (const item of rows) {
      const { r, features } = item, row = salesRow(s);
      row.releaseId = r.id; row.releaseName = r.name;
      row.streams = Math.floor(item.streams * streamAllocation);
      // Reserved buyers satisfy launch demand; do not sell them the same album twice.
      row.units = row.digitalUnits = Math.max(Math.floor(item.units * unitAllocation),albumSystem().deliveryUnits(s,r));
      row.streamRevenue = money(row.streams * catalog.salesRules.streamRoyalty);
      const price = catalog.salesRules.digitalPrices[r.type] || 1.29;
      row.salesRevenue = money(row.digitalUnits * price);
      row.grossRevenue = money(row.streamRevenue + row.salesRevenue);
      row.productionCost = money(row.salesRevenue * catalog.salesRules.digitalDistributionRate);
      const distributable = money(row.grossRevenue - row.productionCost);
      const masterShare = Math.min(.45, features.reduce((n, f) => n + f.masterShare, 0));
      row.featureShare = money(distributable * masterShare);
      const featurePayments = allocateMoney(row.featureShare, features.map(f => f.masterShare));
      features.forEach((f, i) => { creditFeatureShare(s,f,featurePayments[i]); });
      const afterFeatures = money(distributable - row.featureShare);
      row.groupShare=bandCut(r.bandTerms,afterFeatures);recordBandIncome(s,r.bandTerms,row.groupShare,{source:'Regalías · '+r.name,releaseId:r.id});
      const afterBand=money(afterFeatures-row.groupShare);
      const license = s.licenses.find(l => l.releaseId === r.id && l.status === 'active' && l.endsWeek > s.week);
      if (license) { row.licensedRevenue = afterBand; license.revenueAssigned = money(license.revenueAssigned + afterBand); eligible.push(0); }
      else eligible.push(afterBand);
      r.streams += row.streams; r.totalStreams += row.streams;
      r.revenue = money(r.revenue + row.grossRevenue); r.totalRevenue = money(r.totalRevenue + row.grossRevenue);
      r.totalUnits += row.units; r.totalDigitalUnits += row.digitalUnits;
      r.totalSalesRevenue = money(r.totalSalesRevenue + row.salesRevenue);
      r.totalProductionCost = money(r.totalProductionCost + row.productionCost);
      r.ageDays++; r.age = r.ageDays / 7;
      item.row = row;
      discoveredFans += row.streams * (.001 + r.quality / 50000);
    }
    const beforePartner = report.partnerShare, beforeRecoup = report.recoup, receiptCount = s.receivables.length;
    let net = musicRevenue(s, money(eligible.reduce((n, x) => n + x, 0)), report, 'Regalías musicales', true);
    const partners = allocateMoney(report.partnerShare - beforePartner, eligible);
    const recoups = allocateMoney(report.recoup - beforeRecoup, eligible.map((x, i) => money(x - partners[i])));
    rows.forEach((item, i) => {
      const row = item.row;
      row.partnerShare = partners[i]; row.recoup = recoups[i];
      const selfSplit=ownLabelSplit(s,item.r.labelTerms,money(eligible[i]-row.partnerShare-row.recoup));
      row.ownLabelShare=selfSplit.label;row.netAccrued=selfSplit.net;net=money(net-selfSplit.label);
      const a=item.r.royalties;
      for(const [key,value] of Object.entries({gross:row.grossRevenue,distribution:row.productionCost,feature:row.featureShare,band:row.groupShare,ownLabel:row.ownLabelShare,partner:row.partnerShare,recoup:row.recoup,licensed:row.licensedRevenue,net:row.netAccrued,pending:row.netAccrued})) a[key]=money(finite(a[key])+value);
      item.r.dailyHistory.push(copy(row));
      const limit = Math.min(730, Math.floor(catalog.salesRules.releaseHistoryBudget / Math.max(1, s.releases.length)));
      if (item.r.dailyHistory.length > limit) item.r.dailyHistory.splice(0, item.r.dailyHistory.length - limit);
      addSales(aggregate, row);
    });
    if(net>0)accrue(s,net,'Regalías musicales',4,report);
    if (s.receivables.length > receiptCount) s.receivables[s.receivables.length-1].allocations=rows.filter(item=>item.row.netAccrued>0).map(item=>[item.r.id,item.row.netAccrued]);
    if (Math.abs(aggregate.netAccrued - net) > .011) throw new Error('El reparto diario no concilia.');
    aggregate.rows = rows.map(item => copy(item.row));
    // Detail belongs to the per-release history. Only the newest aggregate keeps
    // its rows, avoiding two full copies of every recording's two-year chart.
    if (s.salesHistory.length) s.salesHistory[s.salesHistory.length - 1].rows = [];
    s.salesHistory.push(copy(aggregate));
    if (s.salesHistory.length > 730) s.salesHistory.splice(0, s.salesHistory.length - 730);
    report.streams += aggregate.streams;
    report.units = finite(report.units) + aggregate.units;
    report.digitalUnits = finite(report.digitalUnits) + aggregate.digitalUnits;
    report.physicalUnits = 0;
    report.grossSales = money(finite(report.grossSales) + aggregate.salesRevenue);
    for (const key of ['productionCost', 'featureShare', 'groupShare', 'licensedRevenue']) report[key] = money(finite(report[key]) + aggregate[key]);
    s.stats.totalStreams += aggregate.streams;
    s.stats.totalUnits += aggregate.units;
    s.stats.totalSalesRevenue = money(s.stats.totalSalesRevenue + aggregate.salesRevenue);
    fanGain(s, Math.min(discoveredFans, (fanBase * .035 + 1500) / 7));
    return aggregate;
  }
  function salesSummary(s, range = 30, releaseId = null) {
    const source = releaseId ? s.releases.find(r => r.id === releaseId)?.dailyHistory || [] : s.salesHistory || [];
    const days = range === 'all' ? 730 : Math.max(1, Math.min(730, Math.floor(finite(Number(range), 30))));
    const cutoff = s.calendar.day - days;
    const selected = source.filter(r => r.day >= cutoff && r.day < s.calendar.day);
    const total = Object.fromEntries(salesAmounts.map(key => [key, 0]));
    selected.forEach(row => addSales(total, row));
    return { ...total, requestedDays: days, availableDays: selected.length, fromDay: selected[0]?.day ?? null, throughDay: selected[selected.length - 1]?.day ?? null, releaseId, baselineDay: releaseId ? s.releases.find(r => r.id === releaseId)?.salesStartedDay ?? null : s.salesStartedDay, note: 'Solo días observados desde que se activó el seguimiento; no reconstruye ventas anteriores. Las copias físicas todavía no se simulan.' };
  }
  function financeSeries(s, options = {}) {
    // Derive charts from dated evidence only. This view neither posts money nor
    // stores another copy of the ledger. A truncated first day is incomplete.
    const requestedDays=options.range==='all'?730:Math.max(1,Math.min(730,Math.floor(finite(Number(options.range),28))));
    const releaseId=options.releaseId||'all',throughDay=s.calendar.day-1,fromDay=Math.max(0,s.calendar.day-requestedDays);
    const financeKeys=['cashIn','cashOut','expenses','operatingExpenses','advertising','merchSales','cashChange'];
    const salesKeys=['units','salesRevenue','grossRevenue','netAccrued'];
    const blank=()=>Object.fromEntries(financeKeys.map(key=>[key,0])),buckets=new Map();
    const ledgerRows=Array.isArray(s.ledger)?s.ledger:[],ledgerTruncated=ledgerRows.length>=5000;
    let financeFromDay=Math.max(0,finite(s.salesStartedDay)),previousDay=-1;
    const exactDay=row=>row&&Number.isFinite(row.amount)&&Number.isInteger(row.day)&&row.day>=0&&row.day<=s.calendar.day&&row.week===Math.floor(row.day/7)+1&&(row.date===undefined||row.date===calendarDate(s.calendar.epoch,row.day));
    for(let index=0;index<ledgerRows.length;index++) {
      const entry=ledgerRows[index];
      if(entry?.category==='internal-transfer')continue;
      if(!exactDay(entry)) {
        // A weekly-only entry might belong to any day of that week. Do not
        // allocate it, or certify zeros anywhere inside its uncertain window.
        financeFromDay=Math.max(financeFromDay,Number.isInteger(entry?.week)?entry.week*7:s.calendar.day+1);
        continue;
      }
      if(index===0&&ledgerTruncated)financeFromDay=Math.max(financeFromDay,entry.day+1);
      if(entry.day<previousDay)financeFromDay=s.calendar.day+1;
      previousDay=entry.day;
      const day=buckets.get(entry.day)||blank(),amount=money(entry.amount);
      if(amount>0)day.cashIn=money(day.cashIn+amount);
      if(amount<0) {
        day.cashOut=money(day.cashOut-amount);day.expenses=day.cashOut;
        if(!['investment','principal','label-advance'].includes(entry.category))day.operatingExpenses=money(day.operatingExpenses-amount);
        if(entry.category==='ads')day.advertising=money(day.advertising-amount);
      }
      if(entry.category==='merch-sales'&&amount>0)day.merchSales=money(day.merchSales+amount);
      day.cashChange=money(day.cashIn-day.cashOut);buckets.set(entry.day,day);
    }
    if(s.financialHold)financeFromDay=s.calendar.day+1;
    const source=releaseId==='all'?s.salesHistory:(s.releases.find(r=>r.id===releaseId)?.dailyHistory||[]);
    const sales=new Map((source||[]).filter(row=>row&&Number.isInteger(row.day)).map(row=>[row.day,row]));
    const makeRow=day=>{
      const financeKnown=day>=financeFromDay&&!s.financialHold,record=sales.get(day),salesKnown=day<s.calendar.day&&!!record;
      return{day,date:calendarDate(s.calendar.epoch,day),week:Math.floor(day/7)+1,closed:day<s.calendar.day,financeKnown,salesKnown,
        ...Object.fromEntries(financeKeys.map(key=>[key,financeKnown?(buckets.get(day)?.[key]||0):null])),
        ...Object.fromEntries(salesKeys.map(key=>[key,salesKnown?record[key]:null]))};
    };
    const rows=[];for(let day=fromDay;day<=throughDay;day++)rows.push(makeRow(day));
    const financeDays=rows.filter(row=>row.financeKnown).length,salesDays=rows.filter(row=>row.salesKnown).length;
    const totals=Object.fromEntries([...financeKeys,...salesKeys].map(key=>{const known=rows.filter(row=>row[key]!==null&&Number.isFinite(row[key]));return[key,known.length?money(known.reduce((sum,row)=>sum+row[key],0)):null];}));
    return{rows,totals,current:makeRow(s.calendar.day),releaseId,expenseScope:'career',currency:'USD',
      coverage:{requestedDays,availableDays:rows.length,fromDay:rows[0]?.day??null,throughDay:rows.at(-1)?.day??null,financeDays,salesDays,financeFromDay:rows.find(row=>row.financeKnown)?.day??null,salesFromDay:rows.find(row=>row.salesKnown)?.day??null,financeComplete:financeDays===rows.length&&rows.length>0,salesComplete:salesDays===rows.length&&rows.length>0,ledgerTruncated},
      note:'Solo días cerrados y movimientos fechados. Ventas = copias musicales brutas, sin streams ni mercancía. Gastos = salidas de caja personales y del sello, incluidas inversiones, anticipos a terceros y capital de deuda; las transferencias entre tus cuentas se excluyen; los gastos operativos las excluyen. Publicidad = cargos pagados de campaña PPV, ya incluidos en gastos; contenido, prensa y colaboraciones siguen siendo sus propios costes. Las regalías devengadas no son cobros. Filtrar una obra no reparte los gastos generales. Los días sin cobertura permanecen desconocidos.'};
  }
  function processYoutube(s, report) {
    let views = 0;
    for (const video of s.youtube.videos) {
      const tail = Math.exp(-video.age / 9);
      const organic = (22 + video.quality * 2.4 + s.youtube.subscribers * .16 + s.player.fans * .04) * tail;
      const viral = random(s) < .006 ? 6 + random(s) * 16 : 1;
      video.views = Math.max(0, Math.round(organic * (.75 + random(s) * .5) * viral));
      video.totalViews += video.views; video.age++; views += video.views;
    }
    views = Math.min(250000000, views);
    s.youtube.lastWeekViews = views; s.youtube.views += views;
    const newSubs = Math.floor(views * (.004 + s.player.skills.flow / 22000));
    s.youtube.subscribers = Math.min(65000000, s.youtube.subscribers + newSubs);
    fanGain(s, views * .0025); s.player.fame = clamp(s.player.fame + Math.min(.7, views / 250000), 0, 100);
    let income = 0;
    if (s.youtube.subscribers >= 1000 && views > 0) {
      const rpm = .45 + random(s) * 1.75;
      income = money(views / 1000 * rpm); accrue(s, income, 'YouTube · monetización ficticia', 2, report); s.youtube.totalRevenue = money(s.youtube.totalRevenue + income);
    }
    report.youtube = { views, newSubscribers: newSubs, income, monetized: s.youtube.subscribers >= 1000 };
  }
  function processCampaign(s,report){ppvMarketingSystem().tick(s,ppvMarketingHooks(),report);}
  function processAssets(s, report) {
    const merchandise=ensureCommerce(s);
    merchandise.lastClosedWeek=s.week;
    for(const suffix of ['Units','Gross','Cost','Partner','Net'])merchandise['lastWeek'+suffix]=0;
    // Prices exist independently of ownership, so selling cannot reset a quote.
    for (const t of catalog.investments.filter(t => t.category === 'bolsa')) s.marketPrices[t.id] = money(Math.max(5, s.marketPrices[t.id] * (1 + .0005 + (random(s) - .5) * 2 * t.risk)));
    for (const a of s.assets) {
      const t = find(catalog.investments, a.catalogId);
      if (!t||enterpriseSystem()?.ownsAsset(s,a.id)) continue;
      const old = a.value,terms=assetOperatingTerms(s,a),incomeBefore=a.totalIncome,expensesBefore=a.totalExpenses,opportunityCost=finite(a.pendingOperatingCosts);
      if (t.category === 'bolsa') a.value = s.marketPrices[t.id];
      else a.value = money(Math.max(t.cost * .1, a.value * (1 - t.depreciation*terms.depreciationFactor + (t.category === 'inmueble' ? (random(s) - .45) * .003 : 0))));
      report.assetChange = money(report.assetChange + (a.value - old) * a.quantity);
      const lastOffer=a.businessOpportunity?.offeredWeek||a.acquiredWeek||0;
      if(a.businessOpportunity?.status==='open'&&s.week>a.businessOpportunity.expiresWeek)a.businessOpportunity.status='expired';
      const effectActive=Math.max(finite(a.businessBoostUntil),finite(a.businessMaintenanceUntil))>=s.week;
      const available=(!a.businessOpportunity||a.businessOpportunity.status!=='open')&&!effectActive;
      const opportunityRoll=hashSeed('business-opportunity:'+a.id+':'+a.acquiredWeek+':'+s.week+':'+s.rng)%100;
      if(t.category==='negocio' && terms.mode!=='paused' && available && s.week-lastOffer>=6 && opportunityRoll<14) {
        const names={merch:'Colección de temporada',foodtruck:'Festival gastronómico',barbershop:'Convenio con el barrio',commercial_studio:'Jornadas de grabación',record_store:'Feria de vinilos',rehearsal_rooms:'Ciclo de ensayos',equipment_rental:'Convenio de alquiler',neighborhood_cafe:'Ciclo cultural del café',mobile_recording_booth:'Jornadas de voces locales',screen_printing_shop:'Encargo de una feria independiente'};
        const duration=3+(hashSeed(a.id+':duration:'+s.week)%3),boost=1.15+(hashSeed(a.id+':boost:'+s.week)%3)*.05;
        const efficiency=hashSeed(a.id+':kind:'+s.week)%3===0;
        a.businessOpportunity=efficiency?{status:'open',kind:'efficiency',title:'Convenio de mantenimiento · '+a.name,offeredWeek:s.week,expiresWeek:s.week+3,cost:money(Math.max(60,t.maintenance*.15*duration*.65)),duration,saving:.15}:{status:'open',kind:'promotion',title:names[t.id]||'Promoción del negocio',offeredWeek:s.week,expiresWeek:s.week+3,cost:money(Math.max(70,t.rent*(boost-1)*duration*.65)),duration,boost:money(boost)};
        report.highlights.push('Nueva oportunidad para '+a.name+': revisa Patrimonio antes de S'+a.businessOpportunity.expiresWeek+'.');
      }
      let rent = t.rent * a.quantity * terms.rentFactor;
      if(s.activeWeek?.businessPromotionId===a.id) rent*=1.15;
      if(Number.isInteger(a.businessBoostUntil)&&s.week<=a.businessBoostUntil) rent*=Number.isFinite(a.businessBoostRate)?clamp(a.businessBoostRate,1,1.5):1.2;
      if (t.category !== 'bolsa') rent *= (.65 + random(s) * .7);
      if (t.id === 'merch') rent *= .7 + Math.min(2, s.player.fans / 180000) * .3;
      if (rent && random(s) < Math.min(1,t.risk * terms.riskFactor * .3)) rent = 0;
      rent = money(rent);
      if(t.id==='merch')recordMerchandise(s,a,rent,report);
      else if (rent) { ledger(s, 'Renta · ' + a.name, rent, 'rent'); a.totalIncome = money(a.totalIncome + rent); report.assetIncome = money(report.assetIncome + rent); }
      const maintenance = money(t.maintenance * a.quantity * terms.costFactor * (hasTeam(s, 'accountant') ? .92 : 1));
      if (maintenance) { ledger(s, 'Mantenimiento · ' + a.name, -maintenance, 'maintenance',{deductible:!['lujo','vivienda'].includes(t.category)}); a.totalExpenses = money(a.totalExpenses + maintenance); }
      let repair=0;
      if (t.category !== 'bolsa' && random(s) < Math.min(1,t.risk * terms.riskFactor * .025)) {
        repair = money(t.cost * (.005 + random(s) * .012)); ledger(s, 'Reparación imprevista · ' + a.name, -repair, 'maintenance',{deductible:!['lujo','vivienda'].includes(t.category)}); a.totalExpenses = money(a.totalExpenses + repair); report.highlights.push(a.name + ' necesitó una reparación de $' + repair.toLocaleString('es-CO') + '.');
      }
      const income=money(a.totalIncome-incomeBefore),expenses=money(a.totalExpenses-expensesBefore+opportunityCost);
      a.lastOperation={week:s.week,mode:terms.mode,vehicleMode:terms.garaged?'garaged':'active',income,expenses,maintenance,repair,opportunityCost,net:money(income-expenses),valueChange:money((a.value-old)*a.quantity)};
      a.operationHistory=Array.isArray(a.operationHistory)?a.operationHistory.slice(-25):[];a.operationHistory.push(copy(a.lastOperation));a.pendingOperatingCosts=0;
      if(a.businessOpportunity?.status==='accepted'&&Math.max(finite(a.businessBoostUntil),finite(a.businessMaintenanceUntil))<=s.week)a.businessOpportunity.status='completed';
    }
  }
  function processLoans(s, report) {
    for (const l of s.loans) {
      if (l.status === 'paid') continue;
      const interest = money(l.balance * l.weeklyRate);
      l.totalInterestAccrued = money(l.totalInterestAccrued + interest);
      const due = money(Math.min(l.weeklyPayment, l.balance + interest));
      const paid = money(Math.min(Math.max(0, s.cash), due));
      const interestPaid = money(Math.min(interest, paid));
      const principalPaid = money(Math.max(0, paid - interest));
      if (interestPaid) ledger(s, 'Interés · ' + l.name, -interestPaid, 'interest');
      if (principalPaid) ledger(s, 'Capital · ' + l.name, -principalPaid, 'principal');
      l.balance = money(Math.max(0, l.balance + interest - paid));
      l.totalInterestPaid = money(l.totalInterestPaid + interestPaid); l.totalPrincipalPaid = money(l.totalPrincipalPaid + principalPaid); l.totalPaid = money(l.totalPaid + paid); l.remainingWeeks = Math.max(0, l.remainingWeeks - 1);
      report.debtPayments = money(report.debtPayments + paid);
      if (paid + .01 < due) {
        l.missedPayments++; const fee = money(Math.max(20, (due - paid) * .04)); l.balance = money(l.balance + fee); l.totalFees = money(l.totalFees + fee);
        s.player.reputation = clamp(s.player.reputation - 2, 0, 100); s.player.morale = clamp(s.player.morale - 4, 0, 100);
        report.highlights.push('Cuota incompleta de ' + l.name + ': recargo de $' + fee.toLocaleString('es-CO') + ' añadido a la deuda.');
        if (l.missedPayments >= 3) { l.status = 'default'; report.highlights.push(l.name + ' está en impago. No hay nuevo crédito hasta saldarlo.'); }
      } else { l.missedPayments = 0; if (l.status !== 'default') l.status = 'active'; }
      if (l.balance < .02) { l.balance = 0; l.status = 'paid'; l.remainingWeeks = 0; report.highlights.push(l.name + ' quedó totalmente pagado.'); }
    }
  }
  function processContracts(s, report) {
    for (const c of activeContracts(s)) {
      if (c.type === 'sponsor' && (s.week - c.startedWeek + 1) % c.promoEvery === 0 && s.week - c.lastPromoWeek >= c.promoEvery) {
        ledger(s, 'Penalización de patrocinio · ' + c.name, -c.penalty, 'penalty'); c.penalties = money(c.penalties + c.penalty); report.highlights.push('El patrocinio aplica una penalización por no publicar contenido.');
      }
      if (Number.isInteger(c.endsWeek) && s.week + 1 >= c.endsWeek) { c.status = 'completed'; c.unrecoupedAtEnd = c.recoupBalance; c.recoupBalance = 0; history(s, 'Contrato finalizado', c.name + '. El saldo recuperable pendiente se extingue según los términos ficticios de esta simulación.', 'deal'); }
    }
  }
  function generateEvent(s) {
    if (s.events.some(e => e.status === 'open')) return;
    const templates = [
      { title: 'Kairo te menciona en un freestyle', desc: 'El clip empieza a circular. Tu respuesta define el tono de la relación.', choices: [
        { id: 'collaborate', label: 'Invitarlo a una colaboración', cost: 1500, fans: 1500, reputation: 2, bond: 12, outcome: 'La conversación se transforma en una sesión conjunta.' },
        { id: 'respond', label: 'Responder con barras', energy: -9, fame: 2, fans: 900, reputation: -1, bond: -12, skill: 'writing', outcome: 'La respuesta genera atención y enfría la relación con Kairo.' },
        { id: 'ignore', label: 'Concentrarse en la música', morale: 3, reputation: 1, outcome: 'Dejas pasar el ruido y mantienes el foco.' }
      ] },
      { title: 'Un productor ofrece un beat exclusivo', desc: 'Luna encontró un sonido que puede encajar en tu próximo lanzamiento.', choices: [
        { id: 'license', label: 'Comprar licencia · $4.000', cost: 4000, skill: 'production', reputation: 2, relationship: 'luna', bond: 8, outcome: 'Licencia acordada: mejoras producción y tu relación con Luna.' },
        { id: 'cowrite', label: 'Proponer sesión compartida · $900', cost: 900, skill: 'writing', relationship: 'luna', bond: 4, energy: -5, outcome: 'La sesión abre una nueva dirección creativa.' },
        { id: 'pass', label: 'Reservar la caja', outcome: 'Guardas efectivo para tus siguientes decisiones.' }
      ] },
      { title: 'Una marca propone una activación puntual', desc: 'Una tienda local necesita una aparición este fin de semana.', choices: [
        { id: 'take', label: 'Aceptar · cobras $2.800', reward: 2800, energy: -12, fans: 300, morale: -2, outcome: 'Cumples la aparición y recibes el pago.' },
        { id: 'charity', label: 'Convertirla en evento comunitario', cost: 450, reputation: 4, morale: 5, fans: 800, outcome: 'La acción fortalece tu vínculo con el barrio.' },
        { id: 'decline', label: 'Priorizar descanso', energy: 8, health: 3, outcome: 'Recuperas energía y preservas tu agenda.' }
      ] },
      { title: 'Fatiga y presión de la agenda', desc: 'Tu equipo nota señales de desgaste. Puedes invertir en recuperación.', choices: [
        { id: 'care', label: 'Fisioterapia y recuperación · $1.200', cost: 1200, energy: 20, health: 15, morale: 5, outcome: 'Vuelves a sentirte preparado para trabajar.' },
        { id: 'pause', label: 'Desconectar y dormir', energy: 14, health: 7, fame: -.3, outcome: 'Una pausa breve mejora tu estado físico.' },
        { id: 'push', label: 'Mantener el ritmo', energy: -10, health: -7, morale: -4, outcome: 'Mantienes la exposición a costa de desgaste.' }
      ] },
      { title: 'Bruno conoce una nueva escena', desc: 'El promotor ofrece presentarte a organizadores de otra ciudad.', choices: [
        { id: 'travel', label: 'Viajar y reunirse · $1.800', cost: 1800, fans: 1800, reputation: 2, relationship: 'bruno', bond: 10, outcome: 'Tu nombre empieza a moverse entre nuevos promotores.' },
        { id: 'remote', label: 'Enviar un showcase digital · $250', cost: 250, fans: 450, relationship: 'bruno', bond: 3, outcome: 'Presentas tu proyecto a distancia.' },
        { id: 'later', label: 'Retomar más adelante', outcome: 'La oportunidad queda para otro momento.' }
      ] }
    ];
    const style=String(s.player.initialGenre||s.player.style||'').toLowerCase();
    const market=s.player.city||s.career.marketId||'tu ciudad';
    const more = [
      {when:s.management?.role!=='manager'&&/rock|metal|punk/.test(style),title:'Una sala busca una banda local',desc:'Un organizador de '+market+' prepara una noche de música en vivo.',choices:[
        {id:'rehearse',label:'Invertir en un ensayo abierto · $300',cost:300,energy:-8,reputation:3,skill:'stage',outcome:'El ensayo fortalece tu preparación y tus vínculos locales.'},
        {id:'visit',label:'Visitar y conocer al organizador',energy:-5,bond:4,relationship:'bruno',outcome:'Conoces al organizador sin reservar ni prometer un concierto.'},
        {id:'pass',label:'Dejar pasar esta ocasión',outcome:'No hay gasto ni reserva.'}]},
      {when:s.management?.role!=='manager'&&/reggae|ska|dancehall/.test(style),title:'Encuentro comunitario de sonidos',desc:'Un colectivo de '+market+' invita a músicos de la escena local.',choices:[
        {id:'join',label:'Aportar al encuentro · $180',cost:180,energy:-8,fans:300,reputation:3,outcome:'Participas y refuerzas tu comunidad.'},
        {id:'listen',label:'Ir a conocer la escena',energy:-4,morale:3,skill:'stage',outcome:'Escuchas nuevas ideas y practicas tu oficio.'},
        {id:'pass',label:'Guardar tiempo y dinero',outcome:'Conservas tu caja para otra decisión.'}]},
      {when:s.management?.role!=='manager'&&/hip.?hop|rap|trap|drill/.test(style),title:'Cypher en el barrio',desc:'Una sesión en '+market+' reúne artistas y público local.',choices:[
        {id:'perform',label:'Participar en la sesión',energy:-10,fans:250,reputation:2,skill:'flow',outcome:'Tu actuación abre conversaciones con la escena.'},
        {id:'film',label:'Ayudar con el registro · $120',cost:120,energy:-5,fans:180,bond:3,outcome:'Apoyas la grabación sin adquirir derechos de la sesión.'},
        {id:'pass',label:'Descansar',energy:4,outcome:'Cuidas tu energía para la agenda.'}]},
      {when:!!s.employment&&s.employment.status==='active',title:'Un compañero comparte una idea',desc:'Un contacto de tu empleo propone intercambiar ideas después del trabajo.',choices:[
        {id:'talk',label:'Compartir una idea',energy:-4,morale:3,skill:'business',outcome:'Conversar te ayuda a ordenar tus próximos pasos.'},
        {id:'rest',label:'Reservar tiempo personal',energy:5,outcome:'Recuperas algo de energía; no se cambió ningún turno de tu agenda.'}]},
      {when:s.management?.role==='manager',title:'Encuentro con promotores del roster',desc:'Organizadores de '+market+' quieren conocer tu trabajo de representación.',choices:[
        {id:'meet',label:'Asistir a la reunión · $150',cost:150,energy:-6,reputation:2,relationship:'bruno',bond:5,skill:'business',outcome:'Amplías tus contactos; no se firmó ningún concierto ni contrato.'},
        {id:'pass',label:'Reservar tiempo y dinero',outcome:'Mantienes tu agenda y no adquieres obligaciones.'}]},
      {when:s.assets.some(a=>a.category==='negocio'),title:'Propuesta para tu negocio',desc:'Un proveedor ofrece apoyo para promocionar tus servicios. No es una venta de tu activo.',choices:[
        {id:'partner',label:'Preparar una activación · $300',cost:300,reputation:2,skill:'business',outcome:'Practicas negociación y das a conocer tu actividad.'},
        {id:'wait',label:'Revisar otra semana',outcome:'No firmas acuerdos ni comprometes tu caja.'}]},
      {when:s.assets.some(a=>a.category==='vehículo'),title:'Encuentro de conductores de gira',desc:'Técnicos de la zona comparten consejos sobre transporte y mantenimiento.',choices:[
        {id:'learn',label:'Asistir al taller · $100',cost:100,energy:-4,skill:'business',outcome:'Aprendes a planificar mejor tus desplazamientos; el valor del vehículo no cambia.'},
        {id:'decline',label:'No asistir',outcome:'Continúas con el presupuesto previsto.'}]},
      {when:s.releases.length>0,title:'Tu catálogo llega a una escucha local',desc:'Una comunidad de '+market+' propone hablar de música ya publicada.',choices:[
        {id:'attend',label:'Participar en la escucha',energy:-6,fans:250,morale:2,outcome:'Conversas con oyentes sin vender ni licenciar tus obras.'},
        {id:'skip',label:'Concentrarte en tu trabajo',outcome:'La propiedad de tu catálogo no cambia.'}]},
      {when:s.player.fame>=30,title:'Una propuesta de entrevista de trayectoria',desc:'Un medio quiere conversar sobre tu camino, sin prometer una venta ni un contrato.',choices:[
        {id:'interview',label:'Conceder entrevista',energy:-8,fame:.4,reputation:2,outcome:'Explicas tus decisiones y mantienes tus derechos.'},
        {id:'decline',label:'Cuidar tu privacidad',morale:2,outcome:'Rechazas la entrevista sin cargo.'}]}
    ];
    const eligible=templates.concat(more.filter(t=>t.when));
    const recent=new Set(s.events.slice(-4).map(e=>e.title));
    const fresh=eligible.filter(t=>!recent.has(t.title)),pool=fresh.length?fresh:eligible;
    const t = copy(pool[Math.floor(random(s) * pool.length)]); delete t.when;
    s.events.push({ ...t, id: uid(s, 'event'), week: s.week, expiresWeek: s.week + 3, status: 'open' });
    if (s.events.length > 80) s.events.splice(0, s.events.length - 80);
  }
  function weeklyForecast(s) {
    if (s.financialHold) return { financialHold: true, actionCost: money(s.plan.reduce((n, a) => n + a.cost, 0)), living: null, maintenance: null, team: null, debt: null, ads: 0, fixedCosts: null, totalCosts: null, passiveIncome: null, energy: null, endingEnergy: null, shows: [], note: 'Archivo S914. No se estiman ingresos, caja ni atributos desconocidos. Completa la conciliación para simular nuevas semanas.' };
    const appointments=hourly(s)?s.agenda.appointments.filter(a=>['scheduled','running'].includes(a.status)&&a.endMinute<=(Math.floor(s.calendar.day/7)+1)*10080):null;
    const pendingPlan = appointments?appointments.map(a=>({...a.item,cost:a.cost*(1-a.completedMinutes/a.durationMinutes),energy:a.energy*(1-a.completedMinutes/a.durationMinutes)})):s.activeWeek ? s.activeWeek.lockedPlan.filter((_, i) => !s.activeWeek.executedActions.includes(i)) : s.plan;
    const schedule = appointments?appointments.map((a,index)=>({index,id:a.actionId,appointmentId:a.id,label:a.label,dayOfWeek:Math.floor(a.startMinute/1440)%7,minute:a.startMinute%1440,status:a.status})):(s.activeWeek?.lockedPlan || s.plan).map((a, index) => ({ index, id: a.id, label: a.label, dayOfWeek: index * 2, status: s.activeWeek?.actionResults.find(r => r.index === index)?.status || 'scheduled' }));
    const taxes=taxSummary(s),taxPersonalPayment=taxes.accounts.find(a=>a.account==='personal')?.estimatedPayment||0,taxLabelPayment=taxes.accounts.find(a=>a.account==='label')?.estimatedPayment||0;
    const actionCostTotal = money(pendingPlan.reduce((n, a) => n + (appointments?a.cost:a.id==='album_video_shoot'?(a.artistId==='player'?0:30):a.id==='release'&&prepaidDistribution(s,a.projectId)?0:a.id === 'show' ? a.cost : actionCost(s, find(catalog.actions, a.id) || { id: '', cost: 0 })), 0));
    // Include already-known fame changes from the remaining agenda. Random
    // outcomes, catalogue growth and advertising remain estimates, not promises.
    const promo=hasTeam(s,'publicist')?1.35:1;
    const projectedFame=clamp(pendingPlan.reduce((n,a)=>n+(a.id==='social'?.5*promo:a.id==='interview'?.8*promo:0),s.player.fame),0,100);
    const living = livingCost(s,projectedFame);
    const livingBudget={...livingBudgetSummary(s),projectedFame,projectedCost:living};
    const maintenance = money(s.assets.reduce((n, a) => n+assetOperations(s,a).maintenance,0));
    const salaries = money(s.team.reduce((n, t) => n + t.weeklyCost, 0));
    const loans = money(s.loans.filter(l => l.status !== 'paid').reduce((n, l) => n + Math.min(l.weeklyPayment, l.balance + l.balance * l.weeklyRate), 0));
    const ppvPlan=ppvMarketingSystem().plan(s,ppvMarketingHooks()),mediaPlan={personal:0,label:0,client:0};
    for(const c of s.mediaCampaigns||[]){if(c.status!=='active')continue;let remaining=c.days-c.daysProcessed,reserve=c.reserved,planned=0;for(let d=0;d<Math.min(7-s.calendar.dayOfWeek,remaining);d++){const spend=money(reserve/(remaining-d));planned=money(planned+spend);reserve=money(reserve-spend);}mediaPlan[c.payer]=money((mediaPlan[c.payer]||0)+planned);}
    const ads=money(ppvPlan.total+mediaPlan.personal);
    const passive = money(s.assets.reduce((n, a) => n+assetOperations(s,a).estimatedIncome,0));
    const energy = appointments?appointments.filter(a=>a.participants.includes('player')).reduce((n,a)=>n+a.energy*(1-a.completedMinutes/a.durationMinutes),0):pendingPlan.reduce((n, a) => n + a.energy, 0);
    const shows = pendingPlan.filter(a => a.id === 'show').map(a => {
      const v=find(catalog.venues,a.venueId),setlist=a.setlist?setlistSystem()?.effects(a.setlist):null;
      const tickets=showEstimate(s,v,a.ticketPrice,setlist?.demandMultiplier),gross=money(tickets*a.ticketPrice);
      const production=money(v.cost*(hasAsset(s,'tour') ? .8 : 1)+finite(a.travelCost)),operation=money(gross*.08);
      const booking=money(gross*(activeContracts(s,'booking')[0]?.share||0));
      const crown=activeContracts(s).find(c=>c.canonical&&c.showShare),partner=money(Math.max(0,gross-production-operation-booking)*(crown?.showShare||0));
      const operatingNet=money(gross-production-operation-booking-partner),groupShare=bandCut(a.bandTerms,operatingNet);
      return{venueId:v.id,name:a.venueName||v.name,attendance:tickets,capacity:v.capacity,gross,production,operation,booking,partner,groupShare,bandName:a.bandTerms?.name||null,playerShare:a.bandTerms?.playerShare??1,operatingNet,estimatedNet:money(operatingNet-groupShare),...(setlist?{repertoire:a.setlist.works.map(work=>work.name),repertoireEffects:setlist}:{})};
    });
    const clientCosts=money((appointments?appointments.reduce((n,a)=>n+a.clientCost*(1-a.completedMinutes/a.durationMinutes),0):pendingPlan.filter(a=>a.id.startsWith('management_')).reduce((n,a)=>n+managementActionStatus(s,a).artistCost,0))+mediaPlan.client);
    const d=s.delegation, selectedBusiness=s.assets.find(a=>find(catalog.investments,a.catalogId)?.category==='negocio'&&a.operationMode!=='paused'&&(!d?.businessAssetId||a.id===d.businessAssetId));
    let delegated=0;
    if(!s.activeWeek&&d?.enabled===true){const budget=Math.max(0,finite(d.weeklyBudget)),reserve=Math.max(0,finite(d.reserve));for(const available of [d.marketing===true&&hasTeam(s,'publicist'),d.business===true&&hasTeam(s,'accountant')&&!!selectedBusiness,d.production===true&&hasTeam(s,'producer')&&s.projects.some(p=>p.status==='working')])if(available&&delegated+100<=budget&&taxSpendable(s)-delegated-100>=reserve)delegated+=100;}
    return { actionCost: actionCostTotal, clientCosts, mediaPlan, ppvPlan, delegated, taxes, taxPersonalPayment, taxLabelPayment, labelSettlementDue:money((s.label?.receivables||[]).filter(r=>!r.settled&&r.dueWeek<=s.week).reduce((n,r)=>n+r.amount,0)), schedule, weekLocked: !!s.activeWeek, living, livingBase: livingBase(s,projectedFame), livingBudget, originLivingMultiplier: s.player.originLivingMultiplier ?? 1, originCity: s.player.city || s.player.origin, maintenance, team: salaries, debt: loans, ads, fixedCosts: money(living + maintenance + salaries + loans + ads + delegated + taxPersonalPayment), totalCosts: money(actionCostTotal + living + maintenance + salaries + loans + ads + delegated + taxPersonalPayment), passiveIncome: passive, settlementDue: money(s.receivables.filter(r => !r.settled && r.dueWeek <= s.week).reduce((n, r) => n + r.amount, 0)), energy, endingEnergy: clamp(s.player.energy - energy + 22, 0, 100), shows, note: 'Costes personales aún pendientes: acciones ya ejecutadas no se suman de nuevo. Los costes de clientes se muestran aparte y salen de sus propias cuentas. Vida, equipo y deuda se cargan el domingo. La previsión de vida incluye la fama conocida de las publicaciones y entrevistas pendientes; resultados variables pueden cambiarla. La ciudad ajusta gastos de forma moderada; no son cotizaciones reales. Música/licencias liquidan el lunes de S+4; YouTube de S+2. No incluye reparaciones.' };
  }
  function newWeekReport(s) {
    return { ok: true, week: s.week, actions: [], shows: [], highlights: [], income: 0, expenses: 0, net: 0, streams: 0, units: 0, digitalUnits: 0, physicalUnits: 0, grossSales: 0, productionCost: 0, featureShare: 0, groupShare: 0, licensedRevenue: 0, grossMusic: 0, recoup: 0, partnerShare: 0, debtPayments: 0, assetIncome: 0, assetChange: 0, accrued: 0, settled: 0, pending: 0 };
  }
  function runDelegatedWork(s) {
    const d=s.delegation;
    if(!d || d.enabled!==true) return;
    const budget=money(Math.max(0,finite(d.weeklyBudget))), reserve=money(Math.max(0,finite(d.reserve)));
    let spent=0; const notes=[];
    const canSpend=amount=>spent+amount<=budget && taxSpendable(s)-amount>=reserve;
    if(d.marketing===true) {
      const amount=100;
      if(!hasTeam(s,'publicist')) notes.push('Promoción pendiente: falta contratar prensa.');
      else if(!canSpend(amount)) notes.push('Promoción omitida: límite o reserva insuficiente.');
      else { ledger(s,'Promoción delegada · prensa',-amount,'promotion'); spent=money(spent+amount); fanGain(s,Math.max(5,s.player.fans*.0003)); s.player.fame=money(clamp(s.player.fame+.05,0,100)); notes.push('Prensa promocionó tu carrera por $100.'); }
    }
    if(d.business===true) {
      const asset=s.assets.find(a=>find(catalog.investments,a.catalogId)?.category==='negocio'&&a.operationMode!=='paused'&&(!d.businessAssetId||a.id===d.businessAssetId)),amount=100;
      if(!hasTeam(s,'accountant')) notes.push('Negocio pendiente: falta contratar contable.');
      else if(!asset) notes.push('Negocio pendiente: no hay un negocio abierto seleccionado.');
      else if(!canSpend(amount)) notes.push('Negocio omitido: límite o reserva insuficiente.');
      else { ledger(s,'Promoción delegada · '+asset.name,-amount,'promotion'); asset.totalExpenses=money(asset.totalExpenses+amount);asset.pendingOperatingCosts=money(finite(asset.pendingOperatingCosts)+amount); spent=money(spent+amount); s.activeWeek.businessPromotionId=asset.id; notes.push('Promoción de '+asset.name+' por $100; demanda estimada +15%.'); }
    }
    if(d.production===true) {
      const project=s.projects.find(p=>p.status==='working'),amount=100;
      if(!hasTeam(s,'producer')) notes.push('Producción pendiente: falta contratar productora.');
      else if(!project) notes.push('Producción pendiente: no hay proyecto en curso.');
      else if(!canSpend(amount)) notes.push('Producción omitida: límite o reserva insuficiente.');
      else { ledger(s,'Producción delegada · '+project.name,-amount,'production'); spent=money(spent+amount); progressProject(s,{id:'home_record'},s.activeWeek.report,project.id); notes.push('Productora trabajó en '+project.name+' por $100; el lanzamiento sigue bajo tu control.'); }
    }
    d.log=Array.isArray(d.log)?d.log.slice(-51):[]; d.log.push({week:s.week,spent,notes});
    if(notes.length) s.activeWeek.report.highlights.push(...notes);
  }
  function startWeek(s) {
    if (s && s.financialHold) return { ok: false, message: 'S914 permanece en archivo: concilia caja y atributos antes de simular. No se ha movido dinero ni tiempo.' };
    const check = validateSave(s);
    if (!check.ok) return { ok: false, message: 'Partida inválida: ' + check.errors[0], errors: check.errors };
    if (s.activeWeek) return { ok: true, message: 'La semana ya tiene una agenda cerrada; continúa desde el día guardado.' };
    ensureIndustry(s);
    ensureCommerce(s);
    bandSystem()?.ensure(s);
    careerStorySystem()?.initialize(s);
    taxSystem()?.ensure(s);
    commitmentSystem()?.ensure(s);
    s.activeWeek = { week: s.week, startCash: s.cash, startLabelCash:finite(s.label?.cash), startFans: s.player.fans, startLedgerIndex: s.ledger.length, lockedPlan: copy(s.plan), executedActions: [], actionResults: [], mondaySettled: false, report: newWeekReport(s) };
    if(hourly(s))s.activeWeek.hourly=true;
    runDelegatedWork(s);
    s.calendar.status = 'running'; s.phase = 'Semana en marcha';
    return { ok: true, message: 'Agenda cerrada. Las acciones se realizan lunes, miércoles y viernes; el domingo se cierra la semana.' };
  }
  function advanceDayLegacy(s,fromBoundary=false) {
    if (!s || !s.activeWeek) { const started = startWeek(s); if (!started.ok) return started; }
    const check = fromBoundary?{ok:true}:validateSave(s, true);
    if (!check.ok) return { ok: false, message: 'Partida inválida: ' + check.errors[0], errors: check.errors };
    if (s.financialHold) return { ok: false, message: 'El archivo histórico no avanza sin conciliación.' };
    const { day, date, dayOfWeek } = s.calendar, week = s.week;
    const active = s.activeWeek, report = active.report;
    const daily=hourly(s)?active.dailyStart:null;
    const startCash = daily?.cash??s.cash, startLabelCash=daily?.labelCash??finite(s.label?.cash), previousIncome = daily?.income??report.income, previousExpenses = daily?.expenses??report.expenses;
    const actionIndex = daily?.actionIndex??report.actions.length, highlightIndex = daily?.highlightIndex??report.highlights.length;
    if (dayOfWeek === 0 && !active.mondaySettled) {
      for (const r of s.releases) { r.streams = 0; r.revenue = 0; }
      settleReceivables(s, report); settleManagement(s); active.mondaySettled = true;
    }
    if (!hourly(s)&&dayOfWeek <= 4 && dayOfWeek % 2 === 0) {
      const index = dayOfWeek / 2, item = active.lockedPlan[index];
      if (item && !active.executedActions.includes(index)) {
        const actionsBefore = report.actions.length, showsBefore = report.shows.length;
        const commitmentBefore = commitmentSystem()?.beforeActivity(s, item);
        processAction(s, item, report);
        active.executedActions.push(index);
        const status = report.actions.length > actionsBefore || report.shows.length > showsBefore ? 'completed' : 'skipped';
        active.actionResults.push({ index, day, id: item.id, label: item.label, status });
        commitmentSystem()?.afterActivity(s, item, status, commitmentBefore);
      }
    }
    if (dayOfWeek === 6) processCampaign(s, report);
    albumSystem().tick(s,albumHooks(),report);
    marketingSystem().tick(s,marketingHooks(),report);
    processPaidBoosts(s,report);
    const sales = processReleases(s, report);
    processManagedReleases(s);
    let weekReport = null;
    if (dayOfWeek === 6) weekReport = finishWeek(s);
    const dayReport = { ...copy(sales), actions: report.actions.slice(actionIndex), highlights: report.highlights.slice(highlightIndex), income: money(report.income - previousIncome), expenses: money(report.expenses - previousExpenses), net: money(s.cash - startCash + finite(s.label?.cash)-startLabelCash), personalNet:money(s.cash-startCash),labelNet:money(finite(s.label?.cash)-startLabelCash), cash: s.cash,labelCash:finite(s.label?.cash) };
    s.calendar.day++; s.calendar.dayOfWeek = s.calendar.day % 7;
    s.calendar.date = calendarDate(s.calendar.epoch, s.calendar.day);
    if(hourly(s)&&s.activeWeek)delete s.activeWeek.dailyStart;
    if (weekReport) { s.activeWeek = null; s.calendar.status = 'planning'; }
    s.pendingDayReport = copy(dayReport);
    compactDuplicateDayReport(s);
    return { ok: true, day, date, week, dayOfWeek, weekClosed: !!weekReport, dayReport, ...(weekReport ? { weekReport: copy(weekReport) } : {}) };
  }
  function agendaHooks(){return{
    open(s){
      if(!s.activeWeek){const r=startWeek(s);if(!r.ok)return r;}
      const a=s.activeWeek,r=a.report;
      if(!a.dailyStart)a.dailyStart={day:s.calendar.day,cash:s.cash,labelCash:finite(s.label?.cash),income:r.income,expenses:r.expenses,actionIndex:r.actions.length,highlightIndex:r.highlights.length};
      if(s.calendar.dayOfWeek===0&&!a.mondaySettled){for(const release of s.releases){release.streams=0;release.revenue=0;}settleReceivables(s,r);settleManagement(s);a.mondaySettled=true;}
      return{ok:true};
    },
    ready(s,a){
      const available=new Set(['player',...(s.management?.artists||[]).map(x=>x.id),...(s.bands?.active?.members||[]).map(x=>'band:'+x.id)]);if(a.participants.some(id=>!available.has(id)))return{ok:false,message:'Un participante reservado ya no está disponible. Reprograma la sesión con la formación actual.'};
      if(a.item.facilityOwned&&!agendaResources(s,a.actorId).some(r=>r.id===a.item.resourceId))return{ok:false,message:'La sala propia ya no está disponible.'};
      const effects=enterpriseSystem()?.preparationEffects(s,a.item)||{energyMultiplier:1,progressMultiplier:1};a.item.dailyPreparationId=effects.preparationId||null;a.item.dailyPreparationEnergyMultiplier=effects.energyMultiplier;a.item.dailyPreparationProgressMultiplier=effects.progressMultiplier;a.energy=money(a.item.energy*(a.durationMinutes/dailySystem().rule(a.actionId).baseMinutes)*effects.energyMultiplier);
      for(const id of a.participants){const energy=id==='player'?s.player.energy:(s.agenda.actorEnergy[id]??90);if(a.energy>0&&energy<a.energy)return{ok:false,message:'Energía insuficiente para '+a.label+'.'};}
      if(s.player.health<12&&a.participants.includes('player')&&a.energy>0)return{ok:false,message:'La salud impide comenzar la actividad.'};
      if(taxSpendable(s)+.001<a.cost||a.clientCost>0&&clientSpendable(s,a.actorId)+.001<a.clientCost)return{ok:false,message:'No hay fondos libres para reservar esta actividad.'};
      return{ok:true};
    },
    resolve(s,a,factor){
      const report=s.activeWeek.report,actions=report.actions.length,shows=report.shows.length,item={...copy(a.item),dailyUnitCost:money(a.cost*factor/(a.durationMinutes/dailySystem().rule(a.actionId).baseMinutes))},before=commitmentSystem()?.beforeActivity(s,item);
      agendaExecuting.set(s,a.id);activityFactors.set(s,factor);
      try{if(a.actorId!=='player'&&a.actionId==='rest'){const artist=s.management.artists.find(x=>x.id===a.actorId),cost=money(a.clientCost*factor/(a.durationMinutes/dailySystem().rule(a.actionId).baseMinutes));if(artist&&clientSpendable(s,artist)>=cost){artist.cash=money(artist.cash-cost);artist.stats.costs=money(artist.stats.costs+cost);managementRecord(s,artist,{clientExpenses:cost});report.actions.push(a.label+' · '+artist.name);}}else processAction(s,item,report);}finally{agendaExecuting.delete(s);activityFactors.delete(s);}
      const ok=report.actions.length>actions||report.shows.length>shows,done=a.completedMinutes+factor*dailySystem().rule(a.actionId).baseMinutes>=a.durationMinutes;
      if(ok&&a.item.enterpriseAssetId)enterpriseSystem()?.recordOwnerUse?.(s,a.item.enterpriseAssetId,factor*dailySystem().rule(a.actionId).baseMinutes,a.id+':'+a.completedMinutes);
      if(ok)for(const id of a.participants)if(id!=='player')s.agenda.actorEnergy[id]=money(clamp((s.agenda.actorEnergy[id]??90)-a.energy*factor/(a.durationMinutes/dailySystem().rule(a.actionId).baseMinutes),0,100));
      if(done||!ok){const index=s.plan.findIndex(x=>x.appointmentId===a.id);s.activeWeek.executedActions.push(index);s.activeWeek.actionResults.push({index,appointmentId:a.id,day:s.calendar.day,id:a.actionId,label:a.label,status:ok?'completed':'skipped'});commitmentSystem()?.afterActivity(s,item,ok?'completed':'skipped',before);enterpriseSystem()?.completePreparation(s,{...item,appointmentId:a.id,agendaWorkUnits:a.durationMinutes/dailySystem().rule(a.actionId).baseMinutes},ok);}
      return{ok,message:ok?'Actividad completada.':report.highlights.at(-1)||'La actividad no está disponible.'};
    },
    legacyDay(s){const result=advanceDayLegacy(s,true);if(result.weekClosed&&s.world){(root.RapWorld||(typeof require==='function'?require('./world.js'):null))?.advance(s,result.week);captureManagementCharts(s,result.week);}return result;},
    close(s){const before=territoriesSystem()?.snapshot(s),result=advanceDayLegacy(s,true);territoriesSystem()?.capture(s,before,{kind:'organic',day:s.calendar.day});if(result.weekClosed&&s.world){(root.RapWorld||(typeof require==='function'?require('./world.js'):null))?.advance(s,result.week);captureManagementCharts(s,result.week);}return result;},
    recover(s){s.player.energy=clamp(s.player.energy+(22+(hasTeam(s,'trainer')?9:0))/7,0,100);for(const id of Object.keys(s.agenda.actorEnergy))s.agenda.actorEnergy[id]=clamp(s.agenda.actorEnergy[id]+22/7,0,100);}
  };}
  function advanceTo(s,minute){
    if(s?.version!==4)return{ok:false,message:'Activa la agenda horaria.'};const check=validateSave(s);if(!check.ok)return{ok:false,message:check.errors[0],errors:check.errors};
    if(s.financialHold||s.continuityHold)return{ok:false,message:'Esta carrera requiere conciliación.'};
    const before=territoriesSystem()?.snapshot(s),result=dailySystem().tick(s,minute,agendaHooks());if(result.ok)territoriesSystem()?.capture(s,before,{kind:'organic',day:s.calendar.day});return result;
  }
  function advanceMinutes(s,minutes){if(!Number.isSafeInteger(minutes)||minutes<0)return{ok:false,message:'Minutos inválidos.'};return advanceTo(s,dailySystem().now(s)+minutes);}
  function advanceDay(s){if(s?.version===4)return advanceTo(s,(s.calendar.day+1)*1440);const before=territoriesSystem()?.snapshot(s),r=advanceDayLegacy(s);if(s?.territories)territoriesSystem()?.capture(s,before,{kind:'organic',day:s.calendar.day});return r;}
  function advanceWeek(s) {
    if(s?.version===4){const r=advanceTo(s,(Math.floor(s.calendar.day/7)+1)*10080);return r.ok?r.weekReport:r;}
    const started = startWeek(s);
    if (!started.ok) return started;
    const week = s.week;
    for (let day = 0; day < 7 && s.week === week; day++) {
      const result = advanceDay(s);
      if (!result.ok) return result;
      if (result.weekClosed) return result.weekReport;
    }
    return { ok: false, message: 'El cierre de semana no pudo completarse.' };
  }
  function finishWeek(s) {
    const active = s.activeWeek, report = active.report, startCash = active.startCash, startFans = active.startFans;
    processYoutube(s, report); processAssets(s, report);enterpriseSystem()?.closeWeek(s,enterpriseHooks(),report);
    const overhead = livingCost(s);
    ledger(s, 'Vivienda, comida y administración', -overhead, 'living');
    for (const t of s.team) ledger(s, 'Sueldo · ' + t.name, -t.weeklyCost, 'team');
    processContracts(s, report); processLoans(s, report);
    const worked = hourly(s)?active.actionResults.filter(a=>a.id!=='rest'&&a.status==='completed').length:s.plan.filter(a => a.id !== 'rest').length;
    if(!hourly(s))s.player.energy = clamp(s.player.energy + 22 + (hasTeam(s, 'trainer') ? 9 : 0), 0, 100);
    s.player.health = clamp(s.player.health + (hasTeam(s, 'trainer') ? 5 : 1.5) - (s.player.energy < 25 ? 4 : 0), 0, 100);
    s.player.morale = clamp(s.player.morale + (worked ? -.5 : 2), 0, 100);
    // Visibility competes with new releases. Aging never grants fame or milestones.
    s.career.marketCycle = (s.career.marketCycle + 1) % 52;
    s.career.competitionIndex = money(1 + .12 * Math.sin(s.career.marketCycle * Math.PI / 26));
    fanGain(s, -s.player.fans * (.001 + s.player.fame / 100000) * s.career.competitionIndex);
    s.player.fame = money(clamp(s.player.fame - (.08 + s.player.fame * .006) * s.career.competitionIndex, 0, 100));
    if (!worked) { fanGain(s, -s.player.fans * .0015); s.player.fame = clamp(s.player.fame - .12, 0, 100); }
    // Award publicity is applied after the week's normal visibility decay.
    const careerResults = careerStorySystem()?.closeWeek(s, s.week, report.streams);
    if (careerResults) {
      for (const reward of careerResults.rewards) ledger(s, reward.label, reward.amount, 'milestone');
      report.highlights.push(...careerResults.notes);
    }
    taxSystem()?.closeWeek(s,(account,label,amount,category)=>taxWrite(s,account,label,amount,category),report);
    report.personalNet=money(s.cash-startCash);report.labelNet=money(finite(s.label?.cash)-finite(active.startLabelCash));report.labelCash=finite(s.label?.cash);
    report.net = money(report.personalNet+report.labelNet); report.fansGained = s.player.fans - startFans;
    s.player.age = money(s.career.startAge + (s.week - s.career.startWeek + 1) / 52);
    const energyCap = Math.max(72, 100 - Math.max(0, s.player.age - 45) * .55);
    s.player.energy = Math.min(s.player.energy, energyCap);
    s.career.solventStreak = s.cash >= 0 && !s.loans.some(l => l.status === 'default') ? s.career.solventStreak + 1 : 0;
    if (s.cash < 0) { s.player.morale = clamp(s.player.morale - 5, 0, 100); s.player.reputation = clamp(s.player.reputation - 1, 0, 100); report.highlights.push('Caja negativa: vende activos, consigue ingresos o reduce gastos para recuperarte.'); }
    if (s.player.health < 25) report.highlights.push('Salud baja: descansar mejora tu capacidad para trabajar.');
    s.stats.lastWeekIncome = report.income; s.stats.lastWeekExpenses = report.expenses; s.stats.lastWeekStreams = report.streams; s.stats.lastWeekNet = report.net;
    commitmentSystem()?.closeWeek(s, report);
    arcSystem()?.closeWeek(s, report);
    history(s, 'Cierre de semana ' + s.week, 'Ingresos $' + report.income.toLocaleString('es-CO') + ' · salidas $' + report.expenses.toLocaleString('es-CO') + ' · caja $' + s.cash.toLocaleString('es-CO') + '.', 'week', { net: report.net, streams: report.streams });
    s.week++; s.plan = []; s.phase = 'Planificación';
    for (const o of s.offers) if (o.status === 'open' && s.week > o.expiresWeek) o.status = 'expired';
    for (const e of s.events) if (e.status === 'open' && s.week > e.expiresWeek) e.status = 'expired';
    for (const l of s.licenses) if (l.status === 'active' && s.week >= l.endsWeek) l.status = 'completed';
    for (const o of s.featureOffers) if (o.status === 'open' && s.week > o.expiresWeek) o.status = 'expired';
    if (s.week % 4 === 0) {
      const candidates = catalog.features.filter(t => s.player.fame >= t.minFame && !s.featureOffers.some(o => o.artistId === t.id && o.status === 'open')),candidate=candidates[Math.floor(s.week/4)%Math.max(1,candidates.length)];
      if (candidate) s.featureOffers.push({ ...copy(candidate), id: uid(s, 'feature-offer'), artistId: candidate.id, offeredWeek: s.week, expiresWeek: s.week + 6, status: 'open' });
    }
    if (s.week % 3 === 0 || s.player.health < 25) generateEvent(s);
    if (s.week % 4 === 0 || (report.actions.includes('Networking') && random(s) < .5)) {
      const candidates = catalog.deals.filter(t => !activeContracts(s, t.type).length && (
        t.type === 'distribution' ? s.player.fame >= 8 && s.player.fans >= 1000 :
        t.type === 'label' ? s.player.fame >= 35 && s.player.fans >= 25000 :
        t.type === 'sponsor' ? s.player.fame >= 12 && s.player.fans >= 5000 :
        s.player.fame >= 10 && s.stats.totalShows >= 3));
      if (candidates.length) offer(s, candidates[Math.floor(random(s) * candidates.length)].id);
    }
    closeManagement(s);
    commitmentSystem()?.openWeek(s);
    advanceIndustry(s);
    bandSystem()?.closeWeek(s,s.week-1);
    report.fansGained = s.player.fans - startFans;
    report.pending = s.stats.revenuePending;
    report.cash = s.cash; report.netWorth = netWorth(s); report.debt = totalDebt(s);
    momentumSystem()?.capture(s, report);
    if (unlockCriteria(s).unlocked && !s.progression.usaUnlocked) report.highlights.push('Objetivos hard de LATAM completados: ya puedes solicitar la expansión a USA.');
    s.pendingReport = copy(report);
    return report;
  }

  function validateSave(s, tickOnly = false) {
    const errors = [];
    if (!s || typeof s !== 'object' || Array.isArray(s)) return { ok: false, errors: ['Formato no reconocido.'] };
    if (![3,4].includes(s.version)) errors.push('Versión de partida no compatible; usa migrateSave para versiones anteriores.');
    errors.push(...(dailySystem()?.validate(s)||[]),...(territoriesSystem()?.validate(s)||[]),...(enterpriseSystem()?.validate(s)||[]));
    errors.push(...(taxSystem()?.validate(s)||[]));
    errors.push(...(arcSystem()?.validate(s) || []), ...(commitmentSystem()?.validate(s) || []), ...(creativeSystem()?.validate(s) || []));
    errors.push(...(setlistSystem()?.validate(s) || []));
    if (!tickOnly) errors.push(...(momentumSystem()?.validate(s) || []));
    if(s.wardrobe!==undefined && (!s.wardrobe || !Array.isArray(s.wardrobe.owned) || s.wardrobe.owned.length>100 || new Set(s.wardrobe.owned).size!==s.wardrobe.owned.length || s.wardrobe.owned.some(id=>{if(typeof id!=='string')return true;const parts=id.split(':');return parts.length!==2||!wardrobeItem(parts[0],parts[1]);}))) errors.push('Guardarropa inválido.');
    if (!Number.isInteger(s.week) || s.week < 1 || s.week > 1e6) errors.push('Semana inválida.');
    if (s.gameMode !== undefined) {
      const mode = s.gameMode;
      if (!mode || Array.isArray(mode) || !['normal','god'].includes(mode.id) || !Number.isFinite(mode.startingCash) || mode.startingCash < 0 || mode.startingCash > (mode.id === 'god' ? 30000000 : 1e12) || money(mode.startingCash) !== mode.startingCash) errors.push('Modo de carrera o capital inicial inválidos.');
      else if (mode.id === 'god' && s.economicOrigin?.id !== 'standard') errors.push('God Mode no admite cuotas de apoyo inicial.');
    }
    if (s.economicOrigin !== undefined && (!s.economicOrigin || !['limited','standard','support'].includes(s.economicOrigin.id) || s.economicOrigin.weeklyContribution !== (s.economicOrigin.id === 'support' ? 40 : 0) || s.economicOrigin.contributionEndsWeek !== (s.economicOrigin.id === 'support' ? 52 : 0))) errors.push('Condiciones económicas inválidas.');
    if(s.livingBudget!==undefined&&(!s.livingBudget||Array.isArray(s.livingBudget)||!['basic','automatic'].includes(s.livingBudget.mode)||!Number.isInteger(s.livingBudget.chosenWeek)||s.livingBudget.chosenWeek<1||s.livingBudget.chosenWeek>s.week))errors.push('Presupuesto de vida inválido.');
    if (s.careerAwards !== undefined) {
      const a=s.careerAwards;
      if (!a || a.version !== 1 || !Number.isInteger(a.startedWeek) || a.startedWeek < 1 || !Array.isArray(a.completedMilestones) || a.completedMilestones.length > 8 || !Array.isArray(a.awards) || a.awards.length > 200 || new Set(a.completedMilestones.map(m=>m?.id)).size !== a.completedMilestones.length || a.completedMilestones.some(m=>!m || typeof m.id!=='string' || !Number.isFinite(m.reward) || m.reward<0 || !(m.week===null || Number.isInteger(m.week)))) errors.push('Registro de hitos y premios inválido.');
      else if(a.awards.some(x=>!x || !Number.isInteger(x.week) || !Array.isArray(x.outcomes) || x.outcomes.length<2 || x.outcomes.length>3 || x.outcomes.some(o=>!o || typeof o.id!=='string' || typeof o.won!=='boolean' || typeof o.eligible!=='boolean' || !Number.isFinite(o.chance) || o.chance<0 || o.chance>100))) errors.push('Premio inválido.');
    }
    const archive = s.financialHold === true && s.provenance && s.provenance.mode === 'canonical-archive';
    if (!(archive && s.cash === null) && (!Number.isFinite(s.cash) || Math.abs(s.cash) > 1e15)) errors.push('Caja inválida.');
    if (typeof s.financialHold !== 'boolean' || typeof s.continuationReady !== 'boolean') errors.push('Estado de conciliación inválido.');
    if (!Number.isInteger(s.rng) || s.rng < 0 || s.rng > 4294967295) errors.push('Semilla inválida.');
    if (!Number.isInteger(s.nextId) || s.nextId < 1) errors.push('Contador de objetos inválido.');
    const arrays = ['history', 'ledger', 'releases', 'projects', 'assets', 'loans', 'contracts', 'offers', 'relationships', 'plan', 'events', 'team', 'featureOffers', 'features', 'licenses', 'receivables', 'salesHistory'];
    for (const key of arrays) if (!Array.isArray(s[key]) || s[key].length > 20000) errors.push('Lista inválida: ' + key + '.');
    const p = s.player;
    if (!p || typeof p !== 'object' || Array.isArray(p)) errors.push('Artista inválido.');
    else {
      for (const key of ['name', 'origin', 'style']) if (typeof p[key] !== 'string' || !p[key].trim() || p[key].length > 200) errors.push('Identidad inválida: ' + key + '.');
      if(p.initialGenre!==undefined&&!['hiphop','rock','reggae','pop','metal'].includes(p.initialGenre))errors.push('Género inicial inválido.');
      if(p.visualStyle!==undefined&&!validVisualStyle(p.initialGenre||genreId(p.style),p.visualStyle))errors.push('Estilo visual inválido.');
      for (const key of ['energy', 'health', 'morale', 'fame', 'reputation']) if (!(archive && p[key] === null) && (!Number.isFinite(p[key]) || p[key] < 0 || p[key] > 100)) errors.push('Atributo inválido: ' + key + '.');
      if (!(archive && p.fans === null) && (!Number.isInteger(p.fans) || p.fans < 0 || p.fans > 1e12)) errors.push('Seguidores inválidos.');
      if (!(archive && p.age === null) && (!Number.isFinite(p.age) || p.age < 16 || p.age > 20000)) errors.push('Edad inválida.');
      if (!(archive && p.skillPoints === null) && (!Number.isInteger(p.skillPoints) || p.skillPoints < 0 || p.skillPoints > 1e6) || !Number.isFinite(p.xp) || p.xp < 0 || p.xp >= 45) errors.push('Experiencia inválida.');
      if (!p.skills || typeof p.skills !== 'object') errors.push('Habilidades inválidas.');
      else for (const key of ['writing', 'flow', 'production', 'stage', 'business']) if (!(archive && p.skills[key] === null) && (!Number.isFinite(p.skills[key]) || p.skills[key] < 0 || p.skills[key] > 100)) errors.push('Habilidad inválida: ' + key + '.');
      if (!p.appearance || typeof p.appearance !== 'object' || ['skin', 'hair', 'outfit', 'accent'].some(k => typeof p.appearance[k] !== 'string' || p.appearance[k].length > 100)) errors.push('Apariencia inválida.');
      else {
        for (const [key, options] of Object.entries(catalog.appearance.enums)) if (p.appearance[key] !== undefined && !options.includes(p.appearance[key]) && !(key === 'hair' && legacyHairValue(p.appearance[key]))) errors.push('Rasgo de apariencia inválido: ' + key + '.');
        for (const key of catalog.appearance.colorFields) if (p.appearance[key] !== undefined && !hexColor(p.appearance[key]) && !(key === 'outfit' && legacyOutfit.includes(p.appearance[key]))) errors.push('Color de apariencia inválido: ' + key + '.');
      }
      const country = p.countryId == null ? null : countryById(p.countryId);
      if (p.countryId !== undefined && p.countryId !== null && !country) errors.push('País de origen inválido.');
      const city = country && country.cities.find(c => c.id === p.cityId);
      if (p.cityId !== undefined && p.cityId !== null && !city) errors.push('Ciudad de origen inválida.');
      if (p.originLivingMultiplier !== undefined && (!Number.isFinite(p.originLivingMultiplier) || p.originLivingMultiplier < .9 || p.originLivingMultiplier > 1.1)) errors.push('Ajuste geográfico inválido.');
      if (p.backgroundId !== undefined && p.backgroundId !== null && !find(catalog.backgrounds, p.backgroundId)) errors.push('Experiencia inicial inválida.');
      if (p.originSeed !== undefined && p.originSeed !== null && (!Number.isInteger(p.originSeed) || p.originSeed < 0 || p.originSeed > 4294967295)) errors.push('Semilla de origen inválida.');
      if (p.originSource === 'seeded' && (!country || !city || p.country !== country.name || p.city !== city.name || p.origin !== city.name + ', ' + country.name || p.originLivingMultiplier !== city.livingMultiplier)) errors.push('El origen guardado no coincide con la ciudad elegida al iniciar.');
    }
    const objects = ['adsCampaign', 'stats', 'provenance', 'progression', 'career', 'youtube', 'marketPrices', 'calendar'];
    for (const key of objects) if (!s[key] || typeof s[key] !== 'object' || Array.isArray(s[key])) errors.push('Objeto inválido: ' + key + '.');
    if (errors.length) return { ok: false, errors };
    const calendar = s.calendar;
    if (calendar.epoch !== '2026-01-05' || !Number.isInteger(calendar.day) || calendar.day < 0 || calendar.day > 7e6 || !Number.isInteger(calendar.dayOfWeek) || calendar.dayOfWeek < 0 || calendar.dayOfWeek > 6 || !['planning', 'running'].includes(calendar.status)) errors.push('Calendario diario inválido.');
    else if (calendar.day !== (s.week - 1) * 7 + calendar.dayOfWeek || calendar.date !== calendarDate(calendar.epoch, calendar.day)) errors.push('El calendario no coincide con la semana guardada.');
    if (!Number.isInteger(s.salesStartedDay) || s.salesStartedDay < 0 || s.salesStartedDay > calendar.day || s.salesHistory.length > 730) errors.push('Inicio de seguimiento de ventas inválido.');
    if (s.activeWeek !== null) {
      const active = s.activeWeek;
      if (!active || typeof active !== 'object' || active.week !== s.week || !Number.isFinite(active.startCash) || !Number.isInteger(active.startFans) || active.startFans < 0 || !Number.isInteger(active.startLedgerIndex) || active.startLedgerIndex < 0 || !Array.isArray(active.lockedPlan) || JSON.stringify(active.lockedPlan) !== JSON.stringify(s.plan) || !Array.isArray(active.executedActions) || (!hourly(s)&&(new Set(active.executedActions).size !== active.executedActions.length || active.executedActions.some(index => !Number.isInteger(index) || index < 0 || index >= active.lockedPlan.length || index * 2 >= calendar.dayOfWeek))) || !Array.isArray(active.actionResults) || active.actionResults.length !== active.executedActions.length || typeof active.mondaySettled !== 'boolean' || (!hourly(s)&&active.mondaySettled !== (calendar.dayOfWeek > 0)) || !active.report || active.report.week !== s.week || !Array.isArray(active.report.actions) || !Array.isArray(active.report.shows) || !Array.isArray(active.report.highlights) || ['income', 'expenses', 'streams', 'grossMusic', 'recoup', 'partnerShare', 'accrued', 'settled'].some(key => !Number.isFinite(active.report[key]) || active.report[key] < 0)) errors.push('Semana activa inválida.');
      if(hourly(s)&&(!active.hourly||(!Array.isArray(active?.actionResults)||active.actionResults.some(row=>typeof row.appointmentId!=='string'||!['completed','skipped'].includes(row.status)||!Number.isInteger(row.day)||row.day>s.calendar.day)||new Set(active.actionResults.map(r=>r.appointmentId)).size!==active.actionResults.length)))errors.push('Resultados de agenda diaria inválidos.');
      if (calendar.status !== 'running') errors.push('Una semana activa necesita reloj en marcha.');
    } else if (calendar.status !== 'planning' || calendar.dayOfWeek !== 0) errors.push('El calendario intermedio necesita una semana activa.');
    // A local first-match index avoids scanning the whole catalogue for every
    // pending allocation. Never persist/cache it or change simulation ordering.
    const releaseIndex=new Map();
    for(const r of s.releases)if(r&&r.id===r.id&&!releaseIndex.has(r.id))releaseIndex.set(r.id,r);
    const dates = new Map();
    function savedDate(day) { if (!dates.has(day)) dates.set(day, calendarDate(calendar.epoch, day)); return dates.get(day); }
    function checkSalesRow(row, release = false) {
      if (!row || !Number.isInteger(row.day) || row.day < s.salesStartedDay || row.day >= calendar.day || row.week !== Math.floor(row.day / 7) + 1 || row.date !== savedDate(row.day) || salesAmounts.some(key => ['groupShare','ownLabelShare'].includes(key) && row[key]===undefined ? false : !Number.isFinite(row[key]) || row[key] < 0) || ['streams', 'units', 'digitalUnits', 'physicalUnits'].some(key => !Number.isInteger(row[key])) || row.units !== row.digitalUnits + row.physicalUnits || Math.abs(row.grossRevenue - row.streamRevenue - row.salesRevenue) > .011 || Math.abs(row.grossRevenue - row.productionCost - row.featureShare - finite(row.groupShare) - finite(row.ownLabelShare) - row.partnerShare - row.recoup - row.licensedRevenue - row.netAccrued) > .021 || release && typeof row.releaseId !== 'string') errors.push('Registro diario de ventas inválido.');
    }
    for (let i = tickOnly ? Math.max(0, s.salesHistory.length - 1) : 0; i < s.salesHistory.length; i++) {
      const row = s.salesHistory[i]; checkSalesRow(row);
      if (i > 0 && row.day <= s.salesHistory[i - 1].day || !Array.isArray(row.rows) || row.rows.length > 20000) errors.push('Historial diario de ventas inválido.');
      else for (const detail of row.rows) checkSalesRow(detail, true);
    }
    if (!hourly(s)&&(s.plan.length > 3 || s.plan.filter(a => a && a.id === 'show').length > 1)) errors.push('Plan semanal inválido.');
    for (const a of s.plan) {
      if (!a || typeof a !== 'object' || (!find(catalog.actions, a.id) && a.id !== 'show') || !Number.isFinite(a.cost) || !Number.isFinite(a.energy)) errors.push('Acción de plan inválida.');
      else if (a.id === 'show' && (!find(catalog.venues, a.venueId) || !Number.isFinite(a.ticketPrice) || a.ticketPrice < 5 || a.ticketPrice > 250)) errors.push('Reserva inválida.');
      else if(a.id==='employment_shift') {const job=find(catalog.jobs,a.jobId);if(!job||s.employment?.status!=='active'||s.employment.id!==job.id||a.cost!==0||a.energy!==job.energy)errors.push('Turno de empleo inválido.');}
    }
    function validEmployment(job){return !!job&&!!find(catalog.jobs,job.id)&&['active','resigned'].includes(job.status)&&Number.isInteger(job.startedWeek)&&job.startedWeek>=1&&job.startedWeek<=s.week&&Number.isInteger(job.shiftsCompleted)&&job.shiftsCompleted>=0&&Number.isFinite(job.totalEarned)&&job.totalEarned>=0&&(job.status!=='resigned'||Number.isInteger(job.endedWeek)&&job.endedWeek>=job.startedWeek&&job.endedWeek<=s.week);}
    if(s.employment!==undefined&&s.employment!==null&&!validEmployment(s.employment))errors.push('Empleo inválido.');
    if(s.employmentHistory!==undefined&&(!Array.isArray(s.employmentHistory)||s.employmentHistory.length>50||s.employmentHistory.some(job=>!validEmployment(job)||job.status!=='resigned')))errors.push('Historial de empleos inválido.');
    for (const a of s.assets) if (!a || !find(catalog.investments, a.catalogId) || !Number.isInteger(a.quantity) || a.quantity < 1 || ['value', 'costBasis', 'maintenance', 'rent', 'liquidity', 'risk', 'totalIncome', 'totalExpenses'].some(k => !Number.isFinite(a[k]) || a[k] < 0)) errors.push('Activo inválido.');
    function validAssetOperation(row) {return !!row&&Number.isInteger(row.week)&&row.week>=1&&row.week<=s.week&&['standard','cautious','growth','paused'].includes(row.mode)&&['active','garaged'].includes(row.vehicleMode)&&['income','expenses','maintenance','repair','opportunityCost'].every(k=>Number.isFinite(row[k])&&row[k]>=0)&&Number.isFinite(row.net)&&Number.isFinite(row.valueChange)&&Math.abs(row.income-row.expenses-row.net)<.021;}
    for(const a of s.assets) if(a) {
      if(a.operationMode!==undefined&&!['standard','cautious','growth','paused'].includes(a.operationMode)||a.vehicleMode!==undefined&&(!isVehicle(find(catalog.investments,a.catalogId))||!['active','garaged'].includes(a.vehicleMode))||a.lastUsedWeek!==undefined&&(!Number.isInteger(a.lastUsedWeek)||a.lastUsedWeek<1||a.lastUsedWeek>s.week)||a.pendingOperatingCosts!==undefined&&(!Number.isFinite(a.pendingOperatingCosts)||a.pendingOperatingCosts<0))errors.push('Operación de activo inválida.');
      if(a.lastOperation!==undefined&&!validAssetOperation(a.lastOperation)||a.operationHistory!==undefined&&(!Array.isArray(a.operationHistory)||a.operationHistory.length>26||a.operationHistory.some((row,i)=>!validAssetOperation(row)||i>0&&(!a.operationHistory[i-1]||row.week<=a.operationHistory[i-1].week))))errors.push('Historial operativo de activo inválido.');
      const o=a.businessOpportunity;
      if(o!==undefined&&(!o||!['open','accepted','declined','expired','completed'].includes(o.status)||!Number.isInteger(o.offeredWeek)||o.offeredWeek<1||o.offeredWeek>s.week||!Number.isInteger(o.expiresWeek)||o.expiresWeek<o.offeredWeek||!Number.isFinite(o.cost)||o.cost<0||o.duration!==undefined&&(!Number.isInteger(o.duration)||o.duration<1||o.duration>8)||o.kind!==undefined&&!['promotion','efficiency'].includes(o.kind)||o.boost!==undefined&&(!Number.isFinite(o.boost)||o.boost<1||o.boost>1.5)||o.saving!==undefined&&(!Number.isFinite(o.saving)||o.saving<0||o.saving>.25)))errors.push('Oportunidad de negocio inválida.');
    }
    for (const l of s.loans) if (!l || !find(catalog.loans, l.catalogId) || !['active', 'paid', 'default'].includes(l.status) || ['principal', 'balance', 'weeklyRate', 'weeklyPayment', 'remainingWeeks', 'missedPayments', 'totalPrincipalPaid', 'totalInterestPaid', 'totalInterestAccrued', 'totalPaid', 'totalFees'].some(k => !Number.isFinite(l[k]) || l[k] < 0) || l.weeklyRate > .1) errors.push('Préstamo inválido.');
    for (const r of s.releases) if (!r || typeof r.name !== 'string' || !find(catalog.projects, r.type) || ['quality', 'tracks', 'multiplier', 'age', 'streams', 'totalStreams', 'revenue', 'totalRevenue'].some(k => !(archive && r.canonical && r[k] === null) && (!Number.isFinite(r[k]) || r[k] < 0))) errors.push('Lanzamiento inválido.');
    for (const r of s.releases) if (r && typeof r === 'object') {
      if (!(archive && r.ageDays === null) && (!Number.isInteger(r.ageDays) || r.ageDays < 0) || ['totalUnits', 'totalPhysicalUnits', 'totalDigitalUnits', 'totalSalesRevenue', 'totalProductionCost'].some(key => !Number.isFinite(r[key]) || r[key] < 0) || !Number.isInteger(r.salesStartedDay) || r.salesStartedDay < s.salesStartedDay || r.salesStartedDay > calendar.day || !Array.isArray(r.dailyHistory) || r.dailyHistory.length > 730) errors.push('Seguimiento de lanzamiento inválido.');
      else for (let i = tickOnly ? Math.max(0, r.dailyHistory.length - 1) : 0; i < r.dailyHistory.length; i++) { checkSalesRow(r.dailyHistory[i], true); if (r.dailyHistory[i].releaseId !== r.id || i > 0 && r.dailyHistory[i].day <= r.dailyHistory[i - 1].day) errors.push('Historial de lanzamiento inválido.'); }
    }
    for (const p of s.projects) if (!p || !find(catalog.projects, p.type) || typeof p.name !== 'string' || !['working', 'ready', 'released'].includes(p.status) || ['progress', 'required', 'quality'].some(k => !Number.isFinite(p[k]) || p[k] < 0) || p.required <= 0) errors.push('Proyecto inválido.');
    for (const o of s.offers) if (!o || !find(catalog.deals, o.templateId) || !['open', 'expired', 'accepted', 'rejected'].includes(o.status) || ['advance', 'share', 'duration', 'expiresWeek'].some(k => !Number.isFinite(o[k]) || o[k] < 0) || o.share > 1) errors.push('Oferta inválida.');
    for (const c of s.contracts) if (!c || !find(catalog.deals, c.templateId) || !['active', 'completed'].includes(c.status) || ['advance', 'share', 'recoupBalance', 'recouped', 'partnerEarned', 'startedWeek', 'endsWeek', 'lastPromoWeek', 'penalties'].some(k => !(c.canonical && c[k] === null && (archive || k === 'startedWeek')) && (!Number.isFinite(c[k]) || c[k] < 0)) || c.share > 1) errors.push('Contrato inválido.');
    for (const t of s.team) if (!t || !find(catalog.team, t.id) || !Number.isFinite(t.weeklyCost) || t.weeklyCost < 0) errors.push('Equipo inválido.');
    for (const r of s.relationships) if (!r || typeof r.id !== 'string' || !Number.isFinite(r.bond) || r.bond < 0 || r.bond > 100) errors.push('Relación inválida.');
    for (const r of s.ledger) if (!r || !Number.isInteger(r.week) || !Number.isFinite(r.amount) || typeof r.label !== 'string') errors.push('Movimiento inválido.');
    for (const e of s.events) if (!e || typeof e.id !== 'string' || !['open', 'resolved', 'expired'].includes(e.status) || !Array.isArray(e.choices) || e.choices.length > 8 || e.choices.some(c => !c || typeof c.id !== 'string' || ['cost', 'reward', 'fans', 'energy', 'health', 'morale', 'fame', 'reputation', 'bond'].some(k => c[k] !== undefined && !Number.isFinite(c[k])))) errors.push('Evento inválido.');
    const c = s.adsCampaign;
    if (!['available', 'active', 'completed'].includes(c.status) || typeof c.active !== 'boolean' || ['budget', 'duration', 'totalWeeks', 'elapsed', 'spent', 'revenue', 'ppvSales'].some(k => !(archive && c.historical && c[k] === null) && (!Number.isFinite(c[k]) || c[k] < 0)) || c.duration < 1 || c.spent > c.budget + .02 || (c.status === 'active') !== c.active) errors.push('Campaña inválida.');
    for (const k of ['ppvShows', 'ppvFilms', 'ppvCampaigns']) if (s[k] !== undefined && (!Array.isArray(s[k]) || s[k].length > 20000)) errors.push('Archivo PPV inválido.');
    if (Array.isArray(s.ppvFilms)) {
      const ids = new Set();
      for (const f of s.ppvFilms) {
        if (!f || typeof f.id !== 'string' || !f.id || ids.has(f.id) || typeof f.name !== 'string' || !Number.isFinite(f.price) || f.price<=0 || !Number.isSafeInteger(Math.round(f.price*100)) || ['sales','revenue','adSpend'].some(k => f[k] !== null && (!Number.isFinite(f[k]) || f[k] < 0))) errors.push('Película PPV inválida.');
        else ids.add(f.id);
      }
      if (c.filmId && !ids.has(c.filmId)) errors.push('Película de campaña desconocida.');
    }
    for (const key of ['totalIncome', 'totalExpenses', 'totalStreams', 'totalShows', 'totalTickets', 'totalPPV', 'totalUnits', 'totalSalesRevenue', 'lastWeekIncome', 'lastWeekExpenses', 'lastWeekStreams', 'lastWeekNet', 'revenueAccrued', 'revenuePending', 'revenueSettled']) {
      const value = s.stats[key];
      if (!(archive && value === null) && (!Number.isFinite(value) || Math.abs(value) > 1e15)) errors.push('Estadística inválida: ' + key + '.');
    }
    if (!['hard', 'normal'].includes(s.progression.difficulty) || !Array.isArray(s.progression.victoryGoals) || typeof s.progression.usaUnlocked !== 'boolean') errors.push('Progresión inválida.');
    if (!Array.isArray(s.career.countriesPlayed) || !Number.isInteger(s.career.solventStreak) || s.career.solventStreak < 0 || !Number.isFinite(s.career.competitionIndex) || !(archive && s.career.startAge === null) && !Number.isFinite(s.career.startAge)) errors.push('Carrera inválida.');
    if (['startWeek', 'marketCycle', 'bankruptcyCount'].some(k => !Number.isInteger(s.career[k]) || s.career[k] < 0) || typeof s.career.marketId !== 'string') errors.push('Cronología de carrera inválida.');
    if (s.career.firstProfitableShow != null && (!Number.isInteger(s.career.firstProfitableShow.week) || s.career.firstProfitableShow.week < 1 || typeof s.career.firstProfitableShow.venue !== 'string' || !Number.isFinite(s.career.firstProfitableShow.net) || s.career.firstProfitableShow.net <= 0)) errors.push('Primer show rentable inválido.');
    if (!Array.isArray(s.youtube.videos) || s.youtube.videos.length > 120 || ['subscribers', 'views', 'lastWeekViews', 'totalRevenue'].some(k => !Number.isFinite(s.youtube[k]) || s.youtube[k] < 0) || s.youtube.videos.some(v => !v || ['quality', 'age', 'views', 'totalViews'].some(k => !Number.isFinite(v[k]) || v[k] < 0))) errors.push('Canal de YouTube inválido.');
    for (const key of ['index', 'music_stock', 'bond']) if (!Number.isFinite(s.marketPrices[key]) || s.marketPrices[key] < 0) errors.push('Cotización inválida: ' + key + '.');
    for (const key of ['assets', 'loans', 'contracts', 'offers', 'releases', 'projects', 'team', 'relationships', 'events', 'featureOffers', 'features', 'licenses', 'receivables']) {
      const ids = s[key].map(x => x && x.id);
      if (ids.some(id => typeof id !== 'string') || new Set(ids).size !== ids.length) errors.push('Identificadores duplicados o inválidos: ' + key + '.');
    }
    for (const r of s.receivables) if (!r || !Number.isInteger(r.week) || !Number.isInteger(r.dueWeek) || r.dueWeek < r.week || !Number.isFinite(r.amount) || r.amount <= 0 || typeof r.source !== 'string' || typeof r.settled !== 'boolean' || (r.settled && !Number.isInteger(r.settledWeek))) errors.push('Cuenta por cobrar inválida.');
    for (const f of s.features) if (!f || !(f.managedArtistId?s.management?.artists.some(a=>a.id===f.managedArtistId&&f.artistId===a.id):find(catalog.features, f.artistId)) || !find(s.projects, f.projectId) || !['awaiting-release', 'active', 'completed'].includes(f.status) || ['fee', 'masterShare', 'audience', 'durationPromoWeeks', 'artistEarned', 'exposureStreams'].some(k => !Number.isFinite(f[k]) || f[k] < 0) || f.masterShare > .45) errors.push('Colaboración inválida.');
    for (const o of s.featureOffers) if (!o || !find(catalog.features, o.artistId) || !['open', 'accepted', 'rejected', 'expired'].includes(o.status) || ['fee', 'masterShare', 'expiresWeek'].some(k => !Number.isFinite(o[k]) || o[k] < 0)) errors.push('Oferta de colaboración inválida.');
    for (const l of s.licenses) if (!l || !releaseIndex.get(l.releaseId) || !['active', 'completed'].includes(l.status) || !l.exclusive || !l.mastersRetained || ['fee', 'startedWeek', 'endsWeek', 'revenueAssigned'].some(k => !Number.isFinite(l[k]) || l[k] < 0) || l.endsWeek <= l.startedWeek) errors.push('Licencia inválida.');
    if (s.label !== null && (!s.label || typeof s.label.name !== 'string' || !Array.isArray(s.label.owners) || s.label.owners.length < 1 || s.label.owners.some(o => !o || typeof o.name !== 'string' || !Number.isFinite(o.share) || o.share <= 0 || o.share > 1) || Math.abs(s.label.owners.reduce((n, o) => n + o.share, 0) - 1) > .00001)) errors.push('Sello inválido.');
    if(s.merchandise!==undefined){
      const m=s.merchandise,totals=['totalUnits','totalGross','totalCost','totalPartner','totalNet','lastWeekUnits','lastWeekGross','lastWeekCost','lastWeekPartner','lastWeekNet'];
      if(!m||m.version!==1||!Number.isInteger(m.trackedFromDay)||m.trackedFromDay<0||m.trackedFromDay>s.calendar.day||typeof m.legacy!=='boolean'||m.lastClosedWeek!==null&&(!Number.isInteger(m.lastClosedWeek)||m.lastClosedWeek<1||m.lastClosedWeek>=s.week)||totals.some(k=>!Number.isFinite(m[k])||m[k]<0)||!Number.isInteger(m.totalUnits)||!Number.isInteger(m.lastWeekUnits)||!Array.isArray(m.history)||m.history.length>catalog.commerceRules.merchHistoryWeeks)errors.push('Seguimiento de mercancía inválido.');
      else{
        const price=catalog.commerceRules.merchUnitPrice,cost=catalog.commerceRules.merchUnitCost;
        for(const prefix of ['total','lastWeek'])if(Math.abs(m[prefix+'Gross']-m[prefix+'Units']*price)>.02||Math.abs(m[prefix+'Cost']-m[prefix+'Units']*cost)>.02||Math.abs(m[prefix+'Gross']-m[prefix+'Cost']-m[prefix+'Partner']-m[prefix+'Net'])>.03)errors.push('Las unidades de mercancía no concilian con su importe.');
        for(let index=0;index<m.history.length;index++){
          const row=m.history[index];
          if(!row||!Number.isInteger(row.day)||row.day<m.trackedFromDay||row.day>=s.calendar.day||row.day%7!==6||row.week!==Math.floor(row.day/7)+1||!Number.isInteger(row.units)||row.units<0||['gross','cost','partner','net'].some(k=>!Number.isFinite(row[k])||row[k]<0)||Math.abs(row.gross-row.units*price)>.02||Math.abs(row.cost-row.units*cost)>.02||Math.abs(row.gross-row.cost-row.partner-row.net)>.03||index>0&&row.day<=m.history[index-1].day)errors.push('Venta de mercancía inválida.');
        }
      }
    }
    for(const contract of s.contracts)if(contract.merchShare!==undefined&&(!Number.isFinite(contract.merchShare)||contract.merchShare<0||contract.merchShare>1))errors.push('Participación de mercancía inválida.');
    if (s.industry !== undefined) {
      const i=s.industry;
      if (!i || i.version!==1 || !Number.isInteger(i.rng) || i.rng<0 || i.rng>4294967295 || !Number.isInteger(i.trackedFromDay) || i.trackedFromDay<0 || i.trackedFromDay>s.calendar.day || typeof i.legacy!=='boolean' || !Number.isInteger(i.nextPitchWeek) || i.nextPitchWeek<1 || !Array.isArray(i.offers) || i.offers.length>80 || !Array.isArray(i.settlements) || i.settlements.length>100) errors.push('Seguimiento de industria inválido.');
      else {
        const ids=i.offers.map(o=>o?.id);if(ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)errors.push('Identificadores de ofertas de catálogo inválidos.');
        for(const o of i.offers) {
          if(!o || typeof o.buyer!=='string' || !['song','catalog'].includes(o.scope) || !['open','accepted','rejected','expired','withdrawn'].includes(o.status) || !Array.isArray(o.releaseIds) || !o.releaseIds.length || o.releaseIds.length>20000 || new Set(o.releaseIds).size!==o.releaseIds.length || o.releaseIds.some(id=>!releaseIndex.get(id)) || !Array.isArray(o.releaseNames) || o.releaseNames.length!==o.releaseIds.length || o.releaseNames.some(n=>typeof n!=='string') || ['fee','baseFee'].some(k=>!Number.isFinite(o[k])||o[k]<=0||o[k]>1000000000000) || ['duration','baseDuration'].some(k=>!Number.isInteger(o[k])||o[k]<13||o[k]>104) || !Number.isInteger(o.offeredWeek) || !Number.isInteger(o.expiresWeek) || o.expiresWeek<o.offeredWeek || !Number.isInteger(o.rounds) || o.rounds<0 || o.rounds>2 || o.maxRounds!==2 || !o.exclusive || !o.mastersRetained || !Array.isArray(o.history) || o.history.length>7) errors.push('Oferta de catálogo inválida.');
        }
        for(const receipt of i.settlements)if(!receipt||!releaseIndex.get(receipt.releaseId)||typeof receipt.receiptId!=='string'||!Number.isFinite(receipt.amount)||receipt.amount<=0||!Number.isInteger(receipt.week)||!Number.isInteger(receipt.dueWeek)||!Number.isInteger(receipt.settledWeek)||receipt.settled!==true)errors.push('Detalle de liquidación inválido.');
      }
    }
    for(const r of s.releases) if(r.royalties!==undefined){const a=r.royalties;if(!a||!Number.isInteger(a.trackedFromDay)||a.trackedFromDay<0||a.trackedFromDay>s.calendar.day||typeof a.legacy!=='boolean'||royaltyKeys.some(k=>['band','ownLabel'].includes(k)&&a[k]===undefined?false:!Number.isFinite(a[k])||a[k]<0)||Math.abs(a.gross-a.distribution-a.feature-finite(a.band)-finite(a.ownLabel)-a.partner-a.recoup-a.licensed-a.net)>.05||Math.abs(a.net-a.settled-a.pending)>.05)errors.push('Estado de regalías por obra inválido.');}
    for(const r of s.receivables) if(r.allocations!==undefined){if(!Array.isArray(r.allocations)||r.allocations.length>s.releases.length||r.allocations.some(a=>!Array.isArray(a)||a.length!==2||!releaseIndex.get(a[0])||!Number.isFinite(a[1])||a[1]<=0)||new Set(r.allocations.map(a=>a?.[0])).size!==r.allocations.length||Math.abs(r.allocations.reduce((n,a)=>n+(a?.[1]||0),0)-r.amount)>.03)errors.push('Reparto de liquidación inválido.');}
    errors.push(...validateManagement(s));
    errors.push(...validateCollaborations(s));
    errors.push(...ppvMarketingSystem().validate(s));
    errors.push(...(albumSystem()?.validate(s)||[]));
    errors.push(...(marketingSystem()?.validate(s)||[]));
    errors.push(...((root.RapMarketingModel||(typeof require==='function'?require('./marketing-model.js'):null))?.validate(s)||[]));
    const bandValidation=bandSystem()?.validate(s);
    if(bandValidation&&!bandValidation.ok)errors.push(...bandValidation.errors);
    // Reject non-JSON values and non-finite values anywhere, including imported metadata.
    const seen = new Set();
    function scan(v, depth) {
      if (depth > 30) { errors.push('Partida demasiado anidada.'); return; }
      switch(typeof v){
        case 'number': if(!Number.isFinite(v))errors.push('Número no finito.'); return;
        case 'undefined': case 'function': case 'symbol': case 'bigint': errors.push('Valor no serializable.'); return;
        case 'object':
          if(v){
            if(seen.has(v)){errors.push('Referencias circulares o compartidas no válidas.');return;}
            seen.add(v);for(const item of Object.values(v))scan(item,depth+1);
          }
          return;
        default: return;
      }
    }
    // Imports, exports and week boundaries validate the whole JSON graph. During
    // a running week historical charts are immutable and cannot affect outcomes.
    if (!tickOnly) scan(s, 0);
    return { ok: errors.length === 0, errors: [...new Set(errors)] };
  }
  function migrateSave(raw) {
    if (!raw || typeof raw !== 'object' || ![1, 2, 3,4].includes(raw.version)) throw new Error('Versión de partida no compatible.');
    let s;
    try { s = copy(raw); } catch (_) { throw new Error('La partida debe ser un objeto JSON sin referencias circulares.'); }
    if (s.version === 1) {
      // Only add new systems. Never repair or overwrite a malformed bank/player core.
      if (s.marketPrices === undefined) s.marketPrices = { index: 1000, music_stock: 1000, bond: 1000 };
      if (Array.isArray(s.assets)) for (const a of s.assets) if (a && ['index', 'music_stock', 'bond'].includes(a.catalogId) && Number.isFinite(a.value)) s.marketPrices[a.catalogId] = a.value;
      for (const key of ['featureOffers', 'features', 'licenses', 'receivables']) if (s[key] === undefined) s[key] = [];
      if (s.label === undefined) s.label = null;
      if (s.stats && typeof s.stats === 'object') for (const key of ['revenueAccrued', 'revenuePending', 'revenueSettled']) if (s.stats[key] === undefined) s.stats[key] = s.financialHold ? null : 0;
      s.version = 2;
      s.migration = { from: 1, to: 2, atWeek: s.week, note: 'Sistemas de industria y liquidación añadidos a partir de esta semana. No se retrotraen ni vuelven a cobrar ingresos del save anterior.' };
    }
    if (s.version === 2) {
      const day = (s.week - 1) * 7;
      s.calendar = { epoch: '2026-01-05', day, dayOfWeek: 0, date: calendarDate('2026-01-05', day), status: 'planning' };
      s.activeWeek = null; s.salesStartedDay = day; s.salesHistory = [];
      if (Array.isArray(s.releases)) for (const r of s.releases) if (r && typeof r === 'object') initializeDailyRelease(r, day, true);
      if (s.stats && typeof s.stats === 'object') for (const key of ['totalUnits', 'totalSalesRevenue']) s.stats[key] = s.financialHold ? null : 0;
      s.version = 3;
      s.migration = { from: raw.version, to: 3, atWeek: s.week, atDay: day, note: 'Calendario diario y ventas de copias activados desde este lunes. No se reconstruyen días anteriores; caja, catálogo acumulado, habilidades y semilla se conservan.' };
    }
    // Additive identity fields: infer labels only, never roll another city or grant a
    // background bonus to an existing career. Legacy budgets keep multiplier 1.
    if (s.player && typeof s.player === 'object' && !Array.isArray(s.player)) {
      const p = s.player;
      const origin = knownOrigin(p.origin);
      const additions = { initialGenre:genreId(p.style),visualStyle:defaultVisualStyle(genreId(p.style)),countryId: origin?.countryId ?? null, country: origin?.countryName ?? null, cityId: origin?.cityId ?? null, city: origin?.cityName ?? null, scene: origin?.scene ?? 'Escena de origen conservada', originLivingMultiplier: 1, originSeed: null, originSource: 'legacy', backgroundId: null, background: null };
      for (const [key, value] of Object.entries(additions)) if (p[key] === undefined) p[key] = value;
      if (p.appearance && typeof p.appearance === 'object' && !Array.isArray(p.appearance)) for (const [key, value] of Object.entries(catalog.appearance.defaults)) if (!['skin', 'hair', 'outfit', 'accent','pantsType','shoesType','hatType','neckType'].includes(key) && p.appearance[key] === undefined) p.appearance[key] = value;
    }
    if (s.career && s.career.firstProfitableShow === undefined) {
      const known = Array.isArray(s.history) ? s.history.filter(h => h && h.kind === 'show' && Number.isInteger(h.week) && h.week >= 1 && h.details && Number.isFinite(h.details.net) && h.details.net > 0 && typeof h.details.venue === 'string').sort((a, b) => a.week - b.week)[0] : null;
      s.career.firstProfitableShow = known ? { week: known.week, venue: known.details.venue, net: known.details.net } : null;
    }
    if(s.management&&s.calendar)ensureManagementTracking(s);
    ensurePpv(s);
    compactManagedProjects(s);
    compactSalesHistory(s);
    compactDuplicateDayReport(s);
    compactSettledReceipts(s);
    if (s.calendar && Array.isArray(s.releases)) { ensureIndustry(s); ensureCommerce(s); ensureManagement(s); bandSystem()?.ensure(s); }
    compactManagementTracking(s);
    setlistSystem()?.migrateLegacyEmpty(s);
    const check = validateSave(s);
    if (!check.ok) throw new Error('Partida inválida: ' + check.errors[0]);
    return s;
  }
  const api = { enableDailyAgenda, agendaQuote, agendaSummary, advanceMinutes, advanceTo, enterpriseSummary, livingBudgetSummary, ppvMarketingSummary, ppvCampaignQuote, marketingQuote, marketingSummary, marketingSpendable, clientSpendable, albumCampaignSummary, albumCampaignQuote, musicVideoQuote, musicVideoActionStatus, taxSummary, taxSpendable, createGame, createSavedGame, migrateSave, rollOrigin, localVenue, act, startWeek, advanceDay, advanceWeek, salesSummary, financeSeries, catalogueMarket, collaborationMarket, featureQuote, boostQuote, royaltyStatement, catalogOfferPreview, commerceSummary, bandSummary, managementSummary, managementActionStatus, managementDashboard, captureManagementCharts, netWorth, netWorthBreakdown, isVehicle, assetOperations, weeklyForecast, validateSave, unlockCriteria, catalog };
  root.RapEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
