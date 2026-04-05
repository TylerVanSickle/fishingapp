"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import MapGL, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Spot } from "@/types/database";
import SpotPanel from "./SpotPanel";
import { LocateFixed, ChevronDown, Layers, Flame, RotateCcw, X, Fish, MapPin, Home } from "lucide-react";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";
import Link from "next/link";

type WaterBodyPanel = {
  name: string;
  lat: number;
  lng: number;
  nearbySpots: SpotWithFish[];
};

const MAP_STYLES = [
  { id: "outdoors",  label: "Outdoors",  style: "mapbox://styles/mapbox/outdoors-v12" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "streets",   label: "Streets",   style: "mapbox://styles/mapbox/streets-v12" },
];

type SpotWithFish = Spot & {
  spot_fish: { fish_species: { id: string; name: string } | null }[];
};

const US_CENTER = { longitude: -98.58, latitude: 39.83, zoom: 4 };

const STATE_CENTERS: Record<string, { longitude: number; latitude: number; zoom: number }> = {
  Alabama: { longitude: -86.79, latitude: 32.81, zoom: 7 },
  Arizona: { longitude: -111.65, latitude: 34.05, zoom: 7 },
  Arkansas: { longitude: -92.37, latitude: 34.97, zoom: 7 },
  California: { longitude: -119.68, latitude: 36.78, zoom: 6 },
  Colorado: { longitude: -105.55, latitude: 39.06, zoom: 7 },
  Connecticut: { longitude: -72.76, latitude: 41.60, zoom: 9 },
  Delaware: { longitude: -75.51, latitude: 39.32, zoom: 9 },
  Florida: { longitude: -81.52, latitude: 27.99, zoom: 7 },
  Georgia: { longitude: -83.44, latitude: 32.16, zoom: 7 },
  Idaho: { longitude: -114.48, latitude: 44.07, zoom: 7 },
  Illinois: { longitude: -88.99, latitude: 40.35, zoom: 7 },
  Indiana: { longitude: -86.13, latitude: 40.27, zoom: 7 },
  Iowa: { longitude: -93.21, latitude: 42.01, zoom: 7 },
  Kansas: { longitude: -98.48, latitude: 38.53, zoom: 7 },
  Kentucky: { longitude: -84.27, latitude: 37.64, zoom: 7 },
  Louisiana: { longitude: -91.87, latitude: 31.24, zoom: 7 },
  Maine: { longitude: -69.38, latitude: 45.37, zoom: 7 },
  Maryland: { longitude: -76.80, latitude: 39.05, zoom: 8 },
  Massachusetts: { longitude: -71.53, latitude: 42.41, zoom: 8 },
  Michigan: { longitude: -85.60, latitude: 44.31, zoom: 7 },
  Minnesota: { longitude: -94.30, latitude: 46.39, zoom: 7 },
  Mississippi: { longitude: -89.68, latitude: 32.35, zoom: 7 },
  Missouri: { longitude: -92.29, latitude: 38.46, zoom: 7 },
  Montana: { longitude: -110.45, latitude: 46.96, zoom: 6 },
  Nebraska: { longitude: -99.90, latitude: 41.49, zoom: 7 },
  Nevada: { longitude: -116.42, latitude: 38.50, zoom: 7 },
  "New Hampshire": { longitude: -71.56, latitude: 43.45, zoom: 8 },
  "New Jersey": { longitude: -74.40, latitude: 40.06, zoom: 8 },
  "New Mexico": { longitude: -106.11, latitude: 34.31, zoom: 7 },
  "New York": { longitude: -75.50, latitude: 42.94, zoom: 7 },
  "North Carolina": { longitude: -79.81, latitude: 35.63, zoom: 7 },
  "North Dakota": { longitude: -100.47, latitude: 47.53, zoom: 7 },
  Ohio: { longitude: -82.76, latitude: 40.39, zoom: 7 },
  Oklahoma: { longitude: -97.09, latitude: 35.57, zoom: 7 },
  Oregon: { longitude: -120.55, latitude: 44.10, zoom: 7 },
  Pennsylvania: { longitude: -77.21, latitude: 40.59, zoom: 7 },
  "Rhode Island": { longitude: -71.51, latitude: 41.68, zoom: 10 },
  "South Carolina": { longitude: -80.95, latitude: 33.86, zoom: 7 },
  "South Dakota": { longitude: -99.44, latitude: 44.30, zoom: 7 },
  Tennessee: { longitude: -86.69, latitude: 35.75, zoom: 7 },
  Texas: { longitude: -99.34, latitude: 31.47, zoom: 6 },
  Utah: { longitude: -111.09, latitude: 39.32, zoom: 7 },
  Vermont: { longitude: -72.71, latitude: 44.05, zoom: 8 },
  Virginia: { longitude: -78.46, latitude: 37.77, zoom: 7 },
  Washington: { longitude: -120.74, latitude: 47.75, zoom: 7 },
  "West Virginia": { longitude: -80.95, latitude: 38.49, zoom: 7 },
  Wisconsin: { longitude: -89.62, latitude: 44.27, zoom: 7 },
  Wyoming: { longitude: -107.30, latitude: 43.08, zoom: 7 },
};

const WATER_GROUPS = [
  { id: "all",       label: "All Spots",        types: null },
  { id: "flowing",   label: "Rivers & Streams", types: ["river", "stream"] },
  { id: "lake",      label: "Lakes",            types: ["lake"] },
  { id: "reservoir", label: "Reservoirs",       types: ["reservoir"] },
  { id: "pond",      label: "Ponds",            types: ["pond"] },
];

// Water type fill colors (match Mapbox expression-safe)
const WT_FILL: Record<string, string> = {
  river:     "#06b6d4",
  stream:    "#0ea5e9",
  lake:      "#3b82f6",
  reservoir: "#8b5cf6",
  pond:      "#10b981",
};
const WT_STROKE: Record<string, string> = {
  river:     "#67e8f9",
  stream:    "#7dd3fc",
  lake:      "#93c5fd",
  reservoir: "#c4b5fd",
  pond:      "#6ee7b7",
};

export default function MapView({ spots, heatmapPoints = [], homeState = null }: { spots: SpotWithFish[]; heatmapPoints?: [number, number][]; homeState?: string | null }) {
  const homeCenter = homeState ? (STATE_CENTERS[homeState] ?? US_CENTER) : US_CENTER;
  const initialCenter = homeState ? homeCenter : US_CENTER;

  const mapRef = useRef<MapRef>(null);
  const [selectedSpot, setSelectedSpot] = useState<SpotWithFish | null>(null);
  const [waterBody, setWaterBody] = useState<WaterBodyPanel | null>(null);
  const [waterFilter, setWaterFilter] = useState("all");
  const [fishFilter, setFishFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [styleIdx, setStyleIdx] = useState(0);
  const [showForecast, setShowForecast] = useState(false);

  // Build sorted unique state list
  const allStates = [...new Set(
    spots.map((s) => (s as unknown as { state?: string }).state).filter(Boolean) as string[]
  )].sort();

  // Build unique fish list from all spots
  const fishMap = new globalThis.Map<string, { id: string; name: string }>();
  spots
    .flatMap((s) => s.spot_fish.map((sf) => sf.fish_species))
    .filter(Boolean)
    .forEach((f) => fishMap.set(f!.id, f!));
  const allFish = Array.from(fishMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Filter spots based on active filters
  const visibleSpots = spots.filter((spot) => {
    const group = WATER_GROUPS.find((g) => g.id === waterFilter);
    const matchesWater = !group?.types || group.types.includes(spot.water_type);
    const matchesFish =
      fishFilter === "all" ||
      spot.spot_fish.some((sf) => sf.fish_species?.id === fishFilter);
    const matchesState =
      stateFilter === "all" ||
      (spot as unknown as { state?: string }).state === stateFilter;
    return matchesWater && matchesFish && matchesState;
  });

  // Forecast colors keyed by score tier
  const SCORE_FILL: Record<string, string> = {
    Hot:      "#f97316",
    Good:     "#22c55e",
    Moderate: "#eab308",
    Slow:     "#64748b",
  };
  const SCORE_STROKE: Record<string, string> = {
    Hot:      "#fed7aa",
    Good:     "#bbf7d0",
    Moderate: "#fef08a",
    Slow:     "#94a3b8",
  };

  // Build GeoJSON FeatureCollection from visible spots
  const geojson = useMemo(() => {
    const now = new Date();
    return {
      type: "FeatureCollection" as const,
      features: visibleSpots.map((spot) => {
        const score = computeFishingScore(Number(spot.longitude), now);
        const { label } = scoreLabel(score);
        const fill = showForecast ? (SCORE_FILL[label] ?? "#3b82f6") : (WT_FILL[spot.water_type] ?? "#3b82f6");
        const stroke = showForecast ? (SCORE_STROKE[label] ?? "#93c5fd") : (WT_STROKE[spot.water_type] ?? "#93c5fd");
        return {
          type: "Feature" as const,
          properties: {
            id: spot.id,
            name: spot.name,
            water_type: spot.water_type,
            forecast_score: score,
            forecast_label: label,
            fill,
            stroke,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [Number(spot.longitude), Number(spot.latitude)],
          },
        };
      }),
    };
  }, [visibleSpots, showForecast]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register cursor changes directly on the Mapbox GL instance after load
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    ["clusters", "unclustered-point", "water-clickable", "waterway-clickable"].forEach((layerId) => {
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    });
  }, []);

  // Clean up cursor listener if component unmounts
  useEffect(() => {
    return () => {
      const map = mapRef.current?.getMap();
      if (map) map.getCanvas().style.cursor = "";
    };
  }, []);

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const onClick = useCallback(
    (event: MapMouseEvent) => {
      const features = event.features;

      // Check if a water-clickable layer was hit (our custom interactive layers)
      const waterHit = features?.find(
        (f) => f.layer?.id === "water-clickable" || f.layer?.id === "waterway-clickable"
      );

      if (waterHit) {
        const name: string =
          waterHit.properties?.name_en ||
          waterHit.properties?.name ||
          (waterHit.layer?.id === "waterway-clickable" ? "River / Stream" : "Lake / Reservoir");
        const { lat, lng } = event.lngLat;
        const nearby = spots
          .filter((s) => s.latitude != null && s.longitude != null)
          .map((s) => ({ ...s, dist: haversineKm(lat, lng, Number(s.latitude), Number(s.longitude)) }))
          .filter((s) => s.dist < 25)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 8);
        setWaterBody({ name, lat, lng, nearbySpots: nearby });
        setSelectedSpot(null);
        return;
      }

      if (!features || features.length === 0) {
        setSelectedSpot(null);
        setWaterBody(null);
        return;
      }

      const feature = features[0];
      if (!feature?.properties) return;

      if (feature.properties.cluster) {
        const clusterId = feature.properties.cluster_id as number;
        const mapInstance = mapRef.current?.getMap();
        if (!mapInstance) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const source = mapInstance.getSource("spots-source") as any;
        source?.getClusterExpansionZoom(clusterId, (err: Error | null, zoom: number) => {
          if (err || !feature.geometry) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coords = (feature.geometry as any).coordinates as [number, number];
          mapRef.current?.flyTo({ center: coords, zoom: zoom + 0.5, duration: 500 });
        });
      } else {
        const spotId = feature.properties.id as string;
        const spot = spots.find((s) => s.id === spotId);
        if (spot) {
          setSelectedSpot(spot);
          setWaterBody(null);
        }
      }
    },
    [spots]
  );

  const hasActiveFilter = waterFilter !== "all" || fishFilter !== "all" || stateFilter !== "all";

  function resetFilters() {
    setWaterFilter("all");
    setFishFilter("all");
    setStateFilter("all");
  }

  function handleGoHome() {
    mapRef.current?.flyTo({
      center: [homeCenter.longitude, homeCenter.latitude],
      zoom: homeCenter.zoom,
      duration: 1200,
    });
    if (homeState) setStateFilter(homeState);
  }

  function handleNearMe() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 12,
          duration: 1500,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoError(err.code === 1 ? "Location access denied — check browser permissions" : "Could not get your location");
        setTimeout(() => setGeoError(null), 4000);
      },
      { timeout: 8000 }
    );
  }

  const selectedId = selectedSpot?.id ?? "__none__";

  return (
    <div className="relative h-full w-full flex overflow-hidden">
      {/* Map container */}
      <div className="flex-1 relative min-w-0">

        {/* Filter bar */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-3 pb-2 flex flex-col gap-2 pointer-events-none">
          {/* Water type tabs */}
          <div className="flex gap-1.5 flex-wrap pointer-events-auto">
            {WATER_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setWaterFilter(g.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm ${
                  waterFilter === g.id
                    ? "bg-blue-600 text-white shadow-blue-600/30"
                    : "bg-[#070e1c]/85 text-slate-300 border border-white/12 hover:border-blue-400/40 hover:text-white"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Second row: state + fish filters */}
          <div className="flex gap-2 flex-wrap pointer-events-auto">
            {/* State filter */}
            {allStates.length > 0 && (
              <div className="relative">
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="pl-3 pr-7 py-1.5 rounded-full text-xs font-medium bg-[#070e1c]/85 text-slate-300 border border-white/12 hover:border-blue-400/40 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer backdrop-blur-sm transition-colors"
                >
                  <option value="all">All states</option>
                  {allStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            )}

            {/* Fish species filter */}
            <div className="relative">
              <select
                value={fishFilter}
                onChange={(e) => setFishFilter(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-full text-xs font-medium bg-[#070e1c]/85 text-slate-300 border border-white/12 hover:border-blue-400/40 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer backdrop-blur-sm transition-colors"
              >
                <option value="all">All fish species</option>
                {allFish.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Home state button */}
        {homeState && (
          <button
            onClick={handleGoHome}
            className="absolute bottom-32 right-4 z-10 w-10 h-10 rounded-full bg-[#070e1c]/90 border border-white/12 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors shadow-lg backdrop-blur-sm"
            title={`Go to ${homeState}`}
          >
            <Home size={16} />
          </button>
        )}

        {/* Near Me button */}
        <button
          onClick={handleNearMe}
          disabled={locating}
          className="absolute bottom-20 right-4 z-10 w-10 h-10 rounded-full bg-[#070e1c]/90 border border-white/12 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-colors shadow-lg backdrop-blur-sm disabled:opacity-50"
          title="Near me"
        >
          <LocateFixed
            size={16}
            className={locating ? "animate-pulse text-blue-400" : ""}
          />
        </button>

        {/* Map style toggle */}
        <button
          onClick={() => setStyleIdx((i) => (i + 1) % MAP_STYLES.length)}
          className="absolute bottom-16 left-4 z-10 px-3 py-1.5 rounded-full bg-[#070e1c]/90 border border-white/12 text-xs text-slate-300 hover:text-white hover:border-white/25 transition-colors shadow-lg backdrop-blur-sm flex items-center gap-1.5"
        >
          <Layers size={12} />
          {MAP_STYLES[styleIdx].label}
        </button>

        {/* Forecast toggle */}
        <button
          onClick={() => setShowForecast((v) => !v)}
          title="Toggle fishing forecast"
          className={`absolute bottom-24 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-lg backdrop-blur-sm flex items-center gap-1.5 ${
            showForecast
              ? "bg-orange-500/90 border border-orange-400/60 text-white"
              : "bg-[#070e1c]/90 border border-white/12 text-slate-300 hover:text-white hover:border-white/25"
          }`}
        >
          <Flame size={12} />
          {showForecast ? "Forecast on" : "Forecast"}
        </button>

        {/* Forecast legend */}
        {showForecast && (
          <div className="absolute bottom-36 left-4 z-10 px-3 py-2 rounded-xl bg-[#070e1c]/90 border border-white/12 backdrop-blur-sm shadow-lg">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Bite Score</p>
            {[["Hot", "#f97316"], ["Good", "#22c55e"], ["Moderate", "#eab308"], ["Slow", "#64748b"]].map(([label, color]) => (
              <div key={label} className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Geo error toast */}
        {geoError && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2.5 rounded-xl bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium shadow-lg max-w-xs text-center">
            {geoError}
          </div>
        )}

        {/* Spot count + reset filters */}
        <div className="absolute bottom-8 left-4 z-10 flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-[#070e1c]/85 backdrop-blur-sm border border-white/10 text-xs text-slate-500">
            {visibleSpots.length} spot{visibleSpots.length !== 1 ? "s" : ""}
          </div>
          {visibleSpots.length === 0 && hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-sm text-white text-xs font-medium hover:bg-blue-500/90 transition-colors"
            >
              <RotateCcw size={11} /> Reset filters
            </button>
          )}
        </div>

        <MapGL
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={initialCenter}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLES[styleIdx].style}
          interactiveLayerIds={["clusters", "unclustered-point", "water-clickable", "waterway-clickable"]}
          onClick={onClick}
          onLoad={onMapLoad}
        >
          <NavigationControl position="bottom-right" />

          {/* Catch heatmap — highlights productive fishing waters */}
          {heatmapPoints.length > 0 && (
            <Source
              id="catch-heat"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: heatmapPoints.map(([lng, lat]) => ({
                  type: "Feature",
                  properties: {},
                  geometry: { type: "Point", coordinates: [lng, lat] },
                })),
              }}
            >
              <Layer
                id="catch-heatmap"
                type="heatmap"
                paint={{
                  "heatmap-weight": 1,
                  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 0.3, 12, 1.5],
                  "heatmap-color": [
                    "interpolate", ["linear"], ["heatmap-density"],
                    0,   "rgba(0,0,0,0)",
                    0.2, "rgba(14,165,233,0.4)",
                    0.5, "rgba(59,130,246,0.6)",
                    0.8, "rgba(139,92,246,0.7)",
                    1,   "rgba(236,72,153,0.85)",
                  ],
                  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 12, 10, 25, 14, 40],
                  "heatmap-opacity": 0.75,
                }}
              />
            </Source>
          )}

          {/* Water body clickable layers — transparent fill/line on composite water source */}
          <Layer
            id="water-clickable"
            type="fill"
            source="composite"
            source-layer="water"
            paint={{
              "fill-color": "#38bdf8",
              "fill-opacity": 0.06,
            }}
          />
          <Layer
            id="waterway-clickable"
            type="line"
            source="composite"
            source-layer="waterway"
            minzoom={7}
            paint={{
              "line-color": "#38bdf8",
              "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.25, 14, 0.6],
              "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1, 12, 2.5, 16, 5],
            }}
          />

          <Source
            id="spots-source"
            type="geojson"
            data={geojson}
            cluster={true}
            clusterMaxZoom={11}
            clusterRadius={45}
          >
            {/* Cluster circles */}
            <Layer
              id="clusters"
              type="circle"
              source="spots-source"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#3b82f6",   // 1–4 spots: blue
                  5,  "#8b5cf6",  // 5–9: violet
                  10, "#ec4899",  // 10+: pink
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  24,   // 1–4
                  5,  32,   // 5–9
                  10, 42,   // 10+
                ],
                "circle-opacity": 0.88,
                "circle-stroke-width": 2.5,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-opacity": 0.15,
              }}
            />

            {/* Cluster count labels */}
            <Layer
              id="cluster-count"
              type="symbol"
              source="spots-source"
              filter={["has", "point_count"]}
              layout={{
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 14,
              }}
              paint={{ "text-color": "#ffffff" }}
            />

            {/* Unclustered individual spots */}
            <Layer
              id="unclustered-point"
              type="circle"
              source="spots-source"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": ["get", "fill"],
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  6,  7,
                  10, 10,
                  14, 14,
                ],
                "circle-opacity": 0.92,
                "circle-stroke-width": 2.5,
                "circle-stroke-color": ["get", "stroke"],
                "circle-stroke-opacity": 0.85,
              }}
            />

            {/* Selected spot highlight ring */}
            <Layer
              id="selected-point"
              type="circle"
              source="spots-source"
              filter={["==", ["get", "id"], selectedId]}
              paint={{
                "circle-color": "transparent",
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  6,  14,
                  10, 18,
                  14, 22,
                ],
                "circle-stroke-width": 3,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-opacity": 0.9,
              }}
            />
          </Source>
        </MapGL>
      </div>

      {/* Slide-in spot panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-96 z-20 transform transition-transform duration-300 ease-out ${
          selectedSpot ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedSpot && (
          <SpotPanel spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
        )}
      </div>

      {/* Water body panel */}
      {waterBody && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 z-20 bg-[#070e1c]/95 backdrop-blur-md border-l border-white/8 overflow-y-auto">
          <div className="p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">{waterBody.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {waterBody.lat.toFixed(4)}, {waterBody.lng.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setWaterBody(null)}
                className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors shrink-0"
              >
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            {waterBody.nearbySpots.length > 0 ? (
              <>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3 flex items-center gap-1.5">
                  <MapPin size={11} /> Nearby Fishing Spots
                </p>
                <div className="flex flex-col gap-2">
                  {waterBody.nearbySpots.map((s) => {
                    const fish = s.spot_fish
                      .map((sf) => sf.fish_species)
                      .filter(Boolean) as { id: string; name: string }[];
                    return (
                      <Link
                        key={s.id}
                        href={`/spots/${s.id}`}
                        className="p-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{s.name}</p>
                          <span className="text-xs text-blue-400 capitalize">{s.water_type}</span>
                        </div>
                        {fish.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Fish size={10} className="text-slate-600 shrink-0" />
                            {fish.slice(0, 4).map((f) => (
                              <span key={f.id} className="text-[10px] text-slate-500">{f.name}{fish.indexOf(f) < fish.length - 1 ? "," : ""}</span>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <MapPin size={28} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-500">No spots logged near here yet</p>
                <Link
                  href="/submit-spot"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Add the first spot →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
