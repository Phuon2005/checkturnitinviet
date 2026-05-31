export default defineAppConfig({
  ui: {
    colors: {
      primary: "emerald",
      neutral: "zinc",
    },
    button: {
      slots: {
        base: "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
      },
    },
    card: {
      slots: {
        root: "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-xl transition-all duration-300 hover:shadow-2xl",
      },
    },
    modal: {
      slots: {
        content:
          "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-zinc-800 shadow-2xl",
      },
    },
    pageHero: {
      slots: {
        container: "!py-16 !gap-8",
      },
    },

    pageSection: {
      slots: {
        container: "!py-16",
      },
    },
  },
});
