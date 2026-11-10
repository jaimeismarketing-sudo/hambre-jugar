/* Original Rapper Sim vector art. No remote assets, embedded scripts, or real-person likenesses. */
(function () {
  'use strict';
  const P = { ink: '#191623', bone: '#f2ede3', copper: '#e57851', lilac: '#a79ad6', blue: '#7ca9c5' };
  let instance = 0;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const own = (object, name, fallback) => Object.prototype.hasOwnProperty.call(object, name) ? object[name] : fallback;
  const color = (value, fallback) => typeof value === 'string' && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value) ? value : fallback;
  function shade(hex, amount) {
    const h = hex.length === 4 ? '#' + hex.slice(1).split('').map(c => c+c).join('') : hex;
    return '#' + [1,3,5].map(i => Math.max(0, Math.min(255, parseInt(h.slice(i,i+2),16) + amount)).toString(16).padStart(2,'0')).join('');
  }
  const cast = {
    santo:    { name:'SANTO', skin:'#a96b4d', accent:P.copper, outfit:'#343040', hair:'braids', head:0, tilt:-3, cut:'coat', mood:'confident', detail:'chain' },
    dante:    { name:'DANTE', skin:'#c28a65', accent:P.blue, outfit:'#465365', hair:'quiff', head:1, tilt:3, cut:'bomber', mood:'focused', detail:'glasses' },
    zayro:    { name:'ZAYRO', skin:'#98694f', accent:P.lilac, outfit:'#49405b', hair:'hood', head:2, tilt:-5, cut:'hood', mood:'focused', detail:'earring' },
    isabella: { name:'Isabella Reyes', skin:'#bb7b57', accent:P.lilac, outfit:'#59506e', hair:'bun', head:3, tilt:4, cut:'blazer', mood:'confident', detail:'earrings' },
    leon:     { name:'León Vargas', skin:'#b98a6a', accent:P.copper, outfit:'#463844', hair:'crop', head:1, tilt:-4, cut:'coat', mood:'focused', detail:'beard' },
    malik:    { name:'Malik Santos', skin:'#76503f', accent:P.blue, outfit:'#364b56', hair:'afro', head:0, tilt:5, cut:'bomber', mood:'happy', detail:'headphones' },
    camila:   { name:'Camila Nova', skin:'#ce9472', accent:P.copper, outfit:'#725059', hair:'long', head:3, tilt:-5, cut:'biker', mood:'happy', detail:'earrings' },
    damian:   { name:'Damián Ríos', skin:'#a46d51', accent:P.blue, outfit:'#3c4556', hair:'curls', head:2, tilt:2, cut:'blazer', mood:'thinking', detail:'stubble' },
    adrian:   { name:'Adrián Vega', skin:'#d0a180', accent:P.lilac, outfit:'#4a3f59', hair:'sidepart', head:1, tilt:-2, cut:'blazer', mood:'confident', detail:'glasses' },
    gael:     { name:'Gael Montero', skin:'#b67f59', accent:P.blue, outfit:'#445957', hair:'cap', head:0, tilt:6, cut:'bomber', mood:'happy', detail:'earring' },
    manager:  { name:'Manager', skin:'#ac795f', accent:P.lilac, outfit:'#4d435e', hair:'bun', head:3, tilt:2, cut:'blazer', mood:'thinking', detail:'glasses' },
    promoter: { name:'Promotor', skin:'#c4916b', accent:P.copper, outfit:'#68504d', hair:'sidepart', head:1, tilt:-3, cut:'blazer', mood:'happy', detail:'stubble' },
    rival:    { name:'Rival', skin:'#96654e', accent:P.blue, outfit:'#3c425e', hair:'curls', head:2, tilt:-6, cut:'biker', mood:'angry', detail:'earring' }
  };
  function profile(id) {
    const k = key(id);
    return own(cast, k, null) || Object.values(cast).find(p => key(p.name) === k) || cast.santo;
  }
  const svg = (viewBox, label, body, extra='') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label)}" ${extra}><title>${esc(label)}</title>${body}</svg>`;

  function portrait(id, opts = {}) {
    if (!opts || typeof opts !== 'object') opts = {};
    const c = profile(id), u = 'rap-art-p' + (++instance);
    const skinNames = { light:'#d5aa89', medium:'#b17b59', deep:'#79513f', claro:'#d5aa89', medio:'#b17b59', oscuro:'#79513f' };
    const skin = color(opts.skin, own(skinNames, key(opts.skin), c.skin));
    const accent = color(opts.accent, own(P, key(opts.accent), c.accent));
    const outfit = color(opts.outfit, own(P, key(opts.outfit), c.outfit));
    const hairColor = color(opts.hair, '#28212c');
    const styles = ['braids','short','crop','quiff','hood','bun','afro','long','curls','sidepart','cap','bald'];
    const hair = styles.includes(key(opts.hair)) ? key(opts.hair) : c.hair;
    const moodAliases = { alegre:'happy', feliz:'happy', enfadado:'angry', triste:'sad', cansado:'tired', sorprendido:'surprised', pensando:'thinking', serio:'focused', confiado:'confident' };
    const mood = own(moodAliases, key(opts.mood), null) || key(opts.mood) || c.mood;
    const jaw = [225,231,236,224][c.head], left = [133,126,137,137][c.head], right = [227,234,224,222][c.head];
    const face = `M${left} 132 Q${left-6} 94 178 88 Q${right+12} 91 ${right} 139 L${right-2} 182 Q${right-6} 214 182 ${jaw} Q${left+6} 216 ${left} 182Z`;
    const collar = c.cut === 'hood' || hair === 'hood';
    let clothes;
    if (collar) {
      clothes = `<path d="M66 427 77 326Q82 280 125 254L155 241H211L241 260Q277 280 285 324L305 440H61Z" fill="url(#${u}-coat)"/>
        <path d="M122 265 156 247 181 291 211 246 247 271 215 322H146Z" fill="${shade(outfit,-19)}"/>
        <path d="M158 293 153 359M206 293 216 350" stroke="${P.bone}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="153" cy="361" r="4" fill="${accent}"/><circle cx="217" cy="352" r="4" fill="${accent}"/>
        <path d="M124 400Q182 382 247 398L253 430H119Z" fill="none" stroke="${shade(outfit,26)}" stroke-width="2"/>`;
    } else if (c.cut === 'blazer' || c.cut === 'coat') {
      clothes = `<path d="M52 440 67 333Q70 294 121 267L153 252H209L246 268Q285 291 293 335L312 440Z" fill="url(#${u}-coat)"/>
        <path d="M142 266 181 294 218 264 225 440H137Z" fill="${shade(outfit,-27)}"/>
        <path d="M128 267 151 253 177 295 150 330 171 349 145 440H82L92 337Z" fill="${shade(outfit,14)}"/>
        <path d="M218 258 240 269 271 337 283 440H200L189 350 214 329 187 295Z" fill="${outfit}"/>
        <path d="M151 255 177 295 150 330 171 349M218 259 187 295 214 329 189 350" fill="none" stroke="${shade(outfit,49)}" stroke-width="2"/>
        <path d="M233 343H263M232 348H260" stroke="${accent}" stroke-width="3"/>
        <circle cx="202" cy="385" r="3.5" fill="${accent}"/><circle cx="198" cy="418" r="3.5" fill="${accent}"/>`;
    } else {
      clothes = `<path d="M50 440 62 339Q71 291 122 268L151 255H211L247 269Q290 290 298 341L313 440Z" fill="url(#${u}-coat)"/>
        <path d="M141 265 180 289 217 265 222 440H138Z" fill="${shade(outfit,-27)}"/>
        <path d="M126 269 150 252 178 291 143 323 123 306 112 440H66L76 342Z" fill="${shade(outfit,17)}"/>
        <path d="M216 256 245 273 286 346 300 440H235L218 308 190 291Z" fill="${outfit}"/>
        <path d="M124 273 142 322 119 440M216 269 225 318 241 440" fill="none" stroke="${shade(outfit,47)}" stroke-width="2"/>
        <path d="M78 362 112 370M252 360 283 349" stroke="${accent}" stroke-width="5"/>
        ${c.cut === 'biker' ? `<path d="M229 305 172 436" stroke="${P.bone}" stroke-width="3"/><path d="M247 331 270 348" stroke="${P.bone}" stroke-width="3"/>` : `<path d="M62 422Q182 438 309 421V440H62Z" fill="${shade(outfit,-14)}"/>`}`;
    }
    let hairBack = '', hairFront = '';
    if (hair === 'long') hairBack = `<path d="M116 159Q101 77 165 65 231 58 241 116L258 296 223 307 204 195 149 191 139 288 102 286Z" fill="${hairColor}"/>`;
    if (hair === 'hood') hairBack = `<path d="M102 270Q91 203 105 129 115 64 179 60 246 61 258 130L262 268 224 284 134 284Z" fill="${shade(outfit,10)}" stroke="${shade(outfit,39)}" stroke-width="3"/><path d="M122 235Q105 149 137 103 179 73 220 104 248 148 238 233L209 257H150Z" fill="${shade(outfit,-30)}"/>`;
    if (hair === 'afro') hairBack = `<path d="M116 179Q89 159 108 139 83 115 109 96 97 74 126 63 128 40 157 49 180 26 200 48 233 41 239 68 271 76 253 104 274 129 251 147 254 174L223 193H139Z" fill="${hairColor}"/>`;
    if (hair === 'braids') {
      hairFront = `<path d="M128 144 127 116Q131 79 179 77 231 81 233 125L226 150 215 113 147 111 136 147Z" fill="${hairColor}"/>`;
      for (let i=0;i<6;i++) hairFront += `<path d="M${141+i*13} 111Q${132+i*15} 80 ${157+i*7} 82" fill="none" stroke="${shade(hairColor,36)}" stroke-width="4"/>`;
      hairFront += `<path d="M131 121Q119 157 127 200M228 125Q241 160 233 207" fill="none" stroke="${hairColor}" stroke-width="9" stroke-linecap="round"/><path d="M124 185 131 186M230 190 238 192" stroke="${accent}" stroke-width="4"/>`;
    } else if (hair === 'quiff') hairFront = `<path d="M126 148 119 111 135 83 139 65 191 54 231 70 243 100 228 151 220 115 204 105 143 118 137 150Z" fill="${hairColor}"/><path d="M139 91 199 72 222 81M140 102 199 85" stroke="${shade(hairColor,33)}" stroke-width="3" fill="none"/>`;
    else if (hair === 'crop' || hair === 'short') hairFront = `<path d="M${left-4} 152 ${left-9} 119Q${left-3} 81 181 80Q${right+9} 85 ${right+4} 123L${right-1} 152 ${right-10} 118 147 116 139 152Z" fill="${hairColor}"/><path d="M147 103Q180 92 211 105" stroke="${shade(hairColor,30)}" stroke-width="3" fill="none"/>`;
    else if (hair === 'bun') hairFront = `<circle cx="185" cy="68" r="25" fill="${hairColor}"/><path d="M133 150Q112 103 140 85 183 60 221 88 245 112 224 154L214 116 155 108 141 154Z" fill="${hairColor}"/><path d="M139 111Q168 81 206 94" fill="none" stroke="${shade(hairColor,35)}" stroke-width="3"/><path d="M164 79 202 80" stroke="${accent}" stroke-width="3"/>`;
    else if (hair === 'curls') {
      hairFront = `<path d="M127 151 119 111Q127 72 181 74 230 72 237 117L226 150 214 112 146 118 138 151Z" fill="${hairColor}"/>`;
      for(let i=0;i<8;i++) hairFront += `<circle cx="${132+i*13}" cy="${99-(i%3)*7}" r="15" fill="${hairColor}"/><path d="M${128+i*13} ${95-(i%3)*7}q6-5 9 2" fill="none" stroke="${shade(hairColor,33)}" stroke-width="2"/>`;
    } else if (hair === 'sidepart') hairFront = `<path d="M125 154 120 114Q125 76 174 76 223 72 238 105L231 155 219 116 206 103Q182 125 142 120L136 155Z" fill="${hairColor}"/><path d="M144 107Q174 105 199 87M151 116Q180 113 205 95" stroke="${shade(hairColor,35)}" stroke-width="3" fill="none"/>`;
    else if (hair === 'cap') hairFront = `<path d="M119 125 126 89Q178 57 226 87L236 126Z" fill="${shade(outfit,-12)}"/><path d="M117 121Q194 110 252 137L244 149Q175 132 117 135Z" fill="${accent}"/><path d="M178 80V115" stroke="${shade(outfit,28)}" stroke-width="2"/><path d="M156 101h26" stroke="${P.bone}" stroke-width="3"/>`;
    else if (hair === 'long') hairFront = `<path d="M128 157Q114 104 145 82 184 64 220 91L233 160 220 151 204 106Q176 137 142 138L138 160Z" fill="${hairColor}"/><path d="M127 147Q129 109 174 87M231 135 244 274" stroke="${shade(hairColor,31)}" stroke-width="3" fill="none"/>`;
    let brows = `<path d="M145 150q13-7 25-1M191 148q13-6 25 1"/>`;
    if (mood === 'angry') brows = `<path d="M145 144 170 152M191 152 215 143"/>`;
    if (mood === 'sad' || mood === 'tired') brows = `<path d="M145 151 170 144M191 144 215 150"/>`;
    if (mood === 'surprised') brows = `<path d="M145 139q13-8 25-1M191 138q13-8 25 0"/>`;
    const eyes = mood === 'happy' ? `<path d="M148 164q10-9 20 0M194 164q10-9 20 0" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/>` : `<path d="M145 162q13-8 26 0-13 10-26 0M191 162q13-8 26 0-13 10-26 0" fill="${P.bone}"/><ellipse cx="160" cy="162" rx="4" ry="${mood==='surprised'?6:4.5}" fill="${P.ink}"/><ellipse cx="203" cy="162" rx="4" ry="${mood==='surprised'?6:4.5}" fill="${P.ink}"/><path d="M146 162q12-9 25 0M191 162q13-9 26 0" fill="none" stroke="${P.ink}" stroke-width="2"/>`;
    const mouths = {
      happy:`<path d="M159 199Q181 220 204 197Q183 228 159 199Z" fill="${shade(skin,-62)}"/><path d="M164 201Q181 211 199 200" stroke="${P.bone}" stroke-width="4" fill="none"/>`,
      surprised:`<ellipse cx="182" cy="205" rx="9" ry="12" fill="${shade(skin,-65)}"/><path d="M177 199q5-3 10 0" stroke="${P.bone}" stroke-width="2"/>`,
      sad:`<path d="M162 208q19-14 38-1" stroke="${shade(skin,-61)}" stroke-width="3" fill="none"/>`,
      tired:`<path d="M164 206h34" stroke="${shade(skin,-65)}" stroke-width="3"/><path d="M147 175h21M194 175h19" stroke="${shade(skin,-24)}" stroke-width="2"/>`,
      angry:`<path d="M161 207q20-9 39-1" stroke="${shade(skin,-65)}" stroke-width="3.5" fill="none"/>`,
      thinking:`<path d="M164 204 195 201" stroke="${shade(skin,-65)}" stroke-width="3" stroke-linecap="round"/>`,
      confident:`<path d="M161 202q19 12 41-3" stroke="${shade(skin,-65)}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    };
    let details = '';
    if (c.detail === 'glasses') details += `<path d="M138 154h36v23h-34zM188 154h36l-2 23h-34z" fill="${P.ink}" fill-opacity=".65" stroke="${accent}" stroke-width="3"/><path d="M174 160q8-5 14 0M130 158h9M224 158h9" stroke="${accent}" stroke-width="3"/><path d="M144 158h23M193 158h23" stroke="${P.bone}" stroke-opacity=".4" stroke-width="2"/>`;
    if (c.detail === 'beard') details += `<path d="M133 179 150 200 165 200 181 212 199 199 214 195 230 177 224 213 183 242 148 221Z" fill="${hairColor}" opacity=".9"/><path d="M164 205q17 10 35-1" stroke="${skin}" stroke-width="2" fill="none"/>`;
    if (c.detail === 'stubble') details += `<path d="M145 195 151 211 181 230 211 212 218 195" stroke="${hairColor}" stroke-opacity=".38" stroke-width="7" stroke-dasharray="1 4" fill="none"/>`;
    if (c.detail === 'earring' || c.detail === 'earrings') details += `<circle cx="${left-5}" cy="182" r="6" fill="none" stroke="${accent}" stroke-width="3"/>${c.detail==='earrings'?`<circle cx="${right+5}" cy="182" r="6" fill="none" stroke="${accent}" stroke-width="3"/>`:''}`;
    if (c.detail === 'headphones') details += `<path d="M119 160Q102 83 180 76 259 82 241 162" fill="none" stroke="${accent}" stroke-width="9"/><rect x="112" y="144" width="20" height="42" rx="9" fill="${P.ink}" stroke="${accent}" stroke-width="3"/><rect x="228" y="144" width="20" height="42" rx="9" fill="${P.ink}" stroke="${accent}" stroke-width="3"/>`;
    const chain = c.detail==='chain' ? `<path d="M145 272Q179 333 215 269" fill="none" stroke="${accent}" stroke-width="3"/><rect x="177" y="307" width="10" height="14" rx="2" fill="${accent}"/>` : '';
    return svg('0 0 360 440', `${String(opts.name||c.name).slice(0,60)}, retrato ficticio ilustrado`, `<defs>
      <linearGradient id="${u}-bg" x2="1" y2="1"><stop stop-color="${shade(P.ink,16)}"/><stop offset="1" stop-color="${P.ink}"/></linearGradient>
      <linearGradient id="${u}-skin" x2="1" y2=".8"><stop stop-color="${shade(skin,25)}"/><stop offset=".65" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin,-24)}"/></linearGradient>
      <linearGradient id="${u}-coat" x2="1" y2="1"><stop stop-color="${shade(outfit,20)}"/><stop offset="1" stop-color="${shade(outfit,-17)}"/></linearGradient>
      <clipPath id="${u}-clip"><rect width="360" height="440" rx="3"/></clipPath>
      </defs><g clip-path="url(#${u}-clip)">
      <rect width="360" height="440" fill="url(#${u}-bg)"/>
      <circle cx="183" cy="176" r="137" fill="${accent}" fill-opacity=".13"/><circle cx="183" cy="176" r="137" fill="none" stroke="${accent}" stroke-opacity=".44"/>
      <path d="M0 340 360 202V440H0Z" fill="${accent}" fill-opacity=".08"/><path d="M25 33H104M25 33V79M336 361V408H291" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity=".8"/>
      <path d="M279 52v22m-11-11h22" stroke="${P.bone}" stroke-opacity=".35" stroke-width="1.5"/>
      <g transform="rotate(${c.tilt} 180 276)">${hairBack}${clothes}
      <path d="M155 212 153 261Q178 290 210 258L207 211Z" fill="${shade(skin,-10)}"/>
      <path d="M156 227q25 21 51-2v21q-25 18-52-4Z" fill="${shade(skin,-32)}"/>
      <ellipse cx="${left-2}" cy="163" rx="11" ry="21" fill="${skin}"/><ellipse cx="${right+1}" cy="164" rx="10" ry="20" fill="${shade(skin,-10)}"/>
      <path d="${face}" fill="url(#${u}-skin)" stroke="${shade(skin,-26)}" stroke-width="1.3"/>
      <path d="M${left+3} 174 156 192 177 217 158 216 ${left+3} 194Z" fill="${shade(skin,-8)}"/><path d="M218 138 211 187 189 224 210 214 226 184Z" fill="${shade(skin,-20)}" fill-opacity=".6"/>
      <path d="M178 157 170 184 184 188" fill="none" stroke="${shade(skin,-36)}" stroke-width="2.5" stroke-linecap="round"/><path d="M185 185h7" stroke="${shade(skin,35)}" stroke-width="2"/>
      <g stroke="${hairColor}" stroke-width="4" stroke-linecap="round" fill="none">${brows}</g>${eyes}
      ${own(mouths, mood, `<path d="M164 204q18 4 35-1" stroke="${shade(skin,-62)}" stroke-width="3" fill="none" stroke-linecap="round"/>`)}
      <path d="M169 217q13 4 25-1" fill="none" stroke="${shade(skin,20)}" stroke-width="2"/>
      ${hairFront}${details}${chain}</g>
      <rect y="430" width="360" height="10" fill="${accent}"/></g>`);
  }

  function stage(kind = 'arena') {
    const u = 'rap-art-s' + (++instance), k = key(kind);
    const studio = /studio|estudio/.test(k), intimate = /club|bar|sala|theater|teatro|small|local/.test(k);
    const accent = studio ? P.blue : intimate ? P.copper : P.lilac;
    const label = studio ? 'Estudio de grabación ilustrado' : intimate ? 'Sala de conciertos ilustrada' : 'Arena de conciertos ilustrada';
    let crowd = '';
    const rows = intimate ? 3 : 5;
    for(let row=0;row<rows;row++) {
      const count = 22 + row*5, y = 337 + row*35, radius = 7+row*2;
      for(let i=0;i<count;i++) {
        const x = (i+.5)*1100/count + ((row%2)*7), h = (i*13+row*7)%13;
        crowd += `<path d="M${x-radius*1.7} 505V${y+radius*2-h}q${radius*1.7}-${radius*2} ${radius*3.4} 0V505Z" fill="${row%2?shade(P.ink,-5):shade(P.ink,7)}"/><circle cx="${x}" cy="${y-h}" r="${radius}" fill="${row%2?shade(P.ink,7):shade(P.ink,15)}"/>`;
        if ((i+row)%6===0) crowd += `<path d="M${x+radius} ${y+20-h} ${x+radius*2} ${y-18-h} ${x+radius*1.7} ${y-30-h}" stroke="${shade(P.ink,13)}" stroke-width="${radius*.75}" fill="none" stroke-linecap="round"/>`;
        if ((i+row)%11===0) crowd += `<rect x="${x-15}" y="${y-30-h}" width="6" height="10" rx="1" fill="${P.bone}" fill-opacity=".75"/>`;
      }
    }
    let scene;
    if(studio) {
      scene = `<path d="M0 0 270 95V332L0 500ZM1100 0 830 95V332L1100 500Z" fill="#272334"/><path d="M270 95H830V332H270Z" fill="#332c41" stroke="${P.lilac}" stroke-opacity=".3"/>
        ${[0,1,2,3,4,5].map(i=>`<path d="M${290+i*86} 112h60v182h-60Z" fill="${i%2?'#44384a':'#241f2f'}"/>`).join('')}
        <rect x="404" y="119" width="293" height="153" rx="4" fill="#121521" stroke="${P.blue}" stroke-opacity=".6" stroke-width="3"/>
        <path d="M430 214V182L444 198 459 158 473 225 488 173 503 212 519 189 534 208 550 148 566 229 580 176 595 201 611 167 627 222 644 187 671 204" fill="none" stroke="${P.blue}" stroke-width="3"/>
        <path d="M262 333H838L1016 500H73Z" fill="#473c4b"/><path d="M283 363 817 363 900 465H200Z" fill="#191c2b" stroke="${P.lilac}" stroke-width="2"/>
        ${Array.from({length:16},(_,i)=>`<path d="M${297+i*31} 382  ${278+i*34} 440" stroke="${P.bone}" stroke-opacity=".25" stroke-width="3"/><circle cx="${297+i*31}" cy="385" r="3" fill="${i%3?P.blue:P.copper}"/>`).join('')}
        <rect x="153" y="221" width="102" height="132" rx="5" fill="${P.ink}"/><circle cx="204" cy="267" r="29" fill="#353346" stroke="${P.bone}" stroke-opacity=".2"/><circle cx="204" cy="267" r="12" fill="${P.ink}"/><circle cx="204" cy="323" r="12" fill="#353346"/>
        <rect x="849" y="221" width="102" height="132" rx="5" fill="${P.ink}"/><circle cx="900" cy="267" r="29" fill="#353346" stroke="${P.bone}" stroke-opacity=".2"/><circle cx="900" cy="267" r="12" fill="${P.ink}"/><circle cx="900" cy="323" r="12" fill="#353346"/>
        <path d="M754 182V347M731 347H778" stroke="${P.bone}" stroke-width="4"/><rect x="743" y="164" width="22" height="43" rx="11" fill="${P.blue}"/><ellipse cx="754" cy="185" rx="27" ry="33" fill="none" stroke="${P.lilac}" stroke-width="2"/>
        <path d="M476 458Q549 392 619 458V500H476Z" fill="#282334"/><rect x="491" y="403" width="110" height="70" rx="28" fill="#2e293b" stroke="${P.lilac}" stroke-opacity=".35"/>
        <path d="M42 94V297M65 105V279M1036 94V297M1013 105V279" stroke="${P.copper}" stroke-width="9" stroke-opacity=".35"/>`;
    } else {
      const backY = intimate ? 120 : 96;
      scene = `<path d="M0 0 211 ${backY}H889L1100 0Z" fill="#282233"/><path d="M0 0 211 ${backY}V310L0 439ZM1100 0 889 ${backY}V310L1100 439Z" fill="#30273b"/>
        <path d="M211 ${backY}H889V309H211Z" fill="#211b2c"/>
        ${!intimate ? `<path d="M0 145 195 208V236L0 188ZM1100 145 905 208V236L1100 188Z" fill="#564355"/><path d="M0 223 191 267V283L0 260ZM1100 223 909 267V283L1100 260Z" fill="#614c60"/><path d="M17 157 174 210M1083 157 926 210" stroke="${P.copper}" stroke-opacity=".5" stroke-width="3"/>` : `<path d="M93 48V310M1007 48V310" stroke="#554150" stroke-width="26"/><path d="M0 77 1100 77" stroke="#544052" stroke-width="12"/>`}
        <path d="M184 302H916L984 348H116Z" fill="#67506b"/><path d="M116 348H984V365H116Z" fill="#393043"/>
        <rect x="333" y="${backY+22}" width="434" height="162" fill="#292335" stroke="${accent}" stroke-width="1"/>
        <circle cx="550" cy="${backY+101}" r="65" fill="${accent}" fill-opacity=".12"/>
        <path d="M483 ${backY+130} 528 ${backY+66} 551 ${backY+102} 578 ${backY+49} 623 ${backY+130}" fill="none" stroke="${accent}" stroke-opacity=".7" stroke-width="3"/>
        <text x="550" y="${backY+155}" text-anchor="middle" fill="${P.bone}" font-family="Georgia,serif" font-size="18" letter-spacing="7">LIVE</text>
        <path d="M192 54H908M192 65H908" stroke="#7c657f" stroke-width="3"/>
        ${Array.from({length:10},(_,i)=>`<path d="M${194+i*70} 54l35 11 35-11" fill="none" stroke="#7c657f" stroke-width="2"/>`).join('')}
        <path d="M272 64 452 318H181Z" fill="url(#${u}-beam)"/><path d="M831 64 653 318H920Z" fill="url(#${u}-beam)"/><path d="M437 64 488 316H631Z" fill="${P.copper}" fill-opacity=".09"/><path d="M688 64 462 318H568Z" fill="${P.blue}" fill-opacity=".11"/>
        ${[270,437,688,831].map((x,i)=>`<rect x="${x-10}" y="60" width="20" height="18" rx="3" fill="#4a3b51"/><ellipse cx="${x}" cy="79" rx="8" ry="3" fill="${i%2?P.copper:P.blue}"/>`).join('')}
        ${[240,801].map(x=>`<rect x="${x}" y="201" width="59" height="112" rx="3" fill="#15131e" stroke="#68566b"/><circle cx="${x+30}" cy="233" r="17" fill="#312c3c"/><circle cx="${x+30}" cy="280" r="22" fill="#312c3c"/><circle cx="${x+30}" cy="280" r="8" fill="#191623"/>`).join('')}
        <path d="M477 315 490 297H526L537 315ZM650 315 663 297H699L710 315Z" fill="#221e2b"/>
        <path d="M542 292 539 269 533 249 543 227 560 226 573 249 568 272 574 308H562L552 277 548 308H536Z" fill="${P.ink}"/><circle cx="551" cy="213" r="13" fill="${P.ink}"/><path d="M566 234 589 223 600 203" fill="none" stroke="${P.ink}" stroke-width="8" stroke-linecap="round"/><path d="M596 201 606 199" stroke="${P.bone}" stroke-width="4" stroke-linecap="round"/>
        <path d="M590 222 590 310M583 311H600" stroke="${P.bone}" stroke-opacity=".6" stroke-width="2"/>
        <path d="M514 318 550 323 592 318" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity=".5"/>
        ${crowd}`;
    }
    return svg('0 0 1100 500', label, `<defs><linearGradient id="${u}-sky" x2="0" y2="1"><stop stop-color="#17131f"/><stop offset="1" stop-color="#433346"/></linearGradient><linearGradient id="${u}-beam" x2="0" y2="1"><stop stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient><clipPath id="${u}-clip"><rect width="1100" height="500"/></clipPath></defs><g clip-path="url(#${u}-clip)"><rect width="1100" height="500" fill="url(#${u}-sky)"/>${scene}<path d="M26 26h46M26 26v26M1074 26h-46M1074 26v26" fill="none" stroke="${P.bone}" stroke-opacity=".25" stroke-width="2"/></g>`);
  }

  function cover(id, title, artist) {
    const u = 'rap-art-c' + (++instance), c = profile(id), cleanTitle = String(title || 'Archivo de la noche').slice(0,92);
    const words = cleanTitle.split(/\s+/).filter(Boolean).flatMap(word => word.length > 17 ? word.match(/.{1,17}/gu) || [] : [word]), lines = [];
    let line = '';
    for(const word of words) {
      if((line + ' ' + word).trim().length > 17 && line) { lines.push(line); line=word; }
      else line = (line + ' ' + word).trim();
    }
    if(line) lines.push(line);
    const displayed = lines.slice(0,4), size = displayed.some(l=>l.length>18) ? 25 : displayed.length>3 ? 31 : 37;
    return svg('0 0 360 360', `Portada ilustrada: ${cleanTitle}`, `<defs><linearGradient id="${u}-bg" x2="1" y2="1"><stop stop-color="${P.ink}"/><stop offset="1" stop-color="${shade(c.outfit,5)}"/></linearGradient><clipPath id="${u}-clip"><rect width="360" height="360"/></clipPath></defs><g clip-path="url(#${u}-clip)"><rect width="360" height="360" fill="url(#${u}-bg)"/>
      <circle cx="271" cy="117" r="144" fill="none" stroke="${c.accent}" stroke-width="1" stroke-opacity=".6"/>
      <circle cx="271" cy="117" r="112" fill="none" stroke="${c.accent}" stroke-width="20" stroke-opacity=".13"/>
      <path d="M-42 265 215 8 246 8-12 296ZM26 360 360 26V54L54 360Z" fill="${c.accent}" fill-opacity=".14"/>
      <path d="M202 360 215 250 235 223 258 223 283 249 315 360Z" fill="${P.ink}"/>
      <path d="M233 228 226 196Q220 160 250 155 277 157 273 190L270 220 254 238Z" fill="${P.ink}"/>
      <path d="M214 253 244 273 275 246M240 273 222 318M250 276 278 317" stroke="${c.accent}" stroke-opacity=".36" stroke-width="2" fill="none"/>
      <path d="M24 23H68M24 23V61" stroke="${c.accent}" stroke-width="2" fill="none"/>
      <text x="26" y="78" fill="${c.accent}" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">${esc(String(artist||c.name).slice(0,40))}</text>
      ${displayed.map((l,i)=>`<text x="25" y="${133+i*(size+7)}" fill="${P.bone}" font-family="Georgia,serif" font-size="${size}" font-weight="bold">${esc(l)}</text>`).join('')}
      <path d="M26 312H142" stroke="${c.accent}" stroke-width="2"/><text x="26" y="335" fill="${P.bone}" fill-opacity=".65" font-family="Arial,sans-serif" font-size="9" letter-spacing="2">RAPPER SIM / EDICIÓN DIGITAL</text>
      <path d="M323 297v41m4-41v41m7-41v41m3-41v41" stroke="${P.bone}" stroke-opacity=".35" stroke-width="2"/></g>`);
  }

  globalThis.RapArt = Object.freeze({ portrait, stage, cover });
})();
