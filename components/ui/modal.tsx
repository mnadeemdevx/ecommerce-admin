"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
    title: string;
    description: string;
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export const Modal = ({
    title,
    description,
    isOpen,
    onClose,
    children,
}: ModalProps) => {
    const onChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div>{children}</div>
            </DialogContent>
            <DialogOverlay className="bg-white fixed inset-0 bg-opacity-50 backdrop-blur" />
        </Dialog>
    );
};
