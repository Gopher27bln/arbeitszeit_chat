const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

function loadKnowledgeBase() {
    const knowledgeDir = path.join(__dirname, '../../wissensdatenbank');
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

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, conversationHistory = [] } = JSON.parse(event.body);
        
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Nachricht fehlt' })
            };
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

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                response: cleanedMessage,
                cannotAnswer: cannotAnswer,
                conversationHistory: [
                    ...messages,
                    { role: 'assistant', content: cleanedMessage }
                ]
            })
        };

    } catch (error) {
        console.error('Chat-Fehler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fehler bei der Verarbeitung der Anfrage' })
        };
    }
};
