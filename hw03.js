/**
 * hw03.js: Circle-Line Segment Intersection Logic (Dynamic Info)
 * * - 원 입력 시: 원 정보 (1번째 줄)만 표시
 * - 선분 입력 시: 원 정보 (1번째 줄) + 선분 정보 (2번째 줄) 표시
 * - 계산 완료 시: 3줄 전체 정보 유지
 */

// 전역 변수
let gl;
let canvas;
let program;
const CANVAS_SIZE = 700;
const EPSILON = 1e-6; // 부동 소수점 오차 처리

// NDC 좌표계에서 도형 정보 (가장 최근 한 쌍만 저장)
let circle = { center: null, radius: 0.0 };
let lineSegment = { p1: null, p2: null };
let intersectionPoints = [];
let hasCalculated = false; // 교차점 계산이 완료되었는지 여부

// 마우스 이벤트 상태
let currentMode = 'circle'; // 'circle' -> 'line'
let isDragging = false;
let circleStartPoint = null;
let lineSegmentClickCount = 0;


// =========================================================================
// WebGL 초기화 및 유틸리티 함수
// =========================================================================

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        alert("WebGL not available");
        return;
    }

    const vertexShaderSource = document.getElementById("vertex-shader").text;
    const fragmentShaderSource = document.getElementById("fragment-shader").text;
    
    program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    gl.viewport(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 

    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);

    render();
};

function createProgram(gl, vsSource, fsSource) {
    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling ${type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader: ` + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}


// =========================================================================
// 마우스 이벤트 및 입력 처리
// =========================================================================

function getNDC(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / CANVAS_SIZE * 2 - 1;
    const y = 1 - (clientY - rect.top) / CANVAS_SIZE * 2;
    return [x, y];
}

function mouseDownHandler(event) {
    if (event.button !== 0) return; 

    if (currentMode === 'circle') {
        // **새로운 원 입력을 시작하면 모든 것을 초기화**
        gl.clear(gl.COLOR_BUFFER_BIT); // 화면 지우기
        circle = { center: null, radius: 0.0 };
        lineSegment = { p1: null, p2: null };
        intersectionPoints = [];
        hasCalculated = false;
        
        const [x, y] = getNDC(event.clientX, event.clientY);
        circleStartPoint = [x, y];
        circle.center = [x, y];
        circle.radius = 0.0;
        isDragging = true;
    } else if (currentMode === 'line') {
        const [x, y] = getNDC(event.clientX, event.clientY);
        if (lineSegmentClickCount === 0) {
            // 선분 입력 시작 시, 교차점 정보만 초기화
            intersectionPoints = []; 
            hasCalculated = false;

            lineSegment.p1 = [x, y];
            lineSegment.p2 = [x, y]; 
            lineSegmentClickCount++;
            isDragging = true;
        }
    }
    render();
}

function mouseMoveHandler(event) {
    if (!isDragging) return;

    const [x, y] = getNDC(event.clientX, event.clientY);

    if (currentMode === 'circle') {
        const dx = x - circleStartPoint[0];
        const dy = y - circleStartPoint[1];
        circle.radius = Math.sqrt(dx * dx + dy * dy);
    } else if (currentMode === 'line' && lineSegmentClickCount === 1) {
        lineSegment.p2 = [x, y]; 
    }
    render();
}

function mouseUpHandler(event) {
    if (event.button !== 0) return;

    if (currentMode === 'circle' && isDragging) {
        isDragging = false;
        if (circle.radius > EPSILON) {
            currentMode = 'line'; // 원 입력 완료, 선분 입력으로 전환
        } else {
            // 원이 너무 작으면 무시하고 다시 원 입력 대기 (데이터 초기화)
            circle.center = null; 
            circle.radius = 0;
        }
        circleStartPoint = null;
    } else if (currentMode === 'line' && isDragging) {
        isDragging = false;
        lineSegmentClickCount = 0;
        
        // 선분 입력 완료 후 교차점 계산
        if (lineSegment.p1 && lineSegment.p2) {
            intersectionPoints = calculateCircleLineSegmentIntersection(
                circle.center, circle.radius, lineSegment.p1, lineSegment.p2
            );
            hasCalculated = true;
        }
        
        // 계산 완료 후 바로 'circle' 모드로 전환하여 다음 입력을 받도록 준비
        currentMode = 'circle'; 
    }
    render();
}


// =========================================================================
// 기하학적 계산 (Circle-Line Segment Intersection) (이전 버전과 동일)
// =========================================================================

function calculateCircleLineSegmentIntersection(C, r, P1, P2) {
    if (!C || !P1 || !P2 || r <= 0) return [];
    
    const Cx = C[0], Cy = C[1];
    const P1x = P1[0], P1y = P1[1];
    
    const Dx = P2[0] - P1x;
    const Dy = P2[1] - P1y;
    
    const Ex = P1x - Cx;
    const Ey = P1y - Cy;
    
    const a = Dx * Dx + Dy * Dy;
    const b = 2 * (Ex * Dx + Ey * Dy);
    const c = (Ex * Ex + Ey * Ey) - r * r;
    
    if (a < EPSILON) return [];
    
    const discriminant = b * b - 4 * a * c;
    const intersections = [];

    if (discriminant < -EPSILON) return intersections;
    
    const sqrtDisc = Math.sqrt(Math.max(0, discriminant)); 
    const t_values = [];
    t_values.push((-b - sqrtDisc) / (2 * a));
    t_values.push((-b + sqrtDisc) / (2 * a));
    
    t_values.forEach(t => {
        if (t >= -EPSILON && t <= 1 + EPSILON) {
            const Px = P1x + t * Dx;
            const Py = P1y + t * Dy;
            
            const isDuplicate = intersections.some(p => 
                Math.hypot(p[0] - Px, p[1] - Py) < EPSILON * 10
            );
            
            if (!isDuplicate) {
                intersections.push([Px, Py]);
            }
        }
    });
    
    return intersections;
}


// =========================================================================
// 렌더링 및 정보 표시
// =========================================================================

function render() {
    // NDC 좌표축 (참조용)은 항상 그립니다.
    drawPrimitive([0, -1, 0, 0, 1, 0], gl.LINES, [1.0, 0.0, 0.0, 1.0], 2);
    drawPrimitive([-1, 0, 0, 1, 0, 0], gl.LINES, [0.0, 1.0, 0.0, 1.0], 2);
    
    // 원 렌더링
    if (circle.center && circle.radius > 0) {
        const circleVertices = generateCircleVertices(circle.center, circle.radius, 100);
        drawPrimitive(circleVertices, gl.LINE_LOOP, [0.6, 0.0, 0.8, 1.0], circleVertices.length / 3);
    }

    // 선분 렌더링
    if (lineSegment.p1 && lineSegment.p2) {
        const lineVertices = [
            lineSegment.p1[0], lineSegment.p1[1], 0, 
            lineSegment.p2[0], lineSegment.p2[1], 0
        ];
        drawPrimitive(lineVertices, gl.LINES, [1.0, 1.0, 1.0, 1.0], 2);
    }
    
    // 교차점 렌더링
    if (intersectionPoints.length > 0) {
        const pointsVertices = [];
        intersectionPoints.forEach(p => {
            pointsVertices.push(p[0], p[1], 1.0); // z=1.0 마킹
        });
        drawPrimitive(pointsVertices, gl.POINTS, [1.0, 1.0, 0.0, 1.0], intersectionPoints.length);
    }

    displayInfo();
}

function drawPrimitive(vertices, mode, color, count) {
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(vPosition);

    const u_Color = gl.getUniformLocation(program, "u_Color");
    gl.uniform4fv(u_Color, color);

    gl.drawArrays(mode, 0, count);
}

function generateCircleVertices(center, radius, segments) {
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const angle = i * 2 * Math.PI / segments;
        const x = center[0] + radius * Math.cos(angle);
        const y = center[1] + radius * Math.sin(angle);
        vertices.push(x, y, 0); 
    }
    return vertices;
}

/**
 * 정보 표시 (Info) - 과제 조건에 맞춰 단계별로 정보를 표시합니다.
 */
function displayInfo() {
    const info = document.getElementById('info');
    let output = '';

    // 1. Circle 정보 (첫 번째 줄): 원 입력 중이거나 완료 시 표시
    if (currentMode === 'circle' && circle.center && isDragging) {
        // 원 입력 중
        output += `Circle: center (${circle.center[0].toFixed(2)}, ${circle.center[1].toFixed(2)}) radius = ${circle.radius.toFixed(2)}\n`;
    } else if (circle.center && circle.radius > EPSILON) {
        // 원 입력 완료 (선분 입력 대기 중이거나 계산 완료 후)
        output += `Circle: center (${circle.center[0].toFixed(2)}, ${circle.center[1].toFixed(2)}) radius = ${circle.radius.toFixed(2)}\n`;
    } 
    

    // 2. Line Segment 정보 (두 번째 줄): 선분 입력 중이거나 완료 시 표시
    if (currentMode === 'line' && isDragging) {
        // 선분 입력 중
        output += `Line segment: (${lineSegment.p1[0].toFixed(2)}, ${lineSegment.p1[1].toFixed(2)}) ~ (${lineSegment.p2[0].toFixed(2)}, ${lineSegment.p2[1].toFixed(2)})\n`;
    } else if (lineSegment.p1 && lineSegment.p2) {
        // 선분 입력 완료 (계산 완료 후)
        output += `Line segment: (${lineSegment.p1[0].toFixed(2)}, ${lineSegment.p1[1].toFixed(2)}) ~ (${lineSegment.p2[0].toFixed(2)}, ${lineSegment.p2[1].toFixed(2)})\n`;
    } 
    
    // 3. Intersection Point 정보 (세 번째 줄): 계산 완료 시에만 표시
    if (hasCalculated) {
        const count = intersectionPoints.length;
        if (count === 0) {
            output += `No intersection\n`;
        } else {
            output += `Intersection Points: ${count}`;
            intersectionPoints.forEach((p, index) => {
                output += ` Point ${index + 1}: (${p[0].toFixed(2)}, ${p[1].toFixed(2)})`;
            });
            output += `\n`;
        }
    } 

    info.textContent = output.trim();
}