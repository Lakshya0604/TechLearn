import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/features/api/authApi";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    async function submit(e) {
        e.preventDefault();
        setError("");
        try {
            await forgotPassword({ email }).unwrap();
            setDone(true);
        } catch (err) {
            setError(err?.data?.message || "Something went wrong. Please try again.");
        }
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[70vh] px-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <h1 className="text-xl font-semibold mb-2">Reset your password</h1>
                    {done ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">If an account exists for {email}, a reset link is on its way. It works for 30 minutes. Check spam too.</p>
                            <Link to="/login" className="text-sm text-primary underline">Back to login</Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <p className="text-sm text-muted-foreground">Enter your account email and we will send you a reset link.</p>
                            <div className="space-y-1">
                                <Label htmlFor="fp-email">Email</Label>
                                <Input id="fp-email" required autoComplete="email" type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                            <Button disabled={isLoading} type="submit" className="w-full">{isLoading ? "Sending..." : "Send reset link"}</Button>
                            <Link to="/login" className="block text-center text-sm text-primary underline">Back to login</Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
