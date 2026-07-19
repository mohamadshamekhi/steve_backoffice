export interface CategoryModel {
    id: string;
    name: string;
    description: string;
    media_id: string;
    url: string;
    attribute_set_id: string;
    parent_id?: string;
}
