# Bengal Rail — National Journeys (Edition 04)

## Windows ও VS Code-এ চালাও

১. ZIP ডাউনলোড করে Right click → Extract All… করো। ZIP-এর ভেতর থেকে সরাসরি কাজ করবে না।
২. VS Code → File → Open Folder… → Extract করা Bengal-Rail-Laptop-Edition ফোল্ডারটি খোলো। বাম পাশে package.json এবং src থাকতে হবে।
৩. Terminal → New Terminal চাপো। নিচে লিখে Enter দাও:

```powershell
npm install
```

প্রথমবার ইন্টারনেট লাগবে। শেষ হলে চালাও:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

৪. টার্মিনাল চালু রেখে Chrome বা Edge-এ এই ঠিকানা খোলো:

http://127.0.0.1:5173

index.html ডাবল ক্লিক করে বা Live Server দিয়ে এই React প্রজেক্ট চলবে না।
৫. “আগে ছোট যাত্রা শিখি” চাপো। প্রথমে সবুজ দরজার বাটন বা E চাপো। যাত্রী ওঠার পর সবুজ পাওয়ার লিভার ওপরে টানো।
৬. স্টেশন কাছে এলে লাল ব্রেক লিভার ওপরে টানো। পুরোপুরি থেমে E চাপো। আবার চলতে সবুজ লিভার টানো।
৭. ওপরের ⛶ বাটনে fullscreen। ⚙ থেকে High/Balanced/Low গ্রাফিক্স এবং রোদ/সন্ধ্যা/বৃষ্টি বেছে নাও।

## আগের ভার্সন থাকলে

এই ZIP আলাদা নতুন ফোল্ডারে Extract করে উপরের নিয়মে চালাও। আগের ফোল্ডারের ফাইলের সঙ্গে মিশিও না। পুরোনো টার্মিনালে Ctrl+C চেপে আগের গেম বন্ধ করো। কয়েন একই browser ও একই ঠিকানায় সংরক্ষিত থাকে; localhost এবং 127.0.0.1 আলাদা ঠিকানা।

## সমস্যা হলে

- npm চেনে না: Node.js-এর LTS সংস্করণ ইনস্টল করে VS Code বন্ধ করে আবার খোলো।
- PowerShell বলে npm.ps1 cannot be loaded: ওই টার্মিনালেই npm-এর বদলে npm.cmd install এবং npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort ব্যবহার করো।
- package.json পাওয়া যাচ্ছে না: ভুল ফোল্ডার খোলা হয়েছে। File → Open Folder থেকে package.json-এর সরাসরি ওপরের ফোল্ডার খোলো।
- Port 5173 already in use: পুরোনো dev terminal-এ Ctrl+C চাপো। অথবা কমান্ডে 5173-এর বদলে 5174 লিখে browser-এও 5174 খোলো।
- Connection refused: terminal-এ Vite-এর Local ঠিকানা দেখা যাচ্ছে কি না দেখো। terminal বন্ধ হলে গেমের server-ও বন্ধ হয়।
- ধীরে চলে: ⚙ → Low এবং ছোট রুট বেছে নাও।
- WebGL error: Chrome/Edge-এর graphics/hardware acceleration চালু থাকতে হবে।

## মানচিত্র ও কয়েন

ম্যাপে ২৪টি বাছাইযোগ্য corridor আছে। একটি বেছে গন্তব্য, স্টপ ও আনলক মূল্য দেখো। উল্টো দিকেও চালানো যায়। Career-এ যাত্রী নামিয়ে কয়েন আয় করে locked route ও train upgrade কেনো। Free Exploration-এ সব রুট বিনা কয়েনে দেখা যায়, তবে সেখানে career কয়েন বাড়ে না। নতুন রুট চালালে বর্তমান যাত্রা নতুন করে শুরু হবে।

W/↑ পাওয়ার · S/↓ ধরে ব্রেক · E দরজা · H হর্ন · C ক্যামেরা · M ম্যাপ · Space বিরতি।

## বাস্তবতার সীমা

এটি শিক্ষামূলক procedural 3D game। উন্নত ট্রেনের অংশ, বাঁকানো ট্র্যাক, textured ঘরবাড়ি, গাছ, নদী, প্ল্যাটফর্ম, ছায়া ও আবহাওয়া আছে। এটি photorealistic simulator নয়। মানচিত্র আনুমানিক; ২৪টি নির্বাচিত রুট বাংলাদেশের সব স্টেশন বা সব সার্ভিস নয়। গেমের প্রতিটি স্টপের ব্যবধান ৪২০ মিটার করে ছোট করা হয়েছে। রেললাইনের বাঁক, স্থাপত্য ও দৃশ্য কল্পিত; বাস্তব ট্রেনের সঠিক stopping pattern বা live timetable নয়।

## স্যারকে কোড দেখাও

- index.html — মূল HTML
- src/main.jsx — React চালু করে
- src/App.jsx — UI, game menu, upgrades
- src/style.css — ডিজাইন ও responsive controls
- src/game.js — acceleration, brake, passengers, coins, saved progress
- src/routes.js — station coordinates ও ২৪টি route
- src/RouteMap.jsx — দেশের রুট বাছাইয়ের SVG map
- src/Cockpit.jsx — analog meter, power/brake levers
- src/World.jsx — Three.js scene, camera, lighting, weather
- src/world/train.js — train model ও দরজার animation
- src/world/environment.js — track, station, countryside
- src/world/materials.js — locally generated textures
- src/AudioEngine.js — engine sound ও horn
- tests/game.test.js — game rules-এর পরীক্ষা

পরীক্ষা: npm test
Production build: npm run build
3D geometry পরীক্ষা: node tests/scene-smoke.js


## নতুন সংস্করণ: ল্যাপটপে স্মুথ খেলার সেটিং

প্রথমে Balanced চালাও। FPS কম থাকলে ⚙ → Low বেছে নাও। High-এ বেশি মানুষ, যাত্রী ও ছায়া থাকবে। গেম নিজে কম FPS শনাক্ত করলে ছবির resolution কমায়; FPS স্বাভাবিক হলে ধীরে বাড়ায়। এটি নির্দিষ্ট FPS-এর নিশ্চয়তা নয়—তোমার CPU/GPU, resolution ও অন্য খোলা অ্যাপের ওপর ফল নির্ভর করে।

মানুষের মুখ, চুল, ব্যাগ, পোশাক ও articulated হাঁটা যোগ হয়েছে। এগুলো হালকা procedural model; সিনেমার মতো photorealistic character নয়। স্টেশনের স্থাপত্য বাস্তব স্থান থেকে অনুপ্রাণিত, হুবহু স্থাপত্য নয়।

স্টেশনে দরজা খুললে ঘোষণা শোনা যাবে। ডিভাইসে বাংলা voice থাকলে বাংলা, না থাকলে ইংরেজি; voice সুবিধা না থাকলে ঘোষণা শোনা যাবে না। ⚙ থেকে সব শব্দ বন্ধ করা যায়।

## ভালো চালানোর বোনাস

- ট্র্যাকের সাধারণ গতিসীমা ৭০; বৃষ্টিতে ৫৫; স্টেশনের ১৫০ মিটারের মধ্যে ৩৫ km/h। HUD-এ দেখবে।
- স্টপের ৫ মিটারের মধ্যে থামলে +৪০; ১২ মিটারের মধ্যে +২০।
- আগের স্টেশন ছাড়ার পর ৫৫ সেকেন্ডের মধ্যে দরজা খুললে +৩০। Pause-এর সময় গণনা হয় না।
- গতিসীমার ২ km/h-এর বেশি অর্ধ সেকেন্ড বা বেশি না চালালে +৩০।
- স্টেশন ২৪ মিটারের বেশি পেরোলেই একই রুটে আবার শুরু হবে। দরজা খুলে ফেরার সুযোগ নেই। চলতি যাত্রার আয় বাতিল ও Career-এ অতিরিক্ত ১০০ কয়েন কাটা হবে; ব্যালান্স শূন্যের নিচে যাবে না।
- সব বোনাস যাত্রী ওঠানামা শেষ হলে যোগ হয়। Free Exploration-এ career coin বাড়ে না।

এগুলো গেমের নিয়ম; বাস্তব ট্রেন চালানোর নির্দেশনা নয়।
