import IconButton from "./iconButton";
import { Card, CardBody } from "@nextui-org/card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface StatementItemProps {
    title: string;
    amount: number;
    onClick?: () => void;
}
export default function StatementItem({ title, amount, onClick }: StatementItemProps) {
    return (
        <Card isPressable className="h-20" onPress={onClick}>
            <CardBody className="flex flex-row items-center justify-between">
                <div>
                    <p>{title}</p>
                    <p className="text-sm opacity-50">
                        {amount} <span className="font-bold">WLD</span>
                    </p>
                </div>
                <IconButton icon={<ChevronRightIcon className="size-6" />} />
            </CardBody>
        </Card>
    );
}
