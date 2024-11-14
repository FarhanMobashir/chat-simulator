import React, { useState, useCallback } from 'react';

const ConfigurationPanel = ({ config, setConfig, setIsConfiguring }) => {
    const handleStartSimulation = () => {
        setIsConfiguring(false);
        setConfig(prev => ({ ...prev, isRunning: true }));
    };

    const handleConfigChange = (field, value, entityKey = null) => {
        setConfig(prev => {
            if (entityKey) {
                return {
                    ...prev,
                    [entityKey]: {
                        ...prev[entityKey],
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Configure Chat Simulation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Entity 1 Configuration */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Entity 1 Configuration</h3>
                    <label className="block text-sm font-medium text-gray-600">Entity 1 Name</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        value={config.entity1.name}
                        onChange={(e) => handleConfigChange('name', e.target.value, 'entity1')}
                    />
                    <label className="block text-sm font-medium text-gray-600">Entity 1 System Prompt</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 h-28"
                        value={config.entity1.systemPrompt}
                        onChange={(e) => handleConfigChange('systemPrompt', e.target.value, 'entity1')}
                        placeholder="Enter the system prompt for Entity 1..."
                    />
                </div>

                {/* Entity 2 Configuration */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Entity 2 Configuration</h3>
                    <label className="block text-sm font-medium text-gray-600">Entity 2 Name</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        value={config.entity2.name}
                        onChange={(e) => handleConfigChange('name', e.target.value, 'entity2')}
                    />
                    <label className="block text-sm font-medium text-gray-600">Entity 2 System Prompt</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 h-28"
                        value={config.entity2.systemPrompt}
                        onChange={(e) => handleConfigChange('systemPrompt', e.target.value, 'entity2')}
                        placeholder="Enter the system prompt for Entity 2..."
                    />
                </div>
            </div>

            <div className="space-y-8 mt-8">
                {/* Initial Prompt */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Initial Prompt on behalf of entity {config.entity1.name}</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 h-28"
                        value={config.initialPrompt}
                        onChange={(e) => handleConfigChange('initialPrompt', e.target.value)}
                        placeholder="Enter the initial prompt to start the conversation..."
                    />
                </div>

                {/* Simulation Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Maximum Messages: {config.maxMessages}</label>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={config.maxMessages}
                            onChange={(e) => handleConfigChange('maxMessages', parseInt(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Message Delay (ms): {config.messageDelay}</label>
                        <input
                            type="range"
                            min="500"
                            max="5000"
                            step="100"
                            value={config.messageDelay}
                            onChange={(e) => handleConfigChange('messageDelay', parseInt(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleStartSimulation}
                    disabled={!config.entity1.systemPrompt || !config.entity2.systemPrompt || !config.initialPrompt}
                    className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                    Start Simulation
                </button>
            </div>
        </div>
    );
};


const ChatSimulationApp = () => {
    const [isConfiguring, setIsConfiguring] = useState(true);
    const [config, setConfig] = useState({
        entity1: {
            name: "Entity 1",
            systemPrompt: "",
            className: "bg-blue-100"
        },
        entity2: {
            name: "Entity 2",
            systemPrompt: "",
            className: "bg-green-100"
        },
        initialPrompt: "",
        maxMessages: 20,
        messageDelay: 1000,
        isRunning: false
    });

    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEntityResponse = useCallback(async (messages, isEntity1) => {
        const entityConfig = isEntity1 ? config.entity1 : config.entity2;
        try {
            const response = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.2:1b",
                    system: entityConfig.systemPrompt + " Only respond in max 2 sentences or less. Keep it crisp",
                    messages,
                    stream: false,
                }),
            });
            const data = await response.json();
            return {
                role: isEntity1 ? "assistant" : "user",
                content: data.message.content,
                speaker: isEntity1 ? "entity1" : "entity2"
            };
        } catch (error) {
            console.error(`Error fetching ${entityConfig.name} response:`, error);
            return {
                role: isEntity1 ? "assistant" : "user",
                content: "I'm unable to respond right now.",
                speaker: isEntity1 ? "entity1" : "entity2"
            };
        }
    }, [config.entity1, config.entity2]);

    function summarizeConversation(conversationHistory) {
        if (conversationHistory.length <= 5) return conversationHistory;

        // Summarize older messages
        const summary = "In summary: " + conversationHistory.slice(0, -5)
            .map(msg => `${msg.speaker === "entity1" ? config.entity1.name : config.entity2.name} spoke.`)
            .join(" ");

        // Return summary + last few messages
        return [summary, ...conversationHistory.slice(-1)];
    }

    const generateResponse = useCallback(async (conversationHistory, isEntity1) => {
        const entityConfig = isEntity1 ? config.entity1 : config.entity2;
        try {
            const context = summarizeConversation(conversationHistory)
                .map(msg => `${msg.speaker === "entity1" ? config.entity1.name : config.entity2.name}: ${msg.content}`)
                .join("\n");

            const prompt = `${entityConfig.systemPrompt}

Conversation history:
${context}

Instructions: Provide a brief, natural continuation of the conversation in 2 sentences or less.
${entityConfig.name}'s response:`;

            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.2:1b",
                    prompt,
                    stream: false,
                }),
            });
            const data = await response.json();
            return {
                role: isEntity1 ? "assistant" : "user",
                content: data.response,
                speaker: isEntity1 ? "entity1" : "entity2"
            };
        } catch (error) {
            console.error(`Error generating ${entityConfig.name} response:`, error);
            return {
                role: isEntity1 ? "assistant" : "user",
                content: "I'm unable to respond right now.",
                speaker: isEntity1 ? "entity1" : "entity2"
            };
        }
    }, [config.entity1, config.entity2]);


    const continueConversation = useCallback(async () => {
        if (isLoading || !config.isRunning) return;
        setIsLoading(true);

        try {
            if (conversation.length === 0) {
                const entity1Messages = [
                    { role: "system", content: config.entity1.systemPrompt },
                    { role: "user", content: config.initialPrompt }
                ];
                const entity1Response = await fetchEntityResponse(entity1Messages, true);
                setConversation([entity1Response]);
            } else {
                const lastMessage = conversation[conversation.length - 1];
                const isLastMessageEntity1 = lastMessage.speaker === "entity1";

                if (isLastMessageEntity1) {
                    const entity2Response = await generateResponse(conversation, false);
                    setConversation(prev => [...prev, entity2Response]);
                } else {
                    const entity1Messages = [
                        { role: "system", content: config.entity1.systemPrompt },
                        ...conversation.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        }))
                    ];
                    const entity1Response = await fetchEntityResponse(entity1Messages, true);
                    setConversation(prev => [...prev, entity1Response]);
                }
            }
        } catch (error) {
            console.error("Error in conversation:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, config, conversation, fetchEntityResponse, generateResponse]);

    React.useEffect(() => {
        let timeoutId;

        if (!isLoading && config.isRunning && conversation.length < config.maxMessages) {
            timeoutId = setTimeout(continueConversation, config.messageDelay);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [conversation, isLoading, config.isRunning, config.maxMessages, config.messageDelay, continueConversation]);

    const handleStartSimulation = () => {
        setIsConfiguring(false);
        setConfig(prev => ({ ...prev, isRunning: true }));
    };

    const handleReset = () => {
        setConversation([]);
        setIsConfiguring(true);
        setConfig(prev => ({ ...prev, isRunning: false }));
    };

    const handleConfigChange = (field, value, entityKey = null) => {
        setConfig(prev => {
            if (entityKey) {
                return {
                    ...prev,
                    [entityKey]: {
                        ...prev[entityKey],
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };



    const SimulationPanel = () => (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">{`${config.entity1.name} - ${config.entity2.name} Conversation`}</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.isRunning}
                                onChange={(e) => handleConfigChange('isRunning', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span className="text-sm">{config.isRunning ? "Running" : "Paused"}</span>
                    </div>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="max-h-[600px] overflow-y-auto space-y-4">
                    {conversation.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg ${msg.speaker === "entity1"
                                ? `${config.entity1.className} ml-4`
                                : `${config.entity2.className} mr-4`
                                }`}
                        >
                            <div className="font-semibold mb-1">
                                {msg.speaker === "entity1" ? `${config.entity1.name}:` : `${config.entity2.name}:`}
                            </div>
                            <div>{msg.content}</div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="text-center text-gray-500">
                            Thinking...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return isConfiguring ? <ConfigurationPanel config={config} setConfig={setConfig} setIsConfiguring={setIsConfiguring} /> : <SimulationPanel />;
};

export default ChatSimulationApp;
