export class SquarePyramid {
    constructor(gl) {
        this.gl = gl;
        const vertices = new Float32Array([
            // 빨강면
            -0.5, 0.0,  0.5,
             0.5, 0.0,  0.5,
             0.0, 1.0,  0.0,
            // 청록면
            -0.5, 0.0, -0.5,
             0.5, 0.0, -0.5,
             0.0, 1.0,  0.0,
            // 자홍면
            -0.5, 0.0, -0.5,
            -0.5, 0.0,  0.5,
             0.0, 1.0,  0.0,
            // 노랑면
             0.5, 0.0, -0.5,
             0.5, 0.0,  0.5,
             0.0, 1.0,  0.0,
            // 바닥
            -0.5, 0.0, -0.5,
             0.5, 0.0, -0.5,
             0.5, 0.0,  0.5,
            -0.5, 0.0, -0.5,
            -0.5, 0.0,  0.5,
             0.5, 0.0,  0.5,
        ]);

        const colors = new Float32Array([
            // 빨강
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            // 청록
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // 자홍
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            // 노랑
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            // 아무거나 
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
        ]);



        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const positionVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionVbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        const colorVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorVbo);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);
        
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    draw(shader) {
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 18);
        this.gl.bindVertexArray(null);
    }

}
