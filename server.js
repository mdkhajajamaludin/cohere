import express from 'express';
import cors from 'cors';
import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Hugging Face client using environment variable
const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        let response = "";

        const stream = await client.chatCompletionStream({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 5000
        });

        for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
                const newContent = chunk.choices[0].delta.content;
                response += newContent;
            }
        }

        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});