const { login } = require("biar-fca");
const fs = require("fs");

// Config
const ADMIN_IDS = ["61592733813719"]; // Add admin FB IDs here
let autoReplyActive = true;

// Custom multi-word auto-reply message
const AUTO_REPLY_MESSAGE = 
  "Hello! Thank you for sending a message.\n\n" +
  "I am currently offline or busy at the moment, but I have received your message. " +
  "I will review it and get back to you as soon as possible.\n\n" +
  "If this is urgent, please feel free to leave another detailed message. Have a great day!";

// Load Appstate
if (!fs.existsSync("./appstate.json")) {
  console.error("Error: appstate.json file is missing. Please add your credentials.");
  process.exit(1);
}

const appState = JSON.parse(fs.readFileSync("./appstate.json", "utf8"));

login({ appState }, (err, api) => {
  if (err) {
    console.error("Failed to login using appstate:", err);
    return;
  }

  api.setOptions({
    listenEvents: true,
    selfListen: false, // Prevents bot from replying to its own messages
    logLevel: "silent"
  });

  console.log("Bot logged in successfully!");

  api.listenMqtt((err, event) => {
    if (err) return console.error(err);

    // Only process text messages
    if (event.type === "message" || event.type === "message_reply") {
      const senderID = event.senderID;
      const body = event.body ? event.body.trim() : "";

      // Admin Commands
      if (body === "/on") {
        if (ADMIN_IDS.includes(senderID)) {
          autoReplyActive = true;
          api.sendMessage("Auto-reply system is now ENABLED.", event.threadID, event.messageID);
        } else {
          api.sendMessage("Unauthorized: Only admins can use this command.", event.threadID, event.messageID);
        }
        return;
      }

      if (body === "/off") {
        if (ADMIN_IDS.includes(senderID)) {
          autoReplyActive = false;
          api.sendMessage("Auto-reply system is now DISABLED.", event.threadID, event.messageID);
        } else {
          api.sendMessage("Unauthorized: Only admins can use this command.", event.threadID, event.messageID);
        }
        return;
      }

      // Auto-Reply Handler
      if (autoReplyActive) {
        // Send the multi-word response
        api.sendMessage(AUTO_REPLY_MESSAGE, event.threadID, event.messageID);
      }
    }
  });
});
