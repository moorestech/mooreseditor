import { calculateAutoIncrement } from "./autoIncrement";

import type {
  Schema,
  ValueSchema,
  ObjectSchema,
  ArraySchema,
  SwitchSchema,
} from "../libs/schema/types";

/**
 * DataInitializerクラス
 * スキーマに基づいて必須フィールドのみを持つ初期データを生成する
 */
export class DataInitializer {
  private visitedRefs: Set<string>;
  private existingData: any[];

  constructor(existingData: any[] = []) {
    this.visitedRefs = new Set();
    this.existingData = existingData;
  }

  /**
   * フィールドが必須かどうかを判定
   * optional === false または undefined の場合に true を返す
   */
  private isRequiredField(schema: any): boolean {
    // optionalが明示的にtrueの場合のみオプショナル、それ以外は必須
    return schema.optional !== true;
  }

  /**
   * スキーマに基づいて必須フィールドのみを持つ初期値を生成
   * @param schema スキーマ定義
   * @param contextData switch fieldの参照値を解決するためのコンテキストデータ（オプション）
   */
  public createRequiredValue(
    schema: Schema | ValueSchema,
    contextData?: any,
  ): any {
    // スキーマがない場合はnullを返す
    if (!schema || !("type" in schema)) {
      return null;
    }

    const valueSchema = schema as ValueSchema;

    // 循環参照チェック（refが設定されている場合）
    if ("ref" in valueSchema && valueSchema.ref) {
      if (this.visitedRefs.has(valueSchema.ref)) {
        // 循環参照を検出した場合は、object型ならば空オブジェクト、それ以外はnullを返す
        return valueSchema.type === "object" ? {} : null;
      }
      this.visitedRefs.add(valueSchema.ref);
    }

    // 必須フィールドでない場合は値を生成しない
    if (!this.isRequiredField(valueSchema)) {
      return undefined;
    }

    let result: any;

    switch (valueSchema.type) {
      case "object":
        result = this.generateObjectValue(
          valueSchema as ObjectSchema,
          contextData,
        );
        break;

      case "array":
        result = this.generateArrayValue(valueSchema as ArraySchema);
        break;

      default:
        // プリミティブ型のデフォルト値を生成
        result = this.generateDefaultValue(valueSchema);
        break;
    }

    // 循環参照チェックのクリーンアップ
    if ("ref" in valueSchema && valueSchema.ref) {
      this.visitedRefs.delete(valueSchema.ref);
    }

    return result;
  }

  /**
   * array型の初期値を生成
   * minLengthが指定されている場合はその数だけ要素を生成
   */
  private generateArrayValue(schema: ArraySchema): any[] {
    const arr: any[] = [];

    // minLengthが指定されている場合、その数だけ要素を生成
    const minLength = schema.minLength || 0;

    if (minLength > 0 && schema.items) {
      for (let i = 0; i < minLength; i++) {
        // 各要素を再帰的に生成
        const itemValue = this.createRequiredValue(schema.items);
        if (itemValue !== undefined) {
          arr.push(itemValue);
        }
      }
    }

    return arr;
  }

  /**
   * object型の必須プロパティのみを生成
   * @param schema オブジェクトスキーマ
   * @param contextData switch fieldの参照値を解決するためのコンテキストデータ
   */
  private generateObjectValue(
    schema: ObjectSchema,
    contextData?: any,
  ): any {
    const obj: any = {};

    if (schema.properties && Array.isArray(schema.properties)) {
      schema.properties.forEach((prop) => {
        const { key, ...propSchema } = prop;

        // Switch fieldの処理
        if ("switch" in propSchema) {
          const switchSchema = propSchema as SwitchSchema;
          const switchPath = switchSchema.switch;

          // 必須フィールドのみ処理
          if (this.isRequiredField(propSchema)) {
            // 相対パス（./）の場合、コンテキストデータから参照値を取得
            if (switchPath.startsWith("./") && contextData) {
              const referencedField = switchPath.slice(2);
              const switchValue = contextData[referencedField];

              // 一致するcaseを見つける
              const matchedCase = switchSchema.cases?.find(
                (c) => c.when === switchValue,
              );

              if (matchedCase && "type" in matchedCase) {
                // そのcaseのスキーマで値を生成
                const value = this.createRequiredValue(
                  matchedCase as ValueSchema,
                  contextData[key], // switch field内のデータをコンテキストとして渡す
                );

                // undefined以外の値の場合のみオブジェクトに追加
                if (value !== undefined) {
                  obj[key] = value;
                }
              }
            }
          }
        }
        // 通常のフィールドの処理
        else if (this.isRequiredField(propSchema)) {
          const value = this.createRequiredValue(propSchema as ValueSchema);

          // undefined以外の値の場合のみオブジェクトに追加
          if (value !== undefined) {
            obj[key] = value;
          }
        }
      });

      // autoIncrementの処理（必須フィールドのみ、かつkeyが存在する場合のみ上書き）
      schema.properties.forEach((prop) => {
        const { key, ...propSchema } = prop;

        if (
          "type" in propSchema &&
          (propSchema.type === "integer" || propSchema.type === "number") &&
          propSchema.autoIncrement &&
          this.isRequiredField(propSchema) &&
          key in obj
        ) {
          // keyが存在する場合のみ上書き

          obj[key] = calculateAutoIncrement(
            this.existingData,
            key,
            propSchema.autoIncrement,
          );
        }
      });
    }

    return obj;
  }

  /**
   * プリミティブ型のデフォルト値を生成
   */
  private generateDefaultValue(schema: ValueSchema): any {
    if ("type" in schema) {
      switch (schema.type) {
        case "string":
          return "default" in schema ? schema.default : "";

        case "uuid":
          // UUIDの自動生成
          if ("autoGenerated" in schema && schema.autoGenerated) {
            return crypto.randomUUID();
          }
          return "";

        case "enum":
          return "default" in schema ? schema.default : "";

        case "integer":
        case "number":
          // autoIncrementが設定されている場合は、generateObjectValueで処理されるため、
          // ここでは一旦デフォルト値を返す
          return "default" in schema ? schema.default : 0;

        case "boolean":
          return "default" in schema ? schema.default : false;

        case "vector2":
        case "vector2Int":
          return "default" in schema ? schema.default : [0, 0];

        case "vector3":
        case "vector3Int":
          return "default" in schema ? schema.default : [0, 0, 0];

        case "vector4":
        case "vector4Int":
          return "default" in schema ? schema.default : [0, 0, 0, 0];

        default:
          return null;
      }
    }
    return null;
  }
}
