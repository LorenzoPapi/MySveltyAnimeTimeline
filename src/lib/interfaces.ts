type ClientObjCategory = 'both' | 'anime' | 'manga';
type ServerObjCategory = 'anime' | 'manga'

type ClientObjStatus = 'all' | 'completed' | 'reading' | 'watching' | 'on_hold'
type ServerObjStatus = 'completed' | 'reading' | 'watching' | 'on_hold'

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
        status: ServerObjStatus
        score: number
        num_episodes_watched: number | undefined
        num_volumes_read: number | undefined
        num_chapters_read: number | undefined
        is_rewatching: false
        updated_at: string
        start_date: string | undefined
        finish_date: string | undefined
    }
}

interface MSATObj {
    id: number
    start: Date
    end: Date | undefined
    text: string
    progress: number
    type: string
    score: number | undefined
    objStatus: ServerObjStatus
    objType: ServerObjCategory
}