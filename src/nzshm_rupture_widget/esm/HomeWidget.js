/**
 * Button that can make a map navigate "home"
 */
function render({ model, el }) {

    const button = document.createElement("div");
    button.classList.add("fa");
    button.classList.add("fa-home");
    button.classList.add("controlButton3DMap");

    button.addEventListener("click", function (event) {
        model.send({msg: "home"});
    });

    el.appendChild(button);
}

export default { render };
