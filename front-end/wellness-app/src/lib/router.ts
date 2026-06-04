import { router, type Href } from 'expo-router';

/** Navigate until Expo typed routes are regenerated after new screens. */
export function navigate(href: string) {
  router.push(href as Href);
}

export function replace(href: string) {
  router.replace(href as Href);
}
