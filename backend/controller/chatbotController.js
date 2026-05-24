import chatbotService from "../service/chatbotService.js";

export const getChatbotResponse = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        
        const response = await chatbotService.getResponse(message);
        
        return res.status(200).json({ response });
    } catch (error) {
        console.error("Error in chatbot controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};