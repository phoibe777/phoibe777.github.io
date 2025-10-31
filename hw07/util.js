// util.js
/**
 * 캔버스 크기 조절 시 WebGL 뷰포트도 함께 조절
 * (이 예제에서는 사용되지 않지만 17_GouraudShading.js에 포함되어 있음)
 */
export function resizeAspectRatio(gl, canvas) {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.round(canvas.clientWidth * dpr);
    const displayHeight = Math.round(canvas.clientHeight * dpr);

    // 캔버스 메모리 크기가 디스플레이 크기와 다를 경우 조절
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

/**
 * 캔버스 위에 텍스트 오버레이를 설정
 * @param {HTMLCanvasElement} canvas - 기준 캔버스
 * @param {string} text - 표시할 텍스트
 * @param {number} line - 텍스트가 표시될 줄 번호 (1부터 시작)
 * @returns {HTMLDivElement} 생성된 텍스트 엘리먼트
 */
export function setupText(canvas, text, line) {
    const container = canvas.parentElement || document.body;

    // 텍스트를 담을 div 생성
    const textOverlay = document.createElement('div');
    textOverlay.style.position = 'absolute';
    textOverlay.style.left = '10px'; // 캔버스 좌측 여백
    textOverlay.style.top = `${10 + (line - 1) * 20}px`; // 줄 간격 20px
    textOverlay.style.color = 'white';
    textOverlay.style.fontFamily = 'monospace';
    textOverlay.style.fontSize = '16px';
    textOverlay.textContent = text;
    
    container.appendChild(textOverlay);
    return textOverlay;
}

/**
 * 기존 텍스트 오버레이의 내용을 업데이트
 * @param {HTMLDivElement} element - setupText로 생성된 엘리먼트
 * @param {string} text - 새로 표시할 텍스트
 */
export function updateText(element, text) {
    if (element) {
        element.textContent = text;
    }
}