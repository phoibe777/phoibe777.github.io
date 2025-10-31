#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec4 a_color;
layout(location = 3) in vec2 a_texCoord;

// Fragment Shader로 전달할 출력 변수
out vec3 v_normal;
out vec3 v_fragPos;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
    
    // 월드 공간에서의 정점 위치
    v_fragPos = vec3(u_model * vec4(a_position, 1.0));
    
    // 월드 공간에서의 법선 벡터 (non-uniform scaling에 대응)
    v_normal = mat3(transpose(inverse(u_model))) * a_normal;
}