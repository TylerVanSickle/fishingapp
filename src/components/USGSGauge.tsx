// Server component — fetches nearest USGS stream gauge data
import { Activity, Droplets, ArrowUpDown } from "lucide-react";

type USGSResponse = {
  value?: {
    timeSeries?: Array<{
      sourceInfo: { siteName: string };
      variable: { variableCode: Array<{ value: string }> };
      values: Array<{ value: Array<{ value: string; dateTime: string }> }>;
    }>;
  };
};

async function fetchGaugeData(lat: number, lng: number): Promise<{
  siteName: string;
  cfs: number | null;
  gageHt: number | null;
  dateTime: string | null;
} | null> {
  try {
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${(lng - 0.3).toFixed(4)},${(lat - 0.3).toFixed(4)},${(lng + 0.3).toFixed(4)},${(lat + 0.3).toFixed(4)}&parameterCd=00060,00065&siteType=ST`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return null;
    const data: USGSResponse = await res.json();

    const series = data.value?.timeSeries;
    if (!series || series.length === 0) return null;

    // Get first site name from any series entry
    const siteName = series[0].sourceInfo.siteName;

    let cfs: number | null = null;
    let gageHt: number | null = null;
    let dateTime: string | null = null;

    for (const ts of series) {
      const code = ts.variable.variableCode[0]?.value;
      const latestVal = ts.values[0]?.value[0];
      if (!latestVal) continue;

      const parsed = parseFloat(latestVal.value);
      if (isNaN(parsed)) continue;

      if (code === "00060") {
        cfs = parsed;
        dateTime = latestVal.dateTime;
      } else if (code === "00065") {
        gageHt = parsed;
        if (!dateTime) dateTime = latestVal.dateTime;
      }
    }

    return { siteName, cfs, gageHt, dateTime };
  } catch {
    return null;
  }
}

function formatDateTime(dt: string): string {
  try {
    return new Date(dt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dt;
  }
}

export default async function USGSGauge({ lat, lng }: { lat: number; lng: number }) {
  const gauge = await fetchGaugeData(lat, lng);
  if (!gauge) return null;

  const { siteName, cfs, gageHt, dateTime } = gauge;
  if (cfs === null && gageHt === null) return null;

  return (
    <div className="p-4 rounded-xl border border-white/8 bg-white/2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-cyan-400" />
          <span className="text-sm font-medium text-slate-200">Stream Conditions</span>
        </div>
        <span className="text-xs text-slate-600 text-right max-w-[160px] truncate" title={siteName}>
          {siteName}
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {cfs !== null && (
          <div className="flex items-center gap-1.5">
            <Droplets size={13} className="text-blue-400" />
            <span className="text-lg font-bold text-white">{Math.round(cfs)}</span>
            <span className="text-xs text-slate-500">CFS</span>
          </div>
        )}
        {gageHt !== null && (
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={13} className="text-emerald-400" />
            <span className="text-lg font-bold text-white">{gageHt.toFixed(1)}</span>
            <span className="text-xs text-slate-500">ft</span>
          </div>
        )}
        {dateTime && (
          <span className="text-xs text-slate-600 ml-auto">{formatDateTime(dateTime)}</span>
        )}
      </div>
    </div>
  );
}
