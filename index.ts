/**
 * Main entry point for the TypeScript Node.js application
 */

function main(): void {
  console.log("Hello, TypeScript Node.js project!");
  console.log("Current time:", new Date().toISOString());
}

// Run the main function
if (require.main === module) {
  main();
}

export { main };
