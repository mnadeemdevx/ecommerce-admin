"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import * as z from "zod";
import toast from "react-hot-toast";
import { Billboard } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { ImageUplaod } from "@/components/ui/image-upload";

const formSchema = z.object({
    label: z.string().min(1, {
        message: "Label is required",
    }),
    imageUrl: z.string().min(1, {
        message: "Image is required",
    }),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
    initialData: Billboard | null;
}

export const BillboardForm: React.FC<BillboardFormProps> = ({
    initialData,
}) => {
    const router = useRouter();
    const params = useParams();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const title = initialData ? "Edit billboard" : "Create billboard";
    const description = initialData
        ? "Edit a billboard"
        : "Add a new billboard";
    const toastMessage = initialData
        ? "Billboard updated"
        : "Billboard created";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: "",
            imageUrl: "",
        },
    });

    const onSubmit = async (values: BillboardFormValues) => {
        try {
            setIsLoading(true);
            if (initialData) {
                await axios.patch(
                    `/api/${params.storeId}/billboards/${params.billboardId}`,
                    values,
                );
            } else {
                await axios.post(`/api/${params.storeId}/billboards`, values);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/billboards`);
            router.refresh();
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(
                `/api/${params.storeId}/billboards/${params.billboardId}`,
            );
            toast.success("Billboard deleted");
            router.push(`/${params.storeId}/billboards`);
            router.refresh();
        } catch (err) {
            toast.error(
                "Make sure you removed all categories using this billboard first.",
            );
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={title} description={description} />
                {initialData && (
                    <Button
                        disabled={isLoading}
                        variant="destructive"
                        size="icon"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 w-full"
                >
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background image</FormLabel>
                                <FormControl>
                                    <ImageUplaod
                                        value={field.value ? [field.value] : []}
                                        disabled={isLoading}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Billboard label"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button
                        disabled={isLoading}
                        className="ml-auto"
                        type="submit"
                    >
                        {action}
                    </Button>
                </form>
            </Form>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                isLoading={isLoading}
            />
        </>
    );
};
