import { supabaseCli } from "../supabase";

const QUEUE_STATUSES = {
    "SUCCESS": 0,
    "ERROR": 1,
    "EMPTY_QUEUE": 2
}

export async function callFirstQueueNum() : Promise<any> {
    // TODO: ADD EMAIL AND SMS SERVICE
    const {data: calledUser, error: calledUserErr} = await supabaseCli
        .from("queue")
        .select("*")
        .order("created_at", {ascending: true})
        .limit(1)
        .maybeSingle();
    
    if (calledUserErr) {
        console.error(calledUserErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    if (!calledUser || calledUser.length === 0) {
        console.error("No users in queue to remove");
        return QUEUE_STATUSES.EMPTY_QUEUE;
    }

    const {data: upsertData, error: upsertErr} = await supabaseCli
        .from("queue_served")
        .upsert(calledUser);
    
    if (upsertErr) {
        console.error(upsertErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    const {data: delData, error: delErr} = await supabaseCli.from("queue")
        .delete()
        .eq("auth_token", calledUser.auth_token);

    if (delErr) {
        console.error(delErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    return { status: QUEUE_STATUSES.SUCCESS, data: calledUser };
}

export async function callQueueNum(queueNum: number) {
    // TODO: ADD EMAIL AND SMS SERVICE
    const {data: calledUser, error: calledUserErr} = await supabaseCli
        .from("queue")
        .select("*")
        .eq("queue_id", queueNum)
        .order("created_at", {ascending: true})
        .limit(1)
        .maybeSingle();
    
    if (calledUserErr) {
        console.error(calledUserErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    if (!calledUser || calledUser.length === 0) {
        console.error("No users in queue to remove");
        return QUEUE_STATUSES.EMPTY_QUEUE;
    }

    const {data: upsertData, error: upsertErr} = await supabaseCli
        .from("queue_served")
        .upsert(calledUser);
    
    if (upsertErr) {
        console.error(upsertErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    const {data: delData, error: delErr} = await supabaseCli.from("queue")
        .delete()
        .eq("auth_token", calledUser.auth_token);

    if (delErr) {
        console.error(delErr.message);
        return QUEUE_STATUSES.ERROR;
    }

    return { status: QUEUE_STATUSES.SUCCESS, data: calledUser };
}