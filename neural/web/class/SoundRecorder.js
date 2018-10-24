import EventEmitter from "../lib/event-emitter.js";

class InternalSample {
    constructor() {
        /** @type {Uint8Array} **/
        this.sample = null;

        this.time = -1;
    }
}


export default class SoundRecorder extends EventEmitter {
    constructor(sampleSize) {
        super();
        /** @type {AudioContext} **/
        this.audioContext = null;
        /** @type {GainNode} **/
        this.inputGain = null;
        /** @type {ScriptProcessorNode} **/
        this.scriptProcessor = null;
        /** @type {AnalyserNode} **/
        this.analyser = null;

        this.sampleSize = sampleSize || 1024;


        // clean means ready to start
        this.clean = false;
        this.baseInit();
    }
    baseInit() {

        this.audioContext = new AudioContext();
        this.inputGain = this.audioContext.createGain();
        this.inputGain.gain.value = 1;
        this.scriptProcessor = this.audioContext.createScriptProcessor(this.sampleSize, 1, 1);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.sampleSize;
        this.smoothingTimeConstant = 0;

        this.inputGain.connect(this.analyser);
        this.analyser.connect(this.scriptProcessor);

        //this._mediaPromise = null;
        this.mediaAllocated = false;

        this.clean = true;
    }
    /**
     * @returns {Promise<MediaStream>}
     * */
    async getMedia() {
        if (!this._mediaPromise) {
            this._mediaPromise = navigator.mediaDevices.getUserMedia({ audio: true });
        }
        const media = await this._mediaPromise;
        this.mediaAllocated = true;
        return media;
    }
    async getFirstAudioStream() {
        return (await this.getMedia()).getAudioTracks()[0];
    }
    /**
     * @returns {Promise<MediaStream>}
     * */
    async initMedia() {
        const media = await this.getMedia();
        console.log("Media INIT!", media);
        this.mediaNode = this.audioContext.createMediaStreamSource(media);
        this.mediaNode.connect(this.inputGain);
        return media;
    }
    async start(no_samples) {
        if (this.started) {
            throw new Error("Cannot start, already running!");
        }
        if (!this.clean) {
            this.baseInit();
        }
        this.started = true;
        /** @type {Promise<InternalSample[]>} **/
        const allSamplePromise = new Promise((resolve, reject) => {
            /** @type {InternalSample[]} **/
            const samples = [];
            for (let i = 0, l = no_samples; i < l; ++i) {
                samples.push({ sample: new Uint8Array(this.sampleSize), time:-1 });
            }
            var lambdaToRemove = null;

            let samplesDone = 0;
            let start = -1;
            let second = 0;

            this.scriptProcessor.addEventListener("audioprocess", lambdaToRemove =
            /**
             * @param {AudioProcessingEvent} event
             * */
                (event) => {
                    if (!this.mediaAllocated) {
                        console.log("Sample before media was allocated!");
                        return;
                    }
                    
                    if (start == -1) {
                        const testSample = new Uint8Array(this.sampleSize);
                        this.analyser.getByteFrequencyData(testSample);
                        let hasNonZero = false;
                        for (let i = 0, l = testSample.length; i < l; ++i) {
                            if (testSample[i] != 0) {
                                hasNonZero = true;
                                break;
                            }
                        }
                        if (!hasNonZero) {
                            console.log("Empty sample!");
                            return;
                        }
                        else {
                            start = performance.now();
                        }
                    }
                    const dt = performance.now() - start;
                    const sec_now = Math.floor(dt / 1000);
                    if (sec_now != second) {
                        second = sec_now;
                        console.log(samplesDone / sec_now, "samples per second.");
                    }
                    //console.log("Sample!", samplesDone, event);

                    this.analyser.getByteFrequencyData(samples[samplesDone].sample);
                    samples[samplesDone].time = dt;
                    ++samplesDone;
                    this.emit("progress", { start: 0, end: no_samples, current: samplesDone, perc: 100 * (samplesDone / no_samples) });
                    //const inputBuffer = event.inputBuffer;
                    //const data = inputBuffer.getChannelData(0);
                    //samples.push(data);
                    if (samplesDone >= no_samples) {
                        this.scriptProcessor.removeEventListener("audioprocess", lambdaToRemove);
                        resolve(samples);
                    }
            });
        });
        
        const media = await this.initMedia();
        const data = await allSamplePromise;
        const mediaStream = await this.getFirstAudioStream();
        
        this.started = false;
        return data;
    }
}

 