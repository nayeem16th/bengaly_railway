# Edition 04 — Laptop update

মানুষের স্বাভাবিক অনুপাত, মুখ-চুল-পোশাক-ব্যাগ, articulated হাঁটা ও staggered ওঠানামা; জানালার ভেতরে আসন ও যাত্রী; brake/wheel sound ও device voice announcement; কমলাপুর/চট্টগ্রাম/কক্সবাজারের আলাদা inspired station design; চায়ের দোকান, ঘড়ি, crossing, গাড়ি, নৌকা ও খুঁটি; সঠিক stop, সময় ও গতিসীমার bonus।

Performance: ৪/৭/১২ জনের কাছের platform crowd pool, static batching, distant scenery culling, adaptive resolution ও FPS display। একই representative scene-এর mesh count ৪২৭১ থেকে প্রায় ১৭৩৪ হয়েছে; এটি FPS benchmark নয়।

গেমের ১১টি test, geometry smoke test এবং production build যাচাই করা হয়েছে। ব্রাউজারে visual QA ও তোমার laptop-এ FPS পরীক্ষা করা হয়নি। চরিত্রগুলো উন্নত lightweight procedural model; photorealistic নয়।

সম্পূর্ণ source আলাদা ফাইলে আছে; চালানোর নিয়ম START_HERE_BN.md-তে। পুরোনো server বন্ধ করে নতুন ফোল্ডার Extract করো, npm install, তারপর npm run dev -- --host 127.0.0.1 --port 5173 --strictPort চালাও।

## বাংলা AI ভয়েস আপডেট
- গেমের সঙ্গে ৮টি বাংলাদেশি বাংলা অডিও যুক্ত: স্বাগত, স্টেশন সামনে, পৌঁছানো, যাত্রী ওঠানামা শেষ, অতিরিক্ত গতি, ক্রসিং, স্টেশন মিস ও যাত্রা সম্পন্ন।
- কণ্ঠ: bn-BD-PradeepNeural। MP3 গেমের নিজস্ব ফাইল হিসেবে লোড হয়; ডিভাইসে বাংলা কণ্ঠ ইনস্টল বা TTS অ্যাকাউন্ট লাগে না।
- শুরু করার বাটনে ক্লিক করে শব্দ চালু রাখুন। পজ, মিউট ও রুট বদলালে চলমান ঘোষণা বন্ধ হয়।
- স্টেশনের নির্দিষ্ট নাম পর্দার বাংলা ঘোষণায় থাকে; অডিওতে সাধারণ স্টেশন ঘোষণা শোনা যায়।
- দরজা যাত্রী ওঠানামা শেষে আগের মতো স্বয়ংক্রিয়ভাবে বন্ধ হয়।
