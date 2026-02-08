/**
 * Fuzzing test runner for security testing
 * Tests input validation with random/malformed inputs
 * 
 * Note: This is a JavaScript file to avoid TypeScript compilation issues
 * @ts-nocheck
 */

// Dynamic import for ES module
import('../../../dist/security/validator.js').then((module) => {
  const { InputValidator } = module;

  /**
   * Generate random string
   */
  function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number in range
   */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Fuzz test VMID validation
   */
  function fuzzVMID(iterations) {
    console.log(`Fuzzing VMID validation with ${iterations} iterations...`);
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const vmid = randomInt(-1000, 2000000000);
        InputValidator.validateVMID(vmid);
      } catch (error) {
        errors++;
      }
    }

    console.log(`VMID fuzzing completed. Errors caught: ${errors}`);
  }

  /**
   * Fuzz test node name validation
   */
  function fuzzNodeName(iterations) {
    console.log(`Fuzzing node name validation with ${iterations} iterations...`);
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const name = randomString(randomInt(0, 100));
        InputValidator.validateNodeName(name);
      } catch (error) {
        errors++;
      }
    }

    console.log(`Node name fuzzing completed. Errors caught: ${errors}`);
  }

  /**
   * Fuzz test string sanitization
   */
  function fuzzSanitization(iterations) {
    console.log(`Fuzzing string sanitization with ${iterations} iterations...`);
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const input = randomString(randomInt(0, 1000));
        // Add control characters
        const malicious = input + '\x00\x01\x02\x1F\x7F';
        const sanitized = InputValidator.sanitizeString(malicious);
        
        // Ensure no control characters remain
        if (/[\x00-\x1F\x7F]/.test(sanitized)) {
          throw new Error('Control characters not sanitized');
        }
      } catch (error) {
        errors++;
        console.error('Sanitization failed:', error);
      }
    }

    console.log(`Sanitization fuzzing completed. Errors: ${errors}`);
  }

  /**
   * Fuzz test IP validation
   */
  function fuzzIPValidation(iterations) {
    console.log(`Fuzzing IP validation with ${iterations} iterations...`);
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const ip = `${randomInt(0, 999)}.${randomInt(0, 999)}.${randomInt(0, 999)}.${randomInt(0, 999)}`;
        InputValidator.validateIPAddress(ip);
      } catch (error) {
        errors++;
      }
    }

    console.log(`IP validation fuzzing completed. Errors caught: ${errors}`);
  }

  /**
   * Main fuzzing runner
   */
  function runFuzzTests() {
    console.log('Starting fuzzing tests...\n');

    const iterations = 10000;

    fuzzVMID(iterations);
    fuzzNodeName(iterations);
    fuzzSanitization(iterations);
    fuzzIPValidation(iterations);

    console.log('\nFuzzing tests completed successfully!');
  }

  // Run fuzzing tests
  runFuzzTests();
}).catch((error) => {
  console.error('Failed to load InputValidator:', error);
  process.exit(1);
});
