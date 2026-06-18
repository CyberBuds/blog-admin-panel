"use client";
import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  initials: string;
  size?: number;
}

export default function Avatar({ name, avatarUrl, initials, size = 36 }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className="rounded-full object-cover ring-2 ring-indigo-500/30 ring-offset-1 dark:ring-offset-gray-950"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600
                 flex items-center justify-center text-white font-bold
                 ring-2 ring-indigo-500/30 ring-offset-1
                 dark:ring-offset-gray-950 select-none tracking-wide"
    >
      {initials}
    </div>
  );
}