const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const auth = require("./auth.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// data
const ticketStates = {};
const rsvpData = {};
const eventStore = {};

// helper stuff
function cleanName(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .substring(0, 80);
}

function getCategory(guild, name) {
    return guild.channels.cache.find(
        c => c.name.toLowerCase() === name.toLowerCase() &&
        c.type === ChannelType.GuildCategory
    );
}

function getChannel(guild, name) {
    return guild.channels.cache.find(
        c => c.name === name &&
        c.type === ChannelType.GuildText
    );
}

function getCloseRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger)
    );
}

function yesNoRow(type) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${type}_yes`)
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`${type}_no`)
            .setLabel("No")
            .setStyle(ButtonStyle.Danger)
    );
}

function hasTicket(guild, user, type) {
    return guild.channels.cache.find(c =>
        c.parent &&
        c.parent.name &&
        c.parent.name.toLowerCase() === "tickets" &&
        c.name.startsWith(`${type}-`) &&
        c.name.includes(user.username)
    );
}

function buildEventEmbed(state, preview = false, ended = false) {
    const embed = new EmbedBuilder()
        .setTitle(`${preview ? "Preview: " : ""}${state.title}${ended ? " (ENDED)" : ""}`)
        .setColor(ended ? 0x808080 : preview ? 0xaaaaaa : 0x00AEFF)
        .setDescription(state.details || "No details provided.")
        .addFields(
            { name: "Date", value: state.date || "N/A", inline: true },
            { name: "Time", value: `${state.start || "N/A"} - ${state.end || "N/A"}`, inline: true },
            { name: "Location", value: state.location || "N/A", inline: true }
        );

    if (state.online) {
        embed.addFields({
            name: "Online",
            value: state.online,
            inline: false
        });
    }

    if (state.flyer) {
        embed.setImage(state.flyer);
    }

    return embed;
}

function buildRsvpRow(eventId) {
    const count = rsvpData[eventId]?.length || 0;

    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`going_${eventId}`)
            .setLabel(`👍 Going (${count})`)
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`cancel_${eventId}`)
            .setLabel("❌ Nevermind")
            .setStyle(ButtonStyle.Danger)
    );
}

function buildClosedRsvpRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("closed_going")
            .setLabel("RSVP Closed")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

        new ButtonBuilder()
            .setCustomId("closed_cancel")
            .setLabel("Closed")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );
}

// transcript stuff
async function sendTranscript(channel, user) {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    let text = "";

    for (const msg of sorted) {
        text += `${msg.author.tag}: ${msg.content}\n`;
    }

    if (!text.trim()) {
        text = "No messages.";
    }

    await user.send({
        content: "Ticket transcript:",
        files: [
            {
                attachment: Buffer.from(text, "utf-8"),
                name: "transcript.txt"
            }
        ]
    }).catch(() => {});
}

// menu cleanup
async function cleanMenu(channel) {
    const messages = await channel.messages.fetch({ limit: 50 });

    for (const msg of messages.values()) {
        if (msg.author.id !== client.user.id) continue;
        if (!msg.components.length) continue;

        await msg.delete().catch(() => {});
    }
}

// ticket cleanup
async function cleanTicket(guild, channel) {
    const state = ticketStates[channel.id];
    if (!state) return;

    const member = await guild.members.fetch(state.userId).catch(() => null);

    if (state.roleId) {
        const role = guild.roles.cache.get(state.roleId);

        if (role) {
            if (member) {
                await member.roles.remove(role).catch(() => {});
            }

            await role.delete().catch(() => {});
        }
    }

    if (member) {
        await sendTranscript(channel, member.user);
    }

    delete ticketStates[channel.id];

    if (!channel.name.startsWith("closed-")) {
        await channel.setName(`closed-${channel.name}`).catch(() => {});
    }
}

// make ticket
async function makeTicket(guild, member, devRole, type) {
    const ticketRole = await guild.roles.create({
        name: `ticket-${type}-${member.user.username}`,
        reason: "temporary ticket role"
    });

    await member.roles.add(ticketRole);

    const ticketsCategory = getCategory(guild, "tickets");

    const overwrites = [
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: ticketRole.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        }
    ];

    if (devRole) {
        overwrites.push({
            id: devRole.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        });
    }

    const channel = await guild.channels.create({
        name: `${type}-${member.user.username}`,
        type: ChannelType.GuildText,
        parent: ticketsCategory?.id,
        permissionOverwrites: overwrites
    });

    return {
        channel,
        ticketRole
    };
}

// ready stuff
client.once("clientReady", async () => {
    console.log("Bot Ready");

    const guild = client.guilds.cache.first();
    if (!guild) return;

    const verifyChannel = getChannel(guild, "verification");
    const eventChannel = getChannel(guild, "create-an-event");

    if (verifyChannel) {
        await cleanMenu(verifyChannel);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("start_verify")
                .setLabel("Verify")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("apply_manager")
                .setLabel("Apply for Event Manager")
                .setStyle(ButtonStyle.Primary)
        );

        const msg = await verifyChannel.send({
            content: "Verification / Applications",
            components: [row]
        });

        await msg.pin().catch(() => {});
    }

    if (eventChannel) {
        await cleanMenu(eventChannel);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("create_event")
                .setLabel("Create Event")
                .setStyle(ButtonStyle.Success)
        );

        const msg = await eventChannel.send({
            content: "Event Manager Panel",
            components: [row]
        });

        await msg.pin().catch(() => {});
    }
});

// button stuff
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const member = await guild.members.fetch(interaction.user.id);

    const devRole = guild.roles.cache.find(r => r.name === "Dev");
    const verifiedRole = guild.roles.cache.find(r => r.name === "Authenticated");
    const managerRole = guild.roles.cache.find(r => r.name === "Event Manager");

    // rsvp stuff
    if (interaction.customId.startsWith("going_") || interaction.customId.startsWith("cancel_")) {
        const [action, eventId] = interaction.customId.split("_");
        const event = eventStore[eventId];

        if (!event) {
            return interaction.reply({ content: "event not found", ephemeral: true });
        }

        if (!verifiedRole || !member.roles.cache.has(verifiedRole.id)) {
            return interaction.reply({ content: "verify first", ephemeral: true });
        }

        if (event.ended) {
            return interaction.reply({ content: "event ended", ephemeral: true });
        }

        if (!rsvpData[eventId]) {
            rsvpData[eventId] = [];
        }

        if (action === "going") {
            if (!rsvpData[eventId].includes(member.id)) {
                rsvpData[eventId].push(member.id);
            }
        }

        if (action === "cancel") {
            rsvpData[eventId] = rsvpData[eventId].filter(id => id !== member.id);
        }

        return interaction.update({
            components: [buildRsvpRow(eventId)]
        });
    }

    await interaction.deferReply({ ephemeral: true });

    // close ticket
    if (interaction.customId === "close_ticket") {
        await cleanTicket(guild, interaction.channel);

        await interaction.editReply("closed");
        return;
    }

    // admin yes no
    if (interaction.customId === "verify_admin_yes") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.step = "admin_code";
        return interaction.editReply("enter admin code");
    }

    if (interaction.customId === "verify_admin_no") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.step = "first";
        return interaction.editReply("enter FIRST name");
    }

    if (interaction.customId === "apply_admin_yes") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.step = "admin_code";
        return interaction.editReply("enter admin code");
    }

    if (interaction.customId === "apply_admin_no") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        if (!verifiedRole || !member.roles.cache.has(verifiedRole.id)) {
            return interaction.editReply("verify first");
        }

        state.step = "relation";
        return interaction.editReply("what is your relation to BSU?");
    }

    if (interaction.customId === "event_online_yes") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.step = "online_link";
        return interaction.editReply("enter invite link");
    }

    if (interaction.customId === "event_online_no") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.online = null;
        state.step = "details";
        return interaction.editReply("enter DETAILS");
    }

    if (interaction.customId === "event_flyer_yes") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.step = "flyer_upload";
        return interaction.editReply("upload the flyer image");
    }

    if (interaction.customId === "event_flyer_no") {
        const state = ticketStates[interaction.channel.id];
        if (!state || state.userId !== interaction.user.id) return interaction.editReply("not your ticket");

        state.flyer = null;
        state.step = "preview";

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`post_event_${interaction.channel.id}`)
                .setLabel("Post")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`restart_event_${interaction.channel.id}`)
                .setLabel("Restart")
                .setStyle(ButtonStyle.Danger)
        );

        state.step = "confirm";

        await interaction.channel.send({
            embeds: [buildEventEmbed(state, true, false)],
            components: [row]
        });

        return interaction.editReply("preview ready");
    }

    // verify start
    if (interaction.customId === "start_verify") {
        if (hasTicket(guild, interaction.user, "verify")) {
            return interaction.editReply("you already have a verify ticket");
        }

        const ticket = await makeTicket(guild, member, devRole, "verify");

        ticketStates[ticket.channel.id] = {
            type: "verify",
            step: "admin_check",
            userId: interaction.user.id,
            roleId: ticket.ticketRole.id
        };

        await ticket.channel.send({
            content: "Do you have an admin pass?",
            components: [yesNoRow("verify_admin"), getCloseRow()]
        });

        return interaction.editReply(`check ${ticket.channel}`);
    }

    // apply manager
    if (interaction.customId === "apply_manager") {
        if (hasTicket(guild, interaction.user, "apply")) {
            return interaction.editReply("you already have an apply ticket");
        }

        const ticket = await makeTicket(guild, member, devRole, "apply");

        ticketStates[ticket.channel.id] = {
            type: "apply",
            step: "admin_check",
            userId: interaction.user.id,
            roleId: ticket.ticketRole.id
        };

        await ticket.channel.send({
            content: "Do you have an admin pass?",
            components: [yesNoRow("apply_admin"), getCloseRow()]
        });

        return interaction.editReply(`check ${ticket.channel}`);
    }

    // create event
    if (interaction.customId === "create_event") {
        if (!managerRole || !member.roles.cache.has(managerRole.id)) {
            return interaction.editReply("need event manager role");
        }

        if (hasTicket(guild, interaction.user, "event")) {
            return interaction.editReply("you already have an event ticket");
        }

        const ticket = await makeTicket(guild, member, devRole, "event");

        ticketStates[ticket.channel.id] = {
            type: "event",
            step: "title",
            userId: interaction.user.id,
            roleId: ticket.ticketRole.id
        };

        await ticket.channel.send({
            content: "Enter EVENT TITLE",
            components: [getCloseRow()]
        });

        return interaction.editReply(`check ${ticket.channel}`);
    }

    // approve manager
    if (interaction.customId.startsWith("approve_manager_")) {
        const channelId = interaction.customId.split("_")[2];
        const state = ticketStates[channelId];

        if (!state) return interaction.editReply("application not found");

        const target = await guild.members.fetch(state.userId).catch(() => null);
        if (!target) return interaction.editReply("user not found");

        if (managerRole) {
            await target.roles.add(managerRole).catch(() => {});
        }

        await target.user.send("Your Event Manager application was approved.").catch(() => {});

        await cleanTicket(guild, interaction.channel);

        return interaction.editReply("approved");
    }

    // deny manager
    if (interaction.customId.startsWith("deny_manager_")) {
        const channelId = interaction.customId.split("_")[2];
        const state = ticketStates[channelId];

        if (state) {
            const target = await guild.members.fetch(state.userId).catch(() => null);

            if (target) {
                await target.user.send("Your Event Manager application was denied.").catch(() => {});
            }
        }

        await cleanTicket(guild, interaction.channel);

        return interaction.editReply("denied");
    }

    // post event
    if (interaction.customId.startsWith("post_event_")) {
        const channelId = interaction.customId.split("_")[2];
        const state = ticketStates[channelId];

        if (!state) return interaction.editReply("event data not found");

        const announcements = getChannel(guild, "announcements");
        if (!announcements) return interaction.editReply("announcements channel not found");

        const eventId = Date.now().toString();
        rsvpData[eventId] = [];

        const embed = buildEventEmbed(state, false, false);

        const sent = await announcements.send({
            content: verifiedRole ? `<@&${verifiedRole.id}>` : "",
            embeds: [embed],
            components: [buildRsvpRow(eventId)]
        });

        const eventsCategory = getCategory(guild, "Events") || getCategory(guild, "events");

        const qna = await guild.channels.create({
            name: `${cleanName(state.title)}-qna`,
            type: ChannelType.GuildText,
            parent: eventsCategory?.id
        });

        const qnaMsg = await qna.send({
            embeds: [embed]
        });

        await qnaMsg.pin().catch(() => {});

        eventStore[eventId] = {
            title: state.title,
            messageId: sent.id,
            channelId: announcements.id,
            qnaId: qna.id,
            startTime: new Date(`${state.date} ${state.start}`),
            endTime: new Date(`${state.date} ${state.end}`),
            reminded: false,
            started: false,
            ended: false
        };

        await cleanTicket(guild, interaction.channel);

        return interaction.editReply("event posted");
    }

    // restart event
    if (interaction.customId.startsWith("restart_event_")) {
        const channelId = interaction.customId.split("_")[2];
        const state = ticketStates[channelId];

        if (!state) return interaction.editReply("event data not found");

        state.step = "title";
        delete state.title;
        delete state.date;
        delete state.start;
        delete state.end;
        delete state.location;
        delete state.online;
        delete state.details;
        delete state.flyer;

        await interaction.channel.send("Enter EVENT TITLE");
        return interaction.editReply("restarting");
    }
});

// message stuff
client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    const state = ticketStates[msg.channel.id];
    if (!state) return;
    if (msg.author.id !== state.userId) return;

    // verify flow
    if (state.type === "verify") {
        if (state.step === "admin_code") {
            if (msg.content === "1234") {
                const verifiedRole = msg.guild.roles.cache.find(r => r.name === "Authenticated");
                const member = await msg.guild.members.fetch(msg.author.id);

                if (verifiedRole) await member.roles.add(verifiedRole).catch(() => {});

                await msg.reply("admin verified");
                await msg.author.send("You have been successfully verified.").catch(() => {});

                return cleanTicket(msg.guild, msg.channel);
            }

            return msg.reply("wrong code");
        }

        if (state.step === "first") {
            state.first = msg.content;
            state.step = "last";
            return msg.reply("enter LAST name");
        }

        if (state.step === "last") {
            state.last = msg.content.toLowerCase();
            state.step = "username";
            return msg.reply("enter SCHOOL username");
        }

        if (state.step === "username") {
            const username = msg.content.toLowerCase();

            if (!username.includes(state.last)) {
                state.step = "first";
                delete state.first;
                delete state.last;
                return msg.reply("account not found, restarting\nEnter FIRST name");
            }

            state.username = msg.content;
            state.step = "email";
            return msg.reply("enter EMAIL");
        }

        if (state.step === "email") {
            state.email = msg.content;

            const verifiedRole = msg.guild.roles.cache.find(r => r.name === "Authenticated");
            const member = await msg.guild.members.fetch(msg.author.id);

            if (verifiedRole) await member.roles.add(verifiedRole).catch(() => {});

            await msg.reply("verified");
            await msg.author.send("You have been successfully verified.").catch(() => {});

            return cleanTicket(msg.guild, msg.channel);
        }
    }

    // apply flow
    if (state.type === "apply") {
        if (state.step === "admin_code") {
            if (msg.content === "1234") {
                const managerRole = msg.guild.roles.cache.find(r => r.name === "Event Manager");
                const member = await msg.guild.members.fetch(msg.author.id);

                if (managerRole) await member.roles.add(managerRole).catch(() => {});

                await msg.reply("admin approved");
                await msg.author.send("Your Event Manager access was approved.").catch(() => {});

                return cleanTicket(msg.guild, msg.channel);
            }

            return msg.reply("wrong code");
        }

        if (state.step === "relation") {
            state.relation = msg.content;
            state.step = "email";
            return msg.reply("enter email");
        }

        if (state.step === "email") {
            state.email = msg.content;
            state.step = "details";
            return msg.reply("enter event idea/details");
        }

        if (state.step === "details") {
            state.details = msg.content;
            state.step = "review";

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_manager_${msg.channel.id}`)
                    .setLabel("Approve")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`deny_manager_${msg.channel.id}`)
                    .setLabel("Deny")
                    .setStyle(ButtonStyle.Danger)
            );

            return msg.channel.send({
                content:
                    `Application from <@${msg.author.id}>\n\n` +
                    `Relation: ${state.relation}\n` +
                    `Email: ${state.email}\n` +
                    `Details: ${state.details}`,
                components: [row]
            });
        }
    }

    // event flow
    if (state.type === "event") {
        if (state.step === "title") {
            state.title = msg.content;
            state.step = "date";
            return msg.reply("enter DATE (YYYY-MM-DD)");
        }

        if (state.step === "date") {
            state.date = msg.content;
            state.step = "start";
            return msg.reply("enter START time");
        }

        if (state.step === "start") {
            state.start = msg.content;
            state.step = "end";
            return msg.reply("enter END time");
        }

        if (state.step === "end") {
            state.end = msg.content;
            state.step = "location";
            return msg.reply("enter LOCATION");
        }

        if (state.step === "location") {
            state.location = msg.content;
            state.step = "online";
            return msg.channel.send({
                content: "online option?",
                components: [yesNoRow("event_online")]
            });
        }

        if (state.step === "online_link") {
            const link = msg.content.trim();

            if (!link.startsWith("http")) {
                return msg.reply("enter a valid link starting with http or https");
            }

            state.online = link;
            state.step = "details";
            return msg.reply("enter DETAILS");
        }

        if (state.step === "details") {
            state.details = msg.content;
            state.step = "flyer";
            return msg.channel.send({
                content: "do you have a poster/flyer?",
                components: [yesNoRow("event_flyer")]
            });
        }

        if (state.step === "flyer_upload") {
            if (!msg.attachments.size) {
                return msg.reply("please upload an image");
            }

            const file = msg.attachments.first();
            state.flyer = file.url;
            state.step = "preview";

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`post_event_${msg.channel.id}`)
                    .setLabel("Post")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`restart_event_${msg.channel.id}`)
                    .setLabel("Restart")
                    .setStyle(ButtonStyle.Danger)
            );

            state.step = "confirm";

            return msg.channel.send({
                embeds: [buildEventEmbed(state, true, false)],
                components: [row]
            });
        }
    }
});

// timer stuff
setInterval(async () => {
    const now = new Date();

    for (const eventId in eventStore) {
        const event = eventStore[eventId];

        // reminder
        if (!event.reminded && now >= new Date(event.startTime.getTime() - 15 * 60000)) {
            const users = rsvpData[eventId] || [];

            for (const userId of users) {
                const user = await client.users.fetch(userId).catch(() => null);

                if (user) {
                    await user.send(`Reminder: ${event.title} starts soon`).catch(() => {});
                }
            }

            event.reminded = true;
        }

        // start notif
        if (!event.started && now >= event.startTime) {
            const users = rsvpData[eventId] || [];

            for (const userId of users) {
                const user = await client.users.fetch(userId).catch(() => null);

                if (user) {
                    await user.send(`${event.title} is starting now`).catch(() => {});
                }
            }

            event.started = true;
        }

        // end event
        if (!event.ended && now >= event.endTime) {
            const channel = await client.channels.fetch(event.channelId).catch(() => null);
            if (!channel) continue;

            const message = await channel.messages.fetch(event.messageId).catch(() => null);
            if (!message) continue;

            const oldEmbed = message.embeds[0];

            const updatedEmbed = EmbedBuilder.from(oldEmbed)
                .setTitle(`${oldEmbed.title} (ENDED)`)
                .setColor(0x808080);

            await message.edit({
                embeds: [updatedEmbed],
                components: [buildClosedRsvpRow()]
            }).catch(() => {});

            const qna = await client.channels.fetch(event.qnaId).catch(() => null);

            if (qna && !qna.name.startsWith("archived-")) {
                await qna.setName(`archived-${qna.name}`).catch(() => {});
            }

            event.ended = true;
        }
    }
}, 60000);

client.login(auth.token);