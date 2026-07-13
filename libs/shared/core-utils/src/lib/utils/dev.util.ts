/**
 * Simulates a save operation with a specified delay. This function returns a promise that resolves after the given delay,
 * simulating a save operation. The promise randomly resolves or rejects to simulate success or failure.
 * @param delayInMs simulated delay in milisec
 * @returns A promise that resolves after the specified delay, simulating a save operation.
 * The promise randomly resolves or rejects to simulate success or failure.
 */
export function simulateSaveOperation(delayInMs = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a random success or failure
      if (Math.random() > 0.2) {
        resolve();
      } else {
        reject(new Error('Simulated save error'));
      }
    }, delayInMs);
  });
}
