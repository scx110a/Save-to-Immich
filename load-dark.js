const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.body.classList.toggle('dark-mode', prefersDark);