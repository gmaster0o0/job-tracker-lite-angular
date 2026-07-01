import { ComponentHarness } from '@angular/cdk/testing';
import { PersonalInfoHarness } from './personal-info/personal-info.harness';
import { ContactInfoHarness } from './contact-info/contact-info.harness';

export class ProfileHarness extends ComponentHarness {
  static hostSelector = 'app-profile';

  private readonly personalInfoLocator = this.locatorFor(PersonalInfoHarness);
  private readonly contactInfoLocator = this.locatorFor(ContactInfoHarness);

  async getName(): Promise<string> {
    const personalInfo = await this.personalInfoLocator();
    return personalInfo.getName();
  }

  async setName(value: string): Promise<void> {
    const personalInfo = await this.personalInfoLocator();
    await personalInfo.setName(value);
  }

  async getBio(): Promise<string> {
    const personalInfo = await this.personalInfoLocator();
    return personalInfo.getBio();
  }

  async setBio(value: string): Promise<void> {
    const personalInfo = await this.personalInfoLocator();
    await personalInfo.setBio(value);
  }

  async clickEditPersonal(): Promise<void> {
    const personalInfo = await this.personalInfoLocator();
    return personalInfo.clickEdit();
  }

  async clickEditContact(): Promise<void> {
    const contactInfo = await this.contactInfoLocator();
    return contactInfo.clickEdit();
  }

  async savePersonal(): Promise<void> {
    const personalInfo = await this.personalInfoLocator();
    return personalInfo.clickSave();
  }

  async saveContact(): Promise<void> {
    const contactInfo = await this.contactInfoLocator();
    return contactInfo.clickSave();
  }

  async cancelPersonal(): Promise<void> {
    const personalInfo = await this.personalInfoLocator();
    return personalInfo.clickCancel();
  }

  async cancelContact(): Promise<void> {
    const contactInfo = await this.contactInfoLocator();
    return contactInfo.clickCancel();
  }

  async getEmail(): Promise<string> {
    const contactInfo = await this.contactInfoLocator();
    return contactInfo.getEmail();
  }

  async setEmail(value: string): Promise<void> {
    const contactInfo = await this.contactInfoLocator();
    await contactInfo.setEmail(value);
  }
}
