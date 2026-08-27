export const diskVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uCompression;
  uniform float uIntensity;
  uniform float uOrbitScale;

  varying vec3 vColor;
  varying float vOpacity;

  float fieldNoise(vec3 point) {
    return sin(point.x * 0.23 + uTime * 0.42)
      * cos(point.z * 0.19 - uTime * 0.31)
      + sin((point.x + point.z) * 0.11 + uTime * 0.18) * 0.5;
  }

  void main() {
    vec4 instancedOrigin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float originalRadius = length(instancedOrigin.xz);
    float radius = originalRadius * uCompression;
    float initialAngle = atan(instancedOrigin.z, instancedOrigin.x);
    float orbitalVelocity = (1.55 / sqrt(originalRadius)) * uOrbitScale;
    float currentAngle = initialAngle + uTime * orbitalVelocity;

    vec3 worldPosition = vec3(
      cos(currentAngle) * radius,
      instancedOrigin.y,
      sin(currentAngle) * radius
    );
    worldPosition.y += fieldNoise(worldPosition) * uMorph * 2.6;

    vec3 viewDirection = normalize(cameraPosition - worldPosition);
    vec3 orbitDirection = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));
    float doppler = dot(orbitDirection, viewDirection);

    vec3 warmTerracotta = vec3(0.70, 0.33, 0.30);
    vec3 mutedCitron = vec3(0.79, 0.85, 0.48);
    vec3 mineralSlate = vec3(0.27, 0.39, 0.42);
    vec3 ivory = vec3(0.92, 0.89, 0.80);
    vec3 color = mix(mineralSlate, warmTerracotta, 1.0 - smoothstep(13.0, 42.0, radius));
    color = mix(color, mutedCitron, 1.0 - smoothstep(6.0, 15.0, radius));
    color = mix(color, ivory, 1.0 - smoothstep(4.0, 8.0, radius));

    vColor = color * (1.18 + doppler * 0.58) * uIntensity;
    vOpacity = smoothstep(3.8, 5.4, radius)
      * (1.0 - smoothstep(38.0, 48.0, radius))
      * 0.82;

    float deltaAngle = currentAngle - initialAngle;
    float cosine = cos(deltaAngle);
    float sine = sin(deltaAngle);
    mat3 rotation = mat3(
      cosine, 0.0, sine,
      0.0, 1.0, 0.0,
      -sine, 0.0, cosine
    );
    vec3 localPosition = (instanceMatrix * vec4(position, 0.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix
      * vec4(worldPosition + rotation * localPosition, 1.0);
  }
`;

export const diskFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    gl_FragColor = vec4(vColor, vOpacity);
  }
`;

export const auraVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const auraFragmentShader = /* glsl */ `
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 4.0);
    vec3 citron = vec3(0.79, 0.85, 0.48);
    vec3 terracotta = vec3(0.70, 0.33, 0.30);
    vec3 color = mix(terracotta, citron, rim);
    gl_FragColor = vec4(color * rim * uIntensity * 3.8, rim * 0.86);
  }
`;

export type IntelligenceState = {
  morph: number;
  compression: number;
  intensity: number;
  rotation: number;
  cameraY: number;
  cameraDistance: number;
  orbit: number;
};

export const intelligenceStates = [
  {
    morph: 0.16,
    compression: 1,
    intensity: 0.88,
    rotation: 0.24,
    cameraY: 22,
    cameraDistance: 76,
    orbit: 0.92,
  },
  {
    morph: 2.8,
    compression: 1.1,
    intensity: 1.08,
    rotation: 0.7,
    cameraY: 34,
    cameraDistance: 82,
    orbit: 1.45,
  },
  {
    morph: 0.72,
    compression: 0.55,
    intensity: 1.7,
    rotation: 1.45,
    cameraY: 15,
    cameraDistance: 58,
    orbit: 2.8,
  },
] as const satisfies readonly IntelligenceState[];
