/**
 * Slugify a device name. "+" becomes "plus" before other symbols are
 * stripped, because phone line-ups routinely ship both variants — without
 * this, "Galaxy S24+" and "Galaxy S24" collapse to the same handle and one
 * silently loses.
 */
export const toHandle = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
