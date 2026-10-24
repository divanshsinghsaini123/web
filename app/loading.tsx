import React from "react";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return <UniversalLoader fullScreen label="Syncing Audio Telemetry..." />;
}
