import { resizeAspectRatio, setupText, updateText} from './util.js';
import { Shader, readShaderFile } from './shader.js';
import { Cone } from './cone.js'; 
import { Cube } from './cube.js'; 
import { Arcball } from './arcball.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let gouraudShader;
let phongShader;
let lampShader;
let currentShader; 

let textOverlay2;
let textOverlay3;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let lampModelMatrix = mat4.create();

let arcBallMode = 'CAMERA';     
let shadingMode = 'FLAT';       
let renderingMode = 'PHONG';   

let cone; 
let lamp; 

const cameraPos = vec3.fromValues(0, 0, 3);
const lightPos = vec3.fromValues(1.0, 0.7, 1.0);
const lightSize = vec3.fromValues(0.1, 0.1, 0.1);

const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('program terminated');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('program terminated with error:', error);
    });
});

function updateTextOverlay() {
    updateText(textOverlay2, "arcball mode: " + arcBallMode);
    updateText(textOverlay3, "shading mode: " + shadingMode + " (" + renderingMode + ")");
}

function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        if (event.key == 'a') { // Arcball 모드 변경
            if (arcBallMode == 'CAMERA') {
                arcBallMode = 'MODEL';
            }
            else {
                arcBallMode = 'CAMERA';
            }
        }
        else if (event.key == 'r') { // Arcball 리셋
            arcball.reset();
            modelMatrix = mat4.create(); 
            arcBallMode = 'CAMERA';
        }
        else if (event.key == 's') { // Smooth 셰이딩
            cone.copyVertexNormalsToNormals(); 
            cone.updateNormals();
            shadingMode = 'SMOOTH';
        }
        else if (event.key == 'f') { // Flat 셰이딩
            cone.copyFaceNormalsToNormals(); 
            cone.updateNormals();
            shadingMode = 'FLAT';
        }
        else if (event.key == 'g') { // Gouraud 렌더링
            renderingMode = 'GOURAUD';
            currentShader = gouraudShader;
        }
        else if (event.key == 'p') { // Phong 렌더링
            renderingMode = 'PHONG';
            currentShader = phongShader;
        }

        // 키 입력 후 텍스트 업데이트
        updateTextOverlay();
        
        // 's' 또는 'f'가 눌렸을 경우 렌더링을 즉시 1회 수행 (애니메이션이 없으므로)
        if (event.key == 's' || event.key == 'f') {
            render(); 
        }
    });
}

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    
    return true;
}

async function initShaders() {
    
    const gVertSrc = await readShaderFile('shGouraud.vert');
    const gFragSrc = await readShaderFile('shGouraud.frag');
    gouraudShader = new Shader(gl, gVertSrc, gFragSrc);

    const pVertSrc = await readShaderFile('shPhong.vert');
    const pFragSrc = await readShaderFile('shPhong.frag');
    phongShader = new Shader(gl, pVertSrc, pFragSrc);

    const lVertSrc = await readShaderFile('shLamp.vert');
    const lFragSrc = await readShaderFile('shLamp.frag');
    lampShader = new Shader(gl, lVertSrc, lFragSrc);
}

function setCommonUniforms(shader) {
    shader.use();
    shader.setMat4("u_projection", projMatrix);

    shader.setVec3("material.diffuse", vec3.fromValues(1.0, 0.5, 0.31));
    shader.setVec3("material.specular", vec3.fromValues(0.5, 0.5, 0.5));
    shader.setFloat("material.shininess", 32);

    shader.setVec3("light.position", lightPos);
    shader.setVec3("light.ambient", vec3.fromValues(0.2, 0.2, 0.2));
    shader.setVec3("light.diffuse", vec3.fromValues(0.7, 0.7, 0.7));
    shader.setVec3("light.specular", vec3.fromValues(1.0, 1.0, 1.0));
    
    shader.setVec3("u_viewPos", cameraPos);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (arcBallMode == 'CAMERA') {
        viewMatrix = arcball.getViewMatrix();
    }
    else {
        modelMatrix = arcball.getModelRotMatrix();
        viewMatrix = arcball.getViewCamDistanceMatrix();
    }

    currentShader.use(); 
    currentShader.setMat4('u_model', modelMatrix);
    currentShader.setMat4('u_view', viewMatrix);
    currentShader.setVec3('u_viewPos', cameraPos);
    cone.draw(currentShader); 

    lampShader.use();
    lampShader.setMat4('u_view', viewMatrix);
    lamp.draw(lampShader);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL initialization failed');
        }
        
        cone = new Cone(gl, 32);
        lamp = new Cube(gl);

        mat4.lookAt(
            viewMatrix,
            cameraPos, 
            vec3.fromValues(0.0, 0.0, 0.0), 
            vec3.fromValues(0.0, 1.0, 0.0) 
        );

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),  
            canvas.width / canvas.height,
            0.1, 
            100.0 
        );

        await initShaders();

        // Gouraud 셰이더 유니폼 설정
        setCommonUniforms(gouraudShader);

        // Phong 셰이더 유니폼 설정
        setCommonUniforms(phongShader);

        // Lamp 셰이더 유니폼 설정
        lampShader.use();
        lampShader.setMat4("u_projection", projMatrix);
        mat4.translate(lampModelMatrix, lampModelMatrix, lightPos);
        mat4.scale(lampModelMatrix, lampModelMatrix, lightSize);
        lampShader.setMat4('u_model', lampModelMatrix);

        // 초기 셰이더 설정 (FLAT (PHONG) 시작)
        currentShader = phongShader;
        cone.copyFaceNormalsToNormals(); // 초기 'FLAT' 상태
        cone.updateNormals();

        // 텍스트 오버레이 설정 
        setupText(canvas, "Cone with Lighting", 1);
        textOverlay2 = setupText(canvas, "arcball mode: " + arcBallMode, 2);
        textOverlay3 = setupText(canvas, "shading mode: " + shadingMode + " (" + renderingMode + ")", 3);
        setupText(canvas, "press 'a' to change arcball mode", 4);
        setupText(canvas, "press 'r' to reset arcball", 5);
        setupText(canvas, "press 's' to switch to smooth shading", 6);
        setupText(canvas, "press 'f' to switch to flat shading", 7);
        setupText(canvas, "press 'g' to switch to Gouraud shading", 8);
        setupText(canvas, "press 'p' to switch to Phong shading", 9);
        
        setupKeyboardEvents();

        // 첫 렌더링 시작
        requestAnimationFrame(render);

        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}