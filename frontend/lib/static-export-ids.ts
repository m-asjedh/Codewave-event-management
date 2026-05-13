/**
 * Event IDs pre-rendered at build time for `output: "export"` (static hosting, e.g. Amplify).
 * Must include any URL users might open directly or refresh. Add more IDs here
 * when you need additional static paths (e.g. from a CMS at build time).
 */
export const PRE_RENDERED_EVENT_IDS = ["demo-aurora", "demo-tide"] as const;
