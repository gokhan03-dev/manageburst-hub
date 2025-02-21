
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskTitle, dueDate, userEmail }: ReminderEmailData = await req.json();

    console.log(`Sending reminder email for task: ${taskTitle} to ${userEmail}`);

    const { data, error } = await resend.emails.send({
      from: "Task Reminder <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Reminder: ${taskTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Task Reminder</h1>
          <p>This is a reminder for your task:</p>
          <h2>${taskTitle}</h2>
          <p>Due date: ${new Date(dueDate).toLocaleString()}</p>
          <p>Please make sure to complete this task before the due date.</p>
          <br/>
          <p>Best regards,<br/>Your Task Manager</p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
