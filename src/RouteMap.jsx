import React, { useState } from "react";
import { ROUTES, STATIONS, routeById, SOURCES } from "./routes.js";
const point = (k) => {
  const s = STATIONS[k];
  return [(s[3] - 88) * 110 + 30, (26.65 - s[2]) * 101 + 24];
};
export default function RouteMap({ g, onSelect, onUnlock, onClose }) {
  const [id, setId] = useState(g.routeId),
    [reverse, setReverse] = useState(false),
    [sandbox, setSandbox] = useState(false),
    [filter, setFilter] = useState("");
  const r = routeById(id),
    owned = g.owned.includes(id);
  return (
    <div className="atlas">
      <div className="atlasHeading">
        <div>
          <span className="eyebrow">BANGLADESH RAIL NETWORK</span>
          <h2>দেশজুড়ে তোমার যাত্রা।</h2>
        </div>
        <button className="close" onClick={onClose} aria-label="Close map">
          ×
        </button>
      </div>
      <div className="atlasGrid">
        <div className="mapArt">
          <svg
            viewBox="0 0 560 650"
            role="img"
            aria-label="Schematic Bangladesh railway route map"
          >
            <defs>
              <pattern
                id="mapGrid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M30 0H0V30"
                  fill="none"
                  stroke="#345a58"
                  strokeWidth=".4"
                />
              </pattern>
            </defs>
            <rect width="560" height="650" fill="#102d35" />
            <rect width="560" height="650" fill="url(#mapGrid)" />
            <path
              d="M55 40L108 22 162 65 202 65 191 115 248 163 379 150 445 172 462 208 411 244 389 281 393 333 435 360 455 425 492 473 500 579 471 619 441 568 425 511 390 472 352 430 304 414 283 460 231 463 203 426 149 441 121 401 124 339 81 304 75 250 37 207 41 151 70 123 47 92Z"
              fill="#27443d"
              stroke="#507164"
              strokeWidth="1.5"
            />
            <path
              d="M203 80 Q225 172 214 260T260 370 Q315 400 328 460M50 286Q175 292 260 370M390 184Q306 280 310 393"
              fill="none"
              stroke="#427582"
              strokeWidth="8"
              opacity=".65"
            />
            <text x="64" y="550" fill="#81a4ab" fontSize="15" letterSpacing="4">
              BAY OF BENGAL
            </text>
            <text x="410" y="72" fill="#b4c8bc" fontSize="11">
              N ↑
            </text>
            {ROUTES.map((route) => (
              <polyline
                key={route.id}
                points={route.ids.map((k) => point(k).join(",")).join(" ")}
                fill="none"
                stroke={
                  route.id === id
                    ? "#e5c477"
                    : g.owned.includes(route.id)
                      ? "#719d8a"
                      : "#526c65"
                }
                strokeWidth={route.id === id ? 4 : 1.3}
                opacity={route.id === id ? 1 : 0.6}
                onClick={() => setId(route.id)}
                style={{ cursor: "pointer" }}
              />
            ))}
            {Object.entries(STATIONS).map(([k, s]) => {
              const [x, y] = point(k),
                active = r.ids.includes(k),
                major = [
                  "dhaka",
                  "chattogram",
                  "cox",
                  "sylhet",
                  "khulna",
                  "rajshahi",
                  "panchagarh",
                  "rangpur",
                  "mymensingh",
                  "benapole",
                  "chilahati",
                  "burimari",
                ].includes(k);
              return (
                <g
                  key={k}
                  onClick={() => {
                    const found = ROUTES.find((rt) => rt.ids.at(-1) === k);
                    if (found) setId(found.id);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 4 : major ? 3 : 1.6}
                    fill={active ? "#ffe5aa" : "#9cbca5"}
                    stroke="#173732"
                    strokeWidth="1.5"
                  />
                  {(major || active) && (
                    <text
                      x={x + (k === "dhaka" ? -8 : 7)}
                      y={y - 6}
                      textAnchor={k === "dhaka" ? "end" : "start"}
                      fill={active ? "#fff1cb" : "#b0c6b7"}
                      fontSize={major ? 10 : 8}
                    >
                      {s[0]}
                    </text>
                  )}
                </g>
              );
            })}
            <text x="25" y="624" fill="#9ab5ae" fontSize="10">
              SCHEMATIC • approximate geography • selected corridors
            </text>
          </svg>
          <div className="mapLegend">
            <i /> নির্বাচিত রুট{" "}
            <span>
              {Object.keys(STATIONS).length} station waypoints · {ROUTES.length}{" "}
              routes
            </span>
          </div>
        </div>
        <div className="routeList">
          <input
            placeholder="গন্তব্য খুঁজো / Search a destination"
            aria-label="Search routes"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="routeChoices">
            {ROUTES.filter((r) =>
              (r.bn + " " + r.ids.map((k) => STATIONS[k][0]).join(" "))
                .toLowerCase()
                .includes(filter.toLowerCase()),
            ).map((r) => (
              <button
                key={r.id}
                className={r.id === id ? "chosen" : ""}
                onClick={() => setId(r.id)}
              >
                <b>{r.bn}</b>
                <small>
                  {r.ids.length} stops ·{" "}
                  {g.owned.includes(r.id) ? "খোলা ✓" : "◈ " + r.price}
                </small>
              </button>
            ))}
          </div>
          <div className="routeSummary">
            <h3>{r.bn}</h3>
            <p>{r.desc}</p>
            <p className="waypoints">
              {(reverse ? [...r.ids].reverse() : r.ids)
                .map((k) => STATIONS[k][1])
                .join(" → ")}
            </p>
            <div className="mapOptions">
              <label>
                <input
                  type="checkbox"
                  checked={reverse}
                  onChange={(e) => setReverse(e.target.checked)}
                />{" "}
                উল্টো পথে
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={sandbox}
                  onChange={(e) => setSandbox(e.target.checked)}
                />{" "}
                Free exploration
              </label>
            </div>
            {!owned && !sandbox ? (
              <button
                className="primary"
                disabled={g.coins < r.price}
                onClick={() => onUnlock(id)}
              >
                রুট খোলো · ◈ {r.price} <small>(আছে {g.coins})</small>
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => onSelect(id, { reverse, sandbox })}
              >
                {g.started ? "এই রুটে নতুন যাত্রা" : "যাত্রা শুরু"} →
              </button>
            )}
            <small className="mapNote">
              {sandbox
                ? "সব রুটে বিনা খরচে খেলা যায়; কয়েন ও অর্জন সেভ হয় না।"
                : "নতুন রুট শুরু করলে চলমান যাত্রা শেষ হবে; অর্জিত কয়েন থাকবে।"}
            </small>
          </div>
        </div>
      </div>
      <footer className="mapSources">
        নির্বাচিত স্টপেজ ও সংক্ষিপ্ত গেম দূরত্ব; পূর্ণ রেল নেটওয়ার্ক বা লাইভ
        সময়সূচি নয়।{" "}
        <details>
          <summary>রুটের তথ্যসূত্র</summary>
          {SOURCES.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.name} ↗
            </a>
          ))}
        </details>
      </footer>
    </div>
  );
}
