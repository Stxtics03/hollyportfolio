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
 * Where a mark's official colour is unusable against the surface it is drawn
 * on, this returns `currentColor` instead.
 *
 * Several brands are literally black — Express and Next.js are both `000000` —
 * which is invisible on this site's near-black cards, and the mirror problem
 * exists in light mode for the near-white marks. Testing both ends and
 * deferring to the inherited text colour fixes both at once without the icon
 * needing to know which theme is active.
 */
export function markFill(hex: string): string {
  const value = Number.parseInt(hex, 16);
  if (Number.isNaN(value)) return 'currentColor';

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  // Rec. 601 luma is plenty for a "is this nearly black or nearly white" test.
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luma < 0.14 || luma > 0.86 ? 'currentColor' : `#${hex}`;
}

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
