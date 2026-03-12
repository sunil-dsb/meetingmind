import { FC } from 'react';

interface FileSizeIconProps {
    className?: string;
}

const FileSizeIcon: FC<FileSizeIconProps> = ({ className = "w-[13px] h-[13px]" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" />
        <path d="M7 10L12 15L17 10" strokeLinejoin="round" />
        <path d="M12 15V3" />
    </svg>
);

export default FileSizeIcon;
