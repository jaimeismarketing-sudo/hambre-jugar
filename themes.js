/* Fifteen Coolors palettes selected for five musical worlds. No career mutations. */
(function(root){
 'use strict';
 const clone=v=>JSON.parse(JSON.stringify(v));
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const mix=(a,b,t)=>'#'+rgb(a).map((v,i)=>Math.round(v+(rgb(b)[i]-v)*t).toString(16).padStart(2,'0')).join('');
 const lum=h=>rgb(h).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 function readable(color,bg,target=4.5){if(contrast(color,bg)>=target)return color;const toward=contrast('#ffffff',bg)>contrast('#080b0e',bg)?'#ffffff':'#080b0e';for(let i=1;i<=40;i++){const candidate=mix(color,toward,i/40);if(contrast(candidate,bg)>=target)return candidate}return toward;}
 const definitions=[
  ['hiphop','hiphop-asfalto','Asfalto y neón','Vinilo oscuro, luz de calle y naranja de escenario.','12355b-420039-d72638-ffffff-ff570a',0,4,2,'hoodie','headphones',0],
  ['hiphop','hiphop-bloque','Bloque dorado','Negro de vinilo y una consola bañada en ámbar.','fff05a-ffd25a-ffaa5a-ff785a-191919',4,1,3,'jacket','earring',4],
  ['hiphop','hiphop-casete','Casete al atardecer','Moras, durazno y el grano cálido de una cinta.','faa275-ff8c61-ce6a85-985277-5c374c',4,0,2,'tshirt','glasses',3],
  ['rock','rock-carretera','Carretera violeta','Roadcase azul noche, aluminio y cinta lavanda.','bfacaa-02020a-05204a-b497d6-e1e2ef',2,3,0,'jacket','earring',2],
  ['rock','rock-nocturno','Escenario nocturno','Violeta amplificado con luces azules y hielo.','320e3b-4c2a85-6b7fd7-bcedf6-ddfbd2',0,2,3,'jacket','none',1],
  ['rock','rock-garaje','Garaje oxidado','Amplificadores gastados, cinta roja y lona oliva.','e55934-d9594c-ce8d66-c3bf6d-b7b868',0,3,1,'tshirt','headphones',2],
  ['reggae','reggae-dub','Dub solar','Madera de sound system, amarillo solar y violeta.','fce762-fffded-ffb17a-4f4789-201335',4,0,2,'tshirt','headphones',3],
  ['reggae','reggae-patio','Patio coral','Cajas de madera, verdes suaves y acentos coral.','885053-fe5f55-777da7-94c9a9-c6ecae',0,4,1,'jacket','none',3],
  ['reggae','reggae-selva','Selva nocturna','Verde profundo, madera envejecida y luz rosada.','053225-e34a6f-f7b2bd-b2a198-60a561',0,4,2,'tshirt','earring',0],
  ['pop','pop-prisma','Prisma eléctrico','Cristal espejado y reflejos menta, lima y orquídea.','5aff15-aaffe5-9d75cb-a657ae-8c1a6a',4,1,0,'jacket','glasses',3],
  ['pop','pop-terciopelo','Terciopelo digital','Espejos art déco sobre ciruela, plata y malva.','bfc3ba-a9aca9-60495a-3f3244-2f2235',4,0,2,'jacket','earring',2],
  ['pop','pop-dorado','Lente dorada','Azul de estudio, cromo frío y reflejos dorados.','2e5266-6e8898-9fb1bc-d3d0cb-e2c044',0,4,2,'tshirt','glasses',1],
  ['metal','metal-oxido','Óxido profundo','Acero industrial, óxido encendido y sombra petróleo.','5f0f40-9a031e-fb8b24-e36414-0f4c5c',4,2,1,'jacket','none',0],
  ['metal','metal-acero','Acero caliente','Placa negra, naranja de fundición y luces cian.','201e1f-ff4000-faaa8d-feefdd-50b2c0',0,1,4,'hoodie','earring',0],
  ['metal','metal-ritual','Ámbar ritual','Metal perforado, violeta ahumado y luz de latón.','5c415d-694966-74526c-dbd053-c89933',0,3,4,'jacket','headphones',1]
 ];
 const materials={hiphop:'Vinilo y asfalto',rock:'Roadcase y cinta',reggae:'Madera y sound system',pop:'Espejo y art déco',metal:'Acero industrial'};
 function build(row){const [genre,id,name,description,slug,baseIndex,accentIndex,secondIndex,outfitType,accessory,clothIndex]=row,palette=slug.split('-').map(h=>'#'+h),base=palette[baseIndex],light=palette.reduce((a,b)=>lum(a)>lum(b)?a:b),bg=mix(base,'#080b10',.77),panel=mix(base,'#151b22',.68),raised=mix(base,'#343d46',.5),dark=mix(base,'#04070b',.85),text=mix(light,'#ffffff',.82),muted=readable(mix(light,'#a1aaad',.5),raised,6),accent=readable(palette[accentIndex],raised,6),secondary=readable(palette[secondIndex],raised,6),onAccent=contrast('#101218',accent)>contrast('#ffffff',accent)?'#101218':'#ffffff',edge=readable(mix(accent,raised,.55),panel,3),paper=mix(light,'#ffffff',.69),ink=mix(base,'#10141a',.85),paperMuted=readable(mix(base,'#555d64',.5),paper,4.5),wood=mix(base,'#5b3f29',.6);
  const tokens={'--theme-bg':bg,'--theme-panel':panel,'--theme-surface':panel,'--theme-raised':raised,'--theme-dark':dark,'--theme-text':text,'--theme-muted':muted,'--theme-accent':accent,'--theme-on-accent':onAccent,'--theme-secondary':secondary,'--theme-edge':edge,'--theme-line':edge,'--theme-paper':paper,'--theme-ink':ink,'--theme-paper-muted':paperMuted,'--theme-wood':wood,'--scene-accent':palette[accentIndex],'--scene-light':mix(light,'#fff7dd',.45),'--scene-shadow':mix(base,'#080c16',.56),'--scene-floor':genre==='reggae'?wood:mix(base,'#3d3935',.58),'--game-bg':bg,'--game-panel':panel,'--game-accent':accent,'--game-second':secondary,'--game-paper':paper,'--game-ink':ink,'--game-edge':dark,'--game-text':text,'--rack':panel,'--rack-edge':edge,'--rack-glass':dark,'--rack-text':text,'--rack-light':accent,'--cc-line':edge,'--cc-paper':text,'--cc-accent':accent,'--cc-secondary':secondary,'--cc-muted':muted};
  return{id,name,genre,description,material:materials[genre],source:'https://coolors.co/'+slug,palette,tokens,appearance:{outfit:palette[clothIndex],accent:palette[accentIndex],outfitType,accessory}};
 }
 const all=definitions.map(build);
 function normalize(genre){const g=String(genre||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return /metal/.test(g)?'metal':/reggae|dancehall|ska/.test(g)?'reggae':/rock|punk/.test(g)?'rock':/pop|r&b|soul/.test(g)?'pop':'hiphop';}
 function list(genre){return clone(all.filter(t=>t.genre===normalize(genre)));}
 function resolve(genre,id){const choices=all.filter(t=>t.genre===normalize(genre));return clone(choices.find(t=>t.id===id)||choices[0]);}
 function apply(element,genre,id){const theme=resolve(genre,id);if(!element||!element.style||!element.dataset)return theme;element.dataset.visualTheme=theme.id;element.dataset.themeGenre=theme.genre;for(const [key,value] of Object.entries(theme.tokens))element.style.setProperty(key,value);return theme;}
 function recommendedAppearance(genre,id){return resolve(genre,id).appearance;}
 function renderPicker(genre,id){const choices=list(genre),selected=resolve(genre,id);return '<div class="theme-picker" role="group" aria-label="Estilo visual de tu género">'+choices.map(t=>'<div class="theme-option'+(selected.id===t.id?' is-selected':'')+'" data-theme-material="'+t.genre+'"><button type="button" data-theme-choice="'+esc(t.id)+'" aria-pressed="'+(t.id===selected.id)+'" title="'+esc(t.description)+'" style="--choice-bg:'+t.tokens['--theme-panel']+';--choice-accent:'+t.tokens['--theme-accent']+';--choice-text:'+t.tokens['--theme-text']+'"><span class="theme-swatch-row" aria-hidden="true">'+t.palette.map(c=>'<i style="background:'+c+'"></i>').join('')+'</span><b>'+esc(t.name)+'</b><span class="theme-material">'+esc(t.material)+'</span><span class="theme-selection-mark" aria-hidden="true">'+(t.id===selected.id?'✓':'')+'</span></button><a href="'+esc(t.source)+'" target="_blank" rel="noopener noreferrer" aria-label="Ver paleta '+esc(t.name)+' en Coolors">Paleta en Coolors</a></div>').join('')+'</div>';}
 root.RapThemes={list,resolve,apply,recommendedAppearance,renderPicker};if(typeof module!=='undefined'&&module.exports)module.exports=root.RapThemes;
})(typeof globalThis!=='undefined'?globalThis:this);

