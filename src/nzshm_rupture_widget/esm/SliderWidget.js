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
                value: event.target.value
            });
        });
        slider.addEventListener("input", function (event) {
            callback({
                type: "input",
                value: event.target.value
            });
        });
        sliderForward.addEventListener("click", function (event) {
            console.log("max " + max + " slider " + slider.value);
            if (max > slider.value) {
                slider.value++;
                callback({
                    type: "forward",
                    value: slider.value
                });
            }
        });
        sliderBack.addEventListener("click", function (event) {
            if (min < slider.value) {
                slider.value--;
                callback({
                    type: "back",
                    value: slider.value
                });
            }
        });
    }

    div.appendChild(sliderBack);
    div.appendChild(sliderForward);
    div.appendChild(slider);
    parent.appendChild(div);

    return function (value) {
        if (value >= min && value <= max) {
            slider.value = value;
            callback({
                type: "setValue",
                value: slider.value
            });
        }
    }
}

export default SliderWidget;