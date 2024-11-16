import { cn } from "@nextui-org/theme";

interface IconButtonProps {
    icon: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}
export default function IconButton({ icon, disabled, onClick }: IconButtonProps) {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
            className={cn("transition-opacity duration-100 active:opacity-50", { "opacity-50": disabled })}
            onClick={!disabled ? onClick : undefined}
        >
            {icon}
        </div>
    );
}
