const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function loadKnowledgeBase() {
    const knowledgeDir = path.join(__dirname, 'wissensdatenbank');
    let knowledge = '';
    
    try {
        const files = fs.readdirSync(knowledgeDir);
        for (const file of files) {
            if (file.endsWith('.md') || file.endsWith('.txt')) {
                const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
                knowledge += `\n\n--- Dokument: ${file} ---\n${content}`;
            }
        }
    } catch (error) {
        console.error('Fehler beim Laden der Wissensdatenbank:', error);
    }
    
    return knowledge;
}

const SYSTEM_PROMPT = `Du bist ein Assistent für Fragen zur Arbeitszeiterfassung von Lehrkräften.

STRIKTE REGELN:
1. Antworte NUR mit Informationen aus der Wissensdatenbank unten
2. Erfinde KEINE zusätzlichen Informationen oder Kontexte
3. Halte Antworten KURZ und PRÄZISE - maximal 2-3 Sätze wenn möglich
4. Zitiere oder paraphrasiere direkt aus der Wissensdatenbank
5. Wenn die Antwort NICHT in der Wissensdatenbank steht, antworte NUR mit: [KEINE_ANTWORT] Zu dieser Frage habe ich leider keine Information in meiner Datenbank.
6. Füge KEINE allgemeinen Ratschläge, Empfehlungen oder Hintergrundinformationen hinzu

Wissensdatenbank:
{KNOWLEDGE_BASE}

Antworte auf Deutsch. Sei präzise und knapp.`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Nachricht fehlt' });
        }

        const knowledgeBase = loadKnowledgeBase();
        const systemPrompt = SYSTEM_PROMPT.replace('{KNOWLEDGE_BASE}', knowledgeBase);

        const messages = [
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 512,
            temperature: 0,
            system: systemPrompt,
            messages: messages
        });

        const assistantMessage = response.content[0].text;
        const cannotAnswer = assistantMessage.includes('[KEINE_ANTWORT]');
        const cleanedMessage = assistantMessage.replace('[KEINE_ANTWORT]', '').trim();

        res.json({
            response: cleanedMessage,
            cannotAnswer: cannotAnswer,
            conversationHistory: [
                ...messages,
                { role: 'assistant', content: cleanedMessage }
            ]
        });

    } catch (error) {
        console.error('Chat-Fehler:', error);
        res.status(500).json({ error: 'Fehler bei der Verarbeitung der Anfrage' });
    }
});

app.post('/api/send-email', async (req, res) => {
    try {
        const { question, userEmail, userName } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Frage fehlt' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_CONTACT || 'ansprechperson@schule.de',
            subject: 'Frage zur Arbeitszeiterfassung - Chatbot-Weiterleitung',
            html: `
                <h2>Neue Frage zur Arbeitszeiterfassung</h2>
                <p><strong>Von:</strong> ${userName || 'Unbekannt'} (${userEmail || 'Keine E-Mail angegeben'})</p>
                <p><strong>Frage:</strong></p>
                <blockquote style="background: #f9f9f9; border-left: 4px solid #ccc; padding: 10px;">
                    ${question}
                </blockquote>
                <p><em>Diese Anfrage wurde automatisch vom Arbeitszeiterfassungs-Chatbot weitergeleitet, da keine passende Antwort gefunden wurde.</em></p>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        
        res.json({ success: true, message: 'E-Mail wurde erfolgreich gesendet' });

    } catch (error) {
        console.error('E-Mail-Fehler:', error);
        res.status(500).json({ error: 'Fehler beim Senden der E-Mail' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
