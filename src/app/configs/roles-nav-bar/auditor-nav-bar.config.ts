import { MenuInterface } from "@core/interfaces/menu.interface";
import { appUrl } from "../app-url.config";


export const auditorNavItems: MenuInterface[] = [
  {
    label: 'Auditor', icon: 'dashboard', link: appUrl.auditor.overview
  }
]
