import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/auth-ui";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Tether" },
      { name: "description", content: "You caught the button. Your Tether account overview." },
      { property: "og:title", content: "Your dashboard — Tether" },
      { property: "og:description", content: "Signed in to Tether." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || !active) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (active) {
        setName(
          profile?.display_name ||
            (user.user_metadata as { display_name?: string } | null)?.display_name ||
            "friend",
        );
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out. The button is feral again.");
    void navigate({ to: "/", replace: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="surface-card w-full max-w-md rounded-3xl px-6 py-9 sm:px-8">
        <BrandMark />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          <span className="text-gradient-title">You caught it.</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Welcome{name ? `, ${name}` : ""}. You are signed in with a real, persistent session — refresh the page
          and you will stay here.
        </p>

        <dl className="mt-7 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <dt className="text-muted-foreground">Display name</dt>
            <dd className="font-medium">{name || "—"}</dd>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{email || "—"}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={signOut}
          className="mt-7 h-11 w-full rounded-xl border border-border text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
