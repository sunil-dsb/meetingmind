import { FC } from 'react';

interface HamburgerIconProps {
    className?: string;
}

const HamburgerIcon: FC<HamburgerIconProps> = ({ className = "w-5 h-5" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M3 6H21M3 12H21M3 18H21" />
    </svg>
);

export default HamburgerIcon;
