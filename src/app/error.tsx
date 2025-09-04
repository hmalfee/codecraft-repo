"use client";
import { api } from "@/lib/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { mutate: reportClientError } = api.reportClientError.useMutation();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        reportClientError({
            message: error.message,
            name: error.name,
            stack: error.stack ?? "",
            digest: error.digest,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center p-6 gap-4">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground">
                An unexpected error occurred.
            </p>
            <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={() => {
                    startTransition(() => {
                        router.refresh();
                        reset();
                    });
                }}
                disabled={isPending}
            >
                Try again
            </button>
        </div>
    );
}
