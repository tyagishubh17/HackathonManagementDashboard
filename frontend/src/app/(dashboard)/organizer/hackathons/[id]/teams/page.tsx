"use client";

import { useParams } from "next/navigation";
import { TeamManager } from "../../../../../../components/organizer/TeamManager";

export default function TeamsPage() {
  const { id } = useParams();
  return <TeamManager hackathonId={id as string} />;
}
