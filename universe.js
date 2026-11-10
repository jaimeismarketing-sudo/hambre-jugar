/* RAPPER SIM: HAMBRE — external reference dataset, not a save file.
 * Small, selected observations verified on Kworb and Spotify on 2026-10-23.
 * Figures belong to the source's stated date. Never overwrite a player's canon.
 */
(function () {
  'use strict';
  const base = 'https://kworb.net/spotify/';
  const ids = {
    drake:'3TVXtAsR1Inumwj472S9r4', bad_bunny:'4q3ewBCX7sLwd24euuV69X',
    the_weeknd:'1Xyo4u8uXC1ZmMpatF05PJ', travis_scott:'0Y5tJX1MQlPlqiwlOH1tJY',
    kanye_west:'5K4W6rqBFWDnAN6FQUkS6x', eminem:'7dGJo4pcD2V6oG8kP0tJRR',
    kendrick_lamar:'2YZyLoL8N0Wb9xBt1NhZWg', karol_g:'790FomKkXshlbRYZFtlgla',
    taylor_swift:'06HL4z0CvFAxyc27GXpf02', rihanna:'5pKCCKE2ajJHZ9KAiaK11H',
    bruno_mars:'0du5cEVh5yTK9QJze8zA0C', j_balvin:'1vyhD5VmyZ7KMfW5gqLgo5',
    daddy_yankee:'4VMYDCV2IEDYJArk749S6m', duki:'1bAftSH8umNcGZ0uyV7LMg',
    sza:'7tYKF4w9nC0nq9CsPZTHyP', sixixnine:'7gZfnEnfiaHzxARJ2LeXrf'
  };
  const artists = [
    {id:'drake',name:'Drake',totalStreams:143332619836,dailyStreams:61865813,leadStreams:98903930911,soloStreams:55853643247,featureStreams:44428688925,monthlyListeners:94631500,tracks:560},
    {id:'taylor_swift',name:'Taylor Swift',totalStreams:132454451338,dailyStreams:47844699,leadStreams:128496133221,soloStreams:117621943328,featureStreams:3958318117,monthlyListeners:105412748,tracks:670},
    {id:'bad_bunny',name:'Bad Bunny',totalStreams:131489851759,dailyStreams:49177529,leadStreams:85650229610,soloStreams:51173035552,featureStreams:45839622149,monthlyListeners:91412466,tracks:271},
    {id:'the_weeknd',name:'The Weeknd',totalStreams:99407881659,dailyStreams:39726314,leadStreams:80116560435,soloStreams:52827126020,featureStreams:19291321224,monthlyListeners:116644295,tracks:320},
    {id:'kanye_west',name:'Kanye West',totalStreams:67419575882,dailyStreams:25191069,leadStreams:48261442824,soloStreams:29361428323,featureStreams:19158133058,monthlyListeners:70139246,tracks:480},
    {id:'travis_scott',name:'Travis Scott',totalStreams:67044654385,dailyStreams:18841483,leadStreams:36299801585,soloStreams:25960510590,featureStreams:30744852800,monthlyListeners:61155034,tracks:302},
    {id:'eminem',name:'Eminem',totalStreams:66197261793,dailyStreams:18906424,leadStreams:55800910813,soloStreams:33703490333,featureStreams:10396350980,monthlyListeners:72984694,tracks:408},
    {id:'rihanna',name:'Rihanna',totalStreams:63512167901,dailyStreams:31037029,leadStreams:47050521299,soloStreams:31841076066,featureStreams:16461646602,monthlyListeners:117028218,tracks:386},
    {id:'bruno_mars',name:'Bruno Mars',totalStreams:59778170525,dailyStreams:30318440,leadStreams:42907405927,soloStreams:35557145632,featureStreams:16870764598,monthlyListeners:128438090,tracks:125},
    {id:'kendrick_lamar',name:'Kendrick Lamar',totalStreams:58527867643,dailyStreams:17140368,leadStreams:41924391850,soloStreams:23959253757,featureStreams:16603475793,monthlyListeners:70053200,tracks:253},
    {id:'j_balvin',name:'J Balvin',totalStreams:56150956397,dailyStreams:16500719,leadStreams:26136973692,soloStreams:8091113903,featureStreams:30013982705,monthlyListeners:71148770,tracks:400},
    {id:'daddy_yankee',name:'Daddy Yankee',totalStreams:42932857144,dailyStreams:16866659,leadStreams:20518048416,soloStreams:11160040408,featureStreams:22414808728,monthlyListeners:64313496,tracks:482},
    {id:'sza',name:'SZA',totalStreams:40282980065,dailyStreams:16577370,leadStreams:26117290690,soloStreams:20501922030,featureStreams:14165689375,monthlyListeners:69498124,tracks:153},
    {id:'karol_g',name:'KAROL G',totalStreams:39927026904,dailyStreams:25472674,leadStreams:31714339063,soloStreams:15811298864,featureStreams:8212687841,monthlyListeners:69267476,tracks:166},
    {id:'duki',name:'Duki',totalStreams:15823441209,dailyStreams:3679307,leadStreams:8077758718,soloStreams:3516904956,featureStreams:7745682491,monthlyListeners:14598946,tracks:270},
    {id:'sixixnine',name:'6ix9ine',totalStreams:8377721333,dailyStreams:1813534,leadStreams:6989077521,soloStreams:2360890483,featureStreams:1388643812,monthlyListeners:14440373,tracks:97,dataDate:'2026-10-18'}
  ].map(a => ({...a,dataDate:a.dataDate || '2026-10-22',listenerDate:null,sourceId:a.id+'_songs',listenerSourceId:'listeners',isRealReference:true}));
  const sources = [
    {id:'artists',title:'Kworb · Spotify most streamed artists',url:base+'artists.html',date:null},
    {id:'listeners',title:'Kworb · Spotify monthly listeners',url:base+'listeners.html',date:null},
    {id:'albums',title:'Kworb · Spotify most streamed albums',url:base+'albums.html',date:null},
    ...artists.map(a => ({id:a.sourceId,title:'Kworb · '+a.name+' · songs',url:base+'artist/'+ids[a.id]+'_songs.html',date:a.dataDate})),
    {id:'bad_bunny_albums',title:'Kworb · Bad Bunny · albums',url:base+'artist/'+ids.bad_bunny+'_albums.html',date:'2026-10-22'},
    {id:'the_weeknd_albums',title:'Kworb · The Weeknd · albums',url:base+'artist/'+ids.the_weeknd+'_albums.html',date:'2026-10-21'},
    {id:'drake_albums',title:'Kworb · Drake · albums',url:base+'artist/'+ids.drake+'_albums.html',date:'2026-10-21'},
    {id:'travis_scott_albums',title:'Kworb · Travis Scott · albums',url:base+'artist/'+ids.travis_scott+'_albums.html',date:'2026-10-22'},
    {id:'kendrick_lamar_albums',title:'Kworb · Kendrick Lamar · albums',url:base+'artist/'+ids.kendrick_lamar+'_albums.html',date:'2026-10-22'},
    {id:'sza_albums',title:'Kworb · SZA · albums',url:base+'artist/'+ids.sza+'_albums.html',date:'2026-10-22'},
    {id:'sixixnine_albums',title:'Kworb · 6ix9ine · albums',url:base+'artist/'+ids.sixixnine+'_albums.html',date:'2026-10-18'},
    {id:'karol_g_albums',title:'Kworb · KAROL G · albums',url:base+'artist/'+ids.karol_g+'_albums.html',date:'2026-10-20'},
    ...['global','co','mx','us','es'].map(id => ({id:'chart_'+id,title:'Kworb · Spotify daily chart · '+id.toUpperCase(),url:base+'country/'+id+'_daily.html',date:'2026-10-21'})),
    {id:'spotify_audience',title:'Spotify for Artists · Audience segments',url:'https://support.spotify.com/mh/artists/article/audience-segments-on-spotify/',date:null},
    {id:'spotify_royalties',title:'Spotify Loud & Clear · How artists and songwriters get paid',url:'https://loudandclear.byspotify.com/faqs/how-do-artists-and-songwriters-get-paid/',date:null}
  ].map(s => ({...s,accessedAt:'2026-10-23'}));
  const albums = [
    {artist:'Bad Bunny',title:'Un Verano Sin Ti',totalStreams:24542603644,dailyStreams:7673341,sourceId:'bad_bunny_albums',dataDate:'2026-10-22',editionGroup:'uvst'},
    {artist:'Bad Bunny',title:'DeBÍ TiRAR MáS FOToS',totalStreams:13760866068,dailyStreams:10215931,sourceId:'bad_bunny_albums',dataDate:'2026-10-22',editionGroup:'dtmf'},
    {artist:'The Weeknd',title:'Starboy',totalStreams:18534461116,dailyStreams:6438870,sourceId:'the_weeknd_albums',dataDate:'2026-10-21',editionGroup:'starboy'},
    {artist:'Drake',title:'Views',totalStreams:12986397036,dailyStreams:4329042,sourceId:'drake_albums',dataDate:'2026-10-21',editionGroup:'views'},
    {artist:'Travis Scott',title:'ASTROWORLD',totalStreams:11966455005,dailyStreams:2735066,sourceId:'travis_scott_albums',dataDate:'2026-10-22',editionGroup:'astroworld'},
    {artist:'Kendrick Lamar',title:'DAMN.',totalStreams:11235761963,dailyStreams:2396519,sourceId:'kendrick_lamar_albums',dataDate:'2026-10-22',editionGroup:'damn'},
    {artist:'SZA',title:'SOS',totalStreams:14062949629,dailyStreams:4804540,sourceId:'sza_albums',dataDate:'2026-10-22',editionGroup:'sos'},
    {artist:'SZA',title:'SOS Deluxe: LANA',totalStreams:17152585198,dailyStreams:6450177,sourceId:'sza_albums',dataDate:'2026-10-22',editionGroup:'sos'},
    {artist:'KAROL G',title:'MAÑANA SERÁ BONITO',totalStreams:9238904385,dailyStreams:3025982,sourceId:'karol_g_albums',dataDate:'2026-10-20',editionGroup:'msb'},
    {artist:'6ix9ine',title:'DUMMY BOY (Revised)',totalStreams:3845282557,dailyStreams:1078594,sourceId:'sixixnine_albums',dataDate:'2026-10-18',editionGroup:'dummyboy'}
  ];
  const songs = [
    {artist:'The Weeknd',title:'Blinding Lights',totalStreams:5646215859,dailyStreams:1374328,dataDate:'2026-10-22',sourceId:'the_weeknd_songs',scope:'Spotify track count'},
    {artist:'Drake',title:'One Dance',totalStreams:4529127344,dailyStreams:1631893,dataDate:'2026-10-22',sourceId:'drake_songs',scope:'Spotify track count'},
    {artist:'Travis Scott',title:'goosebumps',totalStreams:3252834151,dailyStreams:824945,dataDate:'2026-10-22',sourceId:'travis_scott_songs',scope:'Spotify track count'},
    {artist:'Kendrick Lamar',title:'HUMBLE.',totalStreams:3010054513,dailyStreams:534659,dataDate:'2026-10-22',sourceId:'kendrick_lamar_songs',scope:'Spotify track count'},
    {artist:'6ix9ine',title:'MALA (feat. Anuel AA)',totalStreams:804235447,dailyStreams:566732,dataDate:'2026-10-18',sourceId:'sixixnine_songs',scope:'Spotify track count'},
    {artist:'6ix9ine',title:'GOOBA',totalStreams:552441783,dailyStreams:87115,dataDate:'2026-10-18',sourceId:'sixixnine_songs',scope:'Spotify track count'}
  ];
  const tiers = [
    {id:'street',name:'Underground',monthlyListeners:[0,10000],dailyStreams:[0,1000],description:'Escena local y primeros oyentes. Desarrollo de repertorio, comunidad y actuaciones pequeñas.'},
    {id:'indie',name:'Independiente emergente',monthlyListeners:[10000,100000],dailyStreams:[1000,10000],description:'Un público pequeño recurrente puede sostener actividad, con caja y costes vigilados.'},
    {id:'breakout',name:'En expansión',monthlyListeners:[100000,1000000],dailyStreams:[10000,100000],description:'Primeras giras por ciudades y acuerdos regionales. Un pico viral puede desaparecer.'},
    {id:'mid',name:'Artista consolidado',monthlyListeners:[1000000,10000000],dailyStreams:[100000,1000000],description:'La conversión a fans y la distribución territorial determinan qué recintos se pueden llenar.'},
    {id:'headliner',name:'Cabeza de cartel',monthlyListeners:[10000000,50000000],dailyStreams:[1000000,10000000],description:'Escala comparable a parte del rap y urbano internacional; no supone vender estadios en todas las plazas.'},
    {id:'superstar',name:'Superestrella global',monthlyListeners:[50000000,null],dailyStreams:[10000000,null],description:'Escala de varias referencias globales de esta muestra. Requiere catálogo, demanda y permanencia.'}
  ].map(t => ({...t,provenance:'Bandas propuestas para diseño: no son categorías oficiales de Spotify ni Kworb.',bounds:'Mínimo incluido; máximo excluido; cada eje se evalúa por separado.'}));
  const markets = [
    {id:'global',name:'Global',numberOneDaily:7122640,entry200Daily:1149614},
    {id:'co',name:'Colombia',numberOneDaily:357383,entry200Daily:46513},
    {id:'mx',name:'México',numberOneDaily:1379877,entry200Daily:202222},
    {id:'us',name:'Estados Unidos',numberOneDaily:2158905,entry200Daily:294973},
    {id:'es',name:'España',numberOneDaily:404262,entry200Daily:49582}
  ].map(m => ({...m,dataDate:'2026-10-21',sourceId:'chart_'+m.id,scope:'Streams de una canción en la lista diaria del territorio, no catálogo del artista.',fixedThreshold:false}));
  const youtubeChannels = [
    {id:'yt_bad_bunny',name:'Bad Bunny',handle:'badbunnypr',artistGroup:'bad_bunny',campaign:'LATAM',channelType:'artist_handle',subscribers:53300000,subscribersDisplay:'53.3M',totalViews:50126765208,videos:190,lastObservedViewChange:'2026-10-10'},
    {id:'yt_karol_g',name:'KAROL G',handle:'karolg',artistGroup:'karol_g',campaign:'LATAM',channelType:'artist_handle',subscribers:41600000,subscribersDisplay:'41.6M',totalViews:35443620508,videos:169,lastObservedViewChange:'2026-10-21'},
    {id:'yt_shakira',name:'Shakira',handle:'shakira',artistGroup:'shakira',campaign:'LATAM',channelType:'artist_handle',subscribers:54400000,subscribersDisplay:'54.4M',totalViews:39378667206,videos:420,lastObservedViewChange:'2026-10-16'},
    {id:'yt_daddy_yankee',name:'Daddy Yankee',handle:'daddyyankee',artistGroup:'daddy_yankee',campaign:'LATAM',channelType:'artist_handle',subscribers:41600000,subscribersDisplay:'41.6M',totalViews:29335060379,videos:594,lastObservedViewChange:'2026-10-11'},
    {id:'yt_j_balvin',name:'J Balvin',handle:'jbalvin',artistGroup:'j_balvin',campaign:'LATAM',channelType:'artist_handle',subscribers:35300000,subscribersDisplay:'35.3M',totalViews:28298452558,videos:394,lastObservedViewChange:null},
    {id:'yt_bizarrap',name:'Bizarrap',handle:'bizarrap',artistGroup:'bizarrap',campaign:'LATAM',channelType:'artist_handle',subscribers:23000000,subscribersDisplay:'23M',totalViews:11541048637,videos:94,lastObservedViewChange:null},
    {id:'yt_duki',name:'Duki',handle:'duki',artistGroup:'duki',campaign:'LATAM',channelType:'artist_handle',subscribers:7990000,subscribersDisplay:'7.99M',totalViews:5086424523,videos:198,lastObservedViewChange:'2026-10-22'},
    {id:'yt_karol_g_vevo',name:'KarolGVEVO',handle:'karolgvevo',artistGroup:'karol_g',campaign:'LATAM',channelType:'VEVO',subscribers:3920000,subscribersDisplay:'3.92M',totalViews:27857773670,videos:152,lastObservedViewChange:'2026-10-23'},
    {id:'yt_taylor_swift',name:'Taylor Swift',handle:'taylorswift',artistGroup:'taylor_swift',campaign:'USA_UNLOCKED',channelType:'artist_handle',subscribers:63500000,subscribersDisplay:'63.5M',totalViews:46864371906,videos:667,lastObservedViewChange:null},
    {id:'yt_eminem',name:'EminemMusic',handle:'eminem',artistGroup:'eminem',campaign:'USA_UNLOCKED',channelType:'artist_handle',subscribers:67400000,subscribersDisplay:'67.4M',totalViews:38760804274,videos:210,lastObservedViewChange:'2026-10-11'}
  ].map(c => ({...c,sourceId:'sb_'+c.handle,dataDate:'2026-10-23',dateBasis:'Última fila visible de la tabla; no garantiza actualización diaria del contador.',subscribersApproximate:true,officialArtistChannelVerified:null,last30DaysViews:null,last30DaysSubscribers:null,estimatedEarnings:null,aggregationPolicy:'do_not_sum_artist_channels',isRealReference:true}));
  const youtube = {
    asOf:'2026-10-23',offlineSnapshot:true,
    sources:[
      ...youtubeChannels.map(c => ({id:c.sourceId,title:'Social Blade · '+c.name+' · YouTube',url:'https://socialblade.com/youtube/handle/'+c.handle,date:'2026-10-23',dateBasis:'Última fila de la tabla consultada',accessedAt:'2026-10-23'})),
      {id:'youtube_oac',title:'YouTube Help · Introduction to Official Artist Channels',url:'https://support.google.com/youtube/answer/7336634?hl=en',date:null,accessedAt:'2026-10-23'},
      {id:'youtube_artist_analytics',title:'YouTube Help · Analytics for Artists',url:'https://support.google.com/youtube/answer/18736729?hl=en',date:null,accessedAt:'2026-10-23'}
    ],channels:youtubeChannels,
    scale:{
      purpose:'YouTube y Spotify son dos ejes independientes del universo. La escala LATAM admite estrellas de decenas de millones de suscriptores antes de abrir la campaña de Estados Unidos.',
      realLatamSample:{smallestArtistChannelSubscribers:7990000,largestArtistChannelSubscribers:54400000,smallestArtistChannelViews:5086424523,largestArtistChannelViews:50126765208,excludedFromSample:['yt_karol_g_vevo'],scope:'Extremos de los siete handles LATAM seleccionados; no extremos de toda la industria.'},
      proposedSubscriberBands:[
        {name:'Escena',min:0,max:100000},
        {name:'Emergente',min:100000,max:1000000},
        {name:'Consolidado',min:1000000,max:5000000},
        {name:'Estrella regional',min:5000000,max:20000000},
        {name:'Élite LATAM',min:20000000,max:50000000},
        {name:'Icono internacional',min:50000000,max:null}
      ],balanceStatus:'[PLACEHOLDER] Bandas de diseño pendientes de playtest; no clasificaciones oficiales.',
      rewardRule:'La campaña USA amplía mercados, rivales y posibilidades. No regala suscriptores, vistas, caja ni contratos por cruzar la puerta.'
    },
    notes:[
      'Las cifras son observaciones de las páginas públicas de Social Blade, un agregador independiente. No son datos privados de YouTube Analytics ni estados financieros de los artistas.',
      'Consulta: 23/10/2026. La última fila visible en las diez páginas es 23/10/2026, pero varias repiten el mismo total durante muchos días. La fecha de fila no demuestra que el contador esté recién actualizado.',
      'Suscriptores: se conserva el valor abreviado original y se marca como aproximado. 53.3M no demuestra exactamente 53,300,000 suscriptores.',
      'Los agregados de los últimos 30 días no aparecen con valor en las páginas abiertas. Se guardan null. Un guion o una secuencia plana no se convierten en cero actividad real.',
      'Las estimaciones de ingresos de Social Blade no se incorporan al motor económico y no se presentan como ingresos reales.',
      'KAROL G y KarolGVEVO son registros de canal separados con el mismo artistGroup. No sumar automáticamente vistas ni suscriptores. Se requiere reconciliar los identificadores de videos y el alcance de las métricas.',
      'YouTube explica que un Official Artist Channel puede consolidar suscriptores de canales existentes, Topic y VEVO. Social Blade no permite verificar aquí la insignia OAC de cada handle; officialArtistChannelVerified=null.',
      'Las métricas privadas de Analytics for Artists pueden abarcar contenido de otros canales según los filtros. No compararlas sin más con un contador público de canal.',
      'Las vistas históricas de un canal pueden abarcar varios formatos y muchos años. No equivalen a vistas de un videoclip nuevo, espectadores únicos ni tickets vendidos.',
      'LATAM es la campaña principal por decisión del usuario. Los artistas reales sirven como referencias de escala; no se inventan ofertas, opiniones, relaciones ni eventos personales de esas personas.'
    ]
  };
  const latam = {
    title:'LATAM · Campaña principal',defaultCampaign:'LATAM',provenance:'Diseño del juego a partir de la dirección del usuario; la configuración no es un ranking oficial.',
    markets:[
      {id:'co',name:'Colombia',cities:['Bogotá','Medellín','Cali'],chartSourceId:'chart_co'},
      {id:'mx',name:'México',cities:['Ciudad de México','Monterrey','Guadalajara'],chartSourceId:'chart_mx'},
      {id:'ar',name:'Argentina',cities:['Buenos Aires','Córdoba','Rosario'],chartSourceId:null},
      {id:'cl',name:'Chile',cities:['Santiago','Valparaíso','Concepción'],chartSourceId:null},
      {id:'pe',name:'Perú',cities:['Lima','Arequipa','Trujillo'],chartSourceId:null},
      {id:'pr',name:'Puerto Rico',cities:['San Juan','Ponce'],chartSourceId:null},
      {id:'do',name:'República Dominicana',cities:['Santo Domingo','Santiago de los Caballeros'],chartSourceId:null},
      {id:'br',name:'Brasil',cities:['São Paulo','Rio de Janeiro','Belo Horizonte'],chartSourceId:null}
    ].map(m => ({...m,kind:'campaign_market',audience:null,fanBase:null,venueDemand:null,rule:'Cada plaza desarrolla demanda y costes propios a partir de resultados del jugador. No asignar estadísticas regionales inventadas a los referentes reales.'})),
    campaignVictoryCriteria:{
      id:'latam_hard_v1',balanceStatus:'[PLACEHOLDER] Criterios de diseño pendientes de playtest.',difficulty:'hard',requiresAll:true,unknownDataPasses:false,
      purpose:'Hacer que pasar LATAM requiera una carrera sostenible y convocatoria en varios territorios, no solo tiempo o un pico viral.',
      engineInterface:'RapEngine.unlockCriteria(state)',
      criteria:[
        {id:'catalogue',label:'3 álbumes propios con calidad ≥70',metric:'completedQualityAlbums',min:3,minQuality:70,reason:'Exige desarrollar repertorio más allá de un single. El Deluxe no es un álbum original adicional.'},
        {id:'active_fans',label:'1.000.000 de fans activos',metric:'activeFans',min:1000000,reason:'La comunidad que permanece importa además del alcance. Oyentes mensuales, suscriptores y fans activos son métricas diferentes.'},
        {id:'regional_footprint',label:'Shows exitosos en 3 mercados LATAM',metric:'successfulLatamMarkets',min:3,reason:'La expansión requiere demanda en varias plazas. Una gira anunciada no cuenta como una gira realizada.'},
        {id:'sustainable_business',label:'52 semanas solvente y patrimonio ≥$2M',metric:'solventStreak',min:52,minNetWorth:2000000,reason:'Exige sostener la empresa un año de juego. Un préstamo incrementa caja y pasivos a la vez, no crea patrimonio por sí solo.'},
        {id:'professional_record',label:'Reputación ≥75 y sin préstamos en impago',metric:'professionalReputation',min:75,scale:100,noLoanDefault:true,reason:'La expansión requiere fiabilidad. El recoupment pendiente permitido por contrato se distingue de un préstamo en default.'}
      ],
      failureStates:['Una condición incompleta conserva USA bloqueado y muestra el progreso de cada requisito.','Una métrica desconocida queda pendiente, no se sustituye por cero ni por una victoria.','El jugador puede seguir creciendo, recuperar pérdidas y volver a intentarlo sin reiniciar su carrera.']
    },
    usaGate:{
      id:'usa_expansion',name:'Estados Unidos · Expansión',lockedByDefault:true,unlockedBy:'latam_hard_v1',requiresCampaignVictory:true,automaticTimeUnlock:false,automaticMoneyUnlock:false,
      reward:'Desbloquea una nueva campaña con ciudades, circuitos, rivales y acuerdos específicos de USA. LATAM y el historial permanecen disponibles.',
      opensWith:['Nueva demanda por ciudad que debe construirse','Costes y riesgos propios de la expansión','Negociaciones específicas y competencia de escala global'],
      doesNotGrant:['Fans o ventas garantizados','Dinero o patrimonio gratuito','Aceptación automática de un sello','Victoria automática contra artistas estadounidenses'],
      existingSaveRule:'No deducir victoria a partir de S914 ni de los referentes. Para una partida importada se evalúan pruebas históricas disponibles y se conservan como pendientes los datos desconocidos.',
      regionsAreGameplay:'Los mercados de la campaña son agrupaciones para jugar. Esta puerta no representa normas migratorias, geografía política ni permisos reales.'
    }
  };
  globalThis.RapUniverse = {
    version:1, asOf:'2026-10-23', timezone:'America/Bogota', offlineSnapshot:true,
    sources, artists, albums, songs, tiers, markets, youtube, latam,
    benchmark:{
      title:'Escala real, carreras abiertas',
      baseline:'sixixnine',
      measures:['dailyStreams','monthlyListeners','totalStreams','leadStreams','localDemand','activeFans','catalogueDepth'],
      comparisonRule:'Comparar el mismo alcance y periodo. Un álbum no se compara con todo un catálogo; vistas de video y ventas PPV son métricas separadas.',
      sixixnine:{dailyStreams:1813534,illustrativeWeekAtSamePace:12694738,totalStreams:8377721333,dataDate:'2026-10-18',monthlyListeners:14440373,listenerDataDate:null,derivedWeeklyIsMeasured:false,derivedWeeklyIsForecast:false},
      saveHandling:'La partida de SANTO no trae streams históricos completos ni oyentes actuales verificados. No asignar rango ni declarar que superó a nadie con el número de semana.'
    },
    mechanics:[
      {id:'unbounded_career',title:'La semana no concede fama',kind:'design',text:'El tiempo permite proyectos y aprendizaje; no otorga escalones de audiencia. Puede haber carreras pequeñas, rentables, estancadas, retiradas o gigantes después de 900 semanas.'},
      {id:'multi_axis',title:'Audiencia, catálogo y convocatoria',kind:'design',text:'Mostrar por separado oyentes de 28 días, streams nuevos de la semana, total del catálogo, base activa y demanda por ciudad. No convertirlos con una proporción universal.'},
      {id:'cohorts',title:'Cohortes de fans',kind:'design',sourceId:'spotify_audience',text:'Distinguir descubrimiento programado, escucha activa y fans recurrentes. Publicidad puede comprar alcance; retención y compra dependen también del repertorio, precio y mercado.'},
      {id:'release_curve',title:'Lanzamientos con cola',kind:'design',text:'Simular pico, retención, descenso, catálogo recurrente y reactivación. El presupuesto aumenta exposición con saturación y riesgo; no garantiza streams ni un hit.'},
      {id:'deluxe_overlap',title:'Deluxe sin duplicación',kind:'design',text:'Cada grabación tiene un identificador único. Una canción compartida entre álbum original, Deluxe y recopilación genera un solo evento económico; la visualización de cada edición puede contener el mismo consumo.'},
      {id:'features',title:'Colaboraciones',kind:'design',text:'Separar consumo como artista principal y como invitado, caché, propiedad, splits y obligaciones de promoción. La exposición compartida no equivale a incorporar todos los fans del invitado.'},
      {id:'territories',title:'Mercados con demanda propia',kind:'design',text:'El umbral observado de una lista es una referencia fechada. La simulación mueve la competencia cada semana y calcula cada ciudad con fans, disposición a viajar, precio y fechas rivales.'},
      {id:'royalty_waterfall',title:'Streams y liquidaciones',kind:'design',sourceId:'spotify_royalties',text:'Spotify describe reparto por participación del consumo y pago a titulares. El juego debe separar estimación, ingresos devengados, comisión, reparto contractual, recuperación de anticipo y llegada bancaria; cualquier rendimiento monetario simulado se etiqueta como supuesto.'},
      {id:'world_cycles',title:'Un mundo que también actúa',kind:'design',text:'Los artistas ficticios publican, descansan, hacen giras, cambian de equipo y compiten por atención. No escalar sus números automáticamente con los del jugador; permitir éxitos, fracasos y mercados paralelos.'},
      {id:'superstar_ceiling',title:'Éxito posible sin premio automático',kind:'design',text:'Los benchmarks altos amplían el techo del universo. Alcanzarlos requiere resultados sostenidos; ni el protagonista ni un contrato grande reciben audiencia garantizada.'}
    ],
    notes:[
      'Datos observados: selección pequeña, no reproducción completa de rankings. Kworb es un agregador independiente, no una certificación de Spotify.',
      'Fechas distintas: la mayoría de perfiles de canciones son del 22/10/2026; 6ix9ine del 18/10/2026; álbumes del 18–22/10/2026; listas por país del 21/10/2026. Consulta: 23/10/2026.',
      'La tabla de oyentes no expone fecha interna de actualización en la página consultada. listenerDate=null significa fecha de datos desconocida, nunca cero.',
      'Oyentes mensuales representan personas únicas de los últimos 28 días y pueden incluir escucha programada. No equivalen a compradores ni a fans que viajarían a un concierto.',
      'Los perfiles de artistas distinguen principal, solo y colaborador. Solo es un subconjunto de principal: no sumar las tres columnas. No sumar totales de artistas para calcular el mercado porque comparten canciones.',
      'Álbumes: las ediciones pueden compartir grabaciones y su consumo. SOS y LANA comparten editionGroup; nunca sumar sus cifras como grabaciones únicas. Las páginas de artistas pueden contener álbumes ajenos con una colaboración.',
      'No mezclar los totales de presencia en charts con streams históricos de una canción: las listas no cuentan sus días fuera de la tabla y sus alcances pueden diferir.',
      'Una observación diaria no prueba una tendencia ni una trayectoria profesional. La semana ilustrativa de 6ix9ine solo multiplica ese día por siete; no es una semana histórica verificada.',
      'No se incluyeron contratos, ingresos, costes de gira, patrimonio ni estados personales de artistas reales. Kworb no demuestra esas variables.',
      'Las bandas de carrera, curvas, probabilidades y conversiones son decisiones de diseño separadas de los hechos observados. Pueden recalibrarse sin reescribir el historial de una partida.',
      'S914 de SANTO es una muestra de continuidad aportada por el usuario. Este módulo no modifica caja, contratos, anticipos, derechos, canciones ni semanas de esa muestra.'
    ]
  };
})();
