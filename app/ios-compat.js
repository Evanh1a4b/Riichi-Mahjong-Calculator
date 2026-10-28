(function(){
'use strict';
// Use Safari's visible viewport when the browser toolbar or keyboard changes height.
const root=document.documentElement,vv=window.visualViewport;let frame=0,locked=false,scrollY=0;
function viewport(){frame=0;const h=vv?vv.height:window.innerHeight,top=vv?vv.offsetTop:0;if(!h)return;root.style.setProperty('--visible-height',h+'px');root.style.setProperty('--visible-top',top+'px');root.dataset.keyboard=window.innerHeight-h>120?'open':'closed';}
function schedule(){if(!frame)frame=requestAnimationFrame(viewport);}
window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});if(vv){vv.addEventListener('resize',schedule,{passive:true});vv.addEventListener('scroll',schedule,{passive:true});}viewport();
// Lock background scrolling while retaining the original scroll position on close.
function dialogs(){const open=!!document.querySelector('dialog[open]');if(open&&!locked){scrollY=window.scrollY;locked=true;document.body.style.position='fixed';document.body.style.top=-scrollY+'px';document.body.style.width='100%';}else if(!open&&locked){locked=false;document.body.style.position='';document.body.style.top='';document.body.style.width='';window.scrollTo(0,scrollY);}root.dataset.modal=open?'open':'closed';schedule();}
new MutationObserver(dialogs).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
// Older Safari versions can use a non-native dialog as a full-screen panel.
if(window.HTMLDialogElement&&!HTMLDialogElement.prototype.showModal){HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');this.setAttribute('aria-modal','true');this.setAttribute('role','dialog');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new Event('close'));};}
document.addEventListener('focusin',e=>{if(!e.target.matches('input,select,textarea'))return;setTimeout(()=>{schedule();if(e.target.isConnected&&e.target.closest('dialog'))e.target.scrollIntoView({block:'nearest',inline:'nearest'});},200);});
// Installation and offline assets are enabled only for a real web origin.
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
