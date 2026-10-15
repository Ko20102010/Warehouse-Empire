// Warehouse Empire v0.2.00 - first GitHub-ready playable release
// Changes: reliable completed-order payout, stickman player, walk/run, visible cartons,
// inbound/outbound loop, local save, regular upgrades, permanent upgrade, mobile controls.
const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
const keys={},SAVE='warehouseEmpire_v0200';
let s={money:0,delivered:0,orderNeed:8,speedLv:1,carryLv:1,permLv:0};
try{Object.assign(s,JSON.parse(localStorage.getItem(SAVE)||'{}'))}catch(e){}
let p={x:470,y:455,carry:0},cool=0,msg='',msgT=0,truckT=0;
const inbound={x:80,y:110,w:190,h:145},outbound={x:690,y:110,w:190,h:145};
function cap(){return 2+s.carryLv+s.permLv} function speed(){return 2.3+.22*s.speedLv+.12*s.permLv}
function save(){localStorage.setItem(SAVE,JSON.stringify(s));ui()}
function ui(){money.textContent='$'+s.money;order.textContent=`Order ${s.delivered} / ${s.orderNeed}`;speed.innerHTML=`Shoes Lv.${s.speedLv} <em>$${30*s.speedLv}</em>`;carry.innerHTML=`Carry Lv.${s.carryLv} <em>$${45*s.carryLv}</em>`;perm.innerHTML=`Company Training Lv.${s.permLv} <em>$${120*(s.permLv+1)}</em>`}
function buy(cost,fn){if(s.money>=cost){s.money-=cost;fn();save()}else flash('Not enough money')}
speed.onclick=()=>buy(30*s.speedLv,()=>s.speedLv++);carry.onclick=()=>buy(45*s.carryLv,()=>s.carryLv++);perm.onclick=()=>buy(120*(s.permLv+1),()=>s.permLv++);
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('[data-k]').forEach(b=>{let k=b.dataset.k;b.onpointerdown=()=>keys[k]=true;b.onpointerup=b.onpointercancel=b.onpointerleave=()=>keys[k]=false});run.onpointerdown=()=>keys.shift=true;run.onpointerup=run.onpointercancel=run.onpointerleave=()=>keys.shift=false;
function flash(t){msg=t;msgT=90}
function inside(z){return p.x>z.x&&p.x<z.x+z.w&&p.y>z.y&&p.y<z.y+z.h}
function update(){let v=speed()*(keys.shift?1.75:1),dx=0,dy=0;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(dx&&dy){dx*=.707;dy*=.707}p.x=Math.max(25,Math.min(935,p.x+dx*v));p.y=Math.max(80,Math.min(570,p.y+dy*v));if(cool>0)cool--;if(msgT>0)msgT--;if(truckT>0)truckT--;
 if(cool===0&&inside(inbound)&&p.carry<cap()){p.carry++;cool=18;flash(`Picked up ${p.carry}/${cap()}`)}
 if(cool===0&&inside(outbound)&&p.carry>0){let need=s.orderNeed-s.delivered,take=Math.min(p.carry,need);p.carry-=take;s.delivered+=take;cool=22;if(s.delivered>=s.orderNeed){let pay=s.orderNeed*(10+s.permLv*2);s.money+=pay;s.delivered=0;s.orderNeed=Math.min(40,s.orderNeed+2);truckT=65;flash(`ORDER COMPLETE  +$${pay}`)}else flash(`Delivered ${s.delivered}/${s.orderNeed}`);save()}}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke()}}
function zone(z,color,title){roundRect(z.x,z.y,z.w,z.h,18,color+'33',color);ctx.fillStyle='#17313a';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText(title,z.x+z.w/2,z.y+30)}
function box(x,y,sz=24){ctx.fillStyle='#c88743';ctx.fillRect(x,y,sz,sz*.78);ctx.strokeStyle='#7d4c23';ctx.strokeRect(x,y,sz,sz*.78);ctx.fillStyle='#e3ae69';ctx.fillRect(x+sz*.45,y,sz*.1,sz*.78)}
function draw(){ctx.clearRect(0,0,960,600);ctx.fillStyle='#cbd5d2';ctx.fillRect(0,0,960,600);ctx.strokeStyle='#b6c2bf';ctx.lineWidth=1;for(let x=0;x<960;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke()}for(let y=0;y<600;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke()}
 ctx.fillStyle='#e9b72e';ctx.fillRect(0,270,960,8);ctx.fillRect(0,530,960,8);zone(inbound,'#268bd2','INBOUND • PICKUP');zone(outbound,'#27ae60',`OUTBOUND • ${s.delivered}/${s.orderNeed}`);
 // docks/trucks
 ctx.fillStyle='#4c6573';ctx.fillRect(105,35,140,72);ctx.fillStyle='#2b7bbb';ctx.fillRect(112,43,126,58);ctx.fillStyle='#23333b';ctx.fillRect(115,100,25,15);ctx.fillRect(210,100,25,15);
 ctx.fillStyle=truckT?'#e0a422':'#e05252';ctx.fillRect(715,35,140,72);ctx.fillStyle='#f0f4f5';ctx.fillRect(722,43,126,58);ctx.fillStyle='#23333b';ctx.fillRect(725,100,25,15);ctx.fillRect(820,100,25,15);
 for(let i=0;i<12;i++)box(105+(i%4)*34,165+Math.floor(i/4)*28,27);
 // racks
 ['#557783','#617f89'].forEach((c,j)=>{ctx.fillStyle=c;ctx.fillRect(325+j*260,95,170,150);for(let yy=120;yy<235;yy+=48){ctx.fillStyle='#314b55';ctx.fillRect(325+j*260,yy,170,7);for(let xx=338+j*260;xx<475+j*260;xx+=42)box(xx,yy-25,30)}});
 // stickman + carried boxes
 for(let i=0;i<p.carry;i++)box(p.x-13,p.y-54-i*18,26);ctx.strokeStyle='#152b35';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.arc(p.x,p.y-24,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x,p.y-14);ctx.lineTo(p.x,p.y+12);ctx.moveTo(p.x,p.y-3);ctx.lineTo(p.x-13,p.y+4);ctx.moveTo(p.x,p.y-3);ctx.lineTo(p.x+13,p.y+4);ctx.moveTo(p.x,p.y+12);ctx.lineTo(p.x-10,p.y+29);ctx.moveTo(p.x,p.y+12);ctx.lineTo(p.x+10,p.y+29);ctx.stroke();ctx.strokeStyle='#f1bc28';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(p.x-7,p.y-8);ctx.lineTo(p.x+7,p.y-8);ctx.stroke();ctx.fillStyle='#276f9b';ctx.fillRect(p.x-10,p.y-36,20,6);
 ctx.fillStyle='#172a32';ctx.font='14px Arial';ctx.textAlign='center';ctx.fillText(`CARRY ${p.carry}/${cap()}`,p.x,p.y+48);if(msgT){roundRect(330,292,300,52,15,'#142630dd');ctx.fillStyle='#ffd45d';ctx.font='bold 20px Arial';ctx.fillText(msg,480,325)}requestAnimationFrame(draw)}
setInterval(update,16);ui();draw();
