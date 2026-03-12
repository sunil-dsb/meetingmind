export interface LanguageOption {
    code: string;
    label: string;
    flag: string;
}

export interface OutputOption {
    id: "summary" | "action_items" | "pdf" | "transcript";
    label: string;
    desc: string;
    color: string;
}
