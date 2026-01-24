import { fetchStatus } from './fetch-status.ts';

fetchStatus({
  onLog: (msg) => console.error(msg),
  onWarn: (msg) => console.error(`Warning: ${msg}`),
})
  .then((data) => {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    console.error('Done!');
    process.exit(0);
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  });
