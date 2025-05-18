import { NextResponse } from "next/server";

export async function GET() {
  const healthCheck = {
    status: "ok",
    uptime: process.uptime().toLocaleString(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(healthCheck, { status: 200 });
}
