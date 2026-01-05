import { memo } from "react";

const CalendarPlus = ({ size, width, height, className = "" }) => {
    const w = width || size || 24;
    const h = height || size || 24;
    return (
        <svg
            className={`icon ${className}`}
            viewBox="0 0 24 24"
            width={w}
            height={h}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="12" y1="14" x2="12" y2="20" />
            <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
    );
};

export default memo(CalendarPlus);
