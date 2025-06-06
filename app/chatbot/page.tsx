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
            // Ensure loading state is cleared
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


    // Basic CSS for the modern chat layout (inline styles for simplicity)
    const layoutStyles: React.CSSProperties = {
        display: 'flex',
 flexDirection: 'column',
        height: '100vh',
 backgroundColor: '#f7f7f7', // Light grey background
    };

    const chatContainerStyles: React.CSSProperties = {
        display: 'flex',
 flexGrow: 1,
 overflow: 'hidden',
    };

    const chatWindowStyles: React.CSSProperties = {
        flex: 1,
 display: 'flex',
 flexDirection: 'column',
        padding: '20px', // Increased padding
 overflowY: 'auto',
 backgroundColor: '#fff', // White background for chat window
        borderRadius: '8px', // Rounded corners
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', // Subtle shadow
        margin: '20px', // Margin around the chat window
    };

    const messagesListStyles: React.CSSProperties = {
 flexGrow: 1,
 overflowY: 'auto', // Ensure scrolling within the message area
        paddingBottom: '20px', // Add padding at the bottom for input area spacing
};

    const messageBubbleStyles = (sender: 'user' | 'bot'): React.CSSProperties => ({
        margin: '10px 0', // Increased margin between messages
        padding: '12px 18px', // Increased padding inside bubbles
        borderRadius: '20px', // More rounded corners
        maxWidth: '80%', // Increased max-width
 alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
 backgroundColor: sender === 'user' ? '#0b84f3' : '#e5e5ea', // Modern colors
        color: sender === 'user' ? 'white' : '#333', // Text color
        marginLeft: sender === 'user' ? 'auto' : '0',
 marginRight: sender === 'bot' ? 'auto' : '0',
 fontSize: '1rem', // Standard font size
 lineHeight: '1.4', // Improved line height
    });

    const inputAreaStyles: React.CSSProperties = {
 display: 'flex',
        paddingTop: '15px', // Padding above input area
 borderTop: '1px solid #eee', // Subtle border
 alignItems: 'center',
};

    const textInputStyles: React.CSSProperties = {
 flexGrow: 1,
        padding: '12px 15px', // Increased padding
 borderRadius: '20px', // Rounded input field
 border: '1px solid #ccc',
 marginRight: '10px',
 fontSize: '1rem',
 outline: 'none', // Remove default outline
    };

    return (
        <div style={layoutStyles}>
            {/* Header */}
            {/* <header style={{ padding: '15px', backgroundColor: '#fff', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Asistente de Propiedades</h1>
            </header> */}

            <div style={chatContainerStyles}>
                {/* Chat Window */}
                <div style={chatWindowStyles}>
                    <div style={messagesListStyles}>
                        {messages.map((msg, index) => (
                            <div key={index} style={messageBubbleStyles(msg.sender)}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        ))}
                         {loading && (
                            <div style={messageBubbleStyles('bot')}>
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} /> {/* Scroll anchor */}
                    </div>

                    {/* Input Area */}
                    <div style={inputAreaStyles}>
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu consulta sobre propiedades..."
                            style={textInputStyles}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                padding: '12px 25px', // Increased padding
                                borderRadius: '20px', // Rounded button
                                border: 'none',
                                backgroundColor: '#0b84f3', // Modern button color
                                color: 'white',
 cursor: loading ? 'not-allowed' : 'pointer',
 fontSize: '1rem',
 transition: 'background-color 0.2s ease', // Smooth transition
 opacity: loading ? 0.7 : 1, // Reduced opacity when disabled
                            }}
                            disabled={loading}
                        >
                            Enviar
                        </button>
                    </div>
                </div>

                {/* Property Results Area */}
                {/* This section remains largely the same for now, as the focus was on the chat UI/UX */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', margin: '20px' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.3rem', color: '#333' }}>Resultados de Propiedades</h2>
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
