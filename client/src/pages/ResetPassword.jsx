import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/features/api/authApi";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (password !== confirm) { setError("Passwords do not match."); return; }
        try {
            await resetPassword({ token, password }).unwrap();
            navigate("/login", { state: { resetDone: true } });
        } catch (err) {
            setError(err?.data?.message || "That reset link is invalid or expired. Request a new one.");
        }
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[70vh] px-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <h1 className="text-xl font-semibold mb-4">Choose a new password</h1>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="rp-pass">New password</Label>
                            <Input id="rp-pass" required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="rp-pass2">Confirm new password</Label>
                            <Input id="rp-pass2" required minLength={8} autoComplete="new-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                        </div>
                        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                        <Button disabled={isLoading} type="submit" className="w-full">{isLoading ? "Saving..." : "Save new password"}</Button>
                        <Link to="/forgot-password" className="block text-center text-sm text-primary underline">Request a new link</Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
