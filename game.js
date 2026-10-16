// Weapon Shop Empire v0.15.00
// Forest Outpost 1870x2870 full artwork integration, aligned collision & corridor pathfinding, visible stock/output overlays, Special Visitor & Training Room.
'use strict';
const VERSION='v0.15.00';
const c=document.getElementById('game'),g=c.getContext('2d'),$=id=>document.getElementById(id);
let vw=1280,vh=720;
const WORLD={w:1870,h:2870};
const PREFIX='wse_v01500_slot_',OLD_PREFIXES=['wse_v01400_slot_','wse_v01200_slot_','wse_v01100_slot_'],FOREVER_KEY='wse_forever_v01500';
let slot=0,playing=false,last=performance.now(),target=null,msgTimer=0,dayTime=0,spawnTimer=2.5,zoom=.65,pinchStart=0,craftAnim=0,craftKey='sword',dragMove={active:false,id:null,sx:0,sy:0,dx:0,dy:0},animClock=0;

// Load Forest Outpost Map Artwork with automatic fallback between forest_outpost_map.jpg, first_shop_art.jpg, and first_shop_art.png
const mapArt=new Image();
let mapTry=0;
const mapSources=['assets/forest_outpost_map.jpg?v=0.15.00','assets/first_shop_art.jpg?v=0.15.00','assets/first_shop_art.png?v=0.15.00','shop_world.png'];
mapArt.onerror=()=>{mapTry++;if(mapTry<mapSources.length)mapArt.src=mapSources[mapTry]};
mapArt.src=mapSources[0];

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
  employees:[],review:4.2,badReviews:0,served:0,zoom:.65,tutorialStep:0,
  goals:[],event:null,visitorClaimed:false,
  statsDay:{sales:0,tips:0,crafted:0,monsters:0,lost:0},
  discoveries:[],productionPriority:'Balanced',
  coinsFloor:0,totalCoinsPicked:0
};

let S=clone(base),
    player={x:745,y:2080,speed:320,carryKey:null,carryCount:0,carryItems:[],carryCap:3},
    clients=[],effects=[],monsters=[],cam={x:0,y:0};
const keys={};

// Material Yard nodes aligned with top-left Material Yard in forest_outpost_map.jpg
const yardNodes=[
  {id:'wood1',type:'wood',name:'Timber Logs',icon:'🪵',x:135,y:510,ready:true,timer:0,max:9},
  {id:'iron1',type:'iron',name:'Iron Ore Pile',icon:'🪨',x:235,y:510,ready:true,timer:0,max:9},
  {id:'herb1',type:'herb',name:'Herb Planters',icon:'🌿',x:455,y:455,ready:true,timer:0,max:9},
  {id:'herb2',type:'herb',name:'Crimson Herbs',icon:'🌿',x:440,y:585,ready:true,timer:0,max:10},
  {id:'iron2',type:'iron',name:'Crystal Vein',icon:'💎',x:525,y:585,ready:true,timer:0,max:11}
];

// Aligned room zones on the 1870x2870 Forest Outpost artwork
const R={
  material:{x:60,y:310,w:555,h:365},
  staff:{x:660,y:310,w:565,h:370},
  training:{x:1265,y:325,w:270,h:345},
  forge:{x:55,y:730,w:580,h:435},
  alchemy:{x:660,y:730,w:595,h:435},
  contract:{x:1285,y:660,w:535,h:505},
  attack:{x:80,y:1190,w:460,h:430},
  defense:{x:550,y:1190,w:390,h:430},
  other:{x:950,y:1190,w:315,h:430},
  rare:{x:70,y:1645,w:315,h:415},
  counter:{x:420,y:1650,w:720,h:390},
  management:{x:1280,y:1350,w:425,h:650},
  visitor:{x:120,y:2160,w:420,h:380},
  gate:{x:770,y:105,w:350,h:195},
  forest:{x:120,y:70,w:1620,h:225}
};

// Solid walls & furniture aligned with visible doors and aisles on forest_outpost_map.jpg
const SOLIDS=[
  // World borders
  {x:0,y:0,w:1870,h:24},{x:0,y:2846,w:1870,h:24},{x:0,y:0,w:24,h:2870},{x:1846,y:0,w:24,h:2870},
  // Material Yard walls (South door at x:280..395, y:666)
  {x:45,y:305,w:580,h:22},{x:45,y:305,w:22,h:380},{x:603,y:305,w:22,h:380},{x:45,y:665,w:235,h:22},{x:395,y:665,w:230,h:22},
  // Staff House walls (South door at x:860..975, y:675)
  {x:655,y:305,w:580,h:22},{x:655,y:305,w:22,h:390},{x:1213,y:305,w:22,h:390},{x:655,y:675,w:205,h:22},{x:975,y:675,w:260,h:22},
  // Training Room walls (Open south entrance x:1330..1475)
  {x:1255,y:315,w:290,h:22},{x:1255,y:315,w:22,h:355},{x:1523,y:315,w:22,h:355},
  // Forge walls (South door at x:290..415, y:1155)
  {x:45,y:720,w:595,h:22},{x:45,y:720,w:22,h:455},{x:618,y:720,w:22,h:455},{x:45,y:1155,w:245,h:22},{x:415,y:1155,w:225,h:22},
  // Alchemy walls (South door at x:900..1020, y:1155)
  {x:660,y:720,w:600,h:22},{x:660,y:720,w:22,h:455},{x:1238,y:720,w:22,h:455},{x:660,y:1155,w:240,h:22},{x:1020,y:1155,w:240,h:22},
  // Contract Warehouse walls (West gate at x:1280, y:845..965)
  {x:1280,y:650,w:550,h:22},{x:1280,y:650,w:22,h:195},{x:1280,y:965,w:22,h:215},{x:1808,y:650,w:22,h:530},{x:1280,y:1158,w:550,h:22},
  // Checkout physical counter bar (walkable around left/right ends)
  {x:495,y:1905,w:465,h:52},
  // Rare Storage walls (North door at x:185..295, y:1640)
  {x:60,y:1640,w:125,h:22},{x:295,y:1640,w:95,h:22},{x:60,y:1640,w:22,h:420},{x:368,y:1640,w:22,h:420},{x:60,y:2038,w:330,h:22},
  // South Shop Main Wall (Main Entrance gap at x:640..855, y:2038)
  {x:390,y:2038,w:250,h:24},{x:855,y:2038,w:425,h:24},
  // Management Office & Upgrades walls (West doors at y:1575..1690 and y:1845..1955)
  {x:1280,y:1340,w:440,h:22},{x:1280,y:1340,w:22,h:235},{x:1280,y:1690,w:22,h:155},{x:1280,y:1955,w:22,h:95},{x:1698,y:1340,w:22,h:710},{x:1280,y:2038,w:440,h:22},
  // River water blocks (leaving the central stone bridge x:650..845 open!)
  {x:350,y:2360,w:295,h:190},{x:850,y:2340,w:620,h:210}
];

const PTS={
  swordOut:{x:335,y:1165},
  shieldOut:{x:415,y:1165},
  potionOut:{x:960,y:1165},
  attackShelf:{x:285,y:1365},
  defenseShelf:{x:695,y:1365},
  otherShelf:{x:1085,y:1365},
  coinPile:{x:825,y:1880},
  checkoutWait:{x:745,y:1815},
  hire:{x:915,y:595},
  contractDrop:{x:1365,y:910},
  rare:{x:230,y:1835},
  training:{x:1395,y:525},
  office:{x:1460,y:1640},
  visitor:{x:315,y:2350},
  gate:{x:945,y:215}
};

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

function clone(x){return JSON.parse(JSON.stringify(x))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function collides(x,y,r=17){return SOLIDS.some(a=>x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)}
function moveEntity(o,nx,ny,r=17){
  if(!collides(nx,o.y,r))o.x=nx;
  if(!collides(o.x,ny,r))o.y=ny;
}

function loadForever(){
  try{return JSON.parse(localStorage.getItem(FOREVER_KEY)||'null')}catch{return null}
}
function saveForever(){
  try{localStorage.setItem(FOREVER_KEY,JSON.stringify({legacy:S.legacy,skills:S.skills}))}catch{}
}
function key(n){return PREFIX+n}
function load(n){
  try{
    let raw=localStorage.getItem(key(n));
    if(!raw){
      for(const oldP of OLD_PREFIXES){
        raw=localStorage.getItem(oldP+n);
        if(raw)break;
      }
    }
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
  // Migrate any old out-of-bounds employee positions to the Staff House
  n.employees.forEach((e,i)=>{
    if(!e.x||e.x>1800||e.y>2000){e.x=860+(i%3)*55;e.y=540}
  });
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
  try{localStorage.setItem(key(slot),JSON.stringify(S))}catch{}
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
  zoom=Math.max(.42,Math.min(1.15,v));
  S.zoom=zoom;
}
function inside(p,z,pad=0){
  return p.x>z.x-pad&&p.x<z.x+z.w+pad&&p.y>z.y-pad&&p.y<z.y+z.h+pad;
}
function stepToward(o,tx,ty,s,dt){
  let dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);
  if(d<5)return true;
  o.moving=true;
  let nx=o.x+dx/d*s*dt,ny=o.y+dy/d*s*dt;
  moveEntity(o,nx,ny,16);
  return Math.hypot(tx-o.x,ty-o.y)<7;
}

// Room checks for the 1870x2870 Forest Outpost map
function inMaterialRoom(p){return p.x>45&&p.x<625&&p.y>305&&p.y<675}
function inStaffRoom(p){return p.x>655&&p.x<1235&&p.y>305&&p.y<685}
function inTrainingRoom(p){return p.x>1255&&p.x<1545&&p.y>315&&p.y<675}
function inForgeRoom(p){return p.x>45&&p.x<640&&p.y>720&&p.y<1165}
function inAlchemyRoom(p){return p.x>660&&p.x<1260&&p.y>720&&p.y<1165}
function inContractRoom(p){return p.x>1280&&p.x<1830&&p.y>650&&p.y<1175}
function inRareRoom(p){return p.x>60&&p.x<390&&p.y>1640&&p.y<2050}
function inOfficeRoom(p){return p.x>1280&&p.x<1720&&p.y>1340&&p.y<2050}

// Corridor-aware waypoint router built specifically for the 1870x2870 Forest Outpost map
function navigate(o,tx,ty,s,dt){
  const goal={x:tx,y:ty};

  // 1. Exit enclosed rooms through their doorway first
  if(inMaterialRoom(o)&&!inMaterialRoom(goal))return stepToward(o,340,702,s,dt),false;
  if(inStaffRoom(o)&&!inStaffRoom(goal))return stepToward(o,915,702,s,dt),false;
  if(inTrainingRoom(o)&&!inTrainingRoom(goal))return stepToward(o,1400,702,s,dt),false;
  if(inForgeRoom(o)&&!inForgeRoom(goal))return stepToward(o,355,1195,s,dt),false;
  if(inAlchemyRoom(o)&&!inAlchemyRoom(goal))return stepToward(o,960,1195,s,dt),false;
  if(inContractRoom(o)&&!inContractRoom(goal))return stepToward(o,1262,910,s,dt),false;
  if(inRareRoom(o)&&!inRareRoom(goal))return stepToward(o,235,1615,s,dt),false;
  if(inOfficeRoom(o)&&!inOfficeRoom(goal))return stepToward(o,1255,1635,s,dt),false;

  // 2. Moving between South Town (y > 2055) and Main Shop (y <= 2055) via Main Entrance (x:745, y:2040)
  if(o.y>2055&&goal.y<=2055){
    if(Math.abs(o.x-745)>45)return stepToward(o,745,2110,s,dt),false;
    return stepToward(o,745,1995,s,dt),false;
  }
  if(o.y<=2055&&goal.y>2055){
    if(o.y<1960&&Math.abs(o.x-745)>60)return stepToward(o,745,1980,s,dt),false;
    if(Math.abs(o.x-745)>45)return stepToward(o,745,2000,s,dt),false;
    return stepToward(o,745,2120,s,dt),false;
  }

  // 3. Moving between North Forest (y < 305) and Upper Corridor (y >= 305) via Forest Gate (x:945 or x:648)
  if(o.y>=305&&goal.y<305){
    if(o.y>715){
      const colX=Math.abs(o.x-648)<Math.abs(o.x-1265)?648:1265;
      if(Math.abs(o.x-colX)>24)return stepToward(o,colX,1200,s,dt),false;
      return stepToward(o,colX,700,s,dt),false;
    }
    if(Math.abs(o.x-648)>30&&o.y>295)return stepToward(o,648,700,s,dt),false;
    return stepToward(o,648,270,s,dt),false;
  }
  if(o.y<305&&goal.y>=305){
    if(Math.abs(o.x-648)>35)return stepToward(o,648,265,s,dt),false;
    return stepToward(o,648,700,s,dt),false;
  }

  // 4. Moving between Upper Corridor (y <= 715) and Retail Floor (y >= 1175) via vertical avenues (x:648 or x:1265)
  if(o.y<=715&&goal.y>=1175){
    const aveX=goal.x>1050?1265:648;
    if(Math.abs(o.x-aveX)>24)return stepToward(o,aveX,702,s,dt),false;
    return stepToward(o,aveX,1205,s,dt),false;
  }
  if(o.y>=1175&&goal.y<=715){
    const aveX=goal.x>1050?1265:648;
    if(Math.abs(o.x-aveX)>28)return stepToward(o,aveX,1205,s,dt),false;
    return stepToward(o,aveX,702,s,dt),false;
  }

  // 5. Entering Contract Warehouse (x:1280, y:910)
  if(!inContractRoom(o)&&inContractRoom(goal)){
    if(Math.abs(o.y-910)>35){
      if(Math.abs(o.x-1265)>25)return stepToward(o,1265,o.y<910?702:1205,s,dt),false;
      return stepToward(o,1265,910,s,dt),false;
    }
    return stepToward(o,1345,910,s,dt),false;
  }

  // 6. Entering Upper Rooms from Upper Corridor (y ~ 702)
  if(!inMaterialRoom(o)&&inMaterialRoom(goal)){
    if(Math.abs(o.x-340)>28)return stepToward(o,340,702,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
  }
  if(!inStaffRoom(o)&&inStaffRoom(goal)){
    if(Math.abs(o.x-915)>28)return stepToward(o,915,702,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
  }
  if(!inTrainingRoom(o)&&inTrainingRoom(goal)){
    if(Math.abs(o.x-1400)>28)return stepToward(o,1400,702,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
  }

  // 7. Entering Workshops from Retail Floor (y ~ 1195)
  if(!inForgeRoom(o)&&inForgeRoom(goal)){
    if(o.y<1170)return stepToward(o,648,1205,s,dt),false;
    if(Math.abs(o.x-355)>32)return stepToward(o,355,1205,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
  }
  if(!inAlchemyRoom(o)&&inAlchemyRoom(goal)){
    if(o.y<1170)return stepToward(o,648,1205,s,dt),false;
    if(Math.abs(o.x-960)>32)return stepToward(o,960,1205,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
  }

  // 8. Entering Rare Storage or Management Office
  if(!inRareRoom(o)&&inRareRoom(goal)){
    if(Math.abs(o.x-235)>28||o.y<1590)return stepToward(o,235,1615,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
  }
  if(!inOfficeRoom(o)&&inOfficeRoom(goal)){
    if(Math.abs(o.y-1635)>35)return stepToward(o,1250,1635,s,dt),false;
    return stepToward(o,tx,ty,s,dt);
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
  if(item.q===0&&S.poorPolicy==='Scrap'){
    if(k==='potion')S.herb++;else S.iron++;
    if(!worker)toast('Poor '+item.name+' auto-scrapped (+1 material)');
    return true;
  }
  S.outputItems[k].push(item);
  S.output[k]=S.outputItems[k].length;
  if(item.q>=3||item.special){
    S.rareDisplay.unshift({name:item.name,icon:item.icon,rarity:item.rarity,color:item.color,stat:item.stat});
    if(S.rareDisplay.length>6)S.rareDisplay.pop();
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
  // Customers enter from the South Stone Bridge (x:745, y:2480)
  clients.push({
    id:Date.now()+Math.random(),
    x:725+Math.random()*40,
    y:2480+Math.random()*60,
    want:k,
    shelfX:sp.x+(slotIdx%3-1)*42,
    shelfY:sp.y+25+Math.floor(slotIdx/3)*30,
    pat:62+S.skills.merchant*4,
    max:62+S.skills.merchant*4,
    state:'toShelf',
    level,personality,
    minStat:level==='Knight'?14:level==='Veteran'?11:0,
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
      if(navigate(x,x.shelfX,x.shelfY,118,dt))x.state='waitShelf';
    }else if(x.state==='waitShelf'){
      x.pat-=dt*(x.personality==='Impatient'?1.25:1);
      let arr=S.shelfItems[x.want];
      let matchIndex=arr?arr.findIndex(item=>item.stat>=(x.minStat||0)&&item.q>=(x.minQ||0)):-1;
      // Fallback: if any item is on the shelf for normal Adventurers, take it
      if(matchIndex<0&&arr&&arr.length>0&&x.level==='Adventurer')matchIndex=0;
      if(arr&&matchIndex>=0){
        let item=arr.splice(matchIndex,1)[0];
        S.products[x.want].stock=arr.length;
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
        toast('Customer left • '+recipes[x.want].name+' shelf needed stock');
        x.state='leave';
      }
    }else if(x.state==='toCheckout'){
      if(navigate(x,PTS.checkoutWait.x,PTS.checkoutWait.y,122,dt)){
        let item=x.carriedItem;
        let baseVal=item.value;
        if(item.q===0&&S.poorPolicy==='Honest')baseVal=Math.round(recipes[x.want].value*.5);
        if(item.q===0&&S.poorPolicy==='Disguise')baseVal=recipes[x.want].value;
        let mult=x.personality==='Bargain'?.88:x.personality==='Collector'&&item.q>=2?1.45:1;
        let price=Math.max(10,Math.round(baseVal*mult));
        let tip=x.pat/x.max>.6?Math.round(6*x.tipMult)+(S.rareDisplay.length*2):0;
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
      if(navigate(x,745,2520,140,dt))clients.splice(i,1);
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
          if(navigate(e,PTS.contractDrop.x,PTS.contractDrop.y,118,dt)){
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
          if(navigate(e,sp.x,sp.y,118,dt)){
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
          if(navigate(e,op.x,op.y+25,118,dt)&&S.outputItems[task.key].length>0){
            e.carryItem=S.outputItems[task.key].shift();
            S.output[task.key]=S.outputItems[task.key].length;
            e.carryKey=task.key;e.carryCount=1;e.carryDest=task.dest;
          }
        }else if(S.coinsFloor>0){
          if(navigate(e,PTS.coinPile.x,PTS.coinPile.y-35,118,dt)){
            let amt=S.coinsFloor;
            S.cash+=amt;S.coinsFloor=0;
            addFloat(PTS.coinPile.x,PTS.coinPile.y-20,`+$${amt}`,'#7dff9b');
            toast(e.name+' collected $'+amt+' from checkout');
          }
        }else{
          navigate(e,745,1680,95,dt);
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
      let z=k==='potion'?{x:960,y:980}:{x:355,y:980};
      if(navigate(e,z.x,z.y,110,dt)){
        if(canCraft(k)){
          e.work=(e.work||0)+dt*(1+e.craft/90);
          if(e.work>=6.2){e.work=0;craft(k,e,false)}
        }
      }
    }else if(e.job==='Expedition'){
      e.statusIcon='⚔️';
      if(navigate(e,945,180,115,dt)){
        e.work=(e.work||0)+dt;
        if(e.work>=10.5){
          e.work=0;
          let bonus=1+Math.floor((e.atk*.6+e.def*.4)/32);
          S.iron+=bonus;S.wood+=1;S.herb+=1;
          if(Math.random()<.45)S.gel++;
          e.hp=Math.max(25,e.hp-Math.max(3,14-e.def*.12));
          addFloat(e.x,e.y-25,`+${bonus}🪨 +1🪵 +1🌿`,'#9ef8ff');
          if(e.hp<40){e.job='Staff House';toast(e.name+' is resting in Staff House')}
          else toast(e.name+' returned from Slime Woods with materials');
        }
      }
    }else{
      e.statusIcon='💤';
      let idx=S.employees.indexOf(e);
      let tx=780+(idx%3)*110,ty=525;
      navigate(e,tx,ty,90,dt);
      if(e.hp<100)e.hp=Math.min(100,e.hp+dt*4);
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
    if(contractUnits()<S.contractCap&&c.done<q.qty&&player.carryItems[i].q>=(c.minQ||0)){
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
  if(inside(player,R.forge,35)){
    btns.push(`<button onclick="window.triggerCraft('sword',false)">🔨 Sword (${S.iron}/2🪨 ${S.wood}/1🪵)</button>`);
    if(S.products.shield.unlocked){
      btns.push(`<button onclick="window.triggerCraft('shield',false)">🛡️ Shield (${S.iron}/1🪨 ${S.wood}/3🪵)</button>`);
    }
    if(S.gel>0||S.discoveries.includes('Slime Edge')){
      btns.push(`<button onclick="window.triggerCraft('sword',true)">🗡️ Slime Edge (${S.gel}/1💧)</button>`);
    }
  }
  if(inside(player,R.alchemy,35)){
    btns.push(`<button onclick="window.triggerCraft('potion',false)">⚗️ Brew Potion (${S.herb}/2🌿)</button>`);
  }
  let nearNode=yardNodes.find(n=>n.ready&&dist(player,n)<75);
  if(nearNode){
    btns.push(`<button onclick="window.triggerGather('${nearNode.id}')">${nearNode.icon} Gather ${nearNode.name}</button>`);
  }
  let nearMob=monsters.find(m=>dist(player,m)<165);
  if(nearMob||player.y<320){
    btns.push(`<button onclick="window.triggerAttack()">⚔️ Attack Forest Monster</button>`);
  }
  if(player.carryKey&&dist(player,PTS.contractDrop)<120){
    btns.push(`<button onclick="window.triggerContractDrop()">📦 Load Wholesale Crate</button>`);
  }
  if(dist(player,PTS.hire)<85&&S.employees.length<S.staffCap){
    btns.push(`<button onclick="window.triggerHire()">🤝 Hire Helper ($120)</button>`);
  }
  if(inside(player,R.training,20)){
    btns.push(`<button onclick="window.triggerTrain()">🎯 Train Staff (+Stats $80)</button>`);
  }
  if(inside(player,R.management,20)){
    btns.push(`<button onclick="window.openPage('wholesale')">📋 Management & Contracts</button>`);
  }
  if(inside(player,R.visitor,30)&&!S.visitorClaimed){
    btns.push(`<button onclick="window.triggerVisitor()">🎁 Special Visitor Gift</button>`);
  }
  const html=btns.join('');
  if(bar.innerHTML!==html)bar.innerHTML=html;
}

window.triggerCraft=(k,slime)=>startCraftGame(k,slime);
window.triggerGather=id=>{const n=yardNodes.find(x=>x.id===id);if(n)gatherYardNode(n)};
window.triggerAttack=()=>attack();
window.triggerContractDrop=()=>deliverToContract();
window.triggerHire=()=>hireEmployeeAtPad();
window.openPage=p=>openPage(p);
window.triggerTrain=()=>{
  if(!S.employees.length)return toast('Hire a helper in the Staff House first!');
  if(S.cash<80)return toast('Need $80 to run a training session');
  S.cash-=80;
  S.employees.forEach(e=>{e.sell+=3;e.craft+=3;e.atk+=3;e.def+=3});
  addFloat(PTS.training.x,PTS.training.y-20,'ALL STAFF +3 STATS!','#7dff9b');
  toast('Training complete! All staff gained +3 SELL/CRAFT/ATK/DEF');
};
window.triggerVisitor=()=>{
  if(S.visitorClaimed)return;
  S.visitorClaimed=true;
  S.cash+=60;S.iron+=3;S.wood+=2;S.herb+=2;
  addFloat(PTS.visitor.x,PTS.visitor.y-25,'+$60 +3🪨 +2🪵 +2🌿','#ffd86b');
  toast('Special Visitor gifted $60 and bonus crafting materials!');
  updateContextActions();
};

function hireEmployeeAtPad(){
  if(S.employees.length>=S.staffCap)return toast('Staff House is full • Upgrade in STAFF menu');
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
    x:915,y:560
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
    moveEntity(player,nx,ny,17);
    if(S.tutorialStep===0)advanceTutorial();
  }else if(target){
    if(stepToward(player,target.x,target.y,player.speed,dt))target=null;
    if(S.tutorialStep===0)advanceTutorial();
  }
  player.x=Math.max(45,Math.min(WORLD.w-45,player.x));
  player.y=Math.max(55,Math.min(WORLD.h-55,player.y));

  // Auto-gather ready Material Yard nodes when walking over them
  for(const n of yardNodes){
    if(!n.ready){
      n.timer-=dt;
      if(n.timer<=0){n.ready=true;n.timer=0}
    }else if(dist(player,n)<48){
      gatherYardNode(n);
    }
  }

  // Pick up outputs (Sword, Shield, Potion)
  if(dist(player,PTS.swordOut)<58)tryPickUpOutput('sword');
  if(dist(player,PTS.shieldOut)<58)tryPickUpOutput('shield');
  if(dist(player,PTS.potionOut)<58)tryPickUpOutput('potion');

  // Stock retail shelf or Contract Warehouse
  if(player.carryKey){
    let sp=shelfPoint(player.carryKey);
    if(dist(player,sp)<75){
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
    if(dist(player,PTS.contractDrop)<75){
      deliverToContract();
    }
  }

  // Collect checkout coins
  if(S.coinsFloor>0&&dist(player,PTS.coinPile)<78){
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
  let best=null,bestD=175;
  for(const m of monsters){
    let d=dist(player,m);
    if(d<bestD){best=m;bestD=d}
  }
  if(!best){
    toast('Walk north to the Forest Adventure gate to fight monsters!');
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
  S.offers=[
    {id:Date.now()+1,buyer:'Town Guard',key:'sword',qty:4,days:2,minQ:1,reward:260,rep:2,penalty:2},
    {id:Date.now()+2,buyer:'Explorer Guild',key:'potion',qty:5,days:2,minQ:1,reward:220,rep:2,penalty:2}
  ];
  if(S.products.shield.unlocked)S.offers.push({id:Date.now()+3,buyer:'Royal Garrison',key:'shield',qty:4,days:2,minQ:1,reward:250,rep:3,penalty:2});
}
function contractsEnd(){processContractDeadlines();generateContractOffers()}
function contractUnits(){return S.contracts.reduce((a,x)=>a+x.done,0)}

function createDayContent(){
  const pool=[
    {type:'sale',target:4,label:'Sell 4 products'},
    {type:'craft',target:3,label:'Craft 3 products'},
    {type:'monster',target:2,label:'Defeat 2 forest monsters'},
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
  S.visitorClaimed=false;
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
  if(spawnTimer<=0){spawnClient();spawnTimer=5+Math.random()*4}
  playerTick(dt);
  employeeTick(dt);
  clientTick(dt);
  // Spawn monsters in the Northern Forest Adventure zone (x:420..1420, y:120..255)
  if(monsters.length<5&&Math.random()<dt*.45){
    monsters.push({
      x:440+Math.random()*960,
      y:125+Math.random()*135,
      hp:18,maxHp:18,
      kind:Math.random()<.35?'wolf':'slime'
    });
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
function labelBadge(t,x,y,col='#fff1c2',bg='#1d1616dd',w=148){
  pxRect(x-w/2,y-12,w,20,bg);
  g.strokeStyle='#9b713f';g.lineWidth=1.5;
  g.strokeRect(Math.round(x-w/2),Math.round(y-12),w,20);
  text(t,x,y+2,10.5,col);
}

function drawShelfOverlay(x,y,items,max,title,col){
  pxRect(x-68,y-26,136,50,'#1b1618dd');
  g.strokeStyle=col;g.lineWidth=2;
  g.strokeRect(x-68,y-26,136,50);
  text(`${title} ${items.length}/${max}`,x,y-11,10.5,'#ffe8a3');
  for(let i=0;i<Math.min(items.length,6);i++){
    let sx=x-50+i*20,sy=y+9;
    pxRect(sx-8,sy-8,16,16,items[i].color||col);
    text(items[i].icon,sx,sy+4,11,'#fff');
  }
  if(items.length===0){
    text('EMPTY SHELF',x,y+12,9.5,'#ff9e8a');
  }
}

function drawOutputOverlay(x,y,items,max,label){
  pxRect(x-44,y-20,88,38,'#1d1618e0');
  g.strokeStyle=items.length>0?'#ffd264':'#7c5b3e';g.lineWidth=2;
  g.strokeRect(x-44,y-20,88,38);
  text(`${label} ${items.length}/${max}`,x,y-6,9,'#ffe7a0');
  for(let i=0;i<Math.min(items.length,4);i++){
    text(items[i].icon,x-24+i*16,y+12,12,'#fff');
  }
}

function drawPixelWorld(){
  if(mapArt.complete&&mapArt.naturalWidth){
    g.drawImage(mapArt,0,0,WORLD.w,WORLD.h);
  }else{
    pxRect(0,0,WORLD.w,WORLD.h,'#397f3d');
    pxRect(50,300,1770,1750,'#c9ab79');
    text('Loading Forest Outpost Artwork...',WORLD.w/2,1350,24,'#fff');
  }

  // Material Yard live nodes & regrowth timers
  for(const n of yardNodes){
    pxRect(n.x-26,n.y-20,52,36,n.ready?'#1c1816bb':'#1c1816dd');
    text(n.icon,n.x,n.y+4,18,n.ready?'#fff':'#777');
    if(!n.ready){
      pxRect(n.x-22,n.y+10,44,5,'#333');
      pxRect(n.x-22,n.y+10,44*(1-n.timer/n.max),5,'#67d876');
    }
  }

  // Workshop Output Badges
  drawOutputOverlay(PTS.swordOut.x,PTS.swordOut.y,S.outputItems.sword,S.outputCap,'⚔️ OUT');
  if(S.products.shield.unlocked||S.outputItems.shield.length>0){
    drawOutputOverlay(PTS.shieldOut.x,PTS.shieldOut.y,S.outputItems.shield,S.outputCap,'🛡️ OUT');
  }
  drawOutputOverlay(PTS.potionOut.x,PTS.potionOut.y,S.outputItems.potion,S.outputCap,'🧪 OUT');

  // Retail Shelf Stock Overlays
  drawShelfOverlay(PTS.attackShelf.x,PTS.attackShelf.y,S.shelfItems.sword,12,'⚔️ ATTACK','#d9534f');
  drawShelfOverlay(PTS.defenseShelf.x,PTS.defenseShelf.y,S.shelfItems.shield,12,'🛡️ DEFENSE','#4a90e2');
  drawShelfOverlay(PTS.otherShelf.x,PTS.otherShelf.y,S.shelfItems.potion,12,'🧪 OTHER','#9b59b6');

  // Rare Storage live showcase badge
  labelBadge(`✨ RARE STORAGE (${S.rareDisplay.length}/6)`,PTS.rare.x,PTS.rare.y-42,'#f3c6ff','#291d36dd',156);
  for(let i=0;i<Math.min(S.rareDisplay.length,4);i++){
    let it=S.rareDisplay[i];
    pxRect(PTS.rare.x-54+i*36,PTS.rare.y-16,30,28,it.color);
    text(it.icon,PTS.rare.x-39+i*36,PTS.rare.y+3,14,'#fff');
  }

  // Contract Warehouse status badge
  labelBadge(`📦 CONTRACTS ${contractUnits()}/${S.contractCap}`,PTS.contractDrop.x+45,PTS.contractDrop.y-32,'#ffe0a0');

  // Special Visitor indicator
  if(!S.visitorClaimed){
    labelBadge('🎁 TAP TO CLAIM GIFT!',PTS.visitor.x,PTS.visitor.y-48,'#ffd86b','#3b2818ee',148);
  }
}

function person(o,col='#302831',label='',hatType='none',badge=''){
  g.save();
  let bob=o.moving?Math.sin(animClock*14)*3:0;
  g.translate(Math.round(o.x),Math.round(o.y+bob));
  g.fillStyle='#0006';
  g.beginPath();g.ellipse(0,38-bob,18,7,0,0,Math.PI*2);g.fill();
  pxRect(-12,14,9,20,'#372b2e');pxRect(3,14,9,20,'#372b2e');
  pxRect(-15,32,12,6,'#241c1f');pxRect(3,32,12,6,'#241c1f');
  pxRect(-17,-12,34,29,col);
  pxRect(-24,-8,8,20,col);pxRect(16,-8,8,20,col);
  pxRect(-13,-30,26,21,'#efc694');
  pxRect(-7,-22,4,4,'#222');pxRect(4,-22,4,4,'#222');
  if(hatType==='Knight'){
    pxRect(-15,-39,30,13,'#8c9aa6');pxRect(-11,-33,22,5,'#d4dee8');
  }else if(hatType==='Collector'){
    pxRect(-14,-39,28,10,'#e6b835');pxRect(-7,-43,14,5,'#ffdf6b');
  }else if(hatType==='Veteran'){
    pxRect(-15,-38,30,11,'#3d5a35');
  }else{
    pxRect(-14,-37,28,10,'#473127');
  }
  if(label){
    pxRect(-56,-56,112,16,'#171719e0');
    text(label,0,-44,9.5,'#fff');
  }
  if(badge){
    text(badge,24,-22,14,'#fff');
  }
  g.restore();
}

function drawRequest(o,label){
  let lines=label.split('\n'),w=138,h=16+lines.length*14,x=o.x-w/2,y=o.y-70-h;
  pxRect(x,y,w,h,'#fff0c9');
  g.strokeStyle='#6d4931';g.lineWidth=3;g.strokeRect(x,y,w,h);
  for(let i=0;i<lines.length;i++)text(lines[i],o.x,y+15+i*14,10,'#352619');
}

function draw(){
  g.save();
  g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  g.clearRect(0,0,vw,vh);
  g.scale(zoom,zoom);
  g.translate(-cam.x,-cam.y);

  drawPixelWorld();

  // Hire Pad in Staff House
  g.globalAlpha=.75;g.fillStyle='#3ca84e';
  g.fillRect(PTS.hire.x-48,PTS.hire.y-22,96,44);
  g.globalAlpha=1;
  text('🤝 HIRE $120',PTS.hire.x,PTS.hire.y+4,10.5,'#fff');

  // Checkout Coins on Checkout Counter
  if(S.coinsFloor>0){
    pxRect(PTS.coinPile.x-38,PTS.coinPile.y-36,76,22,'#191516dd');
    for(let i=0;i<Math.min(12,Math.ceil(S.coinsFloor/18));i++){
      g.fillStyle='#ffd54f';
      g.beginPath();g.arc(PTS.coinPile.x-22+(i%5)*11,PTS.coinPile.y-4+Math.floor(i/5)*10,6.5,0,7);g.fill();
    }
    text('🪙 $'+S.coinsFloor,PTS.coinPile.x,PTS.coinPile.y-21,11.5,'#fff4a3');
  }

  // Customers
  clients.forEach(x=>{
    let col=x.level==='Knight'?'#4a6b9c':x.personality==='Collector'?'#8a4999':'#6f4c92';
    person(x,col,x.level,x.level==='Knight'?'Knight':x.personality==='Collector'?'Collector':x.level==='Veteran'?'Veteran':'none',x.carriedItem?x.carriedItem.icon:'');
    if(x.state==='toShelf'||x.state==='waitShelf'){
      let r=recipes[x.want];
      let label=`${r.icon} ${r.name}`+(x.minStat?`\n${r.statName} ${x.minStat}+`:'')+(x.minRarity!=='Any'?` • ${x.minRarity}+`:'');
      drawRequest(x,label);
      pxRect(x.x-30,x.y-64,60,6,'#332a30');
      pxRect(x.x-30,x.y-64,60*Math.max(0,x.pat/x.max),6,x.pat/x.max>.4?'#5ed177':'#ed6256');
    }
  });

  // Employees
  S.employees.forEach(e=>{
    let col=e.job==='Sales'?'#c68a2d':e.job==='Craft'?'#c65337':e.job==='Expedition'?'#4b6cb7':'#67825d';
    person(e,col,`${e.name} (${e.job})`,'none',e.carryKey?recipes[e.carryKey].icon:(e.statusIcon||''));
    if(e.job==='Craft'&&e.work>0){
      pxRect(e.x-24,e.y-66,48,6,'#222');
      pxRect(e.x-24,e.y-66,48*Math.min(1,e.work/6.2),6,'#ffd257');
    }
  });

  // Forest Monsters
  monsters.forEach(m=>{
    let bounce=Math.sin(animClock*8+m.x)*3;
    if(m.kind==='wolf'){
      pxRect(m.x-22,m.y-4+bounce,44,24,'#596270');
      pxRect(m.x-14,m.y-16+bounce,28,16,'#778294');
    }else{
      pxRect(m.x-22,m.y-3+bounce,44,28,'#49ad44');
      pxRect(m.x-15,m.y-15+bounce,30,18,'#78dd62');
    }
    pxRect(m.x-8,m.y+2+bounce,4,4,'#222');pxRect(m.x+5,m.y+2+bounce,4,4,'#222');
    pxRect(m.x-20,m.y-26,40,6,'#222');
    pxRect(m.x-20,m.y-26,40*(m.hp/18),6,'#67e66c');
  });

  // Player & Carried Stack
  if(player.carryCount>0){
    for(let i=0;i<player.carryItems.length;i++){
      let it=player.carryItems[i];
      pxRect(player.x-14,player.y-74-i*20,28,18,it.color||'#fff');
      text(it.icon,player.x,player.y-60-i*20,14,'#fff');
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
  const box=$('saveSlots');
  if(!box)return;
  box.innerHTML=[1,2,3].map(n=>{
    let d=load(n);
    return `<div class="slot"><h2>SAVE SLOT ${n}</h2>${d?`<p>Day ${d.day} • Cash $${d.cash}<br>Reputation ${d.rep} • Legacy ${d.legacy||0}<br>Staff ${d.employees?.length\vert{}\vert{}0} • Saved ${d.savedAt||'Recently'}</p>`:'<p>Empty shop record<br>Start at the Forest Outpost with 0 employees and build your empire!</p>'}<div class="actions"><button data-load="${n}">${d?'LOAD SHOP':'START NEW SHOP'}</button>${d?`<button class="danger" data-del="${n}">DELETE</button>`:''}</div></div>`;
  }).join('');
  document.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>start(Number(b.dataset.load)));
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('Delete this save slot? (Forever Skills & Legacy are kept)')){
      const num=Number(b.dataset.del);
      localStorage.removeItem(key(num));
      OLD_PREFIXES.forEach(p=>localStorage.removeItem(p+num));
      renderSlots();
    }
  });
}

function start(n){
  slot=n;
  let existing=load(n);
  S=norm(existing);
  player={x:745,y:2080,speed:320,carryKey:null,carryCount:0,carryItems:[],carryCap:3+S.skills.management};
  clients=[];monsters=[];target=null;dayTime=0;zoom=S.zoom||.65;
  if(!S.goals.length)createDayContent();
  if(!S.offers.length)generateContractOffers();
  playing=true;
  $('slotScreen').classList.remove('show');$('app').classList.remove('hidden');
  if(!existing)save('Slot created');
  toast('Hold & drag anywhere to walk around your Forest Outpost!');
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
        <div class="row"><span>Day</span><b>${S.day}</b></div> <div class="row"><span>Cash</span><b>$${S.cash}</b></div>
        <div class="row"><span>Reputation</span><b>${S.rep}</b></div>
        <div class="row"><span>Shop Rating</span><b>${Math.max(1,S.review-S.badReviews*.15).toFixed(1)} ★</b></div>
      `)}
      ${card('Raw Materials',`
        <div class="row"><span>🪨 Iron Ore</span><b>${S.iron}</b></div>
        <div class="row"><span>🪵 Hardwood</span><b>${S.wood}</b></div>
        <div class="row"><span>🌿 Healing Herb</span><b>${S.herb}</b></div>
        <div class="row"><span>💧 Slime Gel</span><b>${S.gel}</b></div>
      `)}
      ${card('Rare Storage (+Tip Bonus)',S.rareDisplay.length?S.rareDisplay.map(r=>`<div>${r.icon} <b style="color:${r.color}">${r.rarity} ${r.name}</b> (${r.stat})</div>`).join(''):'Craft Rare+ items or Slime Edge to fill Rare Storage!')}
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
        return card(`${r.icon}${r.name}`,`
          <div class="row"><span>Department</span><b>${r.cat} (${r.statName}${r.baseStat})</b></div>
          <div class="row"><span>Recipe Cost</span><b>${r.iron?r.iron+'🪨 ':''}${r.wood?r.wood+'🪵 ':''}${r.herb?r.herb+'🌿':''}</b></div>
          <div class="row"><span>Shelf Stock</span><b>${x.stock}/12 (Out: ${S.output[k]}/8)</b></div>${x.unlocked?`<button data-toggle="${k}" class="${x.on?'on':''}">${x.on?'SELLING ON':'SELLING OFF'}</button>`:`<button data-unlock="${k}">UNLOCK RECIPE ($180)</button>`}
        `);
      }).join('')}
    </div>`;
  }
  if(p==='employees'){
    h=`<h2>STAFF & ASSIGNMENTS (${S.employees.length}/${S.staffCap})</h2>
    <button class="action" id="applyRecommended">✨ APPLY ALL RECOMMENDED ROLES</button>
    <div class="grid" style="margin-top:10px">
      ${S.employees.map(e=>card(`${e.name} •${e.job}`,`
        <div class="abilities"><span>SELL ${e.sell}</span><span>CRAFT${e.craft}</span><span>ATK ${e.atk}</span><span>DEF${e.def}</span></div>
        <div class="row"><span>HP ${Math.round(e.hp)}/100</span><span>Wage$${e.wage}/day</span></div>${['Sales','Craft','Expedition','Staff House'].map(j=>`<button data-emp="${e.id}" data-job="${j}" class="${e.job===j?'on':''}">${j}</button>`).join('')}
      `)).join('')}
      ${card('Staff House Management',`
        <div class="row"><span>Staff Capacity</span><b>${S.employees.length}/${S.staffCap}</b></div>
        <button id="hire">🤝 HIRE NEW HELPER ($120)</button>
        <button id="house">🏠 UPGRADE STAFF HOUSE ($300)</button>
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
        <div class="row"><span>Order</span><b>${recipes[q.key].icon}${recipes[q.key].name} ${q.done}/${q.qty}</b></div>
        <div class="bar"><i style="width:${Math.min(100,q.done/q.qty*100)}%"></i></div>
        <div class="row"><span>Deadline</span><b>${q.days} day(s) left</b></div> <div class="row"><span>Reward</span><b>$${q.reward} & +1 Legacy</b></div>
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
  if(p==='visual'){
    h=`<h2>FOREST OUTPOST • MAP & PROGRESSION</h2>
    <div class="visualNote">Your Forest Outpost artwork is active as the live scrolling world! All rooms, doorways, shelves, outputs, and paths are aligned with the map below.</div>
    <img class="visualHero" src="assets/first_shop_art.jpg?v=0.15.00" onerror="this.src='assets/forest_outpost_map.jpg?v=0.15.00'">
    <h2>SHOP TIER PROGRESSION</h2>
    <div class="tierCard"><b>TIER 1 • FOREST OUTPOST (Active)</b><p>Includes Material Yard, Staff House, Training Room, Forge, Alchemy Lab, Contract Warehouse, Attack/Defense/Other Display Hall, Rare Storage, Checkout, Management Office, Special Visitor Plaza, and Forest Adventure Gate.</p></div>
    <div class="tierCard locked"><b>TIER 2 • TOWN WORKSHOP (Coming Soon)</b><p>3× larger town compound with expanded shelves, multi-wagon wholesale bays, and Crystal Mine access.</p></div>
    <div class="tierCard locked"><b>TIER 3 • GUILD EMPORIUM (Coming Soon)</b><p>Grand royal weapon emporium with specialist master smiths and Ancient Ruins expeditions.</p></div>`;
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

// All recommendation coordinates matched to the 1870x2870 Forest Outpost map
function recommendation(){
  if(S.coinsFloor>0)return {t:'Collect $'+S.coinsFloor+' at Checkout',x:PTS.coinPile.x,y:PTS.coinPile.y-30};
  if(player.carryCount>0){
    if(matchingContract(player.carryKey,player.carryItems[0]?.q)&&S.productionPriority==='Wholesale'){
      return {t:'Deliver to Contract Warehouse',x:PTS.contractDrop.x,y:PTS.contractDrop.y};
    }
    let p=shelfPoint(player.carryKey);
    return {t:'Stock carried items on shelf',x:p.x,y:p.y};
  }
  if(S.output.sword>0)return {t:'Pick up Swords at Forge Output',x:PTS.swordOut.x,y:PTS.swordOut.y+20};
  if(S.output.shield>0)return {t:'Pick up Shields at Forge Output',x:PTS.shieldOut.x,y:PTS.shieldOut.y+20};
  if(S.output.potion>0)return {t:'Pick up Potions at Alchemy Output',x:PTS.potionOut.x,y:PTS.potionOut.y+20};
  if(!S.visitorClaimed)return {t:'Claim Special Visitor Gift (South Plaza)',x:PTS.visitor.x,y:PTS.visitor.y};
  if(S.iron<2||S.wood<1||S.herb<2)return {t:'Gather materials in Material Yard',x:335,y:520};
  if(S.products.sword.stock<2)return {t:'Craft Swords in the Forge',x:355,y:980};
  if(S.products.potion.stock<2)return {t:'Brew Potions in Alchemy Lab',x:960,y:980};
  if(S.employees.length===0&&S.cash>=120)return {t:'Hire 1st Helper in Staff House ($120)',x:PTS.hire.x,y:PTS.hire.y};
  return {t:'Fight Monsters at Forest Gate',x:945,y:215};
}

function showTutorial(){
  let st=S.tutorialStep||0;
  if(st>=5){$('tutorial').classList.remove('show');return}
  const steps=[
    ['1/5 • Drag to Move','Hold & slide your finger anywhere like a joystick to walk around the Forest Outpost. Tap 💡 Next Task anytime to auto-walk!'],
    ['2/5 • Craft at the Forge','Walk north into the FORGE (left workshop) and tap 🔨 Sword on the bottom action bar.'],
    ['3/5 • Pick Up & Stock Shelf','Walk over the Sword at ⚔️ OUT, then carry it to the red ATTACK shelf.'],
    ['4/5 • Customer & Checkout Coins','Watch a customer walk in from the South Bridge, take the Sword, and leave coins at CHECKOUT. Walk over the coins!'],
    ['5/5 • Material Yard & Forest Gate','Gather free materials in the top-left Material Yard or fight monsters above the top Forest Gate!']
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
  if(!canCraft(k))return toast('Missing raw materials • Visit the Material Yard!');
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
$('overview').onclick=()=>setZoom(.46);$('suggest').onclick=()=>{
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