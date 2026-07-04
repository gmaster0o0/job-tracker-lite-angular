import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';

import {
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
} from '@ng-icons/lucide';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

/**
 * This file serves as a centralized location for importing and exporting commonly used components,
 * icons, and utilities related to forms, layout, and interactive elements in the profile feature of the application.
 * It helps maintain a clean and organized codebase by grouping related imports together.
 */

/**
 * Form Imports: This array contains imports for form-related components
 * such as input fields, labels, textareas, selects, input groups, and field components.
 */
export const formImports = [
  HlmInputImports,
  HlmLabelImports,
  HlmTextareaImports,
  HlmSelectImports,
  HlmInputGroupImports,
  HlmFieldImports,
];
/**
 * Layout Imports: This array contains imports for layout-related components
 * such as cards and separators, which are used to structure the UI.
 */
export const layoutImports = [
  HlmCardImports,
  HlmSeparatorImports,
  HlmAccordionImports,
];
/**
 * Interactive Imports: This array contains imports for interactive components
 * such as buttons, badges, and icons, which enhance user interaction within the application.
 */
export const interactiveImports = [
  HlmButtonImports,
  HlmBadgeImports,
  HlmIconImports,
  HlmTooltipImports,
];
/**
 * Profile Icons: This object contains a collection of commonly used icons in the profile feature,
 */
export const profileIcons = {
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
};
