import { ReactNode } from "react";

interface NavbarProps {
    startContent?: ReactNode;
    endContent?: ReactNode;
}
export default function Navbar({ startContent, endContent }: NavbarProps) {
    return (
        <div className="h-10 w-full flex items-center justify-between m-4 px-3">
            <div>{startContent}</div>
            <div>{endContent}</div>
        </div>
    );
}
