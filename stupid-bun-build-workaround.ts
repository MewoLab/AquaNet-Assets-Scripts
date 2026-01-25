import { build } from "vite"
build().then(() => process.exit())
// For some reason, Vite doesn't exit upon finishing its build when run in Bun.
// I have no clue why. If someone knows why, please correct it.
// -May