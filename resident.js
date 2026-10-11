import {validPoint,clearSegment} from './world.js';
// Short local steps can cross the grass. Longer walks prefer the garden paths.
const graphs=new WeakMap();
function pathDistance(p,l){let best=Infinity;for(const path of l.paths)for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t));}return best;}
function graph(l){if(graphs.has(l))return graphs.get(l);const nodes=[];for(let y=l.h*.23;y<l.h*.89-6;y+=10)for(let x=18;x<l.w-16;x+=10)if(validPoint(x,y,l,7))nodes.push({x,y});const edges=nodes.map(()=>[]);for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>15||!clearSegment(a,b,l,7))continue;const cost=d*(1+Math.min(1.6,pathDistance({x:(a.x+b.x)/2,y:(a.y+b.y)/2},l)/12));edges[i].push([j,cost]);edges[j].push([i,cost]);}const g={nodes,edges};graphs.set(l,g);return g;}
function smoothRoute(from,path,l){
 const nodes=[from,...path],simple=[from];let i=0;
 while(i<nodes.length-1){let next=i+1;for(let j=i+2;j<nodes.length&&Math.hypot(nodes[j].x-nodes[i].x,nodes[j].y-nodes[i].y)<44;j++){if(clearSegment(nodes[i],nodes[j],l,7))next=j;}simple.push(nodes[next]);i=next;}
 const out=[];let previous=from;
 for(let j=1;j<simple.length-1;j++){
  const a=simple[j-1],b=simple[j],c=simple[j+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(7,ab*.28,bc*.28);
  const entry={x:b.x+(a.x-b.x)*r/ab,y:b.y+(a.y-b.y)*r/ab},exit={x:b.x+(c.x-b.x)*r/bc,y:b.y+(c.y-b.y)*r/bc};
  const arc=Array.from({length:9},(_,k)=>{const t=k/8,u=1-t;return{x:u*u*entry.x+2*u*t*b.x+t*t*exit.x,y:u*u*entry.y+2*u*t*b.y+t*t*exit.y};});
  if(clearSegment(previous,entry,l,7)&&arc.every((p,k)=>clearSegment(k?arc[k-1]:entry,p,l,7))){out.push(...arc);previous=exit;}else{out.push(b);previous=b;}
 }
 out.push(simple.at(-1));return out;
}
export function route(from,to,l){
 if(!validPoint(to.x,to.y,l,7))return null;
 if(Math.hypot(to.x-from.x,to.y-from.y)<30&&clearSegment(from,to,l,7))return [to];
 const g=graph(l),nodes=[...g.nodes,from,to],start=nodes.length-2,end=start+1,edges=g.edges.map(e=>[...e]);edges.push([],[]);
 for(const k of [start,end])for(let i=0;i<start;i++){const d=Math.hypot(nodes[k].x-nodes[i].x,nodes[k].y-nodes[i].y);if(d<24&&clearSegment(nodes[k],nodes[i],l,7)){edges[k].push([i,d*1.4]);edges[i].push([k,d*1.4]);}}
 const dist=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),done=new Set();dist[start]=0;
 for(let k=0;k<nodes.length;k++){let u=-1,best=Infinity;for(let i=0;i<nodes.length;i++)if(!done.has(i)){const score=dist[i]+Math.hypot(nodes[i].x-to.x,nodes[i].y-to.y);if(score<best){u=i;best=score;}}if(u<0)return null;if(u===end)break;done.add(u);for(const[v,cost]of edges[u])if(!done.has(v)&&dist[u]+cost<dist[v]){dist[v]=dist[u]+cost;prev[v]=u;}}
 if(prev[end]<0)return null;const out=[];for(let i=end;i!==start;i=prev[i])out.unshift(nodes[i]);return smoothRoute(from,out,l);
}
export function makeResident(l){let p={...l.spots.paint};if(!validPoint(p.x,p.y,l,7))p={...l.spots.meadow};return{...p,id:'ksyushenka',frame:32,dir:2,state:'paint',clock:0,wait:10,path:[],activity:'paint',lastActivity:'paint',visits:0,stop:1,headingWait:0,speed:0,look:l.objects.find(o=>o.id==='easel')};}
function choose(a,l,animals,rng){
 const animal=animals[Math.floor(rng()*animals.length)],easel=l.objects.find(o=>o.id==='easel');
 const observe=[{x:animal.x+20,y:animal.y+10},{x:animal.x-20,y:animal.y+10},{x:animal.x,y:animal.y+23}].find(p=>validPoint(p.x,p.y,l,7))||l.spots.meadow;
 const candidates=[
 {activity:'paint',...l.spots.paint,look:easel,duration:18+rng()*14},
 {activity:'flowers',...l.spots.flowers,look:l.flowerGarden,duration:9+rng()*9},
 {activity:'observe',...observe,look:animal,duration:8+rng()*8},
 {activity:'pond',...l.spots.pond,look:l.pond,duration:12+rng()*12},
 {activity:'admire',...l.spots.admire,look:l.terrace,duration:8+rng()*8},
 {activity:'rest',...l.spots.rest,look:l.pond,duration:18+rng()*15},
 {activity:'grove',...l.spots.grove,look:l.grove,duration:12+rng()*12},
 {activity:'birds',...l.spots.birds,look:l.objects.find(o=>o.id==='bird-house'),duration:10+rng()*8},
 {activity:'meadow',...l.spots.meadow,look:l.meadow,duration:8+rng()*9}
 ];
 for(let i=0;i<candidates.length;i++){const index=(a.stop+i)%candidates.length,p=candidates[index],path=route(a,p,l);if(path){a.stop=(index+1)%candidates.length;a.path=path;a.activity=p.activity;a.look=p.look;a.duration=p.duration;a.state='walk';a.clock=0;a.speed=0;a.headingWait=0;return;}}
 a.wait=3;
}
function face(a){if(!a.look)return;const dx=a.look.x-a.x,dy=a.look.y-a.y;a.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?0:2);}
export function stepResident(a,dt,l,animals,rng){if(dt<=0)return;a.clock+=dt;a.headingWait=Math.max(0,(a.headingWait||0)-dt);
 if(a.state!=='walk'){face(a);a.wait-=dt;if(a.wait<=0)choose(a,l,animals,rng);return;}
 const remaining=a.path.reduce((sum,p,i)=>sum+Math.hypot(p.x-(i?a.path[i-1].x:a.x),p.y-(i?a.path[i-1].y:a.y)),0);
 const desired=Math.min(12,Math.max(3,remaining*1.4));a.speed=Math.min(desired,(a.speed||0)+20*dt);let distance=a.speed*dt;
 // Look several pixels ahead; tiny route samples do not cause repeated sprite turns.
 let look=a.path.at(-1);for(const p of a.path)if(Math.hypot(p.x-a.x,p.y-a.y)>7){look=p;break;}
 if(look){const dx=look.x-a.x,dy=look.y-a.y,horizontal=a.dir===1||a.dir===3,turn=Math.abs(dx)>Math.abs(dy)*(horizontal?.82:1.22)?(dx>0?1:3):(dy>0?0:2);if(turn!==a.dir&&a.headingWait<=0){a.dir=turn;a.headingWait=.45;}}
 while(distance>0&&a.path.length){const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy);if(d<=distance){a.x=p.x;a.y=p.y;distance-=d;a.path.shift();}else{a.x+=dx/d*distance;a.y+=dy/d*distance;distance=0;}}
 if(!a.path.length){a.state=a.activity;a.lastActivity=a.activity;a.wait=a.duration;a.clock=0;a.speed=0;a.visits++;face(a);}
}
const seatedState=state=>state==='rest'||state==='grove';
export function seatPosition(a,l){const activity=a.state==='walk'?a.lastActivity:a.state,o=l.objects.find(o=>o.id===(activity==='grove'?'grove-bench':'chair'));return{x:o.x,y:o.y+2};}
export function drawResident(ctx,a,im,reduced,seated,l){const phase=a.state==='walk'&&!reduced?[0,1,0,2][Math.floor(a.clock*5)%4]:0;
 let rx=a.x,ry=a.y;const sitting=seatedState(a.state),leaving=a.state==='walk'&&seatedState(a.lastActivity)&&a.clock<.5;if(sitting||leaving){const seat=seatPosition(a,l),t=reduced?1:Math.min(1,a.clock/.5),ease=t*t*(3-2*t),mix=sitting?ease:1-ease;rx+=(seat.x-rx)*mix;ry+=(seat.y-ry)*mix;}const x=Math.round(rx),y=Math.round(ry);if(!sitting){ctx.fillStyle='#355a3440';ctx.beginPath();ctx.ellipse(x,y,6,2,0,0,Math.PI*2);ctx.fill();}if(sitting&&seated){ctx.drawImage(seated,x-16,y-36);}else ctx.drawImage(im,phase*32,a.dir*32,32,32,x-16,y-30,32,32);
 // The original back-facing sprite stands at the canvas. No invented arm animation.
 if(a.state==='observe'&&a.clock<3){ctx.fillStyle='#e9a5b9';ctx.fillRect(x-2,y-36,2,2);ctx.fillRect(x+1,y-36,2,2);ctx.fillRect(x-1,y-34,3,2);ctx.fillRect(x,y-32,1,1);}
}
