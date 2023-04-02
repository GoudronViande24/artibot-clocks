import moment from "moment";
import "moment-timezone";
import { Client, GatewayIntentBits } from "discord.js";
import Localizer from "artibot-localizer";
import Artibot, { Global, Module, log } from "artibot";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

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
	packageName: "artibot-clocks",
	parts: [
		new Global({
			id: "clocks",
			mainFunction
		})
	]
});

interface Clock {
	botName: string;
	timezone: string;
	token: string;
}

interface ClocksConfig {
	format: string;
	updateinterval: number;
	clocks: Clock[];
}

const localizer: Localizer = new Localizer({
	filePath: path.join(__dirname, "../locales.json")
});

async function mainFunction(artibot: Artibot): Promise<void> {
	localizer.setLocale(artibot.config.lang);
	const config: ClocksConfig = artibot.config.clocks;

	log("Clocks", localizer._("Loading..."));

	for (let i = 0, len = config.clocks.length; i < len; i++) {
		startClock(config.clocks[i], config, i);
	}
}

function updateActivity(client: Client<true>, config: ClocksConfig, clock: Clock): void {
	const timeNowUpdate = moment().tz(clock.timezone).format(config.format);
	client.user.setActivity(`🕒 ${timeNowUpdate}`);
}

function startClock(clock: Clock, config: ClocksConfig, i: number): void {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds]
	});

	client.once("ready", async (client): Promise<void> => {
		if (client.user.username !== clock.botName) {
			client.user.setUsername(clock.botName);
			log("Clocks", localizer.__("Clock #[[0]]: Name changed for [[1]]", { placeholders: [i.toString(), clock.botName] }));
		}

		// set the interval
		setInterval(() => updateActivity(client, config, clock), config.updateinterval);
		updateActivity(client, config, clock);

		// tell when it's ready
		log("Clocks", localizer.__("Clock #[[0]]: Connected as [[1]] ([[2]]) on [[3]]", {
			placeholders: [
				i.toString(),
				client.user.tag,
				client.user.id,
				moment().format("MMMM DD YYYY, HH:mm:ss")
			]
		}));
	});

	client.login(clock.token);
}