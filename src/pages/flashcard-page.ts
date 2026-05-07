type Flashcard = {
  question: string;
  answer: string;
};

class FlashcardPage extends qx.ui.container.Composite {
  private __cards: Flashcard[] = [
    { question: "What is HTML used for?", answer: "It structures content on web pages." },
    { question: "What does CSS do?", answer: "It styles and lays out UI elements." },
    {
      question: "What is JavaScript primarily used for in the browser?",
      answer: "To make pages interactive and dynamic.",
    },
    { question: "What is an array?", answer: "An ordered collection of values." },
    { question: "What is a function?", answer: "A reusable block of logic." },
  ];
  private __currentIndex = 0;
  private __isFlipped = false;

  private __cardInner: any;
  private __questionLabel: any;
  private __answerLabel: any;
  private __progressLabel: any;
  private __prevBtn: BsButton;
  private __nextBtn: BsButton;

  constructor() {
    super();
    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor(AppColors.background());

    const center = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }),
    );
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

    const controls = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(8).set({ alignY: "middle" }),
    );
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

  private __buildCardHtml(): string {
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

  private __escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private __toggleFlip(): void {
    this.__isFlipped = !this.__isFlipped;
    this.__renderState();
  }

  private __goTo(index: number): void {
    if (index < 0 || index >= this.__cards.length) return;
    this.__currentIndex = index;
    this.__isFlipped = false;
    this.__renderState();
  }

  private __renderState(): void {
    this.__cardInner.setHtml(this.__buildCardHtml());
    this.__progressLabel.setValue(`Card ${this.__currentIndex + 1} of ${this.__cards.length}`);
    this.__prevBtn.setEnabled(this.__currentIndex > 0);
    this.__nextBtn.setEnabled(this.__currentIndex < this.__cards.length - 1);
  }
}
