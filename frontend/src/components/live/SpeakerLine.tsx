import { getSpeakerColor } from "@/utils/helper";
import { ArrowRight } from "lucide-react";
import { FC } from "react";

const SpeakerLine: FC<{ speaker?: string | null; text: string; isfinal?: boolean }> = ({
    speaker,
    text,
    isfinal = false,
}) => (
    <div className="flex gap-3 mb-2 items-start">
        <span
            className="font-bold tracking-[0.5px] uppercase shrink-0 min-w-[70px] text-[11px] pt-[3px]"
            style={{ color: getSpeakerColor(speaker) }}
        >
            {isfinal ? speaker : <ArrowRight className="w-4 h-4" />}
        </span>
        <span className="text-text-primary leading-[1.7] text-[15px]">
            {text}
        </span>
    </div>
);

export default SpeakerLine
