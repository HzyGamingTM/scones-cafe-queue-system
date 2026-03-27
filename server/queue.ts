export type QueueEntry = {
    id: number,
    created_at: string,
    served_at: string | null,
    queue: number,
    served: boolean,
	id_in_queue: number
}
