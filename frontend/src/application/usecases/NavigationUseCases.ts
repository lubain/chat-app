import { AppView } from "@/domain/entities/AppView";

export class NavigationUseCases {
  static getPostLoginView(): AppView {
    return "chat";
  }

  static getPostLogoutView(): AppView {
    return "login";
  }

  static getRegisterRedirect(): AppView {
    return "register";
  }

  static getLoginRedirect(): AppView {
    return "login";
  }
}
