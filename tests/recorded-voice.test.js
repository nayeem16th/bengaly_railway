import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecordedVoice} from '../src/RecordedVoice.js';
import {createAudio} from '../src/AudioEngine.js';
import {initial, selectRoute} from '../src/game.js';
function context() {
 const sources=[];
 const parameter=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>({connect(n){return n},disconnect(){},start(){this.started=true},stop(){this.stopped=true},frequency:parameter(),gain:parameter()});
 return {sources,currentTime:30,sampleRate:100,destination:{},decodeAudioData:async b=>b,
 createBufferSource(){const s=node();sources.push(s);return s},createGain:node,createOscillator:node,createBiquadFilter:node,
 createBuffer(){return {getChannelData:()=>new Float32Array(200)}},resume(){},close(){}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('bundled voice works without speech synthesis and loads under GitHub Pages base',async()=>{
 const ctx=context(),urls=[];
 const player=createRecordedVoice(ctx,'/bengaly_railway/',async url=>{urls.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}});
 assert.equal(await player.play('welcome'),true);
 assert.equal(urls[0],'/bengaly_railway/audio/bn/welcome.mp3');
 assert.equal(ctx.sources[0].started,true);
 assert.equal(await player.play('crossing'),false);
 assert.equal(await player.play('station-missed',{interrupt:true}),true);
 assert.equal(ctx.sources[0].stopped,true);
 player.cancel();assert.equal(ctx.sources[1].stopped,true);
 await player.play('welcome');assert.equal(urls.filter(u=>u.endsWith('welcome.mp3')).length,1);
});
test('mute or route reset cancels an announcement still downloading',async()=>{
 const ctx=context();let finish;
 const player=createRecordedVoice(ctx,'/',()=>new Promise(r=>{finish=r}));
 const task=player.play('arrival');player.cancel();
 finish({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});
 assert.equal(await task,false);assert.equal(ctx.sources.length,0);assert.equal(player.busy,false);
});
test('failed download is reported and can be retried',async()=>{
 const ctx=context();let attempt=0,errors=0;
 const player=createRecordedVoice(ctx,'/',async()=>({ok:++attempt>1,arrayBuffer:async()=>new ArrayBuffer(4)}));
 assert.equal(await player.play('welcome',{onError:()=>errors++}),false);assert.equal(errors,1);
 assert.equal(await player.play('welcome'),true);
});
test('game plays recorded welcome, stop, restart and completion; pause cancels playback',async()=>{
 const oldWindow=globalThis.window,oldFetch=globalThis.fetch;
 const ctx=context();let serial=0;
 globalThis.window={AudioContext:function(){return ctx}};
 globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>({url,serial:serial++})});
 try {
  const audio=createAudio(),g=initial();audio.start();selectRoute(g,'coast');audio.update(g);await flush();
  const voice=()=>ctx.sources.filter(s=>s.buffer?.url);
  assert.match(voice().at(-1).buffer.url,/welcome/);
  g.boarding=6;g.boardSerial++;audio.update(g);await flush();assert.match(voice().at(-1).buffer.url,/arrival/);
  g.boarding=0;g.next=1;audio.update(g);await flush();assert.match(voice().at(-1).buffer.url,/boarding-complete/);
  g.paused=true;audio.update(g);assert.equal(voice().at(-1).stopped,true);
  g.paused=false;g.session++;g.restarts=1;g.next=0;audio.update(g);await flush();assert.match(voice().at(-1).buffer.url,/station-missed/);
  g.complete=true;audio.update(g);await flush();assert.match(voice().at(-1).buffer.url,/journey-complete/);
  audio.update(g);assert.notEqual(voice().at(-1).stopped,true);
  audio.enabled=false;audio.update(g);assert.equal(voice().at(-1).stopped,true);
  audio.stop();
 } finally {globalThis.window=oldWindow;globalThis.fetch=oldFetch;}
});
