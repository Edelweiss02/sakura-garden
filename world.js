export function random(seed=12010){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const kinds=[{kind:'cat',count:1,frame:32,speed:8},{kind:'dinosaur',count:2,frame:16,speed:5},{kind:'chicken',count:2,frame:16,speed:6},{kind:'duck',count:2,frame:16,speed:5},{kind:'rabbit',count:2,frame:16,speed:9},{kind:'cow',count:2,frame:32,speed:4}];
export const species=kinds.flatMap(s=>Array.from({length:s.count},(_,i)=>({...s,id:i?s.kind+'2':s.kind})));
export function layout(w,h){
 const portrait=w/h<.85,pt=(x,y)=>({x:w*x,y:h*y});
 const terrace={...pt(portrait?.70:.79,portrait?.30:.33),w:portrait?84:100,h:72};
 const trunk={...pt(portrait?.10:.12,portrait?.49:.50),r:9};
 const easel={id:'easel',...pt(.17,.55),kind:'easel',radius:9};
 const flowerGarden={...pt(.17,portrait?.78:(h<260?.70:.74)),w:portrait?48:65,h:32};
 const grove={...pt(portrait?.47:.50,portrait?.62:.61),r:7};
 const groveTrees=[{x:grove.x-(portrait?34:53),y:grove.y-16,r:4,scale:portrait?.42:.55},{x:grove.x+(portrait?33:52),y:grove.y-25,r:4,scale:portrait?.40:.50},{x:grove.x-(portrait?8:12),y:grove.y-59,r:3.5,scale:portrait?.38:.48},{x:grove.x-(portrait?37:58),y:grove.y+30,r:3.5,scale:portrait?.36:.46}];
 const meadow={...pt(portrait?.34:.31,.31),w:portrait?52:92,h:34};
 const pond={...pt(portrait?.82:.84,.78),rx:w*(portrait?.21:.16),ry:portrait?Math.min(64,h*.15):h*.17};
 const dock={x:pond.x+pond.rx*.16,y:pond.y-pond.ry-8,w:44,h:34};
 const objects=[{id:'bird-house',x:grove.x-(portrait?25:43),y:grove.y-43,kind:'bird-house',radius:3},{id:'garden-lantern',x:grove.x-(portrait?20:32),y:grove.y+35,kind:'garden-lantern',radius:3},easel,{id:'bench',x:terrace.x-22,y:terrace.y+7,kind:'bench',radius:14},{id:'chair',x:terrace.x+24,y:terrace.y+9,kind:'light-chair',radius:7},{id:'table',x:terrace.x,y:terrace.y+23,kind:'tea-table',radius:12},{id:'mailbox',...pt(portrait?.39:.42,.86),kind:'mailbox',radius:7},{id:'grove-bench',x:grove.x+(portrait?16:20),y:grove.y+18,kind:'bench',radius:14}];
 const barriers=[{x:flowerGarden.x,y:flowerGarden.y-9,w:flowerGarden.w*1.16,h:3},...[-1,1].map(side=>({x:flowerGarden.x+side*flowerGarden.w*.26,y:flowerGarden.y+6,w:23,h:14})),{x:terrace.x-terrace.w/2,y:terrace.y,w:3,h:72},{x:terrace.x+terrace.w/2,y:terrace.y,w:3,h:72},{x:terrace.x,y:terrace.y-36,w:terrace.w,h:3}];
 // One smooth oval, sampled from the same curve for rendering and navigation.
 const oval={x:w*(portrait?.48:.49),y:h*(portrait?.60:.59),rx:w*(portrait?.24:.20),ry:h*(portrait?.22:.22)};
 const point=t=>({x:oval.x+Math.cos(t)*oval.rx*(1+.035*Math.sin(3*t+.4)),y:oval.y+Math.sin(t)*oval.ry*(1+.025*Math.cos(2*t+.6))});
 const loop=Array.from({length:97},(_,i)=>point(i*Math.PI/48));
 const branch=(angle,b)=>{const a=point(angle),before=point(angle-.001),after=point(angle+.001),tx=after.x-before.x,ty=after.y-before.y,d=Math.hypot(tx,ty),sign=(tx*(b.x-a.x)+ty*(b.y-a.y))>=0?1:-1,c1={x:a.x+tx/d*14*sign,y:a.y+ty/d*14*sign},span=Math.hypot(b.x-a.x,b.y-a.y),bend=(b.x>oval.x?-1:1)*Math.min(14,span*.35),c2={x:b.x-(b.x-a.x)*.32-(b.y-a.y)/(span||1)*bend,y:b.y-(b.y-a.y)*.32+(b.x-a.x)/(span||1)*bend};return Array.from({length:33},(_,i)=>{const t=i/32,u=1-t;return{x:u*u*u*a.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*b.y};});};
 const curve=(a,c,b)=>Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return{x:u*u*a.x+2*u*t*c.x+t*t*b.x,y:u*u*a.y+2*u*t*c.y+t*t*b.y};});
 const spots={paint:{x:easel.x,y:easel.y+19},flowers:{x:flowerGarden.x,y:flowerGarden.y+27},pond:{x:dock.x-30,y:dock.y-7},admire:{x:terrace.x,y:terrace.y+46},rest:{x:terrace.x+24,y:terrace.y+25},grove:{x:grove.x+(portrait?16:20),y:grove.y+35},meadow:pt(portrait?.36:.34,.39)};
 const birdHouse=objects.find(o=>o.id==='bird-house');spots.birds={x:birdHouse.x+4,y:birdHouse.y+19};
 // A continuous spline through planted areas, with rounded bends between anchors.
 const winding=anchors=>{const out=[];for(let i=0;i<anchors.length-1;i++){const a=anchors[Math.max(0,i-1)],b=anchors[i],c=anchors[i+1],d=anchors[Math.min(anchors.length-1,i+2)];for(let k=0;k<20;k++){const t=k/20,t2=t*t,t3=t2*t,p={};for(const axis of ['x','y'])p[axis]=.5*((2*b[axis])+(-a[axis]+c[axis])*t+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*t2+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*t3);out.push(p);}}out.push(anchors.at(-1));return out;};
 const inside=(x,y)=>({x:oval.x+x*oval.rx,y:oval.y+y*oval.ry});
 const entry=point(Math.PI/2);
 const paths=[
 {points:loop,width:10,role:'loop'},
 {points:winding([pt(portrait?.48:.49,1.04),pt(portrait?.495:.505,.94),pt(portrait?.47:.48,.86),entry]),width:11,role:'entrance'},
 {points:winding([point(Math.PI-.22),{x:easel.x+38,y:easel.y+37},{x:easel.x+12,y:easel.y+30},spots.paint]),width:8,role:'easel',surface:'stone'},
 {points:branch(portrait?-Math.PI/3:-.30,spots.admire),width:8,role:'pavilion'},
 {points:branch(portrait?.03:.22,{x:dock.x,y:dock.y-3}),width:8,role:'dock'},
 {points:winding([point(2.10),{x:flowerGarden.x+55,y:flowerGarden.y+Math.min(38,h*.095)},{x:flowerGarden.x+23,y:flowerGarden.y+Math.min(38,h*.095)},{x:flowerGarden.x,y:flowerGarden.y+18}]),width:7,role:'flowers'},
 {points:winding([point(3.65),inside(-.43,-.17),inside(-.28,.37),spots.grove]),width:6,role:'inner-stone',surface:'stone'},
 {points:winding([point(-.95),inside(.29,-.38),inside(.03,-.43),spots.birds]),width:5,role:'bird-walk',surface:'gravel'},
 {points:branch(Math.PI/2-.22,{x:spots.grove.x,y:grove.y+32}),width:6,role:'grove',surface:'stone'}
 ];
 const regions=portrait?{
 cat:[.15,.56,.29,.65],dinosaur:[.78,.43,.90,.51],dinosaur2:[.70,.51,.87,.59],chicken:[.35,.75,.45,.86],chicken2:[.49,.76,.59,.86],duck:[.59,.57,.71,.64],duck2:[.82,.52,.93,.61],rabbit:[.10,.71,.24,.82],rabbit2:[.22,.78,.34,.86],cow:[.26,.25,.38,.33],cow2:[.34,.34,.46,.40]
 }:{cat:[.16,.56,.28,.65],dinosaur:[.85,.47,.94,.56],dinosaur2:[.74,.52,.86,.60],chicken:[.35,.75,.46,.87],chicken2:[.49,.75,.59,.86],duck:[.68,.57,.78,.64],duck2:[.87,.51,.95,.60],rabbit:[.10,.68,.23,.82],rabbit2:[.22,.78,.32,.87],cow:[.20,.24,.32,.31],cow2:[.34,.24,.44,.32]};
 return{w,h,portrait,terrace,trunk,grove,groveTrees,flowerGarden,meadow,pond,dock,objects,barriers,paths,spots,regions,oval};
}
export function validPoint(x,y,l,pad=6){const p=l.pond;if(x<10+pad||x>l.w-10-pad||y<l.h*.23||y>l.h*.89-pad)return false;
 if(((x-p.x)/(p.rx+pad))**2+((y-p.y)/(p.ry+pad))**2<1)return false;
 if([l.trunk,l.grove,...l.groveTrees].some(t=>Math.hypot(x-t.x,y-t.y)<t.r+pad))return false;
 if(l.barriers.some(b=>Math.abs(x-b.x)<b.w/2+pad&&Math.abs(y-b.y)<b.h/2+pad))return false;
 return !l.objects.some(o=>Math.abs(x-o.x)<o.radius+pad&&Math.abs(y-o.y)<7+pad);}
export function clearSegment(a,b,l,pad){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/2);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!validPoint(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,l,pad))return false;}return true;}
export function makeAnimals(l,rng=random()){
 const result=[];
 for(const spec of species){const region=l.regions[spec.id],s={...spec,region,start:[(region[0]+region[2])/2,(region[1]+region[3])/2]};let a={...s,speed:s.speed*(.85+rng()*.3),x:s.start[0]*l.w,y:s.start[1]*l.h,dir:0,state:'idle',clock:rng()*2,wait:1+rng()*5,target:null,held:false};
 const safe=()=>validPoint(a.x,a.y,l,s.frame===32?10:7)&&result.every(b=>Math.hypot(a.x-b.x,a.y-b.y)>15);
 if(!safe())for(let i=0;i<1500;i++){const [x0,y0,x1,y1]=s.region;a.x=l.w*(x0+rng()*(x1-x0));a.y=l.h*(y0+rng()*(y1-y0));if(safe())break;}
 result.push(a);}return result;
}
export function stepAnimal(a,dt,l,rng,neighbors=[]){if(a.held||dt<=0)return;a.clock+=dt;if(a.state!=='walk'){a.wait-=dt;if(a.wait>0)return;const [x0,y0,x1,y1]=a.region;for(let i=0;i<32;i++){const target={x:(x0+rng()*(x1-x0))*l.w,y:(y0+rng()*(y1-y0))*l.h};if(clearSegment(a,target,l,a.frame===32?9:6)&&Math.hypot(target.x-a.x,target.y-a.y)>8){a.target=target;a.state='walk';break;}}if(a.state!=='walk'){a.wait=1;return;}}
 const dx=a.target.x-a.x,dy=a.target.y-a.y,d=Math.hypot(dx,dy),v=a.speed*dt;
 const nx=a.x+dx/Math.max(d,.001)*Math.min(v,d),ny=a.y+dy/Math.max(d,.001)*Math.min(v,d);
 if(!validPoint(nx,ny,l,a.frame===32?8:5)||!clearSegment(a,{x:nx,y:ny},l,a.frame===32?8:5)){a.state='pause';a.wait=1;a.target=null;return;}
 if(neighbors.some(b=>b!==a&&Math.hypot(nx-b.x,ny-b.y)<(a.frame+b.frame)*.22&&Math.hypot(nx-b.x,ny-b.y)<Math.hypot(a.x-b.x,a.y-b.y))){a.state='pause';a.wait=.5+rng()*1.8;a.target=null;return;}
 a.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?0:2);
 if(d<=v){a.x=a.target.x;a.y=a.target.y;a.state='pause';a.wait=1.4+rng()*4;a.target=null;}else{a.x+=dx/d*v;a.y+=dy/d*v;}}
export function frameFor(a,reduced=false){const kind=a.kind||a.id;let row=a.dir,col=0;if(a.state==='walk'&&!reduced)col=Math.floor(a.clock*7)%4;
 if(kind==='dinosaur'||kind==='duck'||kind==='chicken'||kind==='rabbit'){return{col,row:a.dir,flip:false};}
 if(a.state!=='walk'&&(kind==='cat'||kind==='dog'))row=4;
 if(kind==='cow'&&a.dir===3)return{row:1,col,flip:true};return{row,col,flip:false};}
