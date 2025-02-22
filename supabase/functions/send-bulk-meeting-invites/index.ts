
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Attendee {
  email: string;
  required: boolean;
}

interface BulkInviteRequest {
  attendees: Attendee[];
  meetingTitle: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  organizerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { attendees, meetingTitle, startTime, endTime, description, location, organizerName }: BulkInviteRequest = await req.json();

    const emailPromises = attendees.map(({ email }) => 
      resend.emails.send({
        from: "Lovable Calendar <onboarding@resend.dev>",
        to: [email],
        subject: `Meeting Invitation: ${meetingTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">${meetingTitle}</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(startTime).toLocaleDateString()}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}</p>
              <p style="margin: 10px 0;"><strong>Duration:</strong> ${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)} minutes</p>
              ${location ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${location}</p>` : ''}
            </div>

            ${description ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #1a1a1a;">Description</h3>
              <p style="color: #4a4a4a;">${description}</p>
            </div>
            ` : ''}

            <p style="color: #666; margin-top: 30px;">
              Best regards,<br>
              ${organizerName}
            </p>
          </div>
        `,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Sent ${successful} emails successfully, ${failed} failed`);

    return new Response(
      JSON.stringify({ successful, failed }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending bulk invites:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
