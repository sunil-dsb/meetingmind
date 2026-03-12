import { FC } from 'react';

interface CloseIconProps {
    className?: string;
}

const CloseIcon: FC<CloseIconProps> = ({ className = "w-5 h-5" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M18 6L6 18M6 6L18 18" />
    </svg>
);

export default CloseIcon;
