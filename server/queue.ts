import crypto from "node:crypto";
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

function generateRandomId() {
    return Buffer.from(crypto.randomBytes(9)).toString("base64").replaceAll("/", "-").replaceAll("+", "_");
}

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
            uuid = generateRandomId();

        const newQueueEntry: QueueEntry = {
            uuid: uuid,
            time_added: new Date().toString(),
        };

        const rp = this.redisPrefix;
        await redis.rpush(`${rp}entries_uuid`, newQueueEntry.uuid);
        await redis.rpush(`${rp}entries_date`, newQueueEntry.time_added);

        return newQueueEntry;
    }

    async length() : Promise<number> {
        return await redis.llen(`${this.redisPrefix}entries_uuid`) ?? 0;
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


    async dequeue() : Promise<QueueEntry | undefined> {
        const rp = this.redisPrefix;

        try {
            const uuid = await redis.lmove(`${rp}entries_uuid`, `${rp}pastEntries_uuid`, "left", "right");
            const date = await redis.lmove(`${rp}entries_date`, `${rp}pastEntries_date`, "left", "right");

            if (uuid === null || date === null) {
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

        try {
            let pos = await redis.lpos(`${rp}entries_uuid`, uuid);
            if (pos !== null)
                return { status: QueueStatus.IN_QUEUE, people_ahead: pos };

            pos = await redis.lpos(`${rp}pastEntries_uuid`, uuid);
            if (pos !== null)
                return { status: QueueStatus.SERVED };
        } catch (e) {
            console.error(e);
        }

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

    async getEntryInfo(uuid: string) : Promise<{ queueNum?: number, queue?: Queue, status: QueueStatus, people_ahead?: number }> {
        const queueStatuses = await Promise.all(this.queues.map(q => q.getQueueStatus(uuid)));

        for (let i = 0; i < this.queues.length; i++)
            if (queueStatuses[i].status == QueueStatus.IN_QUEUE)
                return {
                    queueNum: i,
                    queue: this.queues[i],
                    status: queueStatuses[i].status,
                    people_ahead: queueStatuses[i].people_ahead
                };

        for (let i = 0; i < this.queues.length; i++)
            if (queueStatuses[i].status == QueueStatus.SERVED)
                return {
                    queueNum: i,
                    queue: this.queues[i],
                    status: queueStatuses[i].status
                };

        return {
            status: QueueStatus.NOT_IN_QUEUE
        };
    }

    async enqueue(queueNum: number, uuid?: string) : Promise<QueueEntry | undefined> {
        queueNum = Math.floor(queueNum);
        if (queueNum < 0 || queueNum >= this.queues.length)
            return undefined;

        if (uuid !== undefined) {
            for (let queue of this.queues)
                if ((await queue.getQueueStatus(uuid)).status == QueueStatus.IN_QUEUE)
                    return undefined;
        }

        return await this.queues[queueNum].enqueue(uuid);
    }

    async get(uuid: string) : Promise<QueueEntry | undefined> {
        for (let i = 0; i < this.queues.length; i++) {
            let possibleEntry = await this.queues[i].get(uuid);

            if (possibleEntry !== undefined)
                return possibleEntry;
        }
    }

    async dequeue(queueNum: number) : Promise<QueueEntry | undefined> {
        queueNum = Math.floor(queueNum);
        if (queueNum < 0 || queueNum >= this.queues.length)
            return undefined;

        return await this.queues[queueNum].dequeue();
    }

    async getFirst(queueNum: number) : Promise<QueueEntry | undefined> {
        queueNum = Math.floor(queueNum);
        if (queueNum < 0 || queueNum >= this.queues.length)
            return undefined;

        return await this.queues[queueNum].getFirst();
    }
}

// TODO: turn 3 into a configured variable. maybe roomsconfig.json or something.
// since this file is only about queues, maybe extract the singleton into another file
// which also handles loading from a file
export const Queues = new UniqueQueueArray("", 3);