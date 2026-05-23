import React from "react";
import "./Preloader.css";

export default function Preloader({ done }) {
  return (
    <div className={`preloader ${done ? "done" : ""}`} id="preloader">
      <div className="pre-wrap">
        <div className="pre-rings">
          <div className="pre-ring r1"></div>
          <div className="pre-ring r2"></div>
          <div className="pre-ring r3"></div>
        </div>
        <svg className="pre-star" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E070" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#A07C1E" />
            </linearGradient>
            <filter id="glow-pre">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            filter="url(#glow-pre)"
            d="M50,5 L56.9,33.4 L81.8,18.2 L66.6,43.1 L95,50 L66.6,56.9 L81.8,81.8 L56.9,66.6 L50,95 L43.1,66.6 L18.2,81.8 L33.4,56.9 L5,50 L33.4,43.1 L18.2,18.2 L43.1,33.4 Z"
            fill="url(#sg)"
          />
          <circle cx="50" cy="50" r="14" fill="#050822" />
          <text x="50" y="57" textAnchor="middle" fontSize="16" fill="#F5E070" fontFamily="serif">☽</text>
        </svg>
      </div>
      <p className="pre-label">يُحمَّل<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span></p>
    </div>
  );
}
