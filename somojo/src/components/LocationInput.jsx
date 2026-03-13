import React, { useState, useEffect, useRef } from 'react';

export default function LocationInput({
    value = "",
    onChange,
    onLocationSelect,
    placeholder = "Enter a location...",
    className = ""
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce the API limits (Nominatim requires <= 1 request per second)
    useEffect(() => {
        if (!value || value.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Nominatim respects standard URL formatting. Limit to 5 results to match Google Maps UI.
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`);
                const data = await res.json();

                if (data && data.length > 0) {
                    setSuggestions(data);
                    setIsOpen(true);
                } else {
                    setSuggestions([]);
                    setIsOpen(false);
                }
            } catch (err) {
                console.error("Failed to fetch location suggestions", err);
            } finally {
                setIsLoading(false);
            }
        }, 600); // 600ms debounce to be safe and polite to the free API

        return () => clearTimeout(timer);
    }, [value]);

    // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (place) => {
        const address = place.display_name;
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        onChange(address);
        setIsOpen(false);
        setSuggestions([]);

        if (onLocationSelect) {
            onLocationSelect({ lat, lng, address });
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                className={`w-full bg-transparent focus:outline-none transition-shadow duration-300 ${className}`}
            />

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[101]">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#5CB144] border-t-transparent"></div>
                </div>
            )}

            {/* Suggestions Dropdown - Increased z-index to be over everything on page */}
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-[100] w-[calc(100%+2rem)] -left-4 mt-4 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-60 overflow-y-auto">
                    {suggestions.map((place) => (
                        <li
                            key={place.place_id}
                            onClick={() => handleSelect(place)}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer text-sm text-gray-200 border-b border-white/5 last:border-0 transition flex items-start gap-3"
                        >
                            <span className="text-gray-400 mt-0.5">📍</span>
                            <span className="leading-tight">{place.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
