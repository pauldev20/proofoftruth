import IconButton from "./iconButton";
import { Card, CardBody } from "@nextui-org/card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface StatementItemProps {
    onClick?: () => void;
}
export default function StatementItem({ onClick }: StatementItemProps) {
    return (
        <Card isPressable className="h-20" onPress={onClick}>
            <CardBody className="flex flex-row items-center justify-between">
                <div>
                    <p>Test Question?</p>
                    <p className="text-sm opacity-50">
                        100.000 <span className="font-bold">WLD</span>
                    </p>
                </div>
                <IconButton icon={<ChevronRightIcon className="size-6" />} />
            </CardBody>
        </Card>
    );
}
