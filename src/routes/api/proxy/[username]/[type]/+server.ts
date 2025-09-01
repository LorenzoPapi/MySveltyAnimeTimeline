import { json, text } from '@sveltejs/kit';
import { CLIENT_ID, CLIENT_SECRET, API_URL } from "$env/static/private"

const VALID = new Set(['manga', 'anime', ''])

interface MALResponse {
    data: MALObj[],
    paging: {
        previous: string | undefined,
        next: string | undefined
    }
}

interface MALObj {
    node: {
        id: number,
        title: string,
        main_picture: {
            medium: string,
            large: string
        }
    },
    list_status: {
        status: string,
        score: number,
        num_episodes_watched: number,
        is_rewatching: false,
        updated_at: string,
        start_date: string | undefined,
        finish_date: string | undefined
    }
}

interface MSATObj {
    id: number
    start: Date
    end: Date | undefined,
    text: string
    progress: number
    type: string
    //open: boolean
    details: string
}

export const GET = async ({ params, fetch }) => {
    const { username, type } = params

    if (!VALID.has(type)) {
        return json({ error: "invalid type" }, { status: 400 })
    }

    const target = `${API_URL.replace(/\/$/, '')}/users/${encodeURIComponent(username)}/${type}list?fields=list_status&limit=1000`

    try {
        const res = await fetch(target, {
            headers: { "X-MAL-CLIENT-ID": `${CLIENT_ID}` }
        });

        const result: MSATObj[] = []
        const body: MALResponse = await res.json()
        
        body.data.forEach(element => {
            if (element.list_status.status != "plan_to_watch") {
                result.push({
                    id: element.node.id,
                    start: new Date(element.list_status.start_date ?? element.list_status.updated_at),
                    end: element.list_status.status == "watching" ? undefined : new Date(element.list_status.finish_date ?? element.list_status.updated_at),
                    text: element.node.title,
                    progress: element.list_status.status == "completed" ? 100 : 5,
                    type: "summary",
                    //open: true,
                    details: element.list_status.score == 0 ? `You haven't graded this ${type} yet.` : `You gave a score of ${element.list_status.score}/10.`
                })
            }
        });
        result.sort((a, b) => a.start.getTime() - b.start.getTime())

        return json(result, { status: res.status });
    } catch (err) {
        return json({ error: err.message }, { status: 500 });
    }
};
