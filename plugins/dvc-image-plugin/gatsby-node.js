const { spawn } = require('child_process');
const chokidar = require('chokidar');

function run(command, ...args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      // ignore stdin and stdout, and get a stderr stream
      stdio: ['ignore', 'ignore', 'pipe']
    });
    let stderr = '';
    child.stderr.on('data', d => {
      stderr += d;
    });
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        const commandString = '`' + [command, ...args].join(' ') + '`';
        reject(
          new Error(
            `Command ${commandString} failed with exit code ${code}.\n${stderr}`
          )
        );
      }
    });
    child.on('error', reject);
  });
}

exports.onPreBootstrap = async (
  { actions: { createNode }, reporter },
  // Plugin options
  { imagesDvcPath, imagesPath }
) => {
  async function pull() {
    await run('dvc', 'pull', imagesDvcPath);
  }

  async function push() {
    await run('dvc', 'commit', '-f', imagesDvcPath);
    await run('dvc', 'push', imagesDvcPath);
  }

  try {
    await pull();

    if (process.env.CI) {
      return;
    }

    await push();
  } catch (e) {
    reporter.panic('could not perform initial sync', e);
  }

  // Sync loop which runs in background
  (async () => {
    const watch = chokidar.watch([imagesPath, imagesDvcPath], {
      ignoreInitial: true
    });
    const waitForChange = () =>
      new Promise(resolve => {
        watch.once('all', (_, path) => resolve(path));
      });
    try {
      // Using an infinite loop strategy to avoid pull and push
      // from triggering with each other by emitting change events
      while (true) {
        const changedPath = await waitForChange();
        if (changedPath === imagesDvcPath) {
          await pull();
        } else {
          await push();
        }
      }
    } catch (e) {
      reporter.panic('could not sync images with DVC', e);
    }
  })();
};
