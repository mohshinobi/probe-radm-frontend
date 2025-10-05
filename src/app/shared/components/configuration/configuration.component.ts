import {Component} from '@angular/core';
import { FlowComponent } from './flow/flow.component';
import { SyslogComponent } from "./syslog/syslog.component";
import { ClasstypeComponent } from './classtype/classtype.component';
import { LdapComponent } from "./ldap/ldap.component";
import { DialogFormService } from './dialog-form.service';
import { PageHeaderComponent } from "@layout/header/page-header.component";

@Component({
    selector: 'app-configuration',
    imports: [FlowComponent, SyslogComponent, ClasstypeComponent, LdapComponent, PageHeaderComponent],
    providers: [DialogFormService],
    templateUrl: './configuration.component.html',
    styleUrl: './configuration.component.scss'
})

export class ConfigurationComponent {
}
