
import { expect, test, vi } from 'vitest'
import loadGeoJSON from "./GeoJSON";

const CesiumMock = {
    GeoJsonDataSource: {
        load: (geojson) => ({geojson, then: vi.fn()})
    }
};

vi.stubGlobal('Cesium', CesiumMock);

console.log(Cesium);
console.log(Cesium.GeoJsonDataSource)

const sampleGJ = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [174.84, -41.145], [174.84, -41.232], [174.98, -41.232], [174.98, -41.145], [174.84, -41.145]
                    ]
                ],
                "type": "Polygon"
            }
        }
    ]
}

test('adds 1 + 2 to equal 3', () => {
    const result = loadGeoJSON(sampleGJ)
});