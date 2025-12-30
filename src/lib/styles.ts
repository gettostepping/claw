export type CardStyle = 'standard' | 'brutal' | 'minimal' | 'neon' | 'soft';

interface StyleConfig {
    card: string;
    avatar: string;
    font: string;
    text: string;
    glow: string;
    borderWidth?: string;
    borderRadius?: string;
}

export function getCardStyles(style: string, accentColor: string): StyleConfig {
    const cardStyle = (style || 'standard') as CardStyle;

    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);

    const styles: Record<CardStyle, StyleConfig> = {
        standard: {
            card: "bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl",
            avatar: "rounded-full border-2 border-white/20",
            font: "",
            text: "text-white",
            glow: `shadow-[0_0_20px_rgba(${r},${g},${b},0.2)]`
        },
        brutal: {
            card: "rounded-none bg-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
            avatar: "rounded-none border-4 border-white",
            font: "font-mono tracking-widest uppercase",
            text: "text-white",
            glow: "",
            borderWidth: '4px'
        },
        minimal: {
            card: "rounded-xl bg-transparent border-none shadow-none text-center",
            avatar: "rounded-full border border-white/10",
            font: "font-light tracking-wide",
            text: "text-neutral-200",
            glow: ""
        },
        neon: {
            card: "rounded-xl bg-black/60 backdrop-blur-xl border-2 shadow-[0_0_30px_rgba(0,0,0,0.5)]",
            avatar: "rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.3)]",
            font: "font-sans tracking-tight",
            text: "text-white",
            glow: "", // Applied inline
            borderWidth: '2px'
        },
        soft: {
            card: "rounded-[3rem] bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
            avatar: "rounded-[2rem] border-4 border-white/50",
            font: "font-serif italic",
            text: "text-white",
            glow: ""
        }
    };

    return styles[cardStyle] || styles.standard;
}
