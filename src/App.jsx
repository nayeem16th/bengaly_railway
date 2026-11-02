import { sceneryAt } from "./world/regions.js";
import React, { useEffect, useRef, useState } from "react";
import World from "./World.jsx";
import Cockpit from "./Cockpit.jsx";
import RouteMap from "./RouteMap.jsx";
import {
  initial,
  persist,
  board,
  selectRoute,
  unlockRoute,
  speedLimit,
} from "./game.js";
import { routeById } from "./routes.js";
import { createAudio } from "./AudioEngine.js";
function MiniMap({ g }) {
  const stops = g.stops,
    minLat = Math.min(...stops.map((s) => s.lat)) - 0.12,
    maxLat = Math.max(...stops.map((s) => s.lat)) + 0.12,
    minLon = Math.min(...stops.map((s) => s.lon)) - 0.12,
    maxLon = Math.max(...stops.map((s) => s.lon)) + 0.12;
  const xy = (s) => [
    12 + ((s.lon - minLon) / (maxLon - minLon)) * 130,
    12 + ((maxLat - s.lat) / (maxLat - minLat)) * 95,
  ];
  const index = Math.max(0, Math.min(stops.length - 2, Math.floor(g.z / 420))),
    t = Math.max(0, Math.min(1, (g.z - stops[index].z) / 420)),
    a = xy(stops[index]),
    b = xy(stops[index + 1]);
  return (
    <svg viewBox="0 0 154 119" aria-label="Route progress map">
      <polyline
        points={stops.map((s) => xy(s).join(",")).join(" ")}
        fill="none"
        stroke="#819b84"
        strokeWidth="2"
      />
      {stops.map((s, i) => (
        <circle
          key={i}
          cx={xy(s)[0]}
          cy={xy(s)[1]}
          r="2.5"
          fill={i < g.served ? "#d2dea6" : "#637f76"}
        />
      ))}
      <circle
        cx={a[0] + (b[0] - a[0]) * t}
        cy={a[1] + (b[1] - a[1]) * t}
        r="5"
        fill="#efd398"
        stroke="#fff4d3"
        strokeWidth="1.5"
      />
    </svg>
  );
}
export default function App() {
  const game = useRef(initial()),
    audio = useRef(null);
  const [g, setG] = useState({ ...game.current }),
    [panel, setPanel] = useState(null),
    [error, setError] = useState(""),
    [sound, setSound] = useState(true);
  function action(fn) {
    fn(game.current);
    setG({ ...game.current });
  }
  const soundRef = useRef(sound);
  soundRef.current = sound;
  function startSound() {
    audio.current ||= createAudio();
    audio.current.enabled = soundRef.current;
    audio.current.start();
  }
  function open(p) {
    action((g) => {
      g.paused = !!p;
      g.brake = false;
    });
    setPanel(p);
  }
  function launch(id, opts) {
    startSound();
    action((g) => selectRoute(g, id, opts));
    setPanel(null);
  }
  function horn() {
    startSound();
    audio.current.horn();
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setG({ ...game.current });
      audio.current?.update(game.current);
    }, 100);
    const down = (e) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) ||
        e.target.getAttribute("role") === "slider"
      )
        return;
      const g = game.current;
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
      if (!g.started || g.paused) return;
      if (["ArrowUp", "w", "W"].includes(e.key)) {
        g.power = Math.min(100, g.power + 10);
        g.brakeLevel = 0;
      }
      if (["ArrowDown", "s", "S"].includes(e.key)) {
        g.power = 0;
        g.brake = true;
      }
      if (!e.repeat) {
        if (e.key.toLowerCase() === "e") board(g);
        if (e.key.toLowerCase() === "c") g.camera = (g.camera + 1) % 3;
        if (e.key.toLowerCase() === "h") horn();
        if (e.key === " ") open("pause");
        if (e.key.toLowerCase() === "m") open("routes");
      }
    };
    const up = (e) => {
      if (["ArrowDown", "s", "S"].includes(e.key)) game.current.brake = false;
    };
    const blur = () => {
      game.current.brake = false;
      if (game.current.started) open("pause");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      audio.current?.stop();
    };
  }, []);
  const route = routeById(g.routeId),
    distance = Math.round(g.stops[g.next].z - g.z);
  function buy(type) {
    action((g) => {
      const price = (type === "engine" ? 300 : 250) * (g[type] + 1);
      if (g.coins >= price && g[type] < 3) {
        g.coins -= price;
        g[type]++;
        persist(g);
      }
    });
  }
  return (
    <>
      <World
        game={game}
        onError={setError}
        session={g.session}
        quality={g.quality}
      />
      <div className="vignette" />
      <header>
        <div className="brand">
          <span className="brandIcon">▥</span>
          <span>
            BENGAL<span className="thin"> RAIL</span>
            <small>NATIONAL JOURNEYS · EDITION 4.2</small>
          </span>
        </div>
        <div className="headerRight">
          <button onClick={() => open("routes")}>মানচিত্র ↗</button>
          <button onClick={() => open("depot")}>আপগ্রেড</button>
          <button onClick={() => open("settings")}>⚙</button>
          <button
            title="Fullscreen"
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen?.();
              else
                document.documentElement.requestFullscreen?.().catch(() => {});
            }}
          >
            ⛶
          </button>
          <span className="coins">◈ {g.coins.toLocaleString()}</span>
        </div>
      </header>
      {!g.started ? (
        <section className="welcome">
          <div className="eyebrow">THE COUNTRY IS YOUR NEXT DESTINATION</div>
          <h1>
            দূরের পথে।
            <br />
            <i>বাংলার রেলে।</i>
          </h1>
          <p>
            শহরের প্ল্যাটফর্ম থেকে গ্রামের মাঠ। নদী পেরিয়ে পাহাড় আর সমুদ্র।
            তোমার ট্রেন, তোমার পরের গন্তব্য।
          </p>
          <button
            className="primary start"
            disabled={!!error}
            onClick={() => open("routes")}
          >
            ম্যাপে রুট বেছে নাও <span>→</span>
          </button>
          <button
            className="quickStart"
            disabled={!!error}
            onClick={() => launch("local", {})}
          >
            আগে ছোট যাত্রা শিখি · ঢাকা → নারায়ণগঞ্জ
          </button>
          <div className="welcomeFoot">
            ২৪টি রুট <b>·</b> ৩টি ক্যামেরা <b>·</b> আবহাওয়া ও আপগ্রেড
          </div>
        </section>
      ) : (
        <>
          <div className="driveScore">
            <b className={g.speed > speedLimit(g) + 2 ? "overLimit" : ""}>
              {speedLimit(g)} <small>km/h সীমা</small>
            </b>
            <span>
              সময় {Math.floor(g.legElapsed)} / 55s · বোনাস ◈ {g.totalBonus}
              <br />{sceneryAt(g.stops, g.z).label} · পুনরারম্ভ {g.restarts}
            </span>
            <small>
              {g.fps ? g.fps + " FPS · " : ""}
              {g.speed > speedLimit(g) + 2
                ? "গতি কমাও"
                : g.overspeed >= 0.5
                  ? "এই ধাপে গতিসীমা অতিক্রম হয়েছে"
                  : "নিরাপদ গতি"}
            </small>
            {g.boarding > 0 && g.stopReport && (
              <em>
                স্টপ {g.stopReport.accuracy}m · +{g.stopReport.bonus} বোনাস
              </em>
            )}
          </div>
          <div className="bnAnnouncement" role="status" aria-live="polite">
            <strong>{g.announcement || g.message}</strong>
            {g.voiceStatus && <small>{g.voiceStatus}</small>}
            <small>কঠিন নিয়ম: স্টেশন ২৪ মিটার পেরোলেই যাত্রা শুরু থেকে।</small>
          </div>
          <div className="topInfo">
            <span className="eyebrow">
              {g.complete
                ? "ARRIVED"
                : g.boarding > 0
                  ? "BOARDING"
                  : "NEXT STATION"}
            </span>
            <h2>{g.stops[g.next].bn}</h2>
            <span>
              {g.complete
                ? "যাত্রা সম্পন্ন"
                : Math.abs(distance) < 24
                  ? "প্ল্যাটফর্মে"
                  : distance < 0
                    ? "স্টেশন পেরিয়েছে"
                    : distance + " m সামনে"}
            </span>
          </div>
          <button
            className="journeyMap"
            onClick={() => open("routes")}
            title="Open route map"
          >
            <span>
              {g.stops[0].bn} → {g.stops.at(-1).bn}
            </span>
            <MiniMap g={g} />
            <small>
              {g.served} / {g.stops.length} স্টেশন · ম্যাপ M
            </small>
            {g.sandbox && <em>FREE EXPLORATION</em>}
          </button>
          <div className="cameraBar">
            <span>CAMERA</span>
            {["পেছন থেকে", "পাশ থেকে", "চালকের চোখে"].map((s, i) => (
              <button
                key={s}
                className={g.camera === i ? "selected" : ""}
                onClick={() => action((g) => (g.camera = i))}
              >
                {s}
              </button>
            ))}
            <button onClick={() => open("pause")}>Ⅱ</button>
          </div>
          <Cockpit
            g={g}
            action={action}
            horn={horn}
            onBoard={() => {
              startSound();
              action(board);
            }}
            distance={distance}
          />
          {g.complete && (
            <div className="arrival">
              <span className="eyebrow">JOURNEY COMPLETE</span>
              <h2>{g.stops.at(-1).bn} পৌঁছেছ!</h2>
              <p>
                {g.served} স্টেশন · ◈ {g.earnings}{" "}
                {g.sandbox ? "অনুশীলনের কয়েন" : "আয়"}
              </p>
              <button className="primary" onClick={() => open("routes")}>
                পরের গন্তব্য বেছে নাও →
              </button>
            </div>
          )}
        </>
      )}
      {error && <div className="error">{error}</div>}
      {panel === "routes" ? (
        <div className="overlay">
          <RouteMap
            g={g}
            onClose={() => open(null)}
            onSelect={launch}
            onUnlock={(id) => action((g) => unlockRoute(g, id))}
          />
        </div>
      ) : (
        panel && (
          <div className="overlay">
            <section className="modal">
              <button
                className="close"
                onClick={() => open(null)}
                aria-label="Close"
              >
                ×
              </button>
              <span className="eyebrow">BENGAL RAIL</span>
              <h2>
                {panel === "depot"
                  ? "ট্রেন আপগ্রেড"
                  : panel === "settings"
                    ? "তোমার মতো করে সাজাও"
                    : "একটু বিরতি।"}
              </h2>
              {panel === "depot" ? (
                <>
                  <p>
                    ◈ {g.coins} কয়েন। ইঞ্জিনের উন্নতি সঙ্গে সঙ্গে কাজ করে; নতুন
                    বগির মডেল পরের যাত্রায় যুক্ত হবে।
                  </p>
                  {["engine", "coach"].map((type) => (
                    <div className="row" key={type}>
                      <span>
                        <b>
                          {type === "engine" ? "ইঞ্জিন" : "যাত্রীর আসন"} · Lv{" "}
                          {g[type]}
                        </b>
                        <small>
                          {type === "engine"
                            ? "+20 km/h ও বেশি শক্তি"
                            : "+20 আসন ও একটি বগি"}
                        </small>
                      </span>
                      <button
                        disabled={
                          g[type] >= 3 ||
                          g.coins <
                            (type === "engine" ? 300 : 250) * (g[type] + 1)
                        }
                        onClick={() => buy(type)}
                      >
                        {g[type] >= 3
                          ? "সর্বোচ্চ"
                          : "◈ " +
                            (type === "engine" ? 300 : 250) * (g[type] + 1)}
                      </button>
                    </div>
                  ))}
                </>
              ) : panel === "settings" ? (
                <>
                  <label className="settingLabel">
                    আবহাওয়া
                    <select
                      value={g.weather}
                      onChange={(e) =>
                        action((g) => {
                          g.weather = e.target.value;
                          persist(g);
                        })
                      }
                    >
                      <option value="clear">রোদেলা বিকেল</option>
                      <option value="evening">সন্ধ্যার আলো</option>
                      <option value="rain">বর্ষার বৃষ্টি</option>
                    </select>
                  </label>
                  <label className="settingLabel">
                    গ্রাফিক্স
                    <select
                      value={g.quality}
                      onChange={(e) =>
                        action((g) => {
                          g.quality = e.target.value;
                          persist(g);
                        })
                      }
                    >
                      <option value="low">Low · কম শক্তির ল্যাপটপ</option>
                      <option value="balanced">Balanced</option>
                      <option value="high">High · বেশি ছায়া ও রেজল্যুশন</option>
                    </select>
                  </label>
                  <button
                    className="primary"
                    onClick={() => {
                      setSound(!sound);
                      if (audio.current) audio.current.enabled = !sound;
                    }}
                  >
                    {sound ? "🔊 শব্দ চালু" : "🔇 শব্দ বন্ধ"}
                  </button>
                  <p>
                    বৃষ্টিতে ব্রেক করতে একটু বেশি দূরত্ব লাগে। গ্রাফিক্স বদলালে
                    দৃশ্য আবার তৈরি হবে; যাত্রার অগ্রগতি থাকবে।
                  </p>
                </>
              ) : (
                <>
                  <p>
                    সবুজ লিভার ওপরে টানলে ট্রেন চলে। লাল লিভার ওপরে টানলে ব্রেক।
                    স্টেশনে থেমে সবুজ দরজার বাটন চাপো।
                  </p>
                  <p>
                    কিবোর্ড: W / ↑ পাওয়ার · S / ↓ ব্রেক · E দরজা · C ক্যামেরা ·
                    H হর্ন · M মানচিত্র।
                  </p>
                  <p>বর্তমান যাত্রা: {route.bn}</p>
                </>
              )}
              <button className="primary" onClick={() => open(null)}>
                ফিরে যাই →
              </button>
            </section>
          </div>
        )
      )}
    </>
  );
}
