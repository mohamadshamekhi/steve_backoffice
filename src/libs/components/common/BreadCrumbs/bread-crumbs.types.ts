interface LinkItem {
    label: string;
    href?: string;
}

export default interface BreadCrumbsProps {
    links: LinkItem[];
    activeClass?: string;
    containerClass?: string;
    labelClass?: string;
}
