export type TechItem = {
  name: string;
  /**
   * simple-icons slug. Required: the marquee only carries things that have a
   * brand mark, so an item without one has no place in these rows.
   */
  slug: string;
  url?: string;
};

/**
 * Your stack, split across the two marquee rows. Rows scroll in opposite
 * directions at different speeds, so keeping them a similar length matters
 * more than which category an item lands in.
 *
 * Anything without a logo lives in prose elsewhere, not here — SQL, pgvector,
 * AWS, Matplotlib, Whisper, quantisation-aware training, structured pruning,
 * Nmap, Scapy and VS Code were all dropped for that reason. (AWS and VS Code
 * do exist as brands; simple-icons removed them on trademark request.)
 */
export const TECH_ROW_A: TechItem[] = [
  { name: 'Python', slug: 'python', url: 'https://www.python.org' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript', url: 'https://www.typescriptlang.org' },
  { name: 'Java', slug: 'openjdk' },
  { name: 'C++', slug: 'cplusplus' },
  { name: 'C', slug: 'c' },
  { name: 'FastAPI', slug: 'fastapi', url: 'https://fastapi.tiangolo.com' },
  { name: 'Node.js', slug: 'nodedotjs', url: 'https://nodejs.org' },
  { name: 'Express.js', slug: 'express' },
  { name: 'React.js', slug: 'react', url: 'https://react.dev' },
  { name: 'Next.js', slug: 'nextdotjs', url: 'https://nextjs.org' },
  { name: 'Tailwind CSS', slug: 'tailwindcss', url: 'https://tailwindcss.com' },
  { name: 'PostgreSQL', slug: 'postgresql', url: 'https://www.postgresql.org' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'Redis', slug: 'redis' },
  { name: 'Supabase', slug: 'supabase', url: 'https://supabase.com' },
  { name: 'Google Cloud', slug: 'googlecloud' },
];

export const TECH_ROW_B: TechItem[] = [
  { name: 'PyTorch', slug: 'pytorch', url: 'https://pytorch.org' },
  { name: 'TensorFlow', slug: 'tensorflow' },
  { name: 'Scikit-learn', slug: 'scikitlearn' },
  { name: 'NumPy', slug: 'numpy' },
  { name: 'Pandas', slug: 'pandas' },
  { name: 'Docker', slug: 'docker', url: 'https://www.docker.com' },
  { name: 'Git', slug: 'git' },
  { name: 'GitHub', slug: 'github' },
  { name: 'Wireshark', slug: 'wireshark' },
  { name: 'Burp Suite', slug: 'burpsuite' },
  { name: 'Kali Linux', slug: 'kalilinux' },
  { name: 'Linux', slug: 'linux' },
  { name: 'Ethereum', slug: 'ethereum' },
  { name: 'Solidity', slug: 'solidity' },
  { name: 'Figma', slug: 'figma' },
  { name: 'MQTT / WebSockets', slug: 'mqtt' },
];
