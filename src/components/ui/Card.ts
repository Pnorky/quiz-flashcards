class BsCard extends qx.ui.container.Composite {
  private __content: any = null;

  constructor() {
    super(new qx.ui.layout.VBox(0).set({ alignY: "middle", alignX: "center" }));
    this.setAllowGrowX(true);
    this.setAllowGrowY(true);
    this.setBackgroundColor("var(--card)");
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        radius: 8,
        style: "solid",
        width: 1,
        color: "var(--border)",
      }),
    );
  }

  setContent(widget: any): this {
    if (this.__content) this.__content.dispose();
    this.__content = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0).set({ alignY: "middle", alignX: "center" }),
    );
    this.__content.setAllowGrowX(true);
    this.__content.setAllowGrowY(true);
    this.__content.setPadding(24);
    this._add(this.__content);
    this.__content.add(widget);
    return this;
  }

  removeContent(): this {
    if (this.__content) {
      this._remove(this.__content);
      this.__content.dispose();
      this.__content = null;
    }
    return this;
  }
}
