import moment from "moment";
import "moment-timezone";
import { Client, Intents } from "discord.js";
import Localizer from "artibot-localizer";
import Artibot, { Global, Module } from "artibot";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

/**
 * Clocks module - Show time from many timezones in your Discord server
 * @author GoudronViande24
 * @license MIT
 */
export default new Module({
	id: "clocks",
	name: "Clocks",
	version,
	langs: [
		"en",
		"fr"
	],
	repo: "GoudronViande24/artibot-clocks",
	parts: [
		new Global({
			id: "clocks",
			mainFunction
		})
	]
});

const localizer = new Localizer({
	filePath: path.join(__dirname, "locales.json")
});

/** @param {Artibot} artibot */
function mainFunction({ log, config }) {
	localizer.setLocale(config.lang);
	config = config.clocks;

	if (!config.tokens) {
		log("Clocks", localizer._("Configuration error: The private.json file is invalid."));
		process.exit(1);
	}

	if (config.tokens.length != config.clocks.length) {
		log("Clocks", localizer._("Configuration error: The amount of tokens is not equal to the amount of clocks."));
		process.exit(1);
	}

	log("Clocks", localizer._("Loading..."));

	for (var i = 0, len = config.clocks.length; i < len; i++) {
		startClock(config.clocks[i], config, i, log);
	}
}

function updateActivity(client, config, clock) {
	const timeNowUpdate = moment().tz(clock.timezone).format(config.format);
	client.user.setActivity(`🕒 ${timeNowUpdate}`);
}

function startClock(clock, config, i, log) {
	// Since discord.js v13, intents are mandatory
	const client = new Client({
		intents: [Intents.FLAGS.GUILDS]
	});

	client.once("ready", client => {
		if (client.user.username !== clock.botName) {
			client.user.setUsername(clock.botName);
			log("Clocks", localizer.__("Clock #[[0]]: Name changed for [[1]]", { placeholders: [i, clock.botName] }));
		}

		// set the interval
		setInterval(() => updateActivity(client, config, clock), config.updateinterval);
		updateActivity(client, config, clock);

		// tell when it's ready
		log("Clocks", localizer.__("Clock #[[0]]: Connected as [[1]] ([[2]]) on [[3]]", {
			placeholders: [
				i,
				client.user.tag,
				client.user.id,
				moment().format("MMMM DD YYYY, HH:mm:ss")
			]
		}));
	});

	client.login(config.tokens[i]);
}