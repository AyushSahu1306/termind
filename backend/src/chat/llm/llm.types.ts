export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface LLMProvider {
    sendMessage(messages: ChatMessage[]): Promise<string>;    
}