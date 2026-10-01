import { recordError } from "./lib/error-logs"

window.addEventListener("error", (event) => {
  recordError(event.error ?? event.message, "Browser runtime")
})

window.addEventListener("unhandledrejection", (event) => {
  recordError(event.reason, "Unhandled promise rejection")
})