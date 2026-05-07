function qooxdooMain(app: any) {
  const root = app.getRoot();
  root.removeAll();
  root.add(new FlashcardPage(), { edge: 0 });
}

qx.registry.registerMainMethod(qooxdooMain);
