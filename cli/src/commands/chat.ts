import { authenticatedFetch } from "../auth/authenticated-fetch.js";


export async function chat(message:string):Promise<void> {
    if(!message) {
        console.log("Usage: chat <your message>");
        return;
    }

    try {
        const res = await authenticatedFetch("http://localhost:3000/chat",{
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message})
        });

        if(!res.ok){
            const err = await res.text();
            console.error("Chat error: ",err);
            return;
        }

        const data = await res.json();
        console.log(data.reply ?? "(no reply)");
    } catch (error:any) {
        console.error("Chat request failed: ",error.message);
    }
}