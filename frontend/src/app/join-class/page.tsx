"use client";

import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function JoinClassPage() {
  const params = useSearchParams();
  const code = params.get("code") || "";
  const { data: info, error } = useSWR(
    code ? `/api/class/join?code=${code}` : null,
    fetcher
  );
  const router = useRouter();

  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!info) return <p>Loading…</p>;

  const handlePay = async () => {
    const res = await fetch("/api/class/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_code: code }),
    });
    const { session_url } = await res.json();
    window.location.href = session_url;
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Join Session</h1>
      {info.zoom_link && (
        <a
          href={info.zoom_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600"
        >
          Join via Zoom
        </a>
      )}
      {info.discord_invite_link && (
        <a
          href={info.discord_invite_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-indigo-600"
        >
          Join Discord Channel
        </a>
      )}
      {!info.zoom_link && !info.discord_invite_link && (
        <Button onClick={handlePay}>Pay & Join</Button>
      )}
    </div>
  );
}