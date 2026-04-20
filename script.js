(function(){
    const textarea = document.getElementById('textInput');
    const charCountSpan = document.getElementById('charCount');
    const speakBtn = document.getElementById('speakBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const clearBtn = document.getElementById('clearBtn');
    const voiceSelect = document.getElementById('voiceSelect');
    const rateSlider = document.getElementById('rateSlider');
    const rateValue = document.getElementById('rateValue');
    const statusSpan = document.getElementById('statusMsg');

    let synth = window.speechSynthesis;
    let currentUtterance = null;
    let availableVoices = [];
    let isPausedByUser = false;
    let activeSpeakingRequest = false;
    const MAX_CHARS = 3000;

    function updateCharCounter() {
        let rawText = textarea.value;
        if (rawText.length > MAX_CHARS) {
            rawText = rawText.substring(0, MAX_CHARS);
            textarea.value = rawText;
        }
        charCountSpan.innerText = rawText.length;
    }

    textarea.addEventListener('input', updateCharCounter);

    function safeCancel(resetUtterance = true) {
        if (synth.speaking || synth.pending) {
            synth.cancel();
        }
        if (resetUtterance) {
            currentUtterance = null;
        }
        isPausedByUser = false;
        activeSpeakingRequest = false;
    }

    function setStatusMessage(msg, isPersistent = false) {
        statusSpan.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        if (!isPersistent) {
            setTimeout(() => {
                if (statusSpan.innerHTML.includes(msg) && !synth.speaking && !synth.paused) {
                    statusSpan.innerHTML = `<i class="fas fa-circle-info"></i> Ready — type text and press Speak`;
                } else if (synth.speaking && !synth.paused && statusSpan.innerHTML.includes(msg)) {
                    statusSpan.innerHTML = `<i class="fas fa-waveform"></i> Speaking...`;
                }
            }, 2500);
        }
    }

    function updateSpeakingStatus() {
        if (synth.speaking && !synth.paused) {
            statusSpan.innerHTML = `<i class="fas fa-waveform"></i> Speaking...`;
        } else if (synth.paused) {
            statusSpan.innerHTML = `<i class="fas fa-pause-circle"></i> Speech paused`;
        } else if (!synth.speaking && !synth.pending) {
            if (!activeSpeakingRequest) {
                statusSpan.innerHTML = `<i class="fas fa-circle-info"></i> Ready — type text and press Speak`;
            }
        }
    }

    function loadVoices() {
        return new Promise((resolve) => {
            let voices = synth.getVoices();
            if (voices.length) {
                resolve(voices);
            } else {
                synth.addEventListener('voiceschanged', () => {
                    resolve(synth.getVoices());
                }, { once: true });
            }
        });
    }

    function populateVoiceList(voices) {
        availableVoices = voices;
        voiceSelect.innerHTML = '';
        if (!voices.length) {
            let opt = document.createElement('option');
            opt.textContent = 'No voices available';
            opt.disabled = true;
            voiceSelect.appendChild(opt);
            return;
        }
        voices.forEach((voice, idx) => {
            let option = document.createElement('option');
            option.value = idx;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default && !voiceSelect.value) {
                option.selected = true;
            }
            voiceSelect.appendChild(option);
        });
        if (!voiceSelect.value && voices.length) voiceSelect.selectedIndex = 0;
    }

    loadVoices().then(voices => populateVoiceList(voices));

    voiceSelect.addEventListener('change', () => {
        if (availableVoices.length && voiceSelect.value) {
            let idx = parseInt(voiceSelect.value, 10);
            if (!isNaN(idx) && availableVoices[idx]) {
                setStatusMessage(`Voice: ${availableVoices[idx].name}`, false);
            }
        }
    });

    rateSlider.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        rateValue.innerText = val.toFixed(2) + 'x';
    });

    function getCurrentRate() {
        return parseFloat(rateSlider.value);
    }

    function getSelectedVoiceObj() {
        if (!availableVoices.length) return null;
        let idx = parseInt(voiceSelect.value, 10);
        if (isNaN(idx)) return availableVoices[0] || null;
        return availableVoices[idx] || availableVoices[0];
    }

    function prepareUtterance() {
        let rawText = textarea.value.trim();
        if (rawText === "") {
            setStatusMessage("Cannot speak: text is empty", false);
            return null;
        }
        if (rawText.length > MAX_CHARS) {
            rawText = rawText.substring(0, MAX_CHARS);
            textarea.value = rawText;
            updateCharCounter();
        }
        const utterance = new SpeechSynthesisUtterance(rawText);
        const voice = getSelectedVoiceObj();
        if (voice) utterance.voice = voice;
        utterance.rate = getCurrentRate();
        utterance.pitch = 1.0;
        utterance.volume = 1;
        return utterance;
    }

    function attachUtteranceEvents(utterance) {
        utterance.onstart = () => {
            activeSpeakingRequest = true;
            isPausedByUser = false;
            statusSpan.innerHTML = `<i class="fas fa-waveform"></i> Speaking...`;
        };
        utterance.onend = () => {
            activeSpeakingRequest = false;
            currentUtterance = null;
            isPausedByUser = false;
            statusSpan.innerHTML = `<i class="fas fa-circle-info"></i> Ready — type text and press Speak`;
            if (synth.speaking) synth.cancel();
        };
        utterance.onerror = (event) => {
            console.warn("Speech error", event.error);
            activeSpeakingRequest = false;
            let errMsg = "Speech error";
            if (event.error === 'interrupted') errMsg = "Interrupted";
            else if (event.error === 'synthesis-failed') errMsg = "Voice synthesis failed";
            else if (event.error === 'voice-unavailable') errMsg = "Selected voice unavailable";
            setStatusMessage(errMsg, false);
            statusSpan.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errMsg}`;
            currentUtterance = null;
            isPausedByUser = false;
            setTimeout(() => {
                if (!synth.speaking && !synth.paused) updateSpeakingStatus();
            }, 1200);
        };
        utterance.onpause = () => {
            isPausedByUser = true;
            statusSpan.innerHTML = `<i class="fas fa-pause-circle"></i> Speech paused`;
        };
        utterance.onresume = () => {
            isPausedByUser = false;
            statusSpan.innerHTML = `<i class="fas fa-waveform"></i> Speaking...`;
        };
    }

    function handleSpeak() {
        if (synth.speaking && !synth.paused) {
            safeCancel(true);
        }
        if (synth.paused) {
            safeCancel(true);
        }
        if (currentUtterance && (synth.speaking || synth.pending)) {
            safeCancel(true);
        }
        const newUtter = prepareUtterance();
        if (!newUtter) return;
        attachUtteranceEvents(newUtter);
        currentUtterance = newUtter;
        try {
            synth.speak(currentUtterance);
        } catch (err) {
            setStatusMessage("Speech failed: " + err.message, false);
            currentUtterance = null;
            activeSpeakingRequest = false;
        }
    }

    function handlePause() {
        if (synth.speaking && !synth.paused) {
            synth.pause();
            setStatusMessage("Paused", false);
            updateSpeakingStatus();
        } else if (synth.paused) {
            setStatusMessage("Already paused, press Resume", false);
        } else if (!synth.speaking) {
            setStatusMessage("No active speech to pause", false);
        }
    }

    function handleResume() {
        if (synth.paused) {
            synth.resume();
            setStatusMessage("Resumed", false);
            updateSpeakingStatus();
        } else if (synth.speaking && !synth.paused) {
            setStatusMessage("Already speaking", false);
        } else {
            setStatusMessage("Nothing to resume, click Speak", false);
        }
    }

    function handleStop() {
        if (synth.speaking || synth.paused || synth.pending) {
            safeCancel(true);
            setStatusMessage("Stopped", false);
            updateSpeakingStatus();
        } else {
            setStatusMessage("No speech to stop", false);
        }
    }

    function handleClear() {
        if (synth.speaking || synth.paused || synth.pending) {
            safeCancel(true);
        }
        textarea.value = "";
        updateCharCounter();
        setStatusMessage("Text cleared", false);
        updateSpeakingStatus();
    }

    speakBtn.addEventListener('click', handleSpeak);
    pauseBtn.addEventListener('click', handlePause);
    resumeBtn.addEventListener('click', handleResume);
    stopBtn.addEventListener('click', handleStop);
    clearBtn.addEventListener('click', handleClear);

    updateCharCounter();

    setInterval(() => {
        if (!synth.speaking && !synth.paused && activeSpeakingRequest) {
            activeSpeakingRequest = false;
            if (currentUtterance) currentUtterance = null;
            updateSpeakingStatus();
        }
        if (synth.speaking && !synth.paused && !activeSpeakingRequest) {
            activeSpeakingRequest = true;
        }
        if (!synth.speaking && !synth.paused && !activeSpeakingRequest) {
            if (statusSpan.innerHTML.includes("Speaking") || statusSpan.innerHTML.includes("paused")) {
                if (!statusSpan.innerHTML.includes("Ready")) {
                    statusSpan.innerHTML = `<i class="fas fa-circle-info"></i> Ready — type text and press Speak`;
                }
            }
        }
    }, 300);

    window.addEventListener('beforeunload', () => {
        if (synth.speaking) synth.cancel();
    });

    if (typeof window !== 'undefined' && !synth.getVoices().length) {
        setTimeout(() => {
            loadVoices().then(voices => {
                if (voices.length && voiceSelect.options.length <= 1) {
                    populateVoiceList(voices);
                }
            });
        }, 180);
    }
})();