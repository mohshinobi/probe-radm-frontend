import { MenuInterface } from "@core/interfaces/menu.interface";
import { RoleService } from '@core/services/role.service';
import { RolesEnum } from '@core/enums';
import { adminNavItems } from './admin-nav-bar.config';
import { operatorNavItems } from './operator-nav-bar.config';
import { auditorNavItems } from './auditor-nav-bar.config';

export const paramsNavItems: MenuInterface[] = [
  { label: '', icon: 'arrow_drop_down', link: '/home', roles: [RolesEnum.OPERATOR]},
  {
    label: 'Profile', icon: 'account_circle',
    children: [
        { label: 'Connexion', link: '/login' },
        { label: 'Profil', link: '/login' },
    ]
  },
];

const roleMenuMapping: { [kesy: string]: MenuInterface[] } = {
  [RolesEnum.ADMINISTRATOR]: adminNavItems,
  [RolesEnum.OPERATOR]: operatorNavItems,
  [RolesEnum.AUDITOR]: auditorNavItems,
};

export const navItemsByRules = (rolesService: RoleService): MenuInterface[] => {
  
  const roles = rolesService.getRoles();
  
  let menuItems: MenuInterface[] = [];

  roles.forEach(role => {
    if (roleMenuMapping[role]) {
      menuItems = roleMenuMapping[role];
    }
  });  

  return menuItems;
};
