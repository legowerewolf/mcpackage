import { basename } from "path";
import { ComputedConfig } from "./types";

export function manifest_json(config: ComputedConfig) {
	let manifest = {
		format_version: 1,
		header: {
			name: config.meta.name[config.computed.defaultLang],
			description: config.meta.description[config.computed.defaultLang],
			version: config.meta.version.split(".").map((char) => parseInt(char)),
			uuid: config.meta.uuid,
		},
		modules: [],
	};

	if (config.components.skins)
		manifest.modules.push({
			version: config.components.skins.meta.version.split(".").map((char) => parseInt(char)),
			type: "skin_pack",
			uuid: config.components.skins.meta.uuid,
		});

	return JSON.stringify(manifest);
}

export function skins_json(config: ComputedConfig) {
	let skins = {
		serialize_name: "skinpack_name",
		localization_name: "skinpack_name",
		skins: config.components.skins.files.map((skin) => {
			return {
				localization_name: skin.name[config.computed.defaultLang],
				geometry: "geometry.humanoid.custom",
				texture: basename(skin.file),
				type: "free",
			};
		}),
	};

	return JSON.stringify(skins);
}

export function language_lang(config: ComputedConfig, language: string) {
	let lines = [];

	// Insert universal lines
	lines.push(`pack.name=${config.meta.name[language]}`);
	lines.push(`pack.description=${config.meta.description[language]}`);

	// Insert lines for skinpacks
	if (config.components.skins) {
		lines.push(`skinpack.skinpack_name=${config.components.skins.meta.name[language]}`);

		config.components.skins.files.forEach((skin) => {
			lines.push(`skin.skinpack_name.${skin.name[config.computed.defaultLang]}=${skin.name[language]}`);
		});
	}

	return lines.join("\n");
}
