export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uChaos;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float aSeed;

  varying float vAlpha;

  void main() {
    // At uChaos = 0 this is exactly the home position — no exceptions. Motion only
    // exists while uChaos > 0, which the JS side raises during a drag on the logo or
    // while the lock screen is being slid up.
    vec2 home = position.xy;
    float r = length(home);
    float baseAngle = atan(home.y, home.x);

    float dir = aSeed > 0.5 ? 1.0 : -1.0;
    float orbitSpeed = (1.4 / max(r, 0.8)) * dir;
    float angle = baseAngle + uChaos * uTime * orbitSpeed;
    float radius = r * (1.0 + uChaos * (0.35 + aSeed * 0.7));

    vec2 orbited = vec2(cos(angle), sin(angle)) * radius;
    vec2 finalXY = mix(home, orbited, uChaos);

    float zWobble = uChaos * sin(uTime * 3.0 + aSeed * 40.0) * 0.4;
    vec3 pos = vec3(finalXY, zWobble);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = max(-mvPosition.z, 0.1);
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 100.0);
    gl_PointSize = clamp(uSize * uPixelRatio * twinkle * (40.0 / dist), 1.0, 16.0);
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = 0.6 + 0.4 * twinkle;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uLight; // 1 = drawn on a light background (normal blending), 0 = glowing on dark (additive)
  uniform float uFade;  // 1 = visible, 0 = gone (the end of the unlock slide)
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float glow = smoothstep(0.5, 0.0, d);

    // On dark: a white-hot core that adds light. On light: a deeper-blue core, since white would vanish.
    vec3 darkCore = mix(uColor, vec3(1.0), smoothstep(0.2, 0.0, d));
    vec4 onDark = vec4(darkCore * glow, glow * vAlpha);
    vec3 lightCore = mix(uColor, uColor * 0.78, smoothstep(0.3, 0.0, d));
    vec4 onLight = vec4(lightCore, glow * vAlpha);

    vec4 c = mix(onDark, onLight, uLight);
    gl_FragColor = vec4(c.rgb, c.a * uFade);
  }
`;
