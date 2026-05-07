interface BsButton {
  getVariant():
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  getSize(): "default" | "sm" | "lg" | "icon" | "sm-icon" | "lg-icon";
  onClick(handler: () => void): this;
}

interface BsCard {
  setContent(widget: any): this;
  removeContent(): this;
}
