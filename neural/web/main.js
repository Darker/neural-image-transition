import SoundRecorder from "./class/SoundRecorder.js";
import SoundPlayer from "./class/SoundPlayer.js";
import StepButton from "./class/StepButton.js";
const SAMPLE_SIZE = 1024;
const SAMPLE_COUNT = 100;
(async () => {
    const layer_defs = [];
    layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:1}); // last salmple, sample no.
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
    layer_defs.push({ type: 'regression', num_neurons: SAMPLE_SIZE });

    const net = new convnetjs.Net();
    net.makeLayers(layer_defs);
    const trainer = new convnetjs.SGDTrainer(net, { learning_rate: 0.05, momentum: 0.9, batch_size: SAMPLE_COUNT, l2_decay: 0.0 });
    
    const recorder = new SoundRecorder(SAMPLE_SIZE);
    const player = new SoundPlayer();

    /** @type {HTMLButtonElement} **/
    const button_play = document.querySelector("button#play");
    /** @type {HTMLButtonElement} **/
    const button_teach = document.querySelector("button#teach");

    const step = new StepButton(button_teach);
    recorder.on("progress", (evt) => {
        //console.log(evt, "linear-gradient(to right, #1e5799 0%,#2989d8 " + evt.perc + "%,#c0d4ea " + Math.max(100, evt.perc + 1) + "%,#ffffff 100%)");
        if (evt.perc >= 99.9) {
            button_teach.style.background = "";
        }
        else {
            button_teach.style.background = "linear-gradient(to right, #1e5799 0%,#2989d8 " + evt.perc + "%,#c0d4ea " + Math.min(100, evt.perc + 0.01) + "%,#ffffff 100%)";
        }
        
    });
    button_play.addEventListener("click", () => {
        const v = new convnetjs.Vol(1, 1, 1);
        v.w[0] = 0;
        console.log(net.forward(v));
    });

    await recorder.getMedia();
    while (true) {
        await step.clickPromise();
        const data = await recorder.start(SAMPLE_COUNT);
        await player.play(data); //await player.play(data);
        continue;
        const duration = data[data.length - 1].time;

        for (let i = 0, l = data.length; i < l; ++i) {
            const item = data[i];
            const input = new convnetjs.Vol(1, 1, 1);
            input.w[0] = (item.time - duration / 2) / duration;
            //const outputArray = new Float32Array(item.length);
            //for (let offset = 0, loff = item.length; offset < loff; ++offset) {
            //    outputArray[offset] = item[offset]/255;
            //}
            const outputArray = [];
            for (let offset = 0, loff = item.length; offset < loff; ++offset) {
                outputArray.push(item[offset] / 255);
            }

            //const output = new convnetjs.Vol(i / SAMPLE_COUNT);
            trainer.train(input, outputArray)
        }
    }



})();