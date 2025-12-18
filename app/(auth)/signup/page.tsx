"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/new");
      router.refresh();
    }
  };

  return (
    <Card className="zen-card">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl font-display">Begin your journey</CardTitle>
        <CardDescription className="text-base">
          Create an account to start your mindfulness practice
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="rounded-xl h-11 px-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="rounded-xl h-11 px-4"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-5 pt-2">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-medium hover:scale-[1.02] transition-all"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
          <div className="space-y-3 text-center w-full">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground/80 italic">
              Private by default. Stored only in your account.
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
