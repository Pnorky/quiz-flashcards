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
  private __flipAllMode = false;
  private __seenCardIndexes = new Set<number>();
  private __correctedCardIndexes = new Set<number>();
  private __sessionFlips = 0;
  private __editorMode: "add" | "edit" = "add";

  private __cardInner: any;
  private __progressLabel: any;
  private __prevBtn: BsButton;
  private __nextBtn: BsButton;
  private __flipAllBtn: any;
  private __statsLabel: any;
  private __editorModeLabel: any;
  private __editorQuestionInput: any;
  private __editorAnswerInput: any;
  private __editorHintLabel: any;

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

    const studyControls = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(8).set({ alignY: "middle" }),
    );
    studyControls.setMaxWidth(640);
    studyControls.setAllowGrowX(true);

    const shuffleBtn = new BsButton("Shuffle", undefined, { variant: "outline" });
    const restartBtn = new BsButton("Restart Session", undefined, {
      variant: "outline",
    });
    this.__flipAllBtn = new qx.ui.form.ToggleButton("Flip-all: Off");
    this.__flipAllBtn.setAllowGrowX(true);
    this.__flipAllBtn.addListener("changeValue", () => {
      this.__flipAllMode = !!this.__flipAllBtn.getValue();
      this.__flipAllBtn.setLabel(this.__flipAllMode ? "Flip-all: On" : "Flip-all: Off");
      if (this.__flipAllMode) {
        this.__correctedCardIndexes.add(this.__currentIndex);
      }
      this.__renderState();
    });
    shuffleBtn.onClick(() => this.__shuffleCards());
    restartBtn.onClick(() => this.__restartSession());

    studyControls.add(shuffleBtn, { flex: 1 });
    studyControls.add(restartBtn, { flex: 1 });
    studyControls.add(this.__flipAllBtn, { flex: 1 });

    const statsCard = new BsCard();
    statsCard.setMaxWidth(640);
    const statsWrap = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    const statsTitle = new qx.ui.basic.Label("Session Stats");
    statsTitle.setTextColor(AppColors.foreground());
    statsTitle.setFont(new qx.bom.Font(14).set({ bold: true }));
    this.__statsLabel = new qx.ui.basic.Label("");
    this.__statsLabel.setTextColor(AppColors.mutedForeground());
    this.__statsLabel.setWrap(true);
    statsWrap.add(statsTitle);
    statsWrap.add(this.__statsLabel);
    statsCard.setContent(statsWrap);

    const editorCard = new BsCard();
    editorCard.setMaxWidth(640);
    const editorWrap = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    editorWrap.setAllowGrowX(true);
    const editorTitle = new qx.ui.basic.Label("Card Editor");
    editorTitle.setTextColor(AppColors.foreground());
    editorTitle.setFont(new qx.bom.Font(14).set({ bold: true }));
    this.__editorModeLabel = new qx.ui.basic.Label("");
    this.__editorModeLabel.setTextColor(AppColors.mutedForeground());
    const modeRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(8).set({ alignY: "middle" }),
    );
    const modeAddBtn = new BsButton("Add Mode", undefined, { variant: "outline" });
    const modeEditBtn = new BsButton("Edit Current", undefined, { variant: "outline" });
    modeAddBtn.onClick(() => {
      this.__editorMode = "add";
      this.__syncEditorFields();
      this.__renderState();
    });
    modeEditBtn.onClick(() => {
      this.__editorMode = "edit";
      this.__syncEditorFields();
      this.__renderState();
    });
    modeRow.add(modeAddBtn, { flex: 1 });
    modeRow.add(modeEditBtn, { flex: 1 });

    this.__editorQuestionInput = new qx.ui.form.TextField();
    this.__editorQuestionInput.setPlaceholder("Question");
    this.__editorAnswerInput = new qx.ui.form.TextArea();
    this.__editorAnswerInput.setPlaceholder("Answer");
    this.__editorAnswerInput.setMinHeight(90);
    this.__editorHintLabel = new qx.ui.basic.Label("");
    this.__editorHintLabel.setTextColor(AppColors.mutedForeground());
    this.__editorHintLabel.setWrap(true);

    const editorActionRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(8).set({ alignY: "middle" }),
    );
    const saveBtn = new BsButton("Save", undefined, { variant: "default" });
    const deleteBtn = new BsButton("Delete Current", undefined, {
      variant: "destructive",
    });
    saveBtn.onClick(() => this.__saveEditorCard());
    deleteBtn.onClick(() => this.__deleteCurrentCard());
    editorActionRow.add(saveBtn, { flex: 1 });
    editorActionRow.add(deleteBtn, { flex: 1 });

    editorWrap.add(editorTitle);
    editorWrap.add(this.__editorModeLabel);
    editorWrap.add(modeRow);
    editorWrap.add(this.__editorQuestionInput);
    editorWrap.add(this.__editorAnswerInput, { flex: 1 });
    editorWrap.add(editorActionRow);
    editorWrap.add(this.__editorHintLabel);
    editorCard.setContent(editorWrap);

    center.add(title);
    center.add(this.__progressLabel);
    center.add(card);
    center.add(controls);
    center.add(studyControls);
    center.add(statsCard);
    center.add(editorCard);
    this.add(center);

    const syncWidth = () => {
      const width = Math.max(260, Math.min(640, qx.bom.Viewport.getWidth() - 32));
      card.setWidth(width);
      controls.setWidth(width);
      studyControls.setWidth(width);
      statsCard.setWidth(width);
      editorCard.setWidth(width);
    };
    qx.event.Registration.addListener(window, "resize", syncWidth);
    syncWidth();

    this.__syncEditorFields();
    this.__renderState();
  }

  private __buildCardHtml(): string {
    if (this.__cards.length === 0) {
      return `
        <div class="flashcard-shell">
          <div class="flashcard-inner">
            <div class="flashcard-face flashcard-front">
              <div>
                <p class="text-lg font-semibold">No cards yet</p>
                <p class="text-sm text-muted-foreground mt-2">Use Add Mode to create your first card.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const showAnswerSide = this.__flipAllMode || this.__isFlipped;
    if (showAnswerSide) {
      this.__correctedCardIndexes.add(this.__currentIndex);
    }
    const innerClass = this.__isFlipped ? "flashcard-inner is-flipped" : "flashcard-inner";
    const effectiveClass = this.__flipAllMode ? "flashcard-inner is-flipped" : innerClass;
    const card = this.__cards[this.__currentIndex];
    const question = this.__escapeHtml(card.question);
    const answer = this.__escapeHtml(card.answer);
    return `
      <div class="flashcard-shell">
        <div class="${effectiveClass}">
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
    if (this.__cards.length === 0) return;
    this.__isFlipped = !this.__isFlipped;
    this.__sessionFlips += 1;
    if (this.__isFlipped || this.__flipAllMode) {
      this.__correctedCardIndexes.add(this.__currentIndex);
    }
    this.__renderState();
  }

  private __goTo(index: number): void {
    if (index < 0 || index >= this.__cards.length) return;
    this.__currentIndex = index;
    this.__isFlipped = false;
    this.__markViewed();
    this.__syncEditorFields();
    this.__renderState();
  }

  private __shuffleCards(): void {
    if (this.__cards.length < 2) return;
    const currentCard = this.__cards[this.__currentIndex];
    for (let i = this.__cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.__cards[i], this.__cards[j]] = [this.__cards[j], this.__cards[i]];
    }
    const nextIndex = this.__cards.findIndex((entry) => entry === currentCard);
    this.__currentIndex = nextIndex >= 0 ? nextIndex : 0;
    this.__isFlipped = false;
    this.__markViewed();
    this.__syncEditorFields();
    this.__renderState();
  }

  private __restartSession(): void {
    this.__currentIndex = this.__cards.length > 0 ? 0 : -1;
    if (this.__currentIndex < 0) this.__currentIndex = 0;
    this.__isFlipped = false;
    this.__flipAllMode = false;
    this.__flipAllBtn.setValue(false);
    this.__flipAllBtn.setLabel("Flip-all: Off");
    this.__seenCardIndexes.clear();
    this.__correctedCardIndexes.clear();
    this.__sessionFlips = 0;
    this.__markViewed();
    this.__syncEditorFields();
    this.__renderState();
  }

  private __saveEditorCard(): void {
    const question = this.__editorQuestionInput.getValue()?.trim() ?? "";
    const answer = this.__editorAnswerInput.getValue()?.trim() ?? "";
    if (!question || !answer) {
      this.__editorHintLabel.setValue("Question and answer are required.");
      return;
    }

    if (this.__editorMode === "add" || this.__cards.length === 0) {
      this.__cards.push({ question, answer });
      this.__currentIndex = this.__cards.length - 1;
      this.__editorHintLabel.setValue("New card added.");
    } else {
      this.__cards[this.__currentIndex] = { question, answer };
      this.__editorHintLabel.setValue("Current card updated.");
    }

    this.__isFlipped = false;
    this.__markViewed();
    this.__syncEditorFields();
    this.__renderState();
  }

  private __deleteCurrentCard(): void {
    if (this.__cards.length === 0) {
      this.__editorHintLabel.setValue("No card to delete.");
      return;
    }

    this.__cards.splice(this.__currentIndex, 1);
    if (this.__cards.length === 0) {
      this.__currentIndex = 0;
      this.__isFlipped = false;
      this.__seenCardIndexes.clear();
      this.__correctedCardIndexes.clear();
      this.__editorMode = "add";
      this.__editorHintLabel.setValue("Card deleted. Deck is now empty.");
    } else {
      if (this.__currentIndex >= this.__cards.length) {
        this.__currentIndex = this.__cards.length - 1;
      }
      this.__isFlipped = false;
      this.__editorHintLabel.setValue("Card deleted.");
      this.__markViewed();
    }

    this.__syncEditorFields();
    this.__renderState();
  }

  private __syncEditorFields(): void {
    const hasCards = this.__cards.length > 0;
    const current = hasCards ? this.__cards[this.__currentIndex] : null;
    if (this.__editorMode === "add") {
      this.__editorModeLabel.setValue("Mode: Add");
      this.__editorQuestionInput.setValue("");
      this.__editorAnswerInput.setValue("");
      return;
    }

    this.__editorModeLabel.setValue("Mode: Edit current");
    if (!current) {
      this.__editorQuestionInput.setValue("");
      this.__editorAnswerInput.setValue("");
      return;
    }

    this.__editorQuestionInput.setValue(current.question);
    this.__editorAnswerInput.setValue(current.answer);
  }

  private __markViewed(): void {
    if (this.__cards.length === 0) return;
    this.__seenCardIndexes.add(this.__currentIndex);
    if (this.__flipAllMode || this.__isFlipped) {
      this.__correctedCardIndexes.add(this.__currentIndex);
    }
  }

  private __renderState(): void {
    this.__markViewed();
    this.__cardInner.setHtml(this.__buildCardHtml());
    const hasCards = this.__cards.length > 0;
    if (hasCards) {
      this.__progressLabel.setValue(`Card ${this.__currentIndex + 1} of ${this.__cards.length}`);
    } else {
      this.__progressLabel.setValue("Card 0 of 0");
    }
    this.__prevBtn.setEnabled(hasCards && this.__currentIndex > 0);
    this.__nextBtn.setEnabled(hasCards && this.__currentIndex < this.__cards.length - 1);
    this.__statsLabel.setValue(
      `Viewed: ${this.__seenCardIndexes.size} | Flips: ${this.__sessionFlips} | Corrected: ${this.__correctedCardIndexes.size}`,
    );
  }
}
