// Weapon Shop Empire v0.12.00
// Waypoint pathfinding, Material Yard, Shield crafting, physical customer shelf shopping, working Wholesale delivery, quality/inspection system & mobile context bar.
'use strict';
const VERSION='v0.12.00';
const c=document.getElementById('game'),g=c.getContext('2d'),$=id=>document.getElementById(id);
let vw=1280,vh=720;
const WORLD={w:3072,h:2048},PREFIX='wse_v01200_slot_',OLD_PREFIX='wse_v01100_slot_',FOREVER_KEY='wse_forever_v01200';
let slot=0,playing=false,last=performance.now(),target=null,msgTimer=0,dayTime=0,spawnTimer=2.5,zoom=.68,pinchStart=0,craftAnim=0,craftKey='sword',dragMove={active:false,id:null,sx:0,sy:0,dx:0,dy:0},animClock=0;

const base={
  cash:250,rep:20,day:1,legacy:0,
  iron:14,wood:10,herb:10,gel:0,
  storageCap:8,outputCap:8,rareStorageCap:8,staffCap:2,contractSlots:1,contractCap:20,
  contracts:[],offers:[],
  skills:{quality:0,merchant:0,adventure:0,management:0},
  products:{
    sword:{on:true,unlocked:true,stock:0},
    potion:{on:true,unlocked:true,stock:0},
    shield:{on:false,unlocked:false,stock:0}
  },
  output:{sword:0,potion:0,shield:0},
  outputItems:{sword:[],potion:[],shield:[]},
  shelfItems:{sword:[],potion:[],shield:[]},
  rareDisplay:[],
  poorPolicy:'Honest',
  employees:[],review:4.2,badReviews:0,served:0,zoom:.68,tutorialStep:0,
  goals:[],event:null,
  statsDay:{sales:0,tips:0,crafted:0,monsters:0,lost:0},
  discoveries:[],productionPriority:'Balanced',
  coinsFloor:0,totalCoinsPicked:0
};

let S=clone(base),
    player={x:1350,y:1160,speed:315,carryKey:null,carryCount:0,carryItems:[],carryCap:3},
    clients=[],effects=[],monsters=[],cam={x:0,y:0};
const keys={};

const yardNodes=[
  {id:'iron1',type:'iron',name:'Iron Vein',icon:'🪨',x:260,y:510,ready:true,timer:0,max:10},
  {id:'wood1',type:'wood',name:'Timber Log',icon:'🪵',x:260,y:650,ready:true,timer:0,max:10},
  {id:'herb1',type:'herb',name:'Herb Patch',icon:'🌿',x:260,y:790,ready:true,timer:0,max:10},
  {id:'iron2',type:'iron',name:'Rich Ore',icon:'🪨',x:380,y:580,ready:true,timer:0,max:12},
  {id:'herb2',type:'herb',name:'Wild Herbs',icon:'🌿',x:380,y:720,ready:true,timer:0,max:10}
];

const R={
  yard:{x:170,y:430,w:280,h:430},
  forge:{x:700,y:410,w:230,h:210},
  alchemy:{x:1750,y:410,w:230,h:210},
  attack:{x:1030,y:480,w:270,h:150},
  defense:{x:1305,y:480,w:245,h:150},
  other:{x:1555,y:480,w:205,h:150},
  rareCase:{x:1050,y:740,w:240,h:90},
  counter:{x:1600,y:860,w:430,h:180},
  staff:{x:430,y:1360,w:510,h:350},
  contract:{x:2050,y:1320,w:550,h:490},
  gate:{x:2360,y:760,w:180,h:180}
};

const SOLIDS=[
  {x:500,y:180,w:1700,h:30,n:'North Shop Wall'},
  {x:500,y:180,w:30,h:420,n:'West Shop Wall A'},
  {x:500,y:740,w:30,h:560,n:'West Shop Wall B'},
  {x:2170,y:180,w:30,h:540,n:'East Shop Wall A'},
  {x:2170,y:970,w:30,h:330,n:'East Shop Wall B'},
  {x:500,y:1270,w:700,h:30,n:'South Shop Wall A'},
  {x:1500,y:1270,w:700,h:30,n:'South Shop Wall B'},
  {x:620,y:300,w:390,h:24,n:'Forge North'},{x:620,y:300,w:24,h:430,n:'Forge West'},
  {x:986,y:300,w:24,h:430,n:'Forge East'},{x:620,y:706,w:155,h:24,n:'Forge South A'},{x:875,y:706,w:135,h:24,n:'Forge South B'},
  {x:1680,y:300,w:390,h:24,n:'Alchemy North'},{x:1680,y:300,w:24,h:430,n:'Alchemy West'},
  {x:2046,y:300,w:24,h:430,n:'Alchemy East'},{x:1680,y:706,w:155,h:24,n:'Alchemy South A'},{x:1915,y:706,w:155,h:24,n:'Alchemy South B'},
  {x:1030,y:450,w:270,h:52,n:'Attack Counter'},{x:1305,y:450,w:245,h:52,n:'Defense Counter'},
  {x:1555,y:450,w:205,h:52,n:'Other Counter'},{x:1600,y:860,w:430,h:52,n:'Checkout Counter'},
  {x:430,y:1360,w:175,h:24,n:'Staff North A'},{x:685,y:1360,w:255,h:24,n:'Staff North B'},
  {x:430,y:1360,w:24,h:350,n:'Staff West'},{x:916,y:1360,w:24,h:350,n:'Staff East'},{x:430,y:1686,w:510,h:24,n:'Staff South'},
  {x:2050,y:1320,w:550,h:20,n:'Contract North'},{x:2050,y:1320,w:20,h:160,n:'Contract West A'},
  {x:2050,y:1570,w:20,h:240,n:'Contract West B'},{x:2580,y:1320,w:20,h:490,n:'Contract East'},{x:2050,y:1790,w:550,h:20,n:'Contract South'},
  {x:20,y:30,w:3030,h:70,n:'North Forest'},{x:20,y:1980,w:3030,h:70,n:'South Forest'},
  {x:20,y:30,w:70,h:2020,n:'West Forest'},{x:2980,y:30,w:70,h:2020,n:'East Forest'}
];

const recipes={
  sword:{name:'Iron Sword',icon:'⚔️',cat:'Attack',statName:'ATK',baseStat:12,iron:2,wood:1,value:42},
  potion:{name:'Healing Potion',icon:'🧪',cat:'Other',statName:'HP',baseStat:25,herb:2,value:28},
  shield:{name:'Wooden Shield',icon:'🛡️',cat:'Defense',statName:'DEF',baseStat:14,iron:1,wood:3,value:38}
};

const rar=[
  ['Poor','#987050',.5,0.75],
  ['Common','#e0e0e0',1,1.0],
  ['Uncommon','#63ce72',1.35,1.25],
  ['Rare','#5a9cff',2.1,1.6],
  ['Epic','#b16cff',3.5,2.1],
  ['Legendary','#ff9a3d',6,2.8]
];

const PTS={
  swordOut:{x:775,y:765},
  shieldOut:{x:875,y:765},
  potionOut:{x:1875,y:765},
  attackShelf:{x:1165,y:605},
  defenseShelf:{x:1425,y:605},
  otherShelf:{x:1655,y:605},
  coinPile:{x:1820,y:1055},
  checkoutWait:{x:1820,y:960},
  hire:{x:645,y:1575},
  contractDrop:{x:2230,y:1525}
};

function clone(x){return JSON.parse(JSON.stringify(x))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function collides(x,y,r=19){return SOLIDS.some(a=>x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)}
function moveEntity(o,nx,ny,r=19){
  if(!collides(nx,o.y,r))o.x=nx;
  if(!collides(o.x,ny,r))o.y=ny;
}

function loadForever(){
  try{return JSON.parse(localStorage.getItem(FOREVER_KEY)||'null')}catch{return null}
}
function saveForever(){
  localStorage.setItem(FOREVER_KEY,JSON.stringify({legacy:S.legacy,skills:S.skills}));
}
function key(n){return PREFIX+n}
function load(n){
  try{
    let raw=localStorage.getItem(key(n))||localStorage.getItem(OLD_PREFIX+n);
    return JSON.parse(raw||'null');
  }catch{return null}
}
function syncItemArrays(n){
  ['sword','potion','shield'].forEach(k=>{
    if(!Array.isArray(n.outputItems[k]))n.outputItems[k]=[];
    if(!Array.isArray(n.shelfItems[k]))n.shelfItems[k]=[];
    while(n.outputItems[k].length<(n.output[k]||0))n.outputItems[k].push(makeItemObject(k,1));
    while(n.shelfItems[k].length<(n.products[k]?.stock||0))n.shelfItems[k].push(makeItemObject(k,1));
    n.output[k]=n.outputItems[k].length;
    if(n.products[k])n.products[k].stock=n.shelfItems[k].length;
  });
}
function norm(x){
  let n=clone(base);
  if(x)Object.assign(n,x);
  const f=loadForever();
  n.skills={...base.skills,...(x?.skills||{}),...(f?.skills||{})};
  if(f&&typeof f.legacy==='number')n.legacy=Math.max(n.legacy||0,f.legacy);
  n.products={
    sword:{...base.products.sword,...(x?.products?.sword||{})},
    potion:{...base.products.potion,...(x?.products?.potion||{})},
    shield:{...base.products.shield,...(x?.products?.shield||{})}
  };
  n.output={...base.output,...(x?.output||{})};
  n.outputItems={...clone(base.outputItems),...(x?.outputItems||{})};
  n.shelfItems={...clone(base.shelfItems),...(x?.shelfItems||{})};
  n.rareDisplay=Array.isArray(x?.rareDisplay)?x.rareDisplay:[];
  n.employees=Array.isArray(x?.employees)?x.employees:[];
  n.contracts=Array.isArray(x?.contracts)?x.contracts:[];
  n.offers=Array.isArray(x?.offers)?x.offers:[];
  n.goals=Array.isArray(x?.goals)?x.goals:[];
  n.statsDay={...base.statsDay,...(x?.statsDay||{})};
  n.discoveries=Array.isArray(x?.discoveries)?x.discoveries:[];
  n.coinsFloor=x?.coinsFloor||0;
  n.poorPolicy=x?.poorPolicy||'Honest';
  syncItemArrays(n);
  return n;
}
function save(reason){
  if(!slot)return;
  S.savedAt=new Date().toLocaleString();
  S.reason=reason;
  saveForever();
  localStorage.setItem(key(slot),JSON.stringify(S));
  toast(reason+' • saved');
}

function resize(){
  vw=c.width=Math.round(innerWidth*devicePixelRatio);
  vh=c.height=Math.round(innerHeight*devicePixelRatio);
  g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  vw=innerWidth;vh=innerHeight;
}
addEventListener('resize',resize);resize();

function toast(t){
  $('toast').textContent=t;
  $('toast').classList.add('show');
  clearTimeout(msgTimer);
  msgTimer=setTimeout(()=>$('toast').classList.remove('show'),2100);
}
function addFloat(x,y,text,col='#ffed75'){
  effects.push({x,y,t:1.15,text,col});
}

function screenPoint(ev){
  const r=c.getBoundingClientRect();
  return {x:(ev.clientX-r.left)*vw/r.width,y:(ev.clientY-r.top)*vh/r.height};
}
function dragStart(ev){
  if($('panel').classList.contains('show')||$('craftGame').classList.contains('show')||ev.pointerType==='mouse'&&ev.button!==0)return;
  const p=screenPoint(ev);
  dragMove={active:true,id:ev.pointerId,sx:p.x,sy:p.y,dx:0,dy:0};
  c.setPointerCapture?.(ev.pointerId);
  $('dragStick').style.left=p.x+'px';
  $('dragStick').style.top=p.y+'px';
  $('dragStick').classList.add('show');
  target=null;
}
function dragUpdate(ev){
  if(!dragMove.active||ev.pointerId!==dragMove.id)return;
  const p=screenPoint(ev),dx=p.x-dragMove.sx,dy=p.y-dragMove.sy,d=Math.hypot(dx,dy),max=40;
  dragMove.dx=d?dx/d*Math.min(1,d/max):0;
  dragMove.dy=d?dy/d*Math.min(1,d/max):0;
  $('dragStick').firstElementChild.style.transform=`translate(${Math.max(-26,Math.min(26,dx))}px,${Math.max(-26,Math.min(26,dy))}px)`;
  ev.preventDefault();
}
function dragEnd(ev){
  if(!dragMove.active||ev.pointerId!==dragMove.id)return;
  const p=screenPoint(ev),d=Math.hypot(p.x-dragMove.sx,p.y-dragMove.sy);
  if(d<10)target={x:p.x/zoom+cam.x,y:p.y/zoom+cam.y};
  dragMove.active=false;dragMove.dx=dragMove.dy=0;
  $('dragStick').classList.remove('show');
  $('dragStick').firstElementChild.style.transform='translate(0,0)';
}
c.addEventListener('pointerdown',dragStart);
c.addEventListener('pointermove',dragUpdate);
c.addEventListener('pointerup',dragEnd);
c.addEventListener('pointercancel',dragEnd);
c.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.08:-.08))},{passive:false});
c.addEventListener('touchstart',e=>{if(e.touches.length===2)pinchStart=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
c.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinchStart){let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);setZoom(zoom+(d-pinchStart)/500);pinchStart=d;e.preventDefault()}},{passive:false});
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key===' ')attack()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function setZoom(v){
  zoom=Math.max(.46,Math.min(1.2,v));
  S.zoom=zoom;
}
function inside(p,z,pad=0){
  return p.x>z.x-pad&&p.x<z.x+z.w+pad&&p.y>z.y-pad&&p.y<z.y+z.h+pad;
}
function stepToward(o,tx,ty,s,dt){
  let dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);
  if(d<4)return true;
  o.moving=true;
  let nx=o.x+dx/d*s*dt,ny=o.y+dy/d*s*dt;
  moveEntity(o,nx,ny,17);
  return Math.hypot(tx-o.x,ty-o.y)<6;
}

// Smart doorway & aisle waypoint router so workers and clients never get stuck on walls
function inStaffRoom(p){return p.x>425&&p.x<945&&p.y>1355&&p.y<1715}
function inContractYard(p){return p.x>2045&&p.x<2605&&p.y>1315&&p.y<1815}
function inForgeRoom(p){return p.x>615&&p.x<1015&&p.y>295&&p.y<715}
function inAlchemyRoom(p){return p.x>1675&&p.x<2075&&p.y>295&&p.y<715}
function inMainShop(p){return p.x>505&&p.x<2195&&p.y>185&&p.y<1285}
function inMaterialYard(p){return p.x<505&&p.y>380&&p.y<900}

function navigate(o,tx,ty,s,dt){
  const goal={x:tx,y:ty};
  // 1. Exiting or entering Staff Room
  if(inStaffRoom(o)!==inStaffRoom(goal)){
    const door={x:645,y:inStaffRoom(o)?1330:1395};
    if(dist(o,door)>18)return stepToward(o,door.x,door.y,s,dt),false;
  }
  // 2. Exiting or entering Contract Warehouse
  if(inContractYard(o)!==inContractYard(goal)){
    const gate={x:inContractYard(o)?2015:2085,y:1525};
    if(dist(o,gate)>18)return stepToward(o,gate.x,gate.y,s,dt),false;
  }
  // 3. Exiting or entering Forge
  if(inForgeRoom(o)!==inForgeRoom(goal)){
    const door={x:825,y:inForgeRoom(o)?745:675};
    if(dist(o,door)>18)return stepToward(o,door.x,door.y,s,dt),false;
  }
  // 4. Exiting or entering Alchemy
  if(inAlchemyRoom(o)!==inAlchemyRoom(goal)){
    const door={x:1875,y:inAlchemyRoom(o)?745:675};
    if(dist(o,door)>18)return stepToward(o,door.x,door.y,s,dt),false;
  }
  // 5. Material Yard West Doorway (x=500, y=600..740)
  if(inMaterialYard(o)!==inMaterialYard(goal)){
    const wdoor={x:inMaterialYard(o)?545:465,y:670};
    if(dist(o,wdoor)>18)return stepToward(o,wdoor.x,wdoor.y,s,dt),false;
  }
  // 6. Moving between Main Shop interior and Outdoor South / East
  if(inMainShop(o)&&!inMainShop(goal)){
    if(goal.x>2195){
      const edoor={x:2220,y:845};
      if(dist(o,edoor)>22){
        if(o.y<820&&o.x>1560)return stepToward(o,1535,845,s,dt),false;
        return stepToward(o,edoor.x,edoor.y,s,dt),false;
      }
    }else if(goal.y>=1285){
      const sdoor={x:1350,y:1320};
      if(dist(o,sdoor)>22)return stepToward(o,sdoor.x,sdoor.y,s,dt),false;
    }
  }
  if(!inMainShop(o)&&inMainShop(goal)){
    if(o.x>2195&&o.y<1270){
      const edoor={x:2125,y:845};
      if(dist(o,edoor)>22)return stepToward(o,edoor.x,edoor.y,s,dt),false;
    }else if(o.y>=1270){
      const sdoor={x:1350,y:1220};
      if(dist(o,sdoor)>22)return stepToward(o,sdoor.x,sdoor.y,s,dt),false;
    }
  }
  // 7. Inside Main Shop: avoid Checkout Counter (x:1600..2030, y:860..915) & Retail Counters (y:450..505)
  if(inMainShop(o)&&inMainShop(goal)){
    const crossCheckout=(o.y<855&&goal.y>915)||(o.y>915&&goal.y<855);
    if(crossCheckout&&(o.x>1560||goal.x>1560)){
      const aisle={x:1535,y:o.y<885?930:835};
      if(o.x>1560)return stepToward(o,1535,o.y,s,dt),false;
      return stepToward(o,aisle.x,aisle.y,s,dt),false;
    }
  }
  return stepToward(o,tx,ty,s,dt);
}

function qroll(skill=0){
  let bonus=S.skills.quality*.04+skill*.002+(S.nextCraftBonus||0)+(S.event?.type==='forge'?.08:0);
  S.nextCraftBonus=0;
  let r=Math.random()+bonus;
  return r<.09?0:r<.56?1:r<.81?2:r<.94?3:r<.985?4:5;
}
function makeItemObject(k,qIndex,special=false){
  const r=recipes[k],q=typeof qIndex==='number'?qIndex:qroll(0);
  const stat=Math.round(r.baseStat*rar[q][3])+(special?6:0);
  const val=Math.round(r.value*rar[q][2]*(S.event?.type==='attack'&&k==='sword'?1.2:1))+(special?35:0);
  return {
    key:k,
    name:special?'Slime Edge':r.name,
    icon:special?'🗡️':r.icon,
    q,
    rarity:rar[q][0],
    color:rar[q][1],
    stat,
    value:val,
    defect:q===0?'Weak structure':null,
    special
  };
}
function canCraft(k){
  let r=recipes[k];
  if(!r||!S.products[k]?.unlocked)return false;
  if((S.output[k]||0)>=S.outputCap)return false;
  return (!r.iron||S.iron>=r.iron)&&(!r.wood||S.wood>=r.wood)&&(!r.herb||S.herb>=r.herb);
}
function outputPoint(k){
  return k==='potion'?PTS.potionOut:k==='shield'?PTS.shieldOut:PTS.swordOut;
}
function shelfPoint(k){
  return k==='sword'?PTS.attackShelf:k==='shield'?PTS.defenseShelf:PTS.otherShelf;
}
function craft(k,worker,useSlime=false){
  if((S.output[k]||0)>=S.outputCap){
    if(!worker)toast(recipes[k].name+' output table is full (8/8)!');
    return false;
  }
  if(!canCraft(k)){
    if(!worker)toast('Missing materials for '+recipes[k].name);
    return false;
  }
  let r=recipes[k];
  S.iron-=r.iron||0;S.wood-=r.wood||0;S.herb-=r.herb||0;
  let special=false;
  if(k==='sword'&&(useSlime||(S.gel>0&&Math.random()<.22))){
    if(S.gel>0){
      S.gel--;special=true;
      if(!S.discoveries.includes('Slime Edge')){
        S.discoveries.push('Slime Edge');
        toast('NEW RECIPE DISCOVERED • Slime Edge!');
      }
    }
  }
  let item=makeItemObject(k,qroll(worker?.craft||0),special);
  // Check Poor policy if set to Scrap
  if(item.q===0&&S.poorPolicy==='Scrap'){
    if(k==='potion')S.herb++;else S.iron++;
    if(!worker)toast('Poor '+item.name+' auto-scrapped (+1 material)');
    return true;
  }
  S.outputItems[k].push(item);
  S.output[k]=S.outputItems[k].length;
  if(item.q>=3){
    S.rareDisplay.unshift({name:item.name,icon:item.icon,rarity:item.rarity,color:item.color,stat:item.stat});
    if(S.rareDisplay.length>4)S.rareDisplay.pop();
  }
  S.statsDay.crafted++;
  const op=outputPoint(k);
  addFloat(op.x,op.y-10,item.icon+' '+item.rarity,item.color);
  if(!worker)toast(`Crafted ${item.rarity} ${item.name} (${r.statName} ${item.stat})`);
  return true;
}

function gatherYardNode(n){
  if(!n.ready)return;
  n.ready=false;n.timer=n.max;
  const amt=2+(S.skills.adventure>1?1:0);
  S[n.type]+=amt;
  addFloat(n.x,n.y-18,`+${amt} ${n.icon}`,'#a8ff9e');
  toast(`Gathered +${amt} ${n.name}`);
}

function spawnClient(){
  let on=Object.keys(S.products).filter(k=>S.products[k].on&&S.products[k].unlocked);
  if(!on.length||clients.length>=7)return;
  let k=on[Math.floor(Math.random()*on.length)];
  if(S.event?.type==='potion'&&S.products.potion.on)k='potion';
  let lv=Math.random(),level=lv>.82?'Knight':lv>.5?'Veteran':'Adventurer';
  let ps=['Impatient','Bargain','Experienced','Collector','Loyal'],personality=ps[Math.floor(Math.random()*ps.length)];
  let sp=shelfPoint(k),slotIdx=clients.filter(c=>c.want===k).length;
  clients.push({
    id:Date.now()+Math.random(),
    x:2460,y:835+(Math.random()*40-20),
    want:k,
    shelfX:sp.x+(slotIdx%3-1)*38,
    shelfY:sp.y+18+Math.floor(slotIdx/3)*28,
    pat:58+S.skills.merchant*4,
    max:58+S.skills.merchant*4,
    state:'toShelf',
    level,personality,
    minStat:level==='Knight'?15:level==='Veteran'?11:0,
    minQ:personality==='Collector'?2:level==='Knight'?1:0,
    minRarity:personality==='Collector'?'Uncommon':level==='Knight'?'Common':'Any',
    carriedItem:null,
    tipMult:personality==='Impatient'?1.6:personality==='Loyal'?1.35:1
  });
}

function clientTick(dt){
  for(let i=clients.length-1;i>=0;i--){
    let x=clients[i];x.moving=false;
    if(x.state==='toShelf'){
      if(navigate(x,x.shelfX,x.shelfY,115,dt))x.state='waitShelf';
    }else if(x.state==='waitShelf'){
      x.pat-=dt*(x.personality==='Impatient'?1.3:1);
      let arr=S.shelfItems[x.want];
      let matchIndex=arr?arr.findIndex(item=>item.stat>=(x.minStat||0)&&item.q>=(x.minQ||0)):-1;
      if(arr&&matchIndex>=0){
        let item=arr.splice(matchIndex,1)[0];
        S.products[x.want].stock=arr.length;
        // Inspection check for Poor items disguised as Common
        if(item.q===0&&S.poorPolicy==='Disguise'){
          let inspectChance=x.level==='Knight'?.75:x.personality==='Experienced'?.7:.35;
          if(Math.random()<inspectChance){
            S.rep-=2;S.badReviews++;S.statsDay.lost++;
            addFloat(x.x,x.y-30,'DEFECT CAUGHT! -2 REP','#ff6b6b');
            toast(`${x.level} caught disguised Poor ${item.name}! (-2 REP)`);
            x.state='leave';continue;
          }
        }
        x.carriedItem=item;
        x.state='toCheckout';
      }else if(x.pat<=0){
        S.rep--;S.statsDay.lost++;
        addFloat(x.x,x.y-25,'EMPTY SHELF -1 REP','#ff857a');
        toast('Customer left • no suitable '+recipes[x.want].name+' met the request');
        x.state='leave';
      }
    }else if(x.state==='toCheckout'){
      if(navigate(x,PTS.checkoutWait.x,PTS.checkoutWait.y,120,dt)){
        let item=x.carriedItem;
        let baseVal=item.value;
        if(item.q===0&&S.poorPolicy==='Honest')baseVal=Math.round(recipes[x.want].value*.5);
        if(item.q===0&&S.poorPolicy==='Disguise')baseVal=recipes[x.want].value;
        let mult=x.personality==='Bargain'?.88:x.personality==='Collector'&&item.q>=2?1.45:1;
        let price=Math.max(10,Math.round(baseVal*mult));
        let tip=x.pat/x.max>.6?Math.round((6+(S.RareBonus||0))*x.tipMult)+(S.rareDisplay.length*2):0;
        if(item.q>=2&&x.pat/x.max>.5)S.rep=Math.min(99,S.rep+(Math.random()<.35?1:0));
        S.coinsFloor+=price+tip;
        S.served++;
        S.statsDay.sales+=price;
        S.statsDay.tips+=tip;
        goalProgress('sale',1);
        if(tip>0)goalProgress('tip',1);
        addFloat(PTS.coinPile.x,PTS.coinPile.y-15,'+$'+(price+tip),'#ffd95e');
        x.carriedItem=null;
        x.state='leave';
      }
    }else if(x.state==='leave'){
      if(navigate(x,2480,845,140,dt))clients.splice(i,1);
    }
  }
}

function matchingContract(k,itemQ=1){
  return S.contracts.find(q=>q.key===k&&q.done<q.qty&&itemQ>=(q.minQ||0));
}
function pickNextOutputForSales(){
  const keys=['sword','shield','potion'].filter(k=>S.outputItems[k].length>0);
  if(!keys.length)return null;
  if(S.productionPriority==='Wholesale'){
    let wk=keys.find(k=>matchingContract(k,S.outputItems[k][0]?.q));
    if(wk)return {key:wk,dest:'contract'};
  }
  for(const k of keys){
    if(S.productionPriority==='Balanced'&&S.products[k].stock>=2&&matchingContract(k,S.outputItems[k][0]?.q)){
      return {key:k,dest:'contract'};
    }
    if(S.products[k].stock<12)return {key:k,dest:'shelf'};
    if(matchingContract(k,S.outputItems[k][0]?.q))return {key:k,dest:'contract'};
  }
  return null;
}

function employeeTick(dt){
  for(let e of S.employees){
    e.moving=false;
    if(e.job==='Sales'){
      e.statusIcon=e.carryKey?'📦':'🪙';
      if(e.carryKey){
        if(e.carryDest==='contract'){
          if(navigate(e,PTS.contractDrop.x,PTS.contractDrop.y,115,dt)){
            let c=matchingContract(e.carryKey,e.carryItem?.q||1);
            if(c&&contractUnits()<S.contractCap){
              c.done++;
              addFloat(PTS.contractDrop.x,PTS.contractDrop.y-15,`Contract ${c.done}/${c.qty}`,'#ffd86b');
            }else if(S.products[e.carryKey].stock<12){
              S.shelfItems[e.carryKey].push(e.carryItem||makeItemObject(e.carryKey,1));
              S.products[e.carryKey].stock=S.shelfItems[e.carryKey].length;
            }
            e.carryKey=null;e.carryItem=null;e.carryCount=0;
          }
        }else{
          let sp=shelfPoint(e.carryKey);
          if(navigate(e,sp.x,sp.y,115,dt)){
            if(S.products[e.carryKey].stock<12){
              S.shelfItems[e.carryKey].push(e.carryItem||makeItemObject(e.carryKey,1));
              S.products[e.carryKey].stock=S.shelfItems[e.carryKey].length;
            }
            e.carryKey=null;e.carryItem=null;e.carryCount=0;
          }
        }
      }else{
        let task=pickNextOutputForSales();
        if(task){
          let op=outputPoint(task.key);
          if(navigate(e,op.x,op.y,115,dt)&&S.outputItems[task.key].length>0){
            e.carryItem=S.outputItems[task.key].shift();
            S.output[task.key]=S.outputItems[task.key].length;
            e.carryKey=task.key;e.carryCount=1;e.carryDest=task.dest;
          }
        }else if(S.coinsFloor>0){
          if(navigate(e,PTS.coinPile.x,PTS.coinPile.y,115,dt)){
            let amt=S.coinsFloor;
            S.cash+=amt;S.coinsFloor=0;
            addFloat(PTS.coinPile.x,PTS.coinPile.y-20,`+$${amt}`,'#7dff9b');
            toast(e.name+' collected $'+amt+' from checkout');
          }
        }else{
          navigate(e,1480,780,90,dt);
        }
      }
    }else if(e.job==='Craft'){
      e.statusIcon='🔨';
      let candidates=Object.keys(S.products).filter(k=>S.products[k].on&&S.products[k].unlocked&&canCraft(k));
      if(S.productionPriority==='Wholesale'){
        let ck=S.contracts.find(c=>c.done<c.qty&&canCraft(c.key))?.key;
        if(ck)candidates=[ck];
      }
      let k=candidates.sort((a,b)=>(S.products[a].stock+S.output[a])-(S.products[b].stock+S.output[b]))[0]||'sword';
      let z=k==='potion'?R.alchemy:R.forge;
      if(navigate(e,z.x+z.w/2,z.y+z.h/2,105,dt)){
        if(canCraft(k)){
          e.work=(e.work||0)+dt*(1+e.craft/90);
          if(e.work>=6.5){e.work=0;craft(k,e,false)}
        }
      }
    }else if(e.job==='Expedition'){
      e.statusIcon='⚔️';
      if(navigate(e,2650,900,115,dt)){
        e.work=(e.work||0)+dt;
        if(e.work>=11){
          e.work=0;
          let bonus=1+Math.floor((e.atk*.6+e.def*.4)/32);
          S.iron+=bonus;S.wood+=1;S.herb+=1;
          if(Math.random()<.45)S.gel++;
          e.hp=Math.max(25,e.hp-Math.max(3,14-e.def*.12));
          addFloat(e.x,e.y-25,`+${bonus}🪨 +1🪵 +1🌿`,'#9ef8ff');
          if(e.hp<40){e.job='Staff House';toast(e.name+' is resting in Staff Room')}
          else toast(e.name+' returned with expedition materials');
        }
      }
    }else{
      e.statusIcon='💤';
      let idx=S.employees.indexOf(e);
      let tx=530+(idx%3)*120,ty=1500;
      navigate(e,tx,ty,85,dt);
      if(e.hp<100)e.hp=Math.min(100,e.hp+dt*3.5);
    }
  }
}

function tryPickUpOutput(k){
  if(S.outputItems[k].length<=0||player.carryCount>=player.carryCap)return;
  if(player.carryKey&&player.carryKey!==k)return;
  player.carryKey=k;
  while(player.carryCount<player.carryCap&&S.outputItems[k].length>0){
    let item=S.outputItems[k].shift();
    if(item.q===0&&S.poorPolicy==='Scrap'){
      if(k==='potion')S.herb++;else S.iron++;
      toast('Scrapped Poor item (+1 material)');
      continue;
    }
    player.carryItems.push(item);
    player.carryCount=player.carryItems.length;
  }
  S.output[k]=S.outputItems[k].length;
  if(player.carryCount>0){
    toast(`Picked up ${player.carryCount}× ${recipes[k].name}`);
    if(S.tutorialStep===2)advanceTutorial();
  }else player.carryKey=null;
}

function deliverToContract(){
  if(!player.carryKey||!player.carryCount)return false;
  let c=S.contracts.find(q=>q.key===player.carryKey&&q.done<q.qty);
  if(!c){toast('No active wholesale contract for '+recipes[player.carryKey].name);return false}
  let added=0;
  for(let i=player.carryItems.length-1;i>=0;i--){
    if(contractUnits()<S.contractCap&&c.done<c.qty&&player.carryItems[i].q>=(c.minQ||0)){
      c.done++;added++;
      player.carryItems.splice(i,1);
    }
  }
  player.carryCount=player.carryItems.length;
  if(!player.carryCount)player.carryKey=null;
  if(added>0){
    addFloat(PTS.contractDrop.x,PTS.contractDrop.y-20,`+${added} Contract (${c.done}/${c.qty})`,'#ffd86b');
    toast(`Loaded ${added}× ${recipes[c.key].name} into Contract Warehouse!`);
    return true;
  }
  toast('Carried items do not meet contract quality!');
  return false;
}

function updateContextActions(){
  const bar=$('actionBar');
  let btns=[];
  if(inside(player,R.forge,30)){
    btns.push(`<button onclick="window.triggerCraft('sword',false)">🔨 Sword (${S.iron}/2🪨 ${S.wood}/1🪵)</button>`);
    if(S.products.shield.unlocked){
      btns.push(`<button onclick="window.triggerCraft('shield',false)">🛡️ Shield (${S.iron}/1🪨 ${S.wood}/3🪵)</button>`);
    }
    if(S.gel>0||S.discoveries.includes('Slime Edge')){
      btns.push(`<button onclick="window.triggerCraft('sword',true)">🗡️ Slime Edge (${S.gel}/1💧)</button>`);
    }
  }
  if(inside(player,R.alchemy,30)){
    btns.push(`<button onclick="window.triggerCraft('potion',false)">⚗️ Brew Potion (${S.herb}/2🌿)</button>`);
  }
  let nearNode=yardNodes.find(n=>n.ready&&dist(player,n)<72);
  if(nearNode){
    btns.push(`<button onclick="window.triggerGather('${nearNode.id}')">${nearNode.icon} Gather ${nearNode.name}</button>`);
  }
  let nearMob=monsters.find(m=>dist(player,m)<155);
  if(nearMob||player.x>2320){
    btns.push(`<button onclick="window.triggerAttack()">⚔️ Attack Monster</button>`);
  }
  if(player.carryKey&&dist(player,PTS.contractDrop)<110){
    btns.push(`<button onclick="window.triggerContractDrop()">📦 Load Wholesale Crate</button>`);
  }
  if(dist(player,PTS.hire)<75&&S.employees.length<S.staffCap){
    btns.push(`<button onclick="window.triggerHire()">🤝 Hire Helper ($120)</button>`);
  }
  const html=btns.join('');
  if(bar.innerHTML!==html)bar.innerHTML=html;
}

window.triggerCraft=(k,slime)=>startCraftGame(k,slime);
window.triggerGather=id=>{const n=yardNodes.find(x=>x.id===id);if(n)gatherYardNode(n)};
window.triggerAttack=()=>attack();
window.triggerContractDrop=()=>deliverToContract();
window.triggerHire=()=>hireEmployeeAtPad();

function hireEmployeeAtPad(){
  if(S.employees.length>=S.staffCap)return toast('Staff Room is at capacity • Upgrade House');
  if(S.cash<120)return toast('Need $120 to hire a helper');
  S.cash-=120;
  let id=Date.now();
  S.employees.push({
    id,name:'Helper '+(S.employees.length+1),
    sell:22+Math.floor(Math.random()*28),
    craft:22+Math.floor(Math.random()*28),
    atk:18+Math.floor(Math.random()*28),
    def:18+Math.floor(Math.random()*28),
    wage:20,job:'Sales',hp:100,
    x:645,y:1510
  });
  addFloat(PTS.hire.x,PTS.hire.y-20,'HIRED! (Sales)','#7dff9b');
  toast('Hired Helper! Assigned to Sales (change anytime in STAFF)');
}

function playerTick(dt){
  let dx=dragMove.active?dragMove.dx:0,dy=dragMove.active?dragMove.dy:0;
  if(keys.w||keys.arrowup)dy--;
  if(keys.s||keys.arrowdown)dy++;
  if(keys.a||keys.arrowleft)dx--;
  if(keys.d||keys.arrowright)dx++;
  player.moving=false;
  if(dx||dy){
    target=null;player.moving=true;
    let d=Math.max(1,Math.hypot(dx,dy)),
        nx=player.x+dx/d*player.speed*dt,
        ny=player.y+dy/d*player.speed*dt;
    moveEntity(player,nx,ny,19);
    if(S.tutorialStep===0)advanceTutorial();
  }else if(target){
    if(stepToward(player,target.x,target.y,player.speed,dt))target=null;
    if(S.tutorialStep===0)advanceTutorial();
  }
  player.x=Math.max(55,Math.min(WORLD.w-55,player.x));
  player.y=Math.max(80,Math.min(WORLD.h-65,player.y));

  // Auto-gather ready Material Yard nodes when walking right over them
  for(const n of yardNodes){
    if(!n.ready){
      n.timer-=dt;
      if(n.timer<=0){n.ready=true;n.timer=0}
    }else if(dist(player,n)<46){
      gatherYardNode(n);
    }
  }

  // Pick up outputs (Sword, Shield, Potion)
  if(dist(player,PTS.swordOut)<56)tryPickUpOutput('sword');
  if(dist(player,PTS.shieldOut)<56)tryPickUpOutput('shield');
  if(dist(player,PTS.potionOut)<56)tryPickUpOutput('potion');

  // Stock retail shelf or Contract Warehouse
  if(player.carryKey){
    let sp=shelfPoint(player.carryKey);
    if(dist(player,sp)<66){
      let space=12-S.products[player.carryKey].stock;
      if(space>0){
        let moveCount=Math.min(space,player.carryItems.length);
        for(let i=0;i<moveCount;i++)S.shelfItems[player.carryKey].push(player.carryItems.shift());
        S.products[player.carryKey].stock=S.shelfItems[player.carryKey].length;
        player.carryCount=player.carryItems.length;
        addFloat(sp.x,sp.y-20,`+${moveCount} Stocked`,'#9ef8ff');
        toast(`Stocked ${moveCount}× ${recipes[player.carryKey].name}`);
        if(!player.carryCount)player.carryKey=null;
        if(S.tutorialStep===2)advanceTutorial();
      }else{
        toast('Shelf is full (12/12)!');
      }
    }
    if(dist(player,PTS.contractDrop)<66){
      deliverToContract();
    }
  }

  // Collect checkout coins
  if(S.coinsFloor>0&&dist(player,PTS.coinPile)<68){
    let amount=S.coinsFloor;
    S.cash+=amount;S.totalCoinsPicked+=amount;S.coinsFloor=0;
    addFloat(PTS.coinPile.x,PTS.coinPile.y-20,`+$${amount}`,'#ffd95e');
    toast(`Collected $${amount} from checkout!`);
    if(S.tutorialStep===3)advanceTutorial();
  }

  updateContextActions();
  cam.x=Math.max(0,Math.min(WORLD.w-vw/zoom,player.x-vw/(2*zoom)));
  cam.y=Math.max(0,Math.min(WORLD.h-vh/zoom,player.y-vh/(2*zoom)));
}

function attack(){
  let best=null,bestD=160;
  for(const m of monsters){
    let d=dist(player,m);
    if(d<bestD){best=m;bestD=d}
  }
  if(!best){
    toast('Walk closer to a monster in the East Forest to attack!');
    return;
  }
  let dmg=9+S.skills.adventure*3+(S.rareDisplay.length?2:0);
  best.hp-=dmg;
  addFloat(best.x,best.y-20,`-${dmg} HP`,'#ff7a7a');
  if(best.hp<=0){
    monsters.splice(monsters.indexOf(best),1);
    S.gel++;S.iron++;
    if(Math.random()<.55)S.herb++;
    S.statsDay.monsters++;
    goalProgress('monster',1);
    addFloat(best.x,best.y-36,'+1💧 +1🪨','#7dff9b');
    toast('Monster defeated! Collected Slime Gel & Iron');
    if(S.tutorialStep===4)advanceTutorial();
  }
}

function processContractDeadlines(){
  for(let i=S.contracts.length-1;i>=0;i--){
    let q=S.contracts[i];q.days--;
    if(q.done>=q.qty){S.cash+=q.reward;S.rep+=q.rep;S.legacy++;saveForever();toast(`Wholesale Contract Complete! +$${q.reward} & +1 Legacy`);S.contracts.splice(i,1)}
    else if(q.days<=0){S.rep-=q.penalty;toast(`Wholesale Contract Failed! -${q.penalty} REP`);S.contracts.splice(i,1)}
  }
}
function generateContractOffers(){
  S.offers=[{id:Date.now()+1,buyer:'Town Guard',key:'sword',qty:4,days:2,minQ:1,reward:260,rep:2,penalty:2},{id:Date.now()+2,buyer:'Explorer Guild',key:'potion',qty:5,days:2,minQ:1,reward:220,rep:2,penalty:2}];
  if(S.products.shield.unlocked)S.offers.push({id:Date.now()+3,buyer:'Royal Garrison',key:'shield',qty:4,days:2,minQ:1,reward:250,rep:3,penalty:2});
}
function contractsEnd(){processContractDeadlines();generateContractOffers()}
function contractUnits(){return S.contracts.reduce((a,x)=>a+x.done,0)}

function createDayContent(){
  const pool=[
    {type:'sale',target:4,label:'Sell 4 products'},
    {type:'craft',target:3,label:'Craft 3 products'},
    {type:'monster',target:2,label:'Defeat 2 forest slimes'},
    {type:'tip',target:2,label:'Earn 2 fast-service tips'}
  ];
  S.goals=pool.sort(()=>Math.random()-.5).slice(0,3).map(x=>({...x,value:0,done:false}));
  const events=[
    {name:'Adventurer Festival',desc:'Sword prices are increased +20% today.',type:'attack'},
    {name:'Potion Rush',desc:'Customers request Healing Potions more often today.',type:'potion'},
    {name:'Hot Forge',desc:'Crafting quality chances are boosted today.',type:'forge'},
    {name:'Supply Caravan',desc:'A caravan delivered +3 Iron, +3 Wood, and +3 Herb.',type:'merchant'}
  ];
  S.event=events[Math.floor(Math.random()*events.length)];
  if(S.event.type==='merchant'){S.iron+=3;S.wood+=3;S.herb+=3}
  if(!S.offers.length)generateContractOffers();
  S.statsDay={sales:0,tips:0,crafted:0,monsters:0,lost:0};
}

function goalProgress(type,n){
  for(const q of S.goals){
    if(q.type===type&&!q.done){
      q.value+=n;
      if(q.value>=q.target){
        q.done=true;
        toast('Daily Goal Complete • '+q.label);
      }
    }
  }
}

function endDay(){
  contractsEnd();
  let wages=S.employees.reduce((a,e)=>a+Math.round(e.wage*(e.job==='Staff House'?.5:e.job==='Expedition'?1.1:1)),0),
      all=S.goals.length&&S.goals.every(x=>x.done);
  S.cash-=wages;
  if(S.cash<0){S.cash=0;S.rep-=2}
  if(all){S.legacy++;saveForever()}
  let oldDay=S.day;
  S.day++;dayTime=0;
  save('Day '+oldDay+' completed');
  playing=false;
  $('summaryContent').innerHTML=`
    <div class="row"><span>Retail sales</span><b>$${S.statsDay.sales}</b></div>
    <div class="row"><span>Service tips</span><b>$${S.statsDay.tips}</b></div>
    <div class="row"><span>Employee wages</span><b>-$${wages}</b></div>
    <div class="row"><span>Customers lost</span><b>${S.statsDay.lost}</b></div>
    <div class="row"><span>Products crafted</span><b>${S.statsDay.crafted}</b></div>
    <div class="row"><span>Monsters defeated</span><b>${S.statsDay.monsters}</b></div>
    <div class="row"><span>All-goals bonus</span><b>${all?'+1 Legacy Point':'Not completed'}</b></div>`;
  $('daySummary').classList.add('show');
}

function update(dt){
  if(!playing)return;
  animClock+=dt;
  dayTime+=dt;
  if(dayTime>=120)return endDay();
  spawnTimer-=dt;
  if(spawnTimer<=0){spawnClient();spawnTimer=5.5+Math.random()*4}
  playerTick(dt);
  employeeTick(dt);
  clientTick(dt);
  if(monsters.length<6&&Math.random()<dt*.4){
    monsters.push({x:2520+Math.random()*360,y:920+Math.random()*750,hp:18,maxHp:18});
  }
  effects.forEach(e=>e.t-=dt);
  effects=effects.filter(e=>e.t>0);
  if(S.rep<0){
    toast('GAME OVER • Shop reputation fell below 0');
    playing=false;openPage('save');
  }
}

function pxRect(x,y,w,h,col){
  g.fillStyle=col;
  g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function text(t,x,y,z=14,col='#fff'){
  g.fillStyle=col;
  g.font=`bold ${z}px Arial`;
  g.textAlign='center';
  g.fillText(t,x,y);
}
function tree(x,y,v=0){
  const dark=['#174f2a','#1c5b31','#224b28'][v%3],mid=['#27743a','#2c7f42','#326b37'][v%3],light=['#4b9a45','#5fae4a','#60a441'][v%3];
  pxRect(x-7,y+20,14,34,'#70442d');pxRect(x-31,y-6,62,48,dark);pxRect(x-24,y-21,48,31,mid);pxRect(x-14,y-33,28,21,light);
}
function pine(x,y){
  pxRect(x-5,y+18,10,28,'#65412c');pxRect(x-27,y+4,54,25,'#164d30');pxRect(x-22,y-12,44,24,'#1f6840');pxRect(x-16,y-27,32,23,'#33814b');
}
function rock(x,y){pxRect(x-20,y-9,40,21,'#65706e');pxRect(x-14,y-16,28,11,'#89928d')}
function water(x,y,w,h){
  pxRect(x,y,w,h,'#187e9e');
  for(let yy=y+8;yy<y+h;yy+=18)for(let xx=x+8;xx<x+w;xx+=42)pxRect(xx,yy,22,4,'#4fc3d4');
  pxRect(x,y,w,5,'#7fe1dc');
}
function floorTile(x,y,w,h,col='#ccb07e'){
  pxRect(x,y,w,h,col);
  for(let yy=y+8;yy<y+h;yy+=28)for(let xx=x+8+(yy%56);xx<x+w;xx+=42)pxRect(xx,yy,28,4,'#b79869');
}
function wallH(x,y,w){
  pxRect(x,y,w,24,'#5c4335');pxRect(x,y,w,8,'#9c7556');
  for(let xx=x+12;xx<x+w;xx+=34)pxRect(xx,y+8,4,16,'#3e3028');
}
function wallV(x,y,h){
  pxRect(x,y,24,h,'#5c4335');pxRect(x,y,8,h,'#9c7556');
  for(let yy=y+12;yy<y+h;yy+=34)pxRect(x+8,yy,16,4,'#3e3028');
}
function doorMat(x,y,w=70,h=28){
  pxRect(x,y,w,h,'#7d392e');
  for(let xx=x+8;xx<x+w-6;xx+=16)pxRect(xx,y+5,8,h-10,'#bb6848');
}
function counter(x,y,w,col,icon){
  pxRect(x,y,w,52,'#714427');pxRect(x,y,w,12,col);pxRect(x+10,y+19,w-20,7,'#c49857');
  text(icon,x+w/2,y+41,20,'#fff1c5');
}
function crate(x,y,filled=false,icon=''){
  pxRect(x,y,38,34,filled?'#b87c3c':'#6d4c2d');
  pxRect(x+4,y+4,30,26,filled?'#dfb06a':'#8c6239');
  pxRect(x+17,y,4,34,'#593a1e');
  if(filled&&icon)text(icon,x+19,y+23,14,'#fff');
}
function bed(x,y,col){
  pxRect(x,y,78,38,'#6e4832');pxRect(x+7,y+5,64,28,col);pxRect(x+8,y+7,20,11,'#eee3c8');
}
function labelRoom(t,x,y,col='#fff1c2'){
  pxRect(x-82,y-13,164,22,'#201919cc');
  text(t,x,y+3,11,col);
}

function drawShelfSlots(x,y,items,max,col){
  for(let i=0;i<max;i++){
    let sx=x+(i%4)*52,sy=y+Math.floor(i/4)*26;
    pxRect(sx-18,sy-10,36,20,'#2b221ecc');
    pxRect(sx-16,sy-8,32,16,i<items.length?col:'#42352f');
    if(i<items.length){
      let it=items[i];
      pxRect(sx-16,sy-8,32,4,it.color||'#fff');
      text(it.icon,sx,sy+5,12,'#fff');
    }
  }
}

function drawOutputTable(x,y,items,max,label){
  pxRect(x-52,y-22,104,48,'#6b472b');
  pxRect(x-48,y-18,96,40,'#8c623e');
  for(let i=0;i<max;i++){
    let sx=x-36+(i%4)*24,sy=y-7+Math.floor(i/4)*18;
    pxRect(sx-9,sy-7,18,14,i<items.length?'#3b2b20':'#593e29');
    if(i<items.length){
      text(items[i].icon,sx,sy+4,11,'#fff');
    }
  }
  pxRect(x-50,y+28,100,17,'#191618cc');
  text(`${label} ${items.length}/${max}`,x,y+40,9.5,items.length>=max?'#ff8978':'#ffe7a0');
}

function drawPixelWorld(){
  pxRect(0,0,WORLD.w,WORLD.h,'#438f3f');
  for(let y=0;y<WORLD.h;y+=32)for(let x=0;x<WORLD.w;x+=32)if((x*7+y*11)%97<7)pxRect(x+9,y+14,4,4,'#71b850');

  water(100,1450,280,420);water(2720,1320,240,500);
  for(let x=120;x<WORLD.w-120;x+=140)tree(x,1950,x/140+1);
  for(let y=180;y<1930;y+=105){tree(65,y,y/105);tree(3005,y,y/105+2)}
  for(let i=0;i<9;i++){pine(2500+(i%3)*130,1140+Math.floor(i/3)*170);rock(2490+i*52,520+(i%2)*55)}

  // Material Yard (West of shop)
  pxRect(160,420,340,450,'#8d7754');
  wallH(160,420,340);wallH(160,850,340);wallV(160,420,450);
  labelRoom('MATERIAL YARD',320,452,'#c8ffb8');
  for(const n of yardNodes){
    pxRect(n.x-28,n.y-22,56,44,n.ready?'#544738':'#3a3229');
    text(n.icon,n.x,n.y+6,22,n.ready?'#fff':'#777');
    text(n.name,n.x,n.y+32,9.5,'#ffe9b5');
    if(!n.ready){
      pxRect(n.x-24,n.y-28,48,6,'#222');
      pxRect(n.x-24,n.y-28,48*(1-n.timer/n.max),6,'#67d876');
    }
  }

  // Main Shop Floor & Outer Walls (with West Material Gate y:600..740, South Door x:1200..1500, East Door y:720..970)
  floorTile(500,180,1700,1120,'#d2b680');
  wallH(500,180,1700);
  wallV(500,180,420);wallV(500,740,560);doorMat(496,605,32,130);
  wallV(2170,180,540);wallV(2170,970,330);doorMat(2166,730,32,230);
  wallH(500,1270,700);wallH(1500,1270,700);doorMat(1210,1270,280,28);

  // Forge Room
  floorTile(620,300,390,430,'#c9a46c');
  wallH(620,300,390);wallV(620,300,430);wallV(986,300,430);
  wallH(620,706,155);wallH(875,706,135);doorMat(775,706,100,26);
  labelRoom('FORGE WORKSHOP',815,340,'#ffd58a');
  pxRect(700,450,105,85,'#55545a');pxRect(720,470,65,45,'#ec642c');pxRect(736,458,34,32,'#ffd23d');
  pxRect(835,465,75,38,'#4c4c52');text('🔨 ANVIL',815,575,11,'#ffe3a8');

  // Alchemy Room
  floorTile(1680,300,390,430,'#bea77c');
  wallH(1680,300,390);wallV(1680,300,430);wallV(2046,300,430);
  wallH(1680,706,155);wallH(1915,706,155);doorMat(1835,706,80,26);
  labelRoom('ALCHEMY LAB',1875,340,'#a9f0ac');
  for(let i=0;i<5;i++){
    pxRect(1730+i*57,465,32,47,'#69432d');
    pxRect(1737+i*57,443,18,25,['#f15a5a','#55aaf2','#b16bea','#5bd879','#edca4d'][i]);
  }
  pxRect(1740,555,260,48,'#765136');text('⚗️ CAULDRON',1870,584,11,'#c7ffd0');

  // Retail Sales Counters & 12-Slot Shelf Trays
  labelRoom('RETAIL DISPLAY SHELVES',1400,418);
  counter(1030,450,270,'#a63236','⚔️ ATTACK');
  counter(1305,450,245,'#3569a3','🛡️ DEFENSE');
  counter(1555,450,205,'#7650a1','🧪 OTHER');

  drawShelfSlots(1085,528,S.shelfItems.sword,12,'#8f2d30');
  drawShelfSlots(1350,528,S.shelfItems.shield,12,'#2d5b8f');
  drawShelfSlots(1580,528,S.shelfItems.potion,12,'#663d8f');

  pxRect(1100,598,130,18,'#181518cc');text(`SWORD ${S.products.sword.stock}/12`,1165,611,10,'#fff');
  pxRect(1360,598,130,18,'#181518cc');text(`SHIELD ${S.products.shield.stock}/12`,1425,611,10,'#fff');
  pxRect(1590,598,130,18,'#181518cc');text(`POTION ${S.products.potion.stock}/12`,1655,611,10,'#fff');

  // Workshop Output Tables
  drawOutputTable(PTS.swordOut.x,PTS.swordOut.y,S.outputItems.sword,S.outputCap,'SWORD OUT');
  drawOutputTable(PTS.shieldOut.x,PTS.shieldOut.y,S.outputItems.shield,S.outputCap,'SHIELD OUT');
  drawOutputTable(PTS.potionOut.x,PTS.potionOut.y,S.outputItems.potion,S.outputCap,'POTION OUT');

  // Rare / Special Item Display Case
  pxRect(1050,740,240,86,'#4b345d');
  pxRect(1056,746,228,74,'#291d36');
  text('✨ RARE SHOWCASE',1170,762,10,'#f2c6ff');
  for(let i=0;i<4;i++){
    let rx=1086+i*56,ry=794,it=S.rareDisplay[i];
    pxRect(rx-18,ry-16,36,32,it?it.color:'#3d2d4f');
    if(it)text(it.icon,rx,ry+6,15,'#fff');
  }

  // Customer Hall & Checkout Counter
  labelRoom('CHECKOUT COUNTER',1815,835,'#ffe09a');
  counter(1600,860,430,'#b77f2b','🪙 CHECKOUT');
  pxRect(1760,1025,120,60,'#9e7b4bc0');
  text('COIN TRAY',1820,1098,10,'#fff1a0');

  // Staff Room
  floorTile(430,1360,510,350,'#bda783');
  wallH(430,1360,175);wallH(685,1360,255);wallV(430,1360,350);wallV(916,1360,350);wallH(430,1686,510);
  doorMat(605,1360,80,26);
  labelRoom('STAFF ROOM & HIRING',685,1400,'#c5efbb');
  bed(490,1460,'#658eb5');bed(710,1460,'#9a6eaf');

  // Contract Warehouse
  pxRect(2050,1320,550,490,'#769255');
  wallH(2050,1320,550);wallV(2050,1320,160);wallV(2050,1570,240);wallV(2580,1320,490);wallH(2050,1790,550);
  doorMat(2046,1480,28,90);
  labelRoom('CONTRACT WAREHOUSE',2325,1358,'#ffe1a0');
  pxRect(2165,1485,130,80,'#4f6638');
  text('DROP ZONE',2230,1530,11,'#fff3b8');
  let filledCrates=contractUnits(),activeIcon=S.contracts[0]?recipes[S.contracts[0].key].icon:'📦';
  for(let i=0;i<20;i++){
    crate(2120+(i%5)*82,1395+Math.floor(i/5)*92,i<filledCrates,activeIcon);
  }

  // Outdoor Roads & Adventure Gate
  pxRect(1200,1270,300,150,'#aa9a72');
  pxRect(610,1320,1440,60,'#aa9a72');
  pxRect(2200,790,340,110,'#aa9a72');
  pxRect(2390,745,110,200,'#45385c');
  pxRect(2405,760,80,170,'#63d89b66');
  labelRoom('ADVENTURE GATE',2445,730,'#8effc1');
  labelRoom('MONSTER FOREST',2690,880,'#b9ffbb');
}

function person(o,col='#302831',label='',hatType='none',badge=''){
  g.save();
  let bob=o.moving?Math.sin(animClock*14)*3:0;
  g.translate(Math.round(o.x),Math.round(o.y+bob));
  // Ground shadow
  g.fillStyle='#0005';
  g.beginPath();g.ellipse(0,41-bob,18,7,0,0,Math.PI*2);g.fill();
  // Legs & Boots
  pxRect(-13,16,10,22,'#372b2e');pxRect(4,16,10,22,'#372b2e');
  pxRect(-16,36,13,7,'#241c1f');pxRect(3,36,13,7,'#241c1f');
  // Torso & Arms
  pxRect(-18,-12,36,32,col);
  pxRect(-26,-8,9,22,col);pxRect(17,-8,9,22,col);
  // Head & Eyes
  pxRect(-14,-32,28,23,'#efc694');
  pxRect(-8,-23,4,4,'#222');pxRect(5,-23,4,4,'#222');
  // Role Headgear
  if(hatType==='Knight'){
    pxRect(-16,-41,32,14,'#8c9aa6');pxRect(-12,-35,24,5,'#d4dee8');
  }else if(hatType==='Collector'){
    pxRect(-15,-41,30,11,'#e6b835');pxRect(-8,-45,16,5,'#ffdf6b');
  }else if(hatType==='Veteran'){
    pxRect(-16,-40,32,12,'#3d5a35');
  }else{
    pxRect(-15,-39,30,11,'#473127');
  }
  if(label){
    pxRect(-58,-58,116,17,'#171719dd');
    text(label,0,-46,9.5,'#fff');
  }
  if(badge){
    text(badge,26,-24,14,'#fff');
  }
  g.restore();
}

function drawRequest(o,label){
  let lines=label.split('\n'),w=138,h=16+lines.length*14,x=o.x-w/2,y=o.y-72-h;
  pxRect(x,y,w,h,'#fff0c9');
  g.strokeStyle='#6d4931';g.lineWidth=3;g.strokeRect(x,y,w,h);
  for(let i=0;i<lines.length;i++)text(lines[i],o.x,y+15+i*14,10,'#352619');
}

function draw(){
  g.save();
  g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  g.clearRect(0,0,vw,vh);
  g.imageSmoothingEnabled=false;
  g.scale(zoom,zoom);
  g.translate(-cam.x,-cam.y);

  drawPixelWorld();

  // Hire Pad
  g.globalAlpha=.65;g.fillStyle='#52c465';
  g.fillRect(PTS.hire.x-48,PTS.hire.y-28,96,56);
  g.globalAlpha=1;
  text('🤝 HIRE $120',PTS.hire.x,PTS.hire.y+5,10.5,'#fff');

  // Checkout Coins
  if(S.coinsFloor>0){
    for(let i=0;i<Math.min(12,Math.ceil(S.coinsFloor/18));i++){
      g.fillStyle='#ffd54f';
      g.beginPath();g.arc(PTS.coinPile.x-25+(i%5)*14,PTS.coinPile.y-10+Math.floor(i/5)*13,7,0,7);g.fill();
    }
    text('$'+S.coinsFloor,PTS.coinPile.x,PTS.coinPile.y-26,13,'#fff4a3');
  }

  // Customers
  clients.forEach(x=>{
    let col=x.level==='Knight'?'#4a6b9c':x.personality==='Collector'?'#8a4999':'#6f4c92';
    person(x,col,x.level,x.level==='Knight'?'Knight':x.personality==='Collector'?'Collector':x.level==='Veteran'?'Veteran':'none',x.carriedItem?x.carriedItem.icon:'');
    if(x.state==='toShelf'||x.state==='waitShelf'){
      let r=recipes[x.want];
      let label=`${r.icon} ${r.name}`+(x.minStat?`\n${r.statName} ${x.minStat}+`:'')+(x.minRarity!=='Any'?` • ${x.minRarity}+`:'');
      drawRequest(x,label);
      pxRect(x.x-30,x.y-66,60,7,'#332a30');
      pxRect(x.x-30,x.y-66,60*Math.max(0,x.pat/x.max),7,x.pat/x.max>.4?'#5ed177':'#ed6256');
    }
  });

  // Employees
  S.employees.forEach(e=>{
    let col=e.job==='Sales'?'#c68a2d':e.job==='Craft'?'#c65337':e.job==='Expedition'?'#4b6cb7':'#67825d';
    person(e,col,`${e.name} (${e.job})`,'none',e.carryKey?recipes[e.carryKey].icon:(e.statusIcon||''));
    if(e.job==='Craft'&&e.work>0){
      pxRect(e.x-24,e.y-68,48,6,'#222');
      pxRect(e.x-24,e.y-68,48*Math.min(1,e.work/6.5),6,'#ffd257');
    }
  });

  // Monsters
  monsters.forEach(m=>{
    let bounce=Math.sin(animClock*8+m.x)*3;
    pxRect(m.x-22,m.y-3+bounce,44,28,'#49ad44');
    pxRect(m.x-15,m.y-15+bounce,30,18,'#78dd62');
    pxRect(m.x-8,m.y+2+bounce,4,4,'#222');pxRect(m.x+5,m.y+2+bounce,4,4,'#222');
    pxRect(m.x-20,m.y-26,40,6,'#222');
    pxRect(m.x-20,m.y-26,40*(m.hp/18),6,'#67e66c');
  });

  // Player & Carried Stack
  if(player.carryCount>0){
    for(let i=0;i<player.carryItems.length;i++){
      let it=player.carryItems[i];
      pxRect(player.x-14,player.y-76-i*20,28,18,it.color||'#fff');
      text(it.icon,player.x,player.y-62-i*20,14,'#fff');
    }
  }
  person(player,'#297ea1','YOU');

  if(target){
    g.strokeStyle='#fff0a3';g.lineWidth=3;
    g.strokeRect(target.x-12,target.y-12,24,24);
  }
  effects.forEach(e=>text(e.text,e.x,e.y-(1.15-e.t)*34,14,e.col||'#ffed75'));
  g.restore();
}

function renderSlots(){
  $('saveSlots').innerHTML=[1,2,3].map(n=>{
    let d=load(n);
    return `<div class="slot"><h2>SAVE SLOT ${n}</h2>${d?`<p>Day ${d.day} • Cash $${d.cash}<br>Reputation ${d.rep} • Legacy ${d.legacy||0}<br>Staff ${d.employees?.length||0} • Saved ${d.savedAt||'Recently'}</p>`:'<p>Empty shop record<br>Start with 0 employees and build your empire!</p>'}<div class="actions"><button data-load="${n}">${d?'LOAD SHOP':'START NEW SHOP'}</button>${d?`<button class="danger" data-del="${n}">DELETE</button>`:''}</div></div>`;
  }).join('');
  document.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>start(Number(b.dataset.load)));
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('Delete this save slot? (Forever Skills & Legacy are kept)')){
      localStorage.removeItem(key(Number(b.dataset.del)));
      localStorage.removeItem(OLD_PREFIX+Number(b.dataset.del));
      renderSlots();
    }
  });
}

function start(n){
  slot=n;
  let existing=load(n);
  S=norm(existing);
  player={x:1350,y:1160,speed:315,carryKey:null,carryCount:0,carryItems:[],carryCap:3+S.skills.management};
  clients=[];monsters=[];target=null;dayTime=0;zoom=S.zoom||.68;
  if(!S.goals.length)createDayContent();
  if(!S.offers.length)generateContractOffers();
  playing=true;
  $('slotScreen').classList.remove('show');
  $('app').classList.remove('hidden');
  if(!existing)save('Slot created');
  toast('Hold & drag anywhere to walk!');
  showTutorial();
}

function card(title,body){return `<div class="card"><h3>${title}</h3>${body}</div>`}

function openPage(p){
  $('panel').classList.add('show');
  let h='';
  if(p==='status'){
    h=`<div class="eventBanner"><b>TODAY'S EVENT • ${S.event?.name||'Market Day'}</b><br>${S.event?.desc||''}</div>
    <h2>DAILY GOALS</h2>
    ${S.goals.map(q=>`<div class="dailyGoal ${q.done?'done':''}">${q.done?'✓':'□'} ${q.label} • <b>${Math.min(q.value,q.target)}/${q.target}</b></div>`).join('')}
    <h2>SHOP OVERVIEW</h2>
    <div class="grid">
      ${card('Business Status',`
        <div class="row"><span>Day</span><b>${S.day}</b></div>
        <div class="row"><span>Cash</span><b>$${S.cash}</b></div>
        <div class="row"><span>Reputation</span><b>${S.rep}</b></div>
        <div class="row"><span>Shop Rating</span><b>${Math.max(1,S.review-S.badReviews*.15).toFixed(1)} ★</b></div>
      `)}
      ${card('Raw Materials',`
        <div class="row"><span>🪨 Iron Ore</span><b>${S.iron}</b></div>
        <div class="row"><span>🪵 Hardwood</span><b>${S.wood}</b></div>
        <div class="row"><span>🌿 Healing Herb</span><b>${S.herb}</b></div>
        <div class="row"><span>💧 Slime Gel</span><b>${S.gel}</b></div>
      `)}
      ${card('Rare Showcase (`+Tip Bonus`)',S.rareDisplay.length?S.rareDisplay.map(r=>`<div>${r.icon} <b style="color:${r.color}">${r.rarity} ${r.name}</b> (${r.stat})</div>`).join(''):'Craft Rare+ items or Slime Edge to fill the showcase!')}
    </div>`;
  }
  if(p==='products'){
    h=`<h2>PRODUCTS & QUALITY POLICY</h2>
    <div class="presetRow">
      <button data-preset="Safe">SAFE</button>
      <button data-preset="Profit">PROFIT</button>
      <button data-preset="Quality">QUALITY</button>
      <button data-preset="Custom">ALL ON</button>
    </div>
    <div class="card" style="margin-bottom:10px">
      <h3>Poor / Defective Item Policy: <b>${S.poorPolicy}</b></h3>
      <p style="font-size:12px;margin:4px 0;color:#cbb89d">Choose how Poor-quality items are handled (Workers never auto-disguise defects):</p>
      <div class="presetRow" style="grid-template-columns:repeat(3,1fr);margin:0">
        <button data-poor="Honest" class="${S.poorPolicy==='Honest'?'on':''}">HONEST (50% Price)</button>
        <button data-poor="Scrap" class="${S.poorPolicy==='Scrap'?'on':''}">SCRAP (+1 Mat)</button>
        <button data-poor="Disguise" class="${S.poorPolicy==='Disguise'?'on':''}">DISGUISE (Risk -REP)</button>
      </div>
    </div>
    <div class="grid">
      ${Object.entries(recipes).map(([k,r])=>{
        let x=S.products[k];
        return card(`${r.icon} ${r.name}`,`
          <div class="row"><span>Department</span><b>${r.cat} (${r.statName} ${r.baseStat})</b></div>
          <div class="row"><span>Recipe Cost</span><b>${r.iron?r.iron+'🪨 ':''}${r.wood?r.wood+'🪵 ':''}${r.herb?r.herb+'🌿':''}</b></div>
          <div class="row"><span>Shelf Stock</span><b>${x.stock}/12 (Out: ${S.output[k]}/8)</b></div>
          ${x.unlocked?`<button data-toggle="${k}" class="${x.on?'on':''}">${x.on?'SELLING ON':'SELLING OFF'}</button>`:`<button data-unlock="${k}">UNLOCK RECIPE ($180)</button>`}
        `);
      }).join('')}
    </div>`;
  }
  if(p==='employees'){
    h=`<h2>STAFF & ASSIGNMENTS (${S.employees.length}/${S.staffCap})</h2>
    <button class="action" id="applyRecommended">✨ APPLY ALL RECOMMENDED ROLES</button>
    <div class="grid" style="margin-top:10px">
      ${S.employees.map(e=>card(`${e.name} • ${e.job}`,`
        <div class="abilities"><span>SELL ${e.sell}</span><span>CRAFT ${e.craft}</span><span>ATK ${e.atk}</span><span>DEF ${e.def}</span></div>
        <div class="row"><span>HP ${Math.round(e.hp)}/100</span><span>Wage $${e.wage}/day</span></div>
        ${['Sales','Craft','Expedition','Staff House'].map(j=>`<button data-emp="${e.id}" data-job="${j}" class="${e.job===j?'on':''}">${j}</button>`).join('')}
      `)).join('')}
      ${card('Staff Room Management',`
        <div class="row"><span>Staff Capacity</span><b>${S.employees.length}/${S.staffCap}</b></div>
        <button id="hire">🤝 HIRE NEW HELPER ($120)</button>
        <button id="house">🏠 UPGRADE STAFF ROOM ($300)</button>
      `)}
    </div>`;
  }
  if(p==='wholesale'){
    h=`<h2>WHOLESALE CONTRACTS</h2>
    <div class="card" style="margin-bottom:10px">
      <h3>Worker Priority: <b>${S.productionPriority}</b></h3>
      <p style="font-size:12px;margin:4px 0;color:#cbb89d">Controls whether Sales & Craft workers prioritize Retail shelves or the Contract Warehouse:</p>
      <div class="presetRow" style="grid-template-columns:repeat(3,1fr);margin:0">
        <button data-priority="Retail" class="${S.productionPriority==='Retail'?'on':''}">RETAIL FIRST</button>
        <button data-priority="Balanced" class="${S.productionPriority==='Balanced'?'on':''}">BALANCED</button>
        <button data-priority="Wholesale" class="${S.productionPriority==='Wholesale'?'on':''}">WHOLESALE FIRST</button>
      </div>
    </div>
    <div class="grid">
      ${S.contracts.map(q=>card(`ACTIVE • ${q.buyer}`,`
        <div class="row"><span>Order</span><b>${recipes[q.key].icon} ${recipes[q.key].name} ${q.done}/${q.qty}</b></div>
        <div class="bar"><i style="width:${Math.min(100,q.done/q.qty*100)}%"></i></div>
        <div class="row"><span>Deadline</span><b>${q.days} day(s) left</b></div>
        <div class="row"><span>Reward</span><b>$${q.reward} & +1 Legacy</b></div>
        <p style="font-size:11px;color:#ffd88a;margin:6px 0 0">Carry ${recipes[q.key].name} to the Contract Warehouse drop zone (or set worker priority to Wholesale)!</p>
      `)).join('')}
      ${S.offers.map(q=>card(`OFFER • ${q.buyer}`,`
        <div class="row"><span>Product</span><b>${recipes[q.key].icon} ${recipes[q.key].name} ×${q.qty}</b></div>
        <div class="row"><span>Time / Reward</span><b>${q.days} days • $${q.reward}</b></div>
        <button data-contract="${q.id}">ACCEPT CONTRACT</button>
      `)).join('')}
      ${card('Contract Office',`
        <div class="row"><span>Warehouse Crates</span><b>${contractUnits()}/${S.contractCap}</b></div>
        <div class="row"><span>Active Contracts</span><b>${S.contracts.length}/${S.contractSlots}</b></div>
        <button id="office">📦 UPGRADE CONTRACT OFFICE ($500)</button>
      `)}
    </div>`;
  }
  if(p==='skills'){
    const desc={
      quality:'Boosts crafted item rarity & ATK/DEF stats.',
      merchant:'Increases customer patience & tip generosity.',
      adventure:'Increases player monster damage & gathering yield.',
      management:'Increases player carrying stack capacity (+1 per level).'
    };
    h=`<h2>FOREVER SKILLS (Survives New Game)</h2>
    <p>Available Legacy Points: <b style="color:#ffd264">${S.legacy}</b></p>
    <div class="grid">
      ${Object.entries(S.skills).map(([k,v])=>card(`${k.toUpperCase()} • Lv.${v}`,`
        <p style="font-size:12px;color:#cbb89d">${desc[k]}</p>
        <button data-skill="${k}">UPGRADE (${v+1} LEGACY)</button>
      `)).join('')}
    </div>`;
  }
  if(p==='art'){
    h=`<h2>ART & SPRITE PREVIEW</h2>
    <iframe src="assets/art_preview.html?v=0.12.00" style="width:100%;height:68vh;border:0;border-radius:12px"></iframe>`;
  }
  if(p==='save'){
    h=`<h2>SAVE & EXIT</h2>
    <button class="action" id="saveExit">💾 SAVE NOW & EXIT TO SLOTS</button>
    <button class="action" id="noSave">🚪 EXIT WITHOUT SAVING THIS DAY</button>
    <p style="font-size:12px;color:#cbb89d">Auto-save occurs at the end of every day. Forever Skills and Legacy Points are saved permanently across all slots.</p>`;
  }
  $('panelContent').innerHTML=h;
  bindPanel();
}

function bindPanel(){
  document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
    let p=b.dataset.preset;
    if(p==='Safe'){S.products.sword.on=true;S.products.potion.on=true;if(S.products.shield.unlocked)S.products.shield.on=false}
    else if(p==='Profit'||p==='Custom')Object.values(S.products).forEach(x=>x.on=x.unlocked);
    else if(p==='Quality'){S.products.sword.on=true;S.products.potion.on=false;if(S.products.shield.unlocked)S.products.shield.on=true}
    toast(p+' preset applied');openPage('products');
  });
  document.querySelectorAll('[data-poor]').forEach(b=>b.onclick=()=>{
    S.poorPolicy=b.dataset.poor;
    toast('Poor item policy: '+S.poorPolicy);
    openPage('products');
  });
  document.querySelectorAll('[data-priority]').forEach(b=>b.onclick=()=>{
    S.productionPriority=b.dataset.priority;
    toast('Priority set to '+S.productionPriority);
    openPage('wholesale');
  });
  if($('applyRecommended'))$('applyRecommended').onclick=()=>{
    S.employees.forEach((e,idx)=>{
      let exp=e.atk*.6+e.def*.4;
      if(idx===0&&!S.employees.some(w=>w.job==='Sales'))e.job='Sales';
      else e.job=e.sell>=e.craft&&e.sell>=exp?'Sales':e.craft>=exp?'Craft':'Expedition';
    });
    toast('Recommended jobs applied!');openPage('employees');
  };
  document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{
    S.products[b.dataset.toggle].on=!S.products[b.dataset.toggle].on;
    openPage('products');
  });
  document.querySelectorAll('[data-unlock]').forEach(b=>b.onclick=()=>{
    if(S.cash>=180){
      S.cash-=180;
      S.products[b.dataset.unlock].unlocked=true;
      S.products[b.dataset.unlock].on=true;
      toast('Unlocked Wooden Shield! Craft it at the Forge.');
      openPage('products');
    }else toast('Need $180 to unlock');
  });
  document.querySelectorAll('[data-emp]').forEach(b=>b.onclick=()=>{
    let emp=S.employees.find(e=>e.id==b.dataset.emp);
    if(emp){emp.job=b.dataset.job;openPage('employees')}
  });
  document.querySelectorAll('[data-contract]').forEach(b=>b.onclick=()=>{
    if(S.contracts.length>=S.contractSlots)return toast('No free contract slot');
    let q=S.offers.find(x=>x.id==b.dataset.contract);
    if(q){
      S.contracts.push({...q,done:0});
      S.offers=S.offers.filter(x=>x.id!=q.id);
      toast('Accepted wholesale contract for '+q.buyer);
      openPage('wholesale');
    }
  });
  document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{
    let k=b.dataset.skill,cost=S.skills[k]+1;
    if(S.legacy>=cost){
      S.legacy-=cost;S.skills[k]++;
      player.carryCap=3+S.skills.management;
      saveForever();
      toast(k.toUpperCase()+' upgraded to Lv.'+S.skills[k]);
      openPage('skills');
    }else toast('Not enough Legacy Points');
  });
  if($('hire'))$('hire').onclick=()=>{hireEmployeeAtPad();openPage('employees')};
  if($('house'))$('house').onclick=()=>{
    if(S.cash>=300){S.cash-=300;S.staffCap+=2;toast('Staff capacity increased to '+S.staffCap);openPage('employees')}
    else toast('Need $300');
  };
  if($('office'))$('office').onclick=()=>{
    if(S.cash>=500){S.cash-=500;S.contractSlots++;S.contractCap+=20;toast('Contract Office upgraded!');openPage('wholesale')}
    else toast('Need $500');
  };
  if($('saveExit'))$('saveExit').onclick=()=>{save('Manual Save & Exit');exitSlots()};
  if($('noSave'))$('noSave').onclick=exitSlots;
}

function recommendation(){
  if(S.coinsFloor>0)return {t:'Collect $'+S.coinsFloor+' at Checkout',x:PTS.coinPile.x,y:PTS.coinPile.y};
  if(player.carryCount>0){
    if(matchingContract(player.carryKey,player.carryItems[0]?.q)&&S.productionPriority==='Wholesale'){
      return {t:'Deliver to Contract Warehouse',x:PTS.contractDrop.x,y:PTS.contractDrop.y};
    }
    let p=shelfPoint(player.carryKey);
    return {t:'Stock carried items on shelf',x:p.x,y:p.y};
  }
  if(S.output.sword>0)return {t:'Pick up Swords at Forge Output',x:PTS.swordOut.x,y:PTS.swordOut.y};
  if(S.output.shield>0)return {t:'Pick up Shields at Forge Output',x:PTS.shieldOut.x,y:PTS.shieldOut.y};
  if(S.output.potion>0)return {t:'Pick up Potions at Alchemy Output',x:PTS.potionOut.x,y:PTS.potionOut.y};
  if(S.iron<2||S.wood<1||S.herb<2)return {t:'Gather materials in West Yard',x:280,y:640};
  if(S.products.sword.stock<2)return {t:'Craft Swords in the Forge',x:815,y:540};
  if(S.products.potion.stock<2)return {t:'Brew Potions in Alchemy Lab',x:1875,y:540};
  if(S.employees.length===0&&S.cash>=120)return {t:'Hire 1st Helper in Staff Room ($120)',x:PTS.hire.x,y:PTS.hire.y};
  return {t:'Fight Slimes in East Forest',x:2620,y:920};
}

function showTutorial(){
  let st=S.tutorialStep||0;
  if(st>=5){$('tutorial').classList.remove('show');return}
  const steps=[
    ['1/5 • Drag to Move','Hold & slide your finger anywhere like a joystick to walk. Tap 💡 Next Task anytime to auto-walk!'],
    ['2/5 • Craft at the Forge','Walk into the Forge and tap 🔨 Craft Sword on the bottom action bar.'],
    ['3/5 • Pick Up & Stock Shelf','Walk over the Sword at FORGE OUTPUT, then carry it to the red ATTACK shelf.'],
    ['4/5 • Customer & Checkout Coins','Watch a customer take the product from the shelf and leave coins at Checkout. Walk over the coins!'],
    ['5/5 • Material Yard & Forest','Gather free Iron, Wood & Herbs in the West Material Yard, or fight Slimes in the East Forest!']
  ];
  $('tutorialTitle').textContent=steps[st][0];
  $('tutorialText').textContent=steps[st][1];$('tutorial').classList.add('show');
}
function advanceTutorial(){
  S.tutorialStep=Math.min(5,(S.tutorialStep||0)+1);
  showTutorial();
}

let craftUseSlime=false;
function startCraftGame(k,useSlime=false){
  if($('craftGame').classList.contains('show'))return;
  if((S.output[k]||0)>=S.outputCap)return toast(recipes[k].name+' output is full!');
  if(!canCraft(k))return toast('Missing raw materials • Visit the West Material Yard!');
  craftKey=k;craftUseSlime=useSlime;craftAnim=0;
  $('craftTitle').textContent='CRAFTING • '+(useSlime?'SLIME EDGE':recipes[k].name.toUpperCase());
  $('craftGame').classList.add('show');
  playing=false;
  let start=performance.now();
  function anim(t){
    if(!$('craftGame').classList.contains('show'))return;
    craftAnim=(Math.sin((t-start)/460)+1)/2;
    $('craftMarker').style.left=(craftAnim*96)+'%';
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}
function finishCraft(){
  let perfect=craftAnim>.42&&craftAnim<.58;
  S.nextCraftBonus=perfect?.22:.04;
  $('craftGame').classList.remove('show');
  playing=true;
  if(craft(craftKey,null,craftUseSlime)){
    goalProgress('craft',1);
    if(perfect)toast('PERFECT HAMMER! Quality boosted!');
    if(S.tutorialStep===1)advanceTutorial();
  }
}

function exitSlots(){
  playing=false;
  $('app').classList.add('hidden');
  $('panel').classList.remove('show');$('slotScreen').classList.add('show');
  renderSlots();
}

$('zoomIn').onclick=()=>setZoom(zoom+.1);$('zoomOut').onclick=()=>setZoom(zoom-.1);
$('overview').onclick=()=>setZoom(.5);$('suggest').onclick=()=>{
  let r=recommendation();
  toast(r.t);
  if(r.page)openPage(r.page);
  else target={x:r.x,y:r.y};
};
$('tutorialSkip').onclick=()=>{S.tutorialStep=5;$('tutorial').classList.remove('show')};
$('summaryNext').onclick=()=>{$('daySummary').classList.remove('show');
  createDayContent();playing=true;
  save('Day '+S.day+' started');
};
$('craftTap').onclick=finishCraft;
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>openPage(b.dataset.page));
$('closePanel').onclick=()=>$('panel').classList.remove('show');

function loop(t){
  let dt=Math.min(.035,(t-last)/1000);
  last=t;
  if(playing){
    update(dt);
    draw();
    $('cash').textContent='$'+S.cash;
    $('rep').textContent='REP '+S.rep;
    $('day').textContent='DAY '+S.day;
    $('clock').textContent=Math.max(0,Math.ceil(120-dayTime))+'s';$('carryHud').textContent=`🤲 ${player.carryKey?recipes[player.carryKey].icon+' '+player.carryCount+'/'+player.carryCap:'Empty (0/'+player.carryCap+')'} | 🪙 $${S.coinsFloor} | 🪨${S.iron} 🪵${S.wood} 🌿${S.herb}`;
    let rec=recommendation();
    $('suggest').textContent='💡 '+rec.t;
  }
  requestAnimationFrame(loop);
}
renderSlots();
requestAnimationFrame(loop);
