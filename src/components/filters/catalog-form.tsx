"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function CatalogForm({ children, className }: { children: React.ReactNode; className?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleSliderCommit = () => {
      if (formRef.current) formRef.current.requestSubmit();
    };
    window.addEventListener("slider-commit", handleSliderCommit);
    return () => window.removeEventListener("slider-commit", handleSliderCommit);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    
    // Filter out empty params
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        params.append(key, value.toString());
      }
    });

    router.push(`/catalog?${params.toString()}`, { scroll: false });
  };

  return (
    <form
      ref={formRef}
      className={className}
      action="/catalog"
      method="get"
      onChange={() => {
        if (formRef.current) formRef.current.requestSubmit();
      }}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}
