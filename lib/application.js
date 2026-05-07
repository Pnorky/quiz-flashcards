class AppColors {
    static background() {
        return "var(--background)";
    }
    static foreground() {
        return "var(--foreground)";
    }
    static mutedForeground() {
        return "var(--muted-foreground)";
    }
    static border() {
        return "var(--border)";
    }
}
function qooxdooMain(app) {
    const root = app.getRoot();
    root.removeAll();
    root.add(new FlashcardPage(), { edge: 0 });
}
qx.registry.registerMainMethod(qooxdooMain);
class BsButton extends qx.ui.basic.Atom {
    constructor(text, _icon, options) {
        var _a, _b, _c;
        super();
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__variant = (_a = options === null || options === void 0 ? void 0 : options.variant) !== null && _a !== void 0 ? _a : "default";
        this.__size = (_b = options === null || options === void 0 ? void 0 : options.size) !== null && _b !== void 0 ? _b : "default";
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__renderButton((_c = options === null || options === void 0 ? void 0 : options.className) !== null && _c !== void 0 ? _c : "");
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));
    }
    __renderButton(extraClass) {
        const variantMap = {
            default: "primary",
            secondary: "secondary",
            destructive: "destructive",
            outline: "outline",
            ghost: "ghost",
            link: "link",
        };
        const sizePrefix = this.__size === "icon" || this.__size === "sm-icon" || this.__size === "lg-icon"
            ? "icon"
            : this.__size;
        const variantClass = sizePrefix === "default"
            ? `btn-${variantMap[this.__variant]}`
            : `btn-${sizePrefix}-${variantMap[this.__variant]}`;
        this.__htmlButton.setHtml(`
      <center class="p-1 h-full flex items-center justify-center">
        <button type="button" class="w-full ${variantClass} ${extraClass}" tabindex="-1">
          ${this.__buttonText}
        </button>
      </center>
    `);
    }
    getVariant() {
        return this.__variant;
    }
    getSize() {
        return this.__size;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
}
BsButton.events = {
    execute: "qx.event.type.Event",
};
class BsCard extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(0).set({ alignY: "middle", alignX: "center" }));
        this.__content = null;
        this.setAllowGrowX(true);
        this.setAllowGrowY(true);
        this.setBackgroundColor("var(--card)");
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            radius: 8,
            style: "solid",
            width: 1,
            color: "var(--border)",
        }));
    }
    setContent(widget) {
        if (this.__content)
            this.__content.dispose();
        this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox(0).set({ alignY: "middle", alignX: "center" }));
        this.__content.setAllowGrowX(true);
        this.__content.setAllowGrowY(true);
        this.__content.setPadding(24);
        this._add(this.__content);
        this.__content.add(widget);
        return this;
    }
    removeContent() {
        if (this.__content) {
            this._remove(this.__content);
            this.__content.dispose();
            this.__content = null;
        }
        return this;
    }
}
class FlashcardPage extends qx.ui.container.Composite {
    constructor() {
        super();
        this.__cards = [
            { question: "What is HTML used for?", answer: "It structures content on web pages." },
            { question: "What does CSS do?", answer: "It styles and lays out UI elements." },
            {
                question: "What is JavaScript primarily used for in the browser?",
                answer: "To make pages interactive and dynamic.",
            },
            { question: "What is an array?", answer: "An ordered collection of values." },
            { question: "What is a function?", answer: "A reusable block of logic." },
        ];
        this.__currentIndex = 0;
        this.__isFlipped = false;
        this.setLayout(new qx.ui.layout.Grow());
        this.setBackgroundColor(AppColors.background());
        const center = new qx.ui.container.Composite(new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }));
        center.setPadding(16);
        const title = new qx.ui.basic.Label("Digital Flashcard Deck");
        title.setTextColor(AppColors.foreground());
        title.setFont(new qx.bom.Font(24).set({ bold: true }));
        title.setAlignX("center");
        this.__progressLabel = new qx.ui.basic.Label("");
        this.__progressLabel.setTextColor(AppColors.mutedForeground());
        this.__progressLabel.setAlignX("center");
        const card = new BsCard();
        card.setMaxWidth(640);
        card.setAllowGrowX(true);
        this.__cardInner = new qx.ui.embed.Html("");
        this.__cardInner.setMinHeight(260);
        this.__cardInner.setAllowGrowX(true);
        this.__cardInner.setHtml(this.__buildCardHtml());
        card.setContent(this.__cardInner);
        this.__questionLabel = new qx.ui.basic.Label();
        this.__answerLabel = new qx.ui.basic.Label();
        const controls = new qx.ui.container.Composite(new qx.ui.layout.HBox(8).set({ alignY: "middle" }));
        controls.setMaxWidth(640);
        controls.setAllowGrowX(true);
        this.__prevBtn = new BsButton("Previous", undefined, { variant: "outline" });
        const flipBtn = new BsButton("Flip Card", undefined, { variant: "default" });
        this.__nextBtn = new BsButton("Next", undefined, { variant: "outline" });
        this.__prevBtn.onClick(() => this.__goTo(this.__currentIndex - 1));
        flipBtn.onClick(() => this.__toggleFlip());
        this.__nextBtn.onClick(() => this.__goTo(this.__currentIndex + 1));
        controls.add(this.__prevBtn, { flex: 1 });
        controls.add(flipBtn, { flex: 1 });
        controls.add(this.__nextBtn, { flex: 1 });
        center.add(title);
        center.add(this.__progressLabel);
        center.add(card);
        center.add(controls);
        this.add(center);
        const syncWidth = () => {
            const width = Math.max(260, Math.min(640, qx.bom.Viewport.getWidth() - 32));
            card.setWidth(width);
            controls.setWidth(width);
        };
        qx.event.Registration.addListener(window, "resize", syncWidth);
        syncWidth();
        this.__renderState();
    }
    __buildCardHtml() {
        const innerClass = this.__isFlipped ? "flashcard-inner is-flipped" : "flashcard-inner";
        const question = this.__escapeHtml(this.__cards[this.__currentIndex].question);
        const answer = this.__escapeHtml(this.__cards[this.__currentIndex].answer);
        return `
      <div class="flashcard-shell">
        <div class="${innerClass}">
          <div class="flashcard-face flashcard-front">
            <div><p class="text-xs text-muted-foreground mb-2">Question</p><p class="text-lg font-semibold">${question}</p></div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div><p class="text-xs text-muted-foreground mb-2">Answer</p><p class="text-lg font-semibold">${answer}</p></div>
          </div>
        </div>
      </div>
    `;
    }
    __escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    __toggleFlip() {
        this.__isFlipped = !this.__isFlipped;
        this.__renderState();
    }
    __goTo(index) {
        if (index < 0 || index >= this.__cards.length)
            return;
        this.__currentIndex = index;
        this.__isFlipped = false;
        this.__renderState();
    }
    __renderState() {
        this.__cardInner.setHtml(this.__buildCardHtml());
        this.__progressLabel.setValue(`Card ${this.__currentIndex + 1} of ${this.__cards.length}`);
        this.__prevBtn.setEnabled(this.__currentIndex > 0);
        this.__nextBtn.setEnabled(this.__currentIndex < this.__cards.length - 1);
    }
}
