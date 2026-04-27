type ScreenId = "title-screen" | "fight-screen";

function goTo(id: ScreenId): void {
  document.querySelectorAll<HTMLElement>(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });
  document.getElementById(id)?.classList.remove("hidden");
}

document.getElementById("start-btn")?.addEventListener("click", () => {
  goTo("fight-screen");
});

document.getElementById("back-btn")?.addEventListener("click", () => {
  goTo("title-screen");
});
