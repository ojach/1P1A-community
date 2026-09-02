(() => {
  "use strict";

  const elements = {
    settingsView: document.querySelector("#settingsView"),
    timerView: document.querySelector("#timerView"),
    minutes: document.querySelector("#minutes"),
    minutesOutput: document.querySelector("#minutesOutput"),
    modeInputs: [...document.querySelectorAll('input[name="mode"]')],
    seconds: document.querySelector("#seconds"),
    iconInputs: [...document.querySelectorAll('input[name="icon"]')],
    start: document.querySelector("#startButton"),
    urlNote: document.querySelector("#urlNote"),
    pause: document.querySelector("#pauseButton"),
    reset: document.querySelector("#resetButton"),
    display: document.querySelector("#timerDisplay"),
    modeLabel: document.querySelector("#timerMode"),
    status: document.querySelector("#timerStatus")
  };

  const iconChoices = new Set(["blue", "red", "green", "purple"]);
  const defaults = { time: 5, mode: "down", seconds: true, icon: "blue" };
  const initialNavigationConfig = readConfig();
  let config = { ...initialNavigationConfig };
  let startedAt = 0;
  let pausedAt = 0;
  let pausedDuration = 0;
  let animationFrame = 0;
  let running = false;
  let finished = false;
  let audioContext = null;

  function readConfig() {
    const params = new URLSearchParams(location.search);
    const parsedTime = Number.parseInt(params.get("time"), 10);
    return {
      time: Number.isFinite(parsedTime) ? Math.min(60, Math.max(1, parsedTime)) : defaults.time,
      mode: params.get("mode") === "up" ? "up" : defaults.mode,
      seconds: params.get("seconds") !== "off",
      icon: iconChoices.has(params.get("icon")) ? params.get("icon") : defaults.icon
    };
  }

  function currentFormConfig() {
    return {
      time: Number(elements.minutes.value),
      mode: elements.modeInputs.find((input) => input.checked)?.value || defaults.mode,
      seconds: elements.seconds.checked,
      icon: elements.iconInputs.find((input) => input.checked)?.value || defaults.icon
    };
  }

  function writeUrl(nextConfig) {
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("time", String(nextConfig.time));
    url.searchParams.set("mode", nextConfig.mode);
    url.searchParams.set("seconds", nextConfig.seconds ? "on" : "off");
    url.searchParams.set("icon", nextConfig.icon);
    history.replaceState(null, "", url);
    window.ojappRefreshManifest?.();
    return url;
  }

  function canonicalSearch(nextConfig) {
    const params = new URLSearchParams();
    params.set("time", String(nextConfig.time));
    params.set("mode", nextConfig.mode);
    params.set("seconds", nextConfig.seconds ? "on" : "off");
    params.set("icon", nextConfig.icon);
    return `?${params.toString()}`;
  }

  function isSameConfig(first, second) {
    return canonicalSearch(first) === canonicalSearch(second);
  }

  function updatePrimaryAction() {
    const isCommitted = isSameConfig(config, initialNavigationConfig);
    elements.start.textContent = isCommitted ? "Start" : "Use These Settings";
    elements.urlNote.textContent = isCommitted
      ? "You can add this URL to your home screen"
      : "Confirm to open your configured URL";
  }

  function syncForm() {
    elements.minutes.value = String(config.time);
    elements.minutesOutput.textContent = `${config.time} min`;
    elements.modeInputs.forEach((input) => { input.checked = input.value === config.mode; });
    elements.seconds.checked = config.seconds;
    elements.iconInputs.forEach((input) => { input.checked = input.value === config.icon; });
    writeUrl(config);
    updatePrimaryAction();
  }

  function onSettingChange() {
    config = currentFormConfig();
    elements.minutesOutput.textContent = `${config.time} min`;
    writeUrl(config);
    updatePrimaryAction();
  }

  function initializeAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
  }

  function formatTime(milliseconds) {
    const safeMs = Math.max(0, milliseconds);
    const totalSeconds = config.mode === "down"
      ? Math.ceil(safeMs / 1000)
      : Math.floor(safeMs / 1000);

    if (config.seconds) {
      return String(totalSeconds);
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function elapsedAt(now) {
    const effectiveNow = running ? now : pausedAt;
    return Math.max(0, effectiveNow - startedAt - pausedDuration);
  }

  function render(now = Date.now()) {
    const duration = config.time * 60000;
    const elapsed = Math.min(duration, elapsedAt(now));
    const shown = config.mode === "down" ? duration - elapsed : elapsed;
    elements.display.textContent = formatTime(shown);

    if (elapsed >= duration && !finished) finish();
  }

  function tick() {
    render(Date.now());
    if (running) animationFrame = requestAnimationFrame(tick);
  }

  function startTimer() {
    config = currentFormConfig();
    const configuredUrl = writeUrl(config);

    if (!isSameConfig(config, initialNavigationConfig)) {
      location.assign(configuredUrl.href);
      return;
    }

    initializeAudio();
    startedAt = Date.now();
    pausedAt = 0;
    pausedDuration = 0;
    running = true;
    finished = false;
    document.body.classList.remove("finished");
    elements.settingsView.hidden = true;
    elements.timerView.hidden = false;
    elements.display.classList.toggle("seconds-only", config.seconds);
    elements.modeLabel.textContent = `${config.time} min · COUNT ${config.mode === "down" ? "DOWN" : "UP"}`;
    elements.status.textContent = "Running";
    elements.pause.textContent = "Pause";
    tick();
  }

  function togglePause() {
    if (finished) return;
    if (running) {
      running = false;
      pausedAt = Date.now();
      cancelAnimationFrame(animationFrame);
      elements.status.textContent = "Paused";
      elements.pause.textContent = "Resume";
      render(pausedAt);
    } else {
      pausedDuration += Date.now() - pausedAt;
      running = true;
      elements.status.textContent = "Running";
      elements.pause.textContent = "Pause";
      tick();
    }
  }

  function playFinishSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    [0, .22, .44].forEach((delay) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(.22, now + delay + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + .16);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + .18);
    });
  }

  function finish() {
    finished = true;
    running = false;
    cancelAnimationFrame(animationFrame);
    elements.status.textContent = "Time's up!";
    elements.pause.hidden = true;
    document.body.classList.add("finished");
    playFinishSound();
    if (navigator.vibrate) navigator.vibrate([250, 120, 250, 120, 400]);
  }

  function resetTimer() {
    running = false;
    finished = false;
    cancelAnimationFrame(animationFrame);
    document.body.classList.remove("finished");
    elements.pause.hidden = false;
    elements.timerView.hidden = true;
    elements.settingsView.hidden = false;
    config = readConfig();
    syncForm();
  }

  elements.minutes.addEventListener("input", onSettingChange);
  elements.modeInputs.forEach((input) => input.addEventListener("change", onSettingChange));
  elements.seconds.addEventListener("change", onSettingChange);
  elements.iconInputs.forEach((input) => input.addEventListener("change", onSettingChange));
  elements.start.addEventListener("click", startTimer);
  elements.pause.addEventListener("click", togglePause);
  elements.reset.addEventListener("click", resetTimer);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !elements.timerView.hidden) render(Date.now());
  });

  syncForm();
})();
