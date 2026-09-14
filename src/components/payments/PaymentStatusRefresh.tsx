"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentStatusRefresh() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 5) window.clearInterval(timer);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}
