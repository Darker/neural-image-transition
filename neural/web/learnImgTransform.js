//const Neuron = synaptic.Neuron,
//    Layer = synaptic.Layer,
//    Network = synaptic.Network,
//    Trainer = synaptic.Trainer,
//    Architect = synaptic.Architect;

//const perceptron = new Architect.Perceptron(27, 8, 3);


layer_defs = [];

layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: 3 }); // 3 inputs: x, y, time
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'maxout' });
layer_defs.push({ type: 'fc', num_neurons: 5 });
layer_defs.push({ type: 'fc', num_neurons: 5 });
layer_defs.push({ type: 'fc', num_neurons: 5 });
layer_defs.push({ type: 'fc', num_neurons: 5 });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'maxout' });
///layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'maxout' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'maxout' });
//layer_defs.push({ type: 'fc', num_neurons: 6, activation: 'maxout' });

//layer_defs.push({ type: 'fc', num_neurons: 6, activation: 'maxout' });
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 8, activation: 'maxout' });
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 8, activation: 'maxout' });
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'relu' });

//layer_defs.push({ type: 'fc', num_neurons: 27});
//layer_defs.push({ type: 'fc', num_neurons: 8 });
//layer_defs.push({ type: 'fc', num_neurons: 4, activation: 'maxout' });
//layer_defs.push({ type: 'fc', num_neurons: 3});
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'tanh' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
//layer_defs.push({ type: 'fc', num_neurons: 1, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });
//layer_defs.push({ type: 'fc', num_neurons: 5, activation: 'sigmoid' });

//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'relu' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'relu' });
//layer_defs.push({ type: 'regression', num_neurons: 3 }); // 3 outputs: r,g,b 
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'tanh' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'tanh' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'tanh' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'tanh' });
//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'tanh' });

//layer_defs.push({ type: 'fc', num_neurons: 20, activation: 'tanh' });
//layer_defs.push({ type: 'fc', num_neurons: 3, activation: 'tanh' });
//layer_defs.push({ type: 'softmax', num_classes: 3 });

//layer_defs.push({ type: 'fc', num_neurons: 10, activation: 'relu', drop_prob: 0.5 });
layer_defs.push({ type: 'regression', num_neurons: 3 }); // 3 outputs: r,g,b 
const net = new convnetjs.Net();
net.makeLayers(layer_defs);
// stochastic gradient descent decay
const trainer = new convnetjs.SGDTrainer(net, { learning_rate: 0.1, momentum: 0.1, batch_size: 1, l2_decay: 0.95});

//const trainer = new convnetjs.Trainer(net, {
//    method: 'adadelta',
//    l2_decay: 0.000001,
//    batch_size: 1
//});
//const trainer = new convnetjs.SGDTrainer(net, { learning_rate: 0.01, momentum: 0.4, batch_size: 1, l2_decay: 0.001 });

function teachCoordinate(x, y, time, width, height, r, g, b, preparedInput,preparedOutput) {
    const result = preparedOutput||[0,0,0]; // r g b
    const v = preparedInput||new convnetjs.Vol(1, 1, 3);
    v.w[0] = (x - width / 2) / width;
    v.w[1] = (y - height / 2) / height;
    v.w[2] = time;

    result[0] = r / 255;
    result[1] = g / 255;
    result[2] = b / 255;
    //if ((x % 50 == 0 || y % 50 == 0)&&(r!=255||g!=255||b!=255)) {
    //    console.log("Teach: ", v.w, "->", result);
    //}
    if (isNaN(v.w[0]) || isNaN(v.w[1]) || isNaN(v.w[2])
        || isNaN(result[0]) || isNaN(result[1]) || isNaN(result[2])
    ) {
        console.warn("Invalid: ", v.w, "->", result, { r, g, b }, { x, y });
        throw new Error("Invalid data for coords " + x + "," + y);
    }
    var stats = trainer.train(v, result);
}

const imgPreset = ["images/v2/1.png", "images/v2/2.png", "images/v2/3.png", "images/v2/4.png"];
//const imgPreset = ["images/1.png", "images/2.png", "images/3.png", "images/4.png", "images/5.png"];
/** @type {HTMLCanvasElement[]} **/
const images = [];
/** @type {HTMLInputElement} **/
const finput = document.querySelector("#images input#imagefile");
/** @type {HTMLButtonElement} **/
const faddbutton = document.querySelector("#images button#fromfile");
/** @type {HTMLButtonElement} **/
const paddbutton = document.querySelector("#images button#frompreset");
/** @type {HTMLDivElement} **/
const divimglist = document.querySelector("#imglist");
/** @type {HTMLCanvasElement} **/
const outputCanvas = document.querySelector("canvas#outcanvas");
/** @type {HTMLInputElement} **/
const timeSelect = document.querySelector("input#timeinput");

const buttonteach = document.querySelector("button#teach");
const buttonteachfix = document.querySelector("button#teachFix");
const buttongenerate = document.querySelector("button#generate");
const buttonplay = document.querySelector("button#play");

faddbutton.addEventListener("click", addImageClicked);
paddbutton.addEventListener("click", addPresetClicked);

buttonteach.addEventListener("click", teachClicked);
buttonteachfix.addEventListener("click", teachFixClicked);
buttongenerate.addEventListener("click", generateClicked);
buttonplay.addEventListener("click", play);

async function addImageClicked() {
    finput.disabled = true;
    faddbutton.disabled = true;
    paddbutton.disabled = true;

    for (const file of finput.files) {
        await addImageFile(file);
    }
    finput.disabled = false;
    faddbutton.disabled = false;
    paddbutton.disabled = false;
    finput.value = "";
}
async function addPresetClicked() {
    finput.disabled = true;
    faddbutton.disabled = true;
    paddbutton.disabled = true;
    
    for (const imgurl of imgPreset) {
        await addImageURL(imgurl);
    }
    finput.disabled = false;
    faddbutton.disabled = false;
    paddbutton.disabled = false;
}
function teachClicked(e) {
    teachAll();
    if (e.ctrlKey) {
        showAll();
    }
}
function teachFixClicked(e) {
    teachAll(true);
    if (e.ctrlKey) {
        showAll();
    }
}
/**
 * 
 * @param {MouseEvent} e
 */
function generateClicked(e) {
    if (e.ctrlKey) {
        showAll();
    }
    else {
        createImage(timeSelect.value * 1,true);
    }
}
function save() {
    const a = document.createElement("a");
    a.appendChild(new Text("dl"));
    const data = JSON.stringify(net.toJSON());
    a.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
    //console.log(a.href);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 1);
}
/**
 * 
 * @param {File} file
 * @returns {string}
 */
function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
        const fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result);
        };
        fr.onerror = () => {
            reject(fr.error);
        };
        fr.readAsDataURL(file);    // begin reading
    });
}
/**
 * 
 * @param {string} dataURL
 */
function dataUrlToNewImage(dataURL) {
    return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = (error) => {
            reject(new Error("Failed to load '"+img.src+"'. Full error: "+error.message));
        };
        img.src = dataURL;
    });
}
function timeout(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, time);
    });
}
/**
 * 
 * @param {File} imageFile
 */
async function addImageFile(imageFile) {
    
    const url = await fileToDataURL(imageFile);
    const img = await dataUrlToNewImage(url);
    addImage(img);
}
/**
 * 
 * @param {string} imageURL
 */
async function addImageURL(imageURL) {
    const img = await dataUrlToNewImage(imageURL);
    addImage(img);
}
/**
 * 
 * @param {Image} imageObject
 */
async function addImage(imageObject) {
    const canvas = document.createElement("canvas");
    canvas.width = imageObject.width;
    canvas.height = imageObject.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(imageObject, 0, 0);
    images.push(canvas);
    divimglist.appendChild(canvas);
}
function teachAll(retraining=false) {
    const timeEnd = images.length-1;
    let time = 0;
    console.log("Teaching " + (timeEnd + 1) + " images total.");

    const preparedResult = new Float64Array(3);
    const preparedInput = new convnetjs.Vol(1, 1, 3);
    for (const image of images) {
        /** @type {CanvasRenderingContext2D} **/
        const ctx = image.getContext('2d');
        const width = image.width;
        const height = image.height;
        const data = ctx.getImageData(0, 0, width, height);
        const dataValues = data.data;
        

        
        const relativeTime = timeEnd==0?0:(time - timeEnd / 2) / timeEnd;
        console.log("Teaching " + (time + 1) + "/" + (timeEnd + 1) + " - " + width + "x" + height + " - TIME:" + relativeTime);

        const compareData = retraining ? createImage(relativeTime) : null;
        const compareDataValues = compareData ? compareData.data : null;
        let off = 0;

        for (let cy = 0; cy < height; ++cy) {
            for (let cx = 0; cx < width; ++cx) {
                if (compareData) {
                    if (dataValues[off * 4 + 0] == compareDataValues[off * 4 + 0]
                        && dataValues[off * 4 + 1] == compareDataValues[off * 4 + 1]
                        && dataValues[off * 4 + 2] == compareDataValues[off * 4 + 2]
                    ) {
                        continue;
                    }
                }

                teachCoordinate(
                    cx, cy,
                    relativeTime,
                    width, height,
                    dataValues[off * 4 + 0], dataValues[off * 4 + 1], dataValues[off * 4 + 2],
                    preparedInput,
                    preparedResult
                );
                off++;
            }
        }

        ++time;
    }
}
function createImage(time, display=false) {
    console.log("Generating output for time: ", time);

    const margin = (!display) && typeof window.datamargin === "number" ? window.datamargin:0;
    var W = outputCanvas.width;
    var H = outputCanvas.height;

    //const maxX = margin * 2 + W;
    //const maxY = margin * 2 + H;

    const scaleX = (margin + W)/W;
    const scaleY = (margin + H)/H;

    /** @type {ImageData} **/
    var g = new ImageData(W, H);

    var v = new convnetjs.Vol(1, 1, 3);
    v.w[2] = time;
    
    for (var x = 0; x < W; x++) {
        v.w[0] = ((x - W/ 2) / W)*scaleX;
        for (var y = 0; y < H; y++) {
            v.w[1] = ((y  - H / 2) / H)*scaleY;

            const ix = ((W * y) + x) * 4;
            var r = net.forward(v);

            //if (ix % 160 == 0) {
            //    console.log(v.w, " -> ", r.w);
            //}

            g.data[ix + 0] = Math.floor(256 * r.w[0]);
            g.data[ix + 1] = Math.floor(256 * r.w[1]);
            g.data[ix + 2] = Math.floor(256 * r.w[2]);
            g.data[ix + 3] = 255; // alpha...

            //if (x == 0 && y == 0) {
            //    console.log("First pixel: ", [x, y], [...v.w], ix);
            //}
            //else if (x + 1 >= maxX && y + 1 >= maxY) {
            //    console.log("Last pixel: ", [x, y], [...v.w], ix);
            //}
        }

    }

    //console.log("Data: ", g);

    if (display) {

        const ctx = outputCanvas.getContext("2d");
        ctx.putImageData(g, 0, 0);
    }
    return g;
}
async function play() {
    buttongenerate.disabled = true;
    buttonplay.disabled = true;

    const totalTime = 10 * 1000;
    const timeStep = 1000 / 30;
    const startTime = performance.now();
    const endTime = totalTime + startTime;

    while (true) {
        const beforeGenerate = performance.now();
        if (beforeGenerate + timeStep > endTime) {
            break;
        }
        const timeFloat = (beforeGenerate - startTime) / totalTime;
        timeSelect.value = timeFloat;
        createImage(timeFloat,true);
        const remainingTime = (performance.now() - beforeGenerate) - timeStep;
        if (remainingTime > 0) {
            await timeout(remainingTime);
        }
        else {
            await timeout(0);
        }
    }

    buttongenerate.disabled = false;
    buttonplay.disabled = false;
}
function showAll() {
    const genlist = document.querySelector("#genlist");
    genlist.innerHTML = "";
    const rect = genlist.getBoundingClientRect();
    const genlistWidth = rect.right - rect.left;

    const imgWidth = images[0].width;
    const maxImages = Math.floor(genlistWidth / imgWidth);

    for (let i = 0; i < maxImages; ++i) {
        const time = i / (maxImages - 1);
        const data = createImage(time);
        const cvas = document.createElement("canvas");
        //cvas.title = "DATA: [" + data.width + "," + data.height + "]";
        cvas.width = data.width;
        cvas.height = data.height;
        cvas.getContext("2d").putImageData(data, 0, 0);
        genlist.appendChild(cvas);
    }
}