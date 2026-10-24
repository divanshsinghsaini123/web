import React from "react";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";

export default function DashboardLoading() {
  return <UniversalLoader fullScreen label="Loading Real-Time Telemetry..." />;
}
