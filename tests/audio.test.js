import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudio} from '../src/AudioEngine.js';
import {initial} from '../src/game.js';
test('Only Bengali voices speak; English-only devices get Bengali subtitles',()=>{
 let voices=[{lang:'en-US'}],spoken=[];
 globalThis.window={speechSynthesis:{getVoices:()=>voices,cancel(){},speak:u=>spoken.push(u)}};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 const audio=createAudio(),g=initial();audio.announce(g,true);
 assert.equal(spoken.length,0);assert.match(g.announcement,/সামনে/);assert.match(g.voiceStatus,/বাংলা কণ্ঠ নেই/);
 voices=[{lang:'bn-IN'},{lang:'bn-BD'}];audio.announce(g);
 assert.equal(spoken.length,1);assert.equal(spoken[0].lang,'bn-BD');assert.match(spoken[0].text,/স্টেশন/);
 audio.enabled=false;audio.announce(g);assert.equal(spoken.length,1);
 delete globalThis.window;delete globalThis.SpeechSynthesisUtterance;
});
