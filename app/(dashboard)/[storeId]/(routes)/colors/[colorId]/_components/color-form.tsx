"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import * as z from "zod";
import toast from "react-hot-toast";
import { Color } from "@prisma/client";
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

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(4).regex(/^#/, {
        message:
            "Color value must be a valid hexadecimal color code starting with #",
    }),
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
    initialData: Color | null;
}

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
    const router = useRouter();
    const params = useParams();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const title = initialData ? "Edit color" : "Create color";
    const description = initialData ? "Edit a color" : "Add a new color";
    const toastMessage = initialData ? "Color updated" : "Color created";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        },
    });

    const onSubmit = async (values: ColorFormValues) => {
        try {
            setIsLoading(true);
            if (initialData) {
                await axios.patch(
                    `/api/${params.storeId}/colors/${params.colorId}`,
                    values,
                );
            } else {
                await axios.post(`/api/${params.storeId}/colors`, values);
            }
            toast.success(toastMessage);
            router.push(`/${params.storeId}/colors`);
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
                `/api/${params.storeId}/colors/${params.colorId}`,
            );
            toast.success("Color deleted");
            router.push(`/${params.storeId}/colors`);
            router.refresh();
        } catch (err) {
            toast.error(
                "Make sure you removed all products using this color first.",
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
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Color name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-x-4">
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Color value"
                                                {...field}
                                            />
                                            <div
                                                className="border p-4 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        field.value,
                                                }}
                                            />
                                        </div>
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
