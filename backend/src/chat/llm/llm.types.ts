export interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    tool_call_id?:string;
    toolCalls?: ToolCall[];
}

export interface ToolCall {
    id:string;
    name:string;
    arguments:any;
}

export interface LLMResponse {
    content: string|null;
    toolCalls?:ToolCall[];
}

export interface LLMProvider {
    sendMessage(messages: ChatMessage[]): Promise<LLMResponse>;    
}