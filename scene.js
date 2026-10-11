import {drawFisher} from './fisher.js';
import {drawResident} from './resident.js';
import {random,frameFor} from './world.js';
export const assetNames=['ksyushenka-sitting','fisher','ksyushenka','cat','dinosaur','chicken','duck','rabbit','cow','cherry','oak','pine','bench','flowers-pink','flowers-blue','grass','lily','tuft','pink-tree','water','light-chair','tea-table','white-rug','flower-pot','small-plant','spring-bush','leafy-pot','garden-lantern','pink-junimo','bird-house','stepping-stones'];
export function scenery(l){const rng=random(144),trees=[],flowers=[],tufts=[],petals=[],bushes=[];const {w,h,portrait}=l;
 for(let i=0;i<Math.ceil(w/32)+2;i++){const x=i*32-12;trees.push({kind:i%3===0?'cherry':i%2?'oak':'pine',x,y:24+rng()*25,scale:.85+rng()*.15});}
 for(let i=0;i<Math.ceil(h/45);i++){for(const right of [false,true]){const y=48+i*45;if(right&&y>h*.53&&y<h*.91)continue;trees.push({kind:i%3===0?'cherry':i%2?'pine':'oak',x:right?w+8-rng()*12:-7+rng()*15,y,scale:.8+rng()*.3});}}
 trees.push({kind:'cherry',x:l.grove.x,y:l.grove.y,scale:portrait?.6:.72});
 for(const t of l.groveTrees)trees.push({...t,kind:'cherry'});
 trees.push({kind:'pink-tree',x:l.trunk.x,y:l.trunk.y,scale:portrait?.82:1.05});
 for(let i=0;i<Math.ceil(w/29);i++)trees.push({kind:i%3?'cherry':'oak',x:i*29,y:h+53+(i%2)*9,scale:.9});
 trees.push({kind:'cherry',x:w*.94,y:h*.29,scale:1});
 for(let i=0;i<110;i++){const x=rng()*w,y=45+rng()*(h-55);if((x<w*.16||x>w*.9||y>h*.9||y<h*.25)&&!pondContains(x,y,l,4))flowers.push({x,y,kind:i%3?'flowers-pink':'flowers-blue'});}
 for(let i=0;i<50;i++){const x=rng()*w,y=rng()*h;if(!pondContains(x,y,l,4))tufts.push({x,y,scale:.5+rng()*.3});}
 for(let i=0;i<7;i++){const a=i*Math.PI/3.5;flowers.push({x:l.grove.x+Math.cos(a)*15,y:l.grove.y+Math.sin(a)*5,kind:'flowers-pink'});}
 for(let i=0;i<27;i++)petals.push({x:rng()*w,y:rng()*h,v:4+rng()*5,phase:rng()*6.28});for(const [cx,cy] of [[.12,.52],[.38,.83],[.64,.25],[.91,.42],[.48,.68]])for(let i=0;i<8;i++){const x=w*cx+(rng()-.5)*22,y=h*cy+(rng()-.5)*17;if(!pondContains(x,y,l,10)&&!(Math.abs(x-l.terrace.x)<54&&Math.abs(y-l.terrace.y)<40))flowers.push({x,y,kind:'flowers-pink'});}
 // Dense, irregular islands of original flowers, with open grass between them.
 const clusters=[
 [w*.22,h*.22,portrait?15:24,12,21],[w*.36,h*.20,portrait?15:24,10,18],
 [w*.26,h*.34,portrait?13:24,8,18],[w*.35,h*.29,portrait?9:17,8,12],[w*.45,h*.35,portrait?9:19,8,17],
 [w*.19,h*.32,portrait?12:18,12,18],[w*.43,h*.29,portrait?10:17,10,15],
 [l.flowerGarden.x,l.flowerGarden.y-7,l.flowerGarden.w*.62,17,46],
 [l.flowerGarden.x,l.flowerGarden.y+17,l.flowerGarden.w*.60,8,20],
 ...[[-.64,-.24,.18,.20,30],[-.43,.58,.20,.15,28],[.59,.13,.15,.28,30],[.25,-.57,.21,.13,28],[-.24,-.64,.19,.13,26],[.04,.65,.23,.12,26]].map(([x,y,rx,ry,n])=>[l.oval.x+x*l.oval.rx,l.oval.y+y*l.oval.ry,l.oval.rx*rx,l.oval.ry*ry,n])
 ];
 for(const [cx,cy,rx,ry,count] of clusters)for(let i=0;i<count;i++){const a=rng()*Math.PI*2,r=Math.sqrt(rng()),x=cx+Math.cos(a)*r*rx,y=cy+Math.sin(a)*r*ry;if(!pondContains(x,y,l,12)&&!(Math.abs(x-l.terrace.x)<l.terrace.w/2+7&&Math.abs(y-l.terrace.y)<47)&&!l.objects.some(o=>Math.abs(x-o.x)<o.radius+5&&Math.abs(y-o.y)<12))flowers.push({x,y,scale:.55+rng()*.35,kind:i%4?'flowers-pink':'flowers-blue'});}
 for(const [x,y,scale] of [[.18,.25,.63],[.42,.22,.62],[.15,.33,.6],[.27,.35,.43],[.45,.33,.48],[.32,.21,.42]])bushes.push({x:w*x,y:h*y,scale});
 for(const [x,y,scale] of [[-.63,-.35,.5],[.57,-.18,.46],[-.39,.62,.48],[.17,-.65,.48],[-.3,-.62,.4],[.52,.38,.4]]){const p={x:l.oval.x+x*l.oval.rx,y:l.oval.y+y*l.oval.ry,scale};if(!onPath(p,l,5)&&!l.objects.some(o=>Math.hypot(p.x-o.x,p.y-o.y)<o.radius+8))bushes.push(p);}
 // Small flowers link the planted islands without closing the walking routes.
 for(let i=0;i<85;i++){const a=rng()*Math.PI*2,r=Math.sqrt(rng())*.79,p={x:l.oval.x+Math.cos(a)*r*l.oval.rx,y:l.oval.y+Math.sin(a)*r*l.oval.ry,scale:.45+rng()*.20,kind:i%3?'flowers-pink':'flowers-blue'};if(!l.objects.some(o=>Math.abs(p.x-o.x)<o.radius+5&&Math.abs(p.y-o.y)<14))flowers.push(p);}

 for(let i=0;i<36;i++){const x=w*(.18+rng()*.29),y=h*(.24+rng()*.13);if(!onPath({x,y},l,7))tufts.push({x,y,scale:.3+rng()*.2});}
 return{trees,flowers:flowers.filter(p=>!onPath(p,l,3)),tufts,petals,bushes};}

function onPath(p,l,pad=0){return l.paths.some(path=>path.points.some((b,i)=>{if(!i)return false;const a=path.points[i-1],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)<path.width/2+pad;}));}
function pondContains(x,y,l,pad=0){const p=l.pond;return((x-p.x)/(p.rx+pad))**2+((y-p.y)/(p.ry+pad))**2<1;}
function sprite(ctx,im,x,y,s=1){ctx.drawImage(im,Math.round(x-im.width*s/2),Math.round(y-im.height*s),Math.round(im.width*s),Math.round(im.height*s));}
function pondPath(ctx,l,extra=0){const p=l.pond;ctx.beginPath();for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;const r=1+.035*Math.sin(3*a)+.025*Math.cos(5*a);const x=Math.round((p.x+Math.cos(a)*(p.rx+extra)*r)/3)*3,y=Math.round((p.y+Math.sin(a)*(p.ry+extra)*r)/3)*3;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}
// Merge the distance fields before colouring: forks become gently rounded ground,
// rather than overlapping outlined strokes. Cached as part of the static ground.
function drawPaths(ctx,l,surface='earth'){
 const w=Math.ceil(l.w),h=Math.ceil(l.h),field=new Float32Array(w*h).fill(100);
 for(const path of l.paths){
  if((path.surface||'earth')!==surface)continue;
  const local=new Float32Array(w*h).fill(100);let length=0;
  for(let i=1;i<path.points.length;i++){
   const a=path.points[i-1],b=path.points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),r=path.width/2+.35*Math.sin(length/24),pad=r+5;
   for(let y=Math.max(0,Math.floor(Math.min(a.y,b.y)-pad));y<=Math.min(h-1,Math.ceil(Math.max(a.y,b.y)+pad));y++)for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x)-pad));x<=Math.min(w-1,Math.ceil(Math.max(a.x,b.x)+pad));x++){
    const t=Math.max(0,Math.min(1,((x+.5-a.x)*dx+(y+.5-a.y)*dy)/(len*len||1))),d=Math.hypot(x+.5-a.x-dx*t,y+.5-a.y-dy*t)-r,k=y*w+x;local[k]=Math.min(local[k],d);
   }length+=len;
  }
  for(let i=0;i<field.length;i++){const a=field[i],b=local[i],blend=Math.max(0,6-Math.abs(a-b))/6;field[i]=Math.min(a,b)-blend*blend*6*.25;}
 }
 const colors=surface==='gravel'?['#a3b17c','#b5b692','#c5c4aa','#d2cfb8','#ddd9c2']:['#adc07b','#c3bf8c','#d7c497','#e4cea5','#e9d3ac'];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const d=field[y*w+x];if(d>1.2)continue;ctx.fillStyle=colors[d>.6?0:d>0?1:d>-.7?2:d>-1.7?3:4];ctx.fillRect(x,y,1,1);if(d<-2&&((x*71+y*137)%(surface==='gravel'?7:113)===0)){ctx.fillStyle=surface==='gravel'?'#abae98':'#dcc59c';ctx.fillRect(x,y,1,1);}}
}
function drawStonePaths(ctx,l,assets){
 for(const path of l.paths){if(path.surface!=='stone')continue;
  let next=2,walked=0,index=0;
  for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
   while(next<=walked+len){const t=(next-walked)/(len||1),shift=index%2?.9:-.9,x=a.x+dx*t-dy/(len||1)*shift,y=a.y+dy*t+dx/(len||1)*shift,size=index%3?11:12;
    ctx.fillStyle='#53634455';ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y+1.5),size*.43,size*.36,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(assets['stepping-stones'],(index%4)*16,0,16,16,Math.round(x-size/2),Math.round(y-size/2),size,size);index++;next+=12;
   }walked+=len;
  }
 }
}
export function drawGround(ctx,l,assets,sc){const{w,h}=l;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#73a743';ctx.fillRect(0,0,w,h);
 const rng=random(898);for(let i=0;i<w*h/22;i++){ctx.fillStyle=['#7bac48','#6da13f','#87b64b','#659b3c'][i%4];ctx.fillRect(Math.floor(rng()*w),Math.floor(rng()*h),i%3?1:2,1);}
 ctx.lineCap='round';ctx.lineJoin='round';
 drawPaths(ctx,l);
 drawPaths(ctx,l,'gravel');
 drawStonePaths(ctx,l,assets);
 const deck=l.terrace;
 // An open garden pavilion: raised foundation, original furniture, front steps.
 ctx.fillStyle='#8c7566';ctx.fillRect(deck.x-deck.w/2-2,deck.y-37,deck.w+4,77);ctx.fillStyle='#baa08a';ctx.fillRect(deck.x-deck.w/2,deck.y+36,deck.w,4);
 for(let y=deck.y-35;y<deck.y+36;y+=7){ctx.fillStyle='#e4cbb0';ctx.fillRect(deck.x-deck.w/2,y,deck.w,6);ctx.fillStyle='#f7e4c9';ctx.fillRect(deck.x-deck.w/2+1,y,deck.w-2,1);for(let x=deck.x-deck.w/2+12+(Math.floor(y/7)%2)*18;x<deck.x+deck.w/2;x+=36){ctx.fillStyle='#c6a68a';ctx.fillRect(x,y+1,1,5);}}
 for(let i=0;i<3;i++){ctx.fillStyle='#9e806d';ctx.fillRect(deck.x-15-i*2,deck.y+39+i*3,30+i*4,3);ctx.fillStyle='#ebd4b8';ctx.fillRect(deck.x-15-i*2,deck.y+39+i*3,30+i*4,1);}
 sprite(ctx,assets['white-rug'],deck.x,deck.y+35,1.4);
 // Two small flower beds give the lower clearing a purpose.
 const f=l.flowerGarden;
 for(const side of [-1,1]){const x=f.x+side*f.w*.26,y=f.y;ctx.fillStyle='#846858';ctx.fillRect(x-11,y-2,23,16);ctx.fillStyle='#bf9b83';ctx.fillRect(x-12,y+11,25,4);ctx.fillStyle='#ddbc9d';ctx.fillRect(x-12,y+11,25,1);for(let j=0;j<9;j++)sprite(ctx,assets[j%4?'flowers-pink':'flowers-blue'],x-9+(j%4)*6,y+2+Math.floor(j/4)*5,.7);}
 // The flower approach is connected directly to the oval; no isolated stones or meadow fence.
 for(let i=0;i<sc.tufts.length;i++){const t=sc.tufts[i];let nearPath=false;for(const path of l.paths)for(let j=1;j<path.points.length;j++){const a=path.points[j-1],b=path.points[j],dx=b.x-a.x,dy=b.y-a.y,k=Math.max(0,Math.min(1,((t.x-a.x)*dx+(t.y-a.y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(t.x-a.x-dx*k,t.y-a.y-dy*k)<path.width)nearPath=true;}if(!nearPath&&!(Math.abs(t.x-deck.x)<deck.w/2+5&&Math.abs(t.y-deck.y)<42)&&!(Math.abs(t.x-f.x)<f.w/2&&Math.abs(t.y-f.y)<30))sprite(ctx,assets.tuft,t.x,t.y,t.scale);}
 pondPath(ctx,l,7);ctx.fillStyle='#517737';ctx.fill();pondPath(ctx,l,4);ctx.fillStyle='#bb944e';ctx.fill();pondPath(ctx,l,1);ctx.fillStyle='#6ab7bb';ctx.fill();pondPath(ctx,l,-2);ctx.fillStyle='#3d91aa';ctx.fill();
 ctx.save();pondPath(ctx,l,-4);ctx.clip();const p=l.pond;for(let y=Math.floor(p.y-p.ry-8);y<p.y+p.ry+8;y+=16)for(let x=Math.floor(p.x-p.rx-8);x<p.x+p.rx+8;x+=16)ctx.drawImage(assets.water,x,y);ctx.restore();
 for(let i=0;i<15;i++){const a=i*.43,x=Math.round(p.x+Math.cos(a)*(p.rx+6)),y=Math.round(p.y+Math.sin(a)*(p.ry+5));ctx.fillStyle='#767b64';ctx.fillRect(x-3,y-2,7,4);ctx.fillStyle='#b1b397';ctx.fillRect(x-2,y-3,5,3);ctx.fillStyle='#5f6a50';ctx.fillRect(x-2,y+2,5,1);}
 for(const t of sc.flowers)sprite(ctx,assets[t.kind],t.x,t.y,t.scale||.7);
 for(let i=0;i<7;i++){const angle=2.6+i*.20,x=p.x+Math.cos(angle)*(p.rx+9),y=p.y+Math.sin(angle)*(p.ry+9);ctx.fillStyle='#496332';ctx.fillRect(x,y-8,1,8);ctx.fillRect(x+2,y-5,1,6);ctx.fillStyle='#a38e53';ctx.fillRect(x,y-9,1,3);}
 for(const [x,y] of [[.75,.76],[.91,.81],[.77,.86]])sprite(ctx,assets.lily,w*x,h*y,.75);
 // Broad pier, connected to the shore path; the fisher has space on both sides.
 const dx=l.dock.x,dy=l.dock.y,dw=l.dock.w,dh=l.dock.h;ctx.fillStyle='#5e462d';ctx.fillRect(dx-dw/2-2,dy-2,dw+4,dh+3);
 for(let i=0;i<dh;i+=4){ctx.fillStyle=i%8?'#bd935f':'#cea573';ctx.fillRect(dx-dw/2,dy+i,dw,3);ctx.fillStyle='#e6c496';ctx.fillRect(dx-dw/2+1,dy+i,dw-2,1);}
 for(const x of [dx-dw/2-2,dx+dw/2])for(const y of [dy,dy+dh-2]){ctx.fillStyle='#73573d';ctx.fillRect(x,y-7,4,13);ctx.fillStyle='#dfbc8b';ctx.fillRect(x,y-8,4,2);}

}
function pavilion(ctx,l,assets,front){const d=l.terrace,left=d.x-d.w/2,right=d.x+d.w/2;
 const post=(x,y,height=40)=>{ctx.fillStyle='#9f8876';ctx.fillRect(x-2,y-height,5,height+1);ctx.fillStyle='#f2dfc3';ctx.fillRect(x-1,y-height,3,height-1);ctx.fillStyle='#fff0d5';ctx.fillRect(x-1,y-height,1,height-2);ctx.fillStyle='#bba18b';ctx.fillRect(x-3,y-2,7,3);};
 if(front){for(const x of [left,right])post(x,d.y+37,81);for(const [a,b]of[[left,d.x-32],[d.x+32,right]]){ctx.fillStyle='#b99e88';ctx.fillRect(a,d.y+24,b-a,3);ctx.fillStyle='#f0ddc3';ctx.fillRect(a,d.y+22,b-a,2);for(let x=a+6;x<b;x+=7){ctx.fillStyle='#e9d5b9';ctx.fillRect(x,d.y+26,2,12);}}
 // Flowering garland over the open entrance.
 ctx.fillStyle='#c6ab8e';ctx.fillRect(left-4,d.y-43,d.w+8,4);ctx.fillStyle='#f4e3c9';ctx.fillRect(left-5,d.y-45,d.w+10,2);for(let x=left+2;x<right;x+=12)sprite(ctx,assets['flowers-pink'],x,d.y-43,.65);return;}
 for(const x of [left,right])post(x,d.y-36);
 ctx.fillStyle='#c5ad96';ctx.fillRect(left,d.y-49,d.w,3);for(let x=left+7;x<right;x+=7){ctx.fillStyle='#e6d0b5';ctx.fillRect(x,d.y-47,2,15);}ctx.fillStyle='#f1ddbf';ctx.fillRect(left,d.y-35,d.w,2);
 // Slim pergola beams keep the furniture and resident visible from above.
 for(let x=left+4;x<right;x+=17){ctx.fillStyle='#b69b80';ctx.fillRect(x,d.y-79,3,36);ctx.fillStyle='#eddbbc';ctx.fillRect(x,d.y-79,1,36);}ctx.fillStyle='#a68d75';ctx.fillRect(left-5,d.y-79,d.w+10,5);ctx.fillStyle='#f4e0bf';ctx.fillRect(left-6,d.y-81,d.w+12,2);
 for(let y=d.y-66;y<d.y-46;y+=16){ctx.fillStyle='#e2c9a9';ctx.fillRect(left,y,d.w,2);}
 for(let x=left-1;x<right;x+=10)sprite(ctx,assets['flowers-pink'],x,d.y-78,.8);
}
function flowerScreen(ctx,l,assets){const f=l.flowerGarden,x=Math.round(f.x-f.w*.58),right=Math.round(f.x+f.w*.58),y=Math.round(f.y-9);
 ctx.fillStyle='#987b69';ctx.fillRect(x-1,y-27,right-x+2,3);ctx.fillStyle='#f2ddc1';ctx.fillRect(x,y-29,right-x,2);
 for(let px=x;px<=right;px+=8){ctx.fillStyle='#b49a80';ctx.fillRect(px,y-26,2,27);ctx.fillStyle='#ead5b7';ctx.fillRect(px,y-26,1,25);}
 for(let py=y-18;py<=y-6;py+=10){ctx.fillStyle='#d6bea0';ctx.fillRect(x,py,right-x,2);}
 for(const px of [x,right]){ctx.fillStyle='#a08871';ctx.fillRect(px-2,y-31,4,33);ctx.fillStyle='#f3dec3';ctx.fillRect(px-1,y-32,2,32);}
 for(let px=x+3;px<right;px+=8){sprite(ctx,assets['flowers-pink'],px,y-21+Math.round(Math.sin(px)*3),.8);if(px%3)sprite(ctx,assets['flowers-blue'],px,y-12,.65);}
 for(const side of [-1,1])sprite(ctx,assets['flower-pot'],f.x+side*f.w*.53,f.y+8,.8);
}
function object(ctx,o,assets){const x=Math.round(o.x),y=Math.round(o.y);if(['bench','light-chair','tea-table','bird-house','garden-lantern'].includes(o.kind)){sprite(ctx,assets[o.kind],x,y,o.kind==='bird-house'?.7:1);if(o.id==='grove-bench')sprite(ctx,assets['pink-junimo'],x-11,y-9,.6);if(o.kind==='tea-table')sprite(ctx,assets['small-plant'],x,y-20,.7);return;}
 if(o.kind==='mailbox'){ctx.fillStyle='#62432e';ctx.fillRect(x-2,y-17,4,17);ctx.fillStyle='#ad7445';ctx.fillRect(x-1,y-16,2,16);ctx.fillStyle='#693b35';ctx.fillRect(x-8,y-28,16,13);ctx.fillStyle='#b9575b';ctx.fillRect(x-7,y-27,14,10);ctx.fillStyle='#edb0a1';ctx.fillRect(x-6,y-26,12,2);ctx.fillStyle='#ffedbd';ctx.fillRect(x-4,y-22,8,4);ctx.fillStyle='#654535';ctx.fillRect(x+5,y-31,2,10);ctx.fillStyle='#e4b25f';ctx.fillRect(x+6,y-31,5,4);return;}
 ctx.fillStyle='#674a34';ctx.fillRect(x-9,y-24,3,25);ctx.fillRect(x+6,y-24,3,25);ctx.fillRect(x-1,y-35,3,34);ctx.fillStyle='#c28c56';ctx.fillRect(x-10,y-30,21,25);ctx.fillStyle='#fff1d0';ctx.fillRect(x-8,y-28,17,20);ctx.fillStyle='#bdd5a0';ctx.fillRect(x-7,y-15,15,6);ctx.fillStyle='#876342';ctx.fillRect(x,y-22,2,9);ctx.fillStyle='#e99bc4';ctx.fillRect(x-4,y-23,10,6);ctx.fillStyle='#ffc9df';ctx.fillRect(x-3,y-25,7,5);ctx.fillStyle='#795235';ctx.fillRect(x-12,y-6,25,3);
}
export function drawScene(ctx,l,assets,sc,animals,time=0,reduced=false,ground=null,resident=null){ctx.imageSmoothingEnabled=false;if(ground)ctx.drawImage(ground,0,0);else drawGround(ctx,l,assets,sc);
 const p=l.pond;ctx.save();pondPath(ctx,l,-5);ctx.clip();for(let i=0;i<16;i++){const x=p.x+Math.sin(i*12.71)*(p.rx-4)+(reduced?0:Math.sin(time*.6+i)*3),y=p.y+Math.cos(i*7.71)*(p.ry-4);ctx.fillStyle=i%2?'#8dccce':'#6ebcbd';ctx.fillRect(Math.round(x),Math.round(y),4+i%4,1);}ctx.restore();
 const gardenBench=l.objects.find(o=>o.id==='grove-bench');
 const items=[...[-1,1].map(side=>({type:'decoration',kind:side===1?'leafy-pot':'flower-pot',x:gardenBench.x+side*23,y:gardenBench.y-2,scale:.6})),{type:'flowerScreen',y:l.flowerGarden.y-8},...sc.bushes.map(t=>({...t,type:'decoration',kind:'spring-bush'})),{type:'gate',x:l.w*(l.portrait?.48:.49),y:l.h*.92},{type:'pavilionBack',x:l.terrace.x,y:l.terrace.y-32},{type:'pavilionFront',x:l.terrace.x,y:l.terrace.y+38},{type:'fisher',x:l.dock.x,y:l.dock.y+24},...sc.trees.map(t=>({...t,type:'tree'})),...l.objects.map(o=>({...o,type:'object'})),...[-1,1].map(side=>({type:'decoration',kind:'flower-pot',x:l.terrace.x+side*(l.terrace.w/2-7),y:l.terrace.y-26})),...animals.map(a=>({...a,type:'animal'})),...(resident?[{...resident,type:'resident'}]:[])].sort((a,b)=>a.y-b.y);
 for(const item of items){if(item.type==='flowerScreen'){flowerScreen(ctx,l,assets);continue;}if(item.type==='gate'){for(const side of [-1,1]){const x=item.x+side*17;ctx.fillStyle='#af947c';ctx.fillRect(x-2,item.y-15,5,18);ctx.fillStyle='#f2ddbf';ctx.fillRect(x-1,item.y-15,3,17);sprite(ctx,assets['flowers-pink'],x+side*7,item.y+2,.8);}continue;}if(item.type.startsWith('pavilion')){pavilion(ctx,l,assets,item.type==='pavilionFront');continue;}if(item.type==='decoration'){sprite(ctx,assets[item.kind],item.x,item.y,item.scale||.8);continue;}if(item.type==='fisher'){drawFisher(ctx,l,assets.fisher,time,reduced);continue;}if(item.type==='resident'){drawResident(ctx,item,assets.ksyushenka,reduced,assets['ksyushenka-sitting'],l);continue;}if(item.type==='tree'){sprite(ctx,assets[item.kind],item.x,item.y,item.scale);continue;}if(item.type==='object'){object(ctx,item,assets);continue;}
 const a=item,f=frameFor(a,reduced),sz=a.frame;ctx.fillStyle='#355a3440';ctx.beginPath();ctx.ellipse(a.x,a.y-1,sz*.24,2,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(Math.round(a.x),Math.round(a.y));if(f.flip)ctx.scale(-1,1);ctx.drawImage(assets[a.kind||a.id],f.col*sz,f.row*sz,sz,sz,-sz/2,-sz+4,sz,sz);ctx.restore();}
 for(let i=0;i<3;i++){const t=reduced?0:time;const x=l.w*(.44+i*.15)+Math.sin(t*.5+i*2)*12,y=l.h*(.28+i*.035)+Math.cos(t*.6+i)*7;const wing=reduced?2:1+Math.floor((Math.sin(t*8+i)+1)*1.5);ctx.fillStyle=i%2?'#f4bfd6':'#eaca83';ctx.fillRect(Math.round(x)-wing,Math.round(y)-2,wing,3);ctx.fillRect(Math.round(x)+1,Math.round(y)-2,wing,3);ctx.fillStyle='#614557';ctx.fillRect(Math.round(x),Math.round(y)-1,1,3);}
 for(const p of sc.petals){const t=reduced?0:time,x=((p.x+t*2+Math.sin(t*.5+p.phase)*7)%l.w+l.w)%l.w,y=(p.y+t*p.v)%l.h;ctx.fillStyle='#f9c0d7';ctx.fillRect(Math.round(x),Math.round(y),2,1);ctx.fillStyle='#e99ac4';ctx.fillRect(Math.round(x)+1,Math.round(y)+1,1,1);}
}
