'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface JoinInfo {
  session_id: number;
  zoom_link?: string;
  discord_invite_link?: string;
  price_per_seat: number;
}

export default function JoinClassPage() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get('code') || '';
  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!code) {
      setError('No invite code provided.');
      setLoading(false);
      return;
    }
    api
      .get<JoinInfo>(`/class/join?code=${code}`)
      .then((res) => {
        setInfo(res.data);
      })
      .catch((err) => {
        setError(err.response?.data.detail || err.message);
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Paid join?
  if (info!.price_per_seat > 0 && !info!.zoom_link && !info!.discord_invite_link) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold">Pay & Join</h1>
        <p className="mt-2">This class costs ${(info!.price_per_seat / 100).toFixed(2)}.</p>
        <Button
          className="mt-4"
          onClick={async () => {
            // re-trigger /class/book to generate a new checkout session
            const res = await api.post('/class/book', { student_id: 1, session_id: info!.session_id });
            const { stripe_checkout_url } = res.data;
            window.location.href = stripe_checkout_url;
          }}
        >
          Pay ${(info!.price_per_seat / 100).toFixed(2)}
        </Button>
      </div>
    );
  }

  // Already paid → show links
  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Classroom</h1>
      {info!.zoom_link && (
        <a
          href={info!.zoom_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600"
        >
          Join via Zoom
        </a>
      )}
      {info!.discord_invite_link && (
        <a
          href={info!.discord_invite_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-indigo-600"
        >
          Join Discord Channel
        </a>
      )}
      {!info!.zoom_link && !info!.discord_invite_link && (
        <p>No links available.</p>
      )}
    </div>
  );
}


// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import useSWR from "swr";
// import { Button } from "@/components/ui/button";

// const fetcher = (url: string) => fetch(url).then(res => res.json());

// export default function JoinClassPage() {
//   const params = useSearchParams();
//   const code = params.get("code") || "";
//   const { data: info, error } = useSWR(
//     code ? `/api/class/join?code=${code}` : null,
//     fetcher
//   );
//   const router = useRouter();

//   if (error) return <p className="text-red-600">{error.message}</p>;
//   if (!info) return <p>Loading…</p>;

//   const handlePay = async () => {
//     const res = await fetch("/api/class/join", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ invite_code: code }),
//     });
//     const { session_url } = await res.json();
//     window.location.href = session_url;
//   };

//   return (
//     <div className="max-w-lg mx-auto p-6 space-y-4">
//       <h1 className="text-2xl font-bold">Join Session</h1>
//       {info.zoom_link && (
//         <a
//           href={info.zoom_link}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="block text-blue-600"
//         >
//           Join via Zoom
//         </a>
//       )}
//       {info.discord_invite_link && (
//         <a
//           href={info.discord_invite_link}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="block text-indigo-600"
//         >
//           Join Discord Channel
//         </a>
//       )}
//       {!info.zoom_link && !info.discord_invite_link && (
//         <Button onClick={handlePay}>Pay & Join</Button>
//       )}
//     </div>
//   );
}