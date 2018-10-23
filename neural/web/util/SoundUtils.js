function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}
/**
 * @param {GainNode} node
 * @param {number} volume <0,1>
 * @param {number} duration milliseconds!
 */
async function linearRampTo(node, volume, duration) {
    //console.log("RAMP START: ", [node, volume, duration]);
    const start = performance.now();
    const current = node.gain.value;
    let currentReal = current;
    const delta = volume - current;
    const step = delta / duration;
    while (Math.abs(volume - currentReal) > step) {
       // console.log("Ramping: ", current, "-(", step, ")>", volume, "Current:", node.gain.value, currentReal);
        const timeFraction = (performance.now() - start) / duration;
        currentReal = current + delta * timeFraction;
        node.gain.value = currentReal;
        await sleep(0.1);
        if (currentReal > 1 || currentReal < 0) {
            return;
        }
    }
    node.gain.value = volume;
}

export default {
    linearRampTo
};