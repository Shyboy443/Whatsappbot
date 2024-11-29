const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

// Create the WhatsApp client
const whatsapp = new Client({
  authStrategy: new LocalAuth({ clientId: "custom_session_id" }),
});

// Define Plans, Flyers, and Payment Methods
const plans = {
  1: {
    description: `💬 **ChatGPT Premium Plans:**\n\n1️⃣ **2-Month Plan**:\n💰 Price: 1200 LKR\n⏳ Duration: 2 Months\n🌟 Access to ChatGPT Premium features.\n\n2️⃣ **6-Month Plan**:\n💰 Price: 2300 LKR\n⏳ Duration: 6 Months\n🌟 ChatGPT Premium + Grammarly Premium!`,
    flyer: "./flyers/chatgpt.png", // Path to your flyer image
  },
  2: {
    description: `🎥 **Netflix Packages:**\n\n1️⃣ **1-Month Premium**:\n💰 Price: 899 LKR\n⏳ Duration: 1 Month\n🌟 Access to Netflix Premium (HD).\n\n2️⃣ **3-Month Premium**:\n💰 Price: 1899 LKR\n⏳ Duration: 3 Months\n🌟 Netflix Premium 4K (Ultra HD).`,
    flyer: "./flyers/NETFLIX (1).jpg",
  },
  3: {
    description: `🎨 **Adobe Creative Cloud Plans:**\n\n1️⃣ **Monthly Upgrade Plan**:\n💰 Price: 1699 LKR/month\n🌟 Photoshop, Illustrator, Premiere Pro + 100GB storage.\n\n2️⃣ **First Login Plan**:\n💰 Price: 999 LKR/month\n🌟 All features included, with a password reset on first login.`,
    flyer: "./flyers/creativecloud.png",
  },
  4: {
    description: `📈 **Social Media Growth:**\n\n💡 **Facebook**:\n👍 Post Likes: 200 = 1,100 LKR\n👍 Page Likes: 500 = 3,100 LKR\n\n💡 **Instagram**:\n👀 Views: 10,000 = 900 LKR\n❤️ Likes: 500 = 500 LKR\n\n💡 **TikTok**:\n✨ Custom Packages Available!`,
    flyer: "./flyers/socialmedia.png",
  },
  5: {
    description: `🎥 **CapCut Premium Plans:**\n\n1️⃣ **6-Month Plan**:\n💰 Price: 600 LKR\n🌟 Access to all CapCut Premium features.\n\n2️⃣ **12-Month Plan**:\n💰 Price: 1100 LKR\n🌟 Full year of CapCut Premium!`,
    flyer: "./flyers/chatgpt.png",
  },
  6: {
    description: `🎨 **Freepik Premium Plans:**\n\nWhat is Freepik Premium?\n🌟 Access high-quality design resources: vectors, stock photos, PSD files, and icons.\n\n1️⃣ **3-Month Plan**:\n💰 Price: 1999 LKR\n⏳ Duration: 3 Months\n🔒 Semi-shared account with **100 downloads/day**.\n\n2️⃣ **6-Month Plan**:\n💰 Price: 3699 LKR\n⏳ Duration: 6 Months\n🔒 Semi-shared account with **100 downloads/day**.\n\n✨ No watermarks and unlimited creativity!`,
    flyer: "./flyers/freepic.jpg",
  },
};

const paymentMethods = {
  bank: `**🏦 Online Bank Transfer:**\n💳 Account: 8003500657\n📌 Name: T.M.A.S.B Tennakoon\n💼 Bank: Commercial Bank Kandy`,
  crypto: `**💰 Crypto Deposit:**\n🔗 Binance ID: 428801040`,
};

const clientPurchaseState = {}; // Track purchase flow for each user

// Event to generate QR code for WhatsApp login
whatsapp.on("qr", (qr) => {
  console.log("Scan the QR code to log in:");
  qrcode.generate(qr, { small: true });
});

// Event to handle incoming messages
whatsapp.on("message", async (message) => {
  const chatId = message.from;
  const clientMessage = message.body.trim().toLowerCase();

  // Commands for packages
  if (clientMessage.startsWith("!")) {
    const command = clientMessage.substring(1); // Remove "!" to get the command

    // Show packages
    if (command === "packages") {
      const packageMessage = `Here are the available plans:\n\n1️⃣ *!1* - ChatGPT\n2️⃣ *!2* - Netflix\n3️⃣ *!3* - Adobe Creative Cloud\n4️⃣ *!4* - Social Media Growth\n5️⃣ *!5* - CapCut\n6️⃣ *!6* - Freepik Premium\n\nType the number of the plan (e.g., *!1* for ChatGPT).`;
      await message.reply(packageMessage);
      return;
    }

    // Show details for specific plan
    if (!isNaN(command) && plans[command]) {
      const selectedPlan = plans[command];
      const flyer = MessageMedia.fromFilePath(selectedPlan.flyer);

      clientPurchaseState[chatId] = { selectedPlan: command };

      await whatsapp.sendMessage(chatId, flyer); // Send flyer image
      await message.reply(
        `${selectedPlan.description}\n\nDo you want to purchase this package? Reply with '*Yes*' or '*No*'.`
      );
      return;
    }

    // Payment methods
    if (command === "pay") {
      await message.reply(
        `Here are the available payment methods:\n\n1️⃣ *!bank* - For Bank Transfer.\n2️⃣ *!crypto* - For Crypto Deposit.`
      );
      return;
    }

    // Bank details
    if (command === "bank") {
      await message.reply(paymentMethods.bank);
      return;
    }

    // Crypto details
    if (command === "crypto") {
      await message.reply(paymentMethods.crypto);
      return;
    }
  }

  // Handle confirmation of purchase
  if (
    clientPurchaseState[chatId] &&
    !clientPurchaseState[chatId].confirmed &&
    (clientMessage === "yes" || clientMessage === "no")
  ) {
    if (clientMessage === "yes") {
      clientPurchaseState[chatId].confirmed = true;
      await message.reply(
        "Great! To proceed, type *!pay* to view payment methods."
      );
      return;
    } else if (clientMessage === "no") {
      delete clientPurchaseState[chatId];
      await message.reply("No problem! Type *!packages* to view other plans.");
      return;
    }
  }

  // Default help message
  if (clientMessage === "!help") {
    const helpMessage = `Here’s how to navigate:\n\n1️⃣ Type *!packages* to view available plans.\n2️⃣ Select a plan by typing *!<number>* (e.g., *!1* for ChatGPT).\n3️⃣ After seeing the plan details, type 'Yes' to purchase or 'No' to cancel.\n4️⃣ Type *!pay* to view payment methods.\n5️⃣ Use *!bank* or *!crypto* for specific payment details.\n6️⃣ Type *!restart* to start over.`;
    await message.reply(helpMessage);
    return;
  }

  // Restart conversation
  if (clientMessage === "!restart") {
    delete clientPurchaseState[chatId];
    await message.reply(
      "🔄 Restarting the conversation... Type any recognized command to begin."
    );
    return;
  }
});

// Event triggered when the client is ready
whatsapp.on("ready", () => {
  console.log("Client is ready!");
});

// Handle authentication failure
whatsapp.on("auth_failure", (message) => {
  console.error("Authentication failed:", message);
});

// Handle disconnection
whatsapp.on("disconnected", (reason) => {
  console.log("Client was logged out. Reason:", reason);
});

// Start the client
whatsapp.initialize();
