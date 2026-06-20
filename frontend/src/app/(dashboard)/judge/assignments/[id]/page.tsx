"use client";

import { useParams } from "next/navigation";
import { EvaluationSubmit } from "../../../../../components/judge/EvaluationSubmit";

export default function AssignmentEvaluation() {
  const { id } = useParams();
  return (
    <div className="space-y-6">
      <EvaluationSubmit evaluationId={id as string} />
    </div>
  );
}
