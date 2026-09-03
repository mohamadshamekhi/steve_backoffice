type NavItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    /** Permission key required to see this item. If omitted, not permission-gated. */
    permission?: string;
    /** Item is visible only to users holding at least one of these roles. If omitted, not role-gated. */
    roles?: string[];
    subItems?: {
        name: string;
        path: string;
        pro?: boolean;
        new?: boolean;
        permission?: string;
        roles?: string[];
    }[];
};

export default NavItem;
