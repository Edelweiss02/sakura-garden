import {tracks} from './music.js';
import {makeResident,stepResident} from './resident.js';
import {content as c} from './content.js';
import {layout,makeAnimals,random,stepAnimal,species} from './world.js';
import {assetNames,scenery,drawGround,drawScene} from './scene.js';
import {GardenAudio} from './audio.js';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d'),dialog=$('dialog'),controller=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
let resident,assets={},world,sc,animals=[],scale=1,rng=random(),last=null,time=0,raf=0,ready=false,active=null,page=0,returnFocus=null,manualReduced=false;
const motion=matchMedia('(prefers-reduced-motion: reduce)'),read=new Set(),targets=new Map();
const reduced=()=>motion.matches||manualReduced;
$('garden').ariaLabel=c.gardenLabel;$('targets').ariaLabel=c.objectsLabel;document.querySelector('nav').ariaLabel=c.controlsLabel;document.title=c.title+' · '+c.subtitle;$('title').textContent=c.title;$('subtitle').textContent=c.subtitle;$('date').textContent=c.date;$('status').textContent=c.loading;
$('letterButton').lastElementChild.textContent=c.letterButton;$('notesButton').lastElementChild.textContent=c.notesButton;$('back').textContent=c.back;$('close').ariaLabel=c.close;$('welcomeLetter').textContent=c.directLetter;
const music=new GardenAudio((state,enabled)=>{$('musicButton').textContent=c.audio[state];$('musicButton').setAttribute('aria-pressed',String(enabled));$('musicButton').ariaLabel=enabled?c.musicDisable+'. '+c.audio[state]:c.musicEnable;});music.set('waiting');
for(const [index,t]of tracks.entries()){const option=document.createElement('option');option.value=String(index);option.textContent=t.title;$('trackSelect').append(option);}
function updateTrack(){$('nowPlaying').textContent=music.track.title;$('trackSelect').value=String(music.index);}
const originalChange=music.change;music.change=(state,enabled)=>{originalChange(state,enabled);updateTrack();};updateTrack();
on($('trackSelect'),'change',()=>{music.started=true;music.select(Number($('trackSelect').value));});
on($('previousTrack'),'click',()=>music.next(-1));on($('nextTrack'),'click',()=>music.next());on($('volume'),'input',()=>music.setVolume(Number($('volume').value)/100));
function updateMotion(){$('motionButton').textContent=reduced()?c.motionOff:c.motionOn;$('motionButton').setAttribute('aria-pressed',String(!reduced()));$('motionButton').disabled=motion.matches;$('motionButton').title=motion.matches?c.systemMotion:'';}
updateMotion();on(motion,'change',updateMotion);on($('motionButton'),'click',()=>{manualReduced=!manualReduced;updateMotion();});
on($('musicButton'),'click',()=>music.toggle());
const ground=document.createElement('canvas');
function resize(){if(!ready)return;const width=innerWidth,height=innerHeight;const w=width/height<.85?240:480;scale=width/w;const h=Math.ceil(height/scale);canvas.width=w;canvas.height=h;world=layout(w,h);sc=scenery(world);animals=makeAnimals(world,rng);resident=makeResident(world);ground.width=w;ground.height=h;drawGround(ground.getContext('2d'),world,assets,sc);positionTargets();last=null;}
function positionTargets(){for(const item of [...animals,...world.objects]){const el=targets.get(item.id);if(!el)continue;el.style.left=item.x*scale+'px';el.style.top=item.y*scale+'px';const size=Math.max(44,(item.frame||24)*scale*.9);el.style.width=size+'px';el.style.height=size+'px';el.style.zIndex=String(Math.round(item.y));}}
function createTargets(){for(const id of [...species.map(s=>s.id),'easel','bench','grove-bench','mailbox']){const noteId=species.find(s=>s.id===id)?.kind||(id==='grove-bench'?'bench':id);const el=document.createElement('button');el.className='target';el.type='button';el.ariaLabel=id==='mailbox'?c.mailbox:c.notes[noteId].name+c.openNote;el.title=id==='mailbox'?c.letterButton:c.notes[noteId].name;targets.set(id,el);$('targets').append(el);
 on(el,'pointerdown',()=>{const a=animals.find(a=>a.id===id);if(a)a.held=true;});on(el,'pointercancel',()=>{const a=animals.find(a=>a.id===id);if(a)a.held=false;});on(el,'pointerleave',()=>{if(!dialog.open){const a=animals.find(a=>a.id===id);if(a)a.held=false;}});
 on(el,'focus',()=>{const a=animals.find(a=>a.id===id);if(a)a.held=true;});on(el,'blur',()=>{if(!dialog.open){const a=animals.find(a=>a.id===id);if(a)a.held=false;}});
 on(el,'click',()=>open(id==='mailbox'?'letter':noteId,el));}}
function current(){return active==='welcome'?c.welcome:active==='letter'?c.letter:c.notes[active];}
function renderDialog(){const list=active==='list';$('noteList').hidden=!list;$('dialogText').hidden=list;$('welcomeLetter').hidden=active!=='welcome';
 $('dialogTitle').textContent=list?c.notesTitle:current().title;$('kicker').textContent=list?c.notesKicker:current().kicker;
 if(list){$('noteList').replaceChildren();for(const [id,n] of Object.entries(c.notes)){const b=document.createElement('button');b.type='button';b.append(document.createTextNode(n.name));const small=document.createElement('small');small.textContent=read.has(id)?c.read:c.unread;b.append(small);b.onclick=()=>{active=id;page=0;read.add(id);renderDialog();$('close').focus();};$('noteList').append(b);}
 $('back').hidden=true;$('next').textContent=c.done;$('pageLabel').textContent='';return;}
 const n=current();$('dialogText').textContent=n.pages[page];$('pageLabel').textContent=n.pages.length>1?`${c.page} ${page+1} ${c.of} ${n.pages.length}`:'';$('back').hidden=page===0;$('next').textContent=page<n.pages.length-1?c.next:active==='welcome'?c.start:c.done;
}
function open(id,trigger=document.activeElement){if(!dialog.open)returnFocus=trigger;active=id;page=0;if(c.notes[id])read.add(id);renderDialog();if(!dialog.open)dialog.showModal();$('close').focus();}
function close(){dialog.close();}
on(dialog,'close',()=>{for(const a of animals)a.held=false;active=null;last=null;const target=returnFocus;returnFocus=null;if(target?.isConnected&&target!==document.body)target.focus({preventScroll:true});else $('letterButton').focus({preventScroll:true});});
on($('back'),'click',()=>{if(page>0){page--;renderDialog();}});on($('next'),'click',()=>{if(active==='list'){close();return;}if(page<current().pages.length-1){page++;renderDialog();}else{if(active==='welcome')music.start();close();}});
on($('welcomeLetter'),'click',()=>{active='letter';page=0;renderDialog();$('close').focus();});
on($('letterButton'),'click',()=>open('letter',$('letterButton')));on($('notesButton'),'click',()=>open('list',$('notesButton')));
function gesture(e){if(e.target.closest?.('#musicButton'))return;if(music.enabled&&music.state==='waiting'&&(e.type==='pointerdown'||e.key==='Enter'||e.key===' '))music.start();}
on(document,'pointerdown',gesture);on(document,'keydown',gesture);
on(window,'resize',resize);on(document,'visibilitychange',()=>{last=null;if(document.hidden){cancelAnimationFrame(raf);music.hide();}else{if(ready)raf=requestAnimationFrame(loop);if(music.started&&music.enabled)music.start();}});
function loop(stamp){const dt=last===null?0:Math.min((stamp-last)/1000,.08);last=stamp;if(!reduced()&&!dialog.open){time+=dt;for(const a of animals)stepAnimal(a,dt,world,rng,animals);stepResident(resident,dt,world,animals,rng);}drawScene(ctx,world,assets,sc,animals,time,reduced(),ground,resident);positionTargets();raf=requestAnimationFrame(loop);}
on(window,'pagehide',e=>{cancelAnimationFrame(raf);last=null;if(e.persisted)music.hide();else{music.destroy();controller.abort();}});on(window,'pageshow',e=>{if(e.persisted&&ready){last=null;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}});
try{const pairs=await Promise.all(assetNames.map(name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve([name,image]);image.onerror=()=>reject(Error(name));image.src=new URL('./assets/'+name+'.png',import.meta.url).href;})));assets=Object.fromEntries(pairs);ready=true;createTargets();resize();$('status').textContent='';open('welcome');raf=requestAnimationFrame(loop);}catch(e){$('status').textContent=c.failure;console.error('Не удалось загрузить ресурс сада:',e);}
