import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);

    // Use refs instead of state to update DOM directly for high performance
    const horizontalLineRef = useRef(null);
    const verticalLineRef = useRef(null);
    const crosshairRef = useRef(null);

    useEffect(() => {
        let rafId;

        const updatePosition = (e) => {
            const x = e.clientX;
            const y = e.clientY;

            // Direct DOM mutation synchronously without rAF eliminates the 1-frame tracking delay
            if (horizontalLineRef.current) horizontalLineRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
            if (verticalLineRef.current) verticalLineRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
            if (crosshairRef.current) crosshairRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;

            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            setIsVisible(true);
        };

        window.addEventListener('mousemove', updatePosition, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible]);

    return (
        <div
            className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Horizontal Line */}
            <div
                ref={horizontalLineRef}
                className="absolute left-0 top-0 w-full h-[1px] bg-white/10"
                style={{ transform: `translate3d(0, -100px, 0)` }}
            />

            {/* Vertical Line */}
            <div
                ref={verticalLineRef}
                className="absolute left-0 top-0 h-full w-[1px] bg-white/10"
                style={{ transform: `translate3d(-100px, 0, 0)` }}
            />

            {/* Center Crosshair Group */}
            <div
                ref={crosshairRef}
                className="absolute left-0 top-0"
                style={{ transform: `translate3d(-100px, -100px, 0)` }}
            >
                {/* Outer Ring */}
                <div
                    className="absolute w-8 h-8 border border-[#CF9EFF]/40 rounded-full"
                    style={{ transform: 'translate(-50%, -50%)' }}
                />
                {/* Inner Glowing Dot */}
                <div
                    className="absolute w-1.5 h-1.5 bg-[#CF9EFF] rounded-full"
                    style={{ transform: 'translate(-50%, -50%)' }}
                />
            </div>
        </div>
    );
}
