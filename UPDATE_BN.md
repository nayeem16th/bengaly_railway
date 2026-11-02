# Edition 04 — Laptop update

মানুষের স্বাভাবিক অনুপাত, মুখ-চুল-পোশাক-ব্যাগ, articulated হাঁটা ও staggered ওঠানামা; জানালার ভেতরে আসন ও যাত্রী; brake/wheel sound ও device voice announcement; কমলাপুর/চট্টগ্রাম/কক্সবাজারের আলাদা inspired station design; চায়ের দোকান, ঘড়ি, crossing, গাড়ি, নৌকা ও খুঁটি; সঠিক stop, সময় ও গতিসীমার bonus।

Performance: ৪/৭/১২ জনের কাছের platform crowd pool, static batching, distant scenery culling, adaptive resolution ও FPS display। একই representative scene-এর mesh count ৪২৭১ থেকে প্রায় ১৭৩৪ হয়েছে; এটি FPS benchmark নয়।

গেমের ১১টি test, geometry smoke test এবং production build যাচাই করা হয়েছে। ব্রাউজারে visual QA ও তোমার laptop-এ FPS পরীক্ষা করা হয়নি। চরিত্রগুলো উন্নত lightweight procedural model; photorealistic নয়।

সম্পূর্ণ source আলাদা ফাইলে আছে; চালানোর নিয়ম START_HERE_BN.md-তে। পুরোনো server বন্ধ করে নতুন ফোল্ডার Extract করো, npm install, তারপর npm run dev -- --host 127.0.0.1 --port 5173 --strictPort চালাও।
