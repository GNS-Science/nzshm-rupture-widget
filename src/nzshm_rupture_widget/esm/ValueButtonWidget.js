function nextValue(value, values) {
    const index = values.findIndex(candidate => candidate > value)
    if (index === -1) {
        return values[0]
    }
    return values[index]
}

function render({ model, el }) {

    const button = document.createElement("div")
    button.classList.add("fa")
    button.classList.add(model.get("icon"))
    button.classList.add("controlButton3DMap")

    button.addEventListener("click", function (event) {
        const values = model.get("values") || [0, 1]
        const value = model.get("value")
        model.set("value", nextValue(value, values))
    })

    el.appendChild(button)
}

export default { render }
