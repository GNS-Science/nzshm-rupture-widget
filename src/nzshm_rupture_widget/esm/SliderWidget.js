function asInt(value) {
    if (typeof value === "string") {
        return parseInt(value);
    }
    return value;
}

function SliderWidget(parent, min, max, selected, callback) {

    const div = document.createElement("div");
    div.classList.add("sliderWidget");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.classList.add("rangeSlider");
    slider.min = min;
    slider.max = max;
    slider.value = selected;

    const sliderForward = document.createElement("div");
    sliderForward.classList.add("fa");
    sliderForward.classList.add("fa-forward");
    sliderForward.classList.add("sliderControlButton");

    const sliderBack = document.createElement("div");
    sliderBack.classList.add("fa");
    sliderBack.classList.add("fa-backward");
    sliderBack.classList.add("sliderControlButton");

    if (callback) {
        slider.addEventListener("change", function (event) {
            callback({
                type: "change",
                value: asInt(event.target.value)
            });
        });
        slider.addEventListener("input", function (event) {
            callback({
                type: "input",
                value: asInt(event.target.value)
            });
        });
        sliderForward.addEventListener("click", function (event) {
            if (max > slider.value) {
                slider.value++;
                callback({
                    type: "forward",
                    value: asInt(slider.value)
                });
            }
        });
        sliderBack.addEventListener("click", function (event) {
            if (min < slider.value) {
                slider.value--;
                callback({
                    type: "back",
                    value: asInt(slider.value)
                });
            }
        });
    }

    div.appendChild(sliderBack);
    div.appendChild(sliderForward);
    div.appendChild(slider);
    parent.appendChild(div);

    return function (value) {
        if (value >= min && value <= max && slider.value !== value) {
            slider.value = value;
            callback({
                type: "setValue",
                value: asInt(slider.value)
            });
        }
    }
}

export default SliderWidget;