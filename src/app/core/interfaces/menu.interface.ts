export interface MenuInterface {
    label?: string;
    icon?: string;
    link?: string;
    roles?: string[];
    children?: MenuInterface[];
}