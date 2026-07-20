import { NextResponse } from "next/server";
import { getAllSports } from "@/lib/the-odds-api";

export async function GET() {
  try {
    const sports = await getAllSports();
    return NextResponse.json(sports);
  } catch (error) {
    console.error("Sports API Error:", error);
    return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
  }
}
