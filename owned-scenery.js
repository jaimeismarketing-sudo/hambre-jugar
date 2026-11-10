(function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ink='#1d2c39',paper='#e4d9bd',metal='#899c9d';
 // Original vector set dressing. These functions only read ownership/history.
 function studioRack(pro){
  const accent='var(--theme-accent,#ddb768)';
  let controls='';
  for(let row=0;row<4;row++){
   const y=76+row*62;
   controls+=`<path d="M24 ${y}h180v48H24z" fill="${row%2?'#42545e':'#b7b4a1'}" stroke="${ink}" stroke-width="4"/><path d="M33 ${y+7}h71v26H33z" fill="#243c45"/>`;
   for(let i=0;i<6;i++)controls+=`<path d="M${40+i*10} ${y+26}v-${7+(i*7+row*5)%17}" stroke="${i===5?'#d78c6b':'#a1c0a1'}" stroke-width="5"/>`;
   for(let i=0;i<3;i++)controls+=`<circle cx="${127+i*28}" cy="${y+22}" r="9" fill="${ink}"/><path d="M${127+i*28} ${y+15}v5" stroke="${paper}" stroke-width="2"/>`;
  }
  return `<g transform="translate(1265 190)" aria-label="Equipo de tu estudio${pro?' comercial':''}"><ellipse cx="102" cy="385" rx="148" ry="24" fill="${ink}" opacity=".3"/><path d="M0 35 25 12h206v341l-25 27H0z" fill="#78594d" stroke="${ink}" stroke-width="7"/><path d="M206 35h25v318l-25 27z" fill="#433e3c"/><path d="M0 35h206v345H0z" fill="#a88765" stroke="${ink}" stroke-width="6"/><path d="M15 49h190v291H15z" fill="#263644" stroke="${ink}" stroke-width="5"/>${controls}<path d="M28 331h160" stroke="${ink}" stroke-width="5"/><path d="M42 345v12m119-12v12" stroke="${metal}" stroke-width="6"/><circle class="owned-rec-light" cx="185" cy="60" r="5" fill="${accent}"/><path d="M22 380v16m174-16v16" stroke="${ink}" stroke-width="10"/><path d="M145 400q90 40 117 4t-42-16" fill="none" stroke="${ink}" stroke-width="5"/>${pro?`<g transform="translate(22 -91)"><path d="M0 0h160l22 10v79H0z" fill="#465761" stroke="${ink}" stroke-width="5"/><path d="M13 11h140v55H13z" fill="#142935"/><path d="M25 40h15l10-16 12 30 14-22 12 14 10-8 10 9 12-24 12 27 8-10" stroke="#a9c9ac" stroke-width="4" fill="none"/><path d="M29 76h94" stroke="${metal}" stroke-width="4"/></g>`:''}</g>`;
 }
 function recordShelf(releases,genre){
  if(!releases.length)return '';
  const tones={hiphop:['#d4aa60','#5b9794','#b17764'],rock:['#b76c5a','#92a4a1','#d3b879'],reggae:['#87a184','#d5bb72','#b37758'],metal:['#a19ab0','#8a969b','#bb8775'],pop:['#a98b9c','#b4b6a5','#6f9da3']}[genre]||['#d4aa60','#5b9794','#b17764'];
  return `<g transform="translate(460 139)" aria-label="Tus lanzamientos publicados"><path d="M-10 120h${releases.length*84+7}v18H-10z" fill="#6d564b" stroke="${ink}" stroke-width="5"/><path d="M-10 120 5 112h${releases.length*84-4}l-4 8" fill="#b59b76"/>${releases.map((r,i)=>`<g transform="translate(${i*84} 0)"><title>${esc(r.name)}</title><path d="m3 6 67-5 7 112-69 5z" fill="${ink}" opacity=".3"/><path d="M0 0h66v112H0z" fill="${tones[i%3]}" stroke="${ink}" stroke-width="4"/><path d="M7 9h52v72H7z" fill="${paper}" opacity=".28"/>${i%2?`<path d="m10 72 16-42 12 27 14-38 8 53z" fill="${ink}"/><circle cx="26" cy="23" r="9" fill="${paper}"/>`:`<circle cx="33" cy="44" r="25" fill="${ink}"/><circle cx="33" cy="44" r="13" fill="${tones[(i+1)%3]}"/><circle cx="33" cy="44" r="3" fill="${paper}"/>`}<path d="M10 92h45m-45 9h28" stroke="${ink}" stroke-width="4"/></g>`).join('')}</g>`;
 }
 function trophy(){
  return `<g transform="translate(1110 175)" aria-label="Premio obtenido en esta carrera"><ellipse cx="39" cy="142" rx="65" ry="12" fill="${ink}" opacity=".25"/><path d="M-12 142h105v14H-12z" fill="#997858" stroke="${ink}" stroke-width="5"/><path d="M12 113h54v25H12z" fill="#384650" stroke="${ink}" stroke-width="4"/><path d="M20 116h37v12H20z" fill="#baa064"/><path d="M32 82v31h15V82" fill="#b88745" stroke="${ink}" stroke-width="3"/><path d="M15 16h48v35q-4 31-24 35T15 51z" fill="#d6b56c" stroke="${ink}" stroke-width="4"/><path d="M15 28H2v24q2 17 24 18m37-42h14v24Q76 69 53 70" fill="none" stroke="#b58d4d" stroke-width="7"/><path d="M25 22v30q0 17 13 23" fill="none" stroke="#ead69c" stroke-width="5"/><path d="M9 13h59" stroke="${ink}" stroke-width="5"/></g>`;
 }
 function render(s,view){
  if(view.ensemble?.managedArtistId&&!view.supervised)return '';
  const assets=s.assets||[],templates=root.RapEngine?.catalog?.investments||[];
  const template=a=>templates.find(t=>t.id===a.catalogId)||a;
  const studio=assets.find(a=>a.catalogId==='commercial_studio')||assets.find(a=>template(a).bonus==='studio');
  const vehicle=assets.find(a=>root.RapEngine?.isVehicle?.(template(a))&&a.vehicleMode!=='garaged');
  let art='';
  if(['home','studio','workshop','garage'].includes(view.place.key)){
   if(studio)art+=studioRack(studio.catalogId==='commercial_studio');
   art+=recordShelf((s.releases||[]).filter(r=>r.status!=='working').slice(-4),view.genre||'hiphop');
   if((s.careerAwards?.awards||[]).some(a=>(a.outcomes||[]).some(o=>o.won===true)))art+=trophy();
  }
  // The scene key "garage" is a rehearsal room, not a vehicle garage.
  if(vehicle&&view.place.key==='street'&&root.RapObjectArt){
   art+=`<svg data-owned-object="${esc(vehicle.catalogId)}" x="1120" y="455" width="460" height="322" viewBox="0 0 320 224" aria-label="${esc(vehicle.name||template(vehicle).name)}">${root.RapObjectArt.fragment(vehicle,{transparent:true,palette:view.genre||s.player?.initialGenre||'hiphop'})}</svg>`;
  }
  return art?`<div class="live-facility-props"><svg viewBox="0 0 1600 900" aria-label="Equipo y recuerdos que posees" role="img" xmlns="http://www.w3.org/2000/svg">${art}</svg></div>`:'';
 }
 root.RapOwnedScenery={render};
})(globalThis);
