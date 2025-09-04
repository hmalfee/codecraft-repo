"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const { mutate: logout } = api.auth.logout.useMutation({
        onSuccess: () => {
            router.push("/login");
        },
        onError: () => {
            setIsLoading(false);
        },
    });

    return (
        <Button
            variant="outline"
            onClick={() => {
                setIsLoading(true);
                logout();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 dark:hover:bg-destructive"
        >
            <LogOut className="h-4 w-4" />
            {isLoading ? "Logging out..." : "Logout"}
        </Button>
    );
}
