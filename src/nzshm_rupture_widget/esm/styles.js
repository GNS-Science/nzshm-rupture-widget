export const styleEntity = function (entity, style) {

    if (!style) {
        return;
    }

    const { extrusion, stroke, weight, fill, color, opacity, fillColor, fillOpacity } = style

    if (entity.polygon) {
        const polygon = entity.polygon;
        const oldStyle = {};
        polygon.oldStyle = oldStyle;
        if (extrusion) {
            polygon.extrudedHeight = extrusion;
        }
        // boolean value
        if (typeof stroke !== 'undefined') {
            oldStyle.outline = polygon.outline;
            polygon.outline = stroke;

        }
        // this is ignored in all major windows browsers
        // https://cesium.com/learn/ion-sdk/ref-doc/PolygonGraphics.html#outlineWidth
        if (weight) {
            oldStyle.outlineWidth = polygon.outlineWidth;
            polygon.outlineWidth = weight;
        }
        // boolean value
        if (typeof fill !== 'undefined') {
            oldStyle.fill = fill;
            polygon.fill = fill;
        }

        if (color) {
            oldStyle.outlineColor = polygon.outlineColor
            polygon.outlineColor = color;
        }

        if (opacity) {
            oldStyle.outlineColor = polygon.outlineColor
            let cesiumColor = Cesium.Color.fromCssColorString(polygon.outlineColor)
            const alpha = typeof (opacity) === "string" ? parseFloat(opacity) : opacity;
            polygon.outlineColor = cesiumColor.withAlpha(alpha)
        }

        if (fillColor) {
            oldStyle.material = polygon.material
            let cesiumColor = Cesium.Color.fromCssColorString(fillColor)
            if (fillOpacity) {
                const alpha = typeof (fillOpacity) === "string" ? parseFloat(fillOpacity) : fillOpacity;
                cesiumColor = cesiumColor.withAlpha(alpha)
            }
            polygon.material = new Cesium.ColorMaterialProperty(cesiumColor);
        }
    }

    // TODO line as well

    // boolean value
    if (typeof stroke !== 'undefined') {
        if (entity.polyline) {
            entity.polyline.show = stroke;
        }
    }

}

export const recoverEntityStyle = function (entity) {
    if (!entity) {
        return;
    }
    if (entity.polygon?.oldStyle) {
        for (const style in entity.polygon.oldStyle) {
            entity.polygon[style] = entity.polygon.oldStyle[style];
        }
        entity.polygon.oldStyle = undefined
    }
}



