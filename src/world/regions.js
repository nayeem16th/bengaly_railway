// Station-anchored artistic scenery zones, not surveyed land-use boundaries.
const city = new Set(['dhaka','airport','chattogram','rajshahi','khulna','sylhet','mymensingh','narayanganj']);
const industry = new Set(['tongi','joydebpur','ishwardi','saidpur']);
const tea = new Set(['sreemangal','kulaura']);
const wetland = new Set(['mohanganj','netrokona','kishoreganj']);
const coast = new Set(['cox','chakaria','dohazari']);
export function sceneryAt(stops, z) {
  let nearest = stops[0];
  for (const s of stops) if (Math.abs(s.z-z)<Math.abs(nearest.z-z)) nearest=s;
  const d=Math.abs(nearest.z-z), key=nearest.key;
  let kind = city.has(key)&&d<240 ? 'city' : industry.has(key)&&d<230 ? 'industry' : tea.has(key) ? 'tea' : wetland.has(key) ? 'wetland' : coast.has(key) ? 'coast' : d<100 ? 'town' : 'village';
  return {kind, station:nearest.key, label:({city:'শহর',industry:'শিল্পাঞ্চল',tea:'চা-বাগান অঞ্চল',wetland:'হাওর অঞ্চল',coast:'উপকূলীয় অঞ্চল',town:'মফস্বল',village:'গ্রাম ও ফসলের মাঠ'})[kind]};
}
export function buildRegion(g, kit, kind, x, rnd) {
  const {box,cyl}=kit;
  if (kind==='city'||kind==='town'||kind==='industry') {
    const count=kind==='city'?5:3;
    for(let i=0;i<count;i++) {
      const bx=x+(i%2?1:-1)*(24+Math.floor(i/2)*17), bz=(i-2)*17;
      const h=kind==='industry'?5:kind==='city'?8+rnd()*14:4+rnd()*5;
      box(11,h,13,['#b6a493','#a9b9b4','#c4b8a1'][i%3],bx,h/2,bz,g);
      box(12,.3,14,'#627477',bx,h,bz,g);
      for(let y=2;y<h-1;y+=3) for(let k=-1;k<=1;k++) box(1.4,1.6,.06,'#425d66',bx+k*3,y,bz-6.55,g);
      if(kind==='industry') cyl(.9,1.3,14,'#967963',bx+7,7,bz,g,8);
      else box(3,2,.12,['#a84e42','#3f796d','#b39958'][i%3],bx,1,bz-6.6,g);
    }
    box(6,.08,105,'#676c69',x-15,-.25,0,g);
  } else if(kind==='tea') {
    for(let side of [-1,1]) for(let row=0;row<5;row++) box(23,.8,2,'#3f6c40',x+side*34,.2,-35+row*13,g);
  } else if(kind==='wetland') {
    box(85,.06,100,'#719c9a',x+60,-.33,0,g);
    for(let i=0;i<5;i++) box(.1,2,.1,'#717e4b',x+22+i*2,.7,10+i,g);
  } else if(kind==='coast') {
    box(40,.06,100,'#c9b887',x-48,-.34,0,g);
    box(90,.06,100,'#669ca8',x-110,-.32,0,g);
  }
}
