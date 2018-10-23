import SoundUtils from "../util/SoundUtils.js";
function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

class SoundPlayer {
    constructor() {
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

        const BASE_FREQ = 60;
        oscilatorEven.frequency.value = BASE_FREQ;
        oscilatorOdd.frequency.value = BASE_FREQ;

        oscilatorEven.connect(this.inputGainEven);
        oscilatorOdd.connect(this.inputGainOdd);

        oscilatorEven.start();
        oscilatorOdd.start();


        let ctime = 0;
        const ssize = samples[0].sample.length;
        const real_duration = samples[samples.length-1].time;
        const imaginary = new Float32Array(ssize + 1);
        const half255 = 255 / 2;
        
        let current = { gain: this.inputGainOdd, oscilator: oscilatorOdd };
        let next = { gain: this.inputGainEven, oscilator: oscilatorEven };


        const SPEED = 4;
        const VOLUME_DELAY = 5;
        const VOLUME_DELAY_SECS = (VOLUME_DELAY / 1000) * SPEED;

        const START = performance.now();

        for (let i = 0, l = samples.length; i < l; ++i) {

            let tmp = current;
            current = next;
            next = tmp;
            
            const sample = samples[i];


            ctime = sample.time;
            const real = new Float32Array(ssize + 1);
            real[0] = 0;

            const sampleData = sample.sample;



            // convert 0->255 to -1.0->1.0
            for (let is = 0, ls = sampleData.length; is < ls; ++is) {
                //ls-(is+1)
                //is+1
                real[is + 1] = sampleData[is] / 255;//(sampleData[is] - half255) / half255;
            }
            console.log(real, sample.sample,sample.time);
            //break;

        
            const wave = this.audioContext.createPeriodicWave(real, imaginary);

            const now = performance.now();
            const remainingToNextSample = sample.time * SPEED - (now - START);

            if (remainingToNextSample > 0) {
                await sleep(remainingToNextSample);
            }

            current.oscilator.setPeriodicWave(wave);
            SoundUtils.linearRampTo(current.gain, 1, VOLUME_DELAY);
            await SoundUtils.linearRampTo(next.gain, 0, VOLUME_DELAY);


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