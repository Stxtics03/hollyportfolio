import {
  siBurpsuite,
  siC,
  siCplusplus,
  siDocker,
  siEthereum,
  siExpress,
  siFastapi,
  siFigma,
  siFlask,
  siGit,
  siGithub,
  siGooglecloud,
  siJavascript,
  siJupyter,
  siKalilinux,
  siLinux,
  siMongodb,
  siMqtt,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siReact,
  siRedis,
  siScikitlearn,
  siSolidity,
  siSupabase,
  siTailwindcss,
  siTensorflow,
  siTypescript,
  siWireshark,
} from 'simple-icons';

export type BrandMark = {
  /** The `d` of a single path on a 24×24 viewBox. */
  path: string;
  /** Brand colour, without the leading `#`. */
  hex: string;
};

/**
 * Brand marks, imported by name rather than looked up dynamically.
 *
 * simple-icons ships ~3,400 icons; a dynamic `icons[slug]` lookup defeats
 * tree-shaking and drags the entire set into the bundle. Naming each import
 * keeps only what this page actually draws.
 *
 * Anything missing here renders a neutral pixel glyph instead — either the
 * item is a technique rather than a product, or simple-icons has dropped the
 * mark on trademark request.
 */
export const BRAND_MARKS: Record<string, BrandMark> = {
  burpsuite: siBurpsuite,
  c: siC,
  cplusplus: siCplusplus,
  docker: siDocker,
  ethereum: siEthereum,
  express: siExpress,
  fastapi: siFastapi,
  figma: siFigma,
  flask: siFlask,
  git: siGit,
  github: siGithub,
  googlecloud: siGooglecloud,
  javascript: siJavascript,
  jupyter: siJupyter,
  kalilinux: siKalilinux,
  linux: siLinux,
  mongodb: siMongodb,
  mqtt: siMqtt,
  mysql: siMysql,
  nextdotjs: siNextdotjs,
  nodedotjs: siNodedotjs,
  numpy: siNumpy,
  openjdk: siOpenjdk,
  pandas: siPandas,
  postgresql: siPostgresql,
  python: siPython,
  pytorch: siPytorch,
  react: siReact,
  redis: siRedis,
  scikitlearn: siScikitlearn,
  solidity: siSolidity,
  supabase: siSupabase,
  tailwindcss: siTailwindcss,
  tensorflow: siTensorflow,
  typescript: siTypescript,
  wireshark: siWireshark,
};
