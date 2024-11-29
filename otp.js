const { authenticator } = require("otplib");
const readline = require("readline");

// Replace with your secret key from the authenticator
const SECRET_KEY = "RVINNGNTTYFWPYMH6SQTVNPRWIQCNHK5"; // Example secret key

// Store tokens and their usage count
const tokens = new Map();

// Function to generate a token
function generateToken() {
  return Math.random().toString(36).substring(2, 15); // Simple random token generator
}

// Function to get OTP only when time remaining is at maximum
function getTotpWhenTimeIsMax(secret, token, callback) {
  // Check if the token is valid
  if (!tokens.has(token)) {
    return callback("Invalid token. Please enter a valid token.");
  }

  // Check the usage count
  const usageCount = tokens.get(token);
  if (usageCount >= 5) {
    return callback("Token usage limit reached. Request a new token.");
  }

  // Calculate the remaining time for the current OTP
  const timeRemaining = authenticator.timeRemaining();

  // If the remaining time is not at maximum, wait until the next cycle
  if (timeRemaining !== 30) {
    console.log(`Please wait ${timeRemaining} seconds for the next OTP...`);
    setTimeout(
      () => getTotpWhenTimeIsMax(secret, token, callback),
      timeRemaining * 1000
    );
    return;
  }

  // Generate the current OTP
  const currentCode = authenticator.generate(secret);

  // Increment the usage count for the token
  tokens.set(token, usageCount + 1);

  return callback(null, { currentCode, timeRemaining });
}

// Function to request a new token
function requestToken() {
  const newToken = generateToken();
  tokens.set(newToken, 0); // Initialize the token with 0 usage
  return newToken;
}

// Initialize readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Simulate a user requesting a token
const userToken = requestToken();
console.log(`Your token is: ${userToken}`);

// Function to prompt the user for the token
function promptForToken() {
  rl.question("Enter your token: ", (inputToken) => {
    getTotpWhenTimeIsMax(SECRET_KEY, inputToken, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Current OTP Code: ${result.currentCode}`);
        console.log(`Time Remaining: ${result.timeRemaining} seconds`);
      }

      // Prompt the user again or close the session
      rl.question("Do you want to try again? (yes/no): ", (response) => {
        if (response.toLowerCase() === "yes") {
          promptForToken();
        } else {
          console.log("Goodbye!");
          rl.close();
        }
      });
    });
  });
}

// Start the prompt
promptForToken();
