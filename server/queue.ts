import { randomUUID } from "node:crypto";
import { redis } from "./redis";

export enum QueueStatus {
    NOT_IN_QUEUE,
    IN_QUEUE,
    SERVED
}

export type QueueEntry = {
    uuid: string,
    time_added: string,
};

export class Queue {
    entries: QueueEntry[] = [];
    pastEntries: QueueEntry[] = [];
    redisPrefix: string

    constructor(redisPrefix: string = "") {
        this.redisPrefix = redisPrefix;
        if (redisPrefix !== "") this.redisPrefix += "_";
    }

    async enqueue(uuid?: string) : Promise<QueueEntry> {
        if (uuid === undefined)
            uuid = randomUUID().toString();

        const newQueueEntry: QueueEntry = {
            uuid: uuid,
            time_added: new Date().toDateString()
        };

        const rp = this.redisPrefix;
        await redis.rpush(`${rp}entries_uuid`, newQueueEntry.uuid);
        await redis.rpush(`${rp}entries_date`, newQueueEntry.time_added);

        return newQueueEntry;
    }

    async length() : Promise<number> {
        return await redis.llen(`${this.redisPrefix}entries_uuid`) ?? 0;
    }

    async dequeue(uuid: string) : Promise<QueueEntry | undefined> {
        const rp = this.redisPrefix;

        try {
            const pos = await redis.lpos(`$${rp}entries_uuid`, uuid);
            console.log("HERE IS POS");
            console.log(pos);
            if (pos === null)
                return undefined;

            const dateNullable: string | null = await redis.lindex(`${rp}entries_date`, pos);
            if (dateNullable === null)
                console.warn("WARN: UUIDs and Dates list length mismatch!");

            let date = dateNullable ?? "";
            
            await redis.lrem(`${rp}entries_uuid`, 1, uuid);
            await redis.lrem(`${rp}entries_date`, 1, date);
            await redis.rpush(`${rp}pastEntries_uuid`, uuid);
            await redis.rpush(`${rp}pastEntries_date`, date);
            
            return {
                uuid: uuid,
                time_added: date ?? ""
            };
        } catch (e) {
            console.error(`Failed to dequeue ${uuid}`);
            console.error(e);
            return undefined;
        }
    }

    async get(uuid: string) : Promise<QueueEntry | undefined> {
        const rp = this.redisPrefix;

        try {
            const pos = await redis.lpos(`${rp}entries_uuid`, uuid);
            if (pos === null)
                return undefined;

            return {
                uuid: uuid,
                time_added: await redis.lindex(`${rp}entries_date`, pos) ?? ""
            };
        } catch (e) {
            console.error(`Failed to get ${uuid}`);
            console.error(e);
            return undefined;
        }
    }


    async dequeueFirst() : Promise<QueueEntry | undefined> {
        const rp = this.redisPrefix;

        try {
            const uuid = await redis.lmove(`${rp}entries_uuid`, `${rp}pastEntries_uuid`, "left", "right");
            const date = await redis.lmove(`${rp}entries_date`, `${rp}pastEntries_date`, "left", "right");

            if (uuid === null || date === null) {
                console.log("No more");
                return undefined;
            }

            return {
                uuid: uuid,
                time_added: date
            };
        } catch (e) {
            console.error(`Failed to dequeue first`);
            console.error(e);
            return undefined;
        }
    }

    async getFirst() : Promise<QueueEntry | undefined> {
        try {
            return await redis.lindex(`${this.redisPrefix}entries_uuid`, 0) ?? undefined;
        } catch (e) {
            console.error(`Failed to get first`);
            console.error(e);
            return undefined;
        }
    }

    async getQueueStatus(uuid: string) : Promise<{status: QueueStatus, people_ahead?: number}> {
        const rp = this.redisPrefix;

        let pos = await redis.lpos(`${rp}entries_uuid`, uuid);
        if (pos !== null)
            return { status: QueueStatus.IN_QUEUE, people_ahead: pos };

        pos = await redis.lpos(`${rp}pastEntries_uuid`, uuid);
        if (pos !== null)
            return { status: QueueStatus.SERVED };

        return { status: QueueStatus.NOT_IN_QUEUE };
    }
}

// horrible class name
export class UniqueQueueArray {
    queues: Queue[] = []

    constructor(redisPrefix: string = "", initialQueueCount: number = 0) {
        if (redisPrefix !== "") redisPrefix += "_";

        for (let i = 0; i < initialQueueCount; i++)
            this.queues.push(new Queue(`${redisPrefix}uqa_queue${i}`));
    }

    // horrible function name, horrible api. please redesign
    async getQueueContainingUuid(uuid: string) : Promise<Queue | undefined> {
        for (let queue of this.queues)
            if ((await queue.getQueueStatus(uuid)).status === QueueStatus.IN_QUEUE)
                return queue;

        return undefined;
    }

    // ditto
    async getQueueNumberContainingUuid(uuid: string) : Promise<number | undefined> {
        for (let i = 0; i < this.queues.length; i++)
            if ((await this.queues[i].getQueueStatus(uuid)).status === QueueStatus.IN_QUEUE)
                return i;

        return undefined;
    }

    async enqueue(room: number, uuid?: string) : Promise<QueueEntry | undefined> {
        room = Math.floor(room);
        if (room < 0 || room >= this.queues.length)
            return undefined;

        if (uuid !== undefined) {
            for (let queue of this.queues)
                if ((await queue.getQueueStatus(uuid)).status == QueueStatus.IN_QUEUE)
                    return undefined;
        }

        return await this.queues[room].enqueue(uuid);
    }

    async dequeue(uuid: string) : Promise<QueueEntry | undefined> {
        let queue = await this.getQueueContainingUuid(uuid);

        if (queue !== undefined)
            return await queue.dequeue(uuid);
    }

    async get(uuid: string) : Promise<QueueEntry | undefined> {
        for (let i = 0; i < this.queues.length; i++) {
            let possibleEntry = await this.queues[i].get(uuid);

            if (possibleEntry !== undefined)
                return possibleEntry;
        }
    }

    async dequeueFirst(room: number) : Promise<QueueEntry | undefined> {
        room = Math.floor(room);
        if (room < 0 || room >= this.queues.length)
            return undefined;

        return await this.queues[room].dequeueFirst();
    }

    async getFirst(room: number) : Promise<QueueEntry | undefined> {
        room = Math.floor(room);
        if (room < 0 || room >= this.queues.length)
            return undefined;

        return await this.queues[room].getFirst();
    }
}

// TODO: turn 3 into a configured variable. maybe roomsconfig.json or something.
// since this file is only about queues, maybe extract the singleton into another file
// which also handles loading from a file
let singletonQueues = new UniqueQueueArray("", 3);
export { singletonQueues };
