import minimist = require("minimist");
import nodezip = require("node-zip");
import { readFileSync, writeFileSync } from "fs";
import { safeLoad } from "js-yaml";
import { basename, dirname, resolve } from "path";
import { language, languages, manifest, skins } from "./generators";
import { CliArguments, PackConfig } from "./types";

export default function main() {
	let args: CliArguments = minimist(process.argv.slice(2)) as CliArguments;

	let rootFile = args.config ? resolve(args.config) : resolve(process.cwd(), "pack.yaml");
	let rootPath = dirname(rootFile);

	let rootFileContents: PackConfig = safeLoad(readFileSync(rootFile, "utf8")) as PackConfig;

	let langs = languages(rootFileContents);
	let defaultLang = langs.indexOf("en_US") != -1 ? "en_US" : langs[0];

	let exportFilename = `${rootFileContents.meta.name[defaultLang].replace(/[ ]/, "_")}-${rootFileContents.meta.version}.mcpack`;

	console.log(`Generating ${exportFilename}...`);

	let packFile = new nodezip();

	packFile.file("manifest.json", JSON.stringify(manifest(rootFileContents, defaultLang)));
	packFile.file("texts/languages.json", JSON.stringify(langs));

	langs.forEach((lang) => packFile.file(`texts/${lang}.lang`, language(rootFileContents, defaultLang, lang)));

	if (rootFileContents.components.skins) {
		packFile.file("skins.json", JSON.stringify(skins(rootFileContents, defaultLang)));
		rootFileContents.components.skins.files.forEach((skin) => {
			packFile.file(basename(skin.file), readFileSync(resolve(rootPath, "skins", skin.file)));
		});
	}

	writeFileSync(exportFilename, packFile.generate({ base64: false, compression: "DEFLATE" }), "binary");
}
