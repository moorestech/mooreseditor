import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as path from "node:path";
import * as fs from "node:fs";

export class ParseSchema {
    static Parse(){

        const filePath = path.join(process.cwd(), 'schema', 'block.json');

        // ファイルを同期的に読み込む
        const jsonData: string = readFileSync(filePath, 'utf-8');

        // JSONデータをオブジェクトにパース
        const jsonObject = JSON.parse(jsonData);

        // オブジェクトをコンソールに出力
        console.log(jsonObject);
    }
}