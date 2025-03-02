"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ImageUplaodProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

export const ImageUplaod: React.FC<ImageUplaodProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    };

    if (!isMounted) {
        return null;
    }

    console.log("check values ------------>", value);

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value?.length > 0 &&
                    value?.map((url) => (
                        <div
                            key={url}
                            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
                        >
                            <div className="z-10 absolute top-2 right-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        onRemove(url);
                                    }}
                                    variant="destructive"
                                    size="icon"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                            <Image
                                fill
                                className="object-cover"
                                alt="Image"
                                src={url}
                            />
                        </div>
                    ))}
                <CldUploadWidget
                    onSuccess={onUpload}
                    uploadPreset="zesyrg9h"
                    options={{ multiple: true }}
                >
                    {({ open }) => {
                        const onClick = () => {
                            open();
                        };
                        return (
                            <Button
                                type="button"
                                disabled={disabled}
                                variant="secondary"
                                onClick={onClick}
                            >
                                <ImagePlus className="h-4 w-4 mr-2" />
                                Upload an Image
                            </Button>
                        );
                    }}
                </CldUploadWidget>
            </div>
        </div>
    );
};
