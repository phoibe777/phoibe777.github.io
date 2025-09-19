attribute vec2 aPosition;
uniform vec2 uTranslation;

void main(void) {
    gl_Position = vec4(aPosition + uTranslation, 0.0, 1.0);
}
