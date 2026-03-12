import { FC } from 'react';

interface UploadPromptIconProps {
    className?: string;
}

const UploadPromptIcon: FC<UploadPromptIconProps> = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2L12 16M12 2L8 6M12 2L16 6" />
        <path d="M3 21H21" />
    </svg>
);

export default UploadPromptIcon;
