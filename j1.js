let audioCtxMem = Array();
let audioCtxSubs = new Map();
let audioCtxPads = new Map();
let magic = new Map();
let json = Array();
let triggerCnt = 8;
let KEYDOWN = "";
let counting = Array();
let nextNoteTime = 0.0;
let timerID = null;
let pulseTime = 1;
let lfo = null;
let clicker = 0;
let lfo_wave = "square";
let pulse_wave = "sine";
let VCO = new Map();
let interSyncPads = new Map();
let padsOnOff = new Map();
const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
let tempo = 60.0;
let currentNote = 0;
let currentChannel = 0;

function newVCO(ths)
{
    
    VCO.set(ths.value, magic);

}

function cutVCO(ths)
{
    singleReboot(ths);
}


function newIntersect(osc)
{
    if (!interSyncPads.has(osc.value))
    {
        var fi = interSyncPads.get(osc.value);
        for (var x of fi.keys())
        {
            for (var c of document.getElementsByClassName(triggers))
            {
                if (c.getAttribute("active").indexOf(osc.value) >= 0)
                    c.classList.toggle("on");
                else
                    c.classList.toggle("off");
            }
        }
        interSyncPads.set(osc.value, fi);
    }
}

// extend to triggers being reset to active bool
function backIntersect(osc)
{
    var x = osc.value
    audioCtxPads = interSyncPads.get(x);
    
    for (var c of audioCtxPads.keys())
    {
        
        if (audioCtxPads.get(c) != null || audioCtxPads.get(c) != undefined)
            continue;
        for (var d of audioCtxPads.get(c).values())
        {
            if (osc.classList.contains("on"))
                osc.classList.toggle("on");
            if (osc.classList.contains("off"))
                osc.classList.toggle("off");
            osc.style.backgroundColor = "white";
            if (magic.size == 0 || magic == undefined)
                continue;
            console.log(d);
            padSend(d);
        }
    }
    // for (var z of document.getElementsByClassName("triggers"))
    // {
    //     z.setAttribute("activate","false");
    //     if (z.classList.contains("on"))
    //         z.classList.toggle("on");
    //     if (!z.classList.contains("off"))
    //         z.classList.toggle("off")
    // }
}

function bpmControl(osc)
{
  tempo = parseInt(document.getElementsByClassName("bpm").value, 10);
}

function playPulse(osc)
{
    let audioCtx = new AudioContext();
    
    pulse_wave = document.getElementById("store").getAttribute("type");
    pulseTime = document.getElementsByClassName("time")[0].value;

    const amp = new GainNode(audioCtx, {
        value: document.getElementsByClassName("volume")[0].value,
    });

    const oscillator = new OscillatorNode(audioCtx, {
        type: pulse_wave,
        frequency: osc.value,
    });
    
    oscillator.connect(amp).connect(audioCtx.destination);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + pulseTime);

    var x = null;
    if (magic.has("06") === true)
        x = magic.get("06"); 
        
    // for (var v of x)
    if (x != null)
    {
        x.suspend();
    }
    // x = Array();
    // x.push(audioCtx);

    audioCtx.resume();
    magic.set("06", audioCtx);//audioCtx);
    var color = "0" + osc.id;
    document.getElementById(color).style.color = "green";
    document.getElementById("pulse-read").innerHTML = osc.value;
    function scheduler() {
        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (nextNoteTime < audioCtx.currentTime + (60.0 / tempo)) {
            scheduleNote(currentNote, nextNoteTime);
            nextNote();
        }
        timerID = setTimeout(scheduler, lookahead);
    }
    scheduler();
}
 
function playLFO(osc)
{
    let audioCtx = new AudioContext();
    lfo_wave = document.getElementById("store").getAttribute("type");
    
    const amp = new GainNode(audioCtx, {
        value: document.getElementsByClassName("volume")[0].value,
    });

    const lfo = new OscillatorNode(audioCtx, {
        type: lfo_wave,
        frequency: osc.value,
    });

    lfo.connect(amp).connect(audioCtx.destination);
    lfo.start();

    var x = null;
    if (magic.has("07") === true)
        x = magic.get("07"); 
        
    // for (var v of x)
    if (x != null)
    {
        x.suspend();
    }
    // x = Array();
    // x.push(audioCtx);

    audioCtx.resume();
    magic.set("07", audioCtx);//audioCtx);
    var color = "0" + osc.id;
    document.getElementById(color).style.color = "green";
    
    document.getElementById("lfo-read").innerHTML = osc.value;
    function scheduler() {
        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (nextNoteTime < audioCtx.currentTime + (60.0 / tempo)) {
            scheduleNote(currentNote, nextNoteTime);
            nextNote();
        }
        timerID = setTimeout(scheduler, lookahead);
    }
    scheduler();

}

function nextNote()
{
    const secondsPerBeat = 60.0 / tempo;
  
    nextNoteTime += secondsPerBeat; // Add beat length to last beat time
  
    // Advance the beat number, wrap to zero when reaching 4
    currentNote = (currentNote+1) % 7;

}

function nextNoteSample()
{
    const secondsPerBeat = 60.0 / tempo;
  
    nextNoteTime += secondsPerBeat; // Add beat length to last beat time
  
    // Advance the beat number, wrap to zero when reaching 4
    currentNote = (currentNote+1) % 39;

}

function scheduleNote(currentNote, nextNoteTime)
{
    if ((magic.size == 0 || magic == undefined) && (audioCtxPads.size == 0 || audioCtxPads == undefined))
    {
        return -1;
    }
    
    if (currentNote < audioCtxPads.size)
    {
        for (var y of audioCtxPads.keys())
        {
            scheduler(y);
            // for (let x of audioCtxPads.get(y).values())
            // {
            //     if (document.getElementById(y).getAttribute("active") == "false")
            //     {
            //         document.getElementById(y).setAttribute("active", "true");
            //         function scheduler() {
            //             // While there are notes that will need to play before the next interval,
            //             // schedule them and advance the pointer.
            //             while (nextNoteTime < x.currentTime + (60.0 / tempo)) {
            //                 scheduleNote(currentNote, nextNoteTime);
            //                 nextNoteSample();
            //             }
            //             timerID = setTimeout(scheduler, lookahead);
            //         }
            //         scheduler();
            //     }
            //     else if (document.getElementById(y).getAttribute("active") == "true")
            //     {
            //         document.getElementById(y).setAttribute("active", "false");
            //         x.suspend();
            //     }
            // }
        }
    }
    else
    {    for (var y of magic.keys())
        {
            for (let x of magic.get(y).values())
            {
                if (document.getElementById(y).getAttribute("active") == "false")
                {
                    x.resume();
                    document.getElementById(y).setAttribute("active", "true");
                }
                else
                {
                    x.suspend();
                    document.getElementById(y).setAttribute("active", "false");
                }
            }
        }
    }
}

function scheduler(y) {
    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    audioCtxPads.forEach(function (x, y) {

        var i = 0;
        x.resume();
        while (i++ < (60.0 / tempo));
        // {
        //     // scheduleNote(currentNote, nextNoteTime);
        //     // nextNoteSample();
        // }
        x.suspend();
    });
}

function createTriggers()
{
    var table = document.getElementById("trigger-table");
    i = 1;

    
    for (; i <= triggerCnt/2 ; i++)
    {
        for (j = 1 ; j <= triggerCnt ; j++)
        {
            var t = i.toString() + j.toString();
            table.innerHTML = table.innerHTML + "<label class='triggers' id='" + (i).toString() + (j).toString() + "' style='border:1px dashed black;margin:5px;width:23px;color:red' active='' oncontextmenu='padSend(this);' touchstart='playPauseSample(this)' onclick='playPauseSample(this)'>" + (i).toString() + "+" + (j).toString() + "</label>";
            audioCtxPads.set(t, null);
        }
        table.innerHTML = table.innerHTML + "<br>";
    }
    counting = Array();
    KEYDOWN = "";
}

function checks()
{
    const audioCtxt = new AudioContext();
    rates();
    audioCtxClone = Array();
    audioCtxMem = Array();
    audioCtxSubs = new Map();
    audioCtxPads = new Map();
    lfoPulse = new Map();
    lfoPulse.set("lfo", audioCtxt);
    lfoPulse.set("pulse", audioCtxt);
    magic = new Map();
    VCO = new Map();
    padsOnOff = new Map();
    interSyncPads = new Map();

    KEYDOWN = "";
    bpmControl();
    document.querySelector("body").style.display = "block";
}

function volume(osc, audio)
{
    const gain = audio.createGain();
    gain.gain.setValueAtTime(parseFloat(osc.value/100),audio.currentTime);
    gain.connect(audio.destination);
    return audio;
}

function clearTabs(tabsObj, osc = null)
{
    var el = tabsObj.childNodes;
    var j = 0;
    for (i = 0 ; i < el.length ; i++)
    {
	    if ("object" == typeof(el[i]) && el[i].classList == "wavetype on")
            el[i].classList = "wavetype";
        if (osc == null && el[i].innerHTML == "Sine")
        {
            j = i;
        }
    }
    if (osc == null)
        el[j].classList.toggle("on");
    else
        osc.classList = "wavetype on";
}

document.addEventListener("keydown", (event) => {
	/*
		event.key returns the character being pressed
        event.preventDefault() prevents the default browser behavior for that shortcut, e.g. ctrl+r usually reloads the page, but event.preventDefault() will turn off that behavior. event.preventDefault() should only be used if you share a shortcut with the same trigger as the browser.
        event.ctrlKey / event.altKey / event.shiftKey / event.metaKey all return booleans. They will be true when they are being pressed, otherwise they will be false.
	*/
    event.preventDefault();
    var button = event.key;

    if ((Number.isInteger(parseInt(button))))
        document.getElementById("digits").innerText = (KEYDOWN == "") ? " " + button + " + ?" : " " + KEYDOWN + " + " + button;

    if (KEYDOWN == "")
    {
        KEYDOWN = button;
        return;
    }

    if (Number.isInteger(parseInt(button)))
    {
        
        if (button != "0" && KEYDOWN == "0")
        {
            const vr = "0" + KEYDOWN + button;
            console.log(vr);
            var x = document.getElementById(vr).click();
        }
        else if (button != "0" && KEYDOWN != "0")
        {
            const vr = KEYDOWN + button;
            var x = document.getElementById(vr).click();
        }
        KEYDOWN = "";  
    }
    else
        KEYDOWN = "";
});	

function playPauseSample(osc)
{
    var pads = document.getElementById("pads").value;
    // Does this channel have any triggers
    if (!interSyncPads.has(pads))
        return;
    audioCtxPads = interSyncPads.get(pads);
    // activate 
    if (osc.getAttribute("active").indexOf(pads) == -1)
    {
        console.log("activate");
        console.log(osc.getAttribute("active"));
        var getActive = osc.getAttribute("active");
        getActive = getActive + pads;
        osc.setAttribute("active", getActive);
        
        if (audioCtxPads.get(osc.id) != null || audioCtxPads.get(osc.id) != undefined)
            for (var n of audioCtxPads.get(osc.id).values())
                n.suspend();
        
        
        if (!osc.classList.contains("on"))
            osc.classList.toggle("on");
        if (osc.classList.contains("off"))
            osc.classList.toggle("off");

        interSyncPads.set(pads, audioCtxPads);
        return;
    }
    // deactivate
    else if (osc.getAttribute("active").indexOf(pads) >= 0)
    {
        console.log("deactivate");
        var getActive = osc.getAttribute("active");
        console.log(osc.getAttribute("active"));

        var x = osc.getAttribute("active").indexOf(pads);
        var setActive = "";
        if (getActive.length > x)
        {
            setActive = getActive.substr(0,x);
        }
        if (setActive.length > x)
        {
            setActive = setActive + getActive.substr(x + 1);
        }
        if (setActive.indexOf(x) >= 0)
            console.log("ERRRRR");
        osc.setAttribute("active", setActive);
        
        if (audioCtxPads.get(osc.id) != null || audioCtxPads.get(osc.id) != undefined)
            for (var n of audioCtxPads.get(osc.id).values())
                n.resume();
        
        if (osc.classList.contains("on"))
            osc.classList.toggle("on");
        if (!osc.classList.contains("off"))
            osc.classList.toggle("off");
        
        interSyncPads.set(pads, audioCtxPads);
        return;
    }
}

function padSend(osc)
{
    if ( magic.size == 0 || magic == undefined)
    {
        window.alert("No Samples Loaded");
        return;
    }
    
    if (audioCtxPads.size > 0)
    {
        interSyncPads.set(currentChannel, audioCtxPads);
    }
    audioCtxPads = new Map();
    for (i = 0; i <= triggerCnt/2 ; i++)
    {
        for (j = 1 ; j <= triggerCnt ; j++)
        {
            var t = i.toString() + j.toString();
            // table.innerHTML = table.innerHTML + "<label class='triggers' id='" + (i).toString() + (j).toString() + "' style='border:1px dashed black;margin:5px;width:23px;color:red' active='' oncontextmenu='padSend(this);' touchstart='playPauseSample(this)' onclick='playPauseSample(this)'>" + (i).toString() + "+" + (j).toString() + "</label>";
            audioCtxPads.set(t, null);
        }
        // table.innerHTML = table.innerHTML + "<br>";
    }
    var snds = Array();
    for (var n of magic.keys())
    {
        for (let q of magic.get(n))
        {
            q.suspend();
            snds.push(q);
        }
    }
    
    var x = document.getElementsByClassName("switch");
    console.log(x);
    for (y of x)
    {
        y.style.color = "red";
    }
    audioCtxPads.set(osc.id,snds);
    var x = document.getElementById("pads");
    if (interSyncPads == undefined)
        interSyncPads = new Map();
    interSyncPads.set(x.value,audioCtxPads);
    document.getElementById(osc.id).setAttribute("active",x.value);
    
    for (var n of audioCtxPads.keys())
    {
        if (audioCtxPads.get(n) == null || audioCtxPads.get(n) == undefined)
            continue;
        for (let q of audioCtxPads.get(n))
        {
            q.suspend();
        }
    }
    console.log(magic.get(osc.id));
    
    if (!osc.classList.contains("on"))
        osc.classList.toggle("on");
    if (osc.classList.contains("off"))
        osc.classList.toggle("off");
    magic.clear();
    document.getElementById(osc.id).click();
    console.log(audioCtxPads);
    window.alert("Copy Successful");
}

function delOsc(osc)
{
    magic.get(osc.id).suspend();
    magic.set(osc.id, null);
}

function changeType(osc, newType)
{
    osc.parentNode.parentNode.setAttribute("type", newType);
    clearTabs(osc.parentNode, osc);
}

function oscillate(osc, audio, value = 0, bumprate)
{
    var oscillator = audio.createOscillator();
    if (typeof(osc) == "object")
        oscillator.type = document.getElementById("store").getAttribute("type");
    else
        oscillator.type = osc;
    var val = (value);
    try {
        oscillator.frequency.setValueAtTime(val,audio.currentTime);
    }
    catch { }
    oscillator.connect(audio.destination);
    oscillator.start();

    return audio;
}

function detune(val,audioCtx)
{
    const channelCount = 2;
    const frameCount = audioCtx.sampleRate * 2.0; // 2 seconds
    
    const myArrayBuffer = audioCtx.createBuffer(
        channelCount,
        frameCount,
        audioCtx.sampleRate
    );
    
    for (let channel = 0; channel < channelCount; channel++) {
        const nowBuffering = myArrayBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            nowBuffering[i] = Math.random() * 2 - 1;
        }
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = myArrayBuffer;
    source.detune.value = val; // value in cents
    source.connect(audioCtx.destination);

    return audioCtx;
}

function playNoise(osc)
{
    let audio = new AudioContext();

    const bufferSize = audio.sampleRate * 4;//noiseDuration; // set the time of the note
  
    // Create an empty buffer
    const noiseBuffer = new AudioBuffer({
      length: bufferSize,
      sampleRate: audio.sampleRate
    });
  
    // Fill the buffer with noise
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  
    // Create a buffer source for our created data
    const noise = new AudioBufferSourceNode(audio, {
      buffer: noiseBuffer
    });
  
    // Filter the output
    const bandpass = new BiquadFilterNode(audio, {
      type: "bandpass",
      frequency: document.getElementsByClassName("band")[0].value
    });
  
    var x = Array();
    // Connect our graph
    noise.connect(bandpass).connect(audio.destination);
    noise.start();
    if (magic.has(osc.id) === true)
        x = magic.get(osc.id);    
    x.push(audio)

    magic.set(osc.id, x);
    console.log(osc);
    document.getElementById("noise-read").innerHTML = osc.value;
    // var color = "0" + osc.id;
    // document.getElementById(color).style.color = "green";
    return audio;
}

function singleReboot(ths)
{
    if (ths != undefined && ths.size > 0)
    for (const x of ths.keys())
    {
        for (var y of ths.get(x).values())
        {
            y.suspend();
        }
    }
    var x = document.getElementsByClassName("switch");
    console.log(x);
    for (y of x)
    {
        y.style.color = "red";
    }
}

function reboot()
{
    if (interSyncPads != undefined && interSyncPads.size > 0)

    if (audioCtxPads != undefined && audioCtxPads.size > 0)
    {
        for (var z of interSyncPads.values())
        {
            for (const x of z.keys())
            {
                // for (var y of x.values())
                {

                    x.suspend();
                }
            }
        }
    }
    var x = document.getElementsByClassName("triggers");
    console.log(x);
    for (y of x)
    { 
        y.style.backgroundcolor = "white";
        y.setAttribute("active", "off"); 
    } 
    audioCtxPads = new Map();
    
    for (i = 0; i <= triggerCnt/2 ; i++)
    {
        for (j = 1 ; j <= triggerCnt ; j++)
        {
            var t = i.toString() + j.toString();
            // table.innerHTML = table.innerHTML + "<label class='triggers' id='" + (i).toString() + (j).toString() + "' style='border:1px dashed black;margin:5px;width:23px;color:red' active='' oncontextmenu='padSend(this);' touchstart='playPauseSample(this)' onclick='playPauseSample(this)'>" + (i).toString() + "+" + (j).toString() + "</label>";
            audioCtxPads.set(t, null);
        }
        // table.innerHTML = table.innerHTML + "<br>";
    }
    if (magic != undefined && magic.size > 0)
    for (const x of magic.keys())
    {
        for (var y of magic.get(x).values())
        {
            y.suspend();
        }
    }
    var x = document.getElementsByClassName("switch");
    console.log(x);
    for (y of x)
    {
        y.style.color = "red";
    }
    magic = new Map();
}

function newAudio(osc)
{
    const hz = osc.value;
    const pc = document.getElementsByClassName("panning")[0];
    const vc = document.getElementsByClassName("volume")[0];
    const dc = document.getElementsByClassName("detuning")[0];
    const th = document.getElementsByClassName("thresh")[0];
    const ra = document.getElementsByClassName("ratio")[0];
    const at = document.getElementsByClassName("attack")[0];
    const rc = document.getElementsByClassName("decay")[0];
    const kn = document.getElementsByClassName("knee")[0];
    const bc = document.getElementsByClassName("bpm")[0];
    console.log(kn);
    
    let audio = new AudioContext();

    var x = Array();

    const compressor = audio.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(th.value, audio.currentTime);
    compressor.knee.setValueAtTime(kn.value, audio.currentTime);
    compressor.ratio.setValueAtTime(ra.value, audio.currentTime);
    compressor.attack.setValueAtTime(at.value, audio.currentTime);
    compressor.release.setValueAtTime(rc.value/100, audio.currentTime);
    compressor.connect(audio.destination);
    audio = pan(pc.value, audio);
    audio = volume(vc, audio);
    audio = detune(dc.value, audio);
    audio = oscillate(osc, audio, hz);

    if (magic == undefined)
    {
        magic = new Map();
    }
    if (VCO == undefined)
    {
        VCO = new Map();
    }
    if (interSyncPads == undefined)
    {
        interSyncPads = new Map();
    }
    if (audioCtxPads == undefined)
    {
        audioCtxPads = new Map();
        
        for (i = 0; i <= triggerCnt/2 ; i++)
        {
            for (j = 1 ; j <= triggerCnt ; j++)
            {
                var t = i.toString() + j.toString();
                // table.innerHTML = table.innerHTML + "<label class='triggers' id='" + (i).toString() + (j).toString() + "' style='border:1px dashed black;margin:5px;width:23px;color:red' active='' oncontextmenu='padSend(this);' touchstart='playPauseSample(this)' onclick='playPauseSample(this)'>" + (i).toString() + "+" + (j).toString() + "</label>";
                audioCtxPads.set(t, null);
            }
            // table.innerHTML = table.innerHTML + "<br>";
        }
    }
    if (magic.has(osc.id) === true)
    {
        x = magic.get(osc.id);
    }   
    x.push(audio)
    magic.set(osc.id,x);
    
    var color = "0" + osc.id;
    document.getElementById(color).style.color = "green";
    function scheduler() {
        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (nextNoteTime < audio.currentTime + bc) {
            scheduleNote(currentNote, nextNoteTime);
            nextNote();
        }
        timerID = setTimeout(scheduler, lookahead);
    }
    scheduler();
}

function rates(osc)
{
    if (osc == undefined)
        return;
    
    // var c = document.getElementsByClassName("rated");
    console.log(osc.classList);
    var x = osc.classList[0] + "-read";
    console.log(x);
    if (x == "hz-read")
    {
        setVCO(osc);
        return;
    }
    document.getElementById(x).innerHTML = osc.value;
    if (Number.isInteger(parseInt(osc.id)))
    {
        if (osc.id == "06")
        {
            document.getElementById("pulse").innerHTML = osc.value;
        }
        else if (osc.id == "07")
            document.getElementById("lfo").innerHTML = osc.value;
    }
}

function setVCO(osc)
{   
    var r = document.getElementsByClassName("hz");
    var g = document.getElementsByClassName("hz");
    
    console.log(r);
    for (i = 0 ; i < g.length ; i++)
    {
        g[i].nextSibling.innerHTML = r[i].nextSibling.value;
        let freq = g[i].value;
        let j = 0;
        while (Math.ceil(freq) > 31)
        {
            freq = freq / 2;
            freq = Math.floor(freq);
            j++;
        }

        if (freq > 29)
            g[i].nextSibling.innerHTML = " B";
        else if (freq > 28)
            g[i].nextSibling.innerHTML = " A#/Bb";
        else if (freq > 26)
            g[i].nextSibling.innerHTML = " A";
        else if (freq > 25)
            g[i].nextSibling.innerHTML = " G#/Ab";
        else if (freq > 23)
            g[i].nextSibling.innerHTML = " G";
        else if (freq > 22)
            g[i].nextSibling.innerHTML = " F#/Gb";
        else if (freq > 21)
            g[i].nextSibling.innerHTML = " F";
        else if (freq > 20)
            g[i].nextSibling.innerHTML = " E";
        else if (freq > 19)
            g[i].nextSibling.innerHTML = " D#/Eb";
        else if (freq > 18)
            g[i].nextSibling.innerHTML = " D";
        else if (freq > 17)
            g[i].nextSibling.innerHTML = " C#/Db";
        else
            g[i].nextSibling.innerHTML = " C";
    }
    if (osc == undefined)
        return;
    console.log(osc.id);
    const id = osc.id + "-read";
    if (document.getElementById(id) != undefined)
        document.getElementById(id).innerHTML = osc.value;
}

function playPause(osc)
{
    try {
        var sb = osc.id.toString();
        var p = osc.id.toString().substr(1);
        if (document.getElementById(sb).style.color == "green")
        {
            document.getElementById(sb).style.color="red";
            for (let j of magic.get(p))
                j.suspend();
        }
        else
        {
            document.getElementById(sb).style.color="green";
            for (let j of magic.get(p))
                j.resume();
        }
    }
    catch {
        console.log("playpause");
        var p = osc.id;
        document.getElementById(p).style.color="red";
    }
}



function playOsc()
{
    try {
        
        for (let x of magic.keys())
        {
            for (let v of magic.get(x).values())
                v.resume();
            document.getElementById(p).style.color="green";
        }
    }
    catch {
    }
}

function pauseOsc()
{
    try {
        
        for (let x of magic.keys())
        {
            for (let v of magic.get(x).values())
                v.suspend();
            document.getElementById(p).style.color="red";
        }
    }
    catch {
    }
    return audioCtxClone;
}

function deleteOscillator(t)
{
    t.stop();
    t.remove();
}

function pan(panner, audioCtx)
{
    const myAudio = document.getElementsByClassName("synthloops");

    const panControl = panner;
    // const panValue = document.querySelector(".panning-value");

    const htmlmed = document.createElement("audio"); //samples come in here

    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it
    console.log(typeof(myAudio));
    const source = audioCtx.createMediaElementSource(htmlmed);

    // Create a stereo panner
    const panNode = audioCtx.createStereoPanner();

    // Event handler function to increase panning to the right and left
    // when the slider is moved
    const mth = panControl/100;
    panNode.pan.setValueAtTime(mth, audioCtx.currentTime);
    // connect the MediaElementAudioSourceNode to the panNode
    // and the panNode to the destination, so we can play the
    // music and adjust the panning using the controls
    source.connect(panNode);
    panNode.connect(audioCtx.destination);
    return audioCtx;
}
