"use client";

import { useParams } from "next/navigation";
import { ReviewerAssignment } from "../../../../../../components/organizer/ReviewerAssignment";

export default function ReviewersPage() {
  const { id } = useParams();
  return <ReviewerAssignment hackathonId={id as string} onRefresh={() => {}} />;
}
