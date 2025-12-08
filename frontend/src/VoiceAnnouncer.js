class VoiceAnnouncer {
    constructor() {
        this.lastSeen = {}; // Map of label -> timestamp (last time appeared in frame)
        this.lastSpoken = {}; // Map of label -> timestamp (last time we spoke it)

        this.RESET_THRESHOLD = 1000; // If object gone for 1s, treat as new appearance (Faster)
        this.SPEAK_COOLDOWN = 3000; // Reduced cooldown to 3s

        // Audio Queue System
        this.audioQueue = [];
        this.isSpeaking = false;
    }

    // Called every frame with ALL currently detected labels
    announce(currentLabels) {
        if (!currentLabels || currentLabels.length === 0) return;

        const now = Date.now();

        currentLabels.forEach(label => {
            const timeSinceLastSeen = now - (this.lastSeen[label] || 0);

            // Update last seen to now
            this.lastSeen[label] = now;

            // Decision: Should we speak?
            const isNewEntry = timeSinceLastSeen > this.RESET_THRESHOLD;

            // Check global cooldown
            const timeSinceLastSpoken = now - (this.lastSpoken[label] || 0);
            const isCooldownOver = timeSinceLastSpoken > this.SPEAK_COOLDOWN;

            // Priority: If it's a new entry, we really want to say it.
            if (isNewEntry && isCooldownOver) {
                this.speak(label);
                this.lastSpoken[label] = now;
            }
        });
    }

    speak(text) {
        // Prevent queue from getting too long (e.g. if many detections happen at once)
        if (this.audioQueue.length > 5) {
            console.warn("Audio queue full, clearing old items");
            this.audioQueue = [];
        }

        console.log("Queueing speech:", text);
        this.audioQueue.push(text);
        this.processQueue();
    }

    processQueue() {
        if (this.isSpeaking || this.audioQueue.length === 0) return;

        this.isSpeaking = true;
        const text = this.audioQueue.shift();

        console.log("Playing:", text);
        const url = `http://localhost:8000/tts?text=${encodeURIComponent(text)}&t=${Date.now()}`;

        const audio = new Audio(url);

        // Safety timeout in case audio hangs or browser blocks it
        const safetyHook = setTimeout(() => {
            console.warn("Audio timed out, forcing next");
            finish();
        }, 5000);

        const finish = () => {
            // Ensure we only run finish once per audio
            if (!this.isSpeaking && this.audioQueue.length === 0) return;

            clearTimeout(safetyHook);
            this.isSpeaking = false;
            // Add small delay between words
            setTimeout(() => this.processQueue(), 200);
        };

        audio.onended = finish;

        audio.onerror = (e) => {
            console.error("Audio error:", e);
            finish();
        };

        audio.play().catch(e => {
            console.error("Audio play failed:", e);
            finish();
        });
    }
}

export const announcer = new VoiceAnnouncer();
window.announcer = announcer; // For debugging
