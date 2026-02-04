import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Maximize2, Filter, FileText, Settings, Download } from "lucide-react";

// Use a reliable CDN for the topojson
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Map state names FIPS to sales values.
// Colors adapted from the provided screenshot reference:
// West Coast = Red/Orange
// Texas = Red
// Florida = Purple
// Northeast = Blue
// Central/Mountain = Teal/Grey/Purple mix
const data = [
  // West - Reds/Warm
  {
    id: "06",
    state: "California",
    val: 11.5,
    fill: "#ff7043",
    coordinates: [-119, 37],
  },
  {
    id: "53",
    state: "Washington",
    val: 7.93,
    fill: "#ef5350",
    coordinates: [-120, 47],
  },
  {
    id: "41",
    state: "Oregon",
    val: 7.03,
    fill: "#ef5350",
    coordinates: [-120.5, 44],
  },
  {
    id: "04",
    state: "Arizona",
    val: 3.84,
    fill: "#ef5350",
    coordinates: [-111.5, 34],
  },
  {
    id: "32",
    state: "Nevada",
    val: 3.94,
    fill: "#5c6bc0",
    coordinates: [-117, 39.5],
  }, // Purple/Blue
  {
    id: "49",
    state: "Utah",
    val: 3.94,
    fill: "#5c6bc0",
    coordinates: [-111.5, 39],
  }, // Purple/Blue

  // Mountain/Central - Blues/Teals
  {
    id: "08",
    state: "Colorado",
    val: 4.01,
    fill: "#29b6f6",
    coordinates: [-105.5, 39],
  },
  {
    id: "35",
    state: "New Mexico",
    val: 3.84,
    fill: "#26c6da",
    coordinates: [-106, 34.5],
  },
  {
    id: "16",
    state: "Idaho",
    val: 4.21,
    fill: "#78909c",
    coordinates: [-114, 45],
  },
  {
    id: "30",
    state: "Montana",
    val: 4.21,
    fill: "#78909c",
    coordinates: [-109.5, 47],
  },
  {
    id: "56",
    state: "Wyoming",
    val: 4.21,
    fill: "#78909c",
    coordinates: [-107.5, 43],
  },

  // Plains - Purples
  {
    id: "38",
    state: "North Dakota",
    val: 4.31,
    fill: "#7e57c2",
    coordinates: [-100.5, 47.5],
  },
  {
    id: "46",
    state: "South Dakota",
    val: 4.31,
    fill: "#7e57c2",
    coordinates: [-100, 44.5],
  },
  {
    id: "31",
    state: "Nebraska",
    val: 4.31,
    fill: "#7e57c2",
    coordinates: [-99.5, 41.5],
  },
  {
    id: "20",
    state: "Kansas",
    val: 4.01,
    fill: "#5c6bc0",
    coordinates: [-98, 38.5],
  },
  {
    id: "40",
    state: "Oklahoma",
    val: 4.01,
    fill: "#5c6bc0",
    coordinates: [-97.5, 35.5],
  },

  // South - Red
  {
    id: "48",
    state: "Texas",
    val: 7.88,
    fill: "#ef5350",
    coordinates: [-99, 31.5],
  },

  // Midwest - Grey/Blues
  {
    id: "17",
    state: "Illinois",
    val: 4.26,
    fill: "#78909c",
    coordinates: [-89, 40],
  },
  {
    id: "27",
    state: "Minnesota",
    val: 4.26,
    fill: "#78909c",
    coordinates: [-94.5, 46],
  },
  {
    id: "55",
    state: "Wisconsin",
    val: 3.26,
    fill: "#78909c",
    coordinates: [-90, 44.5],
  },
  {
    id: "29",
    state: "Missouri",
    val: 3.5,
    fill: "#26c6da",
    coordinates: [-92.5, 38.5],
  },
  {
    id: "05",
    state: "Arkansas",
    val: 3.5,
    fill: "#26c6da",
    coordinates: [-92.5, 34.8],
  },
  {
    id: "22",
    state: "Louisiana",
    val: 3.5,
    fill: "#26c6da",
    coordinates: [-92, 31],
  },

  // East - Blues
  {
    id: "26",
    state: "Michigan",
    val: 4.14,
    fill: "#29b6f6",
    coordinates: [-84.5, 43.5],
  },
  {
    id: "39",
    state: "Ohio",
    val: 3.9,
    fill: "#29b6f6",
    coordinates: [-82.5, 40.2],
  },
  {
    id: "42",
    state: "Pennsylvania",
    val: 5.1,
    fill: "#29b6f6",
    coordinates: [-77.5, 40.9],
  },
  {
    id: "36",
    state: "New York",
    val: 9.5,
    fill: "#29b6f6",
    coordinates: [-75.5, 43],
  },
  // MA/NJ overlapping slightly, simplifying layout or omitting for clarity on small map
  {
    id: "25",
    state: "Massachusetts",
    val: 9.5,
    fill: "#29b6f6",
    coordinates: [-72, 42.3],
  },

  // Southeast
  {
    id: "12",
    state: "Florida",
    val: 5.2,
    fill: "#ab47bc",
    coordinates: [-81.5, 27.8],
  },
  {
    id: "13",
    state: "Georgia",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-83.5, 32.7],
  },
  {
    id: "01",
    state: "Alabama",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-86.8, 32.6],
  },
  {
    id: "47",
    state: "Tennessee",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-86, 35.8],
  },
  {
    id: "21",
    state: "Kentucky",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-85, 37.5],
  },
  {
    id: "37",
    state: "North Carolina",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-79, 35.5],
  },
  {
    id: "45",
    state: "South Carolina",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-81, 33.9],
  },
  {
    id: "51",
    state: "Virginia",
    val: 4.14,
    fill: "#78909c",
    coordinates: [-78, 37.5],
  },
];

const SalesByRegion: React.FC = () => {
  const [content, setContent] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  return (
    <Card className="w-full col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-gray-600 font-medium">
          Sales by State - Revenue YTD
        </CardTitle>
        <div className="flex gap-2 text-gray-400">
          <Download className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <FileText className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <Settings className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <Filter className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <Maximize2 className="w-4 h-4 cursor-pointer hover:text-gray-600" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className="w-full aspect-video bg-white rounded-lg relative overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          <ComposableMap
            projection="geoAlbersUsa"
            className="max-h-125 w-full h-full"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) => (
                <>
                  {geographies.map((geo) => {
                    const cur = data.find((s) => s.id === geo.id);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        // Use the precise color from data, or fallback grey
                        fill={cur ? cur.fill : "#f1f5f9"}
                        stroke="#FFF"
                        strokeWidth={0.5}
                        onMouseEnter={() => {
                          const { name } = geo.properties;
                          setContent(
                            // Format: California — $11.5M
                            `${name} — ${cur ? `$${cur.val}M` : "No Data"}`,
                          );
                        }}
                        onMouseLeave={() => {
                          setContent("");
                        }}
                        style={{
                          default: {
                            outline: "none",
                          },
                          hover: {
                            fill: "#263238", // Dark hover state
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })}
                </>
              )}
            </Geographies>
            {data.map((d) =>
              d.coordinates ? (
                <Marker
                  key={d.id}
                  coordinates={d.coordinates as [number, number]}
                >
                  <text
                    textAnchor="middle"
                    style={{
                      fontFamily: "system-ui",
                      fill: "#FFFFFF",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      pointerEvents: "none",
                      textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    ${d.val}M
                  </text>
                </Marker>
              ) : null,
            )}
          </ComposableMap>

          {/* Floating Tooltip Box */}
          {content && (
            <div
              className="absolute bg-slate-800/90 text-white text-xs px-2 py-1 rounded pointer-events-none shadow-lg backdrop-blur-sm transition-opacity z-50 whitespace-nowrap"
              style={{ left: position.x + 10, top: position.y + 10 }}
            >
              {content}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesByRegion;
