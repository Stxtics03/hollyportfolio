import { ExperienceCard } from './ExperienceCard';
import { EXPERIENCE } from '../../data/experience';

/**
 * The work history: one card per job, stacked, newest first.
 *
 * A single column rather than the projects grid — these entries are read top
 * to bottom as a timeline, and their info lists make them too tall to sit
 * side by side on this spine.
 */
export function ExperienceList({ still = false }: { still?: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      {EXPERIENCE.map((item, index) => (
        <ExperienceCard key={item.slug} item={item} index={index} still={still} />
      ))}
    </div>
  );
}
