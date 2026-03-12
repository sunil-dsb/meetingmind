import { FC } from 'react';

interface UploadIconProps {
    className?: string;
}

const UploadIcon: FC<UploadIconProps> = ({ className = "w-5 h-5" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M12 2L12 16M12 2L8 6M12 2L16 6" />
        <path d="M3 21H21" />
        <path d="M3 16V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V16" />
    </svg>
);

export default UploadIcon;
