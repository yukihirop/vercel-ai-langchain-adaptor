module.exports = {
  "*.ts": ["bun run lint", "bun run format"],
  "*": ["bunx cspell --no-must-find-files --config cspell.json"],
};
