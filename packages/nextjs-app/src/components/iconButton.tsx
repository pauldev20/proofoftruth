interface IconButtonProps {
    icon: React.ReactNode;
    onClick?: () => void;
}
export default function IconButton({ icon, onClick }: IconButtonProps) {
    return (
        <div className="transition-opacity duration-100 active:opacity-50" onClick={onClick}>
            {icon}
        </div>
    );
}
