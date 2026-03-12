import { FC } from 'react';

interface LogoIconProps {
    className?: string;
    width?: number;
    height?: number;
}

const LogoIcon: FC<LogoIconProps> = ({
    className = "w-4.5 h-4.5",
    width = 18,
    height = 18
}) => (
    <svg
        className={className}
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M12 1C8.13 1 5 4.13 5 8C5 12.5 12 23 12 23C12 23 19 12.5 19 8C19 4.13 15.87 1 12 1Z"
            fill="white"
            opacity="0.9"
        />
        <circle cx="12" cy="8" r="3" fill="white" />
    </svg>
);

export default LogoIcon;
