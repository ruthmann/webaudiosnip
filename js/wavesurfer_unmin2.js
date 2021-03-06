

"use strict";

var lenFile;
var timePos = 0.00;
var playedPercent = 0;
var startPoint = 0;
var endPoint = 0;
var fileString;
var dragPos;
var lastPos;
var looped = true;

//click onClick
//seekTo

var WaveSurfer = {
    defaultParams: {
        height: 256,
        waveColor: "#999",
        progressColor: "#555",
        cursorColor: "#333",
        cursorWidth: 1,
        markerWidth: 1,
        skipLength: 2,
        minPxPerSec: 1,
        samples: 3,
        pixelRatio: window.devicePixelRatio,
        fillParent: !0,
        scrollParent: !1,
        normalize: !1,
        audioContext: null,
        container: null,
        looping: 1,
        renderer: "Canvas"
        //position: 0;
    },
    init: function (t) {
        this.params = WaveSurfer.util.extend({}, this.defaultParams, t), this.markers = {}, this.once("marked", this.bindMarks.bind(this)), this.savedVolume = 0, this.isMuted = !1, this.createBackend(), this.createDrawer()
    },
    createDrawer: function () {
        var t = this;
        this.drawer = Object.create(WaveSurfer.Drawer[this.params.renderer]), this.drawer.init(this.params), this.drawer.on("redraw", function () {
            t.drawBuffer()
        }), this.drawer.on("click", function (e) {
            t.seekTo(e)
        }), this.on("progress", function (e) {
            t.drawer.progress(e)
        })
    },
    createBackend: function () {
        var t = this;
        this.backend = Object.create(WaveSurfer.WebAudio), 
        this.backend.on("play", function () {
                            t.fireEvent("play")
                        }), 
        this.on("play", function () {
                            t.restartAnimationLoop()
                        }), 
        this.backend.init(this.params)
    },
    restartAnimationLoop: function () {
        var t = this,
            e = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
            i = function () {
                t.fireEvent("progress", t.backend.getPlayedPercents()), t.backend.isPaused() || e(i)
            };
        i()
    },
    playAt: function (t) {
        this.backend.play(this.backend.getDuration() * t)
    },
    play: function () {
        //this.backend.play()
        this.playAt(startPoint);
    },
    pause: function () {
        this.backend.pause()
    },
    playPause: function () {
        this.backend.isPaused() ? this.playAt(startPoint) : this.pause()
    },
    //toggle
   toggleLooping: function () {
        if (looped == true) {
            looped = false;
            $('#looped').hide();
        } else {
            looped = true;
            $('#looped').show();
        }
        console.log(looped);
        //return(looped);
       //console.log(this.backend.isLooping());
       //console.log("hey");
   },
    skipBackward: function (t) {
        this.skip(t || -this.params.skipLength)
    },
    skipForward: function (t) {
        this.skip(t || this.params.skipLength)
    },
    skip: function (t) {
        var e = this.timings(t),
            i = e[0] / e[1];
        this.seekTo(i)
    },
    seekTo: function (t) {
        var e = this.backend.isPaused();
        this.playAt(t), e && this.pause(), this.fireEvent("seek", t)
    },
    stop: function () {
        this.playAt(startPoint), this.pause(), this.drawer.progress(startPoint);
        console.log("stopped");
    },
    setVolume: function (t) {
        this.backend.setVolume(t)
    },
    toggleMute: function () {
        this.isMuted ? (this.backend.setVolume(this.savedVolume), this.isMuted = !1) : (this.savedVolume = this.backend.getVolume(), this.backend.setVolume(0), this.isMuted = !0)
    },
    mark: function (t) {
        if (t.id && t.id in this.markers) {
            this.markers[t.id].update(t);
//            return this.markers[t.id].update(t);
        }
        console.log("Mark " + t.id);
        var e = this,
            i = WaveSurfer.util.extend({
                id: WaveSurfer.util.getId(),
                position: this.backend.getCurrentTime(),
                width: this.params.markerWidth
            }, t),
            r = Object.create(WaveSurfer.Mark);
                   // console.log(i.position); --> this shows the real time!

        console.log("position = ");
        console.log(i.position);
        // if pos1 exists && pos1 < pos2, startPos = pos1, endPos = pos2

        return r.on("update", function () {
            var t = e.backend.getDuration() || 1;
            null == r.position && (r.position = r.percentage * t), r.percentage = r.position / t, e.markers[r.id] = r, e.drawer.addMark(r)
        }), r.on("remove", function () {
            e.drawer.removeMark(r), delete e.markers[r.id]
        }), this.fireEvent("marked", r), r.init(i)

    },
        dragMark: function (t) {
            dragPos = (t.mTime / this.drawer.getWidth()); //* this.backend.getDuration();
            //startPoint = dragPos;
            //startPoint = dragPos;
            if (t.id == 'stop') {
                endPoint = dragPos;
                console.log("the ID is stop");
            }
            else if (t.id == 'start') {
                startPoint = dragPos;
                if (startPoint < 0){
                    startPoint = .01;
                }
             //   console.log("End Point");
            }
            if (startPoint > endPoint) {
                var tempPoint = startPoint;
                startPoint = endPoint;
                endPoint = tempPoint;
            }
            if (Math.abs(startPoint - endPoint) < .0005) {
                console.log('too short');
                endPoint = lenFile;
            }
            this.seekTo(startPoint);//this.backend.getDuration());
            console.log("start: "+ startPoint + " End: " + endPoint);
        if (t.id && t.id in this.markers) {
            this.markers[t.id].update(t);
//            return this.markers[t.id].update(t);
        }

//        console.log("length of markers is " +this.markers[0].length);
        var e = this,
            i = WaveSurfer.util.extend({
                id: WaveSurfer.util.getId(),
                position: dragPos * this.backend.getDuration(),
                width: this.params.markerWidth
            }, t),
            r = Object.create(WaveSurfer.Mark);
                   // console.log(i.position); --> this shows the real time!

        // if pos1 exists && pos1 < pos2, startPos = pos1, endPos = pos2

        return r.on("update", function () {
            var t = e.backend.getDuration() || 1;
            null == r.position && (r.position = r.percentage * t), r.percentage = r.position / t, e.markers[r.id] = r, e.drawer.addMark(r)
        }), r.on("remove", function () {
            e.drawer.removeMark(r), delete e.markers[r.id]
        }), this.fireEvent("marked", r), r.init(i)
        lastPos = dragPos;

    },
    redrawMarks: function () {
        Object.keys(this.markers).forEach(function (t) {
            var e = this.markers[t];
            this.drawer.addMark(e)
        }, this)
    },
    clearMarks: function () {
        Object.keys(this.markers).forEach(function (t) {
            this.markers[t].remove()
        }, this)
    },
    timings: function (t) {
        var e = this.backend.getCurrentTime() || 0,
            i = this.backend.getDuration() || 1;
        return e = Math.max(0, Math.min(i, e + (t || 0))), [e, i]
    },
    drawBuffer: function () {
        if (this.drawer.clear(), this.drawer.progress(this.backend.getPlayedPercents()), this.redrawMarks(), this.params.fillParent && !this.params.scrollParent) var t = this.drawer.getWidth();
        else t = this.backend.getDuration() * this.params.minPxPerSec;
        var e = this.backend.getPeaks(t);
        var prevLenFile = lenFile;
        lenFile = this.backend.getDuration();
        if (prevLenFile != lenFile) {
            endPoint = lenFile;
        }
        //console.log("end point is " + endPoint);
        this.drawer.drawPeaks(e, t)
    },
    loadBuffer: function (t) {
        var e = this;
        this.pause(), this.backend.loadBuffer(t, function () {
            e.clearMarks(), e.drawBuffer(), e.fireEvent("ready")
        }, function () {
            e.fireEvent("error", "Error decoding audio")
        })
    },
    onProgress: function (t) {
        if (t.lengthComputable) var e = t.loaded / t.total;
        else {
            e = t.loaded / (t.loaded + 1e6);
          }
        this.fireEvent("loading", Math.round(100 * e), t.target)
        console.log(e);
        if (e = 1) {
            reviveButtons();    //bring back the buttons
        }
    },
    load: function (t) {
        //put filename in title screen
        var e = this,
            i = new XMLHttpRequest;
        i.open("GET", t, !0), i.send(), i.responseType = "arraybuffer", i.addEventListener("progress", function (t) {
            e.onProgress(t)
        }), i.addEventListener("load", function () {
            200 == i.status ? e.loadBuffer(i.response) : e.fireEvent("error", "Server response: " + i.statusText)
        }), i.addEventListener("error", function () {
            e.fireEvent("error", "Error loading audio")
        }), this.empty()
    },
    bindDragNDrop: function (t) {
        var e = this,
            i = new FileReader;
        i.addEventListener("progress", function (t) {
            e.onProgress(t)
        }), i.addEventListener("load", function (t) {
            e.loadBuffer(t.target.result)
        }), i.addEventListener("error", function () {
            e.fireEvent("error", "Error reading file")
        }), "string" == typeof t && (t = document.querySelector(t));
        var r = "wavesurfer-dragover";
        t.addEventListener("drop", function (s) {
            s.stopPropagation(), s.preventDefault(), t.classList.remove(r);
            var a = s.dataTransfer.files[0];
            //console.log(a);
            processFileUpload(a);
            a ? (e.empty(), i.readAsArrayBuffer(a)) : e.fireEvent("error", "Not a file")
        }), t.addEventListener("dragover", function (e) {
            e.stopPropagation(), e.preventDefault(), t.classList.add(r)
        }), t.addEventListener("dragleave", function (e) {
            e.stopPropagation(), e.preventDefault(), t.classList.remove(r)
        })
    },
    bindMarks: function () {
        var t = this,
            e = 0;
        this.backend.on("play", function () {
            Object.keys(t.markers).forEach(function (e) {
                t.markers[e].played = !1
            })
        }), this.backend.on("audioprocess", function (i) {
            Object.keys(t.markers).forEach(function (r) {
                var s = t.markers[r];
                s.played || s.position <= i && s.position >= e && (s.played = !0, t.fireEvent("mark", s), s.fireEvent("reached"))
            }), e = i
        })
    },
    empty: function () {
        this.pause(), this.clearMarks(), this.backend.loadEmpty(), this.drawer.drawPeaks({
            length: this.drawer.getWidth()
        }, 0)
    }
};
WaveSurfer.Mark = {
    defaultParams: {
        id: null,
        position: 0,
        percentage: 0,
        width: 1,
        color: "#333"
    },
    init: function (t) {
        return this.update(WaveSurfer.util.extend({}, this.defaultParams, t))
    },
    getTitle: function () {
        var t = new Date(1e3 * this.position);
        return t.getMinutes() + ":" + t.getSeconds()
    },
    update: function (t) {
        return Object.keys(t).forEach(function (e) {
            e in this.defaultParams && (this[e] = t[e])
        }, this), null == t.position && null != t.percentage && (this.position = null), this.fireEvent("update"), this
    },
    remove: function () {
        this.fireEvent("remove")
    }
}, WaveSurfer.Observer = {
    on: function (t, e) {
        this.handlers || (this.handlers = {});
        var i = this.handlers[t];
        i || (i = this.handlers[t] = []), i.push(e)
    },
    un: function (t, e) {
        if (this.handlers) {
            var i = this.handlers[t];
            if (i)
                if (e)
                    for (var r = i.length - 1; r >= 0; r--) i[r] == e && i.splice(r, 1);
                else i.length = 0
        }
    },
    once: function (t, e) {
        var i = function () {
            e(), this.un(t, i)
        }.bind(this);
        this.on(t, i)
    },
    fireEvent: function (t) {
        if (this.handlers) {
            var e = this.handlers[t],
                i = Array.prototype.slice.call(arguments, 1);
            if (e)
                for (var r = 0, s = e.length; s > r; r += 1) e[r].apply(null, i)
        }
    }
}, WaveSurfer.util = {
    extend: function (t) {
        var e = Array.prototype.slice.call(arguments, 1);
        return e.forEach(function (e) {
            null != e && Object.keys(e).forEach(function (i) {
                t[i] = e[i]
            })
        }), t
    },
    getId: function () {
        return "wavesurfer_" + Math.random().toString(32).substring(2)
    },
    max: function (t) {
        for (var e = -1 / 0, i = 0, r = t.length; r > i; i++) {
            var s = t[i];
            s > e && (e = s)
        }
        return e
    }
}, WaveSurfer.util.extend(WaveSurfer, WaveSurfer.Observer), WaveSurfer.util.extend(WaveSurfer.Mark, WaveSurfer.Observer), WaveSurfer.WebAudio = {
    scriptBufferSize: 256,
    init: function (t) {
        if (!window.AudioContext && !window.webkitAudioContext) throw new Error("wavesurfer.js: your browser doesn't support WebAudio");
        this.params = t, this.ac = t.audioContext || this.getAudioContext(), this.offlineAc = this.getOfflineAudioContext(this.ac.sampleRate), this.createVolumeNode(), this.createScriptNode()
    },
    setFilter: function (t) {
        this.filterNode && this.filterNode.disconnect(), this.gainNode.disconnect(), t ? (t.connect(this.ac.destination), this.gainNode.connect(t)) : this.gainNode.connect(this.ac.destination), this.filterNode = t
    },
    createScriptNode: function () {
        var t = this,
            e = this.scriptBufferSize;
        this.scriptNode = this.ac.createScriptProcessor ? this.ac.createScriptProcessor(e) : this.ac.createJavaScriptNode(e), this.scriptNode.connect(this.ac.destination), this.scriptNode.onaudioprocess = function () {
            if (!t.isPaused()) {
                var e = t.getCurrentTime();
                e > t.scheduledPause && t.pause(), t.fireEvent("audioprocess", e)
            }
        }
    },
    createVolumeNode: function () {
        this.gainNode = this.ac.createGain ? this.ac.createGain() : this.ac.createGainNode(), this.gainNode.connect(this.ac.destination)
    },
    setVolume: function (t) {
        this.gainNode.gain.value = t
    },
    getVolume: function () {
        return this.gainNode.gain.value
    },
    clearSource: function () {
        this.source.disconnect(), this.source = null
    },
    refreshBufferSource: function () {
        this.source && this.clearSource(), this.source = this.ac.createBufferSource(), this.buffer && (this.source.buffer = this.buffer), this.source.connect(this.gainNode)
    },
    setBuffer: function (t) {
        this.lastPause = 0, this.lastStart = 0, this.startTime = 0, this.paused = !0, this.buffer = t
    },
    loadBuffer: function (t, e, i) {
        var r = this;
        this.offlineAc.decodeAudioData(t, function (t) {
            r.setBuffer(t), e && e(t)
        }, i)
    },
    loadEmpty: function () {
        this.setBuffer(null)
    },
    isPaused: function () {
        return this.paused
    },
    getDuration: function () {
        //console.log(this.buffer.duration),
        return this.buffer ? this.buffer.duration : 0
    },
    play: function (t, e) {
        console.log('e is '+ e);
        this.refreshBufferSource(), null == t && (t = this.getCurrentTime()), null == e && (e = this.getDuration()), t > e && (t = 0), this.lastStart = t, this.startTime = this.ac.currentTime, this.paused = !1, this.scheduledPause = e, this.source.start ? this.source.start(startPoint, t, e - t) : this.source.noteGrainOn(startPoint, t, e - t), this.fireEvent("play")
    },
    pause: function () {
        this.lastPause = this.lastStart + (this.ac.currentTime - this.startTime), this.paused = !0, this.source && (this.source.stop ? this.source.stop(0) : this.source.noteOff(0), this.clearSource()), this.fireEvent("pause")
    },
    getPeaks: function (t, e) {
        var i = this.buffer,
            r = Math.ceil(i.length / t);
        e = e || ~~(r / 10);
        for (var s = i.numberOfChannels, a = new Float32Array(t), n = 0; s > n; n++)
            for (var o = i.getChannelData(n), h = 0; t > h; h++) {
                for (var c = ~~ (h * r), u = c + r, d = 0, f = c; u > f; f += e) {
                    var l = o[f];
                    l > d ? d = l : -l > d && (d = -l)
                }
                n > 1 ? a[h] += d / s : a[h] = d / s
            }
        return a
    },
    getPlayedPercents: function () {
        timePos = this.isPaused() ? this.lastPause : this.lastStart + (this.ac.currentTime - this.startTime);
        //console.log("Current Time is " + timePos + "and the end point is " +endPoint * this.getDuration());
        if (timePos > endPoint * this.getDuration()) {
            if (looped == false) {
            } else {
                if (!this.isPaused()) {
                    wavesurfer.seekTo(startPoint);
                                    console.log("loop time!");
/*                    if (endPoint > startPoint) {
                        startPoint = endPoint;
                    }
                    else if (startPoint < endPoint) {
                    wavesurfer.seekTo(startPoint);
                }
                */
                }
            }
        }
        var t = this.getDuration();
        return t > 0 ? this.getCurrentTime() / t : 0
    },
    getCurrentTime: function () {
        return this.isPaused() ? this.lastPause : this.lastStart + (this.ac.currentTime - this.startTime)
    },

    // ***************************Creates the Audio Context
    audioContext: null,
    getAudioContext: function () {
        return WaveSurfer.WebAudio.audioContext || (WaveSurfer.WebAudio.audioContext = new(window.AudioContext || window.webkitAudioContext)), WaveSurfer.WebAudio.audioContext
    },
//try this    globalAudioContext = this.getAudioContext(),
    offlineAudioContext: null,
    getOfflineAudioContext: function (t) {
        return WaveSurfer.WebAudio.offlineAudioContext || (WaveSurfer.WebAudio.offlineAudioContext = new(window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, t)), WaveSurfer.WebAudio.offlineAudioContext
    }
}, WaveSurfer.util.extend(WaveSurfer.WebAudio, WaveSurfer.Observer), WaveSurfer.Drawer = {
    init: function (t) {
        if (this.container = "string" == typeof t.container ? document.querySelector(t.container) : t.container, !this.container) throw new Error("wavesurfer.js: container element not found");
        if (this.params = t, this.pixelRatio = this.params.pixelRatio, this.width = 0, this.height = t.height * this.pixelRatio, this.containerWidth = this.container.clientWidth, this.lastPos = 0, this.createWrapper(), this.createElements(), this.params.fillParent) {
            var e = this;
            window.addEventListener("resize", function () {
                e.container.clientWidth != e.containerWidth && e.fireEvent("redraw")
            })
        }
    },
    createWrapper: function () {
        this.wrapper = this.container.appendChild(document.createElement("wave")), this.style(this.wrapper, {
            display: "block",
            position: "relative",
            userSelect: "none",
            webkitUserSelect: "none",
            height: this.params.height + "px"
        }), (this.params.fillParent || this.params.scrollParent) && this.style(this.wrapper, {
            width: "100%",
            overflowX: this.params.scrollParent ? "scroll" : "hidden",
            overflowY: "hidden"
        });
        var t = this;
/*        this.wrapper.addEventListener("click", function (e) {
            e.preventDefault();
            var i = "offsetX" in e ? e.offsetX : e.layerX;
            t.fireEvent("click", i / t.scrollWidth || 0)

        })*/
    },
    clear: function () {
        this.resetScroll(), this.clearWave()
    },
    drawPeaks: function (t, e) {
        if (this.setWidth(e), this.params.normalize) var i = WaveSurfer.util.max(t);
        else i = 1;
        this.drawWave(t, i)
    },
    style: function (t, e) {
        Object.keys(e).forEach(function (i) {
            t.style[i] = e[i]
        })
    },
    resetScroll: function () {
        this.wrapper.scrollLeft = 0
    },
    recenter: function (t) {
        var e = this.containerWidth * t;
        this.recenterOnPosition(e, !0)
    },
    recenterOnPosition: function (t, e) {
        var i = this.wrapper.scrollLeft,
            r = ~~ (this.containerWidth / 2),
            s = t - r,
            a = s - i;
        if (!e && a >= -r && r > a) {
            var n = 5;
            a = Math.max(-n, Math.min(n, a)), s = i + a
        }
        0 != a && (this.wrapper.scrollLeft = s)
    },
    getWidth: function () {
        return this.containerWidth * this.pixelRatio
    },
    setWidth: function (t) {
        t != this.width && (this.width = t, this.scrollWidth = ~~ (this.width / this.pixelRatio), this.containerWidth = this.container.clientWidth, this.params.fillParent || this.params.scrollParent || this.style(this.wrapper, {
            width: this.scrollWidth + "px"
        }), this.updateWidth())
    },
    progress: function (t) {
        var e = 1 / this.pixelRatio,
            i = Math.round(t * this.width) * e;
        (i < this.lastPos || i - this.lastPos >= e) && (this.lastPos = i, this.params.scrollParent && this.recenterOnPosition(~~(this.scrollWidth * t)), this.updateProgress(t))
    },
    createElements: function () {},
    updateWidth: function () {},
    drawWave: function () {},
    clearWave: function () {},
    updateProgress: function () {},
    addMark: function () {},
    removeMark: function () {}
}, WaveSurfer.util.extend(WaveSurfer.Drawer, WaveSurfer.Observer), WaveSurfer.Drawer.Canvas = Object.create(WaveSurfer.Drawer), WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {
    createElements: function () {
        this.marks = {};
        var t = this.wrapper.appendChild(document.createElement("canvas"));
        t.setAttribute("id", "canvas1");
        this.style(t, {
            position: "absolute",
            zIndex: 1
        });
        var e = this.wrapper.appendChild(document.createElement("wave"));
        e.setAttribute("id", "wave1");
        this.style(e, {
            position: "absolute",
            zIndex: 2,
            overflow: "hidden",
            width: "0",
            borderRight: [this.params.cursorWidth + "px", "solid", this.params.cursorColor].join(" ")
        });
        var i = e.appendChild(document.createElement("canvas")),
            r = this.wrapper.appendChild(document.createElement("canvas"));
            r.setAttribute("id", "canvas2");
        this.style(r, {
            position: "absolute",
            zIndex: 3,
        }), this.canvases = [t, i, r], this.waveCc = t.getContext("2d"), this.progressCc = i.getContext("2d"), this.progressWave = e, this.marksCc = r.getContext("2d")
    },
    updateWidth: function () {
        var t = Math.round(this.width / this.pixelRatio) + "px";
        this.canvases.forEach(function (e) {
            e.width = this.width, e.height = this.height, e.style.width = t
        }, this), this.waveCc.clearRect(0, 0, this.width, this.height), this.progressCc.clearRect(0, 0, this.width, this.height)
    },
    clearWave: function () {
        this.waveCc.clearRect(0, 0, this.width, this.height), this.progressCc.clearRect(0, 0, this.width, this.height)
    },
    drawWave: function (t, e) {
        this.waveCc.fillStyle = this.params.waveColor, this.progressCc.fillStyle = this.params.progressColor;
        var i = this.height / e,
            r = this.height / 2;
        this.waveCc.beginPath(), this.waveCc.moveTo(0, r), this.progressCc.beginPath(), this.progressCc.moveTo(0, r);
        for (var s = 0; s < this.width; s++) {
            var a = Math.round(t[s] * i);
            this.waveCc.lineTo(s, r + a), this.progressCc.lineTo(s, r + a)
        }
        this.waveCc.lineTo(this.width, r), this.progressCc.lineTo(this.width, r), this.waveCc.moveTo(0, r), this.progressCc.moveTo(0, r);
        for (var s = 0; s < this.width; s++) {
            var a = Math.round(t[s] * i);
            this.waveCc.lineTo(s, r - a), this.progressCc.lineTo(s, r - a)
        }
        this.waveCc.lineTo(this.width, r), this.waveCc.fill(), this.progressCc.lineTo(this.width, r), this.progressCc.fill()
    },
    updateProgress: function (t) {
        var e = Math.round(this.width * t) / this.pixelRatio;
        this.progressWave.style.width = e + "px",
        playedPercent = e;
        //        console.log(this.backend.getCurrentTime());   WHY DONT THIS WORK?
//        console.log("update progress");
        //put this into a separate function
        //send to a separate PHP page that parses and then returns
        var params = {cursor: t};

    },
    addMark: function (t) {
        var e = t.id in this.marks;
        this.marks[t.id] = t, e ? this.redrawMarks() : this.drawMark(t)
    },
    removeMark: function (t) {
        delete this.marks[t.id], this.redrawMarks()
    },
    drawMark: function (t) {
        this.marksCc.fillStyle = t.color;
        var e = Math.min(this.width - t.width, Math.max(0, Math.round(t.percentage * this.width - t.width / 2)));
        this.marksCc.fillRect(e, 0, t.width, this.height)
    },
    redrawMarks: function () {
        this.marksCc.clearRect(0, 0, this.width, this.height), Object.keys(this.marks).forEach(function (t) {
            this.drawMark(this.marks[t])
        }, this)
    }
});

//# sourceMappingURL=/build/wavesurfer-js-map.json