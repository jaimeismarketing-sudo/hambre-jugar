(function(root){
 'use strict';
 // Reconcile presentation without replacing running actors, focused controls or
 // scroll containers. This module never reads or writes a career.
 function key(node){return node.nodeType===1?(node.id||node.getAttribute('data-live-key')||node.getAttribute('data-appointment-id')||node.getAttribute('data-manager-artist-id')||''):'';}
 function compatible(a,b){return a&&b&&a.nodeType===b.nodeType&&(a.nodeType!==1||a.tagName===b.tagName)&&(!key(a)&&!key(b)||key(a)===key(b));}
 function patchNode(current,next,preserve){
  if(!compatible(current,next)){current.replaceWith(next.cloneNode(true));return;}
  if(current.isEqualNode(next))return;
  if(current.nodeType!==1){if(current.nodeValue!==next.nodeValue)current.nodeValue=next.nodeValue;return;}
  const formControl=/^(INPUT|SELECT|TEXTAREA)$/.test(current.tagName),savedValue=preserve&&formControl?current.value:null,savedChecked=current.checked,opened=current.tagName==='DETAILS'?current.open:null;
  for(const attr of [...current.attributes])if(!next.hasAttribute(attr.name)&&!(preserve&&formControl&&['value','checked','selected'].includes(attr.name)))current.removeAttribute(attr.name);
  for(const attr of next.attributes)if(current.getAttribute(attr.name)!==attr.value&&!(preserve&&formControl&&['value','checked','selected'].includes(attr.name)))current.setAttribute(attr.name,attr.value);
  patchChildren(current,next,preserve);
  if(savedValue!==null){current.value=savedValue;if(current.tagName==='INPUT')current.checked=savedChecked;}
  if(opened!==null&&preserve)current.open=opened;
 }
 function patchChildren(host,next,preserve){
  let cursor=host.firstChild;
  for(const incoming of [...next.childNodes]){
   let found=cursor;
   if(!compatible(found,incoming)&&key(incoming))found=[...host.childNodes].find(n=>key(n)===key(incoming)&&compatible(n,incoming));
   if(!found){host.insertBefore(incoming.cloneNode(true),cursor);continue;}
   if(found!==cursor)host.insertBefore(found,cursor);
   const following=found.nextSibling;
   patchNode(found,incoming,preserve);cursor=following;
  }
  while(cursor){const nextSibling=cursor.nextSibling;host.removeChild(cursor);cursor=nextSibling;}
 }
 function patch(host,html,{preserveInputs=true}={}){
  if(!host)return;
  if(!host.ownerDocument?.createElement){host.innerHTML=html;return;}
  const template=host.ownerDocument.createElement('template');template.innerHTML=html;
  patchChildren(host,template.content,preserveInputs);
 }
 root.RapLiveDOM={patch};
})(globalThis);
