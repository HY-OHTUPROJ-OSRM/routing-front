import { ROUTING_API_URL } from "./Utils/config"

const roadStyle = {
    "name": "Traffic data",
    "sources": {
        "osm-tiles": {
            "type": "raster",
            "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256
        },
        "speed-tiles": {
            "type": "vector",
            "tiles": [`${ROUTING_API_URL}/tile/v1/driving/tile({x},{y},{z}).mvt`]
        }
    },
    "layers": [
        {
            "id": "osm-tiles-layer",
            "type": "raster",
            "source": "osm-tiles",
            "minzoom": 0,
            "maxzoom": 22
        },
        {
            "id": "speeds-layer",
            "type": "line",
            "source": "speed-tiles",
            "source-layer": "speeds",
            "paint": {
                "line-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "speed"],
                    0, "red",
                    20, "yellow",
                    40, "green"
                ],
                "line-width": 1.5
            }
        }
    ],
    "version": 8
}

export default roadStyle