import { EnvironmentProviders, Provider } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideBriefcase,
  lucideMapPin,
  lucideMail,
  lucideLinkedin,
  lucideGithub,
  lucideGlobe,
  lucidePencil,
  lucideCheck,
  lucidePlus,
  lucideSave,
  lucideTrash,
  lucideX,
} from '@ng-icons/lucide';

const testProviders: (Provider | EnvironmentProviders)[] = [
  provideIcons({
    lucidePencil,
    lucideSave,
    lucideX,
    lucidePlus,
    lucideTrash,
    lucideUser,
    lucideBriefcase,
    lucideMapPin,
    lucideMail,
    lucideLinkedin,
    lucideGithub,
    lucideGlobe,
    lucideCheck,
  }),
];

export default testProviders;
