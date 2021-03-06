export let fragmentShader = `
uniform vec3 u_resolution;
// uniform float u_time;
// uniform sampler2D iChannel0;

mat3 xrot(float angle) {
  mat3 m;
  m[0] = vec3(1.0, 0.0, 0.0);
  m[1] = vec3(0.0, cos(angle), -sin(angle));
  m[2] = vec3(0.0, sin(angle), cos(angle));
  return m;
}

mat3 yrot(float angle) {
  mat3 m;
  m[0] = vec3(cos(angle), 0.0, -sin(angle));
  m[1] = vec3(0.0, 1.0, 0.0);
  m[2] = vec3(sin(angle), 0.0, cos(angle));
  return m;
}

/**
  * camera: 相机位置
  * ray: 几何体指向相机的射线
  * sphereOrigin: 地球的位置
  * sphereRadius: 地球的半径
  */
float intersectSphere(vec3 camera, vec3 ray, vec3 sphereOrigin, float sphereRadius) {
  // 地球半径的平方
  float radiusSquared = sphereRadius * sphereRadius;
  // 地球指向相机的向量
  vec3 sphereCameraVec = sphereOrigin - camera;
  // 几何体指向相机的向量 在 地球指向相机的向量 的 投影
  float dt = dot(ray, sphereCameraVec);
  if (dt < 0.0) {
      return -1.0;
  }

  // 相机指向地球的向量
  vec3 cameraSpereVec = camera - sphereOrigin;
  // 模长的平方
  cameraSpereVec.x = dot(cameraSpereVec, cameraSpereVec);
  cameraSpereVec.x = cameraSpereVec.x - dt * dt;
  if (cameraSpereVec.x >= radiusSquared) {
      return -1.0;
  }
  float distanceFromCamera = dt - sqrt(radiusSquared - cameraSpereVec.x);
  return distanceFromCamera;
}

vec4 render(vec2 uv) {
  // uv 坐标处理
  uv = uv * 2.0;
  uv.y -= 1.0;
  uv.x -= (1.0 / (u_resolution.y / u_resolution.x));

  // 地球的位置
  vec3 spherePosition = vec3(0.0, 0.0, 3.0);
  // 地球的半径
  float sphereRadius = 1.4;

  // 相机的位置
  vec3 cameraPosition = vec3(0.0, 0.0, -1.0);

  // 灯源的位置
  vec3 lightPosition = cameraPosition;

  // 几何体坐标
  vec3 pixelPosition = vec3(uv.x, uv.y, 0.0);

  // Generate a ray
  vec3 ray = pixelPosition - cameraPosition;
  ray = normalize(ray);


  float distance = intersectSphere(cameraPosition, ray, spherePosition, sphereRadius);

  if (distance > 0.0) {
    vec3 pointOfIntersection = cameraPosition + ray * distance;
    vec3 normal = normalize(pointOfIntersection - spherePosition);

    float u = 0.5 + atan(normal.z, normal.x) / (3.1415926 * 2.0);
    float v = 0.5 - asin(normal.y) / -3.1415926;

    // 亮度
    float brightness = dot(normalize(lightPosition - spherePosition), normal);
    if (brightness < 0.0) {
        brightness = 0.0;
    }

    // vec4 outputColor = texture2D(iChannel0, vec2(fract(u), fract(v)));
    vec4 outputColor = vec4(0.5, 0.5, 0.5, 1.);

    float x = u * 18.0;
    float y = v * 10.0;
    // fract(x),返回x的小数部分
    if (fract(x) < 0.1 || fract(y) < 0.1) {
      outputColor *= 0.5;
    }
    return outputColor * brightness;
  }
  else {
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 uv = fragCoord.xy / u_resolution.xy;
  uv.x /= u_resolution.y / u_resolution.x;
  fragColor = render(uv);
}

void main() {
  // gl_FragCoord: 持有该framgent的屏幕相对坐标(x, y, z, 1/w)
  mainImage(gl_FragColor, gl_FragCoord.xy);
}

`
