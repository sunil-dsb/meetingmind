import { FC } from 'react';

interface FileAudioIconProps {
    className?: string;
}

const FileAudioIcon: FC<FileAudioIconProps> = ({ className = "w-[26px] h-[26px]" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <rect x="3" y="2" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 7H21L17 3V7Z" fill="currentColor" />
        <path d="M7 11H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default FileAudioIcon;
