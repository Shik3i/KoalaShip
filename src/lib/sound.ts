let enabled = true;

export function setSoundEnabled(value: boolean) {
    enabled = value;
    localStorage.setItem('koala_sound', String(value));
}

export function getSoundEnabled() {
    return typeof localStorage === 'undefined' || localStorage.getItem('koala_sound') !== 'false';
}

export function playTone(type: 'purchase' | 'salary' | 'reveal') {
    if (!enabled || typeof AudioContext === 'undefined') return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies = type === 'salary' ? [523, 659, 784] : type === 'reveal' ? [392, 523, 784] : [440, 660];

    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
    oscillator.frequency.setValueAtTime(frequencies[0], context.currentTime);
    frequencies.slice(1).forEach((frequency, index) => {
        oscillator.frequency.setValueAtTime(frequency, context.currentTime + (index + 1) * 0.12);
    });
    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
    oscillator.onended = () => context.close();
}

enabled = getSoundEnabled();
