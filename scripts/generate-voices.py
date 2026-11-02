"""Optional voice regeneration: pip install edge-tts==7.3.1; python scripts/generate-voices.py.
Committed MP3s are used at runtime; no TTS service or API key is needed to play.
"""
import asyncio
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
PHRASES = {
    'welcome': 'বেঙ্গল রেলে আপনাকে স্বাগতম। দরজা খুলে যাত্রী তুলে নিন। আপনার যাত্রা শুভ হোক।',
    'station-ahead': 'সামনে স্টেশন। গতি কমিয়ে নির্ধারিত স্থানে ট্রেন থামান।',
    'arrival': 'ট্রেন স্টেশনে পৌঁছেছে। যাত্রীরা সাবধানে ওঠানামা করুন।',
    'boarding-complete': 'যাত্রী ওঠানামা শেষ হয়েছে। দরজা বন্ধ। এবার ট্রেন ছাড়ুন।',
    'overspeed': 'সাবধান! নির্ধারিত গতিসীমা অতিক্রম করেছেন। গতি কমান।',
    'crossing': 'সামনে রেলক্রসিং। হর্ন বাজিয়ে সতর্কভাবে এগিয়ে যান।',
    'station-missed': 'আপনি নির্ধারিত স্টেশনে থামেননি। যাত্রা আবার শুরু হচ্ছে।',
    'journey-complete': 'অভিনন্দন! আপনি সফলভাবে যাত্রা সম্পন্ন করেছেন। বেঙ্গল রেলের সঙ্গে থাকার জন্য ধন্যবাদ।',
}
async def main():
    dest = ROOT / 'public/audio/bn'
    dest.mkdir(parents=True, exist_ok=True)
    for key, text in PHRASES.items():
        path = dest / f'{key}.mp3'
        if not path.exists() or path.stat().st_size == 0:
            await edge_tts.Communicate(text, 'bn-BD-PradeepNeural', rate='-5%').save(str(path))
        print(key, path.stat().st_size, flush=True)
    (dest / 'manifest.json').write_text(json.dumps({'voice': 'bn-BD-PradeepNeural', 'language': 'bn-BD', 'phrases': PHRASES}, ensure_ascii=False, indent=2)+'\n')
if __name__ == '__main__':
    asyncio.run(main())
