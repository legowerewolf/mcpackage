import minimist = require("minimist");
import nodezip = require("node-zip");
import { readFileSync, writeFileSync } from "fs";
import { safeLoad } from "js-yaml";
import { basename, dirname, resolve } from "path";
import { language_lang, manifest_json, skins_json } from "./generators";
import { CliArguments, ComputedConfig } from "./types";
import uuid = require("uuid");

export default function main() {
	let args: CliArguments = minimist(process.argv.slice(2)) as CliArguments;

	let configFile = args.config ? resolve(args.config) : resolve(process.cwd(), "pack.yaml");

	let config: ComputedConfig = safeLoad(readFileSync(configFile, "utf8")) as ComputedConfig;

	// Add data where necessary
	let metas = [config.meta];
	if (config.components.skins) metas.push(config.components.skins.meta);
	metas.forEach((meta, index) => {
		if (!meta.version) meta.version = "1.0.0";
		if (!meta.uuid) meta.uuid = uuid.v4();
		if (index > 0) {
			if (!meta.name) meta.name = config.meta.name;
		}
	});

	if (config.components.skins) {
		config.components.skins.files.forEach((skin) => {
			if (!skin.slimArms) skin.slimArms = false;
		});
	}

	// Compute some stuff
	config.computed = {} as any;
	config.computed.languages = Object.keys(config.meta.name);
	config.computed.defaultLang = config.computed.languages.indexOf("en_US") != -1 ? "en_US" : config.computed.languages[0];
	config.computed.exportName = `${config.meta.name[config.computed.defaultLang].replace(/[ ]/, "_")}-${config.meta.version}.mcpack`;

	// Begin generating the pack file
	console.log(`Generating ${config.computed.exportName}...`);
	let pack = new nodezip();

	// Build and insert the manifest
	pack.file("manifest.json", manifest_json(config));

	// Build and insert language files
	pack.file("texts/languages.json", JSON.stringify(config.computed.languages));
	config.computed.languages.forEach((lang) => {
		pack.file(`texts/${lang}.lang`, language_lang(config, lang));
	});

	// Build and insert skin files, if necessary
	if (config.components.skins) {
		pack.file("skins.json", skins_json(config));
		config.components.skins.files.forEach((skin) => {
			pack.file(basename(skin.file), readFileSync(resolve(dirname(configFile), skin.file)));
		});
	}

	// Write the pack file
	writeFileSync(config.computed.exportName, pack.generate({ base64: false, compression: "DEFLATE" }), "binary");

	console.log("Done!");
}
