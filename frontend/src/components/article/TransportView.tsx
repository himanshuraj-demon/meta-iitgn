"use client";

import React, { useState, useMemo } from "react";
import { Bus, Clock, ArrowRight, Route, X } from "lucide-react";
import {
  TransportTrip,
  parseTransport,
  tripTimeToMinutes,
  lineTheme,
  lineActiveTheme,
  formatRoute,
} from "@/lib/transport";

interface TransportViewProps {
  content?: string | null;
}

interface RouteOption {
  from: string;
  to: string;
  label: string;
}

/**
 * Read-only structured view of the campus transport schedule.
 *
 * A **Routes** filter at the top lists every unique from→to route (e.g.
 * "(Kudasan-Palaj)") as a toggle button. Tapping a route shows only the trips
 * that run on that exact route; tapping it again clears the filter. Matching
 * trips are grouped by bus line, each on two lines:
 *   · time · route (from → to)            ← line 1
 *   · Via: …                              ← line 2 (when present)
 *
 * Used both inline on the campus-transport wiki page and inside the
 * TransportOverlay view mode.
 */
export default function TransportView({ content }: TransportViewProps) {
  const lines = parseTransport(content ?? "");

  // Unique routes (from→to pairs) across the whole schedule, de-duplicated.
  const routes = useMemo<RouteOption[]>(() => {
    const seen = new Set<string>();
    const list: RouteOption[] = [];
    for (const line of lines) {
      for (const slot of line.slots) {
        for (const t of slot.trips) {
          const key = `${t.from}|${t.to ?? ""}`;
          if (seen.has(key)) continue;
          seen.add(key);
          list.push({ from: t.from, to: t.to ?? "", label: formatRoute(t) });
        }
      }
    }
    return list;
  }, [lines]);

  const [routeQ, setRouteQ] = useState<RouteOption | null>(null);
  const toggleRoute = (r: RouteOption) =>
    setRouteQ(routeQ && routeQ.from === r.from && routeQ.to === r.to ? null : r);

  const tripMatches = (trip: TransportTrip) =>
    !routeQ ||
    (trip.from === routeQ.from && (trip.to ?? "") === routeQ.to);

  const filteredLines = lines
    .map((line) => ({
      line,
      trips: line.slots.flatMap((s) => s.trips).filter(tripMatches),
    }))
    .filter((l) => l.trips.length > 0);

  // The single soonest upcoming trip across the whole schedule — flagged with a
  // "NEXT" badge in the read view (presentational only, mirrors the mockup).
  const nowMinutes = (() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  })();
  const nextTripRef: TransportTrip | null = (() => {
    const parsed = lines
      .flatMap((l) => l.slots.flatMap((s) => s.trips))
      .map((t) => ({ t, m: tripTimeToMinutes(t.time) }))
      .filter((x) => x.m !== null) as { t: TransportTrip; m: number }[];
    if (parsed.length === 0) return null;
    const upcoming = parsed.filter((x) => x.m >= nowMinutes).sort((a, b) => a.m - b.m);
    return (upcoming[0] ?? [...parsed].sort((a, b) => a.m - b.m)[0]).t;
  })();

  if (lines.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-base-300 rounded-2xl">
        <p className="text-base-content/60 font-medium">Transport schedule not available yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Route filter (unique from→to routes as toggle buttons) ─────────── */}
      {routes.length > 0 && (
        <div className="mb-5">
          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <Route className="h-3 w-3" /> Routes
          </label>
          <div className="flex flex-wrap gap-1.5">
            {routes.map((r) => {
              const selected =
                routeQ !== null && routeQ.from === r.from && routeQ.to === r.to;
              return (
                <button
                  key={`${r.from}|${r.to}`}
                  onClick={() => toggleRoute(r)}
                  aria-pressed={selected}
                  className={`relative inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-all ${
                    selected
                      ? "bg-primary text-primary-content border-primary shadow-sm"
                      : "bg-base-100 border-base-300 text-base-content/70 hover:border-primary/50"
                  }`}
                >
                  {r.label}
                  {selected && (
                    <X className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-base-300 bg-base-100 text-base-content/70 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Matching trips, grouped by line ────────────────────────────────── */}
      {filteredLines.length === 0 ? (
        <p className="text-sm text-base-content/50 italic px-1">
          No trips {routeQ && `on route “${routeQ.label}”`} in the current schedule.
        </p>
      ) : (
        filteredLines.map(({ line, trips }, i) => (
          <div key={i} className="mb-5 last:mb-0">
            {/* Bus line banner (mirrors the mockup's dark bus-type bar) */}
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black tracking-wide ${lineActiveTheme(i)}`}
              >
                <Bus className="h-3.5 w-3.5" />
                {line.name}
              </span>
              {line.note && (
                <span className="truncate text-[11px] font-semibold text-base-content/50">
                  · {line.note}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {trips.map((trip, ti) => {
                const isNext = nextTripRef != null && trip === nextTripRef;
                return (
                  <div
                    key={ti}
                    className={`relative overflow-hidden rounded-2xl border p-3 transition-colors ${
                      isNext
                        ? "border-secondary/40 bg-secondary/5"
                        : "border-base-200 bg-base-100 hover:border-secondary/30"
                    }`}
                  >
                    {/* Left accent bar for the next departure */}
                    {isNext && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-secondary" />
                    )}
                    <div className="flex items-center gap-3">
                      <span className="inline-flex w-[104px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-base-200 px-3 py-1.5 text-[13px] font-bold text-base-content">
                        <Clock className="h-4 w-4" />
                        {trip.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-bold text-sm text-base-content">
                            {trip.from}
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-base-content/30" />
                          <span className="truncate font-bold text-sm text-base-content">
                            {trip.to ?? "—"}
                          </span>
                        </div>
                        {trip.via?.trim() && (
                          <span
                            className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${lineTheme(i)}`}
                          >
                            Via: {trip.via.trim()}
                          </span>
                        )}
                      </div>
                      {isNext && (
                        <span className="badge badge-secondary font-mono text-[9px] tracking-widest uppercase shrink-0">
                          Next
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </>
  );
}
