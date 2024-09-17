/**
 * Button that can turn on fullscreen mode for a map
 */
function render({ model, el }) {

    const button = document.createElement("i");
    button.classList.add("fa");
    button.classList.add("fa-arrows");
    button.classList.add("controlButton3DMap");

    button.addEventListener("click", function (event) {
        if (!document.fullscreenElement) {
            const target = button.closest(".fullScreenTarget");
            if (target) {
                target.requestFullscreen();
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    });

    el.appendChild(button);
}

export default { render };
