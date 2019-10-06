export interface CliArguments {
	config?: string;
}

export interface PackConfig {
	meta: ObjectMeta;
	components: {
		skins?: {
			meta: ObjectMeta;
			files: SkinFile[];
		};
	};
}

interface LanguageField {
	[key: string]: string;
}

interface ObjectMeta {
	name: LanguageField;
	description?: LanguageField;
	version?: string;
	uuid?: string;
}

interface SkinFile {
	file: string;
	slimArms: boolean;
	name: LanguageField;
}

export interface ComputedConfig extends PackConfig {
	computed?: {
		defaultLang: string;
		languages: string[];
		exportName: string;
	};
}
