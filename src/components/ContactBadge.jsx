import { useState } from 'react'

export default function CreatorBadge() {
    const [hovered, setHovered] = useState(false)

    return (
        <a
            href="https://www.linkedin.com/in/mohamed-asif-m-35963a2a1"
            target="_blank"
            rel="noopener noreferrer"
            className={`creator-badge ${hovered ? 'creator-badge--hovered' : ''}`}
            title="View LinkedIn Profile – Mohamed Asif M"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Animated glow ring */}
            <span className="creator-badge__ring" />

            {/* LinkedIn logo */}
            <span className="creator-badge__li-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                </svg>
            </span>

            {/* Text */}
            <span className="creator-badge__body">
                <span className="creator-badge__label">Creator</span>
                <span className="creator-badge__name">Mohamed Asif M</span>
            </span>

            {/* Arrow indicator */}
            <span className="creator-badge__arrow">↗</span>
        </a>
    )
}
