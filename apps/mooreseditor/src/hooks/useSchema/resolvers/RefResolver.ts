import type { SchemaDefinitions } from '../types';

/**
 * スキーマ内のref参照を解決するクラス
 */
export class RefResolver {
  constructor(private definitions: SchemaDefinitions) {}

  /**
   * オブジェクト内のすべてのref参照を再帰的に解決
   */
  resolve<T = any>(obj: T): T {
    return this.resolveRefs(obj);
  }

  /**
   * 再帰的にref参照を解決する内部メソッド
   */
  private resolveRefs(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveRefs(item));
    } else if (obj && typeof obj === 'object') {
      // Check if this object has a ref property
      if (obj.ref && typeof obj.ref === 'string') {
        const refSchema = this.definitions[obj.ref];
        if (refSchema) {
          // Merge the ref schema with any other properties in the object
          const { ref, ...otherProps } = obj;
          const resolvedRef = this.resolveRefs(refSchema);
          return { ...otherProps, ...resolvedRef };
        } else {
          console.warn(`Reference not found: ${obj.ref}`);
          return obj;
        }
      } else {
        // Recursively resolve refs in nested objects
        const resolved: any = {};
        for (const [key, value] of Object.entries(obj)) {
          resolved[key] = this.resolveRefs(value);
        }
        return resolved;
      }
    }
    return obj;
  }

  /**
   * デバッグ用: blocksスキーマの詳細をログ出力
   */
  debugBlocksSchema(schema: any, schemaName: string): void {
    if (schemaName === 'blocks') {
      console.log('Blocks schema after ref resolution:', schema);
      
      // Log specific block type
      const dataProperty = schema.properties?.find((p: any) => p.key === 'data');
      const blockParamProperty = dataProperty?.items?.properties?.find((p: any) => p.key === 'blockParam');
      const gearCase = blockParamProperty?.cases?.find((c: any) => c.when === 'Gear');
      
      console.log('Gear case:', gearCase);
      console.log('Gear case properties:', gearCase?.properties);
      
      if (gearCase?.properties) {
        gearCase.properties.forEach((prop: any, index: number) => {
          console.log(`Property ${index}:`, prop.key, prop);
        });
      }
    }
  }
}