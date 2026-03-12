import { FC } from 'react';

interface PlayAnalysisIconProps {
    className?: string;
}

const PlayAnalysisIcon: FC<PlayAnalysisIconProps> = ({ className = "w-[22px] h-[22px]" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="rgba(255,255,255,0.2)" />
        <path d="M9.5 16.5V7.5L16.5 12L9.5 16.5Z" fill="#ffffff" />
    </svg>
);

export default PlayAnalysisIcon;
