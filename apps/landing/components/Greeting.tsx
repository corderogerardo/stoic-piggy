import { APP_NAME } from '@stoicpiggy/shared';

export function Greeting({ name }: { name: string }) {
  return (
    <p>
      Welcome to {APP_NAME}, {name}!
    </p>
  );
}
