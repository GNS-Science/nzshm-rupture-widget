
import { expect, test, vi } from 'vitest'
import loadGeoJSON from "./GeoJSON";

const CesiumMock = {
    GeoJsonDataSource: {
        load: (geojson) => ({ geojson, then: vi.fn() })
    }
};

vi.stubGlobal('Cesium', CesiumMock);

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

const pointFeature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "coordinates": [-19.76, -2.48, 3],
        "type": "Point"
    }
}

const lineStringFeature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "coordinates": [
            [33.27, 13.47, 4],
            [36.46, 5.16, 4]
        ],
        "type": "LineString"
    }
}

const multiLineStringFeature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "coordinates": [
            [
                [33.27, 13.47, 5],
                [36.46, 5.16, 5]
            ]
        ],
        "type": "MultiLineString"
    }
}

const polygonFeature =
{
    "type": "Feature",
    "properties": {},
    "geometry": {
        "coordinates": [
            [
                [31.82, 9.27, 1],
                [31.82, 5.64, 1],
                [34.87, 5.64, 1],
                [34.87, 9.27, 1]
            ]
        ],
        "type": "Polygon"
    }
}

const multiPolygonFeature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "coordinates": [
            [
                [
                    [31.82, 9.27, 6],
                    [31.82, 5.64, 6],
                    [34.87, 5.64, 6],
                    [31.82, 9.27, 6]
                ]
            ]
        ],
        "type": "MultiPolygon"
    }
}


function featureCollection(...features) {
    return {
        "type": "FeatureCollection",
        "features": features.map(deepClone)
    }
}


test('elevation: can handle any level of nested coordinates', () => {
    const gj = featureCollection(
        pointFeature,
        lineStringFeature,
        multiLineStringFeature,
        polygonFeature,
        multiPolygonFeature);

    const actual = loadGeoJSON(gj);

    expect(actual.geojson.features[0].geometry.coordinates)
        .toStrictEqual(
            [-19.76, -2.48, -3000]);
    expect(actual.geojson.features[1].geometry.coordinates)
        .toStrictEqual(
            [
                [33.27, 13.47, -4000],
                [36.46, 5.16, -4000]
            ]);
    expect(actual.geojson.features[2].geometry.coordinates)
        .toStrictEqual(
            [
                [
                    [33.27, 13.47, -5000],
                    [36.46, 5.16, -5000]
                ]
            ]);
    expect(actual.geojson.features[3].geometry.coordinates)
        .toStrictEqual(
            [
                [
                    [31.82, 9.27, -1000],
                    [31.82, 5.64, -1000],
                    [34.87, 5.64, -1000],
                    [34.87, 9.27, -1000]
                ]
            ]);
    expect(actual.geojson.features[4].geometry.coordinates)
        .toStrictEqual(
            [
                [
                    [
                        [31.82, 9.27, -6000],
                        [31.82, 5.64, -6000],
                        [34.87, 5.64, -6000],
                        [31.82, 9.27, -6000]
                    ]
                ]
            ]);

});

test('elevation: can handle explicit elevationCorrection', () => {
    const gj = featureCollection(pointFeature);
    gj.elevationToMeters = 300;

    const actual = loadGeoJSON(gj);
    expect(actual.geojson.features[0].geometry.coordinates)
        .toStrictEqual(
            [-19.76, -2.48, 900]);

})

test('styles: emulates Leaflet styling', () => {
    const gj = featureCollection(pointFeature);
    const style = {
        color: "the-color",
        weight: "the-weight",
        opacity: "the-opacity",
        "fillColor": "the-fillColor",
        "fillOpacity": "the-fillOpacity"
    };
    gj.features[0].properties.style = style;

    const actual = loadGeoJSON(gj);
    expect(actual.geojson.features[0].properties)
        .toStrictEqual({
            "fill": "the-fillColor",
            "fill-opacity": "the-fillOpacity",
            "stroke": "the-color",
            "stroke-opacity": "the-opacity",
            "stroke-width": "the-weight",
            style
        });

})