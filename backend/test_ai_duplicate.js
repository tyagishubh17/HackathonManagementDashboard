const axios = require("axios");

async function main() {
  const url = "http://127.0.0.1:8000/api/duplicate-check";
  const payload = {
    name: "John Doe",
    email: "tyagishubh17@gmail.com",
    phone: "1234567890",
    college: "Test University",
    skills: ["javascript", "react"],
    existing_participants: [
      {
        id: "6a379a4095f0c442f40b022d",
        name: "John Doe",
        email: "tyagishubh17@gmail.com",
        phone: "1234567890",
        college: "Test University",
        skills: ["javascript", "react"]
      }
    ]
  };

  try {
    console.log("Sending request to AI Service via 127.0.0.1...");
    const response = await axios.post(url, payload);
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
  } catch (err) {
    console.error("Request failed!");
    console.error(err.message);
  }
}

main();
