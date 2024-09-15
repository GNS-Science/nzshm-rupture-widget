function render({ model, el }) {

    const button = document.createElement("div");
    button.classList.add("fa");
    button.classList.add("fa-arrows-alt");
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
