"use client";

import { DotLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-amber-50/10">
      <DotLoader color="#D97706" size={60} />
    </div>
  );
}
