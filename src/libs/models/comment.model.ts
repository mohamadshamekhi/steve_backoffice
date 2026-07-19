export interface IComment {
    id: string;
    body: string;
    commentType: 'product' | 'article';
    is_approved: boolean;
    created_at: string;
    commenter: {
        id: string;
        name: string;
        type: string;
    };
    commentable_id: string;
    commentable: {
        id: string;
        type: string;
        title: string;
    };
}
