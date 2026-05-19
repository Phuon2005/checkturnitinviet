import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

export default eventHandler(async (event) => {
    // TODO CREATE function to refactor these admin checks
    const user = await serverSupabaseUser(event)

    if (!user) return null

    const supabase =
        await serverSupabaseClient(event)

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.sub).single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    if (profile?.role !== 'admin') return null

    const query = await getValidatedQuery(
        event,
        z.object({
            start: z.string(),
            end: z.string()
        }).parse
    )

    const { data, error: erro2 } = await supabase
        .from('payments')
        .select(`paid_at, amount, profiles!payments_user_id_fkey(name)`)
        .gte('created_at', query.start)
        .lte('created_at', query.end)
        .order('created_at', {
            ascending: false
        })
        .limit(10)

    if (erro2) {
        throw createError({
            statusCode: 500,
            statusMessage: erro2.message
        })
    }
    return data
})