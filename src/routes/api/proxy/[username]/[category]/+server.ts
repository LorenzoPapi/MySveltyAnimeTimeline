import { json, text } from '@sveltejs/kit';
import { CLIENT_ID, CLIENT_SECRET, API_URL } from "$env/static/private"

export const GET = async ({ params, fetch }) => {
    const { username, category } = params

    const target = `${API_URL.replace(/\/$/, '')}/users/${encodeURIComponent(username)}/${category}list?fields=list_status&limit=1000&nsfw=true`
    try {
        const res = await fetch(target, {
            headers: { "X-MAL-CLIENT-ID": `${CLIENT_ID}` }
        });

        const result: MSATObj[] = [];

        (await res.json() as MALResponse).data.forEach(element => {
            if (!element.list_status.status.startsWith("plan_to") && !!element.list_status.start_date) {
                var newObj : MSATObj = {
                    id: element.node.id,
                    start: new Date(element.list_status.start_date),
                    end: (element.list_status.status == "watching" || element.list_status.status == "reading") ? undefined : new Date(element.list_status.finish_date ?? element.list_status.updated_at),
                    text: element.node.title,
                    progress: 100,
                    type: element.list_status.status == "completed" ? "urgent" : "task",
                    score: element.list_status.score == 0 ? undefined : element.list_status.score,
                    objType: category as ServerObjCategory,
                    objStatus: element.list_status.status
                }

                if (newObj.start.getTime() == newObj.end?.getTime())
                    newObj.end = new Date(newObj.end.getTime() + 86400000)
                
                result.push(newObj)
            }
        });
        result.sort((a, b) => a.start.getTime() - b.start.getTime())

        return json(result, { status: res.status });
    } catch (err) {
        return json({ error: err.message }, { status: 500 });
    }
};
