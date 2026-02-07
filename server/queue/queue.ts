import { privilegedSupabaseCli as supabaseCli } from "../supabase";
import { isNumeric, emailAddrCheck } from "../utils";
import { randomUUID } from "node:crypto";

export async function joinQueue(phoneNum: string | null, emailAddr: string | null) : Promise<string | boolean> {
    // Check valid details

    if (phoneNum != null)
        if (phoneNum.length != 8 || !isNumeric(phoneNum))
            return false;
        
    if (emailAddr != null)
        if (!emailAddrCheck.test(emailAddr))
            return false;

    const authToken: string = randomUUID().toString();
    
    const { data, error } = await supabaseCli.from("queue")
        .insert({
            phone_number: phoneNum,
            email_address: emailAddr,
            auth_token: authToken
        });
    
    if (error) {
        console.error('Insert error:', error.message);
        return false;
    }
    
    console.log('Data inserted successfully:', data);
    return authToken;
}

export async function leaveQueue(authToken: string) : Promise<Boolean> {
    let { data, error } = await supabaseCli
        .from("queue")
        .select("*")
        .eq("auth_token", authToken);

    if (error) {
        console.error('Fetch error:', error.message);
        return false;
    }

    if (!(data && data.length > 0)) {
        console.log("Auth_token Invalid!")
        return false;
    }

    const { data: upsert_data, error: upsert_err } = await supabaseCli.from("queue_served")
        .upsert(data);
    
    if (upsert_err) {
        console.log("Failed to upsert\nError: " + upsert_err);
        return false;
    }

    const { data: del_data, error: del_err } = await supabaseCli.from("queue")
        .delete()
        .eq('auth_token', authToken);

    if (del_err) {
        console.error(del_err.message);
        
        console.log("Attempt to delete from queue served DB");
        const { data: del_data_2, error: del_err_2 } = await supabaseCli.from("queue_served")
            .delete()
            .eq('auth_token', authToken);

        if (del_err_2) {
            console.log("Catastropic Error. sudo help");
            return false;
        }

        return true;
    }

    return true;
}

let QUEUE_STATUSES = {
    "SERVED": 0,
    "IN_QUEUE": 1,
    "NOT_IN_QUEUE": 2,
    "ERROR": 3,
    "EMPTY_QUEUE": 4,
}

export async function getQueue(authToken: string) : Promise<any> {
    // Get current user data
    const { data: userQueueData, error: userQueueErr } = await supabaseCli
        .from("queue")
        .select("*")
        .eq("auth_token", authToken)
        .order("created_at", {ascending: true})
        .limit(1)
        .maybeSingle();

    // Handle err
    if (userQueueErr) {
        console.error('Fetch error:', userQueueErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    // Check if currently not in queue
    if (!userQueueData) {
        // Get if user has been served
        const {data: servedQueueData, error: servedQueueErr } = await supabaseCli
            .from("queue_served")
            .select("*")
            .eq("auth_token", authToken);

        // Handle err
        if (servedQueueErr) {
            console.error('Fetch error:', servedQueueErr.message);
            return QUEUE_STATUSES.ERROR;
        }

        // If someone is not served and is not in queue
        if (!servedQueueData || servedQueueData.length === 0) { // Unlikely to happen unless someone is funny
            return QUEUE_STATUSES.NOT_IN_QUEUE;
        }

        // Handle user has already been served
        return QUEUE_STATUSES.SERVED;
        // TODO: Display served status and time
    }
    
    // Check if user has been served and is in queue at the same time
    const { data: peopleInQueueData, error: peopleInQueueErr } = await supabaseCli
      .rpc("get_queue_served", { auth: authToken });
      
    /*
        CREATE FUNCTION get_queue_served(auth TEXT)
        RETURNS TABLE(
            queue_id INT,
            auth_token TEXT,
            phone_number TEXT,
            email_address TEXT
        ) AS $$
            BEGIN
            RETURN QUERY
            SELECT qs.queue_id, qs.auth_token, q.phone_number, q.email_address
            FROM queue_served qs
            JOIN queue q
            ON q.queue_id = qs.queue_id
            WHERE qs.auth_token = auth;
        END;
        $$ LANGUAGE plpgsql;
    */

    if (peopleInQueueErr) {
        console.error('Fetch error:', peopleInQueueErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    if (peopleInQueueData && peopleInQueueData.length > 0) { // Catastrophic Error again
        console.error("Error as user is served and is being served!");
        console.log("Deleting it from queue");
        
        // Attempt clean up of duplicate data
        const { data: del_data, error: del_err } = await supabaseCli.from("queue")
            .delete()
            .eq("auth_token", authToken);
        
        if (del_err) {
            console.error(del_err.message);
            console.log("Uh oh poopy! sudo help");
            return QUEUE_STATUSES.ERROR
        }
        
        return QUEUE_STATUSES.ERROR
    }

    // Get current queue num
    const { data: queueData, error: queueErr } = await supabaseCli
            .from("queue")
            .select("queue_id")
            .order("queue_id", {ascending: true});

    if (queueErr) {
        console.error(queueErr.message);
        return QUEUE_STATUSES.ERROR
    } 

    // Unlikely to occur unless there is an error
    if (!queueData || queueData.length == 0) {
        console.log("Nothing in queue currently")
        return QUEUE_STATUSES.ERROR;
    }

    const firstQueueNum: any = queueData[0].queue_id;
    const currQueueNum: any = userQueueData.queue_id;
    let peopleAhead: any = -1;

    console.log("BTW THE TYPE IS " + typeof(firstQueueNum) + typeof(currQueueNum));
    if (typeof(firstQueueNum) === "string" && typeof(currQueueNum) === "string") {
        try {
            peopleAhead = parseInt(currQueueNum) - parseInt(firstQueueNum)
        } catch (err) {
            console.log(err)
            return QUEUE_STATUSES.ERROR;
        }
    } else {
        peopleAhead = currQueueNum - firstQueueNum
    }

    return { statusCode: QUEUE_STATUSES.IN_QUEUE, peopleAhead: peopleAhead }
}