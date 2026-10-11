// Host stays on the dock. All fishing motion uses the garden's shared clock.
export function fishingPose(l,time=0,reduced=false){
 const t=reduced?0:time,x=l.dock.x,y=l.dock.y+24;
 const nibble=Math.sin(t*.47)> .985;
 return {x,y,hand:{x:x-7,y:y-13},tip:{x:x-30,y:y-36+(nibble?1:0)},
  bobber:{x:l.pond.x+l.pond.rx*.06,y:l.pond.y-l.pond.ry*.28+(reduced?0:Math.sin(t*1.8)*.6)+(nibble?1:0)},
  ripple:reduced?3:2+(t*.7)%3};
}
export function drawFisher(ctx,l,im,time,reduced){const p=fishingPose(l,time,reduced),{x,y,hand,tip,bobber}=p;
 ctx.fillStyle='#355a3440';ctx.beginPath();ctx.ellipse(x,y,6,2,0,0,Math.PI*2);ctx.fill();
 ctx.drawImage(im,Math.round(x)-16,Math.round(y)-30);
 // A slender rod in the original fishing pose, with a softly sagging line.
 ctx.save();ctx.lineCap='round';ctx.lineWidth=1.4;ctx.strokeStyle='#694526';ctx.beginPath();ctx.moveTo(hand.x+3,hand.y+3);ctx.lineTo(hand.x,hand.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
 ctx.lineWidth=.65;ctx.strokeStyle='#d9c394';ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
 ctx.lineWidth=.65;ctx.strokeStyle='#e6e8d4b0';ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.quadraticCurveTo((tip.x+bobber.x)/2-4,(tip.y+bobber.y)/2+8,bobber.x,bobber.y);ctx.stroke();
 ctx.lineWidth=.7;ctx.strokeStyle='#c2e7dc90';ctx.beginPath();ctx.ellipse(bobber.x,bobber.y+2,p.ripple*1.4,p.ripple*.45,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 const bx=Math.round(bobber.x),by=Math.round(bobber.y);ctx.fillStyle='#fff3d7';ctx.fillRect(bx-1,by-3,2,2);ctx.fillStyle='#c55157';ctx.fillRect(bx-1,by-1,2,2);
}
