class VoiceAnnouncer {
    constructor() {
        this.synth = window.speechSynthesis;
        this.lastAnnounced = {}; // Map of label -> timestamp
        this.cooldown = 5000; // 5 seconds cooldown for same object
    }

    announce(label) {
        if (!label) return;

        const now = Date.now();
        const lastTime = this.lastAnnounced[label] || 0;

        if (now - lastTime > this.cooldown) {
            this.speak(label);
            this.lastAnnounced[label] = now;
        }
    }

    speak(text) {
        if (this.synth.speaking) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;

        // Try to find a Vietnamese voice
        const voices = this.synth.getVoices();
        const viVoice = voices.find(v => v.lang.includes('vi'));
        if (viVoice) {
            utterance.voice = viVoice;
        }

        this.synth.speak(utterance);
    }
}

export const announcer = new VoiceAnnouncer();
