import {resolve} from "path";
import {jsonSchema} from 'typescript-json-schema';

export class JsonSchemaLoader {
    static loadtest() {

        const compilerOptions: jsonSchema.CompilerOptions = {
            strictNullChecks: true,
        };

        const basePath = "./apps/mooreseditor/app/schema";

        const program = jsonSchema.getProgramFromFiles(
            [resolve("item.json")],
            compilerOptions,
            basePath
        );

        console.log(program.toString())
    }
}