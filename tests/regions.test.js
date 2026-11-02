import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,selectRoute,update,board} from '../src/game.js';
import {sceneryAt} from '../src/world/regions.js';
import {ROUTES,routeStops} from '../src/routes.js';
test('Miss restarts every route in both directions without door recovery',()=>{
 for(const route of ROUTES) for(const reverse of [false,true]) {
  const g=initial();selectRoute(g,route.id,{sandbox:true,reverse});
  g.next=1;g.z=g.stops[1].z+25;g.speed=30;g.power=50;
  const session=g.session;update(g,.1);
  assert.equal(g.z,0);assert.equal(g.next,0);assert.equal(g.speed,0);assert.equal(g.power,0);
  assert.equal(g.session,session+1);assert.equal(g.routeId,route.id);assert.equal(g.reverse,reverse);
  assert.equal(g.boarding,0);assert.equal(g.served,0);assert.equal(g.restarts,1);
  update(g,.1);assert.equal(g.restarts,1);
 }
});
test('Career loses attempt earnings and 100 coins; exploration preserves wallet',()=>{
 for(const sandbox of [false,true]) {
 const g=initial();selectRoute(g,'coast',{sandbox});g.next=1;g.coins=500;g.earnings=200;g.z=g.stops[1].z+25;
 board(g);assert.equal(g.z,0);assert.equal(g.coins,sandbox?500:200);assert.equal(g.earnings,0);
 }
});
test('Exactly 24m overshoot can board; beyond the boundary restarts',()=>{
 const g=initial();selectRoute(g,'coast',{sandbox:true});g.next=1;g.z=g.stops[1].z+24;board(g);assert.equal(g.boarding,6);
});
test('Scenery attaches to station identities in both directions',()=>{
 for(const r of ROUTES) for(const reverse of [false,true]) {
 const stops=routeStops(r.id,reverse);
 for(const s of stops) { const v=sceneryAt(stops,s.z);assert.equal(v.station,s.key);assert.ok(v.label); }
 }
 const stops=[{key:'dhaka',z:0},{key:'tongi',z:1000}];
 assert.equal(sceneryAt(stops,0).kind,'city');assert.equal(sceneryAt(stops,500).kind,'village');assert.equal(sceneryAt(stops,1000).kind,'industry');
});
