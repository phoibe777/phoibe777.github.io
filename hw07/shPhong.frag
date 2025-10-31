#version 300 es

precision highp float;

// Vertex shader에서 보간된(interpolated) 입력 변수
in vec3 v_normal;
in vec3 v_fragPos;

out vec4 FragColor;

struct Material {
    vec3 diffuse;
    vec3 specular;
    float shininess;
};
struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

void main() {
    // Fragment Shader에서 조명 계산 (Phong Shading)
    
    // ambient
    vec3 rgb = material.diffuse;
    vec3 ambient = light.ambient * rgb;
    
    // diffuse
    vec3 norm = normalize(v_normal); // 보간된 법선 사용
    vec3 lightDir = normalize(light.position - v_fragPos); // 보간된 위치 사용
    float dotNormLight = dot(norm, lightDir);
    float diff = max(dotNormLight, 0.0);
    vec3 diffuse = light.diffuse * diff * rgb;
    
    // specular
    vec3 viewDir = normalize(u_viewPos - v_fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = 0.0;
    if (dotNormLight > 0.0) {
        spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    }
    vec3 specular = light.specular * spec * material.specular;
    
    // ambient + diffuse + specular
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}