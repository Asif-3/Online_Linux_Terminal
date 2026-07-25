import { useState } from 'react'

export default function CreatorBadge() {
    const [hovered, setHovered] = useState(false)

    return (
        <a
            href="https://mohamedasif-portfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={`creator-badge ${hovered ? 'creator-badge--hovered' : ''}`}
            title="View Portfolio – Mohamed Asif M"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Animated glow ring */}
            <span className="creator-badge__ring" />

            {/* Portfolio / Globe icon */}
            <span className="creator-badge__li-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2c.55 0 1.4.6 2.18 2H9.82C10.6 4.6 11.45 4 12 4zm-3.5.72A9.7 9.7 0 0 0 6.1 8H4.26A8.02 8.02 0 0 1 8.5 4.72zm7 0A8.02 8.02 0 0 1 19.74 8H17.9a9.7 9.7 0 0 0-2.4-3.28zM4 10h3.08a13.4 13.4 0 0 0-.08 2c0 .68.03 1.35.08 2H4a8 8 0 0 1 0-4zm5.08 0h5.84c.06.65.08 1.32.08 2s-.02 1.35-.08 2H9.08A11.6 11.6 0 0 1 9 12c0-.68.03-1.35.08-2zm7.84 0H20a8 8 0 0 1 0 4h-3.08c.05-.65.08-1.32.08-2s-.02-1.35-.08-2zM4.26 16H6.1a9.7 9.7 0 0 0 2.4 3.28A8.02 8.02 0 0 1 4.26 16zm3.56 0h8.36c-.78 1.4-1.63 2-2.18 2s-1.4-.6-2.18-2H7.82zm6.18 3.28A9.7 9.7 0 0 0 17.9 16h1.84a8.02 8.02 0 0 1-4.24 3.28z" />
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
