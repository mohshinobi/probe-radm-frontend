import { MenuInterface } from "@core/interfaces/menu.interface";
import { appUrl } from "../app-url.config";

export const adminNavItems: MenuInterface[] = [
  {
    label: 'Admin',
    icon: 'dashboard',
    link: appUrl.administrator.overview,
  },
  {
    label: 'Users',
    icon: 'people',
    link: appUrl.administrator.users,
  },
  
];