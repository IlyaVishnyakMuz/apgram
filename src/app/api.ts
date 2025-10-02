const API_KEY = "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"

const ANSWER = "Сгенерируй мне массив из постов в формате json всего с тремя постами, у поста должны быть: url (ссылка на картинку), title и description по типу полноценного поста в телеграмме. Картинку найди вообще любую и пришли url. Пришли мне только массив из трёх постов, больше ничего не пиши. Всё на русском, пришли обычным текстом, тоесть чтобы не было ```json"

export async function generateNews(): Promise<any> {
    try {
        const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: ANSWER,
            }),
        });

        if (!res.ok) {
            throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }

        type OpenAIResponse = {
            output: {
                content: { type: string; text: string }[];
            }[];
        };

        const data: OpenAIResponse = await res.json();

        return JSON.parse(data.output[0]?.content[0]?.text) ?? "Нет ответа";
    } catch (error) {
        console.error("Ошибка при запросе к ChatGPT:", error);
        return "Ошибка при получении ответа";
    }
}
