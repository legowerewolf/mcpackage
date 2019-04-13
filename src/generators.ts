import { basename } from "path";
import { PackConfig } from "./types";

export function manifest(config: PackConfig, defaultLang: string) {
	let manifest = {
		format_version: 1,
		header: {
			name: config.meta.name[defaultLang],
			description: config.meta.description[defaultLang],
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

	return manifest;
}

export function skins(config: PackConfig, defaultLang: string) {
	let skins = {
		serialize_name: "skinpack_name",
		localization_name: "skinpack_name",
		skins: config.components.skins.files.map((skin) => {
			return {
				localization_name: skin.name[defaultLang],
				geometry: "geometry.humanoid.custom",
				texture: basename(skin.file),
				type: "free",
			};
		}),
	};

	return skins;
}

export function languages(config: PackConfig) {
	return Object.keys(config.meta.name);
}

export function language(config: PackConfig, defaultLanguage: string, language: string) {
	let lines = [
		`pack.name=${config.meta.name[language]}`,
		`pack.description=${config.meta.description[language]}`,
		...(config.components.skins
			? [`skinpack.skinpack_name=${config.components.skins.meta.name[language]}`, ...config.components.skins.files.map((skin) => `skin.skinpack_name.${skin.name[defaultLanguage]}=${skin.name[language]}`)]
			: []),
	];
	return lines.join("\n");
}
