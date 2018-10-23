
class StepButton {
    /**
     * 
     * @param {HTMLButtonElement} button
     */
    constructor(button) {
        button.type = "button";
        this.button = button;
        this._clickProm = null;
        this.button.disabled = true;
    }
    clickPromise() {
        if (this._clickProm == null) {
            this.button.disabled = false;
            this._clickProm = new Promise((resolve, reject) => {
                this.button.addEventListener("click", () => {
                    this._clickProm = null;
                    resolve();
                    this.button.disabled = true;
                }, {once:true});
            });
        }
        return this._clickProm;
    }
}

export default StepButton;