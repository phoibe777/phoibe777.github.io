// Fragment Shader

precision highp float; // 부동 소수점 정밀도 설정
varying vec4 fColor;     // Vertex Shader로부터 보간되어 넘어온 색상

void main() {
    // gl_FragColor는 Vertex Shader에서 넘어온 색상(fColor)을 그대로 사용합니다.
    // 이는 하나의 draw call 내에서 모든 픽셀에 동일한 색상을 적용합니다.
    gl_FragColor = fColor;
}