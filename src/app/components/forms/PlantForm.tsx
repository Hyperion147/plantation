"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Upload, Camera, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Panipat area bounds
const PANIPAT_BOUNDS = {
    minLat: 29.2,
    maxLat: 29.6,
    minLng: 76.7,
    maxLng: 77.2,
};

// All fields required
const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Plant name must be at least 2 characters." }),
    description: z.string().min(1, { message: "Description is required." }),
    image: z.instanceof(File, { message: "Plant image is required." }).or(z.undefined()),
    lat: z
        .number()
        .min(PANIPAT_BOUNDS.minLat, {
            message: `Latitude must be at least ${PANIPAT_BOUNDS.minLat} (Panipat area)`,
        })
        .max(PANIPAT_BOUNDS.maxLat, {
            message: `Latitude must be at most ${PANIPAT_BOUNDS.maxLat} (Panipat area)`,
        })
        .optional(),
    lng: z
        .number()
        .min(PANIPAT_BOUNDS.minLng, {
            message: `Longitude must be at least ${PANIPAT_BOUNDS.minLng} (Panipat area)`,
        })
        .max(PANIPAT_BOUNDS.maxLng, {
            message: `Longitude must be at most ${PANIPAT_BOUNDS.maxLng} (Panipat area)`,
        })
        .optional(),
});

interface PlantFormProps {
    userId?: string;
    userName: string;
}

export default function PlantForm({ userId, userName }: PlantFormProps) {

    const router = useRouter();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            lat: undefined,
            lng: undefined,
        },
    });

    const handleImageChange = (file: File) => {
        form.setValue("image", file, { shouldValidate: true });
        setPreviewImage(URL.createObjectURL(file));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Check if location is within Panipat bounds
                    if (
                        lat >= PANIPAT_BOUNDS.minLat &&
                        lat <= PANIPAT_BOUNDS.maxLat &&
                        lng >= PANIPAT_BOUNDS.minLng &&
                        lng <= PANIPAT_BOUNDS.maxLng
                    ) {
                        form.setValue("lat", lat);
                        form.setValue("lng", lng);
                        toast.success(
                            "Location captured! You are in Panipat area."
                        );
                    } else {
                        toast.error(
                            "Location is outside Panipat area. Please use coordinates within Panipat, Haryana."
                        );
                        // Clear the coordinates since they're outside bounds
                        form.setValue("lat", undefined);
                        form.setValue("lng", undefined);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error(
                        "Could not get your location. Please enter Panipat coordinates manually."
                    );
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!userId) {
            toast.error("You must be logged in to track plants");
            return;
        }

        if (!values.image) {
            toast.error("Plant image is required");
            return;
        }

        if (!values.lat || !values.lng) {
            toast.error("Latitude and longitude are required");
            return;
        }

        if (
            values.lat < PANIPAT_BOUNDS.minLat ||
            values.lat > PANIPAT_BOUNDS.maxLat ||
            values.lng < PANIPAT_BOUNDS.minLng ||
            values.lng > PANIPAT_BOUNDS.maxLng
        ) {
            toast.error("Plant location must be within Panipat, Haryana area");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append("lat", values.lat.toString());
            formData.append("lng", values.lng.toString());
            formData.append("userId", userId);
            formData.append("userName", userName);

            if (values.image) {
                formData.append("image", values.image);
            }

            const response = await fetch("/api/plants", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                let details = "";
                try {
                    const err = await response.json();
                    details = [err.error, err.details]
                        .filter(Boolean)
                        .join(" - ");
                } catch {}
                throw new Error(details || "Failed to create plant");
            }

            toast.success("Plant tracked successfully!", {
                description: `${values.name} has been added to your Panipat collection`,
            });

            // Reset form
            form.reset({
                name: "",
                description: "",
                lat: undefined,
                lng: undefined,
                image: undefined,
            });
            setPreviewImage(null);

            // Invalidate and refetch queries
            await queryClient.invalidateQueries({
                queryKey: ["userPlants"],
            });
            await queryClient.invalidateQueries({ queryKey: ["plants"] });

            // Refresh the page to update all components
            router.refresh();
        } catch (error) {
            console.error("Error creating plant:", error);
            toast.error("Failed to track plant", {
                description: "Please try again later",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                    Track a New Plant in Panipat
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                        Plants can only be tracked within Panipat, Haryana area
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                                         <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="space-y-6"
                     >


                        {/* Plant Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plant Name *</FormLabel>
                                    <FormControl>
                                                                                 <Input
                                             placeholder="Monstera Deliciosa"
                                             {...field}
                                             required
                                         />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                                                {/* Image Upload */}
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plant Image *</FormLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageChange(file);
                                                            field.onChange(file);
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground">
                                                Upload a photo of your plant (required)
                                            </p>
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        field.onChange(undefined);
                                                        setPreviewImage(null);
                                                    }}
                                                    className="w-full"
                                                >
                                                    Remove Image
                                                </Button>
                                            )}
                                        </div>
                                        {previewImage && (
                                            <div className="flex justify-center">
                                                <img
                                                    src={previewImage}
                                                    alt="Plant preview"
                                                    className="w-32 h-32 object-cover rounded-md border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                                                                 <Textarea
                                             placeholder="Describe your plant (species, care tips, etc.)"
                                             className="resize-none min-h-[100px]"
                                             {...field}
                                             required
                                         />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Location Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <FormLabel>
                                    Location (Panipat Area Only) *
                                </FormLabel>
                            </div>

                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <p className="text-sm text-emerald-800 mb-3">
                                    <strong>Panipat Area Bounds:</strong>
                                    <br />
                                    Latitude: {PANIPAT_BOUNDS.minLat}° to{" "}
                                    {PANIPAT_BOUNDS.maxLat}°<br />
                                    Longitude: {PANIPAT_BOUNDS.minLng}° to{" "}
                                    {PANIPAT_BOUNDS.maxLng}°
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="lat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">
                                                Latitude *
                                            </FormLabel>
                                            <FormControl>
                                                                                                                                                 <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder=""
                                                    {...field}
                                                    required
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lng"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">
                                                Longitude *
                                            </FormLabel>
                                            <FormControl>
                                                                                                                                                 <Input
                                                    type="number"
                                                    step="number"
                                                    placeholder=""
                                                    {...field}
                                                    required
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={getCurrentLocation}
                                className="w-full sm:w-auto"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Get My Location (Panipat Only)
                            </Button>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">↻</span>
                                    Tracking Plant in Panipat...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Track This Plant in Panipat
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
