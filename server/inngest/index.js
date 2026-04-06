import { Inngest } from "inngest";
import User from "../models/User.js";
import { sendEmail } from "../configs/nodemailer.js";
// import { connection } from "mongoose";
import Connection from "../models/Connections.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

/* ===========================
   CREATE USER
=========================== */
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        triggers: [{ event: "clerk/user.created" }],
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        let username = email_addresses[0].email_address.split("@")[0];

        const existingUser = await User.findOne({ username });

        // If username already exists → make it unique
        if (existingUser) {
            username = username + Math.floor(Math.random() * 10000);
        }

        const userData = {
            _id: id,
            username, 
            email: email_addresses[0].email_address,
            full_name: `${first_name} ${last_name}`,
            profile_picture: image_url,
        };

        await User.create(userData);
    }
);

/* ===========================
   UPDATE USER
=========================== */
const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        triggers: [{ event: "clerk/user.updated" }],
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: `${first_name} ${last_name}`,
            profile_picture: image_url,
        };

        await User.findByIdAndUpdate(id, updatedUserData);
    }
);

/* ===========================
   DELETE USER
=========================== */
const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-from-clerk",
        triggers: [{ event: "clerk/user.deleted" }],
    },
    async ({ event }) => {
        const { id } = event.data; 

        await User.findByIdAndDelete(id);
    }
);

/* ===========================
   SEND CONNECTION REQUEST EMAIL
=========================== */
const sendConnectionRequestEmail = inngest.createFunction(
    {
        id: "send-connection-request-email",
        triggers: [{ event: "app/connection-request" }],
    },
    async ({ event, step }) => {
        const {connectionId} = event.data;
        await step.run("find-connection", async () => {
            const connection = await Connection.findById(connectionId).populate("from_userId to_userId");
            return connection;
        });

        const subject = "New Connection Request";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Connection Request</h2>
                <p>Hi there!</p>
                <p><strong>${connection.to_userId.full_name}</strong> has sent you a connection request on Socialy.</p>
                <p>You have a new connection request from ${connection.from_userId.full_name}.</p>
                <div style="margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/connections" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        View Connections
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If you don't want to receive these emails, you can update your notification preferences 
                    in your account settings.
                </p>
            </div>
        `;
        
        await sendEmail({
            to: connection.to_userId.email,
            subject,
            html
        });

        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await step.sleepUntil("wait-for-24-hours", in24Hours);
        await step.run("send-connection-request-reminder", async () => {
            const connection = await Connection.findById(connectionId).populate("from_userId to_userId");
            if(connection.status === "accepted") {
                return {message: "Connection already accepted"};
            }
            const subject = "Connection Request Reminder";
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Connection Request Reminder</h2>
                    <p>Hi there!</p>
                    <p><strong>${connection.to_userId.full_name}</strong> has sent you a connection request on Socialy.</p>
                    <p>You have a new connection request from ${connection.from_userId.full_name}.</p>
                    <div style="margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/connections" 
                        style="background-color: #007bff; color: white; padding: 12px 24px; 
                                text-decoration: none; border-radius: 4px; display: inline-block;">
                            View Connections
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        If you don't want to receive these emails, you can update your notification preferences 
                        in your account settings.
                    </p>
                </div>
            `;
            
            await sendEmail({
                to: connection.to_userId.email,
                subject,
                html
            });
            return { message: "Connection request reminder sent" };
        });
    
        
        
    });
   



/* ===========================
   EXPORT FUNCTIONS
=========================== */
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendConnectionRequestEmail,
    
];