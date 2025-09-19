function main() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    alert("WebGL not supported!");
    return;
  }

  // scissor test를 켬
  gl.enable(gl.SCISSOR_TEST);

  function render() {
    // 캔버스 크기를 1:1 비율로 조정
    resizeCanvasToSquare(canvas);

    const width = canvas.width;
    const height = canvas.height;
    gl.viewport(0, 0, width, height);

    // 화면을 4등분해서 각기 다른 색상 출력
    // 왼쪽 아래
    gl.scissor(0, 0, width / 2, height / 2);
    gl.clearColor(1.0, 0.0, 0.0, 1.0); // 빨강
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 오른쪽 아래
    gl.scissor(width / 2, 0, width / 2, height / 2);
    gl.clearColor(0.0, 1.0, 0.0, 1.0); // 초록
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 왼쪽 위
    gl.scissor(0, height / 2, width / 2, height / 2);
    gl.clearColor(0.0, 0.0, 1.0, 1.0); // 파랑
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 오른쪽 위
    gl.scissor(width / 2, height / 2, width / 2, height / 2);
    gl.clearColor(1.0, 1.0, 0.0, 1.0); // 노랑
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // 브라우저 리사이즈 이벤트
  window.addEventListener("resize", render);

  render();
}

// 캔버스 크기를 window 크기에 맞추되 정사각형 유지
function resizeCanvasToSquare(canvas) {
  const displaySize = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = displaySize;
  canvas.height = displaySize;
}

main();
