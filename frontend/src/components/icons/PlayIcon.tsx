import { FC } from 'react';

interface PlayIconProps {
    className?: string;
}

const PlayIcon: FC<PlayIconProps> = ({ className = "w-4.5 h-4.5" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
    </svg>
);

export default PlayIcon;
