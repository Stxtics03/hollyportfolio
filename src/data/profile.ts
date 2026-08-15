/**
 * Who you are, in one place. Nothing in the hero hardcodes copy — edit here.
 */

export const PROFILE = {
  name: 'Shrestha.',
  handle: '@Stxtics03',

  /**
   * Your photo. Drop a square image at `public/avatar.jpg` and this picks it
   * up; until then the card falls back to a generated pixel portrait so the
   * layout is never broken by a missing file.
   */
  avatar: '/avatar.jpg',
  avatarAlt: 'Shrestha Chandra',

  /**
   * The headline. `lead` is the loud half — it renders in acid — and the rest
   * carries on around it, so the emphasis is a data decision rather than
   * markup buried in a component.
   */
  headline: {
    before: 'A backend-leaning',
    lead: 'DevOps AI Engineer',
    after: ',',
  },

  bio: 'Building meaningful convenience — the kind that cracks stereotypes and makes $$ bills.',

  availability: {
    available: true,
    label: 'Available for work',
    /** Your timezone, for the live clock in the card footer. */
    timeZone: 'Asia/Kolkata',
  },

  /** Rotates in the card footer. Add or cut freely. */
  quotes: [
    'it works on my machine',
    'just one more terraform apply',
    'who deleted the staging cluster',
    'the logs said it was fine',
    'rollback is also a deploy',
  ],
} as const;
