"use client";

import { useState, useCallback, useRef } from "react";
import MapGL, { Source, Layer, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { Fish, Scale, Ruler, X } from "lucide-react";

export type CatchPin = {
  id: string;
  caught_at: string;
  weight_lbs: number | null;
  length_in: number | null;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  fish_name: string;
  spot_name: string;
  spot_id: string;
  username: string;
  user_id: string;
};

// Color by species name (hash-based)
function speciesColor(name: string): string {
  const colors = ["#3b82f6","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#f97316","#84cc16","#14b8a6"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

type PopupInfo = CatchPin & { x: number; y: number };

export default function CatchMapView({
  catches,
  speciesList,
}: {
  catches: CatchPin[];
  speciesList: string[];
}) {
  const mapRef = useRef<MapRef>(null);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  const filtered = speciesFilter === "all" ? catches : catches.filter(c => c.fish_name === speciesFilter);

  const geojson = {
    type: "FeatureCollection" as const,
    features: filtered.map(c => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [c.longitude, c.latitude] },
      properties: { id: c.id, color: speciesColor(c.fish_name) },
    })),
  };

  const handleClick = useCallback((e: MapMouseEvent) => {
    const features = e.features ?? [];
    if (!features.length) { setPopup(null); return; }
    const feat = features[0];
    const hit = catches.find(c => c.id === feat.properties?.id);
    if (hit) setPopup({ ...hit, x: e.point.x, y: e.point.y });
  }, [catches]);

  return (
    <div className="relative w-full h-full">
      {/* Species filter bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-1.5 bg-[#060d1a]/90 backdrop-blur border border-white/10 rounded-xl px-3 py-1.5 flex-wrap gap-1">
          <button
            onClick={() => setSpeciesFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${speciesFilter === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            All ({catches.length})
          </button>
          {speciesList.map(s => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s === speciesFilter ? "all" : s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${speciesFilter === s ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
              style={speciesFilter === s ? { backgroundColor: speciesColor(s) } : {}}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: speciesColor(s) }} />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Count badge */}
      <div className="absolute top-4 right-4 z-10 bg-[#060d1a]/90 backdrop-blur border border-white/10 rounded-xl px-3 py-1.5">
        <p className="text-xs text-slate-400"><span className="text-white font-semibold">{filtered.length}</span> catches shown</p>
      </div>

      <MapGL
        ref={mapRef}
        initialViewState={{ longitude: -111.5, latitude: 39.5, zoom: 7 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={["catch-circles"]}
        onClick={handleClick}
        cursor={popup ? "default" : "auto"}
      >
        <NavigationControl position="bottom-right" />

        <Source id="catches" type="geojson" data={geojson} cluster clusterMaxZoom={12} clusterRadius={40}>
          {/* Cluster circles */}
          <Layer
            id="catch-clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": ["step", ["get", "point_count"], "#3b82f6", 5, "#8b5cf6", 20, "#ef4444"],
              "circle-radius": ["step", ["get", "point_count"], 18, 5, 24, 20, 32],
              "circle-opacity": 0.9,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            }}
          />
          <Layer
            id="catch-cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-size": 13,
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            }}
            paint={{ "text-color": "#ffffff" }}
          />
          {/* Individual catch circles */}
          <Layer
            id="catch-circles"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": ["get", "color"],
              "circle-radius": 8,
              "circle-opacity": 0.9,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            }}
          />
        </Source>

        {/* Popup */}
        {popup && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="bottom"
            onClose={() => setPopup(null)}
            closeButton={false}
            className="catch-popup"
            maxWidth="260px"
          >
            <div className="bg-[#0c1a2e] rounded-xl border border-white/15 overflow-hidden shadow-2xl" style={{ minWidth: 220 }}>
              {popup.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={popup.photo_url} alt="" className="w-full h-28 object-cover" />
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white text-sm">{popup.fish_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{popup.spot_name}</p>
                  </div>
                  <button onClick={() => setPopup(null)} className="text-slate-600 hover:text-slate-400">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  {popup.weight_lbs != null && (
                    <span className="flex items-center gap-1"><Scale size={10} />{popup.weight_lbs} lbs</span>
                  )}
                  {popup.length_in != null && (
                    <span className="flex items-center gap-1"><Ruler size={10} />{popup.length_in}&quot;</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  @{popup.username} · {new Date(popup.caught_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <Link
                  href={`/catches/${popup.id}`}
                  className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  <Fish size={11} /> View catch
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
