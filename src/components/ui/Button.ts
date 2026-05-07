type BsButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";
type BsButtonSize = "default" | "sm" | "lg" | "icon" | "sm-icon" | "lg-icon";

class BsButton extends qx.ui.basic.Atom {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __htmlButton: any;
  private __buttonText: string;
  private __variant: BsButtonVariant;
  private __size: BsButtonSize;

  constructor(
    text?: string,
    _icon?: any,
    options?: { variant?: BsButtonVariant; size?: BsButtonSize; className?: string },
  ) {
    super();
    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__buttonText = text ?? "";
    this.__variant = options?.variant ?? "default";
    this.__size = options?.size ?? "default";

    this.__htmlButton = new qx.ui.embed.Html("");
    this.__renderButton(options?.className ?? "");
    this._add(this.__htmlButton);
    this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));
  }

  private __renderButton(extraClass: string): void {
    const variantMap: Record<BsButtonVariant, string> = {
      default: "primary",
      secondary: "secondary",
      destructive: "destructive",
      outline: "outline",
      ghost: "ghost",
      link: "link",
    };
    const sizePrefix =
      this.__size === "icon" || this.__size === "sm-icon" || this.__size === "lg-icon"
        ? "icon"
        : this.__size;
    const variantClass =
      sizePrefix === "default"
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

  public getVariant(): BsButtonVariant {
    return this.__variant;
  }

  public getSize(): BsButtonSize {
    return this.__size;
  }

  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }
}
