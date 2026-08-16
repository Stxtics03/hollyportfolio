import { ProjectCard } from './ProjectCard';
import { PROJECTS } from '../../data/projects';

/**
 * The projects grid.
 *
 * Two columns from `md`, one below it — at 640 the spine is too narrow to put
 * two of these side by side and still have the descriptions read. The second
 * column is dropped half a card, which is the offset the reference layout
 * uses; it stops a short row of cards from reading as a table.
 */
export function ProjectGrid({ still = false }: { still?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:[&>*:nth-child(even)]:mt-10">
      {PROJECTS.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} still={still} />
      ))}
    </div>
  );
}
