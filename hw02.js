let gl;
let program;
let uTranslationLoc;
let translation = [0.0, 0.0];
const step = 0.01;
const halfSize = 0.1; // 정사각형 한 변의 절반 길이

window.onload = () => {
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL not supported");
        return;
    }

    initShaders();
    initBuffers();
    initEvents(canvas);

    draw();
};

function initShaders() {
    const vertexShader = loadShader("vertex.glsl", "vertex-shader", gl.VERTEX_SHADER);
    const fragmentShader = loadShader("fragment.glsl", "fragment-shader", gl.FRAGMENT_SHADER);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Could not link shaders", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    uTranslationLoc = gl.getUniformLocation(program, "uTranslation");
}

function loadShader(fileUrl, fallbackId, type) {
    let source = null;
    try {
        const request = new XMLHttpRequest();
        request.open("GET", fileUrl, false);
        request.send();
        if (request.status === 200) {
            source = request.responseText;
        }
    } catch (e) {
        console.warn("Failed to load", fileUrl, "falling back to", fallbackId);
    }

    if (!source) {
        // fallback: HTML 내 script 태그에서 가져오기
        source = document.getElementById(fallbackId).text;
    }

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
    }
    return shader;
}

function initBuffers() {
    const vertices = new Float32Array([
        -halfSize, -halfSize,
         halfSize, -halfSize,
         halfSize,  halfSize,
        -halfSize,  halfSize
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
}

function initEvents(canvas) {
    window.addEventListener("keydown", (event) => {
        let moved = false;
        if (event.key === "ArrowUp" && translation[1] + step + halfSize <= 1.0) {
            translation[1] += step; moved = true;
        }
        if (event.key === "ArrowDown" && translation[1] - step - halfSize >= -1.0) {
            translation[1] -= step; moved = true;
        }
        if (event.key === "ArrowLeft" && translation[0] - step - halfSize >= -1.0) {
            translation[0] -= step; moved = true;
        }
        if (event.key === "ArrowRight" && translation[0] + step + halfSize <= 1.0) {
            translation[0] += step; moved = true;
        }
        if (moved) draw();
    });

    window.addEventListener("resize", () => resizeAspectRatio(canvas));
    resizeAspectRatio(canvas);
}

function resizeAspectRatio(canvas) {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
}

function draw() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2fv(uTranslationLoc, translation);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
