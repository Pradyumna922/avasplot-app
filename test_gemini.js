const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDLB6yhhq1zWlKdzLVbAvUbUIJh66cs5g4");
async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'API works'");
        console.log("Success:", result.response.text().trim());
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
