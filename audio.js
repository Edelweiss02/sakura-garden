import {tracks} from './music.js';
// One media element, one active track, no background scheduling timers.
export class GardenAudio{
 constructor(change,factory=()=>new Audio()){
  this.change=change;this.factory=factory;this.enabled=true;this.state='waiting';this.started=false;this.index=0;this.volume=.35;this.audio=null;this.generation=0;this.pending=null;this.hidden=false;this.destroyed=false;
 }
 get track(){return tracks[this.index];}
 set(state){this.state=state;this.change(state,this.enabled);}
 ensure(){if(this.audio)return;const a=this.audio=this.factory();a.preload='none';a.volume=this.volume;a.src=new URL('./assets/music/'+this.track.id+'.mp3?v=restored-2',import.meta.url).href;a.onended=()=>{if(this.enabled&&!this.hidden&&!this.destroyed)this.next();};a.onerror=()=>{if(!this.destroyed){this.generation++;this.pending=null;this.set('unavailable');}};}
 start(){
  this.started=true;this.hidden=false;if(!this.enabled||this.destroyed)return Promise.resolve();if(this.pending)return this.pending;
  try{this.ensure();if(this.state==='playing'&&!this.audio.paused)return Promise.resolve();const epoch=++this.generation;
   const task=Promise.resolve(this.audio.play()).then(()=>{
    if(epoch===this.generation&&this.enabled&&!this.hidden&&!this.destroyed)this.set('playing');
    else if(!this.enabled||this.hidden||this.destroyed)this.audio?.pause();
   }).catch(e=>{if(epoch===this.generation&&!this.destroyed)this.set(e?.name==='NotAllowedError'?'waiting':'unavailable');}).finally(()=>{if(this.pending===task)this.pending=null;});
   this.pending=task;return task;
  }catch(e){this.set('unavailable');return Promise.resolve();}
 }
 toggle(){if(this.destroyed)return;this.enabled=!this.enabled;this.generation++;this.pending=null;
  if(!this.enabled){this.audio?.pause();this.set('muted');return Promise.resolve();}this.set('enabled');return this.start();
 }
 select(index){if(this.destroyed)return Promise.resolve();this.generation++;this.pending=null;this.audio?.pause();this.index=(index+tracks.length)%tracks.length;
  if(this.audio)this.audio.src=new URL('./assets/music/'+this.track.id+'.mp3?v=restored-2',import.meta.url).href;
  this.set(this.enabled?'waiting':'muted');if(this.enabled&&this.started&&!this.hidden)return this.start();return Promise.resolve();
 }
 next(delta=1){return this.select(this.index+delta);}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(this.audio)this.audio.volume=this.volume;}
 hide(){this.hidden=true;this.generation++;this.pending=null;this.audio?.pause();if(this.enabled)this.set('waiting');}
 destroy(){this.destroyed=true;this.enabled=false;this.generation++;this.pending=null;if(this.audio){this.audio.pause();this.audio.onended=null;this.audio.onerror=null;this.audio.removeAttribute('src');this.audio.load();}}
}
