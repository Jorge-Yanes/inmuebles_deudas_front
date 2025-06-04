"use client";
// pages/chatbot.js (or app/chatbot/page.tsx)
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import PropertyCard from '@/components/property-card';

// Types
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

type Asset = any;

const ChatbotPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Stores chat history
    const [input, setInput] = useState<string>(''); // Stores current input field value
    const [loading, setLoading] = useState<boolean>(false); // Indicates if an API call is in progress
    const [propertyResults, setPropertyResults] = useState<Asset[]>([]); // Stores asset data from API

    const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for auto-scrolling chat

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || loading) return;

        const userMessage = input.trim();
        setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);
        setPropertyResults([]); // Clear previous results when sending a new query

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMessage }),
            });

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const data = await response.json();

            // Add the bot's conversational response
            if (data.conversationalResponse) {
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: data.conversationalResponse }]);
            } else if (data.error) {
                 // Handle errors returned from the API explicitly
                 setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: `Error: ${data.error}` }]);
            }


            // Update asset results if available
            if (data.propertyResults && Array.isArray(data.propertyResults)) {
                setPropertyResults(data.propertyResults);
            }


        } catch (error) {
            console.error('Error fetching from API:', error);
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Lo siento, ocurrió un error al procesar tu solicitud.' }]);
            setPropertyResults([]); // Clear results on error
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header style={{ padding: '10px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
                <h1>Asistente de Propiedades</h1>
            </header>

            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                {/* Chat Window */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
                    <div style={{ flexGrow: 1 }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                margin: '5px 0',
                                padding: '8px 12px',
                                borderRadius: '15px',
                                maxWidth: '70%',
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.sender === 'user' ? '#007bff' : '#e9e9eb',
                                color: msg.sender === 'user' ? 'white' : 'black',
                                marginLeft: msg.sender === 'user' ? 'auto' : '0',
                                marginRight: msg.sender === 'bot' ? 'auto' : '0',
                            }}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        ))}
                         {loading && (
                            <div style={{
                                margin: '5px 0',
                                padding: '8px 12px',
                                borderRadius: '15px',
                                maxWidth: '70%',
                                alignSelf: 'flex-start',
                                backgroundColor: '#e9e9eb',
                                color: 'black',
                            }}>
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} /> {/* Scroll anchor */}
                    </div>

                    {/* Input Area */}
                    <div style={{ display: 'flex', padding: '10px 0' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu consulta sobre propiedades..."
                            style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}
                            disabled={loading}
                        >
                            Enviar
                        </button>
                    </div>
                </div>

                {/* Property Results Area */}
                <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                    <h2>Resultados de Propiedades</h2>
                    {loading && propertyResults.length === 0 && (
                         <p>Buscando propiedades...</p>
                    )}
                     {!loading && propertyResults.length === 0 && messages.length > 0 && (
                         <p>No se encontraron propiedades que coincidan con tu búsqueda.</p>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                        {propertyResults.map((asset, index) => (
                            <PropertyCard key={index} property={asset} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;
