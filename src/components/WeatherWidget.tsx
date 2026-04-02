// Server component — fetches weather from Open-Meteo (free, no API key)
import { Wind, Thermometer, Cloud, Sun, CloudRain, CloudSnow, Zap } from "lucide-react";

type WeatherData = {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    cloud_cover: number;
  };
};

function weatherInfo(code: number): { label: string; icon: React.ElementType; color: string } {
  if (code === 0) return { label: "Clear sky", icon: Sun, color: "text-yellow-400" };
  if (code <= 2) return { label: "Partly cloudy", icon: Cloud, color: "text-slate-300" };
  if (code <= 3) return { label: "Overcast", icon: Cloud, color: "text-slate-400" };
  if (code <= 49) return { label: "Foggy", icon: Cloud, color: "text-slate-500" };
  if (code <= 59) return { label: "Drizzle", icon: CloudRain, color: "text-cyan-400" };
  if (code <= 69) return { label: "Rain", icon: CloudRain, color: "text-blue-400" };
  if (code <= 79) return { label: "Snow", icon: CloudSnow, color: "text-sky-300" };
  if (code <= 84) return { label: "Rain showers", icon: CloudRain, color: "text-blue-400" };
  if (code <= 86) return { label: "Snow showers", icon: CloudSnow, color: "text-sky-300" };
  if (code <= 99) return { label: "Thunderstorm", icon: Zap, color: "text-yellow-400" };
  return { label: "Unknown", icon: Cloud, color: "text-slate-400" };
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,weather_code,cloud_cover&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=America/Denver`;
    const res = await fetch(url, { next: { revalidate: 1800 } }); // cache 30 min
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function WeatherWidget({
  lat,
  lng,
  spotName,
}: {
  lat: number;
  lng: number;
  spotName: string;
}) {
  const weather = await fetchWeather(lat, lng);
  if (!weather) return (
    <div className="p-4 rounded-xl border border-white/8 bg-white/2 flex items-center gap-3 text-slate-600">
      <Cloud size={16} className="shrink-0" />
      <span className="text-sm">Weather unavailable</span>
    </div>
  );

  const { temperature_2m, wind_speed_10m, weather_code } = weather.current;
  const { label, icon: WeatherIcon, color } = weatherInfo(weather_code);

  return (
    <div className="p-4 rounded-xl border border-white/8 bg-white/2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WeatherIcon size={18} className={color} />
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
        <span className="text-xs text-slate-600">Current at {spotName}</span>
      </div>
      <div className="flex items-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <Thermometer size={13} className="text-orange-400" />
          <span className="text-xl font-bold text-white">{Math.round(temperature_2m)}°F</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Wind size={13} className="text-blue-400" />
          <span>{Math.round(wind_speed_10m)} mph</span>
        </div>
      </div>
    </div>
  );
}
