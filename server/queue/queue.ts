import { isNumeric, emailAddrCheck } from "../utils";

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

type QueueDetails = {
    email: string | null,
    phone_number: string | null,
    auth_token: string,
    time_joined: string,
};

enum QueueStatus {
    SERVED,
    IN_QUEUE,
    NOT_IN_QUEUE,
    NOW_SERVING
}

export class Queue {
    queueList: QueueDetails[];
    servedQueueList: QueueDetails[];
    escapeRoomNumber: number;

    constructor(queueList: QueueDetails[], servedQueueList: QueueDetails[], escapeRoomNumber: number) {
        this.queueList = queueList;
        this.servedQueueList = servedQueueList;
        this.escapeRoomNumber = escapeRoomNumber;
    };
    
    async enqueue(phoneNum: string | null, emailAddr: string | null, auth_token: string) : Promise<string | boolean> {
        // Input Validation
        if (phoneNum != null)
            if (phoneNum.length != 8 || !isNumeric(phoneNum))
                return false;
        
        if (emailAddr != null)
            if (!emailAddrCheck.test(emailAddr))
                return false;

        const authToken: string = randomUUID().toString();

        for (let queueDetail of this.queueList)
            if (queueDetail.auth_token === auth_token)
                return false; 
        
        const newQueueEntry: QueueDetails = {
            email: emailAddr,
            phone_number: phoneNum,
            auth_token: authToken,
            time_joined: new Date().toDateString()
        }
        
        this.queueList.push(newQueueEntry)
        this.saveQueue();
        return authToken
    }

    async dequeue(authToken: string) : Promise<Boolean> {
        for (let i = 0; i < this.queueList.length; i++) {
            if (this.queueList[i].auth_token === authToken) {
                this.servedQueueList.push(this.queueList[i]);
                this.queueList.splice(i, 1);
                this.saveQueue();
                return true;
            }
        }
        return false;
    }

    async getQueueStatus(authToken: string) : Promise<any> {
        for (let i = 0; i < this.queueList.length; i++) {
            if (this.queueList[i].auth_token === authToken) {
                if (i == 0) return { queue_status: QueueStatus.NOW_SERVING};
                return { queue_status: QueueStatus.IN_QUEUE, people_ahead: i };
            }
        }

        // Check served people
        for (let i = 0; i < this.servedQueueList.length; i++)
            if (this.servedQueueList[i].auth_token === authToken)
                return QueueStatus.SERVED;

        return QueueStatus.NOT_IN_QUEUE;
    }
    
    saveQueue() : void {
        const queueListStr: string = JSON.stringify(this.queueList);
        const queueServedStr: string = JSON.stringify(this.servedQueueList);

        const filePathQueueList = path.join("../data", `E${this.escapeRoomNumber}-queue-list.json`);
        const filePathServedList = path.join("../data", `E${this.escapeRoomNumber}-queue-served-list.json`);
        
        fs.writeFile(filePathQueueList, queueListStr, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("Saved queue successully!")
            }
        });

        fs.writeFile(filePathServedList, queueServedStr, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Saved served queue successully!")
            }
        });
    };

    loadQueue() : void {
        const filePathQueueList = path.join("../data", `E${this.escapeRoomNumber}-queue-list.json`);
        const filePathServedList = path.join("../data", `E${this.escapeRoomNumber}-queue-served-list.json`);

        fs.readFile(filePathQueueList, { encoding: 'utf8' } ,  (err, data) => {
            if (err) {
                console.error(err.message);
            } else {
                this.queueList = JSON.parse(data);
            }
        });

        fs.readFile(filePathServedList, { encoding: 'utf8' } ,  (err, data) => {
            if (err) {
                console.error(err.message);
            } else {
                this.servedQueueList = JSON.parse(data);
            }
        });
    };
}