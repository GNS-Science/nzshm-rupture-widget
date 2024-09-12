function correctElevation(coords, elevationCorrection) {
    if (typeof coords[0] === 'number') {
        if (coords[2]) {
            coords[2] = coords[2] * elevationCorrection;
        }
    } else {
        for (const coord of coords) {
            correctElevation(coord, elevationCorrection);
        }
    }
}

function removeElevation(coords) {
    if (typeof coords[0] === 'number') {
        if (coords[2]) {
            coords.pop();
        }
    } else {
        for (const coord of coords) {
            removeElevation(coord);
        }
    }
}

/**
 * Returns a Cesium.GeoJsonDataSource that wrapes the `geojson` object.
 * If elevation is present in the coordinates, multiplies elevation by `geojson.elevationCorrection` is present, or by -1000 otherwise.
 * This default was chosen to make handling `OpenSHA` easier.
 * Feature properties can use [simplestyle](https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0) styling.
 * Some [Leaflet styling](https://leafletjs.com/reference.html#path-option) is also supported: `color`, `weight`, `opacity`, `fillColor`, `fillOpacity`.
 * Polygon feature properties can also have a `style.extrusion` property which will remove elevation information from the polygon and extrude it from 0 to the specified extrusion height in meters.
 * @param {*} geojson 
 * @returns 
 */
function loadGeoJSON(geojson) {

    // this default works for OpenSHA, but will break all other data
    const elevationCorrection = geojson.elevationToMeters || -1000;
    for (const feature of geojson.features) {

        const extrusion = feature.properties?.style?.extrusion;

        if (extrusion) {
            removeElevation(feature.geometry.coordinates);
        } else if (elevationCorrection !== 1) {
            // Cesium expects elevation in meters
            correctElevation(feature.geometry.coordinates, elevationCorrection);
        }

        // simulate some of https://leafletjs.com/reference.html#path-option 
        // in https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
        const style = feature.properties.style;
        if (style) {
            const mappings = [
                ["color", "stroke"],
                ["weight", "stroke-width"],
                ["opacity", "stroke-opacity"],
                ["fillColor", "fill"],
                ["fillOpacity", "fill-opacity"]
            ];
            for (var [from, to] of mappings) {
                if (style[from]) {
                    feature.properties[to] = style[from];
                }
            }
        }
    }
    const dataSource = Cesium.GeoJsonDataSource.load(geojson)

    // some of the styles need to be set directly on the entities
    dataSource.then(function (ds) {
        for (const entity of ds.entities.values) {
            const style = entity.properties.getValue().style;

            const extrusion = style?.extrusion;
            if (extrusion) {
                entity.polygon.extrudedHeight = extrusion;
            }

            const stroke = style?.stroke;
            if (typeof stroke !== 'undefined') {
                if (entity.polygon) {
                    entity.polygon.outline = stroke;
                }
                if (entity.polyline) {
                    entity.polyline.show = stroke;
                }
            }

            // this is ignored in all major windows browsers
            // https://cesium.com/learn/ion-sdk/ref-doc/PolygonGraphics.html#outlineWidth
            const weight = style?.weight;
            if (weight && entity.polygon) {
                entity.polygon.outlineWidth = weight;
            }

            const fill = style?.fill;
            if (typeof fill !== 'undefined') {
                if (entity.polygon) {
                    entity.polygon.fill = fill;
                }
            }
        }
    })

    return dataSource;
}

export default loadGeoJSON;
