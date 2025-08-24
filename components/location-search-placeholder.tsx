import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

const LOCATIONS = [" for Pune", " for Mumbai", " for Nashik"];
const PREFIX = "Search";

export default function LocationSearchPlaceholder() {
  const [locationIndex, setLocationIndex] = useState(0);
  const [displayText, setDisplayText] = useState(PREFIX);
  const [typing, setTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [backspacing, setBackspacing] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentLocation = LOCATIONS[locationIndex];
    if (typing) {
      if (charIndex < currentLocation.length) {
        timeout = setTimeout(() => {
          setDisplayText(PREFIX + currentLocation.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 60); // Faster typing
      } else {
        timeout = setTimeout(() => {
          setTyping(false);
          setBackspacing(true);
        }, 1000);
      }
    } else if (backspacing) {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(PREFIX + currentLocation.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 40); // Faster backspacing
      } else {
        timeout = setTimeout(() => {
          setBackspacing(false);
          setLocationIndex((prev) => (prev + 1) % LOCATIONS.length);
        }, 250);
      }
    } else {
      setTyping(true);
      setCharIndex(0);
    }
    return () => clearTimeout(timeout);
  }, [typing, backspacing, charIndex, locationIndex]);

  return (
    <div className="w-full flex justify-center items-center py-2 bg-neutral-100">
      <a href="/book" className="flex items-center gap-2 px-4 py-2 rounded-lg shadow bg-white border border-neutral-300 min-w-[260px] cursor-pointer hover:bg-blue-50 transition">
        <Search className="w-5 h-5 text-neutral-500" />
        <span className="text-neutral-700 font-medium">
          {PREFIX}
          {displayText.slice(PREFIX.length)}
        </span>
      </a>
    </div>
  );
}
