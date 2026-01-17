export type ChatMessage = {
    role: "user" | "assistant",
    content:string;
}

export class ChatSession {
    private messages:ChatMessage[] = [];

    addUserMessage(content:string){
        this.messages.push({role:"user",content});
    }

    addAssistantMessage(content:string){
        this.messages.push({role:"assistant",content});
    }

    getHistory():ChatMessage[]{
        return [...this.messages];
    }

    clear(){
        this.messages = [];
    }

    isEmpty():boolean {
        return this.messages.length === 0;
    }
}

