import CoordinateParser from "./CoordinateParser.js";

export default class Popup {
  constructor() {
    this.popup = null;
    this.overlay = null;
    this.resolve = null; 
    this.reject = null; 
    this.createPopup(); 
  }
  createPopup() {
    if (document.getElementById("popupOverlay")) {
      this.overlay = document.getElementById("popupOverlay");
      this.popup = document.getElementById("popup");
      this.bindEvents();
      return;
    }
    this.overlay = document.createElement("div");
    this.overlay.className = "popup-overlay hidden";
    this.overlay.id = "popupOverlay";

    this.popup = document.createElement("div");
    this.popup.className = "popup hidden";
    this.popup.id = "popup";
    this.popup.innerHTML = `
            <h3>Введите координаты</h3>
            <p>Не удалось определить ваше местоположение. Введите координаты вручную:</p>
            <div class="coord-inputs">
                <div class="coord-group">
                    <label for="coordinateInput">Координаты:</label>
                    <input type="text" id="coordinateInput" 
                           placeholder="Например: 51.50851, -0.12572 или [51.50851, -0.12572]">
                    <div id="coordinateError" class="error-message hidden"></div>
                </div>
            </div>
            <div class="popup-actions">
                <button id="cancelBtn" class="btn btn-cancel">Отмена</button>
                <button id="okBtn" class="btn btn-ok">OK</button>
            </div>
        `;

    document.body.prepend(this.overlay);
    document.body.prepend(this.popup);

    this.bindEvents();
  }

  bindEvents() {
    const okBtn = this.popup.querySelector("#okBtn");
    const cancelBtn = this.popup.querySelector("#cancelBtn");
    const coordinateInput = this.popup.querySelector("#coordinateInput");

    okBtn.addEventListener("click", () => this.handleOk());
    cancelBtn.addEventListener("click", () => this.handleCancel());

    coordinateInput.addEventListener("input", (e) =>
      this.validateCoordinateInput(e.target),
    );
    coordinateInput.addEventListener("blur", (e) =>
      this.validateCoordinateInput(e.target),
    );

    coordinateInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleOk();
      }
    });

    this.overlay.addEventListener("click", () => this.handleCancel());
  }

  validateCoordinateInput(input) {
    const value = input.value.trim();
    const errorElement = this.popup.querySelector("#coordinateError");

    if (!value) {
      this.showError(input, errorElement, "Введите координаты");
      return false;
    }

    try {
      CoordinateParser.parse(value);
      this.clearError(input, errorElement);
      return true;
    } catch (error) {
      this.showError(input, errorElement, error.message);
      return false;
    }
  }

  showError(input, errorElement, message) {
    input.style.borderColor = "#e53e3e";
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }

  clearError(input, errorElement) {
    input.style.borderColor = "";
    errorElement.classList.add("hidden");
    errorElement.textContent = "";
  }

  show() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const input = this.popup.querySelector("#coordinateInput");
      input.value = "";
      this.clearError(input, this.popup.querySelector("#coordinateError"));

      this.overlay.classList.remove("hidden");
      this.popup.classList.remove("hidden");

      input.focus();
    });
  }

  hide() {
    this.overlay.classList.add("hidden");
    this.popup.classList.add("hidden");
  }
  handleOk() {
    const input = this.popup.querySelector("#coordinateInput");
    const value = input.value.trim();

    if (!this.validateCoordinateInput(input)) {
      return;
    }

    try {
      const parsedCoords = CoordinateParser.parse(value);

      this.hide();

      if (this.resolve) {
        this.resolve(parsedCoords);
      }
    } catch (error) {
      this.showError(
        input,
        this.popup.querySelector("#coordinateError"),
        error.message,
      );
    }
  }

  handleCancel() {
    this.hide();

    if (this.reject) {
      this.reject(new Error("Пользователь отменил ввод координат"));
    }
  }
}
