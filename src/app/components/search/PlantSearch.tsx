// app/components/PlantSearch.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Search, User, Calendar, MapPin, X, Loader2 } from "lucide-react";
import { Plant } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Debounce hook with improved implementation
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function PlantSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Increased to 500ms for better UX

    // Track if user is currently typing
    useEffect(() => {
        setIsTyping(searchTerm !== debouncedSearchTerm);
    }, [searchTerm, debouncedSearchTerm]);

    const {
        data: plants,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["search", debouncedSearchTerm],
        queryFn: async (): Promise<Plant[]> => {
            if (!debouncedSearchTerm.trim()) return [];

            const response = await fetch(
                `/api/search?q=${encodeURIComponent(
                    debouncedSearchTerm.trim()
                )}`
            );
            if (!response.ok) {
                throw new Error("Failed to search plants");
            }
            return await response.json();
        },
        enabled: debouncedSearchTerm.trim().length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });

    // Handle search errors
    useEffect(() => {
        if (error) {
            console.error("Search error:", error);
            toast.error("Failed to search plants. Please try again.");
        }
    }, [error]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
        },
        []
    );

    const clearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    // Memoize search results to prevent unnecessary re-renders
    const searchResults = useMemo(() => {
        if (!plants) return [];
        return plants;
    }, [plants]);

    const showLoading = isLoading || isTyping;
    const hasResults = searchResults && searchResults.length > 0;
    const hasSearched = debouncedSearchTerm.trim().length > 0;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative mb-6">
                <Input
                    placeholder="Search by name, description, user, or PID..."
                    className="pl-4 pr-12 h-12 text-base"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className="my-2">
                    <p className="text-xs text-muted-foreground">You can search by Plant PID, name, description, or user.</p>
                </div>
            </div>

            {/* Loading skeleton */}
            {showLoading && (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Search results */}
            {!showLoading && hasResults && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Found {searchResults.length} plant
                            {searchResults.length !== 1 ? "s" : ""} for &quot;
                            {debouncedSearchTerm}&quot;
                        </p>
                        <Link href="/map">
                            <Button variant="outline" size="sm">
                                View All on Map
                            </Button>
                        </Link>
                    </div>

                    {searchResults.map((plant) => (
                        <Card
                            key={plant.id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    {plant.image_url ? (
                                        <img
                                            src={plant.image_url}
                                            alt={plant.name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                                e.currentTarget.nextElementSibling?.classList.remove(
                                                    "hidden"
                                                );
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-md flex items-center justify-center flex-shrink-0 ${
                                            plant.image_url ? "hidden" : ""
                                        }`}
                                    >
                                        <MapPin className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base sm:text-lg truncate">
                                                    {plant.name}
                                                </h3>
                                                {plant.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                        {plant.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                                <span className="text-blue-600 font-semibold">
                                                    PID: {plant.pid}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span className="truncate">
                                                    {plant.user_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {new Date(
                                                        plant.created_at
                                                    ).toLocaleDateString()} at {new Date(
                                                        plant.created_at
                                                    ).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>

                                        {plant.lat && plant.lng && (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                    {plant.lat.toFixed(4)},{" "}
                                                    {plant.lng.toFixed(4)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* No results */}
            {!showLoading && hasSearched && !hasResults && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-2">No plants found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            No plants found for &quot;{debouncedSearchTerm}
                            &quot;. Try searching with different keywords.
                        </p>
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Try searching for:
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[
                                    "Monstera",
                                    "Fiddle Leaf",
                                    "Snake Plant",
                                    "Pothos",
                                    "ZZ Plant",
                                ].map((suggestion) => (
                                    <Button
                                        key={suggestion}
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setSearchTerm(suggestion)
                                        }
                                        className="text-xs"
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href="/map">
                                <Button variant="outline" size="sm">
                                    Browse All Plants
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
