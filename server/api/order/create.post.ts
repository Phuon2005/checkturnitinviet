import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const panel1Schema = z.object({
  activePanel: z.literal('panel1'),
  panel1: z.object({
    ignoreBibliography: z.boolean(),
    ignoreQuoted: z.boolean(),
    ignoreSourcesLessThan: z.boolean(),
    ignoreSourcesLessThanType: z.enum(['words', 'percentage']),
    ignoreSourcesLessThanValue: z.number().min(0),
  }),
});

const panel2Schema = z.object({
  activePanel: z.literal('panel2'),
  panel2: z.object({
    ignoreBibliography: z.boolean(),
    ignoreQuoted: z.boolean(),
    ignoreInTextCitations: z.boolean(),
    ignoreMinorMatches: z.boolean(),
    ignoreMinorMatchesValue: z.number().min(0),
  }),
});

const optionsSchema = z.discriminatedUnion('activePanel', [
  panel1Schema,
  panel2Schema
]).optional();

const schema = z.object({
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  checkType: z.enum(['ai', 'similarity', 'combo']),
  options: optionsSchema,
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, body => schema.safeParse(body))
  if (!body.success) {
    throw createError({ 
      statusCode: 400, 
      message: 'Dữ liệu không hợp lệ', 
      data: body.error.errors 
    })
  }

  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase.rpc('create_order_securely', {
    p_file_name: body.data.fileName,
    p_file_path: body.data.filePath,
    p_file_size: body.data.fileSize,
    p_mime_type: body.data.mimeType,
    p_check_type: body.data.checkType,
    p_options: body.data.options || {}
  })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
