"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { rateSpot } from "@/lib/actions/social";
import { useToast } from "@/components/ui/Toaster";

interface Props {
  spotId: string;
  avgRating: number | null;
  totalRatings: number;
  userRating: number | null;
  canRate: boolean;
}

export default function SpotRating({ spotId, avgRating, totalRatings, userRating, canRate }: Props) {
  const [hovered, setHovered] = useState(0);
  const [optimistic, setOptimistic] = useState<number | null>(userRating);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleRate(rating: number) {
    if (!canRate) return;
    setOptimistic(rating);
    startTransition(async () => {
      try {
        await rateSpot(spotId, rating);
        toast(`Rated ${rating} star${rating !== 1 ? "s" : ""}!`);
      } catch {
        toast("Could not save rating", "error");
      }
    });
  }

  const display = hovered || optimistic;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!canRate || isPending}
            onClick={() => handleRate(star)}
            onMouseEnter={() => canRate && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="disabled:cursor-default transition-transform hover:scale-110 active:scale-95"
            title={canRate ? `Rate ${star} star${star !== 1 ? "s" : ""}` : "Sign in to rate"}
          >
            <Star
              size={20}
              className={`transition-colors ${
                star <= (display ?? 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-slate-600"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-slate-500">
        {avgRating != null
          ? <><span className="text-slate-300 font-medium">{avgRating.toFixed(1)}</span> ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</>
          : "No ratings yet"
        }
      </span>
    </div>
  );
}
