import SoundUtils from "../util/SoundUtils.js";
import EventEmitter from "../lib/event-emitter.js";
function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

class SoundPlayer extends EventEmitter  {
    constructor() {
        super();
        /** @type {AudioContext} **/
        this.audioContext = null;
        /** @type {ScriptProcessorNode} **/
        this.scriptProcessor = null;
        /** @type {AnalyserNode} **/
        this.analyser = null;
        

        // clean means ready to start
        this.clean = false;
        this.baseInit();
    }
    baseInit() {
        this.audioContext = new AudioContext();
        this.inputGainOdd = this.audioContext.createGain();
        this.inputGainEven = this.audioContext.createGain();
        this.merger = this.audioContext.createChannelMerger(2);

        this.inputGainEven.connect(this.merger);
        this.inputGainOdd.connect(this.merger);

        this.merger.connect(this.audioContext.destination)

        this.clean = true;
    }
    /**
     * 
     * @param {{time:number, sample:Uint8Array}[]} samples
     */
    async play(samples) {
        if (this.isPlaying) {
            throw new Error("Cannot play two audios at once!");

        }
        this.isPlaying = true;
        console.log("START PLAY");
        const START_TIME = new Date().getTime();

        const oscilatorEven = this.audioContext.createOscillator();
        const oscilatorOdd = this.audioContext.createOscillator();

        const BASE_FREQ = 20;
        oscilatorEven.frequency.value = BASE_FREQ;
        oscilatorOdd.frequency.value = BASE_FREQ;

        oscilatorEven.channelCount = 1;
        oscilatorOdd.channelCount = 1;

        oscilatorEven.connect(this.inputGainEven);
        oscilatorOdd.connect(this.inputGainOdd);

        oscilatorEven.start();
        //oscilatorOdd.start();


        let ctime = 0;
        const ssize = samples[0].sample.length;
        const real_duration = samples[samples.length-1].time;
        const imaginary = new Float32Array(ssize + 1);
        const half255 = 255 / 2;

        const currentWave = new Float32Array(ssize + 1);
        const nextWave = new Float32Array(ssize + 1);
        const transition = new Float32Array(ssize + 1);

        const deltas = new Float64Array(ssize + 1);

        let current = {
            gain: this.inputGainOdd,
            oscilator: oscilatorOdd,
            wave: currentWave
        };
        let next = {
            gain: this.inputGainEven,
            oscilator: oscilatorEven,
            wave: nextWave
        };


        const SPEED = 1;
        const VOLUME_DELAY = 5;
        const VOLUME_DELAY_SECS = (VOLUME_DELAY / 1000) * SPEED;

        const START = performance.now();
        const diffArray = new Float64Array(transition.length);

        for (let i = 0, l = samples.length; i < l; ++i) {

            let tmp = current;
            current = next;
            next = tmp;

            const sample = samples[i];
            ctime = sample.time;
            const sampleData = sample.sample;


            const real = next.wave;
            real[0] = 0;

            //const calculateStart = performance.now();
            // convert 0->255 to -1.0->1.0
            for (let is = 0, ls = sampleData.length; is < ls; ++is) {
                //ls-(is+1)
                //is+1
                const floatValue = sampleData[is] / 255;
                real[is + 1] = floatValue;//(sampleData[is] - half255) / half255;
                //deltas[is + 1] = floatValue - current.wave[is + 1];
            }
            //console.log("Sample conversion: ", (performance.now() - calculateStart));
            //console.log(sample.time, );
            //break;

            let now = performance.now();
            console.log(sample.time, now - START);
            //this.emit("progress", { start: 0, end: real_duration, current: now - START, perc: 100 * ((now - START) / real_duration) });

            const realSampleTime = sample.time * SPEED;
            let remainingToNextSample = realSampleTime - (now - START);
            const startRemaining = remainingToNextSample;
            while (remainingToNextSample > 0) {
                const progress = (startRemaining - remainingToNextSample) / startRemaining;
                const inverseProgress = 1 - progress;
                for (let i = 1, l = transition.length; i < l; ++i) {
                    transition[i] = (current.wave[i] * inverseProgress + next.wave[i] * progress)/2;
                }
                //{disableNormalization: true}
                const wave = this.audioContext.createPeriodicWave(transition, imaginary);
                oscilatorEven.setPeriodicWave(wave);

                now = performance.now();
                remainingToNextSample = realSampleTime - (now - START);
                if (remainingToNextSample>1)
                    await sleep(1);
            }
            //let sumDiff = 0;
            //for (let i = 0, l = transition.length; i < l; ++i) {
            //    sumDiff += Math.abs(transition[i] - next.wave[i]);
            //}
            //console.log(sumDiff)
            const wave = this.audioContext.createPeriodicWave(next.wave, imaginary);
            if (remainingToNextSample > 0) {
                await sleep(remainingToNextSample);
            }

            
        }
        this.isPlaying = false;
        //current.oscilator.stop()
        //next.oscilator.stop()


        current.oscilator.disconnect();
        next.oscilator.disconnect();
        const END_TIME = new Date().getTime();
 
        console.log("STOP PLAY");
        console.log("Duration: ", END_TIME - START_TIME);
        console.log("Recording duration: ", real_duration);

    }
}

export default SoundPlayer;