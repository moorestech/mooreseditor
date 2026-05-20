// Column represents a single data column used in table/form views.
// `data` is intentionally typed as `any` to support arbitrary JSON values.
export interface Column {
  title: string;
  data: any;
}
