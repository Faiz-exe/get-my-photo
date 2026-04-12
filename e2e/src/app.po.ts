import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getGreetingText() {
    return element(by.css('getPhoto-root div')).getText() as Promise<string>;
  }
}
