
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailData {
  taskTitle: string;
  dueDate: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskTitle, dueDate, userEmail }: ReminderEmailData = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Task Reminder <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Reminder: ${taskTitle}`,
      html: `
        <h1>Task Reminder</h1>
        <p>This is a reminder for your task: ${taskTitle}</p>
        <p>Due date: ${new Date(dueDate).toLocaleDateString()}</p>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
