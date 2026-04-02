"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import DeleteCatchButton from "./DeleteCatchButton";
import EditCatchModal from "./EditCatchModal";
import PrivacyToggleButton from "./PrivacyToggleButton";

type CatchData = {
  id: string;
  caught_at: string;
  weight_lbs: number | null;
  length_in: number | null;
  notes: string | null;
  fish_id: string;
  spot_id: string;
  bait_id: string | null;
};

type Props = {
  catchId: string;
  spotId: string;
  isPrivate: boolean;
  catchData: CatchData;
  fishName: string;
  spotName: string;
};

export default function CatchActions({ catchId, spotId, isPrivate, catchData, fishName, spotName }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <PrivacyToggleButton catchId={catchId} isPrivate={isPrivate} />
      <button
        onClick={() => setEditing(true)}
        className="p-1.5 rounded-lg text-slate-700 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
        title="Edit catch"
      >
        <Pencil size={13} />
      </button>
      <DeleteCatchButton catchId={catchId} spotId={spotId} />
      {editing && (
        <EditCatchModal
          catch_={{ ...catchData, fish_name: fishName, spot_name: spotName }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
