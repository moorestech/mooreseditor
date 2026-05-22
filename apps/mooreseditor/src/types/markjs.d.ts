declare module "mark.js" {
  interface MarkOptions {
    className?: string;
    exclude?: string[];
    separateWordSearch?: boolean;
    filter?: (
      textNode: Text,
      term: string,
      totalCounter: number,
      counter: number,
    ) => boolean;
    done?: (counter: number) => void;
  }

  interface UnmarkOptions {
    className?: string;
    done?: () => void;
  }

  export default class Mark {
    constructor(context: HTMLElement);
    mark(keyword: string, options?: MarkOptions): void;
    unmark(options?: UnmarkOptions): void;
  }
}
