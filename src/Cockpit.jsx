import React from "react";
function Lever({ value, onChange, red, label, disabled }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange(
      Math.round(
        Math.max(
          0,
          Math.min(100, (1 - (e.clientY - r.top - 17) / (r.height - 34)) * 100),
        ),
      ),
    );
  };
  return (
    <div className={"leverUnit " + (red ? "red" : "")}>
      <span className="leverLabel">{label}</span>
      <div
        className="leverTrack"
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            onChange(
              Math.max(
                0,
                Math.min(100, value + (e.key === "ArrowUp" ? 10 : -10)),
              ),
            );
          }
        }}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={(e) => {
          if (!disabled && e.currentTarget.hasPointerCapture(e.pointerId))
            move(e);
        }}
      >
        <span className="rail" />
        <span className="notches" />
        <span
          className="leverKnob"
          style={{ bottom: `calc(${value}% - ${value * 0.34}px)` }}
        >
          <i />
          <i />
          <i />
        </span>
        <small className="high">MAX</small>
        <small className="low">OFF</small>
      </div>
      <b>{value}%</b>
    </div>
  );
}
function Dial({ speed }) {
  return (
    <svg
      className="dial"
      viewBox="0 0 200 172"
      aria-label={`Speed ${Math.round(speed)} kilometres per hour`}
    >
      <defs>
        <radialGradient id="face">
          <stop stopColor="#263b3c" />
          <stop offset="1" stopColor="#0a151b" />
        </radialGradient>
      </defs>
      <circle
        cx="100"
        cy="96"
        r="88"
        fill="#49575a"
        stroke="#889393"
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="96"
        r="81"
        fill="url(#face)"
        stroke="#080d11"
        strokeWidth="4"
      />
      {Array.from({ length: 31 }, (_, i) => {
        const a = ((i * 9 - 225) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * (i % 5 ? 70 : 64)}
            y1={96 + Math.sin(a) * (i % 5 ? 70 : 64)}
            x2={100 + Math.cos(a) * 76}
            y2={96 + Math.sin(a) * 76}
            stroke={i > 23 ? "#ee795c" : "#d9e6cf"}
            strokeWidth={i % 5 ? 1 : 2}
          />
        );
      })}
      {[0, 25, 50, 75, 100, 125, 150].map((v, i) => {
        const a = ((i * 45 - 225) * Math.PI) / 180;
        return (
          <text
            key={v}
            x={100 + Math.cos(a) * 54}
            y={100 + Math.sin(a) * 54}
            textAnchor="middle"
            fill="#c9d6cb"
            fontSize="10"
          >
            {v}
          </text>
        );
      })}
      <text x="100" y="72" textAnchor="middle" fill="#8aaf9d" fontSize="8">
        BANGLADESH RAILWAY
      </text>
      <g transform={`rotate(${-135 + (speed / 150) * 270} 100 96)`}>
        <path d="M97 100 L100 25 L103 100Z" fill="#f4b461" />
      </g>
      <circle cx="100" cy="96" r="7" fill="#c6cabb" />
      <rect x="71" y="123" width="58" height="23" rx="3" fill="#07141a" />
      <text
        x="100"
        y="141"
        textAnchor="middle"
        fill="#deefbb"
        fontFamily="monospace"
        fontSize="21"
      >
        {Math.round(speed).toString().padStart(2, "0")}
      </text>
      <text x="100" y="159" textAnchor="middle" fill="#8fa699" fontSize="8">
        km/h
      </text>
    </svg>
  );
}
export default function Cockpit({ g, action, horn, onBoard, distance }) {
  let brake = Math.round((g.brakeLevel || 0) * 100);
  let hint = g.complete
    ? "যাত্রা শেষ!"
    : g.boarding > 0
      ? "যাত্রী উঠছে ও নামছে… একটু অপেক্ষা করো"
      : g.next === 0
        ? "① দরজার সবুজ বাটন চাপো → যাত্রী উঠবে"
        : distance < -24
          ? "থামিয়ে দরজার বাটন চাপো → স্টেশনে ফিরবে"
          : distance < 150
            ? "③ লাল ব্রেক ওপরে টেনে থামাও → দরজা খোলো"
            : "② সবুজ পাওয়ার লিভার ওপরে টানো → ট্রেন চলবে";
  return (
    <div className="simCab">
      <div className="driveHint" role="status">
        {hint}
      </div>
      <div className="cabSurface">
        <div className="screw tl" />
        <div className="screw tr" />
        <div className="screw bl" />
        <div className="screw br" />
        <div className="gaugePod">
          <Dial speed={g.speed} />
        </div>
        <div className="instrument">
          <span className="plate">BR 2900 · CONTROL DESK</span>
          <div className="lcd">
            <span>পরের স্টেশন</span>
            <b>
              {g.complete ? g.stops.at(-1).bn : Math.max(0, distance) + " m"}
            </b>
            <small>
              যাত্রী {g.passengers} / {40 + g.coach * 20} &nbsp; ◈ {g.earnings}
            </small>
          </div>
          <div className="indicator">
            <i className={g.boarding ? "amber" : "green"} />
            {g.boarding ? "দরজা খোলা" : "দরজা বন্ধ"}
            <i className={brake || g.brake ? "redLamp" : ""} />
            ব্রেক
          </div>
        </div>
        <Lever
          value={g.power}
          label="পাওয়ার"
          disabled={g.paused || g.boarding > 0 || g.complete}
          onChange={(v) =>
            action((g) => {
              g.power = v;
              if (v > 0) {
                g.brakeLevel = 0;
                g.brake = false;
              }
            })
          }
        />
        <Lever
          value={brake || (g.brake ? 100 : 0)}
          red
          label="ব্রেক"
          disabled={g.paused || g.complete}
          onChange={(v) =>
            action((g) => {
              g.brakeLevel = v / 100;
              g.brake = false;
              if (v > 0) g.power = 0;
            })
          }
        />
        <div className="physicalButtons">
          <button className="hornPush" title="হর্ন (H)" onClick={horn}>
            <svg viewBox="0 0 40 40">
              <path
                d="M8 16h8l13-8v24l-13-8H8zM33 14q7 6 0 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </button>
          <span>হর্ন · H</span>
          <button
            className="doorPush"
            title="দরজা খোলো (E)"
            disabled={g.speed > 0.5 || g.boarding > 0 || g.complete}
            onClick={onBoard}
          >
            <svg viewBox="0 0 40 40">
              <path
                d="M8 32V8h24v24M20 8v24M4 20h10m-4-4 4 4-4 4m26-4H26m4-4-4 4 4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          </button>
          <span>দরজা · E</span>
        </div>
      </div>
    </div>
  );
}
