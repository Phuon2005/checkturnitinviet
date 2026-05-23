import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { z } from "zod";

export default eventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      email: z.email(),
      password: z.string().min(6),
      role: z.enum(["admin", "employee", "customer"]),
    }).parse,
  );

  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: You must be logged in to create a user.",
    });
  }

  const supabaseAdmin = serverSupabaseServiceRole(event);

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.sub)
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  if (profile?.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Only administrators can create new users.",
    });
  }

  const { data, error: error2 } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });

  if (error2) {
    throw createError({
      statusCode: 500,
      statusMessage: error2.message,
    });
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      role: body.role,
    })
    .eq("id", data.user.id);

  if (profileError) {
    throw profileError;
  }

  return {
    success: true,
  };
});
