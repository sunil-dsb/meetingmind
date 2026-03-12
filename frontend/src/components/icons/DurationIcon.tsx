import { FC } from 'react';

interface DurationIconProps {
    className?: string;
}

const DurationIcon: FC<DurationIconProps> = ({ className = "w-[13px] h-[13px]" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6V12L16 14" />
    </svg>
);

export default DurationIcon;
